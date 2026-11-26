# BALANCEAMENTO — planilha única de números

> Documento 5 de 6. **Se houver conflito entre documentos, este ganha.** Todos os números do jogo
> (jogador, zumbis, ondas, melhorias, habilidades, loja) estão aqui. Não invente valores fora daqui.

---

## 1. Jogador base

| Stat | Valor inicial | Observação |
|---|---|---|
| Vida | 120 | +10 por nível de "Vitalidade" |
| Regeneração | 0,4 HP/s | só depois de 4s sem tomar dano |
| Velocidade | 230 px/s | diagonal normalizada (não soma) |
| Raio de colisão | 14 px | |
| Dano por tiro | 9 | |
| Cadência | 2,6 tiros/s | intervalo 0,3846s |
| Velocidade do projétil | 720 px/s | |
| Alcance (auto-aim) | 460 px | se não há alvo, atira na direção do mouse |
| Projéteis por tiro | 1 | leque de 6° por projétil extra |
| Perfuração | 0 | zumbis que o tiro atravessa |
| Crítico | 5% | multiplicador 2,0× |
| Raio do projétil | 5 px | |
| Ímã de XP | 120 px | |
| Área (aura/explosões) | 1,0× | multiplicador de raio |
| Invencibilidade pós-dano | 0,6s | |

**DPS inicial de referência:** 9 × 2,6 ≈ **23,4/s** (sem crítico).
Caminhante tem 20 HP → morre em ~1 tiro. É proposital: o começo tem que parecer fácil.

---

## 2. Zumbis

Escala de `hpMul`/`dmgMul` por onda na seção 3. A tabela abaixo é a **base na onda 1**.

| Tipo | HP | Dano/contato | Veloc. (px/s) | Raio | XP | Alma (chance) | Aparece na onda |
|---|---|---|---|---|---|---|---|
| Caminhante | 20 | 7 | 62 | 15 | 1 | 6% | 1 |
| Corredor | 14 | 9 | 128 | 12 | 2 | 6% | 2 |
| Rastejante | 9 | 5 | 74 | 10 | 1 | 4% | 3 (grupos de 4) |
| Brutamontes | 95 | 16 | 52 | 24 | 6 | 25% | 4 |
| Cuspidor | 38 | 10 (projétil) | 48 | 15 | 5 | 20% | 5 |
| Explosivo | 26 | 34 (explosão r80) | 84 | 14 | 4 | 15% | 6 |
| Gritador | 46 | 6 | 66 | 14 | 5 | 25% | 7 |
| Elites | ×3 | ×2 | ×1,05 | ×1,3 | ×6 | 3–5 | 3 |
| BOSS Aberraça | 1400 | 28 | 58 | 46 | 60 | 25 | 5 |

Regras de comportamento (números):

| Tipo | Comportamento |
|---|---|
| Caminhante | persegue direto, wobble lateral `sin(t*2+wander)*18` |
| Corredor | persegue com aceleração: para a 90px, "windup" 0,25s, **dash** 2,2× vel por 0,6s, recarrega 1,6s |
| Rastejante | persegue em círculo (offset lateral por zumbi), ignora separação (passa por cima) |
| Brutamontes | persegue devagar; no contato aplica **empurrão** de 260 px/s no jogador e atravessa |
| Cuspidor | mantém distância 200–260px; se muito perto, recua; cospe a cada 2,4s (projétil 300 px/s, vida 2s) |
| Explosivo | persegue rápido e trêmulo; ao chegar a 40px **ou** morrer → explosão 80px, dano cheio, telegraph 0,4s |
| Gritador | fica 160–220px atrás do "centro da horda"; a cada 5s grita → +25% velocidade por 4s num raio de 260px |
| BOSS | fases: 100–60% = stomp a cada 4,5s (onda r220, 20 dano); 60–30% = + investida a cada 7s (2,5× vel, 1s); <30% = + invoca 6 rastejantes a cada 9s. Sempre lento, nunca corre em linha reta. |

**Dano de contato** tem cooldown próprio de **0,7s por zumbi** (senão 10 zumbis = morte instantânea
injusta). O jogador tem 0,6s de invencibilidade global de qualquer forma.

---

## 3. Ondas (escalonamento infinito)

