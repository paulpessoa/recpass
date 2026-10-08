import { AppShell } from "@/components/AppShell";
import { AgentChat } from "@/components/AgentChat";

export default async function AgentePage({ searchParams }: PageProps<"/agente">) {
  const sp = await searchParams;
  return (
    <AppShell title="Agente RecPass">
      <AgentChat
        greeting="Oi! Sou o agente do RecPass. Pergunte o que fazer agora, como chegar a um lugar sem paralelepípedo ou degrau, ou onde pegar seu carro sem enfrentar o funil das pontes."
        initialQuestion={typeof sp.q === "string" ? sp.q : null}
      />
    </AppShell>
  );
}
