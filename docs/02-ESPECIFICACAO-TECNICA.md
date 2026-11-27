# ESPECIFICAÇÃO TÉCNICA

> Documento 3 de 6. É o **como implementar**: arquitetura, formato de mapa, loop, IA, grid, performance,
> save e checklists. Quem implementa segue as seções na ordem.

---

## 1. Plataforma e restrições (é o que mais quebra — leia duas vezes)

- `index.html` + `game.js` carregado por `<script src="game.js">` em **IIFE**, **não** `type="module"`
  (módulo ES não roda em `file://` por CORS). Isso é decisão fechada: o jogo tem que abrir com duplo-clique.
- Nada de `fetch`, `import`, `<img>`, `<audio>`, fonte web, CDN.
- Canvas dimensionado por `devicePixelRatio` (máx 2) com resolução lógica de **1280 × 720**, escalado por
  CSS mantendo proporção e letterbox. A câmera **não** muda de zoom com a janela.
- `preventDefault()` em setas, espaço, Tab, Esc, F3 e no botão direito do mouse.
- `document.hidden` → pausa automática; ao voltar, descarta o `dt` acumulado.

### Arquivos

```
/index.html          canvas + CSS (fundo #1b1620) + <script src="game.js">
/game.js             engine + todos os sistemas (IIFE, ~4.000 linhas, em seções)
/maps.js             SÓ os dados dos mapas (IIFE que registra em window.MAPS)
/README.md
/docs/…
```

`maps.js` separado é requisito do briefing ("mapas organizados, expansíveis"): dá pra abrir, copiar um
bloco, mudar o nome e já ter um mapa novo.

---

## 2. Arquitetura

Estado global explícito, sem classes de jogo (objetos literais, tudo serializável):

```js
const CFG = { W:1280, H:720, TILE:100, CELL:80, MAX_ZOMBIES:220, ... };

const G = {
  screen:'LOBBY',           // LOBBY|LOADING|PLAYING|PAUSED|GAMEOVER|SHOP|CONFIG|SCORES
  mapId:null, map:null,     // dados do mapa carregado
  t:0, dt:0, hitstop:0, time:0,
  horde:0, remaining:0, phase:'PREP'|'FIGHT'|'BREAK',
  phaseTimer:0, spawnQueue:[],
  players:[ /* 1 no solo */ ],   // <-- SEMPRE array (prontidão MP)
  zombies:[], bullets:[], eBullets:[], coins:[], parts:[], texts:[], pickups:[],
  barricades:[], turrets:[], purchases:[],
  cam:{x,y,shake,lookX,lookY},
  grid:null, rng:{seed, state},
  meta:{souls, perm:{...}, best:{...}, stats:{...}},
  settings:{volume, autoFire, shake, dmgNumbers, lowFlash, streamer},
  runStats:{kills, coinsEarned, dmgTaken, startTime, hordeReached}
};
```

`players[]` com 1 elemento no solo: **toda** função de dano/compra/coleta recebe `playerId`. Nenhum
`G.player` global. Isso é o que transforma o solo em coop depois sem refatorar.

### Ordem fixa do update (não reordenar)

```
1 Input.poll()
2 updatePhase(dt)        // PREP → FIGHT → BREAK
3 updatePlayers(dt)      // movimento, colisão, mira, tiro, recarga, perks
4 updatePurchases(dt)    // barra de compra no ponto
5 updateBullets(dt)      // tiros do jogador (grid)
6 updateZombies(dt)      // IA, ataque em barricada/torreta/jogador, separação
7 updateEnemyBullets(dt)
8 updateDefenses(dt)     // barricadas (HP, quebra), torretas (mira, tiro, munição)
9 resolveCollisions(dt)  // empurrão jogador↔zumbi, limites
10 updateCoins/Pickups(dt)
11 updateFx(dt)          // partículas, textos, shake, sangue
12 updateCamera(dt)
13 render()
```

Render: **chão do mapa → manchas de sangue (camada) → sombras → entidades ordenadas por `y` →
projéteis → FX → HUD**. Ordenar por `y` é o que faz o topdown parecer ter profundidade sem perspectiva.

---

## 3. Formato de mapa (o requisito nº 1 do projeto)

Mapa = ** objeto de dados puro**, sem função, sem canvas, sem referência a entidade. Estilo Tiled simplificado:

