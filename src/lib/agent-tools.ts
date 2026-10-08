// Ferramentas do agente: a IA só conversa; quem decide rota, vaga e recomendação é o motor determinístico.
import { ACTIVITIES, ARCHETYPES, VENUES, activityById, mobilityText, venueById } from "./data";
import {
  SURFACE_LABEL,
  actStart,
  activityAt,
  activityFill,
  computeRoute,
  festivalNow,
  fillStatus,
  fmtMin,
  profileMobility,
  recommend,
  venueHeat,
  type Profile,
  type SharedState,
} from "./engine";

export type AgentContext = {
  state: SharedState;
  profile: Profile | null;
  venueId: string | null; // onde a pessoa está (última tag NFC)
  at?: number;
};

export type AgentCard = { type: "activity"; id: string; balanced?: boolean } | { type: "route"; from: string; to: string };

export const TOOL_DEFS = [
  {
    name: "recomendar_atividades",
    description:
      "Recomenda atividades que começam em breve, já filtradas por vagas, acessibilidade do perfil e tempo de deslocamento a partir de onde a pessoa está. Use sempre que a pessoa pedir sugestões, alternativas a uma sala lotada ou 'o que fazer agora'.",
    parameters: {
      type: "object",
      properties: {
        quantidade: { type: "integer", description: "Quantas sugestões (1-5). Padrão 3." },
        tema: { type: "string", description: "Tema opcional para filtrar, ex.: 'ia', 'cultura', 'carreira'." },
      },
    },
  },
  {
    name: "buscar_atividades",
    description: "Busca na programação por texto, tema ou local e devolve horário, local, lotação e recursos de acessibilidade.",
    parameters: {
      type: "object",
      properties: {
        texto: { type: "string", description: "Palavra-chave no título ou tema." },
        local_id: { type: "string", description: `Id do local. Opções: ${VENUES.map((v) => v.id).join(", ")}` },
      },
    },
  },
  {
    name: "calcular_rota",
    description:
      "Calcula a rota a pé adaptada ao perfil de mobilidade (desvia de paralelepípedo, degraus e multidão quando necessário) a partir do local atual até um local ou atividade.",
    parameters: {
      type: "object",
      properties: {
        destino_id: { type: "string", description: "Id do local (ex.: 'moinho') ou da atividade (ex.: 'a21')." },
        origem_id: { type: "string", description: "Opcional. Id do local de origem, se diferente do atual." },
      },
      required: ["destino_id"],
    },
  },
  {
    name: "status_local",
    description: "Mostra lotação do entorno, atividade atual, acessos (rampa/elevador/escada) e comodidades (fraldário, sombra, banheiro) de um local, incluindo pontos de embarque.",
    parameters: {
      type: "object",
      properties: { local_id: { type: "string", description: "Id do local." } },
      required: ["local_id"],
    },
  },
];

export function runTool(name: string, input: Record<string, unknown>, ctx: AgentContext, cards: AgentCard[]): string {
  const at = ctx.at ?? Date.now();
  const now = festivalNow(ctx.state, at);
  const heat = (id: string) => venueHeat(id, ctx.state, at);
  const mobility = profileMobility(ctx.profile);

  switch (name) {
    case "recomendar_atividades": {
      const qtd = Math.min(5, Math.max(1, Number(input.quantidade ?? 3)));
      let recs = recommend({ state: ctx.state, profile: ctx.profile, fromVenueId: ctx.venueId ?? undefined, limit: 12, at });
      if (typeof input.tema === "string" && input.tema) {
        const t = input.tema.toLowerCase();
        const filtered = recs.filter((r) => r.activity.topics.some((x) => x.includes(t)) || r.activity.title.toLowerCase().includes(t));
        if (filtered.length) recs = filtered;
      }
      recs = recs.slice(0, qtd);
      recs.forEach((r) => cards.push({ type: "activity", id: r.activity.id, balanced: r.balanced }));
      if (!recs.length) return "Nenhuma atividade compatível com vagas e tempo de deslocamento nas próximas 2h30.";
      return JSON.stringify(
        recs.map((r) => ({
          id: r.activity.id,
          titulo: r.activity.title,
          local: venueById(r.activity.venueId)?.short,
          inicio: r.activity.start,
          comeca_em_min: r.startsIn,
          lotacao_pct: Math.round(r.fill),
          status: r.status.label,
          minutos_a_pe: r.etaMin,
          motivos: r.reasons,
          libras: !!r.activity.libras,
          audiodescricao: !!r.activity.audiodescricao,
          sugestao_que_alivia_fluxo: r.balanced,
        })),
      );
    }
    case "buscar_atividades": {
      const texto = String(input.texto ?? "").toLowerCase();
      const local = input.local_id ? String(input.local_id) : null;
      const found = ACTIVITIES.filter(
        (a) =>
          (!local || a.venueId === local) &&
          (!texto || a.title.toLowerCase().includes(texto) || a.topics.some((t) => t.includes(texto)) || a.track.toLowerCase().includes(texto)),
      ).slice(0, 8);
      return JSON.stringify(
        found.map((a) => {
          const fill = activityFill(a, ctx.state, at);
          return {
            id: a.id,
            titulo: a.title,
            local: venueById(a.venueId)?.short,
            sala: `${a.room} (${a.floor <= 1 ? "térreo" : a.floor + "º andar"})`,
            inicio: a.start,
            status: fillStatus(fill, a, now).label,
            lotacao_pct: Math.round(fill),
            libras: !!a.libras,
            audiodescricao: !!a.audiodescricao,
            legenda: !!a.legenda,
          };
        }),
      );
    }
    case "calcular_rota": {
      const destId = String(input.destino_id ?? "");
      const act = activityById(destId);
      const to = act ? act.venueId : destId;
      const from = String(input.origem_id ?? ctx.venueId ?? "marco-zero");
      if (!venueById(to)) return `Destino desconhecido: ${destId}`;
      if (from === to) {
        const v = venueById(to)!;
        return JSON.stringify({ mesmo_local: true, local: v.short, circulacao: v.vertical ?? [], acesso: v.universalAccess, sala: act ? `${act.room}, ${act.floor <= 1 ? "térreo" : act.floor + "º andar"}` : null });
      }
      const r = computeRoute(from, to, mobility, heat);
      if (!r.ok) return `Sem rota acessível de ${venueById(from)?.short} até ${venueById(to)?.short} para o perfil ${mobilityText(mobility, false)}.`;
      cards.push({ type: "route", from, to });
      return JSON.stringify({
        de: venueById(from)?.short,
        para: venueById(to)?.short,
        minutos: r.minutes,
        metros: Math.round(r.meters),
        passos: r.segments.map((s) => `${s.street} — ${Math.round(s.meters)} m de ${SURFACE_LABEL[s.surface]}${s.crowd > 0.75 ? " (cheio)" : ""}`),
        desvios_feitos: r.avoided,
        avisos: r.warnings,
        acesso_no_destino: venueById(to)?.universalAccess,
      });
    }
    case "status_local": {
      const v = venueById(String(input.local_id ?? ""));
      if (!v) return "Local desconhecido.";
      const a = activityAt(v.id, ctx.state, at);
      return JSON.stringify({
        local: v.name,
        aglomeracao_pct: Math.round(heat(v.id)),
        acesso_universal: v.universalAccess,
        elevador: v.elevator,
        comodidades: v.amenities,
        atividade_atual_ou_proxima: a
          ? { id: a.id, titulo: a.title, inicio: a.start, lotacao_pct: Math.round(activityFill(a, ctx.state, at)), status: fillStatus(activityFill(a, ctx.state, at), a, now).label }
          : null,
      });
    }
  }
  return "Ferramenta desconhecida.";
}

