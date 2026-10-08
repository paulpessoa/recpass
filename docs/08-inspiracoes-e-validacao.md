# 08 — Inspirações e validação de campo

## Validação de campo (8/out/2026)

Percorremos o Bairro do Recife **de manhã e à tarde**, cronometrando o tempo e contando os passos entre os polos do festival. O objetivo era comparar o que o mapa promete com o que o corpo sente: calor, multidão, paralelepípedo, degraus.

> Preencha com os números que vocês mediram. Eles alimentam a matriz de tempos do app (`EDGES`, em `src/lib/data.ts`) e dão base ao pitch.

| Trecho | Passos | Tempo (manhã) | Tempo (tarde) | O que observamos |
|---|---|---|---|---|
| NERD → Paço do Frevo | [preencher] | [preencher] | [preencher] | [piso, sombra, multidão] |
| Paço do Frevo → Cais do Sertão | [preencher] | [preencher] | [preencher] | |
| Cais do Sertão → Paço Alfândega | [preencher] | [preencher] | [preencher] | |
| Paço Alfândega → Moinho | [preencher] | [preencher] | [preencher] | |
| Dentro do Moinho (pátio → 3º andar, ala sul) | [preencher] | [preencher] | [preencher] | [elevador × escada] |

**Teste de guerrilha no almoço:** [preencher: quantas pessoas, o que entenderam ao encostar o celular, frases marcantes].

## Inspirações

### 1. Danish Architecture Centre (DAC), Copenhague
Visitei o DAC, o centro dinamarquês de arquitetura, no edifício BLOX, à beira do porto. A lição: arquitetura e cidade são, antes de tudo, **experiência de quem circula**, e não apenas forma. A cidade boa é a que se explica sozinha para quem chega. → É o que buscamos ao dar contexto em cada porta do Recife Antigo.

### 2. As tampas das ruas históricas de Segóvia
Em Segóvia, na Espanha, as tampas de água e de eletricidade nas ruas históricas recebem **o mesmo revestimento de pedra do calçamento original**. A infraestrutura moderna está lá, mas some na paisagem. → É a lógica das nossas tags NFC: uma camada digital que **não altera a fachada nem o piso tombados** e que convive com o IPHAN em vez de brigar com ele.

### 3. Citymapper nos metrôs antigos da França
Nas estações antigas, confusas e cheias de corredores de Paris, o Citymapper dizia **qual saída pegar e em que vagão embarcar**, ou seja, a orientação do último metro, e não só do quarteirão. → É o nível de detalhe que queremos: "pegue o elevador do hall central até o 3º andar, ala sul".

### 4. O atendente remoto na rodoviária de Valladolid (2021)
Na rodoviária de Valladolid, um atendente apareceu na tela da máquina de passagens, vindo de uma central remota. Conversei com ele, passei o cartão, e **a própria máquina emitiu a passagem**. Atendimento humano à distância e ação física no local. → É a inspiração do nosso modelo híbrido: a tag dá o contexto, o agente de IA atende primeiro, e um humano (central ou equipe do evento) entra quando precisa.

### 5. *Making Matter* — dar valor ao que já existe
> ⚠️ Antes de citar no pitch, confirmar o título exato, o autor e a edição do livro.

A ideia central é **trabalhar com o material e o lugar que já existem**, recuperando e valorizando em vez de demolir e começar do zero. No RecPass ela aparece em dois lugares:
- **Perfis de usuário:** os arquétipos do diagnóstico vêm da cultura local (Chico Science, Ariano Suassuna, Nassau, Paulo Freire, Naná Vasconcelos, Clarice Lispector). A identidade do participante se conecta à memória da cidade.
- **História das edificações:** ao encostar o celular, o modo guia conta em 30 segundos a história do prédio (o telégrafo que virou Paço do Frevo, o convento que virou Alfândega, o armazém que virou Cais do Sertão). A tecnologia serve para **ler** o patrimônio, não para competir com ele.

### 6. *Don't Make Me Think* — Steve Krug
A interface tem que ser óbvia. **Encostar e pronto**: sem baixar app, sem login, sem digitar onde você está. O diagnóstico é feito em 4 toques, numa conversa, e não num formulário.

## Por que tag e não GPS
- **Bateria:** o GPS ligado o tempo todo é um dos recursos que mais consomem bateria do celular, e num festival de dia inteiro a bateria é ouro. O RecPass **não usa GPS**: a posição vem da última tag lida.
- **Precisão:** entre casarões altos, o sinal de GPS rebate e erra o quarteirão. A tag diz exatamente "você está na escadaria do Paço Alfândega".
- **Rede:** o app é um PWA instalável e abre sem internet, depois da primeira visita. Isso importa porque, no fim do evento, a rede de celular satura.
