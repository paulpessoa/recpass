"use client";

import { useEffect } from "react";

// Tela de erro própria: mostra a causa real (em vez do genérico "This page couldn't load") para diagnóstico no celular.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("RecPass error boundary", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-bold">Ops, algo travou aqui 😕</h1>
      <p className="text-sm text-gray-600">Seu perfil e sua posição continuam salvos no celular.</p>
      <div className="flex gap-2">
        <button onClick={reset} className="rounded-full bg-[#123b8c] px-4 py-2 text-sm font-bold text-white">
          Tentar de novo
        </button>
        {/* recarga completa de propósito: sai de qualquer estado quebrado */}
        <button onClick={() => window.location.assign("/")} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold">
          Ir para o início
        </button>
      </div>
      <details open className="rounded-xl bg-gray-100 p-3 text-xs text-gray-700">
        <summary className="cursor-pointer font-semibold">Detalhes para a equipe (tire um print)</summary>
        <p className="mt-2 break-words font-mono">{error.name}: {error.message}</p>
        {error.digest && <p className="mt-1 font-mono">digest: {error.digest}</p>}
        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[10px]">{error.stack?.split("\n").slice(0, 8).join("\n")}</pre>
      </details>
    </div>
  );
}
