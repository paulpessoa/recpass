# 09 — Estado atual e próximos passos

*Atualizado em 08/out/2026, madrugada antes do 2º dia do Ideathon. Ler isto antes de retomar o projeto.*

## Onde está tudo

| O quê | Onde |
|---|---|
| App em produção | https://recpass.vercel.app (deploy automático a cada push na `main`) |
| Código | github.com/paulpessoa/recpass (público) · pasta local `ideathon/rota-livre` (o nome antigo ficou na pasta) |
| Banco | Supabase, projeto **recpass**: tabelas `festival_settings`, `venue_boosts` e `tag_taps`. A integração com o GitHub aplica as migrações da `main` |
| IA | **OpenAI `gpt-4.1-mini`** (troque com `OPENAI_MODEL`), chave `OPENAI_API_KEY` na Vercel e no `.env.local`. O Gemini continua como alternativa automática quando não há chave da OpenAI (`src/lib/llm.ts`) |
| Slides do pitch | Artifact "RecPass — Pitch Ideathon P&D" no claude.ai (13 slides, roteiro nas notas) |
| Docs | `docs/01`–`08`: pesquisa, arquitetura, tags, painel, custos, pitch, roadmap, inspirações |

## O que já funciona

- **Tag NFC:** `/t/<id>` mostra o "você está aqui", a lotação em bateria, alternativas se lotou, o acesso universal (escadaria, elevador, escada rolante), a história do prédio (modo guia) e o agente.
- **Motor sem IA:** rotas por perfil de mobilidade (múltipla escolha, com os pesos somados), lotação simulada, recomendações e distribuição de fluxo.
- **Agente:**
  - Começa pelo **diagnóstico em 4 toques**, sem IA: arquétipos Chico Science, Ariano, Nassau, Paulo Freire, Naná e Clarice.
  - Um roteador econômico responde o óbvio sem IA; o Gemini fica só para conversa aberta.
  - Cada resposta termina com atalhos para a lista filtrada (`/?ids=`) e para o mapa.
- **Voz:** chamada flutuante com cota de 3 min a cada 2 h (controlada no navegador). O VLibras foi removido por enquanto.
- **Painel `/org`:** mapa de calor, destaque de polos vazios (só reordena o que já combina com o perfil), auto-equilíbrio, check-ins ao vivo e relógio da simulação.
- **Tags `/tags`:** gravar, ler e **limpar** pelo Chrome Android. As NTAG213 são regraváveis; nunca use "Bloquear tag" no NFC Tools.
- **PWA:** instalável, abre sem internet. O app **não usa GPS**: a posição vem da última tag lida.

## Decisões tomadas (e o porquê)

- **Algoritmo primeiro, IA só na conversa:** o custo fica previsível para 50 a 100 mil pessoas (cerca de R$ 3 mil com IA, contra uns R$ 20 mil com orientadores humanos; ver doc 05).
- **OpenAI `gpt-4.1-mini` (8/out):** o Gemini parou por um problema de faturamento na conta Google. No teste, o mini acertou mais que o `gpt-4.1-nano` (2,6 s, mas com erros) e responde em cerca de 6 s com duas chamadas de ferramenta. O provedor é escolhido pela chave presente. Anthropic não, por escolha do Paul.
- **Sem login:** o perfil fica no celular (localStorage), e a tag só diz *onde*, nunca *quem*. **Não usar IP para identificar pessoas:** o IP é compartilhado (CGNAT, Wi-Fi do evento) e muda; usá-lo mostraria dados de uma pessoa para outra. Frase do pitch: *"privacidade desde o desenho"*.
- **Cada tag guarda só um ID:** o significado fica no servidor, e dá para mudá-lo sem regravar a tag.
- **Painel ético:** nunca esconde atividade, mostra o selo 🌿 e só reordena o que já combina pelo menos 50% com o perfil.

## Pendências para completar (sem inventar dados)

- [ ] **Números da caminhada de campo** (passos e minutos de manhã e à tarde): `docs/08` e slide 4 do deck, onde está `[__]`.
- [ ] **Resultado do teste no almoço:** quantas pessoas e frases marcantes, também no doc 08 e no slide 4.
- [x] *Making Matter What Too Often Does Not Matter*: Søren Pihlmann e Adam Dickinson, 2025, Pavilhão da Dinamarca em Veneza, encomendado pelo DAC (ver doc 08).
- [ ] Confirmar que o DAC fica no edifício BLOX.
- [ ] Coordenadas e acessos reais dos polos. Hoje são aproximados; o Moinho e o Cais do Sertão foram ajustados pelo relato do Paul.
- [ ] Decidir se a pasta local muda de `rota-livre` para `recpass`.

