"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ActivityCard } from "@/components/ActivityCard";
import { AgentChat } from "@/components/AgentChat";
import { Map } from "@/components/Map";
import { RouteButton, VenueSheet } from "@/components/VenueSheet";
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
  // Experiência "mapa primeiro": abre no mapa com o cartão do local onde a pessoa encostou a tag.
  const [view, setView] = useState<"mapa" | "cards">("mapa");
  const [selected, setSelected] = useState<string | null>(venue.id);
  const [headline, setHeadline] = useState<"titulo" | "palestrante">("titulo");

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
      <div className="mb-3 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-nfc/15 py-1 pl-1 pr-3 ring-1 ring-nfc/40">
          <span className="nfc-pulse relative grid h-7 w-7 shrink-0 place-items-center rounded-full bg-nfc text-sm text-white">📶</span>
          <span className="min-w-0">
            <span className="t-micro block text-nfc">Tag lida</span>
            <span className="block truncate text-sm font-semibold leading-tight">{tag.label}</span>
          </span>
        </div>
        <div role="tablist" aria-label="Visualização" className="flex shrink-0 rounded-full bg-card p-1 ring-1 ring-white/10">
          {(["mapa", "cards"] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`t-micro rounded-full px-3 py-1.5 ${view === v ? "bg-accent text-background" : "text-muted"}`}
            >
              {v === "mapa" ? "🗺️ Mapa" : "🃏 Cards"}
            </button>
          ))}
        </div>
      </div>

      {view === "mapa" && (
        <div className="relative -mx-4 h-[calc(100dvh-13.5rem)] min-h-[420px] overflow-hidden">
          <Map
            heat={Object.fromEntries(VENUES.map((v) => [v.id, heat(v.id)]))}
            here={venue.id}
            selected={selected}
            boosted={Object.keys(state.boosts)}
            onSelect={setSelected}
            height="100%"
            rounded={false}
          />
          {selected && (
            <VenueSheet venueId={selected} here={venue.id} state={state} at={at} onClose={() => setSelected(null)}>
              {selected === venue.id && tag.kind === "escadaria" && (
                <p className="mt-3 rounded-xl bg-enchendo/10 px-3 py-2 text-sm text-enchendo ring-1 ring-enchendo/40">⚠️ Esta entrada tem degraus. {venue.universalAccess}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {selected === venue.id ? (
                  <button onClick={() => setView("cards")} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background">
                    {full ? "Ver alternativas" : "Ver programação daqui"}
                  </button>
                ) : (
                  <RouteButton from={venue.id} to={selected} />
                )}
                <a href="#agente" onClick={() => setView("cards")} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                  💬 Agente
                </a>
              </div>
            </VenueSheet>
          )}
        </div>
      )}

      {view === "cards" && (
        <>
      <div role="tablist" aria-label="Destaque dos cartões" className="mb-4 flex rounded-full bg-card p-1 ring-1 ring-white/10">
        {(["titulo", "palestrante"] as const).map((h) => (
          <button
            key={h}
            role="tab"
            aria-selected={headline === h}
            onClick={() => setHeadline(h)}
            className={`t-micro flex-1 rounded-full py-1.5 ${headline === h ? "bg-white/15 text-foreground" : "text-muted"}`}
          >
            {h === "titulo" ? "Títulos" : "Palestrantes"}
          </button>
        ))}
      </div>

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
        <section className="mb-4 rounded-2xl bg-sky-400/10 p-4 text-sm text-sky-200 ring-1 ring-sky-400/30">
          ℹ️ {tag.note}
          {venue.vertical && <span className="mt-1 block text-xs text-sky-200">Circulação: {venue.vertical.join(", ")}.</span>}
        </section>
      )}

      {tag.kind === "escadaria" && (
        <section className="mb-4 rounded-2xl border-2 border-amber-400 bg-amber-400/10 p-4">
          <h2 className="font-bold text-amber-200">⚠️ Esta entrada tem degraus</h2>
          <p className="mt-1 text-sm text-amber-200">{venue.universalAccess}</p>
          {tag.note && <p className="mt-2 text-xs text-amber-200">{tag.note}</p>}
          {!venue.accessible && (
            <Link href="/mapa?from=senai&to=armazens" className="mt-3 inline-block rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white">
              Ver rota até a transmissão acessível
            </Link>
          )}
        </section>
      )}

      {tag.kind === "hub" && (
        <section className="mb-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-white/10">
          <h2 className="font-bold">🚕 Ponto de embarque</h2>
          <p className="mt-1 text-sm text-muted">Peça o carro com destino exato aqui: fica fora do bloqueio das pontes, então o motorista não cancela.</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {hubs.map(({ v, h, r }) => (
              <li key={v.id} className="flex justify-between">
                <span>
                  {v.id === venue.id ? "📍 " : ""}
                  {v.short}
                </span>
                <span className="text-xs text-muted">
                  {Math.round(h)}% cheio{v.id !== venue.id && r.ok ? ` · ${r.minutes} min a pé` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tag.kind === "encontro" && (
        <section className="mb-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-white/10">
          <h2 className="font-bold">👋 Ponto de encontro</h2>
          <p className="mt-1 text-sm text-muted">Mande este ponto pro seu grupo: cada um recebe a rota adaptada até aqui.</p>
          <button
            onClick={() => navigator.share?.({ title: "Me encontra aqui", text: `Tô no ${tag.label}`, url: location.href })}
            className="mt-3 rounded-full bg-accent px-4 py-2 text-sm font-bold text-background"
          >
            Compartilhar com o grupo
          </button>
        </section>
      )}

      {current && tag.kind !== "hub" && tag.kind !== "encontro" && (
        <section className="mb-4">
          {full && (
            <div className="mb-2 rounded-xl bg-lotado px-3 py-2 text-sm font-bold text-white">
              {status?.key === "lotado" ? "Lotou! Mas calma, tem coisa boa perto." : "Últimas vagas — corra ou veja alternativas."}
            </div>
          )}
          <h2 className="mb-2 text-sm font-semibold text-muted">{now >= actStart(current) ? "Acontecendo aqui agora" : "Próxima aqui"}</h2>
          <ActivityCard a={current} state={state} at={at} profile={profile} from={venue.id} headline={headline} />
        </section>
      )}

      {!profile && (
        <a href="#agente" className="mb-4 flex items-center gap-3 rounded-2xl bg-accent p-3 text-sm text-background">
          <span className="text-2xl">💬</span>
          <span>
            <b className="block">Ainda não te conheço 🙂</b>
            Responda 4 toques com o agente e a rota se adapta a você.
          </span>
        </a>
      )}

      {recs.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-bold">{full ? "Alternativas a partir daqui" : "Daqui, combina com você"}</h2>
          <div className="space-y-3">
            {recs.map((r) => (
              <ActivityCard key={r.activity.id} a={r.activity} state={state} at={at} profile={profile} from={venue.id} reasons={r.reasons} eta={r.etaMin} balanced={r.balanced} headline={headline} />
            ))}
          </div>
        </section>
      )}

      <section id="agente" className="scroll-mt-28">
        <h2 className="mb-2 text-lg font-bold">Fale com o agente</h2>
        <AgentChat key={`${profile?.name ?? "anon"}-${tag.id}`} greeting={greeting} />
      </section>
        </>
      )}
    </AppShell>
  );
}
