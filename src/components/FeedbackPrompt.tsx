"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocation, useProfile } from "@/lib/client";
import { profileMobility } from "@/lib/engine";

// Pesquisa rápida para os profissionais que testam o app no congresso.
// Abre sozinha depois de AUTO_AFTER segundos de uso (uma vez só), pelo botão 📝 ou com ?feedback=1 na URL.

const AUTO_AFTER = 150;
const KEY_STATUS = "recpass:feedback"; // "enviado" | "adiado"
const KEY_USED = "recpass:feedback-used"; // segundos de uso com a aba visível

const LIKED = ["Tag NFC", "Lotação (bateria)", "Rotas acessíveis", "Alternativas", "Agente", "Diagnóstico", "Mapa", "História dos prédios", "Voz"];
const AREAS = ["Tecnologia", "Design / UX", "Acessibilidade", "Gestão pública", "Cultura / Turismo", "Mobilidade urbana", "Educação / Pesquisa", "Outra"];
const WOULD_USE = [
  { v: "sim", label: "Sim" },
  { v: "talvez", label: "Talvez" },
  { v: "nao", label: "Não" },
] as const;

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

export function FeedbackPrompt() {
  const path = usePathname();
  const [profile] = useProfile();
  const [loc] = useLocation();
  // Só monta depois de `mounted` (AppShell), então `location` existe aqui.
  const [open, setOpen] = useState(() => new URLSearchParams(location.search).get("feedback") === "1");
  const [sent, setSent] = useState(false);

  // Abre sozinha depois de alguns minutos de uso (só na primeira vez).
  useEffect(() => {
    if (read(KEY_STATUS)) return;
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const used = Number(read(KEY_USED) ?? 0) + 10;
      write(KEY_USED, String(used));
      if (used >= AUTO_AFTER && !read(KEY_STATUS)) {
        write(KEY_STATUS, "adiado");
        setOpen(true);
      }
    }, 10000);
    return () => {
      clearInterval(id);
    };
  }, []);

  const close = () => {
    if (!read(KEY_STATUS)) write(KEY_STATUS, "adiado");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Dar feedback sobre o app"
        className="fab fixed bottom-20 left-1/2 z-[1001] -ml-[176px] flex h-14 w-14 flex-col items-center justify-center rounded-full bg-card text-xl text-accent shadow-lg ring-1 ring-white/10 sm:-ml-[206px]"
      >
        📝<span className="text-[9px] font-bold leading-none">Feedback</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/50 sm:items-center" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fb-title"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-5 text-foreground shadow-xl sm:rounded-3xl"
          >
            {sent ? (
              <Thanks onClose={() => setOpen(false)} />
            ) : (
              <FeedbackForm
                onCancel={close}
                onSent={() => {
                  write(KEY_STATUS, "enviado");
                  setSent(true);
                }}
                context={{
                  path,
                  venueId: loc?.venueId,
                  tagId: loc?.tagId,
                  archetypeId: profile?.archetypeId,
                  personaId: profile?.personaId,
                  mobilities: profile ? profileMobility(profile) : [],
                  usedSeconds: Number(read(KEY_USED) ?? 0),
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Thanks({ onClose }: { onClose: () => void }) {
  return (
    <div className="py-6 text-center">
      <div className="text-5xl">🙌</div>
      <h2 className="mt-3 text-lg font-bold">Obrigado pelo feedback!</h2>
      <p className="mt-1 text-sm text-muted">Ele vai direto para o time do RecPass. Pode continuar explorando o app.</p>
      <button onClick={onClose} className="mt-5 w-full rounded-2xl bg-accent py-3 font-bold text-background">
        Voltar ao app
      </button>
    </div>
  );
}

function FeedbackForm({ onCancel, onSent, context }: { onCancel: () => void; onSent: () => void; context: Record<string, unknown> }) {
  const [rating, setRating] = useState(0);
  const [recommend, setRecommend] = useState<number | null>(null);
  const [wouldUse, setWouldUse] = useState<string | null>(null);
  const [liked, setLiked] = useState<string[]>([]);
  const [missing, setMissing] = useState("");
  const [area, setArea] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [canContact, setCanContact] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggle = (x: string) => setLiked((l) => (l.includes(x) ? l.filter((y) => y !== x) : [...l, x]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rating, recommend, wouldUse, liked, missing, area, role, name, contact, canContact: canContact && !!contact, context }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      onSent();
    } catch (err) {
      console.error("feedback não enviado", err);
      setErrorMsg(err instanceof Error ? err.message : null);
      setStatus("error");
    }
  }

  const chip = (on: boolean) =>
    `rounded-full px-3 py-1.5 text-sm ring-1 ${on ? "bg-accent text-background ring-accent" : "bg-card text-foreground/85 ring-white/20"}`;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="fb-title" className="text-lg font-bold">
            O que achou do RecPass?
          </h2>
          <p className="text-sm text-muted">1 minuto. Só a nota é obrigatória.</p>
        </div>
        <button type="button" onClick={onCancel} aria-label="Fechar" className="rounded-full px-2 text-2xl leading-none text-muted">
          ×
        </button>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Nota geral *</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} de 5`}
              aria-pressed={rating === n}
              className={`text-4xl transition ${n <= rating ? "" : "opacity-25 grayscale"}`}
            >
              ⭐
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">De 0 a 10, quanto recomendaria a um colega?</legend>
        <div className="grid grid-cols-11 gap-1">
          {Array.from({ length: 11 }, (_, n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRecommend(n)}
              aria-pressed={recommend === n}
              className={`rounded-lg py-2 text-sm font-semibold ring-1 ${recommend === n ? "bg-accent text-background ring-accent" : "ring-white/20"}`}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Usaria no REC&apos;n&apos;Play?</legend>
        <div className="flex gap-2">
          {WOULD_USE.map((o) => (
            <button key={o.v} type="button" onClick={() => setWouldUse(o.v)} aria-pressed={wouldUse === o.v} className={chip(wouldUse === o.v)}>
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">O que mais chamou atenção?</legend>
        <div className="flex flex-wrap gap-2">
          {LIKED.map((x) => (
            <button key={x} type="button" onClick={() => toggle(x)} aria-pressed={liked.includes(x)} className={chip(liked.includes(x))}>
              {x}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">O que faltou, confundiu ou você mudaria?</span>
        <textarea
          value={missing}
          onChange={(e) => setMissing(e.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full rounded-xl border border-white/20 p-3 text-sm"
          placeholder="Ex.: não entendi a bateria, queria ver o banheiro acessível mais perto…"
        />
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Sua área</legend>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((x) => (
            <button key={x} type="button" onClick={() => setArea(area === x ? null : x)} aria-pressed={area === x} className={chip(area === x)}>
              {x}
            </button>
          ))}
        </div>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          maxLength={120}
          className="mt-2 w-full rounded-xl border border-white/20 p-3 text-sm"
          placeholder="Cargo ou empresa (opcional)"
        />
      </fieldset>

      <fieldset className="space-y-2 rounded-2xl bg-white/10 p-3">
        <legend className="sr-only">Contato (opcional)</legend>
        <p className="text-sm font-semibold">Quer acompanhar o projeto? (opcional)</p>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className="w-full rounded-xl border border-white/20 p-3 text-sm" placeholder="Nome" />
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          maxLength={160}
          className="w-full rounded-xl border border-white/20 p-3 text-sm"
          placeholder="E-mail ou WhatsApp"
        />
        <label className="flex items-start gap-2 text-xs text-muted">
          <input type="checkbox" checked={canContact} onChange={(e) => setCanContact(e.target.checked)} className="mt-0.5" />
          Autorizo o time do RecPass a me contatar sobre o projeto. Os dados ficam só com o time e não são compartilhados.
        </label>
      </fieldset>

      {status === "error" && (
        <p role="alert" className="text-sm text-red-400">
          Não consegui enviar. Confira a internet e tente de novo.
          {errorMsg && <span className="mt-1 block text-xs text-red-400">Detalhe: {errorMsg}</span>}
        </p>
      )}

      <button
        type="submit"
        disabled={!rating || status === "sending"}
        className="w-full rounded-2xl bg-accent py-3 font-bold text-background disabled:opacity-40"
      >
        {status === "sending" ? "Enviando…" : rating ? "Enviar feedback" : "Escolha uma nota para enviar"}
      </button>
    </form>
  );
}
