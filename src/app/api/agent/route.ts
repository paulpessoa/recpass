import { systemPrompt, type AgentCard, type AgentContext } from "@/lib/agent-tools";
import { fallbackReply } from "@/lib/agent-fallback";
import type { Profile } from "@/lib/engine";
import { activeProvider, runGemini, runOpenAI } from "@/lib/llm";
import { getState } from "@/lib/server-store";

type Body = {
  messages: { role: "user" | "assistant"; content: string }[];
  profile: Profile | null;
  venueId: string | null;
  voice?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const ctx: AgentContext = { state: await getState(), profile: body.profile, venueId: body.venueId };
  const lastUser = [...body.messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // Roteador econômico: intenção óbvia (rota, banheiro, embarque…) = algoritmo puro, custo zero.
  const cheap = fallbackReply(lastUser, ctx);
  const provider = activeProvider();
  if (!provider || (cheap.confident && body.messages.length <= 2)) {
    return Response.json({ text: cheap.text, cards: cheap.cards, mode: "regras", reason: provider ? "intencao-clara" : "sem-chave" });
  }

  const cards: AgentCard[] = [];
  const history = body.messages.slice(-12);
  const system = systemPrompt(ctx, body.voice);
  let reason = "limite-de-voltas";
  try {
    const res = provider === "openai" ? await runOpenAI(system, history, ctx, cards) : await runGemini(system, history, ctx, cards);
    if (res) return Response.json({ text: res.text, cards: dedupe(cards), mode: "ia", model: res.model, usage: res.usage });
  } catch (err) {
    reason = `erro (${provider}): ${err instanceof Error ? err.message.slice(0, 200) : String(err)}`;
    console.error("agent error", reason);
  }

  return Response.json({ text: cheap.text, cards: cheap.cards, mode: "regras", reason });
}

function dedupe(cards: AgentCard[]) {
  const seen = new Set<string>();
  return cards.filter((c) => {
    const k = c.type === "activity" ? `a:${c.id}` : `r:${c.from}:${c.to}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
