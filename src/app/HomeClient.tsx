"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ActivityCard } from "@/components/ActivityCard";
import { ACTIVITIES, venueById, type Track } from "@/lib/data";
import { useLocation, useProfile, useShared } from "@/lib/client";
import { actEnd, actStart, activityFill, festivalNow, isAccessibleFor, primaryMobility, profileMobility, recommend } from "@/lib/engine";

const TRACKS: (Track | "Todas")[] = ["Todas", "Tecnologia", "Negócios", "Cidades", "Economia Criativa"];

export function HomeClient({ ids }: { ids: string[] }) {
  const { state, at } = useShared();
  const [profile] = useProfile();
  const [loc] = useLocation();
  const [track, setTrack] = useState<Track | "Todas">("Todas");
  const [onlyVagas, setOnlyVagas] = useState(false);
  const [onlyAccessible, setOnlyAccessible] = useState(false);

  const from = loc?.venueId ?? "marco-zero";
  const now = festivalNow(state, at);
  const picked = ids.map((id) => ACTIVITIES.find((a) => a.id === id)).filter((a): a is (typeof ACTIVITIES)[number] => !!a);
  const recs = recommend({ state, profile, fromVenueId: from, limit: 3, at });

  const list = ACTIVITIES.filter((a) => now < actEnd(a))
    .filter((a) => track === "Todas" || a.track === track)
    .filter((a) => !onlyVagas || activityFill(a, state, at) < 99)
    .filter((a) => !onlyAccessible || !profile || isAccessibleFor(a, profileMobility(profile)))
    .sort((a, b) => actStart(a) - actStart(b));

  return (
    <AppShell>
      {!profile && (
        <Link href="/agente" className="mb-5 flex items-center gap-3 rounded-2xl bg-[#f26b1d] p-3 text-white shadow-sm">
          <span className="text-2xl">💬</span>
          <span className="text-sm">
            <b className="block">Personalize em 4 toques</b>
            O agente descobre se você é Chico Science ou Ariano Suassuna — e como você circula.
          </span>
        </Link>
      )}

      {picked.length > 0 && (
        <section className="mb-6">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-bold">Sugestões do agente</h2>
            <Link href="/" className="text-xs text-[#123b8c]">
              limpar ✕
            </Link>
          </div>
          <div className="space-y-3">
            {picked.map((a) => (
              <ActivityCard key={a.id} a={a} state={state} at={at} profile={profile} from={from} />
            ))}
          </div>
        </section>
      )}

      <section className="mb-6">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Para você agora</h2>
          <span className="text-xs text-gray-500">saindo de {venueById(from)?.short}</span>
        </div>
        <div className="space-y-3">
          {recs.map((r) => (
            <ActivityCard key={r.activity.id} a={r.activity} state={state} at={at} profile={profile} from={from} reasons={r.reasons} eta={r.etaMin} balanced={r.balanced} />
          ))}
          {!recs.length && <p className="text-sm text-gray-500">Nada com vaga nas próximas horas. Que tal o mapa?</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">Programação ao vivo</h2>
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {TRACKS.map((t) => (
            <button
              key={t}
              onClick={() => setTrack(t)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${track === t ? "bg-[#123b8c] text-white" : "bg-white text-gray-700 ring-1 ring-black/10"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mb-3 flex gap-4 text-xs">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={onlyVagas} onChange={(e) => setOnlyVagas(e.target.checked)} /> Só com vagas
          </label>
          {profile && primaryMobility(profileMobility(profile)) !== "padrao" && (
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={onlyAccessible} onChange={(e) => setOnlyAccessible(e.target.checked)} /> Acessível pra mim
            </label>
          )}
        </div>
        <div className="space-y-3">
          {list.map((a) => (
            <ActivityCard key={a.id} a={a} state={state} at={at} profile={profile} from={from} />
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] text-gray-400">POC · programação e lotação simuladas · coordenadas aproximadas</p>
      </section>
    </AppShell>
  );
}
