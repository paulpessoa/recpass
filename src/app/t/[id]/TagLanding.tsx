"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ActivityCard } from "@/components/ActivityCard";
import { AgentChat } from "@/components/AgentChat";
import { ACTIVITIES, VENUES, tagById, venueById } from "@/lib/data";
import { act, speak, stopSpeaking, useGuide, useLocation, useProfile, useShared } from "@/lib/client";
import { HERITAGE } from "@/lib/heritage";
import { actEnd, actStart, activityAt, activityFill, computeRoute, festivalNow, fillStatus, profileMobility, recommend, venueHeat } from "@/lib/engine";

export function TagLanding({ id }: { id: string }) {
  const tag = tagById(id)!;
  const venue = venueById(tag.venueId)!;
  const { state, at } = useShared();
  const [profile] = useProfile();
  const [, setLoc] = useLocation();
  const registered = useRef(false);
  const [guide, setGuide] = useGuide();
  const [playing, setPlaying] = useState(false);
  const story = HERITAGE[venue.id];

  useEffect(() => {
    if (registered.current) return;
    registered.current = true;
    setLoc(venue.id, tag.id);
    let who: string | undefined;
    try {
      who = (JSON.parse(localStorage.getItem("recpass:profile") ?? "null") as { name?: string } | null)?.name;
    } catch {}
    act({ type: "tap", tag: tag.id, who });
    if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
  }, [setLoc, venue.id, tag.id]);

  const now = festivalNow(state, at);
  const current =
    (tag.floor &&
      ACTIVITIES.filter((a) => a.venueId === venue.id && a.floor === tag.floor && now < actEnd(a)).sort((a, b) => actStart(a) - actStart(b))[0]) ||
    activityAt(venue.id, state, at);
  const fill = current ? activityFill(current, state, at) : 0;
  const status = current ? fillStatus(fill, current, now) : null;
  const full = status?.key === "lotado" || status?.key === "ultimas";
  const recs = recommend({ state, profile, fromVenueId: venue.id, limit: 3, excludeIds: current ? [current.id] : [], at });
  const mobility = profileMobility(profile);
  const heat = (vid: string) => venueHeat(vid, state, at);

  const greeting = !profile
    ? `Vejo que você está em ${tag.label}. Pra eu acertar nas dicas: como você vai circular hoje e o que você curte?`
    : full
      ? `${profile.name.split(",")[0]}, "${current?.title}" está ${status?.label.toLowerCase()}. Separei alternativas que dão tempo de chegar a partir daqui. Quer que eu trace a rota?`
      : `Oi, ${profile.name.split(",")[0]}! Você está em ${tag.label}. Posso sugerir o próximo passo ou traçar uma rota.`;

  // Embarque: compara com os outros pontos de embarque
  const hubs =
    tag.kind === "hub"
      ? VENUES.filter((v) => v.kind === "hub").map((v) => ({ v, h: heat(v.id), r: computeRoute(venue.id, v.id, mobility, heat) }))
      : [];

  return (
    <AppShell>
      <section className="relative mb-4 overflow-hidden rounded-2xl bg-[#123b8c] p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="nfc-pulse relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/15 text-2xl text-[#f26b1d]">📶</div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-white/70">Check-in de contexto</p>
            <h1 className="text-xl font-bold leading-tight">{tag.label}</h1>
            <p className="text-xs text-white/80">
              Movimento no entorno: {Math.round(heat(venue.id))}% · sem GPS, sem baixar app
            </p>
          </div>
        </div>
      </section>

      {guide && story && (
        <section className="mb-4 overflow-hidden rounded-2xl bg-[#2b2118] text-amber-50 shadow-sm">
          <div className="p-4">
            <p className="text-[11px] uppercase tracking-widest text-amber-200/70">🎧 Modo guia · a história deste lugar{story.era ? ` · ${story.era}` : ""}</p>
            <h2 className="mt-1 text-lg font-bold">{story.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-amber-50/85">{story.story}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={async () => {
                  if (playing) {
                    stopSpeaking();
                    setPlaying(false);
                    return;
                  }
                  setPlaying(true);
                  await speak(`${story.title}. ${story.story}`);
                  setPlaying(false);
                }}
                className="rounded-full bg-amber-400 px-4 py-1.5 text-sm font-bold text-[#2b2118]"
              >
                {playing ? "⏸ Parar" : "▶ Ouvir (30s)"}
              </button>
              <button onClick={() => setGuide(false)} className="text-xs text-amber-100/70 underline">
                Desligar modo guia
              </button>
            </div>
          </div>
        </section>
      )}

      {tag.note && tag.kind !== "escadaria" && (
        <section className="mb-4 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900 ring-1 ring-sky-200">
          ℹ️ {tag.note}
          {venue.vertical && <span className="mt-1 block text-xs text-sky-800">Circulação: {venue.vertical.join(", ")}.</span>}
        </section>
      )}

      {tag.kind === "escadaria" && (
        <section className="mb-4 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4">
          <h2 className="font-bold text-amber-900">⚠️ Esta entrada tem degraus</h2>
          <p className="mt-1 text-sm text-amber-900">{venue.universalAccess}</p>
          {tag.note && <p className="mt-2 text-xs text-amber-800">{tag.note}</p>}
          {!venue.accessible && (
            <Link href="/mapa?from=senai&to=armazens" className="mt-3 inline-block rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white">
              Ver rota até a transmissão acessível
            </Link>
          )}
        </section>
      )}

      {tag.kind === "hub" && (
        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="font-bold">🚕 Ponto de embarque</h2>
          <p className="mt-1 text-sm text-gray-600">Peça o carro com destino exato aqui: fica fora do bloqueio das pontes, então o motorista não cancela.</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {hubs.map(({ v, h, r }) => (
              <li key={v.id} className="flex justify-between">
                <span>
                  {v.id === venue.id ? "📍 " : ""}
                  {v.short}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(h)}% cheio{v.id !== venue.id && r.ok ? ` · ${r.minutes} min a pé` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tag.kind === "encontro" && (
        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="font-bold">👋 Ponto de encontro</h2>
          <p className="mt-1 text-sm text-gray-600">Mande este ponto pro seu grupo: cada um recebe a rota adaptada até aqui.</p>
          <button
            onClick={() => navigator.share?.({ title: "Me encontra aqui", text: `Tô no ${tag.label}`, url: location.href })}
            className="mt-3 rounded-full bg-[#f26b1d] px-4 py-2 text-sm font-bold text-white"
          >
            Compartilhar com o grupo
          </button>
        </section>
      )}

      {current && tag.kind !== "hub" && tag.kind !== "encontro" && (
        <section className="mb-4">
          {full && (
            <div className="mb-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white">
              {status?.key === "lotado" ? "Lotou! Mas calma, tem coisa boa perto." : "Últimas vagas — corra ou veja alternativas."}
            </div>
          )}
          <h2 className="mb-2 text-sm font-semibold text-gray-600">{now >= actStart(current) ? "Acontecendo aqui agora" : "Próxima aqui"}</h2>
          <ActivityCard a={current} state={state} at={at} profile={profile} from={venue.id} />
        </section>
      )}

      {!profile && (
        <a href="#agente" className="mb-4 flex items-center gap-3 rounded-2xl bg-[#f26b1d] p-3 text-sm text-white">
          <span className="text-2xl">💬</span>
          <span>
            <b className="block">Ainda não te conheço 🙂</b>
            Monte seu perfil em 1 minuto e a rota se adapta a você.
          </span>
        </a>
      )}

      {recs.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-bold">{full ? "Alternativas a partir daqui" : "Daqui, combina com você"}</h2>
          <div className="space-y-3">
            {recs.map((r) => (
              <ActivityCard key={r.activity.id} a={r.activity} state={state} at={at} profile={profile} from={venue.id} reasons={r.reasons} eta={r.etaMin} balanced={r.balanced} />
            ))}
          </div>
        </section>
      )}

      <section id="agente" className="scroll-mt-28">
        <h2 className="mb-2 text-lg font-bold">Fale com o agente</h2>
        <AgentChat key={`${profile?.name ?? "anon"}-${tag.id}`} greeting={greeting} />
      </section>
    </AppShell>
  );
}
