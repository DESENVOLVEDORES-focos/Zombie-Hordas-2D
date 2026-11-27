# ORDEM DE EXECUÇÃO — passo a passo por arquivo

> Documento 15 de 16. É a folha de serviço: **o que escrever, em que arquivo, em que ordem**.
> Use junto com o doc 15 (prompt). Aqui não há conceito — só ordem de serviço.

---

## Regra de ouro

Cada linha abaixo é um **commit** possível. Não comece o próximo item antes de o anterior rodar.
Se um item depender de outro que não está pronto, o item está mal descrito: conserte a ordem.

---

## FASE A — Esqueleto que abre (sem jogo ainda)

| # | Arquivo | O que entra | Como testar |
|---|---|---|---|
| A1 | `index.html` | canvas 1280×720, `css/style.css`, `<script>` na ordem do doc 00 | abre cinza, console limpo |
| A2 | `js/config.js` | conteúdo EXATO do doc 06 | `console.log(CFG.PLAYER.hp)` → 100 |
| A3 | `js/utils.js` | clamp, lerp, dist, dist2, segCircle, circleRect, rnd, rndi, pick, fmtTime, rr, shade | teste rápido no console |
| A4 | `js/canvas.js` | DPR, letterbox, fullscreen, `screenToWorld` | redimensionar janela não distorce |
| A5 | `js/main.js` | loop com delta time clampado, validação de CFG, `Game.screen` | contador de FPS na tela |

**Aceite da fase A:** a página abre, mostra "HORDAS" no centro e o loop roda a 60 FPS sem erro.

---

## FASE B — O mapa aparece

