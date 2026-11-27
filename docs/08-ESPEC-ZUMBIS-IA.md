# ESPECIFICAÇÃO — ZUMBIS E INTELIGÊNCIA ARTIFICIAL

> Documento 8 de 16. Arquivos: `zombies.js` (comportamento), `navigation.js` (caminho),
> `entities.js` (fábrica). Este é o documento que evita os dois bugs mais graves do gênero:
> **zumbi preso** e **zumbi dentro da parede**.

---

## 1. O modelo de IA (3 camadas)

```
CAMADA 1 — NAVEGAÇÃO (navigation.js)
  flow field em grade de 50 px: "para qual célula eu vou agora?"
  computado uma vez por recálculo, serve para TODOS os zumbis.
  custo: O(células) = 64x64 = 4096 — trivial.

CAMADA 2 — COMPORTAMENTO (zombies.js)
  máquina de estados por zumbi: qual é a intenção?
  (chase / windup / dash / attack / kite / telegraph / rise / stagger)

CAMADA 3 — MOVIMENTO LOCAL (zombies.js)
  direção do flow field + separação de vizinhos + esquiva de parede
  + colisão AABB×círculo (a mesma do jogador).
```

**Por que flow field e não A* por zumbi:** todos perseguem o mesmo alvo. Com 80 zumbis vivos, A* por zumbi
seria 80 buscas por segundo. O flow field é 1 varredura para todos. A spec pede "pathfinding para não
ficar preso" — flow field **é** pathfinding, só mais adequado ao caso.

---

## 2. Flow field — algoritmo exato

### 2.1 Grade

```
célula = CFG.VIEW.NAV_CELL (50 px)
cols = ceil(mapWidth / 50); rows = ceil(mapHeight / 50)
blocked: Uint8Array(cols*rows)     // 1 = parede/obstáculo/barricada
dist:    Uint16Array(cols*rows)    // 65535 = inalcançável
flow:    Float32Array(cols*rows*2) // direção normalizada (dx,dy)
```

### 2.2 Marcar bloqueios (feito no load do mapa e quando uma estrutura muda)

Uma célula é **bloqueada** se o centro dela estiver dentro de qualquer AABB sólido
(parede, obstáculo, barricada viva). Barricada de rastejante **não** bloqueia para ele — tratado na
camada de comportamento, não no campo (senão o campo ficaria inconsistente para os outros).

### 2.3 Construir o campo (BFS multi-fonte a partir do jogador)

```
buildField(playerCell):
  dist.fill(65535)
  fila = [playerCell]; dist[playerCell] = 0
  enquanto fila não vazia:
     c = fila.shift()
     para cada vizinho v (4 direções, sem diagonal):
        if (blocked[v]) continue
        if (dist[v] <= dist[c] + 1) continue
        dist[v] = dist[c] + 1
        fila.push(v)
  // agora o gradiente: cada célula aponta para o vizinho com menor dist
  para cada célula c livre:
     melhor = null; bestD = dist[c]
     para cada vizinho v:
        if (dist[v] < bestD) { bestD = dist[v]; melhor = v }
     if (melhor) flow[c] = normalize(centro(melhor) - centro(c))
     else       flow[c] = (0,0)
```
- Usar **fila circular** (array + índice), não `shift()` — `shift` em 4096 elementos é lento.
- Células inalcançáveis (`dist === 65535`) recebem fluxo na direção da célula livre mais próxima
  (fallback), para nunca ficar com vetor zero no meio do mapa.

### 2.4 Quando recalcular

| Evento | Recalcular |
|---|---|
| Jogador mudou de célula | sim |
| Barricada construída | sim |
| Barricada destruída | sim |
| Zumbi morreu | **não** (o campo não depende de zumbis) |
| A cada 0,5 s (rede de segurança) | sim |

Com 2 recálculos por segundo, o custo é ~8k operações/s — irrelevante.

### 2.5 Debug (F3)

Desenhar setas do flow field no overlay, células bloqueadas em vermelho e células inalcançáveis em roxo.
Isso é obrigatório: é como se prova que o pathfinding funciona.

