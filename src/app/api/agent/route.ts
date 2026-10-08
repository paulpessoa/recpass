import { GoogleGenAI, type Content, type Part } from "@google/genai";
import { TOOL_DEFS, runTool, systemPrompt, type AgentCard, type AgentContext } from "@/lib/agent-tools";
import { fallbackReply } from "@/lib/agent-fallback";
import type { Profile } from "@/lib/engine";
import { getState } from "@/lib/server-store";

// Modelo rápido e barato: o agente só conversa e chama ferramentas determinísticas.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

type Body = {
  messages: { role: "user" | "assistant"; content: string }[];
  profile: Profile | null;
  venueId: string | null;
  voice?: boolean;
};

const functionDeclarations = TOOL_DEFS.map((t) => ({ name: t.name, description: t.description, parametersJsonSchema: t.parameters }));

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const ctx: AgentContext = { state: await getState(), profile: body.profile, venueId: body.venueId };
  const lastUser = [...body.messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // Roteador econômico: intenção óbvia (rota, banheiro, embarque…) = algoritmo puro, custo zero.
  const cheap = fallbackReply(lastUser, ctx);
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || (cheap.confident && body.messages.length <= 2)) {
    return Response.json({ text: cheap.text, cards: cheap.cards, mode: "regras", reason: apiKey ? "intencao-clara" : "sem-chave" });
  }
  let reason = "limite-de-voltas";

  const ai = new GoogleGenAI({ apiKey });
  const cards: AgentCard[] = [];
  const contents: Content[] = body.messages.slice(-12).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    for (let i = 0; i < 5; i++) {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction: systemPrompt(ctx, body.voice),
          tools: [{ functionDeclarations }],
          maxOutputTokens: 1500,
        },
      });

      const calls = response.functionCalls ?? [];
      if (!calls.length) {
        const text = (response.candidates?.[0]?.content?.parts ?? [])
          .map((p) => p.text ?? "")
          .join("")
          .trim();
        if (!text) {
          reason = `sem-texto (${response.candidates?.[0]?.finishReason ?? "?"})`;
          break;
        }
        return Response.json({ text, cards: dedupe(cards), mode: "ia", usage: response.usageMetadata });
      }

      // Devolve o conteúdo do modelo como veio (preserva as thought signatures) + as respostas das ferramentas.
      const modelContent = response.candidates?.[0]?.content;
      if (modelContent) contents.push(modelContent);
      const parts: Part[] = calls.map((c) => ({
        functionResponse: {
          id: c.id,
          name: c.name,
          response: { output: runTool(c.name ?? "", (c.args ?? {}) as Record<string, unknown>, ctx, cards) },
        },
      }));
      contents.push({ role: "user", parts });
    }
  } catch (err) {
    reason = `erro: ${err instanceof Error ? err.message.slice(0, 200) : String(err)}`;
    console.error("gemini error", reason);
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
