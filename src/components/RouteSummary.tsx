import { mobilityText, venueById } from "@/lib/data";
import { SURFACE_LABEL, mobilityList, type MobilityInput, type Route } from "@/lib/engine";

const SURFACE_DOT: Record<string, string> = {
  asfalto: "#0055FF",
  paralelepipedo: "#FF8A00",
  calcada_estreita: "#FFEA00",
  escadaria: "#D50000",
};

export function RouteSummary({ route, mobility }: { route: Route; mobility: MobilityInput }) {
  if (!route.ok) {
    return <div className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-300">{route.warnings[0]}</div>;
  }
  const to = venueById(route.to);
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-white/10">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">
          {venueById(route.from)?.short} → {to?.short}
        </h3>
        <span className="text-sm font-bold text-accent">
          {route.minutes} min · {Math.round(route.meters)} m
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">
        Rota para {mobilityText(mobilityList(mobility)).toLowerCase()}
      </p>
      <ol className="mt-3 space-y-1.5">
        {route.segments.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SURFACE_DOT[s.surface] }} />
            <span className="min-w-0 flex-1 truncate">{s.street}</span>
            <span className="shrink-0 text-xs text-muted">
              {Math.round(s.meters)} m · {SURFACE_LABEL[s.surface]}
              {s.crowd > 0.75 ? " · cheio" : ""}
            </span>
          </li>
        ))}
      </ol>
      {route.avoided.length > 0 && (
        <p className="mt-3 rounded-lg bg-livre/10 px-2 py-1.5 text-xs text-emerald-300">
          ✅ Desviamos de: {route.avoided.join(", ")}
        </p>
      )}
      {route.warnings.map((w) => (
        <p key={w} className="mt-2 rounded-lg bg-amber-400/10 px-2 py-1.5 text-xs text-amber-200">
          ⚠️ {w}
        </p>
      ))}
      {to && <p className="mt-2 text-xs text-muted">🚪 {to.universalAccess}</p>}
    </div>
  );
}
