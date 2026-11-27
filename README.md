# HORDAS — pacote de desenvolvimento

Jogo **original** de sobrevivência 2D **top-down 90°** contra hordas de zumbis: economia de moedas dentro
da partida, **barricadas** e **torretas** construídas no mapa, **7 armas** com pente e recarga, hordas por
**abate total** que escalam devagar por 40+ ondas, e **almas** que compram melhorias permanentes no lobby.
Runs de **20–30 minutos**.

**HTML5 + Canvas 2D puro.** Zero dependências. Zero assets: arte e áudio são 100% procedurais, gerados por
código. Abre com **duplo-clique no `index.html`**.

> Este repositório contém o **pacote de instruções** para uma IA (Arena, modo agent) construir o jogo —
> ainda não contém o jogo. O prompt para colar está em `docs/03-PROMPT-PRONTO.md`.

---

## Como começar (3 passos)

1. Abra um **novo chat no Arena em modo agent**, de preferência **a partir deste repositório** (assim a IA
   lê o `docs/` sozinha).
2. Copie o bloco da **seção 4.1 de [`docs/03-PROMPT-PRONTO.md`](docs/03-PROMPT-PRONTO.md)** e cole.
3. A cada resposta, mande **um** marco: `Siga para o MARCO 2.` → `Siga para o MARCO 3.`

Não mande dois marcos na mesma mensagem: a IA costuma simplificar o segundo.

---

## Documentos

| Arquivo | Para que serve |
|---|---|
| [`docs/00-RESUMO-E-ESCOPO.md`](docs/00-RESUMO-E-ESCOPO.md) | Escopo fechado, decisões travadas, prioridade (mapas primeiro), 3 marcos, regras de ouro, **guarda-corpo de originalidade** |
| [`docs/01-GDD.md`](docs/01-GDD.md) | Design: tom cartoon splatter, câmera, controles, hordas, economia, barricadas, torretas, armas, perks, **croqui do mapa Telhados**, paleta, áudio, telas |
| [`docs/02-ESPECIFICACAO-TECNICA.md`](docs/02-ESPECIFICACAO-TECNICA.md) | Implementação: arquitetura, **formato de mapa em dados**, colisão, IA, grid, render, save, performance, casos de borda, **checklists de aceite por marco** |
| [`docs/03-PROMPT-PRONTO.md`](docs/03-PROMPT-PRONTO.md) | **O prompt que você cola** + mensagens de socorro (performance, visual, dificuldade, mapa novo) |
| [`docs/04-BALANCEAMENTO.md`](docs/04-BALANCEAMENTO.md) | A planilha única: jogador, 7 armas, 7 zumbis, curva por 5 faixas, barricada, torreta, perks, almas, loja, recordes |
| [`docs/05-IDEIAS.md`](docs/05-IDEIAS.md) | Backlog com esforço × impacto: mapas 2–6, defesas extras, chefes, coop, hub, roadmap de 6 sessões |

---

## Decisões travadas

| Tema | Decisão |
|---|---|
| Plataforma | HTML5 + JS + **Canvas 2D puro**; roda em `file://` |
| Dependências / assets | **Zero** — arte e áudio 100% procedurais |
| Câmera | Topdown 90° ortográfico, sem rotação, com amortecimento |
| Tom | **Cartoon splatter** (saturado, contorno 2px, sangue divertido) |
| Mira | Auto-aim + **foco manual** no botão direito |
| Hordas | **Abate total** (acaba quando morre o último), 6 s de trégua entre elas |
| Dificuldade | 5 faixas: 1–10 base · 11–20 quantidade · 21–30 resistência · 31–40 especiais · 40+ caos |
| Economia | **Moeda** (na partida) + **Alma** (meta, no lobby) |
| Defesas | 7 vagas de barricada (600 HP, custo 50→130) e 4 de torreta (340 px, 400 HP) |
| Mapas | **Telhados** jogável; Metrô, Hospital, Escola, Instalações, Zona Urbana com cadeado |
| Multiplayer | Não agora — mas `players[]`, dano por `playerId` e estado serializável desde o dia 1 |
| Fora de escopo | Rede/login/backend, mapas 2+, hub andável, editor visual, mobile touch-first |

---

## Os 3 marcos

| Marco | Entrega | Pronto quando |
|---|---|---|
| **1. Base + Mapas** | estrutura, câmera, movimentação, colisão, **sistema de mapas em dados**, Telhados completo, lobby com seleção | ando o mapa inteiro sem atravessar parede e criar mapa novo mexe só no `maps.js` |
| **2. O jogo** | hordas por abate total, 7 zumbis, moedas, compras na parede, barricadas, torretas, 7 armas, perks, game over | uma run chega à horda 15 com barricada quebrando e torreta atirando |
| **3. Lobby + meta + polimento** | almas, loja permanente, recordes, config, áudio, juice, performance, `docs/MAPAS.md` | checklist do doc 02 seção 12 100% e mapa novo em <1h |

---

## O que esperar de uma run

| Hordas | Sensação |
|---|---|
| 1–10 | "fácil, tô juntando moeda" |
| 11–20 | "tá vindo mais... preciso comprar algo" |
| 21–30 | "esse tanque não morre" |
| 31–40 | "o que É isso?" (especiais entram) |
| 40+ | colapso — a morte vira recorde |

Casual: 12–20 min. Boa: 25–35 min.