```js
{
  id:'telhados', name:'TELHADOS', subtitle:'Cobertura do Edifício Aurora',
  locked:false, difficulty:1,
  size:{tw:32, th:32, tile:100},
  palette:{ floor:'#4a4f57', floorLine:'#3c4048', wall:'#8b8175', wallTop:'#a89c8c',
            accent:'#d6c9a8', fog:'#1b1620' },
  // paredes: retângulos em TILES (x,y,w,h) -> viram AABB de colisão
  walls:[ {x:0,y:0,w:32,h:0.4,kind:'parapet'}, {x:8,y:12,w:8,h:6,kind:'room'}, ... ],
  // obstacles: props decorativos COM colisão (ar-condicionado, caixa d'água, duto)
  obstacles:[ {x:4,y:3,w:2,h:2,kind:'ac'}, {x:20,y:3,w:3,h:3,kind:'watertower'}, ... ],
  // decor: SEM colisão (pintura de chão, poças, heliponto, rachaduras)
  decor:[ {x:18,y:14,w:6,h:6,kind:'helipad'}, {x:2,y:26,w:4,h:4,kind:'puddle'}, ... ],
  // vagas de construção (posição + rotação) — o jogador só constrói aqui
  barricadeSlots:[ {x:5.5,y:6.5,rot:0}, ... 7 itens ],
  turretSlots:[ {x:24.5,y:14.5}, ... 4 itens ],
  // pontos de compra
  buyPoints:[
    {x:2.5,y:11.5,rot:1,type:'weapon',weapon:'shotgun',cost:500},
    {x:29.5,y:7.5,rot:1,type:'ammo',cost:120},
    {x:29.5,y:20.5,rot:1,type:'upgrade',cost:600}
  ],
  // pontos de spawn de zumbi (com prioridade de distância do jogador)
  spawns:[ {x:1,y:1},{x:30,y:1},{x:1,y:30},{x:30,y:30},{x:12,y:12},{x:15,y:12},{x:16,y:31} ],
  // zonas nomeadas (usadas por IA, dicas e debug)
  zones:[ {id:'helipad',name:'HELIPONTO',x:18,y:14,w:6,h:6},
          {id:'machines',name:'CASA DE MÁQUINAS',x:8,y:12,w:8,h:6} ],
  ambient:{ tint:'#2a2030', vignette:0.25, props3d:['cityFire'] }, // fundo decorativo fora do mapa
  tips:['Barricadas atrasam, não prendem. Repare antes de quebrar.']
}
```

**Derivação (feita 1× no load, nunca no frame):**
- `walls`/`obstacles` (tiles) → array de AABB em pixels (`solidRects`).
- Chão → 1 canvas offscreen 3200×3200 desenhado **uma vez** (laje, emendas, decor) e depois só
  `drawImage` do pedaço visível. É o que permite mapa bonito sem custo por frame.
- Grafo de navegação simples: grade de 100px com células bloqueadas; A* só quando um zumbi fica preso
  (nunca por zumbi por frame).

**Regras:** engine não conhece nenhum id específico de mapa. Achar vaga/placa mais próxima é busca em
`map.barricadeSlots` etc. Criar mapa novo = novo bloco em `maps.js` + card no lobby (lista `MAPS`).

---

## 4. Colisão

- **AABB × círculo** (jogador e zumbi são círculos). Resolver eixo por eixo (move X, resolve, move Y,
  resolve) para deslizar em parede sem travar.
- Separação de zumbis: vizinhos no grid (raio `r*1.6`), empurrão `overlap*0.45`, limitado — 1 iteração só.
- Barricada = AABB com HP; zumbi que colide troca para estado `attack` (para, bate em ritmo).
- Tiro: colisão **por segmento** (distância ponto-segmento) para não atravessar zumbi em alta velocidade.
- Tirar projétil de dentro de parede: se o segmento cruzar `solidRects`, morre no impacto (com faísca).

---

## 5. Grid espacial

```js
class Grid { constructor(size, cell){...} clear(){...} insert(e){...}
  queryCircle(x,y,r,out){...} queryRect(rect,out){...} }
```
- Reconstruído **1× por frame** com zumbis vivos. Célula 80px.
- Usado por: mira do jogador, mira da torreta, colisão de tiro, explosão, IA de curto alcance.
- Buffer reaproveitado (`Grid.out`) — zero alocação por consulta.

