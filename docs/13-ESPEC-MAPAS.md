# ESPECIFICAÇÃO — OS 4 MAPAS

> Documento 13 de 16. Cada mapa é **dado** em `js/maps.js`. Aqui está o layout conceitual de cada um,
> com as zonas obrigatórias e o que torna cada um diferente de jogar.
>
> Regra: **nenhuma linha de engine muda ao adicionar mapa.** Se precisar, o sistema está errado.

---

## 0. Especificação comum a todos

| Item | Regra |
|---|---|
| Grade | 32×32 tiles de 100 px (3200×3200) — mesma para todos nesta versão |
| Borda | sempre fechada (parapeito/parede) — o mapa é a arena |
| Vagas de barricada | **8** por mapa, cobrindo os corredores principais |
| Vagas de torreta | **5** por mapa, com visão de corredor (nunca em canto cego) |
| Placas de compra | **6**: 2 arma, 2 munição, 2 melhoria, distribuídas longe |
| Spawns | **8**: cantos + pontas de corredor, nenhum no centro |
| Zonas de risco | 1–2 por mapa (área aberta sem cobertura ou sala de saída única) |
| Validação | todas as vagas/placas/spawns em célula livre; todo spawn alcança o jogador |
| Paleta | 4–5 cores próprias; contraste chão↔parede forte |

**Teste de leitura:** tirar um print em preto e branco. Se não der pra distinguir corredor, parede e vaga,
o mapa está mal desenhado.

---

## 1. TELHADOS — cobertura do Edifício Aurora

**Ambiente:** externo, noite, céu urbano ao fundo, vento.
**Sensação:** áreas abertas, boa mobilidade, poucos gargalos → mapa "de kitar".
**Dificuldade:** ●●○○

### Layout

```
┌────────────── PARAPEITO (parede fina em toda a volta) ──────────────┐
│ [AC]      DUTO ══════════════ [CAIXA D'ÁGUA]         [AC][AC]      │
│                                                                    │
│ [B1]        (área aberta central)              [PLACA ARMA 1]      │
│                                                                    │
│     ┌──── casa de máquinas (2 portas) ────┐      [heliponto ○]     │
│     │            [PLACA MUNIÇÃO]          │                        │
│     └─────────────────────────────────────┘  [T1]      [B4]        │
│                                                                    │
│ [B2]     [B3]        corredor leste                  [PLACA UP]    │
│                                                                    │
│ DUTO ═══════════════ [T2]  [AC]  [PLACA ARMA 2]        [B5]        │
│                                                                    │
│ [B6]  [B7]      [ESCADA]        [PLACA MUNIÇÃO 2]     [T3]  [T4]   │
└────────────────────────────────────────────────────────────────────┘
 spawns (8): 4 cantos · 2 portas da casa de máquinas · escada · beirada sul
```

### Elementos
| Elemento | Tipo | Função |
|---|---|---|
| Parapeito | parede | fecha o mapa, cria "cantos de morte" |
| Casa de máquinas | parede + 2 portas | sala de risco (entrar sem saída) |
| Heliponto | decor | área aberta: boa para atirar, péssima para se esconder |
| Caixa d'água | obstáculo | cobertura central |
| Dutos (2 longos) | obstáculo | criam funis curtos |
| ACs (4) | obstáculo | cobertura móvel de combate |
| Escada | decor + spawn | entrada de zumbi no sul |

### Por que é o mapa 1
É o mais legível (áreas amplas) e perdoa o jogador iniciante. Serve de tutorial do gênero.

---

## 2. METRÔ — Estação Linha 4, plataforma sul

**Ambiente:** subterrâneo, azulejo, luz de emergência piscando, vagão parado.
**Sensação:** corredores longos → a horda vem **em fila**; torreta brilha; barricada vira decisão.
**Dificuldade:** ●●●○

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  BILHETERIA (sala)      │ CATRACAS │      ACESSO NORTE       │
├─────────────────────────┴──────────┴────────────────────────┤
│                    CORREDOR NORTE (longo, 12 tiles)          │
├──────────────┬────────────────────────────┬──────────────────┤
│ SALA MANUT.  │      PLATAFORMA CENTRAL    │  SALA ELÉTRICA   │
│  (2 portas)  │   [vagão parado] [vagão]   │   (1 porta)      │
├──────────────┴────────────────────────────┴──────────────────┤
│  TRILHO 1 (corredor estreito)  ════════  TRILHO 2            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│              PLATAFORMA SUL (aberta) → ESCADA DE SAÍDA       │
└──────────────────────────────────────────────────────────────┘
 spawns (8): escada norte/sul · 2 pontas de cada trilho · 2 salas · vagão
