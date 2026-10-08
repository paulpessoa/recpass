"use client";

import Link from "next/link";
import { venueById, type Activity } from "@/lib/data";
import { activityFill, festivalNow, fillStatus, isAccessibleFor, profileMobility, type Profile, type SharedState } from "@/lib/engine";
import { Battery } from "./Battery";

export function A11yBadges({ a }: { a: Activity }) {
  const v = venueById(a.venueId)!;
  const badges: { t: string; c: string }[] = [];
  if (a.libras) badges.push({ t: "🤟 Libras", c: "bg-indigo-400/15 text-indigo-200" });
  if (a.audiodescricao) badges.push({ t: "🔊 Audiodescrição", c: "bg-indigo-400/15 text-indigo-200" });
  if (a.legenda) badges.push({ t: "💬 Legenda", c: "bg-indigo-400/15 text-indigo-200" });
  if (a.floor > 1)
    badges.push(
      v.elevator
        ? { t: `🛗 ${a.floor}º andar · ${(v.vertical ?? ["elevador"]).join(" e ")}`, c: "bg-livre/10 text-emerald-300" }
        : { t: `🪜 ${a.floor}º andar sem elevador`, c: "bg-red-500/10 text-red-300" },
    );
  if (v.mainEntrance === "rampa") badges.push({ t: "♿ Rampa", c: "bg-livre/10 text-emerald-300" });
  if (v.mainEntrance === "escada" && v.accessible) badges.push({ t: "↪️ Acesso lateral", c: "bg-amber-400/10 text-amber-200" });
  if (!v.accessible) badges.push({ t: "⚠️ Prédio sem acessibilidade", c: "bg-red-500/10 text-red-300" });
  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((b) => (
        <span key={b.t} className={`t-micro rounded-full px-2 py-0.5 normal-case ${b.c}`}>
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
  headline = "titulo",
}: {
  a: Activity;
  state: SharedState;
  at: number;
  profile?: Profile | null;
  from?: string | null;
  reasons?: string[];
  eta?: number;
  balanced?: boolean;
  /** O que vai em destaque no cartão: o título da atividade ou quem fala. */
  headline?: "titulo" | "palestrante";
}) {
  const v = venueById(a.venueId)!;
  const now = festivalNow(state, at);
  const fill = activityFill(a, state, at);
  const status = fillStatus(fill, a, now);
  const blocked = profile ? !isAccessibleFor(a, profileMobility(profile)) : false;
  return (
    <article className={`rounded-2xl bg-card p-4 shadow-sm ring-1 ring-white/10 ${blocked ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">
            {a.start} · {v.short} · {a.room} · {a.format}
          </p>
          {headline === "palestrante" ? (
            <>
              <h3 className="t-h2 mt-0.5">{a.speakers?.length ? a.speakers.join(", ") : "Palestrantes a confirmar"}</h3>
              <p className="text-sm text-muted">{a.title}</p>
            </>
          ) : (
            <h3 className="t-h2 mt-0.5">{a.title}</h3>
          )}
        </div>
        {eta !== undefined && (
          <div className="shrink-0 rounded-xl bg-white/5 px-2 py-1 text-center">
            <div className="text-lg font-bold leading-none text-accent">{eta}</div>
            <div className="text-[10px] text-muted">min a pé</div>
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
        <p className="mt-2 rounded-lg bg-livre/10 px-2 py-1 text-[11px] text-emerald-300">
          🌿 Sugestão que também ajuda a distribuir o público — combina com seu perfil e tem espaço sobrando.
        </p>
      )}
      {reasons && reasons.length > 0 && <p className="mt-2 text-xs text-muted">{reasons.join(" · ")}</p>}
      {blocked && <p className="mt-2 text-xs font-medium text-red-300">Sem acesso para o seu perfil de mobilidade.</p>}
      <div className="mt-3 flex gap-2">
        <Link
          href={`/mapa?from=${from ?? "marco-zero"}&to=${a.venueId}`}
          className="rounded-full bg-route px-3 py-1.5 text-xs font-semibold text-white"
        >
          Ver rota
        </Link>
        <Link href={`/agente?q=${encodeURIComponent(`Quero ir para "${a.title}" no ${v.short}`)}`} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-foreground/85">
          Perguntar ao agente
        </Link>
      </div>
    </article>
  );
}