---

## 3. Movimento local do zumbi (o que evita "preso")

```
função moveZombie(z, dt):
  celula = cellOf(z.x, z.y)
  dir = flow[celula]
  // 1) se a célula está bloqueada (zumbi empurrado para dentro de parede), corrigir:
  if (blocked[celula]) { reposicionarParaCelulaLivreMaisProxima(z); return }

  // 2) direção desejada = fluxo + ruído individual (evita fila indiana perfeita)
  ang = atan2(dir.y, dir.x) + sin(t*1.7 + z.seed) * 0.10
  vx = cos(ang) * z.speed
  vy = sin(ang) * z.speed

  // 3) separação de vizinhos (grid espacial, raio r*1.7)
  para cada vizinho:
     overlap = (r1+r2) - dist
     if (overlap > 0) { vx += nx * z.speed * overlap/(r1+r2) * 0.9; ... }

  // 4) colisão por eixo (mesma do jogador): desliza em parede
  moverEixoX(vx*dt); moverEixoY(vy*dt)

  // 5) detector de travamento
  if (|z.x - z.lastX| + |z.y - z.lastY| < 2) z.stuckT += dt
  else z.stuckT = 0; z.lastX = z.x; z.lastY = z.y

  if (z.stuckT > CFG.ZOMBIE_STUCK_TIME) {
      // escolher a estrutura sólida mais próxima (barricada) e atacar
      // se não houver estrutura, desvio aleatório por 0,6 s
  }
```

**Regra de ouro:** um zumbi nunca pode ficar mais de 2 s sem se mover. Se acontecer, é bug e o teste
automatizado deve falhar.

---

## 4. Máquina de estados (base)

```
ESTADOS: spawn → chase → (attack | attackStruct | dash | telegraph | kite | rise) → dead
spawn      : 0,35 s aparecendo (alpha 0→1), imune a dano? NÃO (pode morrer nascendo: é satisfatório)
chase      : anda pelo flow field em direção ao jogador
attack     : colado no jogador, dá dano a cada CFG.ZOMBIE_DMG_COOLDOWN
attackStruct: colado em barricada/torreta, aplica DPS contínuo
dead       : sprite de morte 0,25 s, depois remove da lista
```
Transições:
- `chase → attack` quando `dist < hitbox + player.radius + 2`.
- `chase → attackStruct` quando a célula à frente está bloqueada por barricada **ou** quando
  `hitsBarricade(z.x,z.y,r+3)` for verdadeiro.
- `attackStruct → chase` quando a estrutura é destruída.
- `dead` é terminal.

---

## 5. Comportamento por tipo (números exatos)

### 5.1 Comum (`chase`)
```
anda direto pelo flow field, com ruído lateral sin(t*1.6+seed)*0.16 rad
nenhum ataque especial; dano por contato
```

### 5.2 Frenético (`dash`)
```
estado chase:  anda a 128 px/s; a cada 1,1 s entra em windup
windup 0,25 s: PARA no lugar, sprite agachado (escala 1,06), som de grunhido
dash 0,55 s:   190 px/s na direção do jogador TRAVADA no início do dash (não persegue durante)
               ao final, volta para chase e reinicia o ciclo
dano: 15 por contato
fraqueza: durante o windup ele fica parado — é a janela de tiro
```

### 5.3 Tanque (`push`)
```
anda a 52 px/s (lento de propósito)
ao encostar: aplica empurrão de 240 px/s no jogador (empurra 30 px)
é imune a empurrão de explosão
HP 380 — exige arma comprada ou Brasa para cair rápido
spawn limitado: nunca mais de 2 vivos antes da horda 25
```

### 5.4 Explosivo (`explode`)
```
anda a 95 px/s
quando dist < 46 px → telegraph de 0,45 s (pisca amarelo, som de bipe acelerando)
ao fim do telegraph OU ao morrer → explode:
   raio 90, dano 45 no jogador (com queda linear), dano em barricadas/torretas 120
   dano em outros zumbis: 60 (fogo amigo — é divertido e ajuda o jogador)
   NÃO explode duas vezes, mesmo se morrer durante o telegraph
```

