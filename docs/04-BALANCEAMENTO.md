# BALANCEAMENTO — planilha única de números

> Documento 5 de 6. **Em qualquer conflito, este documento ganha.** Mudou algo? Muda aqui primeiro.

---

## 1. Jogador

| Stat | Valor |
|---|---|
| Vida | 100 |
| Regeneração | 45 HP/s após **5 s** sem dano (estilo "respirar", não tanque) |
| Velocidade | 210 px/s (195 com foco manual, 150 recarregando) |
| Raio | 13 px |
| Invencibilidade pós-dano | 0,35 s |
| Slots de arma | 2 |
| Moedas iniciais | 500 |
| Almas iniciais | 0 |
| Auto-aim | 40° de cone, alvo mais próximo com linha de visão, alcance da arma |

**Referência:** zumbi caminhante (60 HP na horda 1) morre em 6 tiros de pistola. A horda 1 leva ~40 s.

---

## 2. Armas

| # | Nome | Dano | Cadência (tiros/s) | Pente | Recarga | Alcance | Dispersão | Perfuração | Preço |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Pistola** (inicial) | 10 | 4,0 | 12 | 1,1 s | 420 | 1,5° | 0 | — (reserva infinita) |
| 2 | **Calibre 12** "Trovão" | 9 × 6 pellets | 1,1 | 6 | 2,2 s | 260 | 9° | 0 | 500 |
| 3 | **Rifle de Assalto** "Vetor" | 14 | 8,5 | 30 | 1,8 s | 520 | 2,5° | 0 | 1.000 |
| 4 | **Submetralhadora** "Zumbido" | 9 | 13,0 | 45 | 1,6 s | 380 | 4,5° | 0 | 1.400 |
| 5 | **Rifle Pesado** "Brasa" | 32 | 3,2 | 20 | 2,4 s | 640 | 1,0° | 1 | 1.900 |
| 6 | **Metralhadora** "Muralha" | 15 | 16,0 | 120 | 3,4 s | 480 | 5,0° | 0 | 2.600 |
| 7 | **Lançador** "Estilhaço" | 90 (raio 140) | 0,9 | 4 | 3,2 s | 600 | 3,0° | 0 | 3.400 |

- Pente zera → **não atira**; `R` recarrega; reserva de munição limitada (comprar no ponto branco).
- **Reserva inicial** por arma: 4× o pente (arredondado em múltiplos de 6). Custo de munição cheia:
  60 (Calibre 12), 90 (Vetor/Zumbido), 120 (Brasa), 160 (Muralha), 200 (Estilhaço) — **+15% por horda**
  após a 10, arredondado.
- **Melhorias de arma** (placa azul, 1× cada por arma): +20% dano (400 + 100/horda), +50% pente (450),
  −25% recarga (500).
- Foco manual: +15% dano, dispersão ÷2, velocidade 195 px/s.

**DPS de referência:** Pistola 40/s · Trovão 59/s · Vetor 119/s · Zumbido 117/s · Brasa 102/s (perfura) ·
Muralha 240/s · Estilhaço 81/s em área.

---

## 3. Zumbis

HP base vale na **horda 1**; multiplicadores na seção 4.

| Tipo | HP | Dano/hit | Veloc. | Raio | Moedas | XP | Entra na horda |
|---|---|---|---|---|---|---|---|
| **Caminhante** | 60 | 12 | 70 | 15 | 10 | 1 | 1 |
| **Frenético** | 45 | 15 | 128 (dash 190) | 13 | 15 | 2 | 11 |
| **Rastejante** | 35 | 8 | 88 | 11 | 10 | 1 | 16 |
| **Tanque** | 380 | 22 | 52 | 24 | 40 | 6 | 21 |
| **Cuspidor** | 120 | 10 (projétil) | 55 | 15 | 25 | 4 | 31 |
| **Explosivo** | 70 | 45 (raio 90) | 95 | 14 | 20 | 3 | 34 |
| **Espreitador** | 90 | 18 | 105 | 14 | 30 | 5 | 37 |

