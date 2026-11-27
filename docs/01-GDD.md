# GDD — HORDAS (design do jogo)

> Documento 2 de 6. É o **porquê** e o **como se joga**, em prosa. Números ficam no doc 04.
> Se este documento e o 04 divergirem em número, **o 04 ganha**.

---

## 1. Fantasia central

Você é um dos últimos de pé numa cidade tomada. Não existe vitória: existe **quanto tempo você aguenta**
e **quão monstruoso o seu arsenal fica** antes de cair. A curva emocional de uma partida:

| Fase | Hordas | Sensação | O que muda |
|---|---|---|---|
| Calmaria | 1–10 | "tô no controle, isso é fácil" | zumbis lentos, poucos, moedas pingando |
| Aperto | 11–20 | "tá vindo mais... preciso comprar algo" | quantidade sobe, você começa a cercar-se de barricadas |
| Pressão | 21–30 | "meu deus, esse tanque não morre" | resistência sobe, munição vira problema |
| Desespero | 31–40 | "o que É isso?" | **especiais** entram: cuspidor, explosivo, frenético em massa |
| Colapso | 40+ | "não tem mais como" | a horda cresce mais rápido que você; a morte vira recorde |

**Regra de ouro:** o jogador nunca fica sem decisão. Sempre há algo a comprar, algo a reparar ou uma
rota a escolher — e a moeda nunca é suficiente para tudo.

---

## 2. Câmera e leitura de tela

- **2D topdown 90° puro**: câmera acima, sem rotação, sem perspectiva, sem inclinação. Norte é sempre norte.
- A câmera segue o jogador com **amortecimento** (lerp ~9/s) e um **look-ahead** de até 40px na direção
  do retículo — você vê para onde está mirando.
- **Zoom fixo** (1,0): a leitura de tela é o coração do gênero. Nada de zoom dinâmico.
- Mapas são **fechados** (paredes/parapeito). Sem borda aberta: o mapa inteiro é a arena.
- **Oclusão suave**: quando uma parede alta fica entre o jogador e a câmera, ela recebe alpha 0,55
  (evita o jogador "sumir" atrás de um pilar).
- **Regra de cores**: o jogador é o **único** objeto em azul-ciano; zumbis são verdes/terrosos; moeda é
  dourada; alma é violeta; munição é branca; compra é verde; perigo é vermelho. Nenhuma exceção.
- UI em camada fixa (o HUD **não** treme com o screen shake; só o mundo treme).

---

## 3. Controles

| Ação | Comando |
|---|---|
| Mover | **WASD** / **setas** |
| Mirar | **mouse** (retículo sempre visível) |
| Atirar | **botão esquerdo** (segurar) — ou **auto-fire** ligado na config |
| Foco manual | **botão direito** (segurar): +15% dano, −50% dispersão, −20% velocidade |
| Recarregar | **R** (ou automático quando o pente zera) |
| Trocar arma (2 slots) | **Q** ou roda do mouse |
| Construir barricada | **B** (na vaga mais próxima, dentro de 90px) |
| Construir torreta | **T** (na vaga mais próxima) |
| Comprar na parede | **E** (quando o aviso aparecer perto do ponto) |
| Interagir / confirmar | **E** |
| Pausa | **Esc** / **P** |
| Tela cheia | **F** |
| Debug (FPS, hitbox) | **F3** |

**Decisões:** 2 slots de arma (não mochila infinita) para forçar escolha; recarga **manual possível**,
porque recarregar na hora errada é a tensão clássica do gênero; construir é **tecla**, não menu — não
quebra o ritmo.

---

## 4. Estrutura de uma partida

```
LOBBY → CARREGANDO (fade) → PARTIDA → GAME OVER → LOBBY
                                 ├── PAUSA
                                 └── PERK (overlay rápido, não pausa o jogo)
```

- Ao entrar: **2,5 s de preparação** com "HORDA 1 EM..." enquanto você vê o mapa (tempo de ler).
- Cada horda termina com **6 s de trégua**: sombra cai, zumbis param de nascer, aparece o resumo
  (`HORDA 04 LIMPA · +180 MOEDAS`) e você corre para reparar/construir/comprar. **A trégua é onde o jogo
  acontece.**
- Hordas 1–10 têm **2 ondas de spawn** cada (dois "bichos" de zumbis); depois disso, 3–6 pulsos por horda.
- Não existe tela de vitória.

---

