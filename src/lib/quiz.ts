// Autodiagnóstico: compartilhado entre a tela de Perfil e o onboarding conversado do agente (sem IA, custo zero).
import { ARCHETYPES, archetypeById, type Mobility } from "./data";
import { primaryMobility, type Profile } from "./engine";

export const VIBES: { label: string; scores: Record<string, number> }[] = [
  { label: "Descobrir algo que ainda nem tem nome", scores: { chico: 2, nana: 1 } },
  { label: "Entender as raízes e a cultura por trás da tecnologia", scores: { ariano: 2, clarice: 1 } },
  { label: "Fazer negócios e conexões", scores: { nassau: 2, chico: 1 } },
  { label: "Aprender algo prático para a carreira", scores: { freire: 2, nassau: 1 } },
  { label: "Ambientes calmos e conversas profundas", scores: { clarice: 2, freire: 1 } },
  { label: "Sentir: som, arte, experiências imersivas", scores: { nana: 2, chico: 1 } },
];

export const PLACES: { label: string; id: string }[] = [
  { label: "🦀 O mangue, onde tudo se mistura", id: "chico" },
  { label: "⛪ O Pátio de São Pedro e suas histórias", id: "ariano" },
  { label: "🌉 As pontes sobre o Capibaribe", id: "nassau" },
  { label: "🏫 Uma escola comunitária no bairro", id: "freire" },
  { label: "🎺 O Paço do Frevo em dia de ensaio", id: "nana" },
  { label: "📖 Uma livraria silenciosa na Boa Vista", id: "clarice" },
];

export const TOPICS = ["ia", "dev", "carreira", "startups", "investimento", "negocios", "cidades", "mobilidade", "dados", "cultura", "patrimonio", "musica", "arte", "games", "xr", "design", "ux", "educacao", "acessibilidade", "diversidade", "hardware"];

export const NEEDS = ["libras", "audiodescrição", "evitar aglomeração", "fraldário", "sombra", "assento"];

export type QuizAnswers = {
  mobilities: Mobility[];
  vibes: number[]; // múltipla escolha
  place: string | null;
  topics: string[];
  needs: string[];
  name?: string;
};

export function scoreArchetype(a: Pick<QuizAnswers, "vibes" | "place" | "topics">) {
  const score: Record<string, number> = {};
  for (const i of a.vibes) for (const [k, v] of Object.entries(VIBES[i]?.scores ?? {})) score[k] = (score[k] ?? 0) + v;
  if (a.place) score[a.place] = (score[a.place] ?? 0) + 2;
  for (const ar of ARCHETYPES) score[ar.id] = (score[ar.id] ?? 0) + a.topics.filter((t) => ar.topics.includes(t)).length * 0.5;
  return Object.entries(score).sort((x, y) => y[1] - x[1])[0]?.[0] ?? "freire";
}

export function profileFromQuiz(a: QuizAnswers): Profile {
  const archetypeId = scoreArchetype(a);
  const mobilities = a.mobilities.length ? a.mobilities : (["padrao"] as Mobility[]);
  return {
    name: a.name?.trim() || "Você",
    avatar: archetypeById(archetypeId)?.emoji ?? "🙂",
    mobility: primaryMobility(mobilities),
    mobilities,
    archetypeId,
    interests: a.topics,
    needs: a.needs,
  };
}

/** Alterna um item numa lista; "padrao" (sem restrição) é exclusivo. */
export function toggleMobility(list: Mobility[], m: Mobility): Mobility[] {
  if (m === "padrao") return ["padrao"];
  const rest = list.filter((x) => x !== "padrao");
  return rest.includes(m) ? rest.filter((x) => x !== m) : [...rest, m];
}
