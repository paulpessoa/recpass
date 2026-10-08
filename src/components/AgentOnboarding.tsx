"use client";

import { useState } from "react";
import { MOBILITY_LABEL, PERSONAS, type Mobility } from "@/lib/data";
import { profileFromPersona, type Profile } from "@/lib/engine";
import { PLACES, TOPICS, VIBES, profileFromQuiz, toggleMobility } from "@/lib/quiz";

// Primeira conversa com o agente: o diagnóstico de perfil, em botões (sem IA, custo zero).
type Step = "mob" | "vibe" | "place" | "topics";

const Bubble = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-[88%] rounded-2xl bg-card px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-white/10">{children}</div>
);
const Mine = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-end">
    <div className="max-w-[88%] rounded-2xl bg-accent px-3.5 py-2.5 text-sm text-background">{children}</div>
  </div>
);
const Chip = ({ on, onClick, children }: { on?: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${on ? "bg-accent text-background ring-accent" : "bg-card ring-white/10"}`}>
    {children}
  </button>
);

export function AgentOnboarding({ intro, onDone }: { intro?: string; onDone: (p: Profile, viaDemo: boolean) => void }) {
  const [step, setStep] = useState<Step>("mob");
  const [mobilities, setMobilities] = useState<Mobility[]>([]);
  const [vibes, setVibes] = useState<number[]>([]);
  const [place, setPlace] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const done: Step[] = [];
  if (step !== "mob") done.push("mob");
  if (step === "place" || step === "topics") done.push("vibe");
  if (step === "topics") done.push("place");

  const finish = () => onDone(profileFromQuiz({ mobilities, vibes, place, topics, needs: [] }), false);

  return (
    <div className="space-y-3">
      <Bubble>
        {intro ?? "Oi! Antes de tudo, me conta rapidinho como você vai curtir o festival — são 4 toques e eu acerto bem mais nas rotas e sugestões."}
      </Bubble>

      <Bubble>
        <b>1. Como você vai circular hoje?</b> <span className="text-muted">(marque tudo o que se aplica)</span>
      </Bubble>
      {done.includes("mob") ? (
        <Mine>{mobilities.map((m) => `${MOBILITY_LABEL[m].icon} ${MOBILITY_LABEL[m].label}`).join(" + ")}</Mine>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(Object.keys(MOBILITY_LABEL) as Mobility[]).map((m) => (
            <Chip key={m} on={mobilities.includes(m)} onClick={() => setMobilities(toggleMobility(mobilities, m))}>
              {MOBILITY_LABEL[m].icon} {MOBILITY_LABEL[m].label}
            </Chip>
          ))}
          <button disabled={!mobilities.length} onClick={() => setStep("vibe")} className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-background disabled:opacity-40">
            Pronto →
          </button>
        </div>
      )}

      {step !== "mob" && (
        <>
          <Bubble>
            <b>2. Num festival, você é de…</b> <span className="text-muted">(pode marcar mais de uma)</span>
          </Bubble>
          {done.includes("vibe") ? (
            <Mine>{vibes.map((i) => VIBES[i].label).join(" · ")}</Mine>
          ) : (
            <div className="flex flex-wrap gap-2">
              {VIBES.map((v, i) => (
                <Chip key={v.label} on={vibes.includes(i)} onClick={() => setVibes(vibes.includes(i) ? vibes.filter((x) => x !== i) : [...vibes, i])}>
                  {v.label}
                </Chip>
              ))}
              <button disabled={!vibes.length} onClick={() => setStep("place")} className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-background disabled:opacity-40">
                Pronto →
              </button>
            </div>
          )}
        </>
      )}

      {(step === "place" || step === "topics") && (
        <>
          <Bubble>
            <b>3. Escolha um lugar do Recife</b>
          </Bubble>
          {done.includes("place") ? (
            <Mine>{PLACES.find((p) => p.id === place)?.label}</Mine>
          ) : (
            <div className="flex flex-wrap gap-2">
              {PLACES.map((p) => (
                <Chip
                  key={p.id}
                  onClick={() => {
                    setPlace(p.id);
                    setStep("topics");
                  }}
                >
                  {p.label}
                </Chip>
              ))}
            </div>
          )}
        </>
      )}

      {step === "topics" && (
        <>
          <Bubble>
            <b>4. O que te interessa?</b> <span className="text-muted">(opcional)</span>
          </Bubble>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <Chip key={t} on={topics.includes(t)} onClick={() => setTopics(topics.includes(t) ? topics.filter((x) => x !== t) : [...topics, t])}>
                {t}
              </Chip>
            ))}
            <button onClick={finish} className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-background">
              Ver meu perfil ✨
            </button>
          </div>
        </>
      )}

      <details className="text-xs text-muted">
        <summary className="cursor-pointer">Pular e usar uma conta demo</summary>
        <div className="mt-2 flex flex-wrap gap-2">
          {PERSONAS.map((p) => (
            <Chip key={p.id} onClick={() => onDone(profileFromPersona(p), true)}>
              {p.avatar} {p.name}
            </Chip>
          ))}
        </div>
      </details>
    </div>
  );
}
