@AGENTS.md

# RecPass: notas para retomar o trabalho

POC do Ideathon P&D 2026 (REC'n'Play, Bairro do Recife): uma tag NFC abre `/t/<id>` com rota acessível, lotação, alternativas e um agente.

**Antes de qualquer coisa, leia `docs/09-estado-e-proximos-passos.md`.** Lá estão o estado atual, as decisões, as pendências e o roteiro de teste.

## Como trabalhar aqui

- **Stack:** Next.js 16 (App Router; leia `node_modules/next/dist/docs/` antes de usar uma API do Next), Tailwind 4, Leaflet, `@google/genai`, `@supabase/supabase-js`.
- **Princípio:** algoritmo primeiro, IA só na conversa. Rotas, lotação e recomendações ficam em `src/lib/engine.ts`, determinístico e testável. O agente (`src/app/api/agent`) só chama as ferramentas de `src/lib/agent-tools.ts`. Respostas óbvias saem de `src/lib/agent-fallback.ts`, sem IA.
- **Dados mock:** `src/lib/data.ts` (locais, ruas e tipos de piso, programação, contas demo, arquétipos, tags). Histórias dos prédios: `src/lib/heritage.ts`. Diagnóstico: `src/lib/quiz.ts`.
- **Estado compartilhado:** `src/lib/server-store.ts` usa o Supabase quando `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` existem; senão, a memória do servidor.
- **Tudo que depende de hora** só aparece depois de montar (`useMounted`), para evitar erro de hidratação. O VLibras e o service worker são injetados fora do React (`src/app/layout.tsx`).
- **Antes de commitar:** `npx tsc --noEmit && npx eslint src && npm run build`. O push na `main` publica na Vercel.

## Armadilhas do ambiente

- O terminal tem `GEMINI_API_KEY` e `SUPABASE_ACCESS_TOKEN` antigos (de outra conta, e a do Gemini está bloqueada) que se sobrepõem ao `.env` e ao login do CLI. Rode `unset GEMINI_API_KEY GOOGLE_API_KEY SUPABASE_ACCESS_TOKEN SUPABASE_PROJECT_REF` antes de subir o servidor local ou usar o CLI do Supabase.
- Use `npx vercel@latest`, porque o CLI global (v34) está velho.
- O repositório é **público**: nunca commitar chave, `.env*` (exceto `.env.example`) nem conversas e nomes reais de entrevistados.
- Pode haver outra sessão do Claude trabalhando na mesma pasta: confira `git status` antes de commitar e use `ListAgents`/`SendMessage` para combinar.
