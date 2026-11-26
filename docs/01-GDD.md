# GDD — HORDAS 2D (documento de design)

> Documento 2 de 6. É o "porquê" e o "como se joga". O documento 04 tem os números.
> Se este documento e o 04 divergirem em número, **o 04 ganha** (ele é a planilha de balanceamento).

---

## 1. Fantasia central (o que o jogador deve sentir)

Você é a última pessoa viva numa cidade que virou cemitério. Não existe vitória — existe **quanto tempo
você aguenta** e **quão absurdo você fica antes de cair**. A curva emocional de uma partida:

| Tempo | Sensação | O que muda |
|---|---|---|
| 0–30s | "tranquilo, tô no controle" | 1 tipo de zumbi, ritmo baixo, você lê o mapa |
| 1–3 min | "tá apertando" | corredores aparecem, você começa a kitar (andar em círculo) |
| 3–6 min | "poderzinho" | 2º e 3º upgrades travaram o poder; você avança pra *dentro* da horda |
| 5 min | **pico de tensão** | primeiro BOSS; a tela enche, você usa dash pra sair vivo |
| 6–12 min | "build" | você escolheu um caminho (dano puro / crítico / tanque / área) e a tela vira caos |
| 12 min+ | "colapso" | a horda cresce mais rápido que você; a morte é questão de tempo e vira score |

**Regra de ouro:** o jogador nunca deve ficar sem algo pra fazer. Se não tem zumbi perto, tem XP pra
buscar, alma pra coletar, ou um upgrade esperando.

---

## 2. Câmera e leitura de tela (topdown 90°)

- **Visão 100% de cima, ortográfica, sem perspectiva, sem rotação.** Norte é sempre norte.
- Câmera **segue o jogador com suavização** (lerp 8–10/s) e um leve *look-ahead* na direção do mouse
  (máx. 40px) pra você ver pra onde está mirando.
- **Arena fechada de 3.200 × 3.200 px** com cerca visível nas bordas (evita fugir da horda e cria
  "cantos de morte"). O jogador é limitado pela borda; os zumbis também.
- **Chão procedural**: grade fina escura + manchas de sujeira e sangue geradas com seed fixa, para dar
  noção de movimento sem asset.
- **Regra de leitura**: o jogador é o único objeto **azul-ciano com contorno claro**; zumbis são
  **verdes/terrosos**; projéteis do jogador são **amarelo-brancos**; projéteis inimigos são
  **verde-ácido**. Nunca usar a cor do jogador em inimigo.
- UI fica em **camadas fixas** (HUD não treme junto com o screen shake; só o mundo treme).

---

## 3. Controles

| Ação | Teclado/Mouse | Alternativa |
|---|---|---|
| Mover | WASD / setas | — |
| Mirar | Mouse | automático no alvo mais próximo se mouse parado |
| Atirar | **Automático** (sempre) | clique esquerdo segurado = "foco" (reduz spread, +10% dano) |
| Habilidade 1 — Dash | Espaço ou Shift | — |
| Habilidade 2 — Onda de choque | Q | — |
| Habilidade 3 — Granada incendiária | E | — |
| Habilidade 4 — Fúria | R | — |
| Escolher melhoria | clique / 1-2-3 / ←→ + Enter | — |
| Pausa | Esc ou P | volta ao jogo |
| Reiniciar (game over) | R ou clique | — |
| Tela cheia | F | — |

**Decisão de design:** o tiro é **automático** porque o jogo é de posicionamento (kitar), não de mira.
Isso deixa o jogador livre pra pensar em *onde estar* — que é o que mata ele.

---

## 4. Sistemas

### 4.1 Arma principal (auto-aim)
Uma arma só, mas **mutável**. O projétil sai na direção do alvo mais próximo dentro do alcance; se não
tem alvo, sai na direção do mouse. Stats: dano, cadência, velocidade do projétil, perfuração, nº de
projéteis (leque), crítico, alcance. **Sem munição, sem recarga** (isso é anti-diversão aqui).

### 4.2 Drones / sentinelas
Até **3 drones** orbitando o jogador, cada um atira sozinho. Escalam com os mesmos bônus de dano.
É a melhoria que mais muda a *sensação* de poder — deve ser rara e comemorada.

