# ESPECIFICAÇÃO TÉCNICA

> Documento 3 de 6. É o "como implementar". Arquitetura, estruturas de dados, assinaturas de funções,
> ordem do loop, grid espacial, save. Quem implementa deve seguir as seções na ordem em que aparecem.

---

## 1. Restrições de plataforma (repetindo porque é o que mais quebra)

- `index.html` + `game.js` em **IIFE** (`(function(){ ... })();`) — **não** use `type="module"`,
  porque módulo ES **não roda em `file://`** por causa de CORS. Isso é decisão fechada.
- Sem `fetch`, sem `import`, sem `<img>`, sem `<audio>`, sem fontes web.
- Canvas com `width/height` ajustados a `devicePixelRatio` (máx. 2) para nitidez; `image-rendering`
  em `pixelated` **não** é necessário (arte vetorial), mas desative antialiasing onde desenhar grade.
- Resolução lógica de referência: **1280×720**; escalar o canvas por CSS (`100vw/100vh`) mantendo
  proporção e usar `letterbox`. Nunca deixar a arena mudar de tamanho com a janela.
- `preventDefault()` em setas, espaço, Tab e Esc (evitar rolagem da página).

---

## 2. Arquitetura

Um arquivo, mas com **seções isoladas** e **estado global explícito** (nada de `this` espalhado):

```js
// ===== CONFIG =====
const CFG = { W:1280, H:720, ARENA:3200, CELL:80, WAVE_TIME:35, BREATH_TIME:4, MAX_ZOMBIES:420, ... };

// ===== ESTADO =====
const G = {
  state:'TITLE',        // TITLE | PLAYING | LEVELUP | PAUSED | GAMEOVER
  t:0, dt:0, frame:0, time:0,
  wave:0, waveTimer:0, spawnBudget:0,
  player:{...}, zombies:[], bullets:[], eBullets:[], xp:[], drops:[], particles:[], texts:[],
  firePatches:[], shockwaves:[],
  cam:{x:0,y:0,shake:0},
  grid:null, save:null, settings:null, run:{kills:0, souls:0, startTime:0}
};
```

### Estruturas (usar objetos literais simples, sem classes — mais fácil de serializar/depurar)

```js
// Jogador
{ x,y, vx,vy, r:14, hp, maxHp, regen, speed,
  fireCd, dmg, rate, bspeed, pierce, shots, spread, crit, critMul, range, projSize,
  magnet, area, xp, xpNext, lvl,
  abilities:{dash:{cd,cdMax,active}, shock:{...}, nade:{...}, fury:{...}},
  drones:[], aura:{on,lvl,dmg,radius},
  iframes:0, hitFlash:0, facing:0, animT:0 }

// Zumbi
{ id, type, x,y, vx,vy, r, hp, maxHp, dmg, speed, xp, souls,
  state:'chase'|'windup'|'attack'|'flee', stTimer,
  elite:false, boss:false, flash:0, slow:0, buff:0,
  rot:0f..7, animFrame:0, wander:Math.random()*1000 }

// Projétil: {x,y,vx,vy,r,dmg,pierce,life,hitIds:Set|array,from:'player'|'enemy',type}
// Gema XP: {x,y,vx,vy,val,life}
// Drop:   {x,y,kind:'hp'|'magnet'|'nade',life}
// Partícula: {x,y,vx,vy,life,maxLife,color,size}
// Texto de dano: {x,y,vy,life,txt,color,crit}
```

### Ordem do loop de update (fixa — não reordenar)

```
1 input.poll()            // teclas, mouse → intents
2 updatePlayer(dt)        // movimento, iframes, regen, timers
3 updateAbilities(dt)     // dash, aura, drones(disparo próprio)
4 updateWeapon(dt)        // auto-fire / fúria
5 updateBullets(dt)       // player + enemy bullets, colisão com grid
6 updateZombies(dt)       // IA, separação, dano de contato
7 resolveCollisions()     // separação jogador↔zumbi + empurrão
8 updateWaves(dt)         // spawn, fim de onda, respiro, boss
9 updatePickups(dt)       // xp, drops, ímã
10 updateFx(dt)           // partículas, textos, fogo, ondas de choque, shake decay
11 updateCamera(dt)
12 render()               // chão → sombras → entidades ordenadas por y → fx → UI
```

