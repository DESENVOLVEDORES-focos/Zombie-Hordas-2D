# BALANCEAMENTO — números do jogo

> Documento 5 de 6. **Único lugar onde números de gameplay são decididos.** Em conflito com o doc 01 em
> valores numéricos, este ganha; em regra de jogo, o doc 01 ganha.
> Tudo aqui deve viver em `js/config.js`.

---

## 1. Jogador

| Stat | Valor |
|---|---|
| Vida | 100 (+10 por nível de Vitalidade no lobby) |
| Regeneração | nenhuma por padrão (cura só por kit) |
| Velocidade | 210 px/s |
| Raio | 13 px |
| Invencibilidade pós-dano | 0,35 s |
| Moedas iniciais | 500 |
| Slots de arma | 2 (teclas 1 e 2) |
| Interação | **E** (comprar / reparar / recolher) |

**Referência de DPS:** pistola 40/s. Zumbi comum na horda 1: 60 HP → 6 tiros.

---

## 2. Armas (comportamentos realmente diferentes)

| # | Nome | Dano | Cadência | Pente | Reserva | Recarga | Alcance | Dispersão | Comportamento próprio | Preço |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Pistola** | 10 | 4,0/s | 12 | ∞ | 1,1 s | 420 | 1,5° | reserva infinita: nunca fica sem arma | inicial |
| 2 | **Calibre 12** | 9×6 bagos | 1,1/s | 6 | 24 | 2,2 s | 260 | 9° | 6 bagos: letal de perto, inútil longe, empurra zumbi | 500 |
| 3 | **Zumbido** (SMG) | 9 | 13/s | 45 | 180 | 1,6 s | 380 | 4,5° | cadência alta, gasta munição rápido, mobilidade total | 1.400 |
| 4 | **Vetor** (rifle) | 14 | 8,5/s | 30 | 120 | 1,8 s | 520 | 2,5° | equilíbrio, melhor alcance útil | 1.000 |
| 5 | **Brasa** (rifle pesado) | 32 | 3,2/s | 20 | 60 | 2,4 s | 640 | 1,0° | perfura 1 zumbi, escala bem contra tanque | 1.900 |
| 6 | **Estilhaço** (lançador) | 90 (raio 140) | 0,9/s | 4 | 12 | 3,2 s | 600 | 3° | explosão em área, perigoso de perto, abre caminho | 3.400 |

**Melhorias de arma** (ponto azul no mapa, uma vez cada por arma): +20% dano (400 + 25/horda),
+50% pente (450), −25% recarga (500).

**Munição** comprada nos pontos brancos: repõe 4× o pente. Preço base: 60 (calibre 12), 80 (vetor/zumbido),
110 (brasa), 150 (estilhaço), +15% por horda após a 10.

---

## 3. Zumbis (6 tipos — spec §7)

| Tipo | Nome | HP | Dano | Velocidade | Raio | Moedas | Entra na horda | Comportamento |
|---|---|---|---|---|---|---|---|---|
| 1 | **Comum** | 60 | 12 | 70 | 15 | 10 | 1 | persegue direto; balanço lateral leve |
| 2 | **Frenético** | 45 | 15 | 128 (arrancada 190) | 13 | 15 | 11 | 3 fases: andar → agachar 0,25 s → arrancada 0,55 s |
| 3 | **Explosivo** | 70 | 45 (raio 90) | 95 | 14 | 20 | 20 | corre e explode ao tocar (ou ao morrer); dano em estruturas |
| 4 | **Cuspidor** | 120 | 10 (projétil) | 55 | 15 | 25 | 20 | mantém 200–260 px, recua se aproximar, cospe a cada 2,6 s |
| 5 | **Tanque** | 380 | 22 | 52 | 24 | 35 | 15 | empurra o jogador, imune a empurrão, muito lento |
| 6 | **Rastejante** | 35 | 8 | 88 | 11 | 10 | 21 | hitbox baixa (difícil de acertar), atravessa barricada 3× mais devagar |

Valores de moeda seguem a spec (§8). Orbita do tanque: nunca mais de 2 vivos ao mesmo tempo antes da
horda 25.

---

## 4. Escalonamento de hordas (suave — spec §6)

```
count(h)    = min(240, round(6 + 2.4*(h-1) + 0.045*(h-1)^2))
maxAlive(h) = min(80, round(6 + 1.2*(h-1)))
pulses(h)   = clamp(ceil(count/12), 1, 6)
hpMul(h)    = 1 + 0.20*(h-1)          (cap 12)      // vida nunca é o problema principal
dmgMul(h)   = 1 + 0.04*(h-1)          (cap 3.2)
speedMul(h)= 1 + 0.006*(h-1)          (cap 1.25)
```

