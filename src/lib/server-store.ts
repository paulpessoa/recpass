// Estado compartilhado no servidor: Supabase quando configurado; senão, memória (dev/offline).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { initialState, toMin, type SharedState } from "./engine";

export type StateAction =
  | { type: "tap"; tag: string; who?: string }
  | { type: "boost"; venueId: string; level: number }
  | { type: "unboost"; venueId: string }
  | { type: "auto"; on: boolean }
  | { type: "clock"; hhmm: string }
  | { type: "nudge" }
  | { type: "reset" };

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

let db: SupabaseClient | null = null;
function supabase() {
  if (!url || !key) return null;
  db ??= createClient(url, key, { auth: { persistSession: false } });
  return db;
}

export const storageMode = () => (supabase() ? "supabase" : "memoria");

// ---------- Memória ----------

const g = globalThis as unknown as { __recpassState?: SharedState };
const mem = () => (g.__recpassState ??= initialState());

function applyMem(action: StateAction): SharedState {
  const s = mem();
  switch (action.type) {
    case "tap":
      s.taps = [{ tag: action.tag, at: Date.now(), who: action.who }, ...s.taps].slice(0, 200);
      break;
    case "boost":
      s.boosts[action.venueId] = { level: clampLevel(action.level), since: Date.now() };
      break;
    case "unboost":
      delete s.boosts[action.venueId];
      break;
    case "auto":
      s.autoBalance = action.on;
      break;
    case "clock":
      s.clock = { fixedMin: toMin(action.hhmm), setAt: Date.now() };
      break;
    case "nudge":
      s.nudges += 1;
      break;
    case "reset":
      g.__recpassState = initialState();
      break;
  }
  return mem();
}

const clampLevel = (l: number) => Math.max(0, Math.min(1, l));

// ---------- Supabase ----------

async function readDb(sb: SupabaseClient): Promise<SharedState> {
  const [settings, boosts, taps] = await Promise.all([
    sb.from("festival_settings").select("*").eq("id", 1).single(),
    sb.from("venue_boosts").select("*"),
    sb.from("tag_taps").select("tag_id, who, created_at").order("created_at", { ascending: false }).limit(200),
  ]);
  if (settings.error) throw settings.error;
  return {
    clock: { fixedMin: settings.data.clock_fixed_min, setAt: Date.parse(settings.data.clock_set_at) },
    autoBalance: settings.data.auto_balance,
    nudges: settings.data.nudges,
    boosts: Object.fromEntries((boosts.data ?? []).map((b) => [b.venue_id, { level: b.level, since: Date.parse(b.since) }])),
    taps: (taps.data ?? []).map((t) => ({ tag: t.tag_id, who: t.who ?? undefined, at: Date.parse(t.created_at) })),
  };
}

async function applyDb(sb: SupabaseClient, action: StateAction) {
  const now = new Date().toISOString();
  switch (action.type) {
    case "tap":
      await sb.from("tag_taps").insert({ tag_id: action.tag, who: action.who ?? null });
      break;
    case "boost":
      await sb.from("venue_boosts").upsert({ venue_id: action.venueId, level: clampLevel(action.level), since: now });
      break;
    case "unboost":
      await sb.from("venue_boosts").delete().eq("venue_id", action.venueId);
      break;
    case "auto":
      await sb.from("festival_settings").update({ auto_balance: action.on }).eq("id", 1);
      break;
    case "clock":
      await sb.from("festival_settings").update({ clock_fixed_min: toMin(action.hhmm), clock_set_at: now }).eq("id", 1);
      break;
    case "nudge": {
      const { data } = await sb.from("festival_settings").select("nudges").eq("id", 1).single();
      await sb.from("festival_settings").update({ nudges: (data?.nudges ?? 0) + 1 }).eq("id", 1);
      break;
    }
    case "reset":
      await Promise.all([
        sb.from("venue_boosts").delete().neq("venue_id", ""),
        sb.from("tag_taps").delete().gte("id", 0),
        sb.from("festival_settings").update({ clock_fixed_min: toMin("14:25"), clock_set_at: now, auto_balance: false, nudges: 0 }).eq("id", 1),
      ]);
      break;
  }
}

// ---------- API pública ----------

export async function getState(): Promise<SharedState> {
  const sb = supabase();
  if (!sb) return mem();
  try {
    return await readDb(sb);
  } catch (err) {
    console.error("supabase read failed, usando memória", err);
    return mem();
  }
}

export async function applyAction(action: StateAction): Promise<SharedState> {
  const sb = supabase();
  if (!sb) return applyMem(action);
  try {
    await applyDb(sb, action);
    return await readDb(sb);
  } catch (err) {
    console.error("supabase write failed, usando memória", err);
    return applyMem(action);
  }
}

// ---------- Feedback dos testes com profissionais ----------

export type Feedback = {
  rating: number;
  recommend: number | null;
  wouldUse: "sim" | "talvez" | "nao" | null;
  liked: string[];
  missing: string | null;
  area: string | null;
  role: string | null;
  name: string | null;
  contact: string | null;
  canContact: boolean;
  context: Record<string, unknown>;
};

const gf = globalThis as unknown as { __recpassFeedback?: (Feedback & { at: number })[] };

export async function saveFeedback(fb: Feedback): Promise<"supabase" | "memoria"> {
  const sb = supabase();
  if (sb) {
    const { error } = await sb.from("app_feedback").insert({
      rating: fb.rating,
      recommend: fb.recommend,
      would_use: fb.wouldUse,
      liked: fb.liked,
      missing: fb.missing,
      area: fb.area,
      role: fb.role,
      name: fb.name,
      contact: fb.contact,
      can_contact: fb.canContact,
      context: fb.context,
    });
    if (!error) return "supabase";
    console.error("supabase feedback insert failed, usando memória", error);
  }
  (gf.__recpassFeedback ??= []).unshift({ ...fb, at: Date.now() });
  return "memoria";
}