```
hpMul(w)   = min(1 + 0.35*(w-1) + 0.012*(w-1)^2, 60)
dmgMul(w)  = min(1 + 0.14*(w-1), 8)
speedMul(w)= min(1 + 0.018*(w-1), 1.45)
spawnRate(w)= 1.9 + 0.55*(w-1)      // zumbis por segundo
maxAlive(w) = min(28 + 9*(w-1), 400)
waveTime   = 35s    breath = 4s
```

Referência numérica (para conferir a implementação):

| Onda | hpMul | dmgMul | spawnRate (z/s) | maxAlive | Total na onda |
|---|---|---|---|---|---|
| 1 | 1,00 | 1,00 | 1,9 | 28 | ~66 |
| 2 | 1,36 | 1,14 | 2,5 | 37 | ~86 |
| 3 | 1,75 | 1,28 | 3,0 | 46 | ~105 |
| 5 | 2,59 | 1,56 | 4,1 | 64 | ~143 |
| 10 | 5,32 | 2,26 | 6,9 | 109 | ~240 |
| 15 | 9,17 | 2,96 | 9,6 | 154 | ~336 |
| 20 | 14,1 | 3,66 | 12,4 | 199 | ~433 |
| 30 | 26,5 | 5,06 | 17,9 | 289 | ~626 |

Mistura de tipos na onda (peso relativo, normalizado; tipo não liberado tem peso 0):

| Tipo | Peso |
|---|---|
| Caminhante | 40 |
| Corredor | 20 |
| Rastejante | 14 |
| Brutamontes | 8 |
| Cuspidor | 7 |
| Explosivo | 7 |
| Gritador | 4 |

Anúncio de onda: overlay 1,2s, texto `ONDA 07`, subtítulo com a novidade (`BRUTAMONTES!` na primeira
vez que o tipo aparece). Boss: `PERIGO — ABERRAÇA`.

---

## 4. XP e nível

```
xpNext(lvl) = round(10 * lvl^1.35 + 5*lvl)     // lvl 1→10, 2→27, 3→50, 5→108, 10→300
```
- Gema comum vale 1 XP; elite 8; boss 40.
- Nível médio esperado: **lvl 12 no minuto 6**, **lvl 20 no minuto 12** (com Ímã e +XP).
- Level up **não** cura automaticamente (cura é uma melhoria, não um prêmio automático).

---

## 5. Melhorias (pool de cartas)

Máx. **5 níveis** cada. Pesos de raridade: comum 60 / rara 30 / épica 10 (ajustado pelo nível de sorte,
se existir).

| # | Nome | Rar. | Efeito por nível | Máx |
|---|---|---|---|---|
| 1 | **Calibre Grosso** | comum | +3 dano | 5 |
| 2 | **Gatilho Leve** | comum | +18% cadência | 5 |
| 3 | **Pólvora Veloz** | comum | +15% velocidade do projétil, +40 alcance | 5 |
| 4 | **Perfuração** | rara | +1 perfuração | 3 |
| 5 | **Leque** | rara | +1 projétil por tiro | 4 |
| 6 | **Mira Fria** | rara | +8% crítico | 5 |
| 7 | **Executor** | épica | +25% dano crítico | 3 |
| 8 | **Passo Rápido** | comum | +8% velocidade de movimento | 5 |
| 9 | **Vitalidade** | comum | +10 vida máx. (e cura 10) | 5 |
| 10 | **Casca Grossa** | rara | −8% dano recebido | 4 |
| 11 | **Regeneração** | rara | +0,5 HP/s | 4 |
| 12 | **Ímã** | comum | +45% raio de coleta | 4 |
| 13 | **Estudioso** | comum | +15% XP ganho | 5 |
| 14 | **Drones** | épica | +1 drone orbitando (máx. 3) | 3 |
| 15 | **Aura Elétrica** | épica | liga/upgrada aura: 6 dano/s, raio 90 → +5 dano/+20 raio | 4 |
| 16 | **Área de Efeito** | rara | +12% área (aura, explosões, ondas) | 4 |
| 17 | **Recarga Rápida** | rara | −10% cooldown de habilidades | 4 |
| 18 | **Segunda Chance** | épica | revive 1× com 40% de vida (1 por partida) | 1 |
| 19 | **Sanguessuga** | rara | cura 0,6 HP por 20 dano causado | 3 |
| 20 | **Sorte** | comum | +5% chance de drop | 4 |
| 21 | **Fogo Amigo** | épica | projéteis deixam rastro de 3 dano/s por 1,2s | 2 |
| 22 | **Escudo Reativo** | rara | anel de 6 dano a cada 2s em raio 60 | 3 |
| 23 | Cura +30 | reserva | só aparece com pool esgotado | ∞ |
| 24 | Almas +20 | reserva | só aparece com pool esgotado | ∞ |

