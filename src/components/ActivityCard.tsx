"use client";

import Link from "next/link";
import { venueById, type Activity } from "@/lib/data";
import { activityFill, festivalNow, fillStatus, isAccessibleFor, type Profile, type SharedState } from "@/lib/engine";
import { Battery } from "./Battery";

export function A11yBadges({ a }: { a: Activity }) {
  const v = venueById(a.venueId)!;
  const badges: { t: string; c: string }[] = [];
  if (a.libras) badges.push({ t: "🤟 Libras", c: "bg-indigo-50 text-indigo-700" });
  if (a.audiodescricao) badges.push({ t: "🔊 Audiodescrição", c: "bg-indigo-50 text-indigo-700" });
  if (a.legenda) badges.push({ t: "💬 Legenda", c: "bg-indigo-50 text-indigo-700" });
  if (a.floor > 1)
    badges.push(
      v.elevator
        ? { t: `🛗 ${a.floor}º andar · ${(v.vertical ?? ["elevador"]).join(" e ")}`, c: "bg-emerald-50 text-emerald-700" }
        : { t: `🪜 ${a.floor}º andar sem elevador`, c: "bg-red-50 text-red-700" },
    );
  if (v.mainEntrance === "rampa") badges.push({ t: "♿ Rampa", c: "bg-emerald-50 text-emerald-700" });
  if (v.mainEntrance === "escada" && v.accessible) badges.push({ t: "↪️ Acesso lateral", c: "bg-amber-50 text-amber-700" });
  if (!v.accessible) badges.push({ t: "⚠️ Prédio sem acessibilidade", c: "bg-red-50 text-red-700" });
  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((b) => (
        <span key={b.t} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${b.c}`}>
          {b.t}
        </span>
      ))}
    </div>
  );
}

export function ActivityCard({
  a,
  state,
  at,
  profile,
  from,
  reasons,
  eta,
  balanced,
}: {
  a: Activity;
  state: SharedState;
  at: number;
  profile?: Profile | null;
  from?: string | null;
  reasons?: string[];
  eta?: number;
  balanced?: boolean;
}) {
  const v = venueById(a.venueId)!;
  const now = festivalNow(state, at);
  const fill = activityFill(a, state, at);
  const status = fillStatus(fill, a, now);
  const blocked = profile ? !isAccessibleFor(a, profile.mobility) : false;
  return (
    <article className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 ${blocked ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">
            {a.start} · {v.short} · {a.room} · {a.format}
          </p>
          <h3 className="mt-0.5 font-semibold leading-snug">{a.title}</h3>
        </div>
        {eta !== undefined && (
          <div className="shrink-0 rounded-xl bg-[#123b8c]/5 px-2 py-1 text-center">
            <div className="text-lg font-bold leading-none text-[#123b8c]">{eta}</div>
            <div className="text-[10px] text-gray-500">min a pé</div>
          </div>
        )}
      </div>
      <div className="mt-2">
        <Battery fill={fill} status={status} capacity={a.capacity} />
      </div>
      <div className="mt-2">
        <A11yBadges a={a} />
      </div>
      {balanced && (
        <p className="mt-2 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] text-emerald-800">
          🌿 Sugestão que também ajuda a distribuir o público — combina com seu perfil e tem espaço sobrando.
        </p>
      )}
      {reasons && reasons.length > 0 && <p className="mt-2 text-xs text-gray-600">{reasons.join(" · ")}</p>}
      {blocked && <p className="mt-2 text-xs font-medium text-red-700">Sem acesso para o seu perfil de mobilidade.</p>}
      <div className="mt-3 flex gap-2">
        <Link
          href={`/mapa?from=${from ?? "marco-zero"}&to=${a.venueId}`}
          className="rounded-full bg-[#123b8c] px-3 py-1.5 text-xs font-semibold text-white"
        >
          Ver rota
        </Link>
        <Link href={`/agente?q=${encodeURIComponent(`Quero ir para "${a.title}" no ${v.short}`)}`} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
          Perguntar ao agente
        </Link>
      </div>
    </article>
  );
}