export function systemPrompt(ctx: AgentContext, voice = false) {
  const at = ctx.at ?? Date.now();
  const now = festivalNow(ctx.state, at);
  const p = ctx.profile;
  const arch = ARCHETYPES.find((a) => a.id === p?.archetypeId);
  const here = ctx.venueId ? venueById(ctx.venueId) : null;
  return `Você é o RecPass, concierge de mobilidade e acessibilidade do festival REC'n'Play, no Bairro do Recife (Recife Antigo).
Ruas históricas de paralelepípedo, prédios tombados pelo IPHAN (escadarias na fachada, rampas escondidas nas laterais), pontes bloqueadas pela CTTU e multidões são o contexto do dia a dia aqui.

Como responder:
- Português do Brasil, tom acolhedor e direto, com sotaque recifense leve quando couber. No máximo 4 frases curtas; listas só quando ajudarem.
- Nunca invente atividades, horários, vagas ou rotas: use as ferramentas. Nunca mostre ids internos (como a21 ou paco-frevo) para a pessoa: use títulos e nomes de locais. Programação e lotação são uma simulação da POC.
- Respeite sempre o perfil de mobilidade: para cadeirante e mobilidade reduzida, nunca sugira degraus; diga onde fica o acesso universal.
- Quando a sala estiver lotada ou não der tempo, ofereça alternativas com recomendar_atividades.
- Se uma sugestão tiver "sugestao_que_alivia_fluxo", você pode dizer com transparência que ela também ajuda a distribuir o público — sem pressionar; a escolha é da pessoa.
- Se não houver perfil, faça no máximo 2 perguntas rápidas (como a pessoa se desloca e o que curte) ou sugira o autodiagnóstico de 1 minuto.
- Para pessoas com baixa visão, descreva o caminho em referências táteis/sonoras e evite emojis.
${voice ? "- MODO VOZ: a resposta será falada. No máximo 2 frases curtas, sem listas, sem emojis, sem números de id.\n" : ""}- Para ir embora, indique os pontos de embarque (hub-norte, hub-sul, hub-onibus) com menos aglomeração.

Contexto agora:
- Hora no festival: ${fmtMin(now)}
- Local atual (última tag NFC): ${here ? `${here.name} (id ${here.id})` : "desconhecido — pergunte ou use Marco Zero como referência"}
- Perfil: ${
    p
      ? `${p.name}; mobilidade: ${mobilityText(profileMobility(p), false)}; arquétipo: ${arch ? `${arch.figure} (${arch.name})` : "não definido"}; interesses: ${p.interests.join(", ") || "—"}; necessidades: ${p.needs.join(", ") || "—"}`
      : "ainda não definido"
  }
- Locais (id: nome): ${VENUES.map((v) => `${v.id}: ${v.short}`).join("; ")}
- Atividades começando já: ${ACTIVITIES.filter((a) => actStart(a) >= now - 15 && actStart(a) <= now + 90)
    .map((a) => `${a.id} ${a.start} ${a.title} @${a.venueId}`)
    .join(" | ")}`;
}
