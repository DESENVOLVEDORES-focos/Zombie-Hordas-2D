# HORDAS 2D — pacote de briefing

Survival infinito de hordas de zumbis, **visão topdown 90°**, em HTML5 + Canvas 2D puro, com
**arte e áudio 100% procedurais** (zero assets externos).

> **Este repositório não contém o jogo ainda.** Ele contém o **pacote de instruções** para uma IA
> (Arena em modo agent) construir o jogo. O briefing, os números e o prompt colável estão em `docs/`.

---

## Como usar (3 passos)

1. **Abra um novo chat no Arena em modo agent**, de preferência **a partir deste repositório**
   (assim o `docs/` já vem junto).
2. Copie o bloco de **[`docs/03-PROMPT-PRONTO.md`](docs/03-PROMPT-PRONTO.md)** → seção 3.1 e cole.
3. A cada resposta dela, mande **um** marco: "Siga para o Marco 2.", "Siga para o Marco 3."

O prompt já manda a IA **ler os outros documentos sozinha** — você não precisa colar todos.

---

## Documentos

| Arquivo | Para que serve |
|---|---|
| [`docs/00-ORDEM-EXECUCAO.md`](docs/00-ORDEM-EXECUCAO.md) | A ordem: escopo fechado, 3 marcos, regras não negociáveis, estrutura de arquivos, definição de pronto. |
| [`docs/01-GDD.md`](docs/01-GDD.md) | Design: fantasia central, câmera, controles, sistemas, 7 zumbis + boss, 4 habilidades, arte procedural, áudio, telas, anti-metas. |
| [`docs/02-ESPECIFICACAO-TECNICA.md`](docs/02-ESPECIFICACAO-TECNICA.md) | Implementação: arquitetura, estruturas de dados, ordem do loop, grid espacial, sprites pré-renderizados, save, performance, juice, **checklists de aceite por marco**. |
| [`docs/03-PROMPT-PRONTO.md`](docs/03-PROMPT-PRONTO.md) | **O prompt para colar** + mensagens de acompanhamento (performance, visual, rebalanceamento). |
| [`docs/04-BALANCEAMENTO.md`](docs/04-BALANCEAMENTO.md) | Planilha única de números: jogador, zumbis, ondas, XP, 24 melhorias, habilidades, loot, loja, recordes. |
| [`docs/05-IDEIAS.md`](docs/05-IDEIAS.md) | Backlog com esforço × impacto: armas, zumbis extras, modos (coop local!), eventos, meta-progressão, apresentação, roadmap de 6 sessões. |

---

## Decisões já fechadas (não precisa decidir de novo)

| Tema | Decisão |
|---|---|
| Plataforma | HTML5 + JS + **Canvas 2D puro**, roda com **duplo-clique no `index.html`** |
| Dependências | **Zero** (sem npm, sem CDN, sem biblioteca) |
| Arte | **100% procedural** (desenhada por código; sprites pré-renderizados em canvas offscreen) |
| Áudio | **WebAudio procedural** (sem arquivos) |
| Câmera | Topdown 90° ortográfico, **sem rotação**, arena fechada de 3200×3200 |
| Loop | **Survival infinito**, ondas de 35s com escalonamento sem teto, boss a cada 5 ondas |
| Combate | **Tiro automático** (o desafio é posicionamento, não mira) |
| Progressão | Melhorias por nível (24 cartas, máx. 5) + **almas** persistentes na loja |
| Escopo proibido | Multiplayer online, login, backend, Supabase, mobile touch-first, save em nuvem |

---

## O que esperar de uma run

| Tempo | Sensação |
|---|---|
| 0–3 min | controle, aprendendo a kitar |
| 5 min | **primeiro boss** e a primeira habilidade bem usada |
| 6–12 min | build toma forma, tela cheia, caos controlado |
| 12 min+ | colapso — a morte vira pontuação |

Run casual: 6–10 min. Run boa: 14–22 min.
