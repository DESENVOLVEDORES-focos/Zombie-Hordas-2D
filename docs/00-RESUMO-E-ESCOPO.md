# RESUMO EXECUTIVO E ESCOPO FECHADO

> Documento 1 de 6. É a **fonte da verdade** do escopo. Origem: briefing do dono do projeto +
> entrevista de decisões. Se algo não está aqui ou no doc 04, não existe.

---

## 1. O jogo em uma frase

**HORDAS** é um jogo 2D **top-down 90°** de sobrevivência contra hordas de zumbis, com visual
**cartoon splatter** (cores vivas, contorno grosso, sangue exagerado e divertido). Você começa com uma
pistola e 100 de vida numa laje de telhado; cada horda só termina quando o **último zumbi cai**; cada
abate paga **moedas**, e moedas compram **armas na parede**, **munição**, **barricadas de madeira** e
**torretas** que os zumbis podem destruir. A dificuldade sobe devagar por 40+ hordas, e cada partida dura
**20–30 minutos**. Entre partidas, **almas** compram melhorias permanentes no **lobby**.

**Identidade própria, não cópia.** A referência é o *gênero* (survival-horde topdown com economia e
defesas construídas). Nomes, mapas, interface, perks, armas, zumbis e curvas de dificuldade são deste
projeto. Nada de reaproveitar mapa, layout de HUD, nome de perk ou texto de outro jogo — ver seção 8.

---

## 2. Decisões travadas (não reabrir sem pedido explícito do dono)

| Tema | Decisão |
|---|---|
| **Plataforma** | HTML5 + JavaScript + **Canvas 2D puro**; abre com **duplo-clique no `index.html`** |
| **Arte** | **100% procedural** — zero imagem, zero CDN, zero fonte externa. Tudo desenhado com `ctx.*` |
| **Áudio** | **100% procedural** com WebAudio — zero arquivo |
| **Dependências** | **Zero**: sem npm, sem engine, sem bundler, sem `fetch` |
| **Câmera** | Topdown 90° ortográfico, **sem rotação**, segue o jogador com amortecimento |
| **Tom visual** | **Cartoon splatter**: saturado, contorno 2px, sombra chapada, sangue vivo e divertido |
| **Mira** | Retículo com **auto-aim** no alvo mais próximo; **botão direito = foco manual** (+15% dano, −50% dispersão, −20% velocidade) |
| **Tiro** | **Manual** (segurar botão esquerdo) ou **auto-fire** ligável na config. Sempre gasta munição |
| **Hordas** | Por **abate total**: acaba quando morre o último zumbi. Contador `restam 12` no HUD |
| **Curva** | 1–10 básico · 11–20 quantidade · 21–30 resistência · 31–40 especiais · 40+ caos (doc 04) |
| **Duração** | **20–30 min** por partida; horda 30 ≈ minuto 22 |
| **Mapa inicial** | **Telhados** — os outros 5 aparecem no lobby como *EM BREVE* (cadeado) |
| **Moedas** | **2 moedas**: **Moeda** (cai de zumbi, gasta na partida) e **Alma** (meta, gasta no lobby) |
| **Loja na partida** | **Pontos de compra no mapa** (parede): arma, munição, upgrade, barricada, torreta |
| **Barricada** | Comprada e plantada em **vagas marcadas**; custo progressivo (50, 80, 90, 100, 110…); 600 HP; zumbi ataca; reparável |
| **Torreta** | Plantada em vaga; custo progressivo; mira e atira sozinha; 400 HP; munição limitada com recarga paga |
| **Lobby** | **Menu com cards** (criar/entrar partida, mapa, config, loja). Hub andável = backlog |
| **Multiplayer** | **Não agora**, mas o código nasce pronto: `players[]`, dano por `playerId`, estado serializável |
| **Vida** | 100 HP; regenera após 5 s sem levar dano; solo = 0 HP é game over |
| **Vitória** | Não existe. Objetivo = **recorde de horda / tempo / abates** |

---

## 3. Prioridade de desenvolvimento (ordem do dono, respeitada)

O briefing manda **mapas primeiro**. O Marco 1 é um "andar e explorar" jogável — parece pouco, mas é o
que garante que o mapa 2 ao 6 custem horas, não semanas.

| # | Entrega | Marco |
|---|---|---|
| 1 | Estrutura 2D topdown, game loop, câmera | M1 |
| 2 | Movimentação + colisão com paredes/obstáculos | M1 |
| 3 | **Sistema de mapas como DADOS** + carregador + colisão derivada | M1 |
| 4 | **Lobby com seleção de mapa** (Telhados liberado, resto com cadeado) | M1 |
| 5 | **Mapa Telhados completo e bonito** | M1 |
| 6 | Hordas por abate total + spawn + IA básica | M2 |
| 7 | 7 tipos de zumbi + escalonamento por faixa | M2 |
| 8 | Moedas + pontos de compra (armas, munição, upgrade) | M2 |
| 9 | Barricadas (custo progressivo, HP, quebra, reparo) | M2 |
| 10 | Torretas (alcance, munição, HP, destruição) | M2 |
| 11 | 7 armas com pente/recarga/precisão + troca de slot | M2 |
| 12 | Perks por XP (cartas na horda) | M2 |
| 13 | **Lobby completo + Almas + loja permanente** | M3 |
| 14 | Polimento: juice, áudio, telas, performance, acessibilidade | M3 |
| 15 | *Multiplayer real* | Backlog (doc 05) |

