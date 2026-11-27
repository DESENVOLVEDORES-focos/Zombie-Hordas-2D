# ESPECIFICAÇÃO — INTERFACE, TELAS E CONFIGURAÇÕES

> Documento 11 de 16. Arquivos: `screens.js`, `hud.js`, `render.js` (overlay).
> Regra §20.2 da especificação: **nenhum botão sem ação.** Este documento define cada tela, cada elemento
> e o que ele faz ao ser clicado — se não estiver aqui, não existe.

---

## 1. Fluxo de telas

```
BOOT (valida config)
  └─► TITLE ──► LOBBY ──► MAP_SELECT ──► CREATE_GAME ──► LOADING ──► PLAYING
                    │                                                  │
                    ├─► SHOP (almas)                                   ├─► PAUSED
                    ├─► SETTINGS                                       │      ├─► SETTINGS
                    ├─► SCORES                                         │      └─► LOBBY
                    └─► QUIT (volta ao TITLE)                          └─► GAMEOVER ──► LOBBY
```

Navegação: **100% teclado e mouse**. Nenhuma tela depende só de mouse.

---

## 2. TITLE

```
[ tela escura com prédios em silhueta e névoa procedural ]

              H O R D A S
    SOBREVIVA AO TELHADO — CADA HORDA COBRA MAIS CARO

        ▶ JOGAR            (Enter)
          CONFIGURAÇÕES    (C)
          RECORDES         (R)
          SAIR             (Esc)
```
| Elemento | Ação |
|---|---|
| JOGAR | vai para LOBBY |
| CONFIGURAÇÕES | vai para SETTINGS |
| RECORDES | vai para SCORES |
| SAIR | volta ao TITLE com aviso "feche a aba para sair" (não há como fechar aba por script) |

---

## 3. LOBBY

```
                                      ◆ 47 ALMAS
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │   JOGAR      │  │ CRIAR PARTIDA│  │ ENTRAR       │
   └──────────────┘  └──────────────┘  └──────────────┘
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ LOJA DE ALMAS│  │CONFIGURAÇÕES │  │  RECORDES    │
   └──────────────┘  └──────────────┘  └──────────────┘

   RECORDE: HORDA 23 · 18:42 · 640 ABATES
```
| Botão | Ação real |
|---|---|
| **JOGAR** | vai para MAP_SELECT (atalho rápido: último mapa jogado) |
| **CRIAR PARTIDA** | vai para MAP_SELECT em modo "criar" (permite escolher opções) |
| **ENTRAR** | **não é botão morto**: abre painel explicando que é etapa futura (multiplayer) e mostra `arquitetura pronta — ver docs/05`. Fecha com Esc. |
| **LOJA DE ALMAS** | vai para SHOP |
| **CONFIGURAÇÕES** | vai para SETTINGS |
| **RECORDES** | vai para SCORES |

Regra: o botão ENTRAR precisa ser honesto no texto — não pode fingir que vai conectar.

---

## 4. MAP_SELECT

Grade com os 4 mapas. Cada card mostra: **miniatura procedural**, **nome**, **subtítulo**, **ambiente**,
**descrição curta** e **dificuldade**.

```
┌────────────────────────────┐  ┌────────────────────────────┐
│ [ miniatura do mapa ]      │  │ [ miniatura do mapa ]      │
│ TELHADOS                   │  │ METRÔ                      │
│ Cobertura do Edifício Aurora│ │ Estação Linha 4            │
│ Externo · noite            │  │ Subterrâneo                │
│ "Áreas abertas, dutos e    │  │ "Corredores longos: a      │
│  muito vento."             │  │  horda vem em fila."       │
│ DIFICULDADE ●●○○           │  │ DIFICULDADE ●●●○           │
└────────────────────────────┘  └────────────────────────────┘
```
| Ação | Efeito |
|---|---|
| Clique no card / setas + Enter | seleciona e **abre o card grande** (descrição completa + botão JOGAR) |
| JOGAR | vai para CREATE_GAME (opções) |
| Esc | volta ao LOBBY |

**Miniatura**: retângulo 232×128 desenhado por código com a paleta do mapa, mostrando as massas de parede
em escala reduzida — é um "mapa de calor" do layout real, não um desenho decorativo.

---

## 5. CREATE_GAME (opções da partida)

```
MAPA: TELHADOS
DIFICULDADE INICIAL:  [ FÁCIL ]  [ NORMAL ]  [ DIFÍCIL ]
   (muda o multiplicador de vida/dano: 0,85× / 1,0× / 1,25× e +10% de moedas no difícil)
JOGADORES: 1   (2–4: "etapa futura" desabilitado com explicação)
SOM: [ LIGADO ]
                        [ INICIAR ]      [ VOLTAR ]
```
Todas as opções têm efeito real e são salvas em `hordas_settings_v1`.

---

## 6. PLAYING — HUD (posições exatas em 1280×720)

