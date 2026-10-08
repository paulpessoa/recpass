"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { initialState, type Profile, type SharedState } from "./engine";
import type { StateAction } from "./server-store";
import { fallbackReply } from "./agent-fallback";
import type { AgentCard } from "./agent-tools";

// ---------- Estado compartilhado (polling simples; trocar por Supabase Realtime) ----------

let shared: SharedState = initialState();
let skew = 0; // serverNow - Date.now()
let online = true;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function pull() {
  try {
    const res = await fetch("/api/state", { cache: "no-store" });
    const data = (await res.json()) as { state: SharedState; serverNow: number };
    shared = data.state;
    skew = data.serverNow - Date.now();
    online = true;
  } catch {
    online = false;
  }
  emit();
}

let timer: ReturnType<typeof setInterval> | null = null;

function subscribeShared(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    pull();
    timer = setInterval(pull, 3000);
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export async function act(action: StateAction) {
  try {
    const res = await fetch("/api/state", { method: "POST", body: JSON.stringify(action) });
    const data = (await res.json()) as { state: SharedState; serverNow: number };
    shared = data.state;
    skew = data.serverNow - Date.now();
  } catch {
    online = false;
  }
  emit();
}

/** Estado compartilhado + `at` (relógio do servidor) que avança a cada segundo. */
export function useShared() {
  const state = useSyncExternalStore(subscribeShared, () => shared, () => shared);
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return { state, at: tick + skew, online };
}

// ---------- Persistência local (perfil e última posição) ----------

function localStore<T>(key: string) {
  const subs = new Set<() => void>();
  let cacheRaw: string | null | undefined;
  let cacheVal: T | null = null;
  const read = (): T | null => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key);
    } catch {}
    if (raw !== cacheRaw) {
      cacheRaw = raw;
      try {
        cacheVal = raw ? (JSON.parse(raw) as T) : null;
      } catch {
        cacheVal = null;
      }
    }
    return cacheVal;
  };
  const write = (v: T | null) => {
    try {
      if (v === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(v));
    } catch {}
    subs.forEach((s) => s());
  };
  const subscribe = (cb: () => void) => {
    subs.add(cb);
    const onStorage = (e: StorageEvent) => e.key === key && cb();
    window.addEventListener("storage", onStorage);
    return () => {
      subs.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  };
  return { read, write, subscribe };
}

const profileStore = localStore<Profile>("recpass:profile");
const locationStore = localStore<{ venueId: string; tagId?: string; at: number }>("recpass:location");

export function useProfile() {
  const profile = useSyncExternalStore(profileStore.subscribe, profileStore.read, () => null);
  const setProfile = useCallback((p: Profile | null) => profileStore.write(p), []);
  return [profile, setProfile] as const;
}

export function useLocation() {
  const loc = useSyncExternalStore(locationStore.subscribe, locationStore.read, () => null);
  const setLoc = useCallback((venueId: string | null, tagId?: string) => locationStore.write(venueId ? { venueId, tagId, at: Date.now() } : null), []);
  return [loc, setLoc] as const;
}

const guideStore = localStore<boolean>("recpass:guide");

/** Modo guia (histórias dos prédios na leitura da tag). Ligado por padrão. */
export function useGuide() {
  const v = useSyncExternalStore(guideStore.subscribe, guideStore.read, () => null);
  const set = useCallback((on: boolean) => guideStore.write(on), []);
  return [v !== false, set] as const;
}

// ---------- Cota de voz ("chamada" com o agente) ----------

export const VOICE_QUOTA_MS = 3 * 60 * 1000; // 3 minutos…
export const VOICE_WINDOW_MS = 2 * 60 * 60 * 1000; // …a cada 2 horas, por pessoa

const voiceStore = localStore<{ at: number; ms: number }[]>("recpass:voice-usage");

export function useVoiceQuota() {
  const usage = useSyncExternalStore(voiceStore.subscribe, voiceStore.read, () => null) ?? [];
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, [usage.length]);
  const recent = usage.filter((u) => now - u.at < VOICE_WINDOW_MS);
  const used = recent.reduce((s, u) => s + u.ms, 0);
  const add = useCallback((ms: number) => {
    const cur = (voiceStore.read() ?? []).filter((u) => Date.now() - u.at < VOICE_WINDOW_MS);
    voiceStore.write([...cur, { at: Date.now(), ms }]);
  }, []);
  const resetsAt = recent.length ? Math.min(...recent.map((u) => u.at)) + VOICE_WINDOW_MS : null;
  return { remainingMs: Math.max(0, VOICE_QUOTA_MS - used), add, resetsAt };
}

// ---------- Voz (Web Speech API) ----------

export function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[*_#>]/g, ""));
    u.lang = "pt-BR";
    u.rate = 1.05;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

// ---------- Pergunta ao agente (servidor; cai para regras locais se offline) ----------

export type ChatMsg = { role: "user" | "assistant"; content: string; cards?: AgentCard[]; mode?: string };

export async function askAgent(history: ChatMsg[], profile: Profile | null, venueId: string | null, voice = false): Promise<ChatMsg> {
  try {
    const res = await fetch("/api/agent", {
      method: "POST",
      body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), profile, venueId, voice }),
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { text: string; cards: AgentCard[]; mode: string };
    return { role: "assistant", content: data.text, cards: data.cards, mode: data.mode };
  } catch {
    const last = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
    const r = fallbackReply(last, { state: shared, profile, venueId, at: Date.now() + skew });
    return { role: "assistant", content: r.text, cards: r.cards, mode: "offline" };
  }
}