### 4.3 Aura elétrica
Campo circular ao redor do jogador que dá dano por segundo e **lentidão** aos zumbis que entram.
Escala com "Área" e "Dano". Serve pra punir a horda que cola em você.

### 4.4 XP e level up
- Zumbis soltam **gemas de XP** que voam pro jogador se estiverem perto (**ímã**).
- Ao encher a barra: **o jogo pausa** e aparecem **3 cartas** de melhoria (raridade: comum/rara/épica,
  com cor de moldura). Escolher 1. Sempre 3 opções, nunca repetir a mesma carta na mesma oferta.
- Melhorias têm **nível máximo 5**; ao esgotar o pool, oferecer "Cura +30" e "Almas +20" como reserva.

### 4.5 Ondas (escalonamento infinito)
- Onda dura **35 segundos**. No fim, um "respiro" de 4s com anúncio grande (`ONDA 07`) e spawn pausado.
- Cada onda aumenta: **vida, dano, velocidade, taxa de spawn e máximo simultâneo** (tabela no doc 04).
- A cada 5 ondas: **BOSS** (não conta no respiro, o respiro vem depois da morte dele).
- Elites começam na onda 3 (aura dourada, 3× vida, 2× dano, mais XP/almas).
- **Nunca** usar `Math.pow` com expoente que estoure pra `Infinity` — clampar multiplicadores.

### 4.6 Almas (meta-moeda)
- Zumbis comuns: 6% de chance de soltar 1 alma. Elites: 3–5. Boss: 25.
- Persistem em `localStorage` entre partidas.
- Loja acessível no **menu inicial** e na **tela de game over**: compra melhorias permanentes.
- Morte não é punição total: você sempre sai com algo pra gastar. É isso que faz voltar.

### 4.7 Drops de campo
- **Kit médico** (cura 25) — 1,5% dos comuns, cai do boss (2).
- **Ímã total** — puxa todas as gemas da tela (raro).
- **Granada grátis** — reseta o cooldown da granada.
- Tudo com **aviso visual no chão** (anel pulsante) e tempo de vida de 20s.

---

## 5. Tipos de zumbi (7 + elite + boss)

| # | Nome | Silhueta (desenhada por código) | Papel | Como te mata |
|---|---|---|---|---|
| 1 | **Caminhante** | corpo curvado, braços pra frente, 2 pernas, cabeça tombada | bucha de XP | te encurrala em número |
| 2 | **Corredor** | esguio, inclinado pra frente, pernas longas, sem braços erguidos | pressão | corrida em linha reta te pega desprevenido |
| 3 | **Rastejante** | baixo, 4 membros, arrasta (spawna em grupo de 4) | enxame | passa por baixo do seu fogo concentrado |
| 4 | **Brutamontes** | largo, ombros enormes, braços grossos, quase sem pescoço | tanque | empurra e te tira do lugar |
| 5 | **Cuspidor** | barriga inchada, cabeça pequena, fica **longe** (~230px) e cospe | zonear | te obriga a sair do lugar seguro |
| 6 | **Explosivo** | barriga pulsante amarelo-esverdeada, pernas curtas, anda trêmulo | kamikaze | explode ao morrer (e ao te alcançar) |
| 7 | **Gritador** | boca enorme, corpo fino, fica atrás da horda e **grita** | suporte | buffa +25% velocidade dos aliados por 4s |
| — | **Elite** | qualquer tipo + aura dourada + 30% maior | mini-chefe | 3× vida, 2× dano, dropa muito |
| — | **BOSS "Aberraça"** | massa de 3 corpos fundidos, 3 cabeças, braços múltiplos | chefe | *stomp* (onda de choque), *investida*, e invoca 6 rastejantes |

**Cada tipo precisa ser reconhecível por silhueta em 0,2s**, mesmo em preto-e-silhueta. É o teste de arte.

---

## 6. Habilidades especiais (4)

| Tecla | Nome | Efeito | CD |
|---|---|---|---|
| Espaço | **Dash** | avanço rápido na direção do movimento, **invencível** durante 0,28s, deixa rastro | 2,5s |
| Q | **Onda de Choque** | anel de 180px: dano + **empurrão forte** (reseta a horda de cima de você) | 9s |
| E | **Granada Incendiária** | arremesso no cursor; explode e deixa **poça de fogo** 4s com dano contínuo | 12s |
| R | **FÚRIA** | 6s: cadência ×2, projéteis perfuram, borda da tela pulsa vermelho | 45s |

