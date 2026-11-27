# ESPECIFICAÇÃO — HORDAS, ECONOMIA E COMPRAS

> Documento 9 de 16. Arquivos: `hordes.js`, `economy.js`, `hud.js` (parte da moeda).

---

## 1. Máquina de estados da partida (`hordes.js`)

```
PREP ──(2,5 s)──► HORDE ──(restam == 0)──► BREAK ──(6 s)──► HORDE (h+1)
  │                 │
  │                 └──(jogador morre)──► OVER
  └──(jogador morre)────────────────────► OVER
```

### 1.1 PREP
- Dura `CFG.HORDES.prepTime` (2,5 s).
- HUD mostra `PREPARAR` e contagem regressiva.
- Sem spawn. Jogador pode andar e comprar (nada está construído ainda).
- Ao fim: `startHorde(1)`.

### 1.2 HORDE
- `remaining = CFG.HORDES.count(horde)`.
- Dividido em `pulses` pulsos iguais (ex.: 33 zumbis em 3 pulsos = 11, 11, 11).
- Cada pulso é liberado assim que o anterior já nasceu (não precisa morrer).
- Spawn: `spawnBurst` (3) por tick de `spawnInterval` (0,55 s), respeitando `maxAlive(horde)`.
- **Horda termina quando**: todos os pulsos nasceram **e** `zombies.length === 0`.
- `remaining` mostrado no HUD = `zumbis ainda não nascidos + zumbis vivos`.

### 1.3 BREAK (trégua)
- 6 s. Spawn pausado. HUD mostra `TRÉGUA` e contagem.
- Toca som de horda limpa e mostra texto `HORDA N LIMPA`.
- **Não** cura o jogador automaticamente.
- Ao fim: `startHorde(horde+1)` com anúncio de banner (2,2 s).

### 1.4 OVER
- Entra quando o jogador morre (após `deathDelay` 1,4 s).
- Salva recordes, soma almas, mostra tela de game over.

---

## 2. Escalonamento (fórmulas em `config.js`, valores aqui)

| Horda | Zumbis | máx. vivos | vida × | dano × | velocidade × | Tipos |
|---|---|---|---|---|---|---|
| 1 | 6 | 6 | 1,0 | 1,0 | 1,00 | comum |
| 3 | 11 | 8 | 1,4 | 1,1 | 1,01 | comum |
| 5 | 18 | 11 | 1,8 | 1,2 | 1,02 | comum |
| 10 | 33 | 17 | 2,8 | 1,4 | 1,05 | comum |
| 11 | 36 | 18 | 3,0 | 1,4 | 1,06 | + frenético |
| 15 | 49 | 23 | 3,8 | 1,6 | 1,08 | + tanque |
| 20 | 68 | 29 | 4,8 | 1,8 | 1,11 | + explosivo, cuspidor |
| 21 | 72 | 30 | 5,0 | 1,8 | 1,12 | + rastejante |
| 25 | 90 | 35 | 5,8 | 2,0 | 1,14 | todos |
| 30 | 110 | 41 | 6,8 | 2,2 | 1,17 | todos (especiais +40% peso) |
| 40 | 152 | 53 | 8,8 | 2,6 | 1,23 | todos |
| 50 | 198 | 80 | 10,8 | 3,0 | 1,25 | todos |
| 60 | 240 | 80 | 12,0 | 3,2 | 1,25 | todos (caps atingidos) |

**Regra anti-esponja:** o teto de vida é 12×. Dificuldade vem de quantidade e variedade. Se a horda 40
demorar mais de 4 min, o problema é a economia (jogador desarmado), não a vida do zumbi.

### 2.1 Anúncio de horda
- Banner grande: `HORDA 07` (2,2 s, com fade).
- Subtítulo quando um tipo novo entra: `NOVO: TANQUE`.
- Som de sino grave + tambor.
- Na trégua: `HORDA 07 LIMPA` + moedas ganhas.

### 2.2 Duração alvo
| Horda | Tempo ideal |
|---|---|
| 1–10 | 40–60 s cada |
| 11–20 | 60–90 s |
| 21–30 | 90–130 s |
| 31–40 | 110–160 s |
| 40+ | 120–200 s |

Total até a horda 30: ~22–28 min. Se estourar 30% disso, ajustar `count` (não a vida).

---

## 3. Economia