**Regras da oferta:** 3 cartas distintas; ao menos 1 rara/épica se disponível e `lvl ≥ 3`;
cartas no máximo não aparecem; drone só a partir de `lvl ≥ 4`; épicas só a partir de `lvl ≥ 2`.

---

## 6. Habilidades

| Habilidade | Dano | Raio/duração | Cooldown | Observações |
|---|---|---|---|---|
| Dash | — | 190 px em 0,16s | 2,5s | invencível 0,28s; rastro de 6 partículas |
| Onda de Choque | 22 + 2,5×lvl | raio 180 × área | 9s × (1−cdr) | empurrão 320 px/s, atordoa 0,35s |
| Granada Incendiária | 30 impacto + 8/s na poça | poça 110px, 4s | 12s | arremesso 520 px/s até o cursor, alcance máx 380 |
| FÚRIA | — | 6s | 45s | cadência ×2, +1 perfuração, +10% crítico, shake leve contínuo |

Dano de habilidade escala com `+Área` e com +10% do `dano` do jogador por nível de "Calibre".
Cooldowns **não** correm em pausa, level up ou game over.

---

## 7. Loot e almas

| Drop | Chance (comum) | Efeito |
|---|---|---|
| Kit médico | 1,5% (+0,35% por nível de Sorte) | +25 HP |
| Ímã total | 0,6% | puxa todas as gemas de XP da tela |
| Granada grátis | 0,8% | reseta o CD da granada |
| Alma | 6% (por tipo, ver seção 2) | +1 alma na meta-moeda |

Drops vivem **20s** e piscam nos últimos 4s. Boss sempre solta 2 kits + 25 almas.

---

## 8. Loja de almas (meta-progressão permanente)

Custo crescente por nível: `custo(n) = base * (n+1)`, n = nível já comprado.

| Melhoria permanente | Base | Efeito por nível | Máx |
|---|---|---|---|
| **Poder** | 15 | +4% dano | 10 |
| **Vigor** | 15 | +8 vida máx | 10 |
| **Agilidade** | 12 | +2% velocidade | 10 |
| **Magneto** | 10 | +10% raio de ímã | 8 |
| **Sabedoria** | 18 | +5% XP | 8 |
| **Celeridade** | 20 | −3% cooldowns | 8 |
| **Renascer** | 60 | +1 revive por partida | 3 |
| **Sorte** | 25 | +2% drop | 5 |
| **Rendeiro** | 30 | +10% almas ganhas | 5 |
| **Começo Forte** | 40 | começa a run no nível 3 | 1 |

Regras: compra paga na hora e salva; **não** dá pra desfazer; máximo do nível bloqueia o botão.
Custo do Renascer: 60 → 120 → 240.

---

## 9. Recordes e pontuação

- **Pontuação** (ordenação do ranking local): `onda*1000 + segundos*10 + kills*2 + lvl*150`.
- Recorde guardado por: **onda máxima**, **tempo máximo**, **kills** e **pontuação** (4 campos).
- Ranking local: top 10 em `localStorage` (`hordas2d_scores_v1`), exibido no título.

---

## 10. Checagem de sanidade do balanceamento

Rode mentalmente estes cenários e ajuste **nesta planilha** (nunca só no código):

| Cenário | Esperado |
|---|---|
| Onda 1, jogador parado sem atirar | morre em ~12s |
| Onda 1, jogador andando em círculo | termina com ~85% de vida |
| Onda 5, build média (2 upgrades) | boss morto com ~40% de vida restante |
| Onda 10, build boa | sobrevive com 3+ upgrades e 1 habilidade bem usada |
| Onda 20 sem nenhuma habilidade usada | morre (habilidade é obrigatória depois da 15) |
| 300 zumbis na tela | ≥ 58 FPS, sem morte instantânea por dano empilhado |
| Run típica casual | 6 a 10 minutos |
| Run boa (jogador experiente) | 14 a 22 minutos |
