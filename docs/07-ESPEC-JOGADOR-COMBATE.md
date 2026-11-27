# ESPECIFICAÇÃO — JOGADOR, ARMAS E COMBATE

> Documento 7 de 16. Detalhe de execução do que o jogador pode fazer e de como o tiro acerta.
> Arquivos envolvidos: `player.js`, `weapons.js`, `combat.js`, `input.js`.

---

## 1. Input (`js/input.js`)

### 1.1 Mapa de teclas (fixo nesta versão)

| Ação | Tecla |
|---|---|
| Mover | `W A S D` e setas |
| Mirar | mouse (posição) |
| Atirar | botão esquerdo (segurar = automático) |
| Foco manual | botão direito (segurar) |
| Recarregar | `R` |
| Arma 1 / Arma 2 | `1` / `2` |
| Trocar arma | `Q` ou roda do mouse |
| Construir barricada | `B` |
| Construir torreta | `T` |
| Comprar / reparar / interagir | `E` (segurar 0,8 s em compras) |
| Pausa | `Esc` ou `P` |
| Tela cheia | `F` |
| Debug | `F3` |

### 1.2 Regras de input

- `keydown` só dispara ação **uma vez** (`e.repeat` ignorado), exceto movimento.
- `preventDefault` em: setas, espaço, Tab, Esc, F3 e botão direito do mouse.
- Mouse: guardar posição em **coordenadas de tela**; converter para **mundo** no `poll()` usando a câmera
  do frame anterior. Nunca converter dentro de evento (a câmera pode mudar).
- Perder foco (`blur`) → limpar todas as teclas pressionadas (evita "andar sozinho para sempre").
- `document.hidden` → pausar a partida.
- Sensibilidade da mira (config): `worldAngle = atan2( (mouse.y - H/2) * sens, (mouse.x - W/2) * sens )`
  — aplicada ao **alvo do retículo** relativo ao jogador, não à posição bruta.
- Gamepad (opcional, backlog): ler `navigator.getGamepads()` no poll; analógico esquerdo = mover,
  direito = mirar. Não implementar agora, mas **deixar o método `poll()` preparado** com um `if`.

### 1.3 Estrutura

```js
window.InputMgr = {
  keys:{}, pressed:{}, mouse:{x,y,down,right},
  world:{x,y},            // mouse convertido para mundo
  poll:function(){...},   // chamado 1x por frame ANTES de tudo
  axis:function(){...},   // {x,y} normalizado (diagonal corrigida)
  clearPressed:function(){ this.pressed = {}; }
};
```

---

## 2. Movimento do jogador (`player.js`)

```
speedFinal = CFG.PLAYER.speed
           * (foco ? CFG.PLAYER.focusMoveMul : 1)
           * (recarregando ? CFG.PLAYER.reloadMoveMul : 1)
           * (1 + 0.06 * perks.folego)          // perks opcionais
```
- Diagonal: normalizar o vetor antes de multiplicar (nunca somar 1+1 = 1,41 de velocidade).
- Movimento com **colisão por eixo**:
  ```
  tentarMoveX(dx)  → se colidir, não move em X (mas mantém Y)
  tentarMoveY(dy)  → se colidir, não move em Y
  ```
  Resultado: deslizar na parede em vez de travar.
- `clamp` final dentro do mapa.
- Animação: 4 direções (direita/baixo/esquerda/cima) × 4 frames de caminhada, alternados a
  `frequência = 9 * (speedFinal / 210)`.
- Sem input → frame 0 (parado), sem "andar no lugar".

### 2.1 Vida e dano

```
receberDano(valor, origem):
  if (iframe > 0 || !alive) return
  hp -= valor
  iframe = CFG.PLAYER.iframe
  hitFlash = 0.14
  shake += 6
  som hurt
  texto flutuante "-N" vermelho
  8 partículas de sangue
  if (hp <= 0) morrer()
```
- **Não** existe regeneração por padrão. Cura: kit médico (25), compra de kit no mapa (backlog), perks.
- Morte: jogador cai (animação 3 frames), som graves, `deathDelay` de 1,4 s em câmera lenta (zumbis continuam
  andando, jogador não responde), depois `Game.screen = 'GAMEOVER'`.

### 2.2 Interação (`E`)

Prioridade de `E` (nesta ordem, a primeira que casar executa):
1. **Ponto de compra** a menos de `interactRadius` → segurar 0,8 s → compra.
2. **Barricada danificada** a menos de `interactRadius` → repara (custo = 50% do preço atual).
3. **Torreta sem munição** a menos de `interactRadius` → recarrega por 150.
4. Nada → sem ação, sem som (não poluir).