### 3.1 Ganho por abate
`moedas = def.coin * playerCoinMul`, onde `playerCoinMul = 1 + 0.08 * lobby.faro`.
Valores base: comum 10 · frenético 15 · explosivo 20 · cuspidor 25 · tanque 35 · rastejante 10.

- Moeda entra **direto na carteira** (sem item no chão para coletar) + texto flutuante `+N`.
- `coinDropChance` (5%): cria uma moeda física no chão que vale +10 (isso sim precisa ser coletada).
- Não existe "perder moeda" ao morrer — a run acabou, ponto.

### 3.2 Fluxo esperado de moedas
| Momento | Moedas acumuladas |
|---|---|
| fim da horda 10 | 800–1.200 |
| fim da horda 20 | 2.400–3.200 |
| fim da horda 30 | 4.500–6.000 |

Se o jogador estiver com muito mais, a dificuldade está baixa. Com muito menos, a curva de abate está
errada (matando pouco).

### 3.3 Pontos de compra (no mapa)

Tipo de placa e o que faz:

| Placa | Cor | O que vende | Preço |
|---|---|---|---|
| **Arma** | verde `#54e08a` | a arma daquela placa | `CFG.WEAPONS[id].price` |
| **Munição** | branco `#f2f4f8` | +4 pentes da arma atual | `ammoPrice * (1 + 0.15*max(0,h-10))` |
| **Melhoria** | azul `#6fb7ff` | dano / pente / recarga (na ordem, uma vez cada) | `upgrade.dmg` etc. + 25/horda |

Funcionamento:
1. A placa aparece no mapa com nome e preço **sempre visível** (sem precisar chegar perto).
2. A menos de 78 px, mostra `[E] COMPRAR`.
3. Segurar `E` por 0,8 s → barra de progresso acima da placa → compra confirmada.
4. Soltar antes → cancela sem cobrar.
5. Sem moeda → barra **nem começa**; aviso vermelho `FALTAM N MOEDAS` + som seco.
6. Placa de arma já possuída → mostra `JÁ POSSUI` e não cobra.
7. Melhoria esgotada (as 3 compradas) → `ARMA NO MÁXIMO`.

### 3.4 Regra de ouro da economia
O jogador deve estar sempre **entre duas vontades**: comprar arma ou construir defesa. Se sobrar moeda
com tudo comprado, os custos progressivos estão baixos. Se nunca der pra comprar nada, os preços estão
altos. Testar com a tabela da seção 3.2.

---

## 4. HUD de moeda (o que aparece e onde)

```
Canto inferior esquerdo, acima da barra de vida:
   $ 1.240          <- fonte bold 22px, dourado
   ◆ 12             <- almas ganhas na run (fonte 15px, violeta)

Na placa de compra (no mundo):
   PISTOLA / CALIBRE 12 / MUNIÇÃO / MELHORIA
   $ 500
   [E] COMPRAR            <- só quando perto
   barra de progresso     <- só durante o hold
```
- Sempre mostrar o **preço** na placa, mesmo longe (o jogador planeja a rota).
- Quando o preço muda (custo progressivo), o número atualiza na hora.
- Nunca mostrar casas decimais; sempre inteiro com separador de milhar opcional.

---

## 5. Almas (meta-moeda) — ganho

```
almasFim = 1 * hordasAlcancadas
         + 3 * hordasLimpasSemDano
         + 15 * (quantas de 10/20/30/40 foram alcançadas)
         + 1 por 25 abates
```
Exemplo: morrer na horda 14 com 320 abates e 3 hordas sem dano →
`14 + 9 + 15 + 12 = 50 almas`.

Salvas em `hordas_save_v1.souls`. Gastas na LOJA do lobby (doc 11).

---

## 6. Checklist de aceite

- [ ] Horda 1 tem 6 zumbis e termina quando o último morre.
- [ ] O contador `RESTAM N` só chega a 0 quando de fato não há mais zumbi.
- [ ] Trégua de 6 s com contagem visível e sem spawn.
- [ ] Banner de horda aparece com o nome do tipo novo na horda certa.
- [ ] Frenético entra na 11, tanque na 15, explosivo/cuspidor na 20, rastejante na 21.
- [ ] Abate credita moeda do tipo certo.
- [ ] Compra sem dinheiro é negada sem cobrar nada, em 100% dos casos.
- [ ] Preço na placa sempre visível e atualizado.
- [ ] Horda limpa sem dano conta para almas.
- [ ] Chegar à horda 11 com 800–1.200 moedas jogando normal.
