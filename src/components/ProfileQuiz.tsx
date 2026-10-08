"use client";

import { useEffect, useRef, useState } from "react";
import { MOBILITY_LABEL, type Mobility } from "@/lib/data";
import type { Profile } from "@/lib/engine";
import { NEEDS, PLACES, TOPICS, TOPIC_LABEL, VIBES, profileFromQuiz, toggleMobility } from "@/lib/quiz";

// O único diagnóstico de perfil do app (sem IA, custo zero): uma pergunta por tela.
// Usado na tela Perfil e no agente, que inclui a tela da tag.

const STEPS = 5;

function Option({ on, onClick, children, round }: { on: boolean; onClick: () => void; children: React.ReactNode; round?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`flex items-center gap-3 text-left ring-1 transition-colors ${round ? "rounded-full px-3.5 py-2 text-sm" : "w-full rounded-xl p-3"} ${
        on ? "bg-[#123b8c] text-white ring-[#123b8c]" : "bg-white text-gray-900 ring-black/10 active:bg-gray-50"
      }`}
    >
      {!round && (
        <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 text-xs ${on ? "border-white bg-white text-[#123b8c]" : "border-gray-300"}`}>
          {on ? "✓" : ""}
        </span>
      )}
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

export function ProfileQuiz({ onDone, onCancel }: { onDone: (p: Profile) => void; onCancel?: () => void }) {
  const [step, setStep] = useState(0);
  const [mobilities, setMobilities] = useState<Mobility[]>([]);
  const [vibes, setVibes] = useState<number[]>([]);
  const [place, setPlace] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const titleRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);

  // A cada pergunta nova, o foco vai para o título (leitores de tela anunciam a pergunta).
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      return;
    }
    titleRef.current?.focus();
  }, [step]);

  const flip = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const q = [
    {
      title: "Como você vai circular hoje?",
      help: "Marque tudo o que se aplica. Isso muda a rota, não o que você pode ver.",
      ok: mobilities.length > 0,
      body: (
        <div className="grid gap-2">
          {(Object.keys(MOBILITY_LABEL) as Mobility[]).map((m) => (
            <Option key={m} on={mobilities.includes(m)} onClick={() => setMobilities(toggleMobility(mobilities, m))}>
              <b className="block text-sm">
                {MOBILITY_LABEL[m].icon} {MOBILITY_LABEL[m].label}
              </b>
              <span className={`block text-xs ${mobilities.includes(m) ? "text-white/80" : "text-gray-500"}`}>{MOBILITY_LABEL[m].hint}</span>
            </Option>
          ))}
        </div>
      ),
    },
    {
      title: "Num festival, você é de…",
      help: "Pode marcar mais de uma.",
      ok: vibes.length > 0,
      body: (
        <div className="grid gap-2">
          {VIBES.map((v, i) => (
            <Option key={v.label} on={vibes.includes(i)} onClick={() => setVibes(flip(vibes, i))}>
              <span className="text-sm">{v.label}</span>
            </Option>
          ))}
        </div>
      ),
    },
    {
      title: "Qual lugar do Recife tem mais a sua cara?",
      help: "Escolha um.",
      ok: place !== null,
      body: (
        <div className="grid gap-2" role="radiogroup">
          {PLACES.map((p) => (
            <Option key={p.id} on={place === p.id} onClick={() => setPlace(p.id)}>
              <span className="text-sm">{p.label}</span>
            </Option>
          ))}
        </div>
      ),
    },
    {
      title: "Que assuntos te interessam?",
      help: "Opcional. Escolha quantos quiser.",
      ok: true,
      body: (
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <Option key={t} round on={topics.includes(t)} onClick={() => setTopics(flip(topics, t))}>
              {TOPIC_LABEL[t] ?? t}
            </Option>
          ))}
        </div>
      ),
    },
    {
      title: "Algo que ajude você no evento?",
      help: "Opcional. Usamos para indicar atividades com esses recursos.",
      ok: true,
      body: (
        <>
          <div className="flex flex-wrap gap-2">
            {NEEDS.map((t) => (
              <Option key={t} round on={needs.includes(t)} onClick={() => setNeeds(flip(needs, t))}>
                {t}
              </Option>
            ))}
          </div>
          <label className="mt-5 block text-sm font-semibold text-gray-700">
            Como podemos te chamar? <span className="font-normal text-gray-500">(opcional)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome ou apelido"
              autoComplete="given-name"
              className="mt-1.5 w-full rounded-xl bg-white p-3 text-base font-normal ring-1 ring-black/10"
            />
          </label>
        </>
      ),
    },
  ][step];

  const last = step === STEPS - 1;
  const optionalEmpty = (step === 3 && !topics.length) || (step === 4 && !needs.length && !name.trim());
  const next = () => (last ? onDone(profileFromQuiz({ mobilities, vibes, place, topics, needs, name })) : setStep(step + 1));

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5" aria-label="Diagnóstico de perfil">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-semibold">
          Pergunta {step + 1} de {STEPS}
        </span>
        {onCancel && (
          <button type="button" onClick={onCancel} className="underline">
            Cancelar
          </button>
        )}
      </div>
      <div className="mt-2 flex gap-1" aria-hidden>
        {Array.from({ length: STEPS }, (_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-[#f26b1d]" : "bg-gray-200"}`} />
        ))}
      </div>

      <h2 ref={titleRef} tabIndex={-1} className="mt-4 text-lg font-bold leading-snug outline-none">
        {q.title}
      </h2>
      <p className="mb-3 text-sm text-gray-600">{q.help}</p>
      {q.body}

      <div className="mt-5 flex gap-2">
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)} className="rounded-full bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-700">
            Voltar
          </button>
        )}
        <button
          type="button"
          disabled={!q.ok}
          onClick={next}
          className="flex-1 rounded-full bg-[#123b8c] py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          {last ? "Ver meu perfil ✨" : optionalEmpty ? "Pular" : "Continuar"}
        </button>
      </div>
      {step === 0 && <p className="mt-3 text-center text-xs text-gray-500">Leva 1 minuto. Sem login: as respostas ficam só no seu celular.</p>}
    </section>
  );
}
