import { PerfilClient } from "./PerfilClient";

export default async function PerfilPage({ searchParams }: PageProps<"/perfil">) {
  const sp = await searchParams;
  return <PerfilClient startQuiz={sp.quiz === "1"} />;
}
