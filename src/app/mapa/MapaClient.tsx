"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Map } from "@/components/Map";
import { RouteSummary } from "@/components/RouteSummary";
import { MOBILITY_LABEL, VENUES, venueById, type Mobility } from "@/lib/data";
import { useLocation, useProfile, useShared } from "@/lib/client";
import { computeRoute, mobilityList, profileMobility, venueHeat } from "@/lib/engine";
import { VenueSheet } from "@/components/VenueSheet";

export function MapaClient({ initialFrom, initialTo }: { initialFrom: string | null; initialTo: string | null }) {
  const { state, at } = useShared();
  const [profile] = useProfile();
  const [loc] = useLocation();
  const [from, setFrom] = useState(initialFrom ?? loc?.venueId ?? "marco-zero");
  const [to, setTo] = useState<string | null>(initialTo);
  const [mobilityPick, setMobility] = useState<Mobility[] | null>(null);
  const mobility: Mobility[] = mobilityPick ?? profileMobility(profile);
  const toggleMobility = (m: Mobility) =>
    setMobility(m === "padrao" ? ["padrao"] : mobilityList(mobility.includes(m) ? mobility.filter((x) => x !== m) : [...mobility.filter((x) => x !== "padrao"), m]));

  const heat = Object.fromEntries(VENUES.map((v) => [v.id, venueHeat(v.id, state, at)]));
  const route = to && to !== from ? computeRoute(from, to, mobility, (id) => heat[id] ?? 0) : null;
  const target = to ? venueById(to) : null;

  return (
    <AppShell>
      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-muted">Saindo de</span>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl bg-card p-2 ring-1 ring-white/10">
            {VENUES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.short}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-muted">Indo para</span>
          <select value={to ?? ""} onChange={(e) => setTo(e.target.value || null)} className="rounded-xl bg-card p-2 ring-1 ring-white/10">
            <option value="">Toque no mapa…</option>
            {VENUES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.short}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {(Object.keys(MOBILITY_LABEL) as Mobility[]).map((m) => (
          <button
            key={m}
            onClick={() => toggleMobility(m)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${mobility.includes(m) ? "bg-accent text-background" : "bg-card text-foreground/85 ring-1 ring-white/10"}`}
          >
            {MOBILITY_LABEL[m].icon} {MOBILITY_LABEL[m].label}
          </button>
        ))}
      </div>

      <div className="relative -mx-4 h-[calc(100dvh-19rem)] min-h-[380px] overflow-hidden">
        <Map heat={heat} route={route} here={from} selected={to} boosted={Object.keys(state.boosts)} onSelect={(id) => (id === from ? null : setTo(id))} height="100%" rounded={false} />
        {target && (
          <VenueSheet venueId={target.id} state={state} at={at} onClose={() => setTo(null)}>
            {route?.ok && (
              <p className="mt-3 text-sm font-semibold text-foreground">
                <span className="text-accent">{route.minutes} min</span> a pé · {Math.round(route.meters)} m · detalhes abaixo
              </p>
            )}
            <p className="mt-2 text-xs text-muted">{target.amenities.join(" · ")}</p>
          </VenueSheet>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted">
        <span>
          <b className="text-route">━</b> piso liso
        </span>
        <span>
          <b className="text-[#FF8A00]">┅</b> paralelepípedo
        </span>
        <span>
          <b className="text-enchendo">┈</b> calçada estreita
        </span>
        <span>
          <b className="text-lotado">┈</b> degraus
        </span>
        <span>
          <b className="text-livre">●</b> livre <b className="text-enchendo">●</b> enchendo <b className="text-lotado">●</b> lotado
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {route && <RouteSummary route={route} mobility={mobility} />}
        {!to && <p className="text-center text-sm text-muted">Toque em um local no mapa para traçar a rota.</p>}
      </div>
    </AppShell>
  );
}
