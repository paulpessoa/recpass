// Motor determinístico (sem IA): relógio do festival, lotação simulada, rotas e recomendações.
// Roda igual no servidor (agente) e no navegador (telas), a partir do mesmo SharedState.

import {
  ACTIVITIES,
  ARCHETYPES,
  EDGES,
  JUNCTIONS,
  VENUES,
  type Activity,
  type Mobility,
  type Persona,
  type Surface,
  venueById,
} from "./data";

// ---------- Estado compartilhado (painel da organização ↔ apps) ----------

export type Boost = { level: number; since: number };

export type SharedState = {
  clock: { fixedMin: number; setAt: number };
  boosts: Record<string, Boost>;
  autoBalance: boolean;
  taps: { tag: string; at: number; who?: string }[];
  nudges: number; // sugestões aceitas que aliviaram fluxo (simulado + real)
};

export const initialState = (): SharedState => ({
  clock: { fixedMin: toMin("14:25"), setAt: Date.now() },
  boosts: {},
  autoBalance: false,
  taps: [],
  nudges: 0,
});

export function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fmtMin(min: number) {
  const m = Math.floor(min) % (24 * 60);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Relógio do festival: hora fixada pelo painel avançando em tempo real. */
export function festivalNow(state: SharedState, at = Date.now()) {
  return state.clock.fixedMin + (at - state.clock.setAt) / 60000;
}

// ---------- Perfil do participante ----------

export type Profile = {
  personaId?: string;
  name: string;
  avatar: string;
  mobility: Mobility; // a mais restritiva (compatibilidade)
  mobilities?: Mobility[]; // múltipla escolha
  archetypeId?: string;
  interests: string[];
  needs: string[];
};

export const profileFromPersona = (p: Persona): Profile => ({
  personaId: p.id,
  name: p.name,
  avatar: p.avatar,
  mobility: p.mobility,
  archetypeId: p.archetypeId,
  interests: p.interests,
  needs: p.needs,
});

// ---------- Mobilidade combinada (múltipla escolha) ----------

export type MobilityInput = Mobility | Mobility[];

const RESTRICTION: Mobility[] = ["cadeirante", "reduzida", "colo", "visual", "sensorial", "padrao"];

export function mobilityList(m: MobilityInput): Mobility[] {
  const l = (Array.isArray(m) ? m : [m]).filter((x) => x !== "padrao");
  return l.length ? [...new Set(l)] : ["padrao"];
}

/** A mais restritiva da lista — usada onde só cabe um valor (ícone, compatibilidade). */
export const primaryMobility = (m: MobilityInput): Mobility => {
  const l = mobilityList(m);
  return RESTRICTION.find((r) => l.includes(r)) ?? "padrao";
};

export const profileMobility = (p?: Profile | null): Mobility[] => (p ? mobilityList(p.mobilities?.length ? p.mobilities : p.mobility) : ["padrao"]);

// ---------- Lotação simulada ----------

function hash01(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const actStart = (a: Activity) => toMin(a.start);
export const actEnd = (a: Activity) => toMin(a.start) + a.durationMin;
const isLongRunning = (a: Activity) => a.durationMin >= 180;

/** Efeito do painel: destaque atrai gente aos poucos; auto-equilíbrio alivia polos cheios. */
function steeringDelta(venueId: string, state: SharedState, rawHeat: number, at: number) {
  let d = 0;
  const b = state.boosts[venueId];
  if (b) d += b.level * 22 * clamp((at - b.since) / 90000, 0, 1);
  if (state.autoBalance && rawHeat > 80) d -= 12;
  return d;
}

function rawFill(a: Activity, now: number) {
  const s = actStart(a);
  const e = actEnd(a);
  if (now >= e) return 0;
  const noise = (hash01(a.id + Math.floor(now / 5)) - 0.5) * 8;
  if (isLongRunning(a)) {
    const wave = Math.sin((now - s) / 40) * 10;
    return clamp(a.popularity * 75 + wave + noise, 0, 100);
  }
  if (now < s - 50) return 0;
  const ramp = clamp((now - (s - 50)) / 60, 0, 1);
  const eased = 1 - Math.pow(1 - ramp, 2);
  return clamp(a.popularity * 100 * eased + noise, 0, 100);
}

export function venueHeatRaw(venueId: string, now: number) {
  const v = venueById(venueId);
  if (!v) return 0;
  const acts = ACTIVITIES.filter((a) => a.venueId === venueId && now < actEnd(a) && now >= actStart(a) - 50);
  const actHeat = acts.length ? Math.max(...acts.map((a) => rawFill(a, now))) : 0;
  const ambient = v.baseCrowd * 70 + (hash01(venueId + Math.floor(now / 7)) - 0.5) * 10;
  return clamp(acts.length ? actHeat * 0.7 + ambient * 0.3 : ambient * 0.8, 0, 100);
}

export function activityFill(a: Activity, state: SharedState, at = Date.now()) {
  const now = festivalNow(state, at);
  const base = rawFill(a, now);
  if (base === 0) return 0;
  return clamp(base + steeringDelta(a.venueId, state, venueHeatRaw(a.venueId, now), at), 0, 100);
}

export function venueHeat(venueId: string, state: SharedState, at = Date.now()) {
  const now = festivalNow(state, at);
  const raw = venueHeatRaw(venueId, now);
  return clamp(raw + steeringDelta(venueId, state, raw, at), 0, 100);
}

export type FillStatus = { key: "livre" | "enchendo" | "ultimas" | "lotado" | "encerrada" | "breve"; label: string; color: string };

export function fillStatus(fill: number, a?: Activity, now?: number): FillStatus {
  if (a && now !== undefined && now >= actEnd(a)) return { key: "encerrada", label: "Encerrada", color: "#9CA3AF" };
  if (a && now !== undefined && now < actStart(a) - 50) return { key: "breve", label: "Em breve", color: "#60A5FA" };
  if (fill >= 99) return { key: "lotado", label: "Lotado", color: "#DC2626" };
  if (fill >= 85) return { key: "ultimas", label: "Últimas vagas", color: "#EA580C" };
  if (fill >= 60) return { key: "enchendo", label: "Enchendo", color: "#CA8A04" };
  return { key: "livre", label: "Vagas", color: "#16A34A" };
}

export const heatColor = (h: number) =>
  h >= 85 ? "#DC2626" : h >= 65 ? "#EA580C" : h >= 45 ? "#CA8A04" : "#16A34A";

// ---------- Rotas por perfil de mobilidade ----------

type Node = { id: string; lat: number; lng: number };
const NODES: Node[] = [...VENUES.map(({ id, lat, lng }) => ({ id, lat, lng })), ...JUNCTIONS];
const nodeById = (id: string) => NODES.find((n) => n.id === id)!;

export function distM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// m/s
const SPEED: Record<Mobility, number> = {
  padrao: 1.25,
  cadeirante: 1.0,
  colo: 1.05,
  reduzida: 0.75,
  visual: 0.9,
  sensorial: 1.15,
};

const SURFACE_FACTOR: Record<Mobility, Record<Surface, number>> = {
  padrao: { asfalto: 1, paralelepipedo: 1.05, calcada_estreita: 1.1, escadaria: 1.1 },
  cadeirante: { asfalto: 1, paralelepipedo: 3.5, calcada_estreita: 1.8, escadaria: Infinity },
  colo: { asfalto: 1, paralelepipedo: 1.3, calcada_estreita: 1.5, escadaria: 1.6 },
  reduzida: { asfalto: 1, paralelepipedo: 1.9, calcada_estreita: 1.4, escadaria: 3 },
  visual: { asfalto: 1, paralelepipedo: 1.5, calcada_estreita: 1.7, escadaria: 1.8 },
  sensorial: { asfalto: 1, paralelepipedo: 1.05, calcada_estreita: 1.4, escadaria: 1.1 },
};

const CROWD_WEIGHT: Record<Mobility, number> = {
  padrao: 0.25,
  cadeirante: 0.8,
  colo: 1.2,
  reduzida: 0.8,
  visual: 1.0,
  sensorial: 2.5,
};

export const SURFACE_LABEL: Record<Surface, string> = {
  asfalto: "piso liso",
  paralelepipedo: "paralelepípedo",
  calcada_estreita: "calçada estreita",
  escadaria: "degraus",
};

export type RouteSegment = { from: Node; to: Node; street: string; surface: Surface; meters: number; crowd: number };

export type Route = {
  ok: boolean;
  from: string;
  to: string;
  segments: RouteSegment[];
  meters: number;
  minutes: number;
  avoided: string[]; // o que a rota desviou (vs. rota comum)
  warnings: string[];
};

function edgeCrowd(e: { a: string; b: string }, heat: (id: string) => number) {
  const h = (id: string) => (venueById(id) ? heat(id) : 40);
  return (h(e.a) + h(e.b)) / 200; // 0..1
}

export function computeRoute(from: string, to: string, mobilityIn: MobilityInput, heat: (id: string) => number): Route {
  const mobs = mobilityList(mobilityIn);
  const mobility = primaryMobility(mobs);
  const speed = Math.min(...mobs.map((m) => SPEED[m]));
  const surf = (s: Surface) => Math.max(...mobs.map((m) => SURFACE_FACTOR[m][s]));
  const crowdW = Math.max(...mobs.map((m) => CROWD_WEIGHT[m]));
  const adj = new Map<string, { to: string; edge: (typeof EDGES)[number] }[]>();
  for (const e of EDGES) {
    adj.set(e.a, [...(adj.get(e.a) ?? []), { to: e.b, edge: e }]);
    adj.set(e.b, [...(adj.get(e.b) ?? []), { to: e.a, edge: e }]);
  }
  const cost = new Map<string, number>([[from, 0]]);
  const prev = new Map<string, { node: string; edge: (typeof EDGES)[number] }>();
  const open = new Set<string>([from]);
  const done = new Set<string>();

  while (open.size) {
    let cur = "";
    let best = Infinity;
    for (const n of open) {
      if ((cost.get(n) ?? Infinity) < best) {
        best = cost.get(n)!;
        cur = n;
      }
    }
    open.delete(cur);
    if (cur === to) break;
    done.add(cur);
    for (const { to: nxt, edge } of adj.get(cur) ?? []) {
      if (done.has(nxt)) continue;
      const meters = distM(nodeById(cur), nodeById(nxt));
      const sf = surf(edge.surface) * (edge.narrow ? 1.15 : 1);
      if (!isFinite(sf)) continue;
      const crowd = edgeCrowd(edge, heat);
      const c = best + (meters / speed) * sf * (1 + crowdW * crowd * crowd);
      if (c < (cost.get(nxt) ?? Infinity)) {
        cost.set(nxt, c);
        prev.set(nxt, { node: cur, edge });
        open.add(nxt);
      }
    }
  }

  if (from !== to && !prev.has(to)) {
    return { ok: false, from, to, segments: [], meters: 0, minutes: 0, avoided: [], warnings: ["Não há rota acessível para este perfil."] };
  }

  const segments: RouteSegment[] = [];
  let n = to;
  while (n !== from) {
    const p = prev.get(n)!;
    const a = nodeById(p.node);
    const b = nodeById(n);
    segments.unshift({ from: a, to: b, street: p.edge.street, surface: p.edge.surface, meters: distM(a, b), crowd: edgeCrowd(p.edge, heat) });
    n = p.node;
  }
  const meters = segments.reduce((s, x) => s + x.meters, 0);
  const crowdDelay = segments.reduce((s, x) => s + x.meters * crowdW * x.crowd * 0.3, 0);
  const minutes = Math.max(1, Math.round((meters + crowdDelay) / speed / 60 + (segments.length ? 0.5 : 0)));

  const warnings: string[] = [];
  const dest = venueById(to);
  if (dest && mobility !== "padrao" && dest.mainEntrance === "escada") warnings.push(dest.universalAccess);
  if (dest && !dest.accessible && (mobs.includes("cadeirante") || mobs.includes("reduzida"))) warnings.push(`${dest.short} não tem acesso universal. ${dest.universalAccess}`);
  const cobble = segments.filter((s) => s.surface === "paralelepipedo").reduce((s, x) => s + x.meters, 0);
  if (cobble > 0 && mobility !== "padrao") warnings.push(`${Math.round(cobble)} m em paralelepípedo inevitáveis neste trajeto.`);

  const avoided: string[] = [];
  if (mobility !== "padrao") {
    const common = computeRoute(from, to, "padrao", heat);
    const mine = new Set(segments.map((s) => s.street));
    for (const s of common.segments) {
      if (!mine.has(s.street) && s.surface !== "asfalto") avoided.push(`${s.street} (${SURFACE_LABEL[s.surface]})`);
    }
  }

  return { ok: true, from, to, segments, meters, minutes, avoided: [...new Set(avoided)], warnings };
}

// ---------- Recomendações (sem IA) ----------

export type Recommendation = {
  activity: Activity;
  score: number;
  relevance: number;
  fill: number;
  status: FillStatus;
  etaMin: number;
  startsIn: number;
  reasons: string[];
  balanced: boolean; // destaque da organização influenciou a ordem
  accessible: boolean;
};

export function relevanceOf(a: Activity, profile?: Profile | null) {
  if (!profile) return 0.4 + a.popularity * 0.2;
  const arch = ARCHETYPES.find((x) => x.id === profile.archetypeId);
  let w = 0;
  for (const t of a.topics) {
    if (profile.interests.includes(t)) w += 1;
    else if (arch?.topics.includes(t)) w += 0.6;
  }
  return clamp(w / 1.8, 0, 1);
}

export function isAccessibleFor(a: Activity, mobilityIn: MobilityInput) {
  const v = venueById(a.venueId)!;
  const mobs = mobilityList(mobilityIn);
  if (mobs.includes("cadeirante") || mobs.includes("reduzida")) {
    if (!v.accessible) return false;
    if (a.floor > 1 && !v.elevator) return false;
  }
  if (mobs.includes("colo") && a.floor > 1 && !v.elevator) return false;
  return true;
}

export function recommend(opts: {
  state: SharedState;
  profile?: Profile | null;
  fromVenueId?: string;
  limit?: number;
  excludeIds?: string[];
  at?: number;
}): Recommendation[] {
  const { state, profile, fromVenueId, limit = 5, excludeIds = [], at = Date.now() } = opts;
  const now = festivalNow(state, at);
  const mobs = profileMobility(profile);
  const heat = (id: string) => venueHeat(id, state, at);

  const out: Recommendation[] = [];
  for (const a of ACTIVITIES) {
    if (excludeIds.includes(a.id)) continue;
    const s = actStart(a);
    const e = actEnd(a);
    if (now >= e) continue;
    if (!isLongRunning(a) && (s - now > 150 || now - s > 15)) continue;

    const fill = activityFill(a, state, at);
    const status = fillStatus(fill, a, now);
    if (status.key === "lotado") continue;
    const accessible = isAccessibleFor(a, mobs);
    if (!accessible) continue;

    const route = fromVenueId ? computeRoute(fromVenueId, a.venueId, mobs, heat) : null;
    if (route && !route.ok) continue;
    const etaMin = route ? route.minutes : 8;
    if (!isLongRunning(a) && now + etaMin > s + 15) continue;

    const relevance = relevanceOf(a, profile);
    const vacancy = 1 - fill / 100;
    const proximity = clamp(1 - etaMin / 20, 0, 1);
    const urgency = isLongRunning(a) ? 0.5 : clamp(1 - Math.abs(s - (now + etaMin + 5)) / 90, 0, 1);
    let score = relevance * 0.55 + vacancy * 0.15 + proximity * 0.15 + urgency * 0.15;

    const reasons: string[] = [];
    const arch = ARCHETYPES.find((x) => x.id === profile?.archetypeId);
    const matches = a.topics.filter((t) => profile?.interests.includes(t) || arch?.topics.includes(t));
    if (matches.length) reasons.push(`Combina com você: ${matches.slice(0, 3).join(", ")}`);
    if (route) reasons.push(`${etaMin} min a pé${route.avoided.length ? " por piso liso" : ""}`);
    reasons.push(`${Math.max(0, Math.round(a.capacity * vacancy))} vagas`);
    if (a.libras && profile?.needs.includes("libras")) reasons.push("Tem Libras");
    if (a.audiodescricao && mobs.includes("visual")) {
      score += 0.08;
      reasons.push("Tem audiodescrição");
    }
    if (mobs.includes("sensorial") || mobs.includes("colo")) score -= (heat(a.venueId) / 100) * 0.12;

    // Distribuição de fluxo: só reordena entre opções que JÁ combinam com o perfil.
    let balanced = false;
    const boost = state.boosts[a.venueId]?.level ?? 0;
    if (relevance >= 0.5) {
      if (boost > 0) {
        score += boost * 0.15;
        balanced = true;
      }
      if (state.autoBalance) {
        const h = heat(a.venueId);
        if (h > 80) score -= 0.08;
        if (h < 45) {
          score += 0.05;
          balanced = true;
        }
      }
    }

    out.push({ activity: a, score, relevance, fill, status, etaMin, startsIn: Math.round(s - now), reasons, balanced, accessible });
  }
  return out.sort((x, y) => y.score - x.score).slice(0, limit);
}

/** Atividade acontecendo agora (ou a próxima) em um local. */
export function activityAt(venueId: string, state: SharedState, at = Date.now()) {
  const now = festivalNow(state, at);
  const acts = ACTIVITIES.filter((a) => a.venueId === venueId && now < actEnd(a)).sort((a, b) => actStart(a) - actStart(b));
  return acts.find((a) => now >= actStart(a) - 50) ?? acts[0];
}
