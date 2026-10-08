import Anthropic from "@anthropic-ai/sdk";
import { TOOL_DEFS, runTool, systemPrompt, type AgentCard, type AgentContext } from "@/lib/agent-tools";
import { fallbackReply } from "@/lib/agent-fallback";
import type { Profile } from "@/lib/engine";
import { getState } from "@/lib/server-store";

// Modelo mais barato da família: o agente só conversa e chama ferramentas determinísticas.
const MODEL = "claude-haiku-5-5";

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
  if (!process.env.ANTHROPIC_API_KEY || (cheap.confident && body.messages.length <= 2)) {
    return Response.json({ text: cheap.text, cards: cheap.cards, mode: "regras" });
  }

  const client = new Anthropic();
  const cards: AgentCard[] = [];
  const messages: Anthropic.MessageParam[] = body.messages.slice(-12).map((m) => ({ role: m.role, content: m.content }));

  try {
    for (let i = 0; i < 5; i++) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2000,
        output_config: { effort: "low" },
        system: systemPrompt(ctx, body.voice),
        tools: TOOL_DEFS,
        messages,
      });

      if (response.stop_reason === "refusal") break;

      if (response.stop_reason !== "tool_use") {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim();
        return Response.json({ text, cards: dedupe(cards), mode: "ia", usage: response.usage });
      }

      messages.push({ role: "assistant", content: response.content });
      const results: Anthropic.ToolResultBlockParam[] = response.content
        .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
        .map((b) => ({
          type: "tool_result",
          tool_use_id: b.id,
          content: runTool(b.name, (b.input ?? {}) as Record<string, unknown>, ctx, cards),
        }));
      messages.push({ role: "user", content: results });
    }
  } catch (err) {
    if (err instanceof Anthropic.APIError) console.error("agent api error", err.status, err.message);
    else throw err;
  }

  return Response.json({ text: cheap.text, cards: cheap.cards, mode: "regras" });
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