---

## 6. IA dos zumbis (comportamento, não pathfinding caro)

Máquina de estados simples por zumbi: `spawn → chase → attack → stagger → dead`.
- `chase`: vetor direto ao alvo. Se colidir com parede 2 frames seguidos **e** distância > 300 px,
  entra em `detour` por 1,2 s usando A* na grade de 100px (cacheado por 0,5 s por célula de origem).
- Alvo: jogador mais próximo com linha de visão; sem visão, o mais próximo em linha reta.
- Zumbi que alcança uma **barricada** no caminho entra em `attack` (bate nela) — é o comportamento central.
- Zumbi que alcança uma **torreta** e ela está mais perto que o jogador: prioriza a torreta 30% das vezes.
- `frenético`: aceleração em 3 fases (andar → windup 0,25 s → dash 0,55 s).
- `espreitador`: desova em spawns marcados `surface:'roof'`, fica invulnerável e semi-transparente por
  1,2 s no ponto alto, cai e passa a perseguir.
- `cuspidor`: mantém 200–260 px, recua se o jogador chega perto, cospe projétil em arco.
- Cada zumbi tem `thinkTimer` (0,15 s + jitter) — IA não roda todo frame para todos.

---

## 7. Render

- **Mapa pré-renderizado** (1 canvas por mapa, 3200×3200) → `drawImage` do viewport.
- **Sprites de entidade pré-renderizados** em canvas offscreen: jogador e cada tipo de zumbi com
  **4 direções × 3 estados** (andar 4 frames, atacar 2, morrer 3). Rotação NÃO é por sprite: o corpo usa
  4 poses (N/S/L/O) — silhueta cartoon fica melhor e economiza memória.
- **Camada de sangue**: canvas próprio, entre chão e entidades, com fade global a cada 12 s
  (`globalAlpha` 0,012 por frame). Poças somem, o chão não fica imundo pra sempre.
- Ordenar por `y` só o que desenha (array `drawList` reaproveitado, `sort` nativo — 200 itens é barato).
- Partículas em **pool de 500**, reciclagem por índice. Textos em pool de 40.
- Nada de `ctx.save/restore` por entidade: `setTransform` calculado manualmente.

---

## 8. Áudio

`Audio2` com `ctx` criado no primeiro gesto do usuário (política de autoplay do Chrome).
`master → sfx` (gain) e `master → pad` (ambiente). Limite de **12 vozes**; se estourar, descarta o novo.
Ruído branco num `AudioBuffer` de 1 s reaproveitado. Tudo com envelope curto (attack 3–8 ms).
Config: volume (0–1), mudo (modo streamer).

---

## 9. Save (localStorage)

```js
'hordas_save_v1'    → { souls:0, perm:{weaponStarter:0, vitality:0, barricadeHp:0, turretCost:0, luck:0, magnet:0},
                        best:{horde:0,time:0,kills:0,coins:0}, stats:{runs:0,kills:0,hordes:0}, scores:[...] }
'hordas_settings_v1'→ { volume:.7, autoFire:false, shake:true, dmgNumbers:true, lowFlash:false, streamer:false }
```
Leitura com `try/catch` e merge de defaults (`??`) para save antigo não quebrar. Escrita com debounce de
500 ms. "Apagar progresso" no CONFIG pede confirmação segurando 2 s.

---

## 10. Performance — checklist

- [ ] Chão do mapa em canvas offscreen (nunca redesenhar laje por frame).
- [ ] Sprites de entidade pré-renderizados; zero `beginPath` no loop de entidades.
- [ ] Blood canvas separado, limpo por fade, não por `clearRect` por frame.
- [ ] Grid 1×/frame; consultas com buffer.
- [ ] Remoção por **swap-pop** (nunca `splice` no meio de loop grande).
- [ ] `MAX_ZOMBIES` 220 (solo) / 300 em stress test.
- [ ] Partículas 500, textos 40, sangue limitado a 60 respingos por horda.
- [ ] IA com `thinkTimer` (nunca todos os zumbis pensando todo frame).
- [ ] `lowFx` desliga partículas, shake e números de dano.
- [ ] F3 mostra FPS, contagem de entidades e tempo de update/render.

Meta: **150 zumbis + 4 torretas + 300 partículas ≥ 58 FPS** num notebook comum.

