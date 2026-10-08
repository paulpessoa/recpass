"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ActivityCard } from "@/components/ActivityCard";
import { ACTIVITIES, PERSONAS, venueById, type Track } from "@/lib/data";
import { useLocation, useProfile, useShared } from "@/lib/client";
import { actEnd, actStart, activityFill, festivalNow, isAccessibleFor, profileFromPersona, recommend } from "@/lib/engine";

const TRACKS: (Track | "Todas")[] = ["Todas", "Tecnologia", "Negócios", "Cidades", "Economia Criativa"];

export default function Home() {
  const { state, at } = useShared();
  const [profile, setProfile] = useProfile();
  const [loc] = useLocation();
  const [track, setTrack] = useState<Track | "Todas">("Todas");
  const [onlyVagas, setOnlyVagas] = useState(false);
  const [onlyAccessible, setOnlyAccessible] = useState(false);

  const from = loc?.venueId ?? "marco-zero";
  const now = festivalNow(state, at);
  const recs = recommend({ state, profile, fromVenueId: from, limit: 3, at });

  const list = ACTIVITIES.filter((a) => now < actEnd(a))
    .filter((a) => track === "Todas" || a.track === track)
    .filter((a) => !onlyVagas || activityFill(a, state, at) < 99)
    .filter((a) => !onlyAccessible || !profile || isAccessibleFor(a, profile.mobility))
    .sort((a, b) => actStart(a) - actStart(b));

  return (
    <AppShell>
      {!profile && (
        <section className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="font-bold">Como você vai curtir o festival hoje?</h2>
          <p className="mt-1 text-sm text-gray-600">Entre com uma conta demo ou faça o diagnóstico de 1 minuto.</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProfile(profileFromPersona(p))}
                className="flex w-24 shrink-0 flex-col items-center rounded-xl bg-gray-50 p-2 text-center ring-1 ring-black/5"
              >
                <span className="text-2xl">{p.avatar}</span>
                <span className="mt-1 text-[11px] font-medium leading-tight">{p.name}</span>
              </button>
            ))}
          </div>
          <Link href="/perfil?quiz=1" className="mt-3 block rounded-full bg-[#f26b1d] py-2 text-center text-sm font-bold text-white">
            Fazer meu diagnóstico
          </Link>
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
          {profile && profile.mobility !== "padrao" && (
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