Comportamento (números):
| Tipo | Detalhe |
|---|---|
| Caminhante | persegue direto; leve balanço lateral |
| Frenético | 3 fases: andar → windup 0,25 s → **dash 0,55 s** a 190 px/s; recupera 1,1 s |
| Rastejante | corpo baixo (hitbox circular pequena), atravessa vaga de barricada em 3× o tempo normal |
| Tanque | empurra o jogador (240 px/s) ao encostar; **imune a empurrão** de explosão |
| Cuspidor | mantém 200–260 px; recua se aproximar; cospe a cada 2,6 s (projétil 300 px/s, 2 s de vida) |
| Explosivo | telegraph de 0,45 s pulsando; explode ao morrer **ou** ao tocar (ambos com dano cheio) |
| Espreitador | surge de spawns `roof`/vão; 1,2 s imóvel e invulnerável, depois cai e persegue |

**Regras gerais:** dano de contato tem cooldown de **0,8 s por zumbi**; zumbi que bate em **barricada**
faz 30 dano/s (não o dano/hit acima); contra **torreta**, 18 dano/s.

---

## 4. Curva de dificuldade (5 faixas, como no briefing)

Multiplicadores aplicados sobre a base:

```
faixa A (horda 1–10):   hp 1.0 + 0.06*(h-1)      dmg 1.0 + 0.03*(h-1)     speed 1.0
faixa B (11–20):        hp 1.54 + 0.09*(h-11)    dmg 1.30 + 0.04*(h-11)   speed 1.0 + 0.006*(h-11)
faixa C (21–30):        hp 2.35 + 0.13*(h-21)    dmg 1.66 + 0.05*(h-21)   speed 1.06
faixa D (31–40):        hp 3.45 + 0.18*(h-31)    dmg 2.16 + 0.06*(h-31)   speed 1.06
faixa E (41+):          hp 5.0 + 0.22*(h-41)     dmg 2.70 + 0.07*(h-41)   speed 1.10 (cap 1.35)
```

**Tabela de conferência:**

| Horda | hpMul | dmgMul | speedMul | Zumbis na horda | Pulsos | Máx. vivos |
|---|---|---|---|---|---|---|
| 1 | 1,00 | 1,00 | 1,00 | 6 | 1 | 6 |
| 5 | 1,24 | 1,12 | 1,00 | 18 | 2 | 12 |
| 10 | 1,54 | 1,27 | 1,00 | 32 | 2 | 18 |
| 15 | 1,90 | 1,46 | 1,02 | 46 | 3 | 24 |
| 21 | 2,35 | 1,66 | 1,06 | 62 | 3 | 30 |
| 25 | 2,87 | 1,86 | 1,06 | 76 | 4 | 34 |
| 31 | 3,45 | 2,16 | 1,06 | 96 | 4 | 40 |
| 40 | 5,07 | 2,70 | 1,10 | 130 | 5 | 52 |
| 50 | 6,98 | 3,33 | 1,18 | 168 | 6 | 64 |
| 70 | 11,4 | 4,73 | 1,26 | 240 | 6 | 80 |

**Fórmulas:** `zumbis(h) = round(6 + 2.4*(h-1) + 0.045*(h-1)^2)` (cap 260) ·
`maxVivos(h) = min(6 + 1.2*(h-1), 90)` · `pulsos(h) = clamp(ceil(zumbis/12), 1, 6)`.
Tudo clampado; **nunca** deixar estourar para `Infinity`.

**Mistura de tipos** (peso; tipos não liberados = 0):
Caminhante 45 · Frenético 18 · Rastejante 12 · Tanque 8 · Cuspidor 8 · Explosivo 6 · Espreitador 3.
Depois da horda 31, os especiais ganham +50% de peso (mais variedade, como pede o briefing).

**Tempo-alvo por horda:** ~55 s (1–10), ~70 s (11–20), ~85 s (21–30), ~100 s (31–40), ~120 s (40+).
Isso fecha **~22 min na horda 30** e ~30 min na 40. Se o teste real estourar 20% disso, ajusta aqui.

---

## 5. Barricadas

| Item | Valor |
|---|---|
| Vagas no mapa | 7 |
| Custo (por barricada **viva**) | 50, 80, 90, 100, 110, 120, 130 |
| Vida | 600 |
| Dano de zumbi | 30/s (2 zumbis derrubam em ~10 s) |
| Reparo (`E`) | metade do preço atual, +40% de HP máx (cap 600) |
| Passagem por tipo | frenético/rastejante: 3× mais rápido (180 u/s de dano efetivo) |
| Ao quebrar | libera o caminho, deixa destroços 10 s |

