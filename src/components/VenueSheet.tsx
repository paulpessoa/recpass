"use client";

import Link from "next/link";
import { useEffect } from "react";
import { venueById } from "@/lib/data";
import { activityAt, activityFill, festivalNow, fillStatus, heatColor, venueHeat, type SharedState } from "@/lib/engine";
import { Battery } from "./Battery";

/**
 * Cartão que sobe da base do mapa: só aqui aparecem o nome do polo e a lotação exata.
 * Abre ao tocar num pin ou quando a pessoa chega ao local (leitura da tag NFC).
 */
export function VenueSheet({
  venueId,
  here,
  state,
  at,
  onClose,
  children,
}: {
  venueId: string;
  here?: string | null;
  state: SharedState;
  at: number;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  useEffect(() => {
    document.body.dataset.sheet = "open";
    return () => {
      delete document.body.dataset.sheet;
    };
  }, []);
  const v = venueById(venueId);
  if (!v) return null;
  const isHere = v.id === here;
  const act = activityAt(v.id, state, at);
  const fill = act ? activityFill(act, state, at) : 0;
  const now = festivalNow(state, at);
  const heat = Math.round(venueHeat(v.id, state, at));

  return (
    <div className="sheet-up absolute inset-x-0 bottom-0 z-[1001] rounded-t-3xl bg-card p-4 pb-5 shadow-[0_-8px_24px_rgba(0,0,0,0.5)] ring-1 ring-white/10" role="dialog" aria-label={v.name}>
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {isHere && <p className="t-micro text-nfc">📶 Você está aqui</p>}
          <h2 className="t-h2 truncate">{v.name}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: heatColor(heat) }} />
            Movimento no entorno: {heat}%
          </p>
        </div>
        <button onClick={onClose} aria-label="Fechar" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-sm">
          ✕
        </button>
      </div>
      {act ? (
        <div className="mt-2">
          <p className="text-sm text-muted">
            {act.start} · {act.room}
          </p>
          <p className="mb-1.5 text-[15px] leading-snug">{act.title}</p>
          <Battery fill={fill} status={fillStatus(fill, act, now)} capacity={act.capacity} />
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">Sem atividade agora neste local.</p>
      )}
      {children}
    </div>
  );
}

export function RouteButton({ from, to, className = "" }: { from: string; to: string; className?: string }) {
  return (
    <Link href={`/mapa?from=${from}&to=${to}`} className={`rounded-full bg-route px-4 py-2 text-sm font-semibold text-white ${className}`}>
      Ver rota
    </Link>
  );
}
