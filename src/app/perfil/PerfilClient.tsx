"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ARCHETYPES, MOBILITY_LABEL, PERSONAS, archetypeById, type Mobility } from "@/lib/data";
import { useGuide, useProfile } from "@/lib/client";
import { profileFromPersona } from "@/lib/engine";

const VIBES: { label: string; scores: Record<string, number> }[] = [
  { label: "Descobrir algo que ainda nem tem nome", scores: { chico: 2, nana: 1 } },
  { label: "Entender as raízes e a cultura por trás da tecnologia", scores: { ariano: 2, clarice: 1 } },
  { label: "Fazer negócios e conexões", scores: { nassau: 2, chico: 1 } },
  { label: "Aprender algo prático para a carreira", scores: { freire: 2, nassau: 1 } },
  { label: "Ambientes calmos e conversas profundas", scores: { clarice: 2, freire: 1 } },
  { label: "Sentir: som, arte, experiências imersivas", scores: { nana: 2, chico: 1 } },
];

const PLACES: { label: string; id: string }[] = [
  { label: "🦀 O mangue, onde tudo se mistura", id: "chico" },
  { label: "⛪ O Pátio de São Pedro e suas histórias", id: "ariano" },
  { label: "🌉 As pontes sobre o Capibaribe", id: "nassau" },
  { label: "🏫 Uma escola comunitária no bairro", id: "freire" },
  { label: "🎺 O Paço do Frevo em dia de ensaio", id: "nana" },
  { label: "📖 Uma livraria silenciosa na Boa Vista", id: "clarice" },
];

const TOPICS = ["ia", "dev", "carreira", "startups", "investimento", "negocios", "cidades", "mobilidade", "dados", "cultura", "patrimonio", "musica", "arte", "games", "xr", "design", "ux", "educacao", "acessibilidade", "diversidade", "hardware"];

const NEEDS = ["libras", "audiodescrição", "evitar aglomeração", "fraldário", "sombra", "assento"];