A barra de progresso aparece **acima do objeto**, durante o hold. Soltar `E` antes de 0,8 s cancela.
Se faltar moeda, a compra é negada **no início do hold** (aviso vermelho + som seco), não no final.

---

## 3. Armas (`weapons.js`)

### 3.1 Modelo de dados de uma arma em uso

```js
{
  id:'vetor',                 // chave em CFG.WEAPONS
  mag: 30,                    // balas no pente agora
  reserve: 120,               // balas na reserva (null = infinita)
  up: { dmg:0, mag:0, reload:0 },   // 0 ou 1 (upgrade comprado)
  reloading: 0,               // s restantes
  fireCd: 0                   // s até poder atirar de novo
}
```

### 3.2 Valores derivados (fórmulas exatas — não inventar outra coisa)

```
dmgFinal      = W.dmg * (1 + 0.20 * up.dmg) * playerDmgMul * (foco ? 1.15 : 1)
magMax        = round(W.mag * (1 + 0.50 * up.mag))
reloadTime    = max(0.35, W.reload * (1 - 0.25 * up.reload))
fireInterval  = 1 / W.rate
spreadFinal   = W.spread * (foco ? 0.5 : 1)
rangeFinal    = W.range * (foco ? 1.10 : 1)
```

### 3.3 Disparo — passo a passo

```
tryFire(player):
  w = arma atual
  if (player.reloading > 0) return
  if (arma.fireCd > 0) return
  if (arma.mag <= 0) → startReload(); return

  anguloBase = atan2(mouseWorld.y - player.y, mouseWorld.x - player.x)
  dispersaoRad = spreadFinal * PI/180

  para cada pellet (1..W.pellets):
     ang = anguloBase + rnd(-dispersaoRad, +dispersaoRad)
     // no caso de pellets, distribuir em leque determinístico + ruído:
     // ang = anguloBase + (i - (n-1)/2) * (dispersaoRad * 0.9) + rnd(-0.3,0.3)*dispersaoRad
     criar projétil na boca do cano (player + 18px na direção ang)
     vel = 900 px/s
     dmg = dmgFinal, pierce = W.pierce, splash = W.splash
     life = rangeFinal / 900

  arma.mag -= 1
  arma.fireCd = fireInterval
  shake += W.kick * CFG.UI.shakeScale
  recoil += W.recoil
  som shoot(W.id)   // variação de pitch ±6% para não cansar
  3 partículas de fumaça na boca do cano
  if (arma.mag <= 0) startReload(player)
```

### 3.4 Recarga

```
startReload(player):
  if (reloading > 0) return
  arma = arma atual
  if (arma.mag === magMax) return
  if (arma.reserve !== null && arma.reserve <= 0) { aviso "SEM MUNIÇÃO"; return }
  arma.reloading = reloadTime
  som reload

finishReload(player):
  falta = magMax - arma.mag
  if (arma.reserve === null) arma.mag = magMax            // pistola: infinita
  else { take = min(falta, arma.reserve); arma.mag += take; arma.reserve -= take }
```
- Recarregar deixa o jogador **28% mais lento** (`reloadMoveMul`).
- Trocar de arma (`Q`) **cancela** a recarga em andamento (a arma volta com o pente que tinha).

### 3.5 Troca de arma

- `1` e `2` selecionam slot direto. Slot vazio → aviso "SEM SEGUNDA ARMA", sem som de sucesso.
- `Q` e roda do mouse alternam entre slot 0 e 1.
- Trocar impõe `fireCd = 0.25 s` (evita "metralhadora de troca de arma").
- Arma comprada ocupa o **slot vazio**; se os dois estão cheios, **substitui o slot ativo** e o jogador
  recebe aviso claro de qual arma perdeu antes de confirmar (2 s de "TROCAR? E para confirmar").

### 3.6 Diferenças de comportamento que **precisam** existir

| Arma | O que tem de diferente de verdade |
|---|---|
| Pistola | reserva infinita; nunca fica sem arma; precisão alta; dano baixo |
| Calibre 12 | 6 bagos; letal a < 200 px, quase inútil a 400; **empurra** o zumbi 40 px no impacto |
| Zumbido | 13 tiros/s; dispersão cresce 0,15°/tiro contínuo (cap 8°); zera pente em 3,5 s |
| Vetor | o mais equilibrado; alcance útil 520; boa contra frenético |
| Brasa | perfura 1 zumbi; crosshair fecha mais devagar; melhor DPS contra tanque |
| Estilhaço | explosão de raio 140; **dano em si mesmo não** (só zumbis/estruturas); recarga longuíssima |

Regra de teste: se trocar o `id` da arma e o jogador não perceber diferença em 5 s de jogo, está errado.

---