**Regra anti-esponja** (spec §6): o aumento de dificuldade vem **70% de quantidade e variedade**,
30% de vida/dano. Por isso `hpMul` é linear e capado em 12×.

Tabela de conferência:

| Horda | Zumbis | Máx. vivos | Vida × | Dano × | Tipos disponíveis |
|---|---|---|---|---|---|
| 1 | 6 | 6 | 1,0 | 1,0 | comum |
| 5 | 18 | 11 | 1,8 | 1,2 | comum |
| 10 | 33 | 17 | 2,8 | 1,4 | comum |
| 11 | 36 | 18 | 3,0 | 1,4 | + frenético |
| 15 | 49 | 23 | 3,8 | 1,6 | + tanque |
| 20 | 68 | 29 | 4,8 | 1,8 | + explosivo, cuspidor |
| 21 | 72 | 30 | 5,0 | 1,8 | + rastejante |
| 30 | 110 | 41 | 6,8 | 2,2 | todos |
| 40 | 152 | 53 | 8,8 | 2,6 | todos |
| 50 | 198 | 80 | 10,8 | 3,0 | todos |

**Duração alvo da horda:** 45–70 s no começo, 90–150 s depois da 30. Trégua: **6 s**. Preparação inicial:
2,5 s.

**Mistura de tipos** (peso): comum 45 · frenético 18 · rastejante 12 · tanque 8 · cuspidor 8 · explosivo 9.
Depois da horda 30, especiais ganham +40% de peso.

---

## 5. Custos progressivos (spec §9 e §10 — nunca fixos)

**Barricada** (por número já construído):
`50 · 80 · 90 · 100 · 110 · 120` — depois `120 + 20*(n-6)`.
Vida 600. Zumbi causa **30 dano/s**. Reparo custa **metade** do preço atual e devolve 40% da vida.
Frenético e rastejante atravessam 3× mais rápido.

**Torreta** (por número já construído): `400 · 550 · 700 · 850`, depois `850 + 180*(n-4)`.
Vida 400 · alcance **340 px** · dano 12 · cadência 5/s · munição 240 tiros · recarga **150 moedas**.
Prioriza o zumbi mais próximo **com linha de visão**. Zumbi causa 18 dano/s nela.

**Por que dano fixo na torreta:** torreta é atraso, não solução. Se escalasse com a horda, o jogador
pararia de atirar — e o jogo morre.

---

## 6. Loot e cura

| Item | Chance | Efeito |
|---|---|---|
| Kit médico | 2% por abate | +25 vida |
| Pacote de munição | 1,5% | +50% do pente na arma atual |
| Moeda extra | 5% | +10 moedas |

Tudo expira em 20 s (pisca nos últimos 4 s).

---

## 7. Progressão meta (lobby — almas)

| Melhoria | Base | Crescimento | Máx | Efeito por nível |
|---|---|---|---|---|
| Arma de estimação | 30 | ×1,8 | 3 | começa com Calibre 12 / Vetor / Zumbido |
| Vitalidade | 20 | ×1,7 | 5 | +10 vida máxima |
| Marcenaria | 25 | ×1,7 | 5 | +120 HP de barricada |
| Engenharia | 30 | ×1,8 | 4 | −15% custo de torreta |
| Saquinho | 15 | ×1,6 | 5 | +50 moedas iniciais |
| Faro | 20 | ×1,7 | 5 | +8% moedas por abate |

Ganho de almas: `1 a cada 25 abates` + `3 por horda limpa sem dano` + `15 ao alcançar horda 10/20/30/40`
+ `1 por horda alcançada` no fim da partida.

---

## 8. Sanidade (rodar a cada marco)

| Cenário | Esperado |
|---|---|
| Hordas 1–10 jogando normal | chega à 11 com **800–1.200 moedas** e 1 arma comprada |
| Horda 15 com 1 arma + 2 barricadas | aperto, mas passa |
| Horda 20 | primeiro cuspidor obriga a sair do canto |
| Horda 30 | 1 torreta + 3 barricadas já não bastam |
| Zumbi em canto fechado | nunca fica preso mais de 2 s (ataque a estrutura ou desvio) |
| 150 zumbis | ≥ 58 FPS |
| Partida casual | 15–25 min até morrer |
