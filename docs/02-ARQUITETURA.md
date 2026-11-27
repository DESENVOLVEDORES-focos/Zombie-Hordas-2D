# ARQUITETURA — como o agente deve construir

> Documento 3 de 6. Detalhes técnicos que evitam os 6 erros mais comuns deste tipo de projeto.
> Leia inteiro antes de escrever a primeira linha.

---

## 1. Restrições de plataforma (a raiz de quase todos os bugs)

- **Scripts clássicos, não módulos.** ES Modules **não carregam** em `file://` (CORS). O jogo tem de abrir
  com duplo clique. Portanto: cada arquivo é `(function(){ 'use strict'; ... window.Sys = {...}; })();`
  e o `index.html` inclui na ordem do doc 00.
- **Nenhum `fetch`, `import`, `<img>`, `<audio>`.** Tudo procedural.
- Resolução lógica fixa **1280×720**, canvas escalado por CSS com letterbox; `devicePixelRatio` máx 2.
- `preventDefault` em setas, espaço, Tab, Esc, F3, botão direito.
- `document.hidden` → pausa automática; ao voltar, descartar o `dt` acumulado.
- `localStorage` sempre com `try/catch` e fallback em memória.

---

## 2. Namespaces globais (o "módulo" de cada arquivo)

```js
window.CFG      // config.js  — números puros, zero lógica
window.U        // utils.js
window.SaveMgr  // save.js
window.AudioMgr // audio.js
window.InputMgr // input.js
window.VIEW     // canvas.js  — ctx, DPR, screenToWorld, fullscreen
window.Sprites  // sprites.js
window.MAPS     // maps.js   — dados
window.MapLoader// map-loader.js
window.Nav      // navigation.js
window.Ent      // entities.js
window.Weapons  // weapons.js
window.Combat   // combat.js
window.Player   // player.js
window.Zombies  // zombies.js
window.Hordes   // hordes.js
window.Economy  // economy.js
window.Barricades
window.Turrets
window.HUD
window.Render
window.Screens
window.Game     // main.js — estado da partida + loop
```

Regra de ouro: **um arquivo só fala com os outros através desses objetos**, nunca lendo variável de
outro arquivo diretamente.

---

## 3. Estado da partida (serializável — prepara multiplayer)

```js
Game.run = {
  mapId, phase:'PREP'|'HORDE'|'BREAK'|'OVER',
  horde, remaining, phaseTimer,
  seed, time,
  players: [ /* SEMPRE array, 1 no solo */ ],
  zombies: [], bullets: [], eBullets: [], coins: [], parts: [], texts: [],
  barricades: [], turrets: [], pickups: [],
  cam: { x, y, shakeX, shakeY },
  stats: { kills, coinsEarned, dmgTaken }
};
```
Nada de função, canvas ou referência circular dentro de `run`. `players[]` desde o primeiro commit:
toda função de dano/compra/coleta recebe `player` como parâmetro — nunca `Game.player` global.

---

## 4. Loop (ordem fixa — não reordenar)

```
1  input.poll()          // lê teclas/mouse, calcula mundo a partir da câmera
2  updatePhase(dt)       // PREP / HORDE / BREAK / OVER
3  Nav.updateIfNeeded()  // flow field: recalcula quando o jogador muda de célula
4  Player.update(dt)     // movimento, mira, tiro, recarga, compra, construção
5  Zombies.update(dt)    // IA, ataque a barricada/torreta, separação
6  Combat.updateBullets(dt)
7  Barricades.update(dt) // dano, estágios visuais, destruição
8  Turrets.update(dt)    // alvo, rotação, cadência, dano
9  Economy.update(dt)    // moedas no chão, coleta
10 Combat.updateFx(dt)   // partículas, textos, sangue, shake
11 Render.draw()         // chão → sangue → paredes → entidades por Y → projéteis → FX → HUD
```

`dt` clampado em `1/30 s`. **Nunca** velocidade por frame.

---

## 5. Navegação (o requisito crítico da spec §7)

> "Utilizar navegação por caminhos, como Pathfinding, para evitar que os inimigos fiquem presos."