## 4. Projéteis e colisão (`combat.js`)

### 4.1 Projétil

```js
{ x, y, px, py,        // posição atual e anterior (para colisão por segmento)
  vx, vy, dmg, pierce, life, splash, crit,
  hitIds: [],          // ids de zumbis já atingidos (para perfuração)
  from:'player'|'turret'|'enemy' }
```

### 4.2 Passo de atualização (exato)

```
por cada projétil (de trás para frente):
  p.px = p.x; p.py = p.y
  p.x += p.vx*dt; p.y += p.vy*dt
  p.life -= dt

  // 1) parede
  if (colideComParede(p.x,p.y,2)) { faísca; remover; continue }

  // 2) zumbis (grid espacial, raio de consulta = velocidade*dt + 40)
  candidatos = grid.query(p.x, p.y, 60)
  por cada z:
     if (z.hitIds inclui z.id) continue
     if (!segCircle(p.px,p.py,p.x,p.y, z.x,z.y, z.hitbox)) continue
     dano = p.dmg * (p.crit ? CRIT.mult : 1)
     applyDamage(z, dano, p.crit)
     z.hitIds.push(z.id)
     if (p.splash > 0) { explosao(p.x,p.y,p.splash,p.dmg*0.7); remover; break }
     if (p.pierce > 0) p.pierce--; else { remover; break }

  // 3) barricada
  if (atingeBarricada(p.x,p.y)) remover

  // 4) vida
  if (p.life <= 0) remover
```
**Regra crítica:** a colisão é **por segmento** (`segCircle`), nunca por ponto. Com 900 px/s e 60 FPS, o
projétil anda 15 px por frame — colisão por ponto atravessa zumbis pequenos.

### 4.3 Explosão

```
explodir(x, y, raio, dano):
  shake += 10
  som boom
  22 partículas de fogo
  por cada zumbi no raio: dano * (1 - dist/raio * 0.5)   // queda suave
  por cada barricada no raio: dano * 0.5 em barricadas ALIADAS? NÃO
  por cada torreta no raio: dano * 0.5 em torretas? NÃO
  jogador: NÃO é atingido pelo próprio tiro
```
Explosivos de zumbi (bomber) **sim** causam dano em barricadas e torretas
(`CFG.ZOMBIES.bomber.explode.structDmg`).

### 4.4 Dano em zumbi

```
applyDamage(z, dano, crit):
  z.hp -= dano
  z.flash = 0.07
  texto de dano (se ligado em config)
  3 partículas de sangue
  som hit(crit)
  if (z.hp <= 0) killZombie(z)
```
`killZombie`: +moedas (com multiplicador), +efeito de morte (3 frames), sangue no chão,
som de morte, chance de kit/pacote/moeda, e remoção da lista no próximo frame (nunca durante o loop).

---

## 5. Efeitos de combate (mínimos obrigatórios)

| Efeito | Como |
|---|---|
| Clarão na boca do cano | círculo `#fff3b0` de 8 px com alpha, 60 ms |
| Rastro do projétil | linha de `px,py` até `x,y`, 2 px, alpha 0,35 |
| Impacto em carne | 3 partículas vermelhas + flash branco de 70 ms no zumbi |
| Sangue no chão | mancha no canvas de sangue, 6 elipses, alpha 0,35–0,6, fade global |
| Morte | sprite troca para sequência de morte (3 frames, 0,25 s), depois poça |
| Dano no jogador | flash vermelho na borda da tela + shake 6 + número vermelho |
| Crítico | número maior, cor dourada, som com tom mais agudo |
| Explosão | anel de fogo expandindo 0,3 s + 22 partículas + shake 10 |
| Acerto em barricada | 2 partículas de madeira, som seco |
| Screen shake | decai `CFG.VIEW.SHAKE_DECAY` px/s; **HUD não treme** |

---

## 6. Checklist de aceite deste documento

- [ ] Andar nas 8 direções com a mesma velocidade (diagonal não é mais rápida).
- [ ] Encostar na parede desliza, sem travar e sem vibrar.
- [ ] Atirar com o mouse em qualquer direção, inclusive para trás enquanto anda.
- [ ] Cada uma das 6 armas tem sensação diferente e munição própria.
- [ ] Arma sem munição não atira; `R` recarrega; recarregar deixa lento.
- [ ] Projétil não atravessa parede e não atravessa zumbi (colisão por segmento).
- [ ] Explosão do Estilhaço acerta vários zumbis e não machuca o jogador.
- [ ] Perfuração da Brasa acerta 2 zumbis com um tiro.
- [ ] Perder foco da janela não deixa o personagem andando.
- [ ] Barra de compra cancela ao soltar `E`.
