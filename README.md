# Rota Livre — POC Ideathon P&D / REC'n'Play

Check-in de contexto por **tag NFC** + agente de mobilidade e acessibilidade para o Bairro do Recife.

📚 Documentação completa (pesquisa, arquitetura, tags, painel, custos, pitch e roadmap) em [`docs/`](docs/README.md).

## Rodar

```bash
npm install
cp .env.example .env.local   # opcional: GEMINI_API_KEY e SUPABASE_* (sem elas: modo regras + estado em memória)
npm run dev                   # http://localhost:3000
```

## Telas

| Rota | O quê |
|---|---|
| `/` | Agora: recomendações e programação ao vivo com a lotação em forma de "bateria" |
| `/t/<id>` | O que abre ao encostar o celular na tag: você está aqui, guia do patrimônio, sala lotada → alternativas, agente |
| `/mapa` | Mapa de calor + rota por perfil de mobilidade (piso liso × paralelepípedo × degraus) |
| `/agente` | Chat (texto e voz). O botão 🎙️ flutuante abre a "chamada" com cota de 3 min a cada 2 h |
| `/perfil` | 7 contas demo + autodiagnóstico (Chico Science, Ariano, Nassau, Paulo Freire, Naná, Clarice) |
| `/org` | Painel da organização: mapa de calor, destaque de polos vazios, auto-equilíbrio, check-ins ao vivo, relógio da simulação |
| `/tags` | Gravar e ler as tags pelo Chrome Android (Web NFC) ou copiar a URL para o app NFC Tools |

## Arquitetura de custo

- **Sem IA (custo zero, roda no aparelho):** rotas (Dijkstra com peso de piso, degraus e multidão por perfil), lotação, recomendações e a distribuição de fluxo — tudo em `src/lib/engine.ts`.
- **Roteador econômico:** perguntas com intenção clara (rota, banheiro, embarque) são respondidas por `agent-fallback.ts` sem chamar a IA.
- **IA só para conversa aberta:** Gemini 3.5 Flash-Lite (`GEMINI_MODEL` permite trocar), que conversa e chama as ferramentas determinísticas. Sem internet, cai para as regras.

## Supabase

```bash
supabase link --project-ref <ref-do-recpass>
supabase db push
```

## Tags

NTAG213: cada tag guarda só `https://<domínio>/t/<id>`. O significado de cada id fica em `TAGS` (`src/lib/data.ts`).

## Limitações da POC

- A programação, a lotação e as coordenadas são simuladas ou aproximadas.
- O estado compartilhado usa o Supabase quando `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão definidos (migração em `supabase/migrations`). Sem elas, fica em memória. A atualização é por polling a cada 3 s; o próximo passo é o Realtime.
- A cota de voz é controlada no navegador. Em produção precisa ser no servidor, por usuário.
