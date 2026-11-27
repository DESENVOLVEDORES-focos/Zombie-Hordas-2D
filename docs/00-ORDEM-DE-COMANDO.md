# ORDEM DE COMANDO — o que o agente de IA deve executar

> Documento 2 de 6. Este é o **documento que manda**. Ele traduz a especificação original (doc 01) em
> execução: escopo travado, arquitetura de arquivos, ordem de trabalho, critérios de aceite e regras
> anti-desperdício.
>
> **Papel do dono do projeto:** comandar (dizer o que fazer, aprovar, cobrar).
> **Papel do agente:** executar, testar e relatar. Nunca "melhorar" o escopo por conta própria.

---

## 1. Veredito sobre a especificação (leia antes de começar)

A especificação é boa e executável. Três pontos exigem decisão, e elas estão tomadas aqui:

| Ponto da spec | Risco | Decisão travada |
|---|---|---|
| "configurações externas" e "modular, um arquivo por sistema" (§17) | em `file://` ES Modules **não funcionam** (CORS), e a spec também quer o jogo rodando local | **Scripts clássicos** (`<script src>`) com namespace global. Cada sistema em **seu próprio arquivo**. Os números vivem em um único `js/config.js` (é o "configuração externa" da spec). |
| "resolução, tela cheia, sensibilidade da mira" (§16) | são configs que costumam virar botão morto | **Todas implementadas de verdade**: canvas escala por resolução lógica, Fullscreen API, sensibilidade afeta a mira, volumes separados (geral/música/efeitos). |
| "multiplayer" (§4) | é a maior armadilha de escopo; a spec diz "etapa posterior" | **Não implementar**. Arquitetura `players[]` + estado serializável desde o dia 1. Botões de "entrar em partida" existem e explicam que é etapa futura — **não** são botões mortos (regra §20.2). |

Também estão travadas:
- **4 mapas jogáveis** (Telhados, Metrô, Hospital, Escola) — a spec lista os 4 como parte do projeto.
- **Identidade própria**: nenhum nome, mapa, HUD ou mecânica copiada de franquia existente. Referência é gênero.
- **Arte e áudio 100% procedurais** (Canvas 2D + WebAudio), zero assets, zero dependências, abre com duplo-clique.

---

## 2. Estrutura de arquivos obrigatória

Um arquivo por sistema (regra §20.10). **Nada de `game.js` monólito.**

```
/index.html                  carrega os scripts na ordem; canvas; CSS mínimo
/css/style.css               layout da página e do canvas
/js/config.js                TODOS os números: armas, zumbis, hordas, custos, barricada, torreta, perks
/js/utils.js                 matemática, RNG, clamp, rect/circle, formatação
/js/save.js                  localStorage (progresso + configurações) com fallback em memória
/js/audio.js                 WebAudio procedural (disparos, zumbis, compras, música ambiente)
/js/input.js                 teclado, mouse, gamepad-ready, sensibilidade
/js/canvas.js                resolução lógica, DPR, letterbox, fullscreen
/js/sprites.js               pré-renderização de sprites por código (jogador, 6 zumbis, defesas)
/js/map-loader.js            carrega dado de mapa -> paredes, vagas, compras, spawns, fluxo
/js/maps.js                  DADOS dos 4 mapas (único arquivo que muda ao criar mapa novo)
/js/navigation.js            grade de navegação + flow field até o jogador (pathfinding)
/js/entities.js              fábricas: jogador, zumbi, projétil, moeda, partícula
/js/player.js                movimento, vida, mira, recarga, compra, construção
/js/weapons.js               definição de armas, disparo, dispersão, dano, melhorias
/js/combat.js                projéteis, colisão por segmento, dano, morte, sangue
/js/zombies.js               IA por tipo (comum, frenético, explosivo, cuspidor, tanque, rastejante)
/js/hordes.js                fases (preparação/horda/trégua), spawn, escalonamento, dificuldade
/js/economy.js               moedas por abate, custos, compras, saldo
/js/barricades.js            construção, HP, ataque de zumbi, destruição, visual de dano
/js/turrets.js               posicionamento, alvo, rotação, cadência, dano, HP
/js/navigation-debug.js      overlay F3 (grade, flow field) — pode ficar pequeno
/js/hud.js                   HUD da partida (vida, moeda, arma, munição, recarga, horda, restantes)
/js/screens.js               título, lobby, seleção de mapa, criar/entrar partida, config, pausa, game over
/js/render.js                câmera, chão pré-renderizado, ordem por Y, partículas, vinheta
/js/main.js                  bootstrap, loop com delta time, máquina de estados
/docs/…                      esta documentação
```

**Ordem de carregamento no `index.html`** (respeita dependências):
`config → utils → save → audio → input → canvas → sprites → maps → map-loader → navigation →
entities → weapons → combat → player → zombies → hordes → economy → barricades → turrets →
hud → render → screens → main`

---

## 3. Marcos de execução (com critério de aceite verificável)

Cada marco termina com **teste real** (regra §20.13) e **commit próprio**. Não avance sem aceite.

### MARCO 1 — Base jogável + 1 mapa
Arquivos: `config, utils, canvas, input, sprites, maps, map-loader, entities, player, weapons,
combat, render, main, hud (mínimo)`.

Entrega: jogador anda em 8 direções, colide com paredes e obstáculos, mira e atira no mouse, recarrega,
**Telhados** carregado com paredes/obstáculos/spawns, zumbi comum perseguindo com colisão, dano, morte,
HUD mínimo (vida, moeda, munição), Esc pausa.