## 5. Sistemas em detalhe

### 5.1 Hordas (abate total)
- O contador é **restam N**. A horda só fecha quando N = 0.
- O total de zumbis por horda cresce conforme o doc 04, e eles entram em **pulsos** de 6–14 vindos de
  3–5 pontos de spawn escolhidos longe do jogador (nunca na cara).
- Zumbis nunca param de perseguir: sem "desistir" e sem ficar parado em canto. Se o jogador se entoca,
  os zumbis **quebram a barricada** e entram.
- A cada 10 hordas, entra um **especial novo** com anúncio de 2 s (`NOVO: CUSPIDOR`).

### 5.2 Moedas e economia da partida
- Abate comum: **10 moedas**; especial: 30–60; tanque: 40. Bônus de 50 por horda limpa sem levar dano.
- **Sempre** é pouca: a curva de custo dos doc 04 obriga a escolher entre "arma melhor" e "defesa".
- Moeda **não** expira e **não** é perdida na morte (na morte ela vai embora; é a run que acaba).
- Sem moeda flutuando: o valor entra direto na carteira com um `+10` subindo (evita corrida por coleta).

### 5.3 Pontos de compra (paredes)
Três tipos de placa no mapa, sempre visíveis:
| Placa | O que faz |
|---|---|
| **Arma** (verde) | compra a arma daquela placa e ocupa o slot ativo (custa 300–1.800) |
| **Munição** (branca) | reabastece a arma atual (custa 60–200, sobe por horda) |
| **Melhoria** (azul) | upgrade permanente da arma atual: +dano / +pente / −recarga (custa 400–900) |
Comprar exige **ficar 0,8 s** no ponto com **E** (barra de progresso) — dá tempo de ser interrompido.

### 5.4 Barricadas
- Vagas marcadas no mapa (7 no Telhados) — você **não** planta em qualquer lugar: planta **nas vagas**.
  Isso mantém o mapa legível e impede "parede de barricada sem fim".
- Custo progressivo por quantidade de barricadas **vivas** na partida: 50, 80, 90, 100, 110, 120, 130.
- **600 HP**. Zumbi que alcança a barricada para e bate (8 dano/s) até quebrar; quebrar leva ~2 zumbis e
  8 s. **Não** atrasa para sempre — é atraso tático, não muralha.
- **Reparo**: **E** na barricada danificada custa metade do preço atual, +40% HP.
- Animação: tábuas desenhadas por código, quebrando lasca por lasca conforme HP cai; ao quebrar, deixa
  **madeira no chão** por 10 s (só visual).
- Zumbi **rastante** e **frenético** passam por baixo/por cima com 3× o tempo — a barricada não é universal.

### 5.5 Torretas
- Vagas de torreta (4 no Telhados). Custo progressivo: 400, 550, 700, 850.
- Alcance **340px**, dano 12/s, cadência 5 tiros/s, 400 HP.
- **Munição** de 240 tiros; acaba → para de atirar; recarregar custa 150 moedas (**E**).
- Prioriza o zumbi **mais próximo** dentro do alcance; nunca atira através de parede.
- Pode ser destruída (zumbi bate como na barricada). É investimento com risco: longe de você, você não a
  defende.

### 5.6 Armas
- Começa com **Pistola** (munição infinita de reserva, pente 12). As outras **acabam** → você volta pra
  pistola. Isso impede "comprei a melhor logo na horda 3".
- **2 slots.** Comprar uma terceira pergunta qual substituir.
- Cada arma: dano, cadência, pente, recarga, alcance, precisão (dispersão em graus), perfuração e preço.
  Tabela completa no doc 04.
- `R` recarrega (1,1–2,4 s, você fica mais lento durante). Recarregar com 1 bala no pente é a jogada.
- **Melhoria de arma** (placa azul): +20% dano, +50% pente ou −25% recarga, uma vez cada por arma.

### 5.7 Perks (XP dentro da partida)
- Além de moedas, o abate dá **XP**; a barra de XP enche a cada ~35 abates e mostra **1 carta** (não 3 —
  o ritmo é outro, aqui não pausa o jogo: a carta aparece no canto e você aperta **1/2/3** em 6 s).
- Perks são **deste projeto** (nomes no doc 04): corrida, recarga rápida, mais vida, ímã de moeda,
  balas perfurantes, tiro duplo, entre outros. Máx. 4 niveis por perk; 3 slots ativos.
