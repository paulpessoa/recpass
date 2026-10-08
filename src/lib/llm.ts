// Provedores de IA do agente. A IA só conversa e chama as ferramentas determinísticas (agent-tools).
// Escolha: OPENAI_API_KEY → OpenAI; senão GEMINI_API_KEY → Gemini; senão, modo regras.
import { GoogleGenAI, type Content, type Part } from "@google/genai";
import OpenAI from "openai";
import { TOOL_DEFS, runTool, type AgentCard, type AgentContext } from "./agent-tools";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type LlmResult = { text: string; usage?: unknown; model: string };

const MAX_ROUNDS = 5;

export function activeProvider(): "openai" | "gemini" | null {
  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  if (process.env.GEMINI_API_KEY?.trim()) return "gemini";
  return null;
}

export async function runOpenAI(system: string, history: ChatTurn[], ctx: AgentContext, cards: AgentCard[]): Promise<LlmResult | null> {
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY!.trim() });
  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = TOOL_DEFS.map((t) => ({
    type: "function",
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: system },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  for (let i = 0; i < MAX_ROUNDS; i++) {
    const res = await client.chat.completions.create({ model, messages, tools, max_completion_tokens: 1200 });
    const msg = res.choices[0]?.message;
    if (!msg) return null;
    const calls = (msg.tool_calls ?? []).filter((c) => c.type === "function");
    if (!calls.length) {
      const text = (msg.content ?? "").trim();
      return text ? { text, usage: res.usage, model } : null;
    }
    messages.push(msg);
    for (const c of calls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(c.function.arguments || "{}");
      } catch {}
      messages.push({ role: "tool", tool_call_id: c.id, content: runTool(c.function.name, args, ctx, cards) });
    }
  }
  return null;
}

export async function runGemini(system: string, history: ChatTurn[], ctx: AgentContext, cards: AgentCard[]): Promise<LlmResult | null> {
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY!.trim() });
  const functionDeclarations = TOOL_DEFS.map((t) => ({ name: t.name, description: t.description, parametersJsonSchema: t.parameters }));
  const contents: Content[] = history.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

  for (let i = 0; i < MAX_ROUNDS; i++) {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: { systemInstruction: system, tools: [{ functionDeclarations }], maxOutputTokens: 1500 },
    });
    const calls = response.functionCalls ?? [];
    if (!calls.length) {
      const text = (response.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
      return text ? { text, usage: response.usageMetadata, model } : null;
    }
    // Devolve o conteúdo do modelo como veio (preserva as thought signatures) + as respostas das ferramentas.
    const modelContent = response.candidates?.[0]?.content;
    if (modelContent) contents.push(modelContent);
    const parts: Part[] = calls.map((c) => ({
      functionResponse: { id: c.id, name: c.name, response: { output: runTool(c.name ?? "", (c.args ?? {}) as Record<string, unknown>, ctx, cards) } },
    }));
    contents.push({ role: "user", parts });
  }
  return null;
}
