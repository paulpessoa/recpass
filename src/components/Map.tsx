"use client";

import dynamic from "next/dynamic";

// Leaflet acessa `window`: carrega só no navegador.
export const Map = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[360px] w-full animate-pulse rounded-2xl bg-card" />,
});