- Perks **não** substituem armas: são temperos, não a build.

### 5.8 Zumbis
Sete tipos com silhueta, cor e comportamento próprios (nomes e números no doc 04):
**Caminhante** (bucha), **Frenético** (corre em disparada), **Rastejante** (baixo, difícil de acertar,
passa rápido por barricada), **Tanque** (muito HP, empurra), **Cuspidor** (atira de longe), **Explosivo**
(explode em área), **Espreitador** (surge de vãos e telhados, aparece do nada atrás de você).
Especiais entram a partir da horda 31; antes disso, só quantidade e resistência.

### 5.9 Almas (meta-moeda) e lobby
- 1 alma a cada **25 abates** + 3 por horda limpa + 15 por horda 10/20/30 alcançada.
- Gastas no lobby em melhorias **permanentes** (arma inicial, vida, HP de barricada, preço de torreta,
  sorte). É o que faz voltar no dia seguinte.
- Morrer **sempre** rende almas: 4 minutos de run já compram algo.

---

## 6. Mapa 1 — TELHADOS (croqui próprio)

> Não copiado de nada. É o mapa que define a paleta e as regras usadas pelos mapas futuros.

**Premissa:** uma laje de cobertura de um edifício comercial no fim da tarde; o resto da cidade queimando
ao fundo (pintado, decorativo). Chão de **asfalto de laje** (`#4a4f57`) com emendas de manta
impermeável, poças rasas, ACs, dutos, caixas d'água e um **heliponto** pintado.

**Silhueta (32 × 32 tiles de 100px = 3200 × 3200):**

```
┌──────────────────────── PARAPEITO (parede, 40px) ─────────────────────┐
│  [AC]      DUTO═══════════════════[CAIXA D'ÁGUA]      [AC][AC]        │
│                                                                       │
│  [VAGA B1]        (área aberta central)              [PLACA ARMA 1]   │
│                                                                       │
│      ┌──── casa de máquinas ────┐        [heliponto ○]                │
│      │  porta     porta         │                                     │
│      └──────────────────────────┘   [PLACA MUNIÇÃO]      [VAGA T1]    │
│                                                                       │
│  [VAGA B2]     [VAGA B3]      (corredor leste)         [VAGA B4]      │
│                                                                       │
│  DUTO═════════════════  [VAGA T2]   [AC]   [PLACA ARMA 2]  [PLACA UP] │
│                                                                       │
│  [VAGA B5]   [VAGA B6]        [escada]        [VAGA B7]   [VAGA T3]   │
└───────────────────────────────────────────────────────────────────────┘
    spawns: 4 cantos + 2 portas da casa de máquinas + escada (total 7)
```

- **3 zonas de respiro**: heliponto (aberto, sem cobertura), corredor leste (funil), casa de máquinas
  (dois acessos, morte se entrar sem saída).
- **7 vagas de barricada** (B1–B7) marcadas com tinta amarela `BARRICADA`.
- **4 vagas de torreta** (T1–T4) com base de concreto e cabo solto.
- **5 placas**: 2 de arma, 1 de munição, 1 de melhoria, 1 de munição no canto leste (arriscada de pegar).
- Os outros 5 mapas no lobby: **Metrô, Hospital, Escola, Instalações, Zona Urbana** — cards com cadeado e
  `EM BREVE`, usando a arte de fundo procedural (só o cartão, sem gameplay).

---

## 7. Direção de arte procedural

Zero PNG/JPG. Tudo `ctx.beginPath / rect / roundRect / arc / lineTo` + gradientes.

**Paleta oficial** (usar exatamente):
| Uso | Hex |
|---|---|
| Fundo fora do mapa / céu ao fundo | `#1b1620` |
| Chão de laje | `#4a4f57` · emendas `#3c4048` |
| Parede/parapeito | `#8b8175` · topo `#a89c8c` |
| Jogador | `#37c6ff` · contorno `#0d2233` |
| Zumbi base | `#8fd14f` · escuro `#5c8f2f` |
| Tanque | `#9a7b52` · Explosivo `#ffcf3d` · Cuspidor `#b06cf0` · Espreitador `#5b6b7a` |
| Moeda | `#ffd44d` · Alma `#c07bff` · Munição `#f2f4f8` |
| Compra OK | `#54e08a` · Perigo `#ff5548` · Fogo `#ff9f1c` |
| Sangue | `#d63a30` · Sangue seco `#7d2320` |

