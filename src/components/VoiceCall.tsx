"use client";

import { useEffect, useRef, useState } from "react";
import { VOICE_QUOTA_MS, VOICE_WINDOW_MS, askAgent, speak, stopSpeaking, useLocation, useProfile, useVoiceQuota, type ChatMsg } from "@/lib/client";

type Phase = "listening" | "thinking" | "speaking";
type SpeechRec = {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  abort: () => void;
};

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const PHASE_UI: Record<Phase, { label: string; color: string }> = {
  listening: { label: "Ouvindo…", color: "#22c55e" },
  thinking: { label: "Pensando…", color: "#f26b1d" },
  speaking: { label: "Falando…", color: "#60a5fa" },
};

/** Botão flutuante + "chamada" por voz com o agente, limitada por cota (custo previsível). */
export function VoiceCall() {
  const [profile] = useProfile();
  const [loc] = useLocation();
  const { remainingMs, add, resetsAt } = useVoiceQuota();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("listening");
  const [heard, setHeard] = useState("");
  const [said, setSaid] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const active = useRef(false);
  const startedAt = useRef(0);
  const history = useRef<ChatMsg[]>([]);
  const rec = useRef<SpeechRec | null>(null);
  const budget = useRef(0);

  function end() {
    if (!active.current) return;
    active.current = false;
    rec.current?.abort();
    stopSpeaking();
    add(Date.now() - startedAt.current);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      const e = Date.now() - startedAt.current;
      setElapsed(e);
      if (e >= budget.current) {
        speak("Seu tempo de voz acabou por agora. Pode continuar pelo chat de texto, à vontade.");
        end();
      }
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function listen() {
    if (!active.current) return;
    const W = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) {
      setSaid("Seu navegador não tem reconhecimento de voz. Use o Chrome no Android ou o chat de texto.");
      return;
    }
    const r = new Ctor();
    let got = false;
    r.lang = "pt-BR";
    r.interimResults = false;
    r.onresult = (e) => {
      got = true;
      handle(e.results[0][0].transcript);
    };
    r.onerror = () => {};
    r.onend = () => {
      if (!got && active.current) setTimeout(listen, 250); // silêncio: continua ouvindo
    };
    rec.current = r;
    setPhase("listening");
    r.start();
  }

  async function handle(text: string) {
    setHeard(text);
    setPhase("thinking");
    history.current = [...history.current, { role: "user", content: text }];
    const reply = await askAgent(history.current, profile, loc?.venueId ?? null, true);
    if (!active.current) return;
    history.current = [...history.current, reply];
    setSaid(reply.content);
    setPhase("speaking");
    await speak(reply.content);
    listen();
  }

  async function start() {
    if (remainingMs <= 0) {
      setOpen(true);
      return;
    }
    budget.current = remainingMs;
    startedAt.current = Date.now();
    history.current = [];
    setElapsed(0);
    setHeard("");
    const hello = profile ? `Oi, ${profile.name.split(",")[0]}! Tô ouvindo. Pra onde você quer ir?` : "Oi! Tô ouvindo. Me diz como posso ajudar no festival.";
    setSaid(hello);
    active.current = true;
    setOpen(true);
    setPhase("speaking");
    await speak(hello);
    listen();
  }

  const left = active.current ? budget.current - elapsed : remainingMs;
  const ui = PHASE_UI[phase];

  return (
    <>
      <button
        onClick={start}
        className="fixed bottom-20 left-1/2 z-[1001] ml-[120px] flex h-14 w-14 items-center justify-center rounded-full bg-[#f26b1d] text-2xl text-white shadow-lg shadow-orange-900/30 sm:ml-[150px]"
        aria-label="Falar com o agente por voz"
      >
        🎙️
      </button>

      {open && (
        <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-between bg-gradient-to-b from-[#0b1f4d] to-[#123b8c] px-6 py-10 text-white">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-white/60">RecPass · chamada</p>
            <p className="mt-1 font-mono text-sm text-white/80">{remainingMs <= 0 && !active.current ? "sem minutos" : `${fmt(left)} restantes`}</p>
          </div>

          {remainingMs <= 0 && !active.current ? (
            <div className="max-w-xs text-center">
              <p className="text-lg font-semibold">Você usou seus {VOICE_QUOTA_MS / 60000} minutos de voz.</p>
              <p className="mt-2 text-sm text-white/70">
                Eles renovam {resetsAt ? `às ${new Date(resetsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : `a cada ${VOICE_WINDOW_MS / 3600000} h`}. O chat de texto continua liberado.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative grid h-44 w-44 place-items-center">
                <div className="absolute inset-0 animate-ping rounded-full opacity-25" style={{ background: ui.color }} />
                <div className="absolute inset-4 rounded-full opacity-40 blur-md" style={{ background: ui.color }} />
                <div className="relative grid h-28 w-28 place-items-center rounded-full text-4xl" style={{ background: ui.color }}>
                  {phase === "listening" ? "👂" : phase === "thinking" ? "💭" : "🗣️"}
                </div>
              </div>
              <p className="mt-6 text-lg font-semibold">{ui.label}</p>
              {heard && <p className="mt-4 max-w-xs text-center text-sm text-white/60">“{heard}”</p>}
              {said && <p className="mt-3 max-w-xs text-center text-base">{said}</p>}
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => (active.current ? end() : setOpen(false))}
              className="grid h-16 w-16 place-items-center rounded-full bg-red-600 text-2xl shadow-lg"
              aria-label="Encerrar chamada"
            >
              ✕
            </button>
            <p className="text-[11px] text-white/50">
              {VOICE_QUOTA_MS / 60000} min de voz a cada {VOICE_WINDOW_MS / 3600000} h · chat de texto ilimitado
            </p>
          </div>
        </div>
      )}
    </>
  );
}
