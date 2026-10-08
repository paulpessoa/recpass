# 05 — Custos e negócio

> Estimativas de ordem de grandeza para o pitch. Revisar com os números reais de uso depois do piloto.

## Princípio: algoritmo primeiro, IA só quando precisa

| Camada | Exemplos | Custo por uso |
|---|---|---|
| Algoritmo no aparelho | rota adaptada, lotação, recomendações, filtros, mapa | **R$ 0** |
| Roteador econômico | "como chego no Moinho?", "banheiro", "quero ir embora" | **R$ 0** |
| Agente com IA (Claude Haiku 5.5) | conversa aberta, montar perfil conversando, dúvidas compostas | ~US$ 0,001 por resposta |
| Voz | reconhecimento e fala do navegador | **R$ 0** (o que custa é a IA, e a cota limita o uso) |

O Haiku 5.5 custa US$ 0,10 por milhão de tokens de entrada e US$ 0,50 por milhão de saída. Uma resposta típica usa cerca de 6.500 tokens de entrada (prompt, ferramentas, histórico e resultados) e uns 500 de saída, o que dá **cerca de US$ 0,0009**.

## Cenário: 100 mil participantes em 4 dias

| Premissa | Valor |
|---|---|
| Usam o agente com IA | 30% (30 mil pessoas) |
| Respostas de IA por pessoa | 6 |
| Total | cerca de 180 mil respostas, ≈ **US$ 160 (cerca de R$ 900)** |
| Pior caso com voz (todos usando a cota inteira) | ≈ US$ 2–4 mil, e a cota é o teto |
| Infraestrutura (Vercel Pro e Supabase Pro) | ≈ US$ 45 por mês |
| Tags (300 pontos × R$ 1–2) | ≈ R$ 600 |

## Comparação sem o agente

| Alternativa | Custo estimado | Alcance |
|---|---|---|
| 20 orientadores humanos × 10 h × 4 dias × R$ 25/h | ≈ **R$ 20 mil** | 20 pontos fixos, horário limitado |
| Totens com tela | dezenas de milhares de reais, além do problema com o IPHAN | poucos pontos |
| **Rota Livre** | ≈ **R$ 2–5 mil** no total | todos os pontos com tag, 24 h, em Libras, por voz e por texto |

## Modelo de receita

- **Cota de patrocínio ESG:** "Mobilidade Livre por Empresa X". Empresas do Porto Digital pagam a IA e a operação em troca de associar a marca à inclusão. Faixa de referência: R$ 15–30 mil por edição.
- **Licença para outros eventos e centros históricos:** Carnaval do Recife, São João de Caruaru, Olinda.
- **Legado para a cidade:** matrizes de origem e destino de pedestres e mapa das barreiras físicas, entregues à Prefeitura, à CTTU e à Secretaria de Planejamento.

## Retorno para o festival

- Menos salas vazias enquanto outras lotam, o que significa mais conteúdo consumido.
- Menos frustração na porta, que é a dor mais citada nas entrevistas.
- Um indicador de acessibilidade mensurável e coerente com o discurso de "cidade inteligente" do festival.
