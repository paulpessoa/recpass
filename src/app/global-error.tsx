"use client";

// Erro no layout raiz: substitui o genérico "This page couldn't load" e mostra a causa para diagnóstico.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#121212", color: "#F5F5F5", margin: 0 }}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: 24, minHeight: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
          <h1 style={{ fontSize: 22, margin: 0 }}>Ops, o RecPass travou 😕</h1>
          <p style={{ fontSize: 14, color: "#A3A3A3", margin: 0 }}>Seu perfil continua salvo no celular.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={reset} style={{ background: "#FFCC00", color: "#121212", border: 0, borderRadius: 999, padding: "8px 16px", fontWeight: 700 }}>
              Tentar de novo
            </button>
            {/* recarga completa de propósito: sai de qualquer estado quebrado */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ background: "#2a2a2a", color: "#F5F5F5", borderRadius: 999, padding: "8px 16px", fontWeight: 600, textDecoration: "none" }}>
              Ir para o início
            </a>
          </div>
          <pre style={{ fontSize: 11, background: "#1e1e1e", padding: 12, borderRadius: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 220, overflow: "auto" }}>
            {`${error.name}: ${error.message}${error.digest ? `\ndigest: ${error.digest}` : ""}\n${error.stack?.split("\n").slice(0, 8).join("\n") ?? ""}`}
          </pre>
        </div>
      </body>
    </html>
  );
}
