"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { VENUES, venueById, type Venue } from "@/lib/data";
import { SEMAFORO, heatColor, heatLevel, type Route } from "@/lib/engine";

const SURFACE_STYLE: Record<string, { color: string; dashArray?: string }> = {
  asfalto: { color: "#0055FF" },
  paralelepipedo: { color: "#FF8A00", dashArray: "6 6" },
  calcada_estreita: { color: "#FFEA00", dashArray: "2 6" },
  escadaria: { color: "#D50000", dashArray: "1 5" },
};

const ORDER = ["livre", "enchendo", "lotado"] as const;
const CLUSTER_PX = 40; // pins mais próximos que isso (em pixels) viram um grupo

// Ícones em cache: recriar a cada render trocaria o DOM do pin e perderia cliques.
const ICONS: Record<string, L.DivIcon> = {};
function icon(key: string, w: number, h: number, color: string, cls: string, html = "") {
  const k = `${key}|${color}|${cls}|${html}`;
  ICONS[k] ??= L.divIcon({
    className: `pin ${cls}`,
    iconSize: [w, h],
    iconAnchor: [w / 2, h / 2],
    html: `<div class="pin-body" style="background:${color}">${html}</div>`,
  });
  return ICONS[k];
}

/** Agrupa pins próximos no zoom atual (sem dependência extra). */
function Pins({
  heat,
  here,
  selected,
  boosted,
  onSelect,
}: {
  heat: Record<string, number>;
  here?: string | null;
  selected?: string | null;
  boosted: string[];
  onSelect?: (venueId: string) => void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  const groups: Venue[][] = [];
  const pts: L.Point[] = [];
  for (const v of VENUES) {
    const p = map.project([v.lat, v.lng], zoom);
    // O "você está aqui" e o selecionado nunca somem dentro de um grupo.
    const solo = v.id === here || v.id === selected;
    const i = solo ? -1 : pts.findIndex((q, j) => q.distanceTo(p) < CLUSTER_PX && !groups[j].some((g) => g.id === here || g.id === selected));
    if (i >= 0) groups[i].push(v);
    else {
      groups.push([v]);
      pts.push(p);
    }
  }

  return groups.map((g) => {
    if (g.length > 1) {
      const worst = g.reduce((m, v) => Math.max(m, ORDER.indexOf(heatLevel(heat[v.id] ?? 0))), 0);
      const lat = g.reduce((s, v) => s + v.lat, 0) / g.length;
      const lng = g.reduce((s, v) => s + v.lng, 0) / g.length;
      return (
        <Marker
          key={g.map((v) => v.id).join("+")}
          position={[lat, lng]}
          icon={icon("cluster", 34, 34, SEMAFORO[ORDER[worst]], "pin-cluster", String(g.length))}
          title={`${g.length} locais: ${g.map((v) => v.short).join(", ")}`}
          eventHandlers={{ click: () => map.flyToBounds(L.latLngBounds(g.map((v) => [v.lat, v.lng])), { padding: [60, 60], maxZoom: 18 }) }}
        />
      );
    }
    const v = g[0];
    const h = heat[v.id] ?? 0;
    const hub = v.kind === "hub";
    const cls = [hub && "pin-hub", v.id === here && "pin-here", v.id === selected && "pin-selected"].filter(Boolean).join(" ");
    return (
      <Marker
        key={v.id}
        position={[v.lat, v.lng]}
        icon={hub ? icon("hub", 22, 22, "#F5F5F5", cls, "🚕") : icon("pin", 30, 20, heatColor(h), cls, boosted.includes(v.id) ? "🌿" : "")}
        title={v.short}
        alt={v.short}
        keyboard
        eventHandlers={{ click: () => onSelect?.(v.id) }}
      />
    );
  });
}

export default function MapView({
  heat,
  route,
  here,
  selected,
  boosted = [],
  onSelect,
  height = 360,
  showHeat = false,
  rounded = true,
}: {
  heat: Record<string, number>;
  route?: Route | null;
  here?: string | null;
  selected?: string | null;
  boosted?: string[];
  onSelect?: (venueId: string) => void;
  height?: number | string;
  showHeat?: boolean;
  rounded?: boolean;
}) {
  const start = (here && venueById(here)) || null;
  return (
    <MapContainer
      center={start ? [start.lat, start.lng] : [-8.0605, -34.8718]}
      zoom={16}
      scrollWheelZoom
      style={{ height, width: "100%", borderRadius: rounded ? 16 : 0 }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
        className="tiles-dark"
        maxZoom={19}
      />
      {showHeat &&
        VENUES.map((v) => {
          const h = heat[v.id] ?? 0;
          return (
            <CircleMarker
              key={`heat-${v.id}`}
              center={[v.lat, v.lng]}
              radius={14 + h / 3}
              pathOptions={{ color: heatColor(h), fillColor: heatColor(h), fillOpacity: 0.12 + h / 400, weight: 0 }}
              interactive={false}
            />
          );
        })}
      {route?.ok &&
        route.segments.map((s, i) => (
          <Polyline
            key={`seg-${i}`}
            positions={[
              [s.from.lat, s.from.lng],
              [s.to.lat, s.to.lng],
            ]}
            pathOptions={{ weight: 7, opacity: 0.95, lineCap: "round", ...SURFACE_STYLE[s.surface] }}
          />
        ))}
      <Pins heat={heat} here={here} selected={selected} boosted={boosted} onSelect={onSelect} />
    </MapContainer>
  );
}