**Solução escolhida: flow field (campo de fluxo).** Todos os zumbis vão para o mesmo alvo (o jogador),
então calcular **uma vez** um campo que aponta a direção do caminho é O(n) e serve para todos — muito mais
barato que A* por zumbi.

```
grade: célula de 50 px (mapa 3200 -> 64x64 células)
Nav.blocked: Uint8Array  (paredes, obstáculos e — opcional — barricadas)
Nav.flow:    Float32Array par de direções por célula (dx, dy normalizado)
recalcular quando: jogador muda de célula | barricada construída/quebrada | a cada 0,5 s
algoritmo: BFS multi-fonte a partir da célula do jogador (custo 1) -> distância -> gradiente
```

Regras:
- Zumbi lê `Nav.flow[cell]` e anda naquela direção (+ ruído pequeno por zumbi para não empilhar).
- Se o vizinho da célula está bloqueado (barricada), o zumbi entra em estado `attack` na estrutura.
- Barricada **entra** no campo como bloqueio: é isso que faz o zumbi ir batê-la em vez de contornar
  eternamente. Ao ser destruída, o campo é recalculado e o fluxo se abre.
- Rastejante ignora barricadas (passa "por baixo") e é 3× mais lento atravessando.
- Se a célula do jogador for inalcançável, usar a célula livre mais próxima (nunca travar).

Custo esperado: 64×64 = 4.096 células por recálculo — trivial a 60 FPS, mesmo recalculando 2×/s.

---

## 6. Colisão

- Jogador e zumbis são **círculos**; paredes e barricadas são **AABB**.
- Mover eixo por eixo (X, resolve, Y, resolve) → desliza em parede sem travar.
- Separação zumbi↔zumbi: grid espacial de 80 px, empurrão `overlap * 0.45`, **uma iteração**.
- Projétil: colisão **por segmento** (`distância ponto-segmento`) — nunca por ponto, senão atravessa
  zumbi em alta velocidade. Projétil morre em parede, com faísca.
- Explosão: consulta grid por raio, dano com queda linear, aplica em zumbis **e** estruturas.

---

## 7. Render

- **Chão pré-renderizado**: 1 canvas por mapa (3200×3200) desenhado uma vez no load (piso, emendas,
  manchas, pintura de vagas de construção, heliponto etc.). Por frame, só `drawImage` do viewport.
- **Sprites de entidade pré-renderizados** em canvas offscreen: jogador e cada zumbi com **4 direções ×
  (andar 4 frames, atacar 2, morrer 3)**. Nada de `ctx.rotate`/`beginPath` por entidade no frame.