---

## 11. Casos de borda

| Caso | Tratamento |
|---|---|
| Zumbi morre no mesmo frame que acerta | Dano primeiro, remoção depois (ordem 6→7). |
| Tiro atravessa zumbi rápido | Colisão por segmento. |
| Compra durante a trégua e a horda começa | Compra continua válida; barra de progresso não pausa. |
| Barricada destruída com zumbi em cima | Zumbi retoma `chase`, sem ficar preso na AABB morta. |
| Torreta sem munição | Para de atirar, mostra ícone vermelho acima, continua alvo. |
| Vaga ocupada + jogador tenta construir | Aviso "VAGA OCUPADA" e desconta nada. |
| Moeda insuficiente | Aviso vermelho, som seco, sem desconto. |
| Espreitador cai dentro de parede | `clamp` no spawn para célula livre mais próxima. |
| Jogador se entoca entre 2 paredes com horda | Zumbis quebram barricada; se não houver, atacam a parede (destruível só em modo caos >horda 40). |
| Horda 60+ | Clampar multiplicadores em `Math.min(..., 40)` para não estourar. |
| Alt-tab durante FIGHT | Pausa; timers congelam. |
| Mapa sem spawn válido | Loader valida e lança erro claro no console + card desabilitado. |

---

## 12. Checklists de aceite por marco

### MARCO 1 — Base + Mapas
- [ ] Abre por duplo-clique, console limpo.
- [ ] Lobby desenha 6 cards de mapa; 5 com cadeado `EM BREVE` e não clicáveis.
- [ ] Clicar em TELHADOS → fade → partida com o mapa completo.
- [ ] Andar nas 8 direções, velocidade igual (diagonal normalizada).
- [ ] Não atravessa parapeito, casa de máquinas, AC, caixa d'água nem duto.
- [ ] Desliza em parede sem travar; câmera segue com amortecimento.
- [ ] Esc volta ao lobby.
- [ ] HUD mínimo (vida/moeda) aparece e não cobre o centro.
- [ ] Trocar `mapId` no lobby carrega outro mapa **sem** mudar engine (teste com um 2º mapa de teste).
- [ ] Criar um mapa novo mexe só em `maps.js`.

### MARCO 2 — O jogo
- [ ] Horda 1 começa com 6 zumbis, termina em abate total, `restam` chega a 0.
- [ ] Trégua de 6 s entre hordas com resumo e sem spawn.
- [ ] Zumbis 1–10 fracos; 11–20 mais numerosos; 21–30 resistentes; 31+ especiais aparecem.
- [ ] 7 tipos implementados e distinguíveis em 0,2 s.
- [ ] Moeda entra por abate; HUD atualiza; bônus de horda limpa funciona.
- [ ] Comprar arma na parede troca o slot ativo; munição reabastece; upgrade aplica.
- [ ] Arma sem munição não atira; `R` recarrega; recarga reduz velocidade.
- [ ] Barricada: custo 50 → 80 → 90, tem HP, zumbi bate e quebra, `E` repara.
- [ ] Torreta: mira, atira, gasta munição, recarrega por moeda, pode ser destruída.
- [ ] Perk aparece em 6 s sem pausar; 1/2/3 escolhe; máx 3 slots.
- [ ] Game over com resumo correto (horda, tempo, abates, moedas).
- [ ] Uma run chega à horda 15 sem bug nem travamento.

### MARCO 3 — Lobby, meta e polimento
- [ ] Almas acumulam por regra do doc 04 e persistem após recarregar.
- [ ] Loja compra, aplica efeito real e bloqueia no máximo.
- [ ] Recordes salvos e exibidos; novo recorde destacado.
- [ ] Config afeta o jogo de verdade (volume, auto-fire, shake, lowFx, streamer).
- [ ] Áudio: tiro, recarga, impacto, moeda, construção, quebra, horda limpa, dano, morte.
- [ ] Pausa com Esc e automática ao trocar de aba; retomada sem salto.
- [ ] 150 zumbis ≥ 58 FPS; stress 300 sem travar.
- [ ] Redimensionar janela não quebra canvas, câmera nem HUD.
- [ ] `docs/MAPAS.md` permite criar mapa novo em <1h (testado com um exemplo).
- [ ] README e GDD descrevem exatamente o que existe.