**Regras visuais**
1. **Contorno 2px** quase preto em toda entidade — é o que dá o "adesivo" cartoon.
2. **Sombra chapada** elíptica, deslocada 6px para baixo, sem blur.
3. **Sangue divertido**: respingos arredondados, 8–12 partículas, e poças que ficam 12 s no chão.
4. **Animação**: 4 frames por direção para andar (não 8 rotações de pose: o corpo gira e as pernas
   trocam), 2 frames para atacar, 3 para recarregar, 3 para morrer (queda + poça).
5. **Nada de blur**: sombra, fumaça e fogo são formas chapadas com alpha. Isso mantém 60 FPS.
6. **Ui chapada**: placas e cards com canto arredondado 6px, borda 3px, sombra dura de 3px.
7. **Sinalização**: toda vaga de construção tem ícone pintado no chão (martelo para barricada, cano para
   torreta) — o jogador lê o mapa sem tutorial.

---

## 8. Áudio procedural (WebAudio)

Sem arquivos. Osciladores + ruído filtrado, com limite de 12 vozes simultâneas.
- Tiro de pistola: burst de ruído 90 ms + square 180→70 Hz.
- Espingarda: ruído largo 140 ms + grave 90 Hz, com *punch*.
- Rifle: 3 cliques curtos, mais agudo.
- Recarga: dois "clack" (ruído 20 ms) + slide.
- Impacto em carne: ruído bandpass 700 Hz, 50 ms. (Acerto crítico: +1 tom agudo.)
- Construir: marteladas em 3 tempos. Barricada quebrando: ruído grave + estalo de madeira.
- Torreta: motor curto a cada 250 ms enquanto atira.
- Moeda: sino de 2 notas subindo (não pode ser o som de moeda de outro jogo — aqui é uma terça menor).
- Horda limpa: acorde ascendente de 3 notas. Nova horda: sino grave + tambor.
- Dano recebido: sub-baixo + respiração curta. Morte: descida de tom de 1,2 s.
- Pad ambiente grave e cíclico, volume baixo, configuração para desligar.

---

## 9. Telas

| Tela | Conteúdo |
|---|---|
| **LOBBY** | Logo, `CRIAR PARTIDA` (host, futuro MP), `ENTRAR` (código de sala, desabilitado com aviso "em breve"), **grade de mapas** (Telhados + 5 com cadeado), `LOJA DE ALMAS`, `CONFIG`, `RECORDES`. Navegação 100% teclado e mouse. |
| **LOJA** | 6 melhorias permanentes com custo crescente e nível atual; saldo de almas; botão voltar. |
| **CONFIG** | Volume, auto-fire on/off, screen shake, números de dano, redução de flash, apagar progresso. |
| **CARREGANDO** | Fade preto, nome do mapa, dica aleatória (uma linha). |
| **PARTIDA** | HUD: vida (barra + número), moeda, alma da run, arma + munição, barra de XP, horda e `restam N`, cronômetro, minimapa circular pequeno (opcional), avisos de compra. |
| **PAUSA** | Retomar, config, abandonar (confirma). |
| **GAME OVER** | `VOCÊ CAIU NA HORDA 17`, tempo, abates, moedas ganhas, almas ganhas, recorde (destaque se novo), `DE NOVO` / `LOBBY`. |

**HUD — regras de layout:** canto inferior esquerdo = vida; inferior direito = arma/pente/munição;
superior centro = horda + restam; superior esquerdo = moeda/alma; superior direito = cronômetro;
barra de XP fina logo acima da vida. Nenhum painel cobre o centro da tela (onde está o jogador).

---

## 10. Anti-metas (não fazer)

- ❌ Não fazer inimigo atirar de fora da tela.
- ❌ Não deixar zumbi parado "burro" no canto: se não achar caminho em 3 s, ele **quebra a parede
  mais próxima** (ou usa o caminho alternativo marcado no mapa).
- ❌ Não cobrar moeda para respirar (sem "pague para continuar" na morte).
- ❌ Não fazer a barricada durar para sempre — ela atrasa, não bloqueia.
- ❌ Não usar 15 cores na tela: a paleta é fixa (seção 7).
- ❌ Não pausar o jogo na carta de perk (quebra o ritmo do abate total).
- ❌ Não copiar HUD, nomes, mapas ou perks de jogos existentes.
- ❌ Não implementar multiplayer, backend, login por enquanto.
