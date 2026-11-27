# ESPECIFICAÇÃO — RENDER, ARTE PROCEDURAL E ÁUDIO

> Documento 12 de 16. Arquivos: `render.js`, `sprites.js`, `audio.js`.
> Aqui está como desenhar tudo **sem nenhum asset** e como o áudio é sintetizado.

---

## PARTE A — ARTE PROCEDURAL

## 1. Regras de ouro da arte

1. **Contorno sempre**: 2 px, cor `#171319`, em toda entidade. É o que dá o visual "adesivo" e mantém
   leitura sobre o chão sujo.
2. **Sombra chapada**: elipse preta alpha 0,26, deslocada `+3x +6y`, **sem blur**.
3. **Nada de gradiente em entidade**: gradiente só no fundo (céu) e em vinheta.
4. **Paleta fechada**: só as cores de `CFG.PAL`. Nenhuma cor inventada.
5. **Silhueta primeiro**: cada zumbi precisa ser reconhecível em preto-e-branco a 200 px de distância.
6. **Nada de rotação de sprite no frame**: 4 direções pré-renderizadas (direita/baixo/esquerda/cima).

---

## 2. Jogador (visto de cima)

Composição (na direção "direita", 60×60 px de canvas):
```
1. sombra: elipse (3,7) rx 15 ry 12, preto 0,26
2. pernas: 2 rects 7×12 arredondados, cor #22303c, alternando 4 px em Y (passada)
3. braços: 2 rects 7×15, cor #1a7fa8 (manga), um à frente empunhando a arma
4. mochila: roundRect 14×9, cor #2b3a46 (dá volume atrás)
5. torso: elipse rx 11 ry 13, cor #37c6ff (colete), contorno #08303f 2px
6. faixa refletiva: rect branco alpha 0,45 de 20×3 na largura do torso
7. cabeça: círculo r 7, cor #d9a97e, contorno; cabelo #2b2f36 como semicírculo atrás
8. arma: rect 4×18 #2c333b saindo da frente do corpo
```
Frames: 4 de caminhada (pernas alternando, corpo bob de 1 px) + 1 parado.

---

## 3. Zumbis (6 silhuetas distintas)

Todos compartilham: sombra, pernas atrás, braços à frente, torso elíptico, cabeça deslocada para frente,
olhos pretos. O que muda é **proporção e cor** — é o que cria a leitura instantânea.

| Zumbi | Torso (w×h) | Cabeça | Braços | Cor | Detalhe distintivo |
|---|---|---|---|---|---|
| **Comum** | 20×26 | r 9 | 14 (longos, para frente) | `#8fd14f` | postura curvada (cabeça deslocada) |
| **Frenético** | 16×26 | r 8 | 16 (esticados) | `#e3f26a` | muito esguio, inclinado; no windup encolhe 6% |
| **Tanque** | 34×30 | r 11 | 18 (grossos) | `#9a7b52` | ombros enormes, quase sem pescoço; anda devagar |
| **Explosivo** | 24×22 | r 8 | 10 (curtos) | `#ffcf3d` | barriga pulsante (círculo claro que cresce/apaga) |
| **Cuspidor** | 24×24 | r 8 | 12 | `#b06cf0` | barriga inchada com brilho; boca aberta no ataque |
| **Rastejante** | 24×15 | r 8 | 13 | `#5c8f2f` | corpo achatado, quase sem pernas, arrasta |

### 3.1 Frames obrigatórios por zumbi
| Estado | Frames | Observação |
|---|---|---|
| andar | 4 | pernas alternando; corpo com bob de 1 px |
| atacar | 2 | braços vão e voltam (0,35 s por ciclo) |
| morrer | 3 | corpo cai/achata e vira poça |

Pré-renderizar **4 direções × 9 frames** por tipo = 216 canvases pequenos. Custo de memória trivial,
ganho de performance enorme.

### 3.2 Flash de dano
Não criar sprite de flash. Ao receber dano: desenhar o sprite normal e, por cima, o mesmo sprite com
`globalCompositeOperation='lighter'` e `globalAlpha 0,55` por 70 ms. Barato e legível.

---

## 4. Barricada (3 estágios)

