# ESPECIFICAÇÃO — BARRICADAS E TORRETAS

> Documento 10 de 16. Arquivos: `barricades.js`, `turrets.js`. É o sistema mais fácil de "ficar fake":
> por isso aqui está o comportamento exato, incluindo o que os zumbis fazem contra elas.

---

## 1. Vagas (o conceito central)

O jogador **não** constrói em qualquer lugar. Cada mapa define **vagas**:

```js
barricadeSlots: [ { x:6, y:8.6 }, ... ]   // em TILES, convertidas para px no load
turretSlots:    [ { x:26, y:14.5 }, ... ]
```

Regras:
- A vaga tem **ícone pintado no chão** (martelo = barricada, cano = torreta). O jogador lê o mapa sem tutorial.
- Uma vaga aceita **uma** estrutura por vez. Nova construção exige vaga livre.
- Vaga ocupada não mostra preço nem prompt.
- Vagas nunca ficam dentro de parede (validado no load; se acontecer, erro claro no console).

---

## 2. Barricada

### 2.1 Construção

```
tryBuild(barricada):
  1. vaga = vaga livre mais próxima em 95 px
     - nenhuma → aviso "NENHUMA VAGA PERTO" (cinza), sem som de erro agressivo
  2. custo = CFG.COSTS.barricade[n]  (n = barricadas vivas)
     acima de 6: 120 + 20*(n-6)
  3. se (moedas < custo) → aviso "FALTAM N MOEDAS" (vermelho) + som seco. FIM.
  4. moedas -= custo
  5. criar barricada na vaga (HP máximo)
  6. som de martelada (3 batidas), 12 partículas de poeira
  7. recalcular flow field (a passagem fechou)
```

### 2.2 Estatísticas

| Atributo | Valor |
|---|---|
| Vida | 600 (+120 por nível de Marcenaria no lobby) |
| Colisão | AABB 96×60 centrada na vaga |
| Dano recebido | 30/s de cada zumbi que a ataca |
| Reparo | metade do preço atual → +40% da vida máxima |
| Estágios visuais | 100–66% inteira · 66–33% rachada · <33% quase caindo |
| Ao destruir | vira destroços por 10 s, libera a vaga, recalcula flow field |

### 2.3 Ataque de zumbi (comportamento)

```
zumbi encosta na AABB da barricada:
  estado = attackStruct
  alvo = barricada
  a cada frame: barricada.hp -= CFG.ZOMBIE_BARRICADE_DPS * dt
  anima ataque (sprite de ataque a cada 0,35 s)
  som de madeira sendo batida (a cada 0,5 s, com atenuação por distância)

barricada.hp <= 0:
  destruir() → som alto de madeira quebrando, 16 partículas, dela libera caminho
  todos os zumbis com alvo nela voltam para chase
```

### 2.4 Casos especiais
- **Rastejante:** atravessa a barricada a 1/3 da velocidade, sem atacá-la.
- **Frenético:** atravessa 3× mais rápido que o rastejante (ou seja, quase não atrasa).
- **Explosivo:** ao explodir perto, causa `structDmg` (120) na barricada.
- **Reparo durante ataque:** permitido e é a jogada de mestre (custa moeda, dá tempo).

### 2.5 Visual
- 3 sprites pré-renderizados (inteira / rachada / destruída).
- Barra de vida aparece **só quando danificada**, fina, acima da peça.
- Ao quebrar: 16 partículas de madeira + destroços no chão por 10 s.

---

## 3. Torreta

### 3.1 Construção

```
tryBuild(torreta):
  1. vaga livre de torreta mais próxima em 95 px
  2. custo = CFG.COSTS.turret[n] (n = torretas vivas); acima de 4: 850 + 180*(n-4)
     aplicar desconto de Engenharia (lobby): custo *= (1 - 0.15*nivel)
  3. moedas insuficientes → aviso vermelho, FIM
  4. criar torreta, som de montagem, partículas
```

### 3.2 Estatísticas