- **Canvas de sangue separado**, entre chão e entidades, com fade global (`destination-out`, alpha baixo).
- **Ordem por Y** (painter's algorithm) para dar profundidade sem perspectiva 2.5D.
- Pools fixos: partículas 500, textos 40. Remoção por **swap-pop**, nunca `splice` em loop grande.
- HUD em camada fixa (não treme com o screen shake).

Meta: **150 zumbis + 4 torretas + 300 partículas ≥ 58 FPS**; stress test com 300 zumbis.

---

## 8. Áudio (WebAudio, sem arquivos)

- `AudioContext` criado no **primeiro gesto** do usuário (política de autoplay).
- Cadeia: `master → musicGain` e `master → sfxGain` (volumes separados, como a spec pede).
- Síntese: oscilador + envelope (attack 3–8 ms) e ruído branco em buffer reaproveitado com filtro.
- Limite de **12 vozes**; se estourar, descarta o som novo (áudio atrasado é pior que áudio faltando).
- Pistola: ruído 60 ms + square 320→140 Hz. Calibre 12: ruído largo + grave. Recarga: dois cliques.
  Impacto: bandpass 800 Hz. Explosão: ruído lowpass 320 Hz + sub 70 Hz. Construção: 3 marteladas.
  Madeira quebrando: ruído grave + estalo. Compra: sino de 2 notas (terça menor — **não** copiar
  sonoridade de franquia). Transição de horda: sino grave + tambor. Ambiente: pad grave em loop.
- Passos: ruído curto a cada ~0,42 s enquanto anda (volume baixo, variação de pitch).
- Passos/ataques de zumbi: grunhido sintetizado (saw 90–140 Hz com vibrato) — o mais baixo possível
  para não virar ruído.

---

## 9. Configurações (todas funcionais — spec §16)

| Config | Como funciona de verdade |
|---|---|
| Volume geral / música / efeitos | três `GainNode` separados; sliders aplicam na hora |
| Resolução | define a resolução lógica do canvas (1280×720 / 1600×900 / 1920×1080) com letterbox; a câmera mantém o mesmo "metro" de mundo |
| Tela cheia | `requestFullscreen` / `exitFullscreen` no container |
| Sensibilidade da mira | multiplica o deslocamento do mouse no cálculo do ângulo (0,5×–2×) |
| Mudo / modo streamer | master gain = 0, mantendo o estado anterior |
| Apagar progresso | confirmação por 2 s segurando o botão; limpa só as chaves do jogo |

Persistência em `hordas_settings_v1`; progresso em `hordas_save_v1`.

---

## 10. Estrutura dos dados (a "configuração externa" da spec §17)

`js/config.js` é o único lugar com número:

```js
CFG.WEAPONS = {
  pistol:   { name, dmg, rate, mag, reserve, reload, spread, range, pellets, pierce, price, upgrade:{...} },
  shotgun:  { ... }, smg:{...}, rifle:{...}, heavy:{...}, launcher:{...}
};
CFG.ZOMBIES = {
  walker: { name, hp, dmg, speed, radius, coin, weight, minHorde, build:{...}, behavior:'chase' },
  runner: { ..., behavior:'dash' }, bomber:{ ..., behavior:'explode' },
  spitter:{ ..., behavior:'kite' }, tank:{ ..., behavior:'push' }, crawler:{ ..., behavior:'low' }
};
CFG.HORDES = {
  count: fn(h), maxAlive: fn(h), hpMul: fn(h), dmgMul: fn(h), speedMul: fn(h), pulses: fn(h)
};
CFG.COSTS = { barricade:[50,80,90,100,110,120], turret:[400,550,700,850], ammo, upgrade };
CFG.BARRICADE = { hp, zombieDps, repairPct };
CFG.TURRET = { hp, range, dmg, rate, ammo, rotSpeed };
```

Regra: **nenhum número mágico espalhado no código.** Se aparecer um número novo, ele nasce aqui.

---

## 11. Seis erros que vão acontecer se você não seguir isto

| Erro | Prevenção |
|---|---|
| Zumbi preso no canto | flow field + estado `stuck` que ataca estrutura após 2 s |
| Projétil atravessa zumbi | colisão por segmento |
| Frame rate despenca com 100 zumbis | sprites pré-renderizados + grid espacial + IA com `thinkTimer` |
| Botão de config que não faz nada | implementar o efeito **antes** de desenhar o botão |
| Barricada infinita (mapa trancado) | barricada tem HP, zumbi prioriza quebrar, reparo custa moeda |
| Economia quebrada (dinheiro infinito ou zero) | tabela do doc 04 + teste: "chega à horda 11 com 800–1.200 moedas" |

---

## 12. Teste automatizado recomendado (obrigatório antes de cada entrega)

Crie `tools/sim.js` (fora do jogo, não carregado pelo `index.html`) que:

1. Monta um `window` falso + canvas offscreen (Node com `@napi-rs/canvas` **ou** um `file://` de teste
   que roda 60 s e escreve o resultado na tela).
2. Inicia a partida, aplica input sintético (andar em círculo, atirar, comprar, construir).
3. Roda 10–15 hordas e falha se: exceção no console, zumbi dentro de parede, moeda negativa,
   `remaining` negativo, `NaN` em qualquer posição, ou horda não terminar em 180 s.
4. Imprime: tempo até horda 10, moedas, abates, zumbis simultâneos máx, FPS estimado.
5. Salva 4 screenshots (lobby, partida início, horda cheia, game over) para inspeção visual.

Se não houver Node/navegador no ambiente, faça um modo `?autotest` no próprio jogo que roda o mesmo
roteiro e escreve o resultado num painel de debug.