```
estágio 0 (100–66%): 3 tábuas horizontais inteiras, 4 pregos visíveis
estágio 1 (66–33%):  2 tábuas + 1 lascada; prego faltando; rachadura diagonal
estágio 2 (<33%):    1 tábua torta; buraco no meio; lascas no chão
```
Tábuas: `roundRect` 92×15, cor `#9a6b3f` (alternando `#a5793f`), contorno 2 px, linha central `#6f4a29`.
Pregos: círculos 2,2 px `#3a3f45`.
Barra de vida: **só quando danificada**, 62×5, acima da peça, cor verde→amarelo→vermelho.

---

## 5. Torreta

```
base: círculo r 20 #4d5a66 + contorno
corpo: círculo r 14 #6f8090
cano: rect 30×8 #2f3a44 girando para o alvo (desenhado no frame, é 1 rect — barato)
olho: círculo r 5 #7ef0ff
flash: círculo 7 px #ffe9a8 por 60 ms quando atira
sem munição: ícone vermelho acima + texto "SEM MUNIÇÃO" 11 px
```
Barra de vida quando danificada, 48×5.

---

## 6. Chão dos mapas (pré-renderizado, 1× no load)

Ordem de desenho num canvas offscreen 3200×3200:
1. **Cor base** do piso.
2. **Placas grandes** de 400×400 com variação de ±4% de luminância (evita chão "chapado").
3. **Emendas** de 3 px a cada 400 px (manta impermeável / juntas de concreto).
4. **90 manchas** grandes (alpha 0,05–0,12, preto ou branco) para quebrar a repetição.
5. **4000 grãos** de 2×2 px (alpha 0,05–0,08) — é o que faz parecer "sujo".
6. **Decor do mapa**: heliponto, poças, manchas de sangue seco, rachaduras, pintura de chão.
7. **Ícones das vagas**: contorno tracejado amarelo + martelo (barricada) / cano (torreta) pintados no chão,
   alpha 0,30. **Obrigatório** — é a sinalização que substitui tutorial.
8. **Nome das zonas** pintado no chão, alpha 0,16 (ex.: `CASA DE MÁQUINAS`).

Por frame, desenha-se **apenas o viewport** com `drawImage(floor, camX, camY, W, H, 0, 0, W, H)`.

---

## 7. Paredes (desenhadas por frame, são poucas)

```
1. sombra: roundRect deslocado +6x +8y, preto 0,30
2. corpo: roundRect cor da parede
3. topo iluminado: roundRect de 45% da altura, +12% de luminância
4. contorno: roundRect 2,5 px #171319
5. parapeito: emendas de concreto a cada 160 px
```
Paredes altas (kind `high`) recebem alpha 0,55 quando estão entre a câmera e o jogador (oclusão suave).

---

## 8. Sangue (camada separada)

- Canvas próprio do tamanho do mapa, entre chão e entidades.
- Cada abate: 6 elipses de 4–14 px, cores `#d63a30` e `#7d2320`, alpha 0,35–0,6.
- Fade global por frame: `destination-out` com `rgba(0,0,0,0.010)` — as manchas somem em ~1,5 min.
- Limite: 60 respingos por horda (evita canvas "saturado" e perda de FPS).

---

## 9. Ordem de desenho por frame (exata)

```
1  limpar canvas com CFG.PAL.bg
2  drawImage(chão, viewport)
3  drawImage(sangue, viewport)
4  paredes (com oclusão)
5  obstáculos/props (AC, duto, caixa d'água...)
6  placas de compra (sempre visíveis)
7  ícones de vaga próximas (contorno pulsante)
8  barricadas (com barra de vida se danificada)
9  torretas (com cano e flash)
10 entidades ordenadas por Y: zumbis, jogador, moedas, kits
11 projéteis (com rastro)
12 partículas
13 textos flutuantes
14 vinheta vermelha (vida < 30%)
15 HUD
16 overlays (pausa, game over, cartas)
```

**Ordenar por Y** é o que dá profundidade sem perspectiva 2.5D. Custa um `sort` de ~150 itens: barato.

---

## PARTE B — ÁUDIO PROCEDURAL

## 10. Cadeia de áudio

```
AudioContext
  └─ master (gain = volume geral)
       ├─ sfx (gain = volume efeitos)
       └─ music (gain = volume música)
```
- Criado no **primeiro gesto** do usuário (Chrome bloqueia autoplay).
- Enquanto `ctx.state === 'suspended'`, nenhum som toca (não tentar forçar).
- Limite de **12 vozes** simultâneas; ao estourar, **descarta o som novo** (nunca enfileira).

---

## 11. Tabela de sons (síntese exata)

