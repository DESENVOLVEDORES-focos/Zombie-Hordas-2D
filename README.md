# HORDAS — pacote de comando

Jogo 2D **top-down 90°** de sobrevivência contra hordas de zumbis: moedas por abate, **armas compráveis**
no mapa, **barricadas** e **torretas** construídas em vagas, 6 tipos de zumbi e dificuldade que sobe
devagar por 40+ hordas. HTML5 + Canvas 2D puro, zero dependências, arte e áudio **100% procedurais**.

> **Este repositório é o pacote de comando, não o jogo.** O dono do projeto comanda; um agente de IA
> executa no chat. Aqui estão a especificação, as decisões travadas, a arquitetura, os números e o
> prompt que você cola.

---

## Papéis

| Quem | Faz o quê |
|---|---|
| **Você (comandante)** | define o que quer, aprova, cobra. Não coda. |
| **Agente (executor)** | implementa marco por marco, testa e relata. Não decide escopo. |
| **Este pacote** | o contrato entre os dois: evita retrabalho, decisão repetida e "IA inventou". |

---

## Como usar (3 passos)

1. Abra um chat novo no **Arena em modo agent**, de preferência **a partir deste repositório**.
2. Cole o bloco da **seção 4.1 de [`docs/03-PROMPT-EXECUCAO.md`](docs/03-PROMPT-EXECUCAO.md)**.
3. A cada entrega, mande **um** marco: `Siga para o MARCO 2.` → `MARCO 3` → `MARCO 4` → `MARCO 5`.

Nunca mande dois marcos numa mensagem: o segundo sai simplificado.

---

## Documentos

| Arquivo | Papel |
|---|---|
| [`docs/01-ESPECIFICACAO-ORIGINAL.md`](docs/01-ESPECIFICACAO-ORIGINAL.md) | **A base**: sua especificação completa, reproduzida. Não editar. |
| [`docs/00-ORDEM-DE-COMANDO.md`](docs/00-ORDEM-DE-COMANDO.md) | **Manda**: escopo travado, decisões, estrutura de 25 arquivos, 5 marcos com critério de aceite, regras anti-desperdício |
| [`docs/02-ARQUITETURA.md`](docs/02-ARQUITETURA.md) | Como implementar: namespaces, loop, **flow field** (zumbi não trava), colisão, render, áudio, configs, teste automatizado |
| [`docs/03-PROMPT-EXECUCAO.md`](docs/03-PROMPT-EXECUCAO.md) | **O prompt para colar** + mensagens de correção (IA travando zumbi, performance, botão morto, balanceamento) |
| [`docs/04-BALANCEAMENTO.md`](docs/04-BALANCEAMENTO.md) | Os números: 6 armas, 6 zumbis, curva de hordas, custos progressivos, almas |
| [`docs/05-MAPAS-E-BACKLOG.md`](docs/05-MAPAS-E-BACKLOG.md) | Como criar mapa novo em 30 min (o "expansível" da spec) + o que fica para depois |

---

## Decisões travadas

| Tema | Decisão |
|---|---|
| Plataforma | HTML5 + JS + **Canvas 2D puro**, roda com duplo-clique no `index.html` |
| Dependências / assets | **Zero** — arte e áudio sintetizados em código |
| Modularidade | **um arquivo por sistema** (~25 arquivos), scripts clássicos, números só em `js/config.js` |
| Câmera | topdown 90° ortográfico, sem rotação, segue o jogador |
| Navegação | **flow field** em grade de 50 px — nenhum zumbi preso, nenhum zumbi em parede |
| Hordas | por **abate total**, contador `RESTAM N`, trégua 6 s |
| Curva | 70% quantidade/variedade + 30% vida/dano, **sem esponja de balas** |
| Economia | moedas na partida (abate) + almas no lobby (meta) |
| Defesas | barricadas em vagas (custo 50→120, 600 HP) e torretas (400→850, 340 px) |
| Mapas | **4 jogáveis**: Telhados, Metrô, Hospital, Escola |
| Multiplayer | **não agora** (botão existe e explica); arquitetura pronta (`players[]`) |
| Fora de escopo | rede/backend/login, assets externos, mobile touch-first, cópia de franquia |

---

## Os 5 marcos

| Marco | Entrega | Aceite |
|---|---|---|
| **1** | base jogável + Telhados | anda 30 s sem atravessar parede, 10 abates, console limpo |
| **2** | hordas + 6 zumbis + pathfinding | nenhum zumbi preso ou em parede; 15 hordas sem erro |
| **3** | economia + barricadas + torretas + 6 armas | compra negada sem dinheiro; barricada quebra; torreta respeita alcance |
| **4** | lobby, telas, áudio, configs | nenhum botão morto; config tem efeito real; save persiste |
| **5** | Metrô, Hospital, Escola | 4 mapas jogáveis; 5º mapa em < 30 min |

---

## O que esperar da partida

| Hordas | Sensação |
|---|---|
| 1–10 | "fácil, tô juntando moeda e comprando a primeira arma" |
| 11–20 | frenético entra: "tá vindo mais e mais rápido" |
| 15–20 | tanque, explosivo e cuspidor: você precisa sair do canto |
| 21–30 | rastejante passa pela barricada; a defesa vira gestão |
| 30+ | 2 torretas e 3 barricadas já não bastam |

Partida casual: 15–25 min.
