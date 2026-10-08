import type { FillStatus } from "@/lib/engine";

/** Barra de lotação estilo bateria: quanto mais cheia a sala, mais "carregada". */
export function Battery({ fill, status, capacity, compact = false }: { fill: number; status: FillStatus; capacity?: number; compact?: boolean }) {
  const pct = Math.round(fill);
  const vagas = capacity !== undefined ? Math.max(0, Math.round(capacity * (1 - fill / 100))) : undefined;
  return (
    <div className="flex items-center gap-2" aria-label={`Lotação ${pct}%: ${status.label}`}>
      <div className="flex items-center">
        <div className={`relative ${compact ? "h-3.5 w-12" : "h-5 w-20"} rounded-[5px] border-2 border-foreground/70 p-[2px]`}>
          <div
            className="h-full rounded-[2px] transition-all duration-700"
            style={{ width: `${Math.max(4, pct)}%`, background: status.color }}
          />
        </div>
        <div className={`${compact ? "h-1.5" : "h-2.5"} w-[3px] rounded-r bg-foreground/70`} />
      </div>
      <span className="t-micro" style={{ color: status.color }}>
        {status.key === "breve" || status.key === "encerrada" ? status.label : `${pct}% · ${status.label}`}
      </span>
      {!compact && vagas !== undefined && status.key !== "lotado" && status.key !== "encerrada" && (
        <span className="text-xs text-muted">{vagas} vagas</span>
      )}
    </div>
  );
}