export function PerfilClient({ startQuiz }: { startQuiz: boolean }) {
  const [profile, setProfile] = useProfile();
  const [guide, setGuide] = useGuide();
  const [quiz, setQuiz] = useState(startQuiz);
  const [step, setStep] = useState(0);
  const [mobility, setMobility] = useState<Mobility>("padrao");
  const [vibe, setVibe] = useState<number | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [name, setName] = useState("");

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function finish() {
    const score: Record<string, number> = {};
    if (vibe !== null) for (const [k, v] of Object.entries(VIBES[vibe].scores)) score[k] = (score[k] ?? 0) + v;
    if (place) score[place] = (score[place] ?? 0) + 2;
    for (const a of ARCHETYPES) score[a.id] = (score[a.id] ?? 0) + topics.filter((t) => a.topics.includes(t)).length * 0.5;
    const archetypeId = Object.entries(score).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "freire";
    setProfile({
      name: name.trim() || "Você",
      avatar: archetypeById(archetypeId)?.emoji ?? "🙂",
      mobility,
      archetypeId,
      interests: topics,
      needs,
    });
    setQuiz(false);
    setStep(0);
  }

  const arch = archetypeById(profile?.archetypeId);

  if (quiz) {
    const steps = [
      <div key="mob">
        <h2 className="text-lg font-bold">Como você vai circular hoje?</h2>
        <p className="mb-3 text-sm text-gray-600">Isso muda a rota, não o que você pode ver.</p>
        <div className="grid gap-2">
          {(Object.keys(MOBILITY_LABEL) as Mobility[]).map((m) => (
            <button key={m} onClick={() => setMobility(m)} className={`rounded-xl p-3 text-left ring-1 ${mobility === m ? "bg-[#123b8c] text-white ring-[#123b8c]" : "bg-white ring-black/10"}`}>
              <span className="mr-2">{MOBILITY_LABEL[m].icon}</span>
              <b>{MOBILITY_LABEL[m].label}</b>
              <span className={`block text-xs ${mobility === m ? "text-white/80" : "text-gray-500"}`}>{MOBILITY_LABEL[m].hint}</span>
            </button>
          ))}
        </div>
      </div>,
      <div key="vibe">
        <h2 className="mb-3 text-lg font-bold">Num festival, você é de…</h2>
        <div className="grid gap-2">
          {VIBES.map((v, i) => (
            <button key={v.label} onClick={() => setVibe(i)} className={`rounded-xl p-3 text-left text-sm ring-1 ${vibe === i ? "bg-[#123b8c] text-white ring-[#123b8c]" : "bg-white ring-black/10"}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>,
      <div key="place">
        <h2 className="mb-3 text-lg font-bold">Escolha um lugar do Recife</h2>
        <div className="grid gap-2">
          {PLACES.map((p) => (
            <button key={p.id} onClick={() => setPlace(p.id)} className={`rounded-xl p-3 text-left text-sm ring-1 ${place === p.id ? "bg-[#123b8c] text-white ring-[#123b8c]" : "bg-white ring-black/10"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>,
      <div key="topics">
        <h2 className="text-lg font-bold">O que te interessa?</h2>
        <p className="mb-3 text-sm text-gray-600">Escolha quantos quiser.</p>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button key={t} onClick={() => toggle(topics, setTopics, t)} className={`rounded-full px-3 py-1.5 text-sm ring-1 ${topics.includes(t) ? "bg-[#f26b1d] text-white ring-[#f26b1d]" : "bg-white ring-black/10"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>,
      <div key="needs">
        <h2 className="text-lg font-bold">Algo que ajude você?</h2>
        <p className="mb-3 text-sm text-gray-600">Opcional e fica só no seu celular.</p>
        <div className="flex flex-wrap gap-2">
          {NEEDS.map((t) => (
            <button key={t} onClick={() => toggle(needs, setNeeds, t)} className={`rounded-full px-3 py-1.5 text-sm ring-1 ${needs.includes(t) ? "bg-[#f26b1d] text-white ring-[#f26b1d]" : "bg-white ring-black/10"}`}>
              {t}
            </button>
          ))}
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome ou apelido (opcional)" className="mt-4 w-full rounded-xl bg-white p-3 text-sm ring-1 ring-black/10" />
      </div>,
    ];
    return (
      <AppShell>
        <div className="mb-3 flex gap-1">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-[#f26b1d]" : "bg-gray-200"}`} />
          ))}
        </div>
        {steps[step]}
        <div className="mt-5 flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold">
              Voltar
            </button>
          )}
          <button
            onClick={() => (step < steps.length - 1 ? setStep(step + 1) : finish())}
            className="flex-1 rounded-full bg-[#123b8c] py-2 text-sm font-bold text-white"
          >
            {step < steps.length - 1 ? "Continuar" : "Ver meu perfil"}
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Seu perfil">
      {profile && arch && (
        <section className="mb-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="p-4 text-white" style={{ background: arch.color }}>
            <p className="text-xs uppercase tracking-wide opacity-80">Seu arquétipo REC&apos;n&apos;Play</p>
            <h2 className="text-2xl font-black">
              {arch.emoji} {arch.figure}
            </h2>
            <p className="font-semibold">
              {arch.name} — {arch.tagline}
            </p>
          </div>
          <div className="p-4 text-sm">
            <p className="text-gray-700">{arch.description}</p>
            <p className="mt-3 text-xs text-gray-500">
              {profile.avatar} {profile.name} · {MOBILITY_LABEL[profile.mobility].icon} {MOBILITY_LABEL[profile.mobility].label}
            </p>
            {profile.interests.length > 0 && <p className="mt-1 text-xs text-gray-500">Interesses: {profile.interests.join(", ")}</p>}
            {profile.needs.length > 0 && <p className="mt-1 text-xs text-gray-500">Necessidades: {profile.needs.join(", ")}</p>}
            <div className="mt-4 flex gap-2">
              <Link href="/" className="flex-1 rounded-full bg-[#123b8c] py-2 text-center text-sm font-bold text-white">
                Ver o que combina comigo
              </Link>
              <button onClick={() => setProfile(null)} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold">
                Sair
              </button>
            </div>
          </div>
        </section>
      )}

      <button onClick={() => setQuiz(true)} className="mb-2 w-full rounded-2xl bg-[#f26b1d] p-4 text-left text-white">
        <b className="block">🧬 Fazer meu diagnóstico (1 min)</b>
        <span className="text-sm opacity-90">Descubra se você é Chico Science, Ariano Suassuna, Nassau…</span>
      </button>
      <Link href="/agente?q=Quero%20montar%20meu%20perfil%20conversando" className="mb-6 block w-full rounded-2xl bg-white p-4 text-sm ring-1 ring-black/5">
        <b>💬 Prefiro conversar com o agente</b>
        <span className="block text-gray-500">Ele faz 2 perguntas e já te sugere um roteiro.</span>
      </Link>

      <label className="mb-6 flex items-center justify-between rounded-2xl bg-white p-4 text-sm ring-1 ring-black/5">
        <span>
          <b className="block">🎧 Modo guia do patrimônio</b>
          <span className="text-gray-500">Ao tocar numa tag, conta a história do prédio em 30s.</span>
        </span>
        <input type="checkbox" className="h-5 w-5" checked={guide} onChange={(e) => setGuide(e.target.checked)} />
      </label>

      <h2 className="mb-2 font-bold">Contas demo</h2>
      <div className="space-y-2">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setProfile(profileFromPersona(p))}
            className={`flex w-full items-start gap-3 rounded-2xl bg-white p-3 text-left ring-1 ${profile?.personaId === p.id ? "ring-2 ring-[#123b8c]" : "ring-black/5"}`}
          >
            <span className="text-3xl">{p.avatar}</span>
            <span className="min-w-0">
              <b className="block text-sm">
                {p.name} <span className="font-normal text-gray-500">· {MOBILITY_LABEL[p.mobility].icon} {archetypeById(p.archetypeId)?.figure}</span>
              </b>
              <span className="block text-xs text-gray-600">{p.story}</span>
            </span>
          </button>
        ))}
      </div>

      <h2 className="mb-2 mt-6 font-bold">Os arquétipos</h2>
      <div className="grid grid-cols-2 gap-2">
        {ARCHETYPES.map((a) => (
          <div key={a.id} className="rounded-2xl p-3 text-white" style={{ background: a.color }}>
            <div className="text-2xl">{a.emoji}</div>
            <b className="block text-sm">{a.figure}</b>
            <span className="text-xs opacity-90">{a.name}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