---

## 4. Os 3 marcos (definição de pronto)

### MARCO 1 — Base + Mapas
Jogador andando e colidindo, câmera suave, **mapa Telhados montado por dados**, lobby com seleção de
mapa (5 bloqueados), carregamento com fade, HUD mínimo e um zumbi-andante de teste (sem combate).

**Pronto quando:** abro o jogo, escolho Telhados, ando o mapa inteiro sem atravessar parede, volto ao
lobby — e criar um mapa novo exige editar **só** `maps.js`.

### MARCO 2 — O jogo
Hordas por abate total nas 5 faixas, 7 zumbis, moedas, compra na parede, barricadas, torretas, 7 armas
com recarga, perks por XP, HUD completo, game over com resumo.

**Pronto quando:** uma partida chega à horda 15 sem bug, com barricada quebrando, torreta atirando,
arma comprada e recarregando, e dinheiro acabando.

### MARCO 3 — Lobby, meta e polimento
Lobby completo (criar/entrar preparado pra MP), Almas, loja permanente, juice, áudio, telas,
performance com 150 zumbis vivos (stress 300) a 60 FPS, acessibilidade, e `docs/MAPAS.md` ensinando a
criar mapa novo.

**Pronto quando:** checklist do doc 02 seção 12 100% marcado e um mapa novo sai em <1h seguindo o guia.

---

## 5. Regras de ouro

1. **Mapa é dado, não código.** Sem `if (mapId === 'telhados')` dentro do engine.
2. **Estado serializável.** Sem função/referência de canvas dentro do estado da partida (é o que permite
   multiplayer depois sem reescrever).
3. **Nunca O(n²).** Grid espacial de 80px para zumbi↔zumbi, tiro↔zumbi, torreta↔zumbi.
4. **Números vêm do doc 04.** Mudou o balanceamento? Muda lá primeiro.
5. **Zero assets.** Precisa de imagem? Desenha. Precisa de som? Sintetiza.
6. **60 FPS** com 150 zumbis vivos (e 300 em modo stress) é requisito.
7. **pt-BR** na interface e nos comentários; identificadores em inglês.
8. **Um commit por marco**: `feat: marco 1 - base e mapas`, `feat: marco 2 - hordas economia e defesas`,
   `feat: marco 3 - lobby meta e polimento`.

---

## 6. Fora de escopo (não fazer mesmo sobrando tempo)

- ❌ Multiplayer online real (só a prontidão no código)
- ❌ Backend, login, banco de dados, save em nuvem
- ❌ Mapas 2 a 6 (só Telhados; os outros ficam bloqueados)
- ❌ Hub andável (bunker) — só menu
- ❌ Editor visual de mapa — o editor é o `maps.js`
- ❌ Mobile touch-first (só não pode quebrar)
- ❌ Imagens geradas, sprites externos, música licenciada
- ❌ Reproduzir nomes, mapas, HUD ou perks de jogos existentes

---

## 7. Como ler o resto do pacote

| Doc | Use quando |
|---|---|
| `01-GDD.md` | entender a experiência, tom, telas e cada sistema em prosa |
| `02-ESPECIFICACAO-TECNICA.md` | implementar: arquitetura, **formato de mapa**, loop, IA, grid, performance, checklists |
| `03-PROMPT-PRONTO.md` | **o prompt que você cola no chat de IA** (é o único que precisa ser enviado) |
| `04-BALANCEAMENTO.md` | precisar de qualquer número (zumbi, horda, arma, custo, alma) |
| `05-IDEIAS.md` | depois do jogo pronto: mapas 2+, MP, chefe, modos |

---

## 8. Guarda-corpo de originalidade (obrigatório)

Vale para toda a equipe e para a IA que implementa:

1. **Referência é gênero, não jogo.** "Survival por hordas com economia e defesas" é gênero. "Mapa X de
   tal jogo", "perk com o mesmo nome", "HUD igual" não é.
2. **Nome próprio em tudo.** Moeda = *Moeda*; meta-moeda = *Alma*; armas têm nomes fictícios
   (doc 04); perks têm nomes deste projeto; zumbis idem.
3. **Nenhum mapa copiado.** O Telhados nasce de um croqui próprio (doc 02, seção 6), com paleta e props
   definidos aqui.
4. **Curva própria.** A progressão de dificuldade é a do doc 04 (suave por 5 faixas), não a de outro jogo.
5. **Se uma mecânica só existe em um jogo específico**, ela entra redesenhada e renomeada — ou não entra.
6. **Nada de marca registrada** em texto, som ou interface. Sem "rounds", sem "Perk-a-Cola", sem
   "Mystery Box" como nome: aqui é *Horda*, *Refresco* é opcional e se chamaria *Tônico*, a caixa se
   chama **Caixa Cega** (e está no backlog, doc 05).