### 5.5 Cuspidor (`kite`)
```
distância alvo: entre 200 e 262 px do jogador
se dist < 200  → recua (anda na direção oposta) a 55 px/s
se dist > 262  → aproxima a 55 px/s
se dentro da faixa → fica parado e mira
atira a cada 2,6 s: projétil verde 300 px/s, vida 2 s, dano 10
nunca atira sem linha de visão (usa lineClear)
se o jogador encosta (< 40 px) → tenta recuar mesmo atirando
```

### 5.6 Rastejante (`low`)
```
hitbox 11 px (difícil de acertar), desenho baixo e achatado (rasteja)
anda 88 px/s com zigue-zague: ang += sin(t*2.2+seed)*0.5
atravessa barricada: quando o caminho passa por barricada, ignora-a e atravessa
  a 1/3 da velocidade enquanto sobrepõe a AABB
não é bloqueado por ela no flow field (tratado no comportamento)
dano 8 — é enxame, não ameaça individual
```

---

## 6. Dano e morte

```
applyDamage(z, dano, crit):
  if (!z.alive) return
  if (z.state === 'rise') return   // espreitador (backlog) invulnerável enquanto surge
  z.hp -= dano
  z.flash = 0.07
  if (z.hp <= 0) z.die()
```

`die()`:
1. `z.alive = false` (não remover do array agora!)
2. Moedas: `p.coins += z.def.coin * coinMul`, texto flutuante dourado `+N`
3. Sangue no chão (6 elipses) + 10 partículas
4. Sprite de morte (3 frames) por 0,25 s
5. Chance de kit médico / pacote de munição / moeda extra
6. Som de morte
7. Se era explosivo → explode (com fogo amigo)
8. `z.removeAt = G.t + 0.25` → remoção feita no fim do frame, por swap-pop

**Nunca** remover do array durante o `for`. É o bug nº 1 dessa arquitetura.

---

## 7. Spawn

```
escolher tipo: sorteio ponderado entre os tipos liberados (minHorde <= Game.horde)
  peso = def.weight * (horde >= 30 && minHorde >= 20 ? specialWeightMul : 1)

escolher ponto: entre os map.spawns, preferir distância > 480 px do jogador
  (embaralhar a lista e pegar o primeiro válido; fallback = o mais distante)

posição final: ponto + jitter de ±40 px
validação: célula deve estar livre; se não, procurar célula livre em raio de 2 células
nunca spawnar na tela do jogador? NÃO — pode spawnar, mas nunca a menos de 480 px
```

---

## 8. Performance

| Regra | Motivo |
|---|---|
| `thinkTimer` de 0,15–0,23 s por zumbi | não recalcular alvo todo frame |
| Separação com grid espacial | O(n) e não O(n²) |
| Flow field 2×/s | barato e suficiente |
| Sprites pré-renderizados | desenho é `drawImage` puro |
| Cap `maxZombies` = 140 | segurança de frame rate |
| Remoção por swap-pop | sem realocação de array |

Meta: **140 zumbis + 40 projéteis + 300 partículas ≥ 58 FPS**.

---

## 9. Checklist de aceite

- [ ] Nenhum zumbi atravessa parede em 10 minutos de simulação.
- [ ] Nenhum zumbi fica parado mais de 2 s sem atacar algo.
- [ ] Zumbi contorna a casa de máquinas (Telhados) para chegar ao jogador.
- [ ] Ao construir barricada no corredor, os zumbis passam a atacá-la em vez de contornar eternamente.
- [ ] Ao quebrar a barricada, eles voltam a fluir pelo corredor aberto.
- [ ] Frenético tem janela de windup visível.
- [ ] Explosivo faz telegraph e não explode duas vezes.
- [ ] Cuspidor nunca atira através de parede.
- [ ] Rastejante atravessa barricada devagar e é difícil de acertar.
- [ ] Tanque empurra o jogador e não é empurrado.
- [ ] F3 mostra o flow field coerente (setas apontando para o jogador).
