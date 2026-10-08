"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ARCHETYPES, MOBILITY_LABEL, PERSONAS, archetypeById, mobilityText } from "@/lib/data";
import { useGuide, useProfile } from "@/lib/client";
import { profileFromPersona, profileMobility } from "@/lib/engine";
import { ProfileQuiz } from "@/components/ProfileQuiz";

export function PerfilClient({ startQuiz }: { startQuiz: boolean }) {
  const [profile, setProfile] = useProfile();
  const [guide, setGuide] = useGuide();
  const [quiz, setQuiz] = useState(startQuiz);

  const arch = archetypeById(profile?.archetypeId);

  if (quiz) {
    return (
      <AppShell title="Seu perfil em 1 minuto">
        <ProfileQuiz
          onDone={(p) => {
            setProfile(p);
            setQuiz(false);
            window.scrollTo({ top: 0 });
          }}
          onCancel={() => setQuiz(false)}
        />
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
              {profile.avatar} {profile.name} · {mobilityText(profileMobility(profile))}
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

      {profile ? (
        <button onClick={() => setQuiz(true)} className="mb-6 w-full rounded-2xl bg-white p-4 text-left text-sm ring-1 ring-black/5">
          <b className="block">🧬 Refazer meu diagnóstico</b>
          <span className="text-gray-500">5 perguntas rápidas. Substitui o perfil atual.</span>
        </button>
      ) : (
        <button onClick={() => setQuiz(true)} className="mb-6 w-full rounded-2xl bg-[#f26b1d] p-4 text-left text-white">
          <b className="block">🧬 Montar meu perfil (1 min)</b>
          <span className="text-sm opacity-90">5 perguntas rápidas. Descubra se você é Chico Science, Ariano Suassuna, Nassau…</span>
        </button>
      )}

      <label className="mb-6 flex items-center justify-between rounded-2xl bg-white p-4 text-sm ring-1 ring-black/5">
        <span>
          <b className="block">🎧 Modo guia do patrimônio</b>
          <span className="text-gray-500">Ao tocar numa tag, conta a história do prédio em 30s.</span>
        </span>
        <input type="checkbox" className="h-5 w-5" checked={guide} onChange={(e) => setGuide(e.target.checked)} />
      </label>

      <details className="mt-6 rounded-2xl bg-white p-4 text-sm ring-1 ring-black/5">
        <summary className="cursor-pointer font-semibold text-gray-600">Contas demo (só para apresentação)</summary>
      <div className="mt-3 space-y-2">
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
      </details>

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
