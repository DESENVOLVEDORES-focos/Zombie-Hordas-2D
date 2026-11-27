# HORDAS — manual completo de desenvolvimento

Jogo 2D **top-down 90°** de sobrevivência contra hordas de zumbis: moedas por abate, armas compráveis no
mapa, barricadas e torretas construídas em vagas, 6 tipos de zumbi, 4 mapas e dificuldade que sobe devagar
por 40+ hordas. HTML5 + Canvas 2D puro, zero dependências, arte e áudio **100% procedurais**.

> **Papéis:** o dono do projeto **comanda**; um agente de IA **executa**; este repositório é o **contrato**
> entre os dois. Nada aqui é código de jogo — é especificação suficiente para o executor não ter que
> adivinhar nada.

---

## Como usar (o único caminho)

1. Abra um chat novo no **Arena em modo agent**, **a partir deste repositório**.
2. Copie **todo** o bloco da seção 1 de **[`docs/03-PROMPT-MESTRE.md`](docs/03-PROMPT-MESTRE.md)** e cole.
3. O agente lê os documentos sozinho e começa pelo **MARCO 1**.
4. A cada entrega, mande **um** marco: `Siga para o MARCO 2.` → `3` → `4` → `5`.
5. Antes de aceitar cada marco, rode o checklist correspondente em
   [`docs/14-TESTES-E-ACEITE.md`](docs/14-TESTES-E-ACEITE.md).

Nunca mande dois marcos numa mensagem. Nunca aceite entrega sem o relatório no formato do doc 15.

---

## Os 16 documentos

### Contrato
| # | Documento | Para quê |
|---|---|---|
| 01 | [Especificação original](docs/01-ESPECIFICACAO-ORIGINAL.md) | **A base**: seu texto, reproduzido. Não editar. |
| 00 | [Ordem de comando](docs/00-ORDEM-DE-COMANDO.md) | Escopo travado, 25 arquivos, 5 marcos, 14 regras invioláveis |
| 03 | [**Prompt mestre**](docs/03-PROMPT-MESTRE.md) | **O único texto que você cola no chat** + mensagens de correção |

### Especificação técnica (o detalhe que faltava)
| # | Documento | Para quê |
|---|---|---|
| 02 | [Arquitetura](docs/02-ARQUITETURA.md) | Namespaces, loop, flow field, colisão, render, áudio, save |
| 06 | [Config schema](docs/06-CONFIG-SCHEMA.md) | O conteúdo **exato** de `js/config.js` |
| 07 | [Jogador e combate](docs/07-ESPEC-JOGADOR-COMBATE.md) | Input, movimento, 6 armas, disparo, projétil, dano, recarga |
| 08 | [Zumbis e IA](docs/08-ESPEC-ZUMBIS-IA.md) | Flow field passo a passo, máquina de estados, os 6 tipos |
| 09 | [Hordas e economia](docs/09-ESPEC-HORDAS-ECONOMIA.md) | Fases, escalonamento, moedas, placas de compra |
| 10 | [Barricadas e torretas](docs/10-ESPEC-DEFESAS.md) | Construção, custos, HP, alvo, disparo, regras que o teste prova |
| 11 | [Interface e telas](docs/11-ESPEC-INTERFACE-TELAS.md) | Cada tela, cada botão, cada configuração |
| 12 | [Render e áudio](docs/12-ESPEC-RENDER-AUDIO.md) | Como desenhar sem asset e sintetizar os 18 sons |
| 13 | [Os 4 mapas](docs/13-ESPEC-MAPAS.md) | Layout conceitual de Telhados, Metrô, Hospital, Escola |
| 14 | [Testes e aceite](docs/14-TESTES-E-ACEITE.md) | `tools/sim.js`, 10 invariantes, checklists por marco |
| 15 | [Ordem de execução](docs/15-ORDEM-DE-EXECUCAO.md) | Folha de serviço: o que escrever em cada arquivo, em que ordem |

### Números e conteúdo
| # | Documento | Para quê |
|---|---|---|
| 04 | [Balanceamento](docs/04-BALANCEAMENTO.md) | 6 armas, 6 zumbis, curva de hordas, custos progressivos |
| 05 | [Mapas e backlog](docs/05-MAPAS-E-BACKLOG.md) | Receita de mapa novo em 30 min + o que fica para depois |

---

## Decisões travadas

| Tema | Decisão |
|---|---|
| Plataforma | HTML5 + JS + **Canvas 2D puro**; roda com duplo-clique no `index.html` |
| Dependências / assets | **Zero** — arte e áudio sintetizados em código |
| Modularidade | **um arquivo por sistema** (25 arquivos), scripts clássicos, números só em `js/config.js` |
| Câmera | topdown 90° ortográfico, sem rotação, com amortecimento |
| Navegação | **flow field** de 50 px — zumbi nunca preso, nunca em parede |
| Hordas | por **abate total**, `RESTAM N`, trégua de 6 s |
| Curva | 70% quantidade/variedade + 30% vida/dano, cap de 12× — **sem esponja de balas** |
| Economia | moedas na partida + almas no lobby |
| Defesas | 8 vagas de barricada (600 HP) e 5 de torreta (340 px) por mapa |
| Mapas | **4 jogáveis**, todos com validação automática no load |
| Multiplayer | **fora do escopo** (botão explica honestamente); arquitetura pronta |
| Fora de escopo | rede/backend/login, assets externos, mobile touch-first, cópia de franquia |

---

## Os 5 marcos

| Marco | Entrega | Aceite |
|---|---|---|
| **1** | base jogável + Telhados | anda 30 s sem atravessar parede, 10 abates, console limpo |
| **2** | hordas + 6 zumbis + pathfinding | nenhum zumbi preso ou em parede em 10 min de sim |
| **3** | economia + defesas + 6 armas | compra negada sem dinheiro; torreta respeita alcance e parede |
| **4** | telas, áudio, configurações | nenhum botão morto; config tem efeito real e persiste |
| **5** | Metrô, Hospital, Escola | 4 mapas jogáveis; 5º mapa em < 30 min |

---

## O que esperar da partida

| Hordas | Sensação |
|---|---|
| 1–10 | "fácil, juntando moeda e comprando a primeira arma" |
| 11–20 | frenético entra; tanque, explosivo e cuspidor obrigam a sair do canto |
| 21–30 | rastejante passa pela barricada; defesa vira gestão de recurso |
| 30+ | 2 torretas e 3 barricadas já não bastam |

Partida casual: 15–25 min. Horda 10 em ~7 min com 800–1.200 moedas.
