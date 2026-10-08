# 03 — Tags NFC

## Hardware

Etiquetas adesivas **NTAG213** (13,56 MHz), com 144 bytes de memória, o que é suficiente para uma URL de até cerca de 130 caracteres. O time tem 100.

## Regra principal: a tag guarda só um ID

Cada tag recebe apenas `https://<domínio>/t/<id>`. O que esse ID representa (local, andar, tipo de ponto, acessibilidade) fica no servidor (`TAGS` em `src/lib/data.ts`; depois, numa tabela no Supabase). Assim dá para mudar o significado de uma tag **sem regravá-la**.

## Como gravar

- **Android com Chrome:** abra `/tags`, toque em **Gravar** e encoste a tag nas costas do celular. Usa a Web NFC e exige HTTPS, ou seja, o app já publicado.
- **Qualquer celular:** use o app **NFC Tools**: *Escrever → Adicionar registro → URL* e cole o link copiado em `/tags`.
- **Na POC, não tranque as tags** (lock), para poder regravar. Em produção, proteja com senha ou tranque, porque uma tag em espaço público pode ser sobrescrita.

## Leitura

- iPhone XS ou mais novo lê em segundo plano, com a tela desbloqueada.
- Android lê com o NFC ligado.
- Em nenhum dos dois é preciso instalar app.

## Pontos da POC

| id | Ponto | Tipo |
|---|---|---|
| `nerd-terreo`, `nerd-andar-2`, `nerd-andar-3`, `nerd-auditorio` | NERD (4 andares, onde acontece o ideathon) | entrada e salas |
| `paco-frevo`, `cesar`, `moinho`, `caixa`, `armazens`, `casa-zero`, `marco-zero` | Polos do festival | entrada |
| `paco-alfandega-escadaria`, `porto-fachada`, `senai` | Fachadas tombadas com escadaria | ponto cego, indica o acesso universal |
| `embarque-norte`, `embarque-sul` | Pontos de embarque de app/táxi | embarque |
| `encontro-1` | Ponto de encontro do grupo | encontro |

## Montagem para o pitch

Um cartaz A3 com o mapa do Bairro do Recife e 3 tags coladas: Paço do Frevo, Moinho e a escadaria do Paço Alfândega. O jurado encosta o celular e vê a tela ao vivo.

## Segurança e privacidade

- Os check-ins são anônimos e agregados por tag. O campo `who` só existe na demo.
- Num deploy real, a URL leva um parâmetro assinado (HMAC) para impedir tags clonadas ou com conteúdo falso.
