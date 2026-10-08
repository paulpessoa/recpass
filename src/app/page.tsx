import { HomeClient } from "./HomeClient";

export default async function Home({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const ids = typeof sp.ids === "string" ? sp.ids.split(",").filter(Boolean) : [];
  return <HomeClient ids={ids} />;
}