| # | Arquivo | O que entra | Como testar |
|---|---|---|---|
| B1 | `js/maps.js` | bloco TELHADOS do doc 13 completo (paredes, obstáculos, decor, vagas, placas, spawns, zonas) | `MAPS[0].walls.length > 0` |
| B2 | `js/map-loader.js` | converte tiles→px, deriva `solidRects`, valida o mapa | erro claro se vaga estiver em parede |
| B3 | `js/render.js` (parte 1) | chão pré-renderizado 3200×3200 com piso, emendas, manchas, grãos, decor e ícones de vaga | mapa bonito e sem repetição visível |
| B4 | `js/render.js` (parte 2) | paredes com sombra/topo/contorno + obstáculos (AC, duto, caixa d'água, caixote) | mapa legível em preto e branco |
| B5 | `js/render.js` (parte 3) | câmera com lerp e look-ahead, clamp nas bordas | câmera suave, não passa da borda |

**Aceite da fase B:** dá pra "voar" pelo mapa com a câmera presa ao centro; toda parede tem colisão
derivada; nenhuma vaga caiu dentro de sólido.

---

## FASE C — O jogador existe

| # | Arquivo | O que entra | Como testar |
|---|---|---|---|
| C1 | `js/input.js` | teclas, mouse, `poll()`, `axis()` normalizado, sensibilidade | andar nas 8 direções |
| C2 | `js/sprites.js` (jogador) | 4 direções × 4 frames + parado, conforme doc 12 | animação não "patina" |
| C3 | `js/player.js` (movimento) | colisão por eixo, deslize, clamp, animação | correr contra a parede desliza |
| C4 | `js/entities.js` | fábricas: player, projétil, zumbi, partícula, texto, moeda | objetos com campos do doc 07 |
| C5 | `js/hud.js` (mínimo) | vida, moeda, nome da arma, munição | HUD não cobre o centro |

**Aceite da fase C:** o personagem anda, colide, não atravessa nada e a câmera o acompanha.

---

## FASE D — Combate

| # | Arquivo | O que entra | Como testar |
|---|---|---|---|
| D1 | `js/weapons.js` | 6 armas, disparo com pellets, dispersão, cadência, recarga, troca de slot | pistola atira e recarrega |
| D2 | `js/combat.js` (projéteis) | atualização por segmento, colisão com parede/zumbi, perfuração, splash | tiro não atravessa parede |
| D3 | `js/sprites.js` (zumbi comum) | 4 direções × 9 frames | silhueta legível |
| D4 | `js/zombies.js` (comum) | perseguição simples (sem flow field ainda), colisão, dano por contato | zumbi chega e machuca |
| D5 | `js/combat.js` (dano/morte) | flash, sangue no canvas, partículas, textos, moedas | matar 10 seguidos |

**Aceite da fase D:** 10 abates, sangue acumulando, munição acabando, recarga funcionando.

---

## FASE E — Navegação de verdade

| # | Arquivo | O que entra | Como testar |
|---|---|---|---|
| E1 | `js/navigation.js` (grade) | `blocked`, BFS, `dist`, `flow` | F3 mostra setas apontando pro jogador |
| E2 | `js/zombies.js` (movimento) | usar `flow`, ruído individual, separação, detector de travamento | zumbis contornam a casa de máquinas |
| E3 | `js/navigation.js` (eventos) | recalcular em troca de célula, 0,5 s, mudança de barricada | nenhum zumbi preso |
| E4 | `js/zombies.js` (6 tipos) | comportamentos do doc 08 (windup, telegraph, kite, push, low) | cada tipo se comporta diferente |

**Aceite da fase E:** 10 min de sim com **zero** zumbis presos e **zero** em parede.

---

## FASE F — Hordas

| # | Arquivo | O que entra | Como testar |
|---|---|---|---|
| F1 | `js/hordes.js` | máquina PREP/HORDE/BREAK, pulsos de spawn, `remaining` | horda 1 termina ao matar o último |
| F2 | `js/hordes.js` | escalonamento e liberação por horda (11/15/20/21) | tipos certos nas hordas certas |
| F3 | `js/hud.js` | banner de horda, `RESTAM N`, contagem de trégua | banner aparece 2,2 s |
| F4 | `js/hordes.js` | fim de run, estatísticas, `Game.screen='GAMEOVER'` | game over com números corretos |

**Aceite da fase F:** 15 hordas seguidas sem exceção.

---

## FASE G — Economia e compras

| # | Arquivo | O que entra | Como testar |
|---|---|---|---|
| G1 | `js/economy.js` | moeda por abate, multiplicadores, texto flutuante | valores do doc 04 |
| G2 | `js/economy.js` | placas de compra: arma, munição, melhoria | compra e debita certo |
| G3 | `js/player.js` (E) | barra de 0,8 s, cancelamento, negação sem moeda | não cobra nada quando nega |
| G4 | `js/render.js` | placas desenhadas com nome e preço sempre visíveis | preço atualiza com custo progressivo |

**Aceite da fase G:** comprar arma, gastar munição, reabastecer; nenhuma compra fantasma.

---

## FASE H — Defesas

| # | Arquivo | O que entra | Como testar |
|---|---|---|---|
| H1 | `js/barricades.js` | construção em vaga, custo progressivo, HP | preço sobe a cada uma |
| H2 | `js/barricades.js` | zumbi ataca, 3 estágios visuais, quebra, destroços | quebra em ~10 s com 2 zumbis |
| H3 | `js/barricades.js` | reparo pago, recalcular flow field | caminho fecha e abre |
| H4 | `js/turrets.js` | construção, custo progressivo, alvo com alcance+lineClear | não atira fora do alcance |
| H5 | `js/turrets.js` | rotação suave, cadência, munição, recarga paga, destruição | para ao zerar munição |
| H6 | `js/navigation.js` | barricada entra/sai do `blocked` | zumbis vão bater em vez de ignorar |

**Aceite da fase H:** 8 vagas de barricada e 5 de torreta funcionando, com zumbis reagindo.

---

## FASE I — Telas e persistência

| # | Arquivo | O que entra | Como testar |
|---|---|---|---|
| I1 | `js/save.js` | save/settings com fallback em memória, merge de defaults | F5 mantém tudo |
| I2 | `js/screens.js` | TITLE e LOBBY navegáveis por teclado e mouse | todos os botões agem |
| I3 | `js/screens.js` | MAP_SELECT com miniaturas procedurais | miniatura reflete o mapa |
| I4 | `js/screens.js` | CREATE_GAME (dificuldade, jogadores, som) | opções têm efeito real |
| I5 | `js/screens.js` | PAUSE, GAMEOVER, SCORES | pausa congela timers |
| I6 | `js/screens.js` | SHOP de almas | compra, aplica, salva |
| I7 | `js/screens.js` | SETTINGS com 11 itens do doc 11 | cada um aplica na hora |

**Aceite da fase I:** nenhum botão sem ação; configurações persistentes.

---

## FASE J — Áudio

| # | Arquivo | O que entra | Como testar |
|---|---|---|---|
| J1 | `js/audio.js` | contexto no primeiro gesto, master/sfx/music, limite de 12 vozes | som sai e não estala |
| J2 | `js/audio.js` | os 18 sons do doc 12 | cada um distinguível |
| J3 | `js/audio.js` | variação de pitch, atenuação por distância, passos | 60 tiros seguidos não irritam |
| J4 | `js/audio.js` | pad ambiente a partir da horda 10 | musicVolume funciona |

**Aceite da fase J:** jogar 5 min com som não cansa.

---

## FASE K — Os 4 mapas

| # | Arquivo | O que entra | Como testar |
|---|---|---|---|
| K1 | `js/maps.js` | METRÔ conforme doc 13 | jogável, distinto |
| K2 | `js/maps.js` | HOSPITAL | jogável, distinto |
| K3 | `js/maps.js` | ESCOLA | jogável, distinto |
| K4 | `js/map-loader.js` | validação automática em todos | erro claro se mapa inválido |
| K5 | `docs/MAPAS.md` | guia de 30 min para criar mapa novo | seguir e criar um 5º de teste |

**Aceite da fase K:** 4 mapas jogáveis sem nenhuma alteração no engine.

---

## FASE L — Teste e polimento

| # | Item | O que entra |
|---|---|---|
| L1 | `tools/sim.js` | roteiro automatizado + invariantes do doc 14 |
| L2 | Balanceamento | rodar sim 3× e ajustar `count`/`hpMul` conforme alvo |
| L3 | Performance | perfil de 140 zumbis; corrigir onde cair |
| L4 | Acessibilidade | reduzir flash, alto contraste, escala de HUD |
| L5 | `README.md` | como jogar, controles, como rodar |
| L6 | `docs/GDD-FINAL.md` | o que existe de fato no jogo |

**Aceite da fase L:** todos os checklists do doc 14 marcados, sim sem erro, 58+ FPS.

---

## Total esperado

| Fase | Commits | Complexidade |
|---|---|---|
| A–C | 3–4 | baixa |
| D–E | 3 | **alta** (é o coração) |
| F–H | 4 | alta |
| I–K | 3 | média |
| L | 1 | média |

Se o executor terminar as fases A–E e o jogo já for "divertido de olhar", o projeto venceu. O resto é
conteúdo em cima de uma base que funciona.
