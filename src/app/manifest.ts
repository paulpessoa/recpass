import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RecPass — REC'n'Play",
    short_name: "RecPass",
    description: "Encoste o celular nas tags do festival: rota acessível, salas com vaga e um agente para ajudar — sem GPS.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "pt-BR",
    background_color: "#121212",
    theme_color: "#121212",
    categories: ["travel", "navigation", "events"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Mapa", url: "/mapa" },
      { name: "Agente", url: "/agente" },
    ],
  };
}