```
 topo-esquerda            topo-centro                  topo-direita
 ┌──────────────┐      HORDA 07                     18:42
 │ PERKS (até 3)│      RESTAM 23                     ABATES 214
 └──────────────┘

                    (centro livre — nada cobre o jogador)



 base-esquerda                                    base-direita
 $ 1.240                                          RIFLE VETOR
 ◆ 12                                             28 / 120
 ┌──────────────────┐                             [1] RIFLE  [2] CALIBRE 12
 │ HP 78/100        │
 └──────────────────┘
```
| Elemento | Detalhe |
|---|---|
| Vida | barra 246×22 + número; cor muda em 60% e 30% |
| XP / nível | acima da vida (opcional nesta versão) |
| Moeda | `$ 1.240` dourado, 22 px |
| Almas da run | `◆ 12` violeta, 15 px |
| Horda | `HORDA 07` 20 px + `RESTAM 23` vermelho |
| Cronômetro | `mm:ss` |
| Abates | contador |
| Arma | nome 18 px + `pente / reserva` (40 px o pente) |
| Recarga | barra fina + texto `RECARREGANDO` |
| Slots | 2 caixas 88×28 com nome da arma |
| Perks | até 3 chips pequenos no topo esquerdo |
| Avisos | centro-baixo, 1,6 s, cor por tipo (ok/erro) |
| Banner de horda | centro, 64 px, 2,2 s |

**Regra:** nenhum painel pode ocupar o terço central da tela. O jogador precisa ver a horda.

---

## 7. PAUSED

```
        PAUSADO
        ─────────────────
        CONTINUAR            (Esc / Enter)
        CONFIGURAÇÕES        (C)
        ABANDONAR PARTIDA    (Enter com confirmação de 2 s)
```
- Pausa **congela tudo** (inclusive timers de horda e cooldowns).
- `Esc` retoma.
- Abandonar exige segurar 2 s (evita perder a run sem querer).

---

## 8. GAMEOVER

```
                VOCÊ CAIU
                NA HORDA 17

   TEMPO            24:18
   ABATES             512
   MOEDAS GANHAS    3.870
   ALMAS              +38

   ★ NOVO RECORDE ★   (se aplicável)

   [ R ] JOGAR DE NOVO     [ E ] LOBBY
```

---

## 9. SHOP (loja de almas)

6 itens em grade. Cada card: nome, descrição, nível atual (pips), efeito atual, custo e estado do botão.

| Item | Base | Crescimento | Máx | Efeito |
|---|---|---|---|---|
| Arma de estimação | 30 | ×1,8 | 3 | começa com Calibre 12 / Vetor / Zumbido |
| Vitalidade | 20 | ×1,7 | 5 | +10 vida máxima |
| Marcenaria | 25 | ×1,7 | 5 | +120 HP de barricada |
| Engenharia | 30 | ×1,8 | 4 | −15% custo de torreta |
| Saquinho | 15 | ×1,6 | 5 | +50 moedas iniciais |
| Faro | 20 | ×1,7 | 5 | +8% moedas por abate |

Cada compra: debita almas, aplica **na hora** (a próxima partida já usa) e salva.
Sem saldo: botão mostra `FALTAM N` e não faz nada.

---

## 10. SETTINGS (todas funcionais — spec §16)

| Item | Controle | Efeito real |
|---|---|---|
| Volume geral | slider 0–100% | `master.gain` |
| Volume música | slider 0–100% | `music.gain` |
| Volume efeitos | slider 0–100% | `sfx.gain` |
| Resolução | 1280×720 / 1600×900 / 1920×1080 | muda resolução lógica + letterbox |
| Tela cheia | Liga/Desliga | `requestFullscreen()` no container |
| Sensibilidade da mira | slider 50–200% | multiplica o vetor mouse→mundo |
| Tiro automático | Liga/Desliga | atira sem segurar o botão |
| Tremor de tela | Liga/Desliga | `shakeScale` 1 ou 0 |
| Números de dano | Liga/Desliga | mostra/oculta textos |
| Reduzir efeitos | Liga/Desliga | menos partículas, sem sangue no chão |
| Modo streamer | Liga/Desliga | silencia tudo, mantém estado |
| Apagar progresso | segurar 2 s | limpa save e configurações |

Todas persistem em `hordas_settings_v1` e aplicam **imediatamente**, sem reiniciar.

---

## 11. SCORES

```
   RECORDES
   ────────────────────────────────────
   #1   HORDA 31   29:14   812 ABATES   28/11
   #2   HORDA 27   24:02   690 ABATES   27/11
   ...
   ────────────────────────────────────
   MELHOR: HORDA 31 · 29:14 · 812 ABATES
```
Top 10, salvo em `hordas_save_v1.scores`. Ordenado por pontuação
(`horda*2000 + abates*15 + moedas/10 + segundos`).

---

## 12. Checklist de aceite

- [ ] Toda tela acessível por teclado E mouse.
- [ ] Nenhum botão sem ação (testar um por um, clicando).
- [ ] ENTRAR explica honestamente que multiplayer é etapa futura.
- [ ] Cada mudança em SETTINGS tem efeito imediato e persiste após F5.
- [ ] Miniaturas dos mapas refletem o layout real de cada um.
- [ ] HUD não cobre o centro da tela em nenhuma resolução.
- [ ] Pausa congela timers de horda.
- [ ] Game over mostra números corretos e destaca recorde novo.
- [ ] Loja debita, aplica e salva; sem saldo o botão informa.
