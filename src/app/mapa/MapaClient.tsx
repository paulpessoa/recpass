"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Map } from "@/components/Map";
import { RouteSummary } from "@/components/RouteSummary";
import { MOBILITY_LABEL, VENUES, venueById, type Mobility } from "@/lib/data";
import { useLocation, useProfile, useShared } from "@/lib/client";
import { activityAt, activityFill, computeRoute, festivalNow, fillStatus, venueHeat } from "@/lib/engine";
import { Battery } from "@/components/Battery";

export function MapaClient({ initialFrom, initialTo }: { initialFrom: string | null; initialTo: string | null }) {
  const { state, at } = useShared();
  const [profile] = useProfile();
  const [loc] = useLocation();
  const [from, setFrom] = useState(initialFrom ?? loc?.venueId ?? "marco-zero");
  const [to, setTo] = useState<string | null>(initialTo);
  const [mobilityPick, setMobility] = useState<Mobility | null>(null);
  const mobility: Mobility = mobilityPick ?? profile?.mobility ?? "padrao";

  const heat = Object.fromEntries(VENUES.map((v) => [v.id, venueHeat(v.id, state, at)]));
  const route = to && to !== from ? computeRoute(from, to, mobility, (id) => heat[id] ?? 0) : null;
  const target = to ? venueById(to) : null;
  const act = target ? activityAt(target.id, state, at) : null;
  const now = festivalNow(state, at);

  return (
    <AppShell>
      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-gray-600">Saindo de</span>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl bg-white p-2 ring-1 ring-black/10">
            {VENUES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.short}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-gray-600">Indo para</span>
          <select value={to ?? ""} onChange={(e) => setTo(e.target.value || null)} className="rounded-xl bg-white p-2 ring-1 ring-black/10">
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
            onClick={() => setMobility(m)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${mobility === m ? "bg-[#123b8c] text-white" : "bg-white text-gray-700 ring-1 ring-black/10"}`}
          >
            {MOBILITY_LABEL[m].icon} {MOBILITY_LABEL[m].label}
          </button>
        ))}
      </div>

      <Map heat={heat} route={route} here={from} boosted={Object.keys(state.boosts)} onSelect={(id) => (id === from ? null : setTo(id))} />

      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-gray-600">
        <span>
          <b className="text-blue-600">━</b> piso liso
        </span>
        <span>
          <b className="text-orange-600">┅</b> paralelepípedo
        </span>
        <span>
          <b className="text-yellow-600">┈</b> calçada estreita
        </span>
        <span>
          <b className="text-red-600">┈</b> degraus
        </span>
        <span>● cor = aglomeração</span>
      </div>

      <div className="mt-4 space-y-3">
        {route && <RouteSummary route={route} mobility={mobility} />}
        {target && (
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h3 className="font-semibold">{target.name}</h3>
            <p className="text-xs text-gray-500">Movimento no entorno: {Math.round(heat[target.id])}%</p>
            {act && (
              <div className="mt-2">
                <p className="text-sm">
                  {act.start} · {act.title}
                </p>
                <Battery fill={activityFill(act, state, at)} status={fillStatus(activityFill(act, state, at), act, now)} capacity={act.capacity} compact />
              </div>
            )}
            <p className="mt-2 text-xs text-gray-600">{target.amenities.join(" · ")}</p>
          </div>
        )}
        {!to && <p className="text-center text-sm text-gray-500">Toque em um local no mapa para traçar a rota.</p>}
      </div>
    </AppShell>
  );
}