```

### Elementos
| Elemento | Tipo | Função |
|---|---|---|
| Vagões parados | obstáculo | cobertura; zumbi contorna em fila |
| Trilhos | corredor | funil natural: péssimo para ficar, ótimo para atirar em fila |
| Catracas | obstáculo (linha) | atrasa a horda no gargalo |
| Sala de manutenção | parede + 2 portas | rota alternativa |
| Sala elétrica | parede + 1 porta | **zona de risco**: moeda boa lá dentro |
| Plataforma central | área aberta | kitar curto |

### Identidade de gameplay
Mapa de **funil**. A torreta no corredor norte vale o dobro. A barricada na catraca compra 10 s.
Errar o posicionamento aqui mata mais que zumbi rápido.

---

## 3. HOSPITAL — Ala de emergência

**Ambiente:** corredores brancos, luz fluorescente falhando, macas, sangue seco nas paredes.
**Sensação:** muitas salas, portas, cobertura farta; cuspidor domina.
**Dificuldade:** ●●●●

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  RECEPÇÃO (aberta)   │  TRIAGEM  │   CORREDOR CENTRAL        │
├──────────────────────┴───────────┴───────────────────────────┤
│ QUARTO 1 │ QUARTO 2 │  ENFERMARIA (4 camas)  │ QUARTO 3      │
│ (1 porta)│ (2 pnt)  │                        │ (1 porta)     │
├──────────┴──────────┴────────────────────────┴───────────────┤
│        CENTRO CIRÚRGICO (2 portas, mesa central)              │
├──────────────────────────────────────────────────────────────┤
│  UTI (leitos)        │      CORREDOR SUL         │  MORGUE    │
└──────────────────────────────────────────────────────────────┘
 spawns (8): 4 cantos · 2 corredores · centro cirúrgico · morgue
```

### Elementos
| Elemento | Tipo | Função |
|---|---|---|
| Camas/macas | obstáculo pequeno | cobertura granular: canais entre elas |
| Centro cirúrgico | parede + 2 portas | sala grande, boa para barricada dupla |
| Morgue | parede + 1 porta | **zona de risco** com placa de melhoria |
| Quartos | parede + 1 porta | armadilha: entrar atrás de moeda e ficar cercado |
| Recepção | área aberta | ponto de respiro |

### Identidade de gameplay
Mapa de **portas**. Cada porta é uma decisão: fechar com barricada agora ou guardar moeda?
O cuspidor (horda 20+) obriga o jogador a abandonar salas fechadas — o mapa vira um jogo de
reposicionamento.

---

## 4. ESCOLA — Colégio Municipal

**Ambiente:** corredores com armários, salas de aula, quadra descoberta, refeitório, biblioteca.
**Sensação:** dois mapas num: quadra aberta (caos) e corredor (funil).
**Dificuldade:** ●●●○○

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│ SALA 1 │ SALA 2 │ SALA 3 │  CORREDOR NORTE (armários)        │
├────────┴────────┴────────┴───────────────────────────────────┤
│ BIBLIOTECA (estantes = obstáculos em grade)   │ REFEITÓRIO   │
│                                               │ (mesas)      │
├───────────────────────────────────────────────┴──────────────┤
│                 PÁTIO / QUADRA (grande, aberto)              │
│                     ○ círculo central                         │
├──────────────────────────────────────────────────────────────┤
│ Vestiário │      CORREDOR SUL       │  SALA DE PROFESSORES    │
└──────────────────────────────────────────────────────────────┘
 spawns (8): 4 cantos · portões da quadra (2) · 2 corredores
```

### Elementos
| Elemento | Tipo | Função |
|---|---|---|
| Estantes da biblioteca | obstáculo em grade (corredores 1 tile) | labirinto: ótimo emboscar, péssimo fugir |
| Mesas do refeitório | obstáculo médio | cobertura de tiro |
| Quadra | área aberta com círculo central | caos: horda te cerca em 360° |
| Armários | obstáculo fino (linha) | canaliza o corredor |
| Salas de aula | parede + 1 porta | risco com recompensa |

### Identidade de gameplay
Mapa de **duas metades**. Ficar na quadra é suicídio depois da horda 20; ficar na biblioteca é seguro
até o tanque entalar a passagem. O jogador aprende a alternar.

---

## 5. Tabela comparativa (para o lobby)

| Mapa | Ambiente | Layout | Risco | Melhor para |
|---|---|---|---|---|
| Telhados | externo · noite | aberto | baixo | aprender, kitar |
| Metrô | subterrâneo | corredores | médio | torreta, funil |
| Hospital | interno · claro | salas | alto | barricada por porta |
| Escola | misto | duas metades | médio-alto | alternar estratégia |

---

## 6. Validação automática (obrigatória no load de cada mapa)

```js
validateMap(map):
  - todas as paredes/obstáculos dentro dos limites
  - nenhuma vaga dentro de sólido
  - todas as vagas/placas/spawns em célula livre
  - existe pelo menos 1 caminho entre cada spawn e o centro (BFS)
  - as 4 bordas fechadas
  se falhar: console.error('MAPA INVÁLIDO: ' + id + ' — ' + motivo) e card desabilitado no lobby
```
Isso impede o clássico "mapa novo com vaga dentro da parede" que só aparece no meio da partida.