Regras: cooldown **só corre enquanto o jogo está rodando**; habilidade sem uso fica "carregada" e o HUD
mostra o anel de recarga. Nenhuma habilidade deve ser obrigatória pra sobreviver aos primeiros 60s.

---

## 7. Direção de arte procedural

Sem um único PNG. Tudo com `ctx.beginPath/arc/roundRect/fill/stroke` e gradientes. Receita:

1. **Pré-renderizar** cada sprite em um **canvas offscreen** por tipo × **8 rotações** × **2 frames de
   animação** (marcha), no carregamento. Depois só `drawImage` — é o que garante 300 zumbis a 60 FPS.
2. **Paleta** (usar exatamente):
   `#0b0d10` chão · `#151a20` grade · `#26303a` borda · `#7fe3ff` jogador · `#ffd75e` tiro ·
   `#9fe870` zumbi base · `#5f9e3f` zumbi escuro · `#c8d44a` explosivo · `#b04ad8` gritador ·
   `#e0533f` sangue/dano · `#8a1f2b` sangue seco · `#ff9f1c` fogo · `#f2f4f8` texto.
3. **Contorno grosso** (2px, quase preto) em tudo que é entidade: é o que faz o visual "pixel-art
   moderno" e mantém leitura sobre o chão sujo.
4. **Sombra elíptica** embaixo de cada entidade (achatada na vertical) = profundidade instantânea.
5. **Walk cycle** = 2 frames: pernas alternando (`sin(t*10)`), corpo com leve bob vertical, braços
   oscilando. Nada além disso.
6. **Juice**: flash branco por 60ms ao levar dano, partículas de sangue (8–12 por hit, gravidade,
   desaceleração), **números de dano** subindo, screen shake de 3–14px conforme o impacto.
7. **Vinheta** vermelha pulsando quando vida < 30% + batimento cardíaco no áudio.

---

## 8. Áudio procedural (WebAudio, sem arquivos)

Síntese pura com `OscillatorNode` + `GainNode` + ruído branco em buffer:
- **Tiro**: square 220Hz→80Hz, 60ms, com ruído. Leve variação aleatória de pitch (evita fadiga).
- **Hit**: ruído filtrado (bandpass 900Hz), 40ms.
- **Morte**: saw 140→40Hz em 180ms + ruído.
- **Level up**: arpejo 3 notas (C-E-G) em square.
- **Dano no jogador**: senoide 90Hz curta + ruído grave.
- **Boss**: drone grave contínuo + batida de tambor sintética.
- Music: **não**. Um pad ambiente grave opcional, desligado por padrão.
- Tudo com **limite de vozes** (máx. 12 simultâneas) e *mute* automático se `ctx.state === 'suspended'`.
- Configurável: volume master / efeitos, e opção "modo streamer" (mudo).

---

## 9. Telas e fluxo

```
TÍTULO → (Loja de Almas) → PARTIDA → LEVEL UP (overlay) → PAUSA (overlay) → GAME OVER → (Loja) → TÍTULO
```

- **TÍTULO**: nome do jogo, recorde (onda + tempo + kills), total de almas, botões
  `JOGAR` / `LOJA` / `COMO JOGAR` / `CONFIG` / `ZERAR SALVE`.
- **GAME OVER**: "VOCÊ AGUENTOU 07:42", onda alcançada, kills, almas ganhas na partida, recorde novo
  (com destaque), botões `DE NOVO (R)` / `LOJA` / `TÍTULO`.
- **PAUSA**: retomar, config, abandonar.
- Nenhuma tela deve exigir mouse — tudo navegável por teclado.

---

## 10. Anti-metas (o que NÃO fazer)

- ❌ Não fazer o jogador recarregar arma (quebra o ritmo).
- ❌ Não colocar inimigo que atira de fora da tela (injusto).
- ❌ Não usar tela de "preparação" longa entre ondas (máx. 4s).
- ❌ Não fazer a horda virar um "paredão sólido" — todo zumbi empurra os outros, mas com separação
  suave; eles devem fluir como líquido, não como bloco.
- ❌ Não usar cor vermelha pra zumbi comum (vermelho = dano/perigo não-inimigo).
- ❌ Não implementar multiplayer, login, backend, save em nuvem, mobile touch-first.
