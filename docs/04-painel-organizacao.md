# 04 — Painel da organização (`/org`)

É um "Waze do festival": ajuda a distribuir o público **sem passar por cima da escolha de ninguém**.

## O que o painel mostra

- **Indicadores:** check-ins por NFC nos últimos 15 minutos, quantos polos estão acima de 80%, ocupação média e uma estimativa de pessoas redistribuídas.
- **Mapa de calor** dos polos, com o destaque marcado por 🌿.
- **Sugestões do sistema:** quando um polo passa de 80%, o painel procura um polo abaixo de 55% com uma atividade parecida começando em breve, por exemplo "Paço do Frevo 84% → destacar Armazéns".
- **Lista de polos:** cada um com os botões *Destacar*, *Destacar +* e *Parar destaque*.
- **Auto-equilíbrio:** reduz automaticamente as sugestões para polos cheios e dá um empurrão nos vazios.
- **Relógio da simulação:** permite escolher o horário (10:00, 14:25, 17:30…) para a demo.

## Limites éticos

1. **Relevância vem primeiro:** o destaque só reordena sugestões que já combinam pelo menos 50% com o perfil. Ninguém recebe sugestão de algo que não lhe interessa.
2. **Nunca esconde nada:** a programação completa continua visível.
3. **Transparência:** a sugestão impulsionada aparece com o selo 🌿 "também ajuda a distribuir o público".
4. **Privacidade:** os dados são agregados por tag e por polo, sem rastreamento individual.

## Em produção

A lotação deixa de ser simulada e passa a vir de dados reais:
- check-ins por NFC e QR na porta das salas;
- contagem nas catracas;
- contagem anônima de dispositivos Wi-Fi;
- dados agregados das operadoras.

O painel também passa a receber os bloqueios da CTTU, com ajustes manuais da equipe.