**Aceite:** abrir `index.html` com duplo-clique, andar 30 s sem atravessar parede, matar 10 zumbis
seguidos, morrer e reiniciar. Console limpo.

### MARCO 2 — Hordas, zumbis e pathfinding
Arquivos: `navigation, zombies, hordes` + evolução de `combat/entities`.

Entrega: **fluxo de navegação** (flow field por célula de 50–100 px, recalculado ao movimentar o jogador)
para que zumbi **nunca** fique preso em parede; 6 tipos com comportamento próprio; hordas por **abate
total** com contador `RESTAM N`, trégua de 6 s, anúncio de horda, escalonamento por faixas do doc 05
(1–10 fraca, 11–20 quantidade, 21–30 resistência, 31–40 especiais, 40+ combinações) **sem esponja de balas**.

**Aceite:** rodar 15 hordas em teste automático sem erro; zumbi contorna a casa de máquinas; nenhum
zumbi atravessa parede; explosivo causa dano em área e em estruturas; cuspidor acerta de longe.

### MARCO 3 — Economia, defesas, armas
Arquivos: `economy, barricades, turrets, weapons` (completo).

Entrega: moedas por abate (valores do doc 05); **pontos de compra** no mapa com barra de compra (segurar
E) para arma, munição e melhoria; **barricadas** em vagas com custo progressivo (50, 80, 90, 100, 110,
120), HP, zumbi atacando, 3 estágios visuais de dano, destruição; **torretas** em vagas com custo
progressivo, alcance 340 px, rotação, cadência, munição, HP, destruição; **6 armas** com
comportamentos realmente distintos (pistola, calibre 12 com 6 bagos, submetralhadora, rifle, rifle
pesado perfurante, lançador com área) + melhoria de dano/pente/recarga.

**Aceite:** comprar arma e ver munição esgotar; barricada ser quebrada por 2 zumbis em ~10 s; torreta
destruída se o jogador abandoná-la; compra negada sem dinheiro (com aviso) em 100% dos casos.

### MARCO 4 — Lobby, telas, áudio, configurações
Arquivos: `screens, audio, save` + `hud` completo.

Entrega: título → lobby → **seleção de 4 mapas com miniatura, ambiente e descrição** → criar partida
(opções: dificuldade inicial, som) → partida → game over → lobby. Configurações **funcionais**: volume
geral/música/efeitos, resolução, tela cheia, sensibilidade da mira, mudo. Áudio procedural completo
(disparos, recarga, zumbis, impactos, explosão, construção, destruição, compra, transição de horda,
ambiente musical com volume próprio).

**Aceite:** nenhum botão sem ação; mudar volume e resolução tem efeito imediato; recarregar a página
mantém configurações e recordes.

### MARCO 5 — Mapa 2: Metrô (+ Hospital e Escola em sequência)
Cada mapa novo = **um bloco em `js/maps.js`** + card no lobby. Nenhuma linha de engine muda. Depois
repetir para Hospital e Escola.

**Aceite:** os 4 mapas jogáveis, distintos em layout e paleta, todos com paredes, vagas, compras e spawns;
adicionar um 5º mapa leva < 30 min seguindo `docs/MAPAS.md`.

---

## 4. Regras de execução (traduzidas da spec §20)

1. **Nada de botão morto.** Se não funciona, não aparece. Se aparece, funciona.
2. **Nada de sistema fake.** Barra de compra, torreta e barricada têm de estar ligadas ao gameplay real.
3. **Zumbi não atravessa parede.** Use flow field + separação suave. Se um zumbi ficar 2 s parado, ele
   recalcula rota e, no limite, ataca a estrutura que bloqueia.
4. **Torreta respeita alcance e linha de visão.** Sem tiro em parede.
5. **Compra sem dinheiro é negada** com aviso vermelho e som seco.
6. **Curva suave**: o jogador deve chegar à horda 11 com ≥ 800 moedas.
7. **Custos progressivos** de barricada e torreta, nunca fixos.
8. **Armas diferentes de verdade** (dano, cadência, pente, dispersão, alcance, comportamento).
9. **Um sistema por arquivo.** Se um arquivo passar de ~450 linhas, divida.
10. **Teste antes de avançar.** Relate em até 6 linhas o que passou e o que não passou.
11. **Identidade própria.** Se uma mecânica só existe em uma franquia, ela entra renomeada/redesenhada.
12. **pt-BR** na interface e comentários; identificadores em inglês.
13. **Zero assets e zero dependências.** Tudo desenhado/sintetizado em código.
14. **60 FPS** com 150 zumbis vivos (stress: 300).

---

## 5. Como reportar (formato obrigatório)

Ao final de cada marco, responda **somente** isto:

```
MARCO X — <nome>
Passou: <lista curta>
Falhou/ajustado: <o que mudou e por quê>
Como rodar: abrir index.html no navegador
Próximo: MARCO X+1
```

Sem colar código no chat. Sem pedir permissão para o que já está decidido aqui.

---

## 6. Leitura obrigatória antes de codar

| Ordem | Documento | Por quê |
|---|---|---|
| 1 | `01-ESPECIFICACAO-ORIGINAL.md` | a base do projeto (este pacote não substitui) |
| 2 | `02-ARQUITETURA.md` | como organizar arquivos, dados e o loop |
| 3 | `03-PROMPT-EXECUCAO.md` | **o prompt para colar no chat de IA** |
| 4 | `04-BALANCEAMENTO.md` | os números (armas, zumbis, hordas, custos) |
| 5 | `05-MAPAS-E-BACKLOG.md` | como criar mapa e o que fica para depois |