Fórmula editável: `cost(n) = Math.round(50 * Math.pow(1.16, n-1))` com piso de 50 — os 7 valores acima são
o resultado arredondado para 10.

---

## 6. Torretas

| Item | Valor |
|---|---|
| Vagas no mapa | 4 |
| Custo | 400, 550, 700, 850 |
| Vida | 400 |
| Alcance | 340 px (não atira através de parede) |
| Dano | 12/tiro a 5 tiros/s = **60/s** (com multiplicador de horda no dano? **não** — dano fixo) |
| Munição | 240 tiros; recarga por **150 moedas** (`E`) |
| Prioridade | zumbi mais próximo com linha de visão |
| Destruída por | 18 dano/s de zumbis que a alcançam |

**Por que dano fixo:** torreta é *atraso*, não solução. Se ela escalasse, o jogador pararia de atirar.

---

## 7. Perks (XP dentro da partida)

Barra de XP: `xpNext(nivel) = 25 + 10*nivel` abates. Ao subir: 1 carta, escolhida com **1/2/3** em 6 s
(sem pausar). Máx **3 perks ativos**; cada perk tem 4 níveis.

| Perk | Efeito por nível |
|---|---|
| **Fôlego** | +6% velocidade de movimento |
| **Mãos Rápidas** | −10% tempo de recarga |
| **Casca** | +12 vida máx (cura igual) |
| **Bolsos** | +40% munição de reserva |
| **Pulso Firme** | −25% dispersão |
| **Balas Perfurantes** | +1 perfuração |
| **Tônico** | +8 HP/s de regeneração |
| **Sorte** | +10% moedas por abate (não almas) |

Regra: nunca oferecer perk no máximo; se todos estiverem no máximo, oferece **+50 moedas**.

---

## 8. Almas (meta-moeda)

Ganho: `1 alma a cada 25 abates` + `3 por horda limpa sem dano` + `15 ao alcançar horda 10/20/30/40`.
Bônus de fim de run: `+1 alma por horda alcançada`.
Exemplo: morrer na horda 14 com 320 abates ≈ 12 + 6 + 15 + 14 = **47 almas**.

### Loja permanente

| Melhoria | Base | + por nível | Máx | Efeito |
|---|---|---|---|---|
| **Arma de Estimação** | 30 | ×1,8 | 3 | começa com arma 2 / 3 / 4 em vez da pistola (você escolhe na hora) |
| **Vitalidade** | 20 | ×1,7 | 5 | +10 vida máx por nível |
| **Marcenaria** | 25 | ×1,7 | 5 | +120 HP de barricada por nível |
| **Engenharia** | 30 | ×1,8 | 4 | −15% custo de torreta por nível |
| **Saquinho** | 15 | ×1,6 | 5 | +50 moedas iniciais por nível |
| **Faro** | 20 | ×1,7 | 5 | +8% moedas por abate por nível |

Custos: `custo(nivel) = round(base * (razão ^ nivel))` para nível 0,1,2…; teto no máximo indicado.
Nada é perdido ao morrer; a loja só cresce.

---

## 9. Recordes

`pontuação = horda*2000 + abates*15 + moedasGastas/10 + tempoSeg` (só informativo/ranking local).
Recordes salvos: horda máxima, tempo máximo, abates, moedas acumuladas. Top 10 em
`hordas_save_v1.scores`.

---

## 10. Sanidade do balanceamento (rodar em teste)

| Cenário | Esperado |
|---|---|
| Horda 1, jogador parado atirando | sobrevive com ~70 HP |
| Horda 1–10 jogando médio | chega à 11 com **800–1.200 moedas** e 1 arma comprada |
| Horda 15 com 1 arma comprada + 2 barricadas | aperto, mas passa |
| Horda 21 primeiro tanque | precisa de 2 pentes da arma 3 (ou 1 do lançador) |
| Horda 31 primeiro cuspidor | jogador tem que sair do cantinho |
| Horda 40 | 1 torreta + 3 barricadas já não bastam; caos controlado |
| Run casual | 12–20 min |
| Run boa | 25–35 min |
| 150 zumbis na tela | ≥ 58 FPS e vivo (não morre por dano empilhado) |
