import { MapaClient } from "./MapaClient";

export default async function MapaPage({ searchParams }: PageProps<"/mapa">) {
  const sp = await searchParams;
  return <MapaClient initialFrom={typeof sp.from === "string" ? sp.from : null} initialTo={typeof sp.to === "string" ? sp.to : null} />;
}
