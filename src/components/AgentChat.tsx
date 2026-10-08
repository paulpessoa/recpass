"use client";

import { useEffect, useRef, useState } from "react";
import { activityById, type Mobility } from "@/lib/data";
import { askAgent, speak, useLocation, useProfile, useShared, type ChatMsg } from "@/lib/client";
import { computeRoute, venueHeat } from "@/lib/engine";
import { ActivityCard } from "./ActivityCard";
import { RouteSummary } from "./RouteSummary";

type Msg = ChatMsg;

const CHIPS = ["Tá lotado, e agora?", "O que combina comigo agora?", "Como chego no Moinho?", "Quero ir embora", "Onde tem fraldário?"];

type SpeechRec = { lang: string; interimResults: boolean; onresult: (e: { results: { 0: { transcript: string } }[] }) => void; onend: () => void; start: () => void };

export function AgentChat({ greeting, initialQuestion }: { greeting?: string; initialQuestion?: string | null }) {
  const { state, at } = useShared();
  const [profile] = useProfile();
  const [loc] = useLocation();
  const [msgs, setMsgs] = useState<Msg[]>(() => (greeting ? [{ role: "assistant", content: greeting }] : []));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voicePick, setVoice] = useState<boolean | null>(null);
  const voice = voicePick ?? profile?.mobility === "visual";
  const endRef = useRef<HTMLDivElement>(null);
  const asked = useRef(false);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs, busy]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const history: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(history);
    setInput("");
    setBusy(true);
    const reply = await askAgent(history, profile, loc?.venueId ?? null);
    setMsgs((m) => [...m, reply]);
    setBusy(false);
    if (voice) speak(reply.content);
  }

  useEffect(() => {
    if (initialQuestion && !asked.current) {
      asked.current = true;
      send(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  function listen() {
    const W = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return alert("Seu navegador não suporta reconhecimento de voz.");
    const rec = new Ctor();
    rec.lang = "pt-BR";
    rec.interimResults = false;
    rec.onresult = (e) => send(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }

  const mobility: Mobility = profile?.mobility ?? "padrao";

  return (
    <div className="flex flex-col">
      <div className="space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === "user" ? "bg-[#123b8c] text-white" : "bg-white shadow-sm ring-1 ring-black/5"}`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.role === "assistant" && (
                <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                  <button onClick={() => speak(m.content)} aria-label="Ouvir resposta">
                    🔊 ouvir
                  </button>
                  {m.mode && <span>· {m.mode === "ia" ? "agente IA" : m.mode === "offline" ? "modo offline" : "modo econômico"}</span>}
                </div>
              )}
            </div>
            {m.cards && m.cards.length > 0 && (
              <div className="mt-2 space-y-2">
                {m.cards.map((c, j) => {
                  if (c.type === "activity") {
                    const a = activityById(c.id);
                    return a ? <ActivityCard key={j} a={a} state={state} at={at} profile={profile} from={loc?.venueId} balanced={c.balanced} /> : null;
                  }
                  const r = computeRoute(c.from, c.to, mobility, (id) => venueHeat(id, state, at));
                  return <RouteSummary key={j} route={r} mobility={mobility} />;
                })}
              </div>
            )}
          </div>
        ))}
        {busy && <div className="w-16 animate-pulse rounded-2xl bg-white px-3 py-2 text-sm shadow-sm">…</div>}
        <div ref={endRef} />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {CHIPS.map((c) => (
          <button key={c} onClick={() => send(c)} className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-medium ring-1 ring-black/10">
            {c}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-2 flex items-center gap-2"
      >
        <button type="button" onClick={listen} className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${listening ? "bg-red-600 text-white" : "bg-white ring-1 ring-black/10"}`} aria-label="Falar">
          🎙️
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte ou peça uma rota…"
          className="h-11 min-w-0 flex-1 rounded-full bg-white px-4 text-sm ring-1 ring-black/10"
        />
        <button type="submit" className="h-11 shrink-0 rounded-full bg-[#f26b1d] px-4 text-sm font-bold text-white">
          Enviar
        </button>
      </form>
      <label className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
        <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} /> Ler respostas em voz alta
      </label>
    </div>
  );
}
