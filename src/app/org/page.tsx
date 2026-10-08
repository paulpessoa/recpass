"use client";

import Link from "next/link";
import { useState } from "react";
import { Map } from "@/components/Map";
import { ACTIVITIES, VENUES, tagById, venueById } from "@/lib/data";
import { act, useShared } from "@/lib/client";
import { actEnd, actStart, activityAt, activityFill, festivalNow, fmtMin, heatColor, venueHeat, venueHeatRaw } from "@/lib/engine";

const PRESETS = ["10:00", "11:00", "13:20", "14:25", "15:00", "17:30", "21:00"];

export default function OrgPage() {
  const { state, at, online } = useShared();
  const [clock, setClock] = useState("14:25");
  const now = festivalNow(state, at);
  const polos = VENUES.filter((v) => v.kind !== "hub");
  const heat = Object.fromEntries(VENUES.map((v) => [v.id, venueHeat(v.id, state, at)]));

  const capacityNow = (vid: string) =>
    ACTIVITIES.filter((a) => a.venueId === vid && now >= actStart(a) - 50 && now < actEnd(a)).reduce((s, a) => s + Math.min(a.capacity, 400), 0);
  const attracted = Math.round(
    polos.reduce((s, v) => {
      const delta = heat[v.id] - venueHeatRaw(v.id, now);
      return s + Math.max(0, delta / 100) * capacityNow(v.id);
    }, 0),
  );
  const hot = polos.filter((v) => heat[v.id] >= 80);
  const avg = Math.round(polos.reduce((s, v) => s + heat[v.id], 0) / polos.length);
  const recentTaps = state.taps.filter((t) => at - t.at < 15 * 60000).length;

  // Sugestões automáticas: polo quente → polos frios com conteúdo parecido começando em breve
  const suggestions = hot
    .map((h) => {
      const hotAct = activityAt(h.id, state, at);
      const cold = polos
        .filter((c) => c.id !== h.id && heat[c.id] < 55 && !state.boosts[c.id])
        .map((c) => {
          const ca = ACTIVITIES.filter((a) => a.venueId === c.id && now < actEnd(a) && actStart(a) - now < 90);
          const scored = ca
            .map((a) => ({ a, o: a.topics.filter((t) => hotAct?.topics.includes(t)).length + (a.track === hotAct?.track ? 1 : 0) }))
            .sort((x, y) => y.o - x.o);
          return { c, overlap: scored[0]?.o ?? 0, act: scored[0]?.a };
        })
        .filter((x) => x.act)
        .sort((a, b) => b.overlap - a.overlap || heat[a.c.id] - heat[b.c.id])[0];
      return cold ? { hot: h, hotAct, ...cold } : null;
    })
    .filter(Boolean) as { hot: (typeof VENUES)[number]; hotAct: ReturnType<typeof activityAt>; c: (typeof VENUES)[number]; act: (typeof ACTIVITIES)[number]; overlap: number }[];

  return (
    <div className="min-h-dvh bg-[#0f1729] text-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f26b1d] font-black">R</span>
          <div>
            <h1 className="font-bold leading-tight">Painel da Organização · Rota Livre</h1>
            <p className="text-xs text-white/60">Distribuição de fluxo em tempo real · REC&apos;n&apos;Play · Bairro do Recife</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-2xl font-bold">{fmtMin(now)}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] ${online ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>{online ? "AO VIVO" : "OFFLINE"}</span>
        </div>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[1.3fr_1fr] lg:p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="Check-ins NFC (15 min)" value={recentTaps} sub={`${state.taps.length} no total`} />
            <Kpi label="Polos acima de 80%" value={hot.length} sub={hot.map((h) => h.short).join(", ") || "nenhum"} warn={hot.length > 0} />
            <Kpi label="Ocupação média" value={`${avg}%`} sub="polos e palcos" />
            <Kpi label="Pessoas redistribuídas" value={`≈ ${attracted + state.nudges}`} sub="por destaques ativos" good />
          </div>

          <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
            <Map heat={heat} boosted={Object.keys(state.boosts)} height={460} />
          </div>

          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <h2 className="mb-2 font-semibold">Check-ins ao vivo</h2>
            <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
              {state.taps.slice(0, 12).map((t, i) => (
                <li key={i} className="flex justify-between text-white/80">
                  <span>📶 {tagById(t.tag)?.label ?? t.tag}</span>
                  <span className="text-xs text-white/50">
                    {t.who ?? "anônimo"} · há {Math.max(0, Math.round((at - t.at) / 1000))}s
                  </span>
                </li>
              ))}
              {!state.taps.length && <li className="text-white/50">Nenhuma tag lida ainda. Encoste um celular numa tag!</li>}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          {suggestions.length > 0 && (
            <div className="rounded-2xl bg-[#f26b1d]/15 p-4 ring-1 ring-[#f26b1d]/40">
              <h2 className="font-semibold">Sugestões do sistema</h2>
              <ul className="mt-2 space-y-3">
                {suggestions.map((s) => (
                  <li key={s.hot.id} className="text-sm">
                    <b className="text-red-300">{s.hot.short} {Math.round(heat[s.hot.id])}%</b> → destacar <b className="text-emerald-300">{s.c.short} ({Math.round(heat[s.c.id])}%)</b>
                    <span className="block text-xs text-white/70">
                      &quot;{s.act.title}&quot; às {s.act.start}{" "}
                      {s.overlap > 0 && s.hotAct ? `tem público parecido com "${s.hotAct.title}".` : "tem espaço sobrando e começa em breve."}
                    </span>
                    <button onClick={() => act({ type: "boost", venueId: s.c.id, level: 0.7 })} className="mt-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                      🌿 Aplicar destaque
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Polos</h2>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={state.autoBalance} onChange={(e) => act({ type: "auto", on: e.target.checked })} />
                Auto-equilíbrio
              </label>
            </div>
            <ul className="space-y-2.5">
              {polos
                .slice()
                .sort((a, b) => heat[b.id] - heat[a.id])
                .map((v) => {
                  const h = heat[v.id];
                  const a = activityAt(v.id, state, at);
                  const b = state.boosts[v.id];
                  return (
                    <li key={v.id} className="rounded-xl bg-white/5 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">
                          {b ? "🌿 " : ""}
                          {v.short}
                        </span>
                        <div className="flex gap-1">
                          {b ? (
                            <button onClick={() => act({ type: "unboost", venueId: v.id })} className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px]">
                              Parar destaque
                            </button>
                          ) : (
                            <>
                              <button onClick={() => act({ type: "boost", venueId: v.id, level: 0.4 })} className="rounded-full bg-emerald-600/70 px-2.5 py-0.5 text-[11px]">
                                Destacar
                              </button>
                              <button onClick={() => act({ type: "boost", venueId: v.id, level: 1 })} className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold">
                                Destacar +
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${h}%`, background: heatColor(h) }} />
                      </div>
                      <div className="mt-1 flex justify-between text-[11px] text-white/60">
                        <span className="truncate">{a ? `${a.start} ${a.title}` : "sem atividade"}</span>
                        <span className="shrink-0 pl-2">
                          {Math.round(h)}%{a ? ` · sala ${Math.round(activityFill(a, state, at))}%` : ""}
                        </span>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 text-sm ring-1 ring-white/10">
            <h2 className="mb-2 font-semibold">Como o destaque funciona (e o que ele não faz)</h2>
            <ul className="list-disc space-y-1 pl-5 text-white/75">
              <li>Só reordena sugestões que já combinam pelo menos 50% com o perfil da pessoa.</li>
              <li>Nunca esconde atividades nem muda a programação.</li>
              <li>Transparência: a pessoa vê o selo 🌿 &quot;ajuda a distribuir o público&quot;.</li>
              <li>Dados agregados e anônimos por tag/polo — nenhum rastreamento individual.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <h2 className="mb-2 font-semibold">Simulação</h2>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button key={p} onClick={() => act({ type: "clock", hhmm: p })} className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-xs">
                  {p}
                </button>
              ))}
              <input value={clock} onChange={(e) => setClock(e.target.value)} className="w-16 rounded bg-white/10 px-2 font-mono text-xs" />
              <button onClick={() => act({ type: "clock", hhmm: clock })} className="rounded-full bg-white/20 px-2.5 py-1 text-xs">
                Definir hora
              </button>
              <button onClick={() => act({ type: "reset" })} className="rounded-full bg-red-500/30 px-2.5 py-1 text-xs">
                Resetar
              </button>
            </div>
            <p className="mt-2 text-xs text-white/50">
              Lotação simulada. Em produção: check-ins NFC + catracas + contagem por Wi-Fi/celulares (agregada).{" "}
              <Link href="/tags" className="underline">
                Gerenciar tags
              </Link>
            </p>
          </div>
        </div>
      </div>
      <p className="pb-4 text-center text-[11px] text-white/40">Locais: {venueById("nerd")?.name} e polos do Bairro do Recife (coordenadas aproximadas)</p>
    </div>
  );
}

function Kpi({ label, value, sub, warn, good }: { label: string; value: React.ReactNode; sub?: string; warn?: boolean; good?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 ring-1 ${warn ? "bg-red-500/10 ring-red-400/30" : good ? "bg-emerald-500/10 ring-emerald-400/30" : "bg-white/5 ring-white/10"}`}>
      <p className="text-[11px] text-white/60">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="truncate text-[11px] text-white/50">{sub}</p>}
    </div>
  );
}