| Atributo | Valor |
|---|---|
| Vida | 400 |
| Alcance | 340 px (**não atira fora disso, nunca**) |
| Dano | 12 por tiro (fixo — não escala com a horda) |
| Cadência | 5 tiros/s |
| Munição | 240 tiros; ao zerar para de atirar (mostra `SEM MUNIÇÃO`) |
| Recarga | 150 moedas (`E` perto dela) → 240 tiros |
| Rotação | 8 rad/s (gira suave até o alvo) |
| Colisão | círculo raio 22 (zumbis esbarram) |
| Dano recebido | 18/s de zumbi que a ataca |

### 3.3 Alvo e disparo (passo a passo)

```
update(dt):
  if (ammo <= 0) return                       // sem munição, não faz nada
  retargetTimer -= dt
  if (retargetTimer <= 0):
     retargetTimer = CFG.TURRET.retargetTime
     alvo = null; melhor = Infinity
     candidatos = grid.query(turret.x, turret.y, CFG.TURRET.range)
     para cada z:
        if (!z.alive) continue
        d = dist(turret, z)
        if (d > CFG.TURRET.range) continue                     // 1ª barreira: alcance
        if (!lineClear(turret, z)) continue                    // 2ª barreira: parede
        if (d < melhor) { melhor = d; alvo = z }
     torre.alvo = alvo

  if (alvo):
     angDesejado = atan2(alvo.y - t.y, alvo.x - t.x)
     angAtual = aproximarAngulo(angAtual, angDesejado, rotSpeed*dt)
     if (|diferença| < 0.12 rad):
        cd -= dt
        if (cd <= 0):
           cd = 1 / CFG.TURRET.rate
           ammo -= 1
           criar projétil de torreta (800 px/s, dmg 12, vida 0,5 s, from:'turret')
           som turret (tic curto, volume baixo)
           muzzle flash 60 ms

zumbi atacando torreta: hp -= CFG.ZOMBIE_TURRET_DPS * dt
hp <= 0: explodir → som, partículas, libera vaga
```

### 3.4 Regras que o teste deve provar
- Torreta **nunca** atira além de 340 px (medir no teste: registrar distância máxima de um tiro emitido).
- Torreta **nunca** atira através de parede (teste: colocar parede entre ela e o zumbi e verificar `shots===0`).
- Torreta sem munição **para** e mostra aviso.
- Torreta destruída libera a vaga e o preço da próxima cai (custo é por nº vivo).

---

## 4. Feedback visual obrigatório

| Evento | Feedback |
|---|---|
| Construir | poeira/faíscas + som + texto `BARRICADA`/`TORRETA` |
| Reparar | flash verde na peça + som de martelo |
| Barricada levando dano | sprite racha + partículas de madeira |
| Barricada quebrando | estalo alto + pedaços voando |
| Torreta atirando | cano gira + muzzle flash + tic |
| Torreta sem munição | ícone vermelho acima + `SEM MUNIÇÃO` |
| Torreta destruída | explosão + fumaça escura |
| Vaga perto | contorno pulsante no chão + preço flutuando |

---

## 5. Checklist de aceite

- [ ] Só dá pra construir nas vagas (tentar no meio do mapa não faz nada e avisa).
- [ ] Cada barricada construída aumenta o preço da próxima, e o preço volta a cair se ela é destruída.
- [ ] Barricada tem 600 HP, quebra em ~10 s com 2 zumbis batendo.
- [ ] Barricada quebrada abre caminho e os zumbis passam (flow field recalculado).
- [ ] Reparo custa metade e devolve 40% da vida.
- [ ] Rastejante atravessa a barricada devagar em vez de ficar preso.
- [ ] Torreta gira até o alvo, atira a 5/s, gasta munição e para ao zerar.
- [ ] Torreta nunca atira fora do alcance nem atravessa parede.
- [ ] Torreta recarregada por 150 volta a atirar.
- [ ] Torreta destruída por zumbis libera a vaga.
- [ ] Custos de torreta: 400 → 550 → 700 → 850.