| Som | Oscilador | Frequência | Duração | Ruído | Volume |
|---|---|---|---|---|---|
| Pistola | square | 320→140 Hz | 60 ms | bandpass 2200 Hz, Q 2 | 0,13 |
| Calibre 12 | square | 120→55 Hz | 160 ms | lowpass 1400 Hz | 0,28 |
| Vetor | square | 240→90 Hz | 70 ms | bandpass 1800 | 0,16 |
| Zumbido | square | 260→100 Hz | 50 ms | bandpass 2400 | 0,12 |
| Brasa | square | 180→70 Hz | 110 ms | lowpass 1200 | 0,22 |
| Estilhaço | sawtooth | 90→40 Hz | 220 ms | lowpass 700 | 0,30 |
| Recarga | square | 700→500 Hz (x2, 100 ms de intervalo) | 40 ms cada | highpass 3000 | 0,06 |
| Impacto | — | — | 50 ms | bandpass 800 Hz | 0,20 |
| Impacto crítico | — | — | 50 ms | bandpass 1300 Hz | 0,22 |
| Morte de zumbi | sawtooth | 140→50 Hz | 160 ms | lowpass 500 | 0,10 |
| Dano no jogador | sine | 90→60 Hz | 180 ms | lowpass 400 | 0,22 |
| Explosão | sine + ruído | 70→30 Hz | 400 ms | lowpass 320 | 0,30 |
| Construir | square | 180→120 / 160→110 Hz | 50 ms ×3 | lowpass 900 | 0,10 |
| Madeira quebrando | sawtooth | 220→60 Hz | 250 ms | lowpass 700 | 0,14 |
| Torreta (tiro) | square | 420→260 Hz | 50 ms | bandpass 2600 | 0,07 |
| Compra | triangle | 880 Hz + 1320 Hz | 60+80 ms | — | 0,07 |
| Horda limpa | triangle | 523 · 659 · 784 Hz | 120 ms cada | — | 0,12 |
| Nova horda | sine + ruído | 110 Hz | 300 ms | lowpass 300 | 0,18 |
| Passo | — | — | 30 ms | bandpass 400, vol baixo | 0,05 |
| Grunhido de zumbi | sawtooth + vibrato | 90–140 Hz | 250 ms | lowpass 600 | 0,08 |

### 11.1 Regras de síntese
- Envelope: ataque de 3–8 ms, decaimento exponencial até ~0 (nunca corte seco, estala).
- Variação de pitch de **±6%** por disparo — sem isso, o ouvido cansa em 30 s.
- Ruído: um `AudioBuffer` de 1 s gerado no boot e reaproveitado por todos os sons.
- Sons de zumbi/estrutura recebem **atenuação por distância** ao jogador (`gain *= clamp(1 - d/900, 0.2, 1)`).
- Nunca mais de 3 sons de zumbi por 200 ms (satura).
- Passos: só quando o jogador anda, a cada 0,42 s, com pitch alternado.

---

## 12. Música ambiente

Um **pad grave contínuo** (2 osciladores sine em 55 e 82,5 Hz, lowpass 260 Hz, gain 0,035) + um pulso
rítmico de tambor sintético (ruído lowpass + sub) a cada 2 s, entrando só a partir da horda 10.
Sem melodia: é atmosfera. Volume próprio (`musicVolume`), e o jogador pode zerar.

---

## 13. Settings de áudio (todos funcionais)

| Controle | Efeito |
|---|---|
| Volume geral | `master.gain` |
| Volume música | `music.gain` |
| Volume efeitos | `sfx.gain` |
| Mudo / streamer | `master.gain = 0` (mantendo o valor anterior) |

Aplicar **na hora**, persistir em `hordas_settings_v1`.

---

## 14. Checklist de aceite

- [ ] Nenhuma cor fora da paleta.
- [ ] Todo sprite tem contorno 2 px e sombra chapada.
- [ ] 6 zumbis distinguíveis em preto-e-branco.
- [ ] Chão não repete visivelmente (manchas e grãos quebram o padrão).
- [ ] Ícones de vaga visíveis no chão em todos os mapas.
- [ ] Sangue acumula e desaparece sozinho.
- [ ] 140 zumbis + partículas ≥ 58 FPS.
- [ ] Todos os 18 sons existem e são distinguíveis.
- [ ] Pistola em 60 tiros seguidos não irrita (variação de pitch funcionando).
- [ ] Música pode ser zerada sem afetar efeitos.
- [ ] Nenhum som atrasa (lata) — limite de vozes descartando, não enfileirando.
