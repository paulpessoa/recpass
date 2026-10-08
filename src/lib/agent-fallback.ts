// Agente de reserva por regras: funciona sem chave de IA e sem internet (roda no navegador).
// Também é o "modo econômico": a maioria das perguntas do festival cabe aqui, a custo zero.
import { MOBILITY_LABEL, VENUES, venueById } from "./data";
import { activityAt, activityFill, computeRoute, fillStatus, festivalNow, recommend, venueHeat, SURFACE_LABEL } from "./engine";
import type { AgentCard, AgentContext } from "./agent-tools";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function findVenue(text: string) {
  const t = norm(text);
  return VENUES.find((v) => t.includes(norm(v.short)) || t.includes(norm(v.id).replace(/-/g, " ")));
}

/** `confident`: intenção clara resolvida só com algoritmo — não precisa gastar IA. */
export function fallbackReply(text: string, ctx: AgentContext): { text: string; cards: AgentCard[]; confident: boolean } {
  const at = ctx.at ?? Date.now();
  const t = norm(text);
  const cards: AgentCard[] = [];
  const here = ctx.venueId ?? "marco-zero";
  const mobility = ctx.profile?.mobility ?? "padrao";
  const heat = (id: string) => venueHeat(id, ctx.state, at);

  // Ir embora / embarque
  if (/(embora|uber|99|taxi|onibus|carro|sair|volta pra casa|voltar)/.test(t)) {
    const wantsBus = /onibus/.test(t);
    const hubs = VENUES.filter((v) => v.kind === "hub" && (wantsBus ? v.id === "hub-onibus" : v.id !== "hub-onibus"))
      .map((v) => ({ v, r: computeRoute(here, v.id, mobility, heat), h: heat(v.id) }))
      .filter((x) => x.r.ok)
      .sort((a, b) => a.r.minutes + a.h / 10 - (b.r.minutes + b.h / 10));
    const best = hubs[0];
    if (best) {
      cards.push({ type: "route", from: here, to: best.v.id });
      return {
        text: wantsBus
          ? `A parada provisória fica na Av. Rio Branco (${Math.round(best.h)}% de movimento), a ${best.r.minutes} min a pé. ${best.v.amenities[0]}.`
          : `O ponto de embarque mais tranquilo agora é o ${best.v.short} (${Math.round(best.h)}% de movimento), a ${best.r.minutes} min a pé. Peça o carro já com destino lá: os motoristas não ficam presos nos bloqueios das pontes.`,
        cards,
        confident: true,
      };
    }
  }

  // Comodidades
  if (/(banheiro|fraldario|trocador|sombra|agua|bebedouro|sentar)/.test(t)) {
    const want = /(fraldario|trocador)/.test(t) ? "Fraldário" : /sombra/.test(t) ? "Sombra" : "Banheiro";
    const options = VENUES.filter((v) => v.amenities.some((a) => a.toLowerCase().includes(want.toLowerCase())))
      .map((v) => ({ v, r: computeRoute(here, v.id, mobility, heat) }))
      .filter((x) => x.r.ok)
      .sort((a, b) => a.r.minutes - b.r.minutes);
    if (options[0]) {
      cards.push({ type: "route", from: here, to: options[0].v.id });
      return { confident: true, text: `${want} mais perto: ${options[0].v.short}, a ${options[0].r.minutes} min. ${options[0].v.universalAccess}`, cards };
    }
  }

  // Rota para um local
  const dest = findVenue(text);
  if (dest && /(como|chegar|ir|rota|caminho|onde fica|levar)/.test(t)) {
    const r = computeRoute(here, dest.id, mobility, heat);
    if (!r.ok) return { confident: true, text: `Não encontrei rota acessível até ${dest.short} para ${MOBILITY_LABEL[mobility].label.toLowerCase()}. ${dest.universalAccess}`, cards };
    cards.push({ type: "route", from: here, to: dest.id });
    const desvio = r.avoided.length ? ` Desviei de ${r.avoided.slice(0, 2).join(" e ")}.` : "";
    const piso = r.segments.map((s) => SURFACE_LABEL[s.surface]);
    return {
      text: `Até ${dest.short}: ${r.minutes} min a pé, ${Math.round(r.meters)} m (${[...new Set(piso)].join(", ")}).${desvio} ${r.warnings[0] ?? dest.universalAccess}`,
      cards,
      confident: true,
    };
  }

  // Status de um local
  if (dest) {
    const a = activityAt(dest.id, ctx.state, at);
    const now = festivalNow(ctx.state, at);
    const fill = a ? activityFill(a, ctx.state, at) : 0;
    if (a) cards.push({ type: "activity", id: a.id });
    return {
      text: `${dest.short} está com ${Math.round(heat(dest.id))}% de movimento.${a ? ` "${a.title}" às ${a.start}: ${fillStatus(fill, a, now).label.toLowerCase()} (${Math.round(fill)}%).` : ""} ${dest.universalAccess}`,
      cards,
      confident: true,
    };
  }

  // Padrão: recomendações
  const recs = recommend({ state: ctx.state, profile: ctx.profile, fromVenueId: here, limit: 3, at });
  recs.forEach((r) => cards.push({ type: "activity", id: r.activity.id, balanced: r.balanced }));
  const where = venueById(here)?.short ?? "aqui";
  if (!recs.length) return { confident: false, text: "Nas próximas horas não achei nada com vaga que combine com você. Quer ver o mapa do festival?", cards };
  const lotado = /(lotad|cheio|cheia|sem vaga)/.test(t) ? "Que pena! " : "";
  const perfil = ctx.profile ? "" : " Se fizer o diagnóstico de 1 minuto, eu acerto mais.";
  return {
    confident: false,
    text: `${lotado}A partir de ${where}, separei ${recs.length} opções que dão tempo de chegar e ainda têm vaga.${perfil}`,
    cards,
  };
}
