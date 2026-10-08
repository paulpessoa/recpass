"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from "react-leaflet";
import { VENUES } from "@/lib/data";
import { heatColor, type Route } from "@/lib/engine";

const SURFACE_STYLE: Record<string, { color: string; dashArray?: string }> = {
  asfalto: { color: "#2563EB" },
  paralelepipedo: { color: "#EA580C", dashArray: "6 6" },
  calcada_estreita: { color: "#CA8A04", dashArray: "2 6" },
  escadaria: { color: "#DC2626", dashArray: "1 5" },
};

export default function MapView({
  heat,
  route,
  here,
  boosted = [],
  onSelect,
  height = 360,
  showHeat = true,
}: {
  heat: Record<string, number>;
  route?: Route | null;
  here?: string | null;
  boosted?: string[];
  onSelect?: (venueId: string) => void;
  height?: number;
  showHeat?: boolean;
}) {
  return (
    <MapContainer
      center={[-8.0605, -34.8718]}
      zoom={16}
      scrollWheelZoom
      style={{ height, width: "100%", borderRadius: 16 }}
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" maxZoom={19} />
      {showHeat &&
        VENUES.map((v) => {
          const h = heat[v.id] ?? 0;
          return (
            <CircleMarker
              key={`heat-${v.id}`}
              center={[v.lat, v.lng]}
              radius={14 + h / 3}
              pathOptions={{ color: heatColor(h), fillColor: heatColor(h), fillOpacity: 0.18 + h / 300, weight: 0 }}
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
            pathOptions={{ weight: 7, opacity: 0.9, lineCap: "round", ...SURFACE_STYLE[s.surface] }}
          />
        ))}
      {VENUES.map((v) => {
        const h = heat[v.id] ?? 0;
        const isHere = v.id === here;
        const isBoost = boosted.includes(v.id);
        return (
          <CircleMarker
            key={v.id}
            center={[v.lat, v.lng]}
            radius={isHere ? 10 : v.kind === "hub" ? 6 : 8}
            pathOptions={{
              color: isHere ? "#123b8c" : isBoost ? "#059669" : "#1f2937",
              weight: isHere || isBoost ? 4 : 2,
              fillColor: v.kind === "hub" ? "#ffffff" : heatColor(h),
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => onSelect?.(v.id) }}
          >
            <Tooltip direction="top" offset={[0, -8]} permanent={isHere || v.kind === "polo"} opacity={0.9}>
              <span style={{ fontSize: 11, fontWeight: 600 }}>
                {isHere ? "📍 Você · " : isBoost ? "🌿 " : v.kind === "hub" ? "🚕 " : ""}
                {v.short}
                {v.kind !== "hub" ? ` ${Math.round(h)}%` : ""}
              </span>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