Detalhe de render: **entidades ordenadas por `y`** (painter's algorithm) para que quem está "abaixo"
apareça na frente — é o que faz o topdown parecer tridimensional sem perspectiva.

---

## 3. Grid espacial

```js
class Grid {
  constructor(size, cell) { this.cell=cell; this.n=Math.ceil(size/cell); this.buckets=new Map(); }
  key(cx,cy){ return cy*this.n+cx; }
  clear(){ this.buckets.clear(); }
  insert(e){ const k=this.key((e.x/this.cell)|0,(e.y/this.cell)|0); let b=this.buckets.get(k); if(!b){b=[];this.buckets.set(k,b);} b.push(e); }
  queryCircle(x,y,r,out){ // varre só as células que o círculo toca, filtra por dist²
  }
}
```

- Reconstruir o grid **1× por frame** com os zumbis vivos (não por consulta).
- Usado em: mira automática, colisão projétil↔zumbi, aura, onda de choque, explosões.
- Célula 80px: com 300 zumbis numa arena cheia, média ~3 por célula → custo trivial.
- **Buffer reutilizado**: `queryCircle` escreve num array `out` reaproveitado, nunca aloca por chamada.

### Separação entre zumbis (o "fluir como líquido")
Para cada zumbi, consultar vizinhos no raio `r*1.6` e aplicar empurrão **fraco**:
`overlap * 0.5` no eixo normalizado, limitado a `speed*0.6` por segundo. Sem física real, sem iteração
múltipla. Com 1 iteração já resolve visualmente e custa barato.

---

## 4. Sprites procedurais (pré-render)

```js
const SPR = {}; // SPR.zombie[type][rot][frame] -> HTMLCanvasElement

function buildSprites() {
  for (const type of ZOMBIE_TYPES) {
    const def = ZOMBIE_DEFS[type];
    SPR[type] = [];
    for (let rot=0; rot<8; rot++) {
      SPR[type][rot] = [0,1].map(frame => drawZombieToCanvas(def, rot, frame, def.elite));
    }
  }
  SPR.player = [...]; SPR.spitterBall = ...; // etc.
}
```

- Canvas de sprite: `(r*2+8)*SCALE` quadrado, `SCALE = 2` para nitidez em telas retina.
- Rotação: `round(angle / (Math.PI/4)) % 8`. Passo de 45° — suficiente para topdown e barato.
- Corpo desenhado **para cima** (norte) na rotação 0; as outras rotações rotacionam o próprio ctx
  antes de desenhar (pré-render, custo zero em runtime).
- Boss: gerar sprites 1× na entrada da onda (aceitável, custa alguns ms).
- **Nunca** chamar `ctx.rotate`/`ctx.save` por zumbi no desenho final — só `drawImage`.

Funções de desenho base (`drawZombieToCanvas(def, rot, frame, elite)`):
`roundRect` para torso, 2 círculos para olhos (glow fraco), 2 retângulos para pernas alternando
`sin(frame*PI)`, braços como `lineCap:'round'` com `lineWidth` grosso. Aura dourada = `shadowBlur` +
anel por trás, só nas elites (elas são poucas).

---

## 5. Entrada

```js
const Input = {
  keys:{}, mouse:{x:0,y:0,down:false,worldX:0,worldY:0, moved:false},
  poll(){ /* lê keys, converte para intents */ },
  axis(){ /* retorna {x,y} normalizado de WASD/setas */ }
};
```
- `mousemove` → guarda posição em coordenadas de tela; converte pra mundo com `cam` no `poll`.
- `keydown` só dispara ação em `!e.repeat` para dash/fúria/pausa (não repetir cooldown).
- No `LEVELUP`, teclado 1/2/3 escolhe carta; setas + Enter também; Esc volta ao título **com
  confirmação** (segurar 1s ou segundo Esc) — evitar perder a run por engano.

---

## 6. Áudio

```js
const Audio2 = {
  ctx:null, master:null, voices:0, MAX:12,
  init(){ this.ctx = new (window.AudioContext||window.webkitAudioContext)(); ... },
  // must be resumed on first user gesture (click/keydown) — obrigatório no Chrome
  beep(freqA, freqB, dur, type, vol, noiseMix){ ... },
  shoot(), hit(), death(), levelUp(), hurt(), bossRoar(), boom(), pickup()
};
```
- `init()` chamado no primeiro `keydown`/`click` (política de autoplay).
- Cada som: `OscillatorNode` + gain ADSR simples (ataque 5ms, decay linear até 0).
- Ruído: 1 buffer de 1s gerado 1×, tocado via `AudioBufferSourceNode` + `BiquadFilter` (bandpass).
- Contar vozes ativas; se `voices >= MAX`, **descartar** o novo som (nunca enfileirar — áudio atrasado
  é pior que áudio faltando).
- `master.gain.value = settings.volume` (0–1); "modo streamer" = 0.

---

## 7. Save

```js
const SAVE_KEY = 'hordas2d_save_v1';
// { souls:0, best:{wave:0,time:0,kills:0}, perm:{dmg:0,hp:0,speed:0,magnet:0,xp:0,cdr:0,revive:0},
//   totalRuns:0, totalKills:0, unlocked:[] }

const SET_KEY = 'hordas2d_settings_v1';
// { volume:0.7, shake:true, damageNumbers:true, lowFx:false, streamer:false }
```
- `load()` com `try/catch`, valida campos com `??` (se save antigo, mescla default).
- `save()` com `debounce` de 400ms (não escrever a cada gema coletada).
- Botão "ZERAR SALVE" no título pede confirmação por 2s.

---

## 8. UI (desenhada no canvas, não em DOM)

- Fontes: `bold 16px monospace`, títulos `bold 42px monospace`; sempre `textAlign`/`textBaseline` setados.
- HUD: barra de vida (esq. cima, 220×14, com texto `HP 87/120`), barra de XP (topo, largura total, 6px,
  ciano), onda/tempo centralizado, kills canto direito, almas com ícone de gema roxa.
- 4 ícones de habilidade no rodapé esquerdo, 46×46, com **anel de cooldown** (`arc` de 0 a 2π·pct).
- Boss: barra vermelha larga no topo, com nome + fases (2 riscos de divisão).
- Cartas de level up: 3 retângulos 300×180, entrada animada (`easeOutBack` 0.25s), raridade por moldura.
- `ctx.imageSmoothingEnabled = false` na renderização de sprites; `true` nos gradientes de UI.

---

## 9. Performance — checklist

- [ ] Nenhuma alocação de array/objeto dentro do loop de desenho.
- [ ] Partículas em **pool fixo de 400**, reciclagem por índice (`particleCursor++ % 400`).
- [ ] Textos de dano: pool de 60; se cheio, sobrescreve o mais antigo.
- [ ] `zombies.length` travado em `CFG.MAX_ZOMBIES` (380–420); spawn não passa disso.
- [ ] Grid reconstruído 1×/frame; consultas usam buffer.
- [ ] Projéteis removidos no mesmo laço por **swap-pop** (`arr[i]=arr[arr.length-1]; arr.pop()`),
      nunca `splice` no meio de loop grande.
- [ ] `drawImage` de sprites pré-renderizados (sem path por entidade).
- [ ] FPS counter (tecla F3) para medir durante o desenvolvimento — pode ficar escondido.
- [ ] Se `settings.lowFx`: desligar partículas de sangue, sombras e numerais de dano.

Meta: **300 zumbis + 200 projéteis + 400 partículas ≥ 58 FPS** num notebook comum.

---

## 10. Casos de borda a tratar (senão vira bug chato)

| Caso | Tratamento |
|---|---|
| Zumbi morre no mesmo frame que acerta o jogador | Aplicar dano primeiro, remover depois (ordem 6→7). |
| Projétil atravessa zumbi no mesmo frame | Verificar colisão por **segmento** (dist ponto-segmento), não por ponto. |
| Boss spawna fora da arena | Sempre `clamp` na arena com margem 200px. |
| Level up durante o respiro de onda | Permitir; o timer de respiro pausa junto. |
| Matar todos os zumbis | Não encerra a onda (a onda é por tempo), só dá leve respiro. |
| Aba perde foco | `document.hidden` → pausar; no retorno, descartar o `dt` acumulado. |
| Janela redimensiona | Recalcular escala do canvas; câmera não muda. |
| `localStorage` bloqueado | Fallback em objeto memória + aviso discreto no título. |
| Perfuração de projétil | `hitIds` para não acertar o mesmo zumbi 2×; `pierce--` ao acertar novo alvo. |
| Onda 30+ | Clampar `dmgMul` e `hpMul` em `Math.min(..., 60)` para não estourar. |
| Fúria ativa ao morrer | Encerrar timers e efeitos visuais na transição pra GAMEOVER. |

---

## 11. Camada de "juice" (ordem de impacto/custo)

1. **Screen shake** no impacto/chicote (3px comum, 8px explosão, 14px boss) — custo zero, impacto alto.
2. **Flash branco** de 60ms no sprite que toma dano (`globalCompositeOperation='lighter'` num selo).
3. **Números de dano** subindo com fade; críticos maiores e amarelos.
4. **Partículas de sangue** (cor `#e0533f`/`#8a1f2b`), 8 por hit, gravidade leve.
5. **Piscada de invencibilidade** no jogador (alpha alternando a cada 60ms).
6. **Fade de entrada** de zumbis (nascem com alpha 0 → 1 em 120ms) pra não "pipocar".
7. **Freeze frame** de 40ms na morte do boss (`G.hitstop`) — o jogo congela por 2 frames.
8. **Vignette** vermelha pulsante com HP < 30%.

---

## 12. Checklists de aceite por marco (usar na validação)

### Marco 1
- [ ] `index.html` abre por duplo-clique, sem erro no console (F12 limpo).
- [ ] Jogador anda nas 8 direções na mesma velocidade; diagonal não é mais rápida.
- [ ] Tiro sai sozinho no zumbi mais próximo; sem alvo, atira na direção do mouse.
- [ ] Zumbi toma dano, pisca, morre, solta gema; gema é atraída dentro do ímã.
- [ ] Barra de XP enche, jogo pausa, 3 cartas aparecem, escolha por clique **e** por 1/2/3.
- [ ] Zumbi encostando tira vida; jogador pisca; barra de vida desce; morre → GAME OVER.
- [ ] `R` reinicia do zero (vida, XP, onda, zumbis).
- [ ] HUD legível: vida, XP, onda, tempo, kills.
- [ ] 3 minutos de jogo sem travar, sem entidade "fantasma" e sem NaN.

### Marco 2
- [ ] 7 tipos aparecem nas ondas certas (doc 04, seção 2) e são distinguíveis em 0,2s.
- [ ] Elites (aura dourada) a partir da onda 3, com mais vida/dano e drop maior.
- [ ] Boss na onda 5 com barra de vida, 3 ataques e invocação; ao morrer, respiro de 4s.
- [ ] 4 habilidades funcionam por teclado, com anel de cooldown no HUD e CD que não corre em pausa.
- [ ] 18+ cartas de melhoria implementadas, máx. 5 níveis, sem repetir na mesma oferta.
- [ ] Drops de kit médico, ímã e granada aparecem e funcionam.
- [ ] Almas são salvas e sobrevivem ao recarregar a página; a loja compra e aplica o efeito.
- [ ] Sangue, números de dano, flash e shake acontecendo sem exagero.
- [ ] Onda 10+ alcançável numa run normal (a dificuldade não é intransponível nem trivial).

### Marco 3
- [ ] Sons: tiro, hit, morte, level up, dano no jogador, explosão, boss (nada de som "estourado").
- [ ] Volume ajustável e persistido; modo mudo funciona.
- [ ] Título, COMO JOGAR, CONFIG, pausa e game over navegáveis **só por teclado**.
- [ ] Pausa automática ao trocar de aba; retomada não dá "salto" de tempo.
- [ ] Vinheta vermelha abaixo de 30% de vida.
- [ ] Game over mostra tempo, onda, kills, almas, recorde; novo recorde destacado.
- [ ] 300 zumbis: 58+ FPS e nenhum pico de GC perceptível (memória estável em 2 min).
- [ ] Redimensionar a janela não quebra o canvas nem a câmera.
- [ ] `docs/GDD.md` e `README.md` descrevem exatamente o que existe no jogo.