## Teste com usuários reais amanhã (NERD)

**Preparação**
1. Gravar as tags pelo `/tags`: `paco-frevo`, `paco-alfandega-escadaria`, `moinho-andar-3`, `cais-sertao` e `nerd-terreo`.
2. No `/org`, colocar o relógio em **14:25** e clicar em *Resetar*.
3. Instalar o PWA num Android de teste e conferir se o "This page couldn't load" sumiu (a correção já está no ar).

**Roteiro com cada pessoa (5 minutos)**
1. Sem explicar nada, entregar o celular e pedir: "encoste nessa tag".
2. Observar: ela entende o "você está aqui"? E a bateria de lotação?
3. Pedir o diagnóstico com o agente: ela conclui os 4 toques? O que acha do arquétipo?
4. Perguntar "tá lotado, e agora?": ela usa os botões "Ver na lista" e "Abrir no mapa"?
5. Perguntas finais: "Usaria no REC'n'Play? O que faltou? Instalaria na tela inicial?"

**O que anotar:** perfil da pessoa (idade, como chega ao evento, se tem alguma deficiência), onde travou, frases marcantes e tempo até entender. Depois, levar para o doc 08 e para o slide 4.

## Bugs em aberto

- **"This page couldn't load" (resolvido em 8/out).** O console mostrava `Uncaught TypeError: i is not a function` num arquivo minificado, ao navegar depois de vários deploys com a aba aberta. Causa: a aba antiga misturava código de duas versões. Correção: `deploymentId` no `next.config.ts` (usa o `VERCEL_DEPLOYMENT_ID`), que faz a aba recarregar a página inteira quando a versão muda. Por precaução, o VLibras também foi removido, e foram criados o `error.tsx` e o `global-error.tsx`, que mostram a mensagem real se algo quebrar.
- **`TypeError: i is not a function` (causa real, corrigida em 8/out):** o `useEffect(() => endRef.current?.scrollIntoView(...))` do `AgentChat` devolvia o retorno do `scrollIntoView`, que no Chrome novo do Android é uma **Promise**. O React a tratava como função de limpeza e quebrava ao chegar mensagem nova ou ao sair da página. Correção: usar chaves no efeito. **Regra:** nunca escrever `useEffect(() => algo())` sem chaves.
- **Gemini 429 / faturamento:** a conta Google está com problema de cobrança. Trocamos para a OpenAI. Quando resolver, dá para voltar ao Gemini removendo `OPENAI_API_KEY` da Vercel.

## Próximos passos de produto

**Limitar a IA (discutido, ainda não implementado)**
1. Teto geral de gasto no servidor, por hora e por dia; passou disso, o agente cai no modo regras. Configurar também um limite de gasto no Google Cloud.
2. Cota por aparelho no servidor, usando um ID anônimo e aleatório (por exemplo, 15 respostas a cada 2 h), mostrada na interface.
3. IA liberada só para quem está no evento: um passe assinado entregue ao ler uma tag, válido por 2 h. Exige URL assinada (HMAC) nas tags.
4. Login opcional (conta do REC'n'Play ou link mágico pelo Supabase Auth) **só para extras**, como mais minutos de voz e a agenda em vários aparelhos. Nunca obrigatório.
> Recomendação: implementar 1 e 2 antes da demo pública; 3 e 4 para o Demoday.

**Um motor, vários canais**
1. **Servidor MCP** (`/api/mcp`) com as 4 ferramentas que já existem. Funciona no Claude, nos apps do ChatGPT (que usam MCP) e no Gemini CLI. Vantagens: quem paga a IA é o assistente do usuário, e quem já tem o próprio assistente acessível não precisa aprender outra interface. Sem tag, a pessoa diz onde está.
2. App no ChatGPT com cartões visuais, para planejar antes de sair de casa.
3. App Gemini para o consumidor: verificar se aceita extensões de terceiros antes de prometer.
4. Alexa Skill, a menos prioritária: serve para planejar em casa ou em totens com voz, não para a rua.

**Outros:** programação real do festival, levantamento de piso com cadeirantes, Supabase Realtime no lugar do polling, cota de voz no servidor, QR Code impresso ao lado das tags como plano B, botão "Ler tag" dentro do app e ponto de encontro do grupo.
