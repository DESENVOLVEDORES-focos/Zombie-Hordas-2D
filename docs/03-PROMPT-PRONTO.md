# PROMPT PRONTO PARA COLAR

> Documento 4 de 6. Copie o bloco abaixo inteiro para um novo chat do Arena em **modo agent**.
> Se possível, **a partir do repositório `Zombie-Hordas-2D`** (assim ele já tem o `docs/` deste pacote).
> O prompt é auto-suficiente: se colar num repositório vazio, ele funciona também.

---

## 3.1 — Prompt principal (copie tudo dentro do bloco)

```text
Implemente do zero o jogo "HORDAS 2D": survival infinito de hordas de zumbis, visão topdown 90°
(vista de cima pura, sem rotação, sem perspectiva), em HTML5 + JavaScript + Canvas 2D puro.
Sem nenhuma dependência, sem npm, sem CDN, sem assets externos: TODA a arte é desenhada por código
com a Canvas 2D API e TODA a fonte é monospace/sans-serif do sistema. O jogo tem que rodar com
duplo-clique no index.html (file://), então use um único game.js em IIFE — não use fetch() nem ES modules.

LEIA PRIMEIRO, na ordem, os documentos em docs/: 00-ORDEM-EXECUCAO.md, 01-GDD.md, 02-ESPECIFICACAO-
TECNICA.md, 04-BALANCEAMENTO.md. Eles são a fonte da verdade: escopo, regras, números de balanceamento,
paleta de cores, comportamento de cada um dos 7 tipos de zumbi, boss, habilidades e melhorias.
Se algum número ou detalhe estiver em aberto, escolha a opção mais simples que funcione, e registre em
docs/DECISOES.md. NÃO me pergunte nada antes de começar; NÃO me mostre código no chat.

ESTRUTURA FINAL DO REPOSITÓRIO:
  index.html      (canvas em tela cheia, CSS de fundo #0b0d10, <script src="game.js">)
  game.js         (todo o jogo, em IIFE, dividido nas seções indicadas no doc 02)
  README.md       (como jogar, controles, conteúdo, como rodar)
  docs/GDD.md     (o que existe no jogo, versão curta)
  docs/DECISOES.md

ENTREGUE EM 3 MARCOS, na ordem, cada um jogável e cada um com seu commit
("feat: marco 1 - nucleo jogavel", "feat: marco 2 - conteudo", "feat: marco 3 - polimento"):

MARCO 1 - Núcleo: arena 3200x3200 com câmera suave, jogador WASD/setas, tiro automático no zumbi mais
próximo, spawn de Caminhantes, colisão, dano, morte, gemas de XP com ímã, level up pausando o jogo com
3 cartas de melhoria (teclado e mouse), HUD (vida, XP, onda, tempo, kills), game over e restart (R).

MARCO 2 - Conteúdo: os 7 tipos de zumbi (cada um com silhueta, cor e comportamento próprios), elites a
partir da onda 3, BOSS "Aberraça" a cada 5 ondas com barra de vida e 3 ataques (stomp, investida,
invocar rastejantes), ondas infinitas escalando conforme o doc 04, as 4 habilidades (Dash, Onda de
Choque, Granada Incendiária, FÚRIA) com cooldown no HUD, 18+ melhorias upáveis (máx. 5 níveis, oferta
com 3 cartas e raridades), drops (kit médico, ímã, granada grátis), almas em localStorage +
loja de melhorias permanentes no título e no game over, partículas de sangue, números de dano, flash
de dano e screen shake.

MARCO 3 - Polimento: áudio 100% procedural com WebAudio (tiro, hit, morte, level up, dano, boss) com
limite de 12 vozes e controle de volume; telas TÍTULO / COMO JOGAR / CONFIG; pausa (Esc/P) e pausa
automática com document.hidden; vinheta vermelha com vida < 30%; tela de game over com tempo, onda,
kills, almas e recorde; performance com grid espacial para 300+ zumbis a 60 FPS; delta time em todas
as atualizações; sprite atlas pré-renderizado em canvas offscreen (8 rotações x 2 frames).

REGRAS TÉCNICAS OBRIGATÓRIAS:
- requestAnimationFrame com delta time clampe (máx. 1/30 s). Nada de velocidade por frame.
- Um loop de update com ordem fixa: input → jogador → habilidades → armas/projéteis → zumbis →
  colisões → drops → partículas → câmera → UI.
- Grid espacial (célula 80px) para colisão/projétil-alvo: sem O(n²).
- Separação suave entre zumbis (empurrão mútuo fracionário) para eles fluírem, sem virar paredão.
- Limpar entidades mortas com filtro por frame; nunca mutar array durante for...of no meio de remoção.
- localStorage com try/catch e fallback em memória.
- localStorage keys: "hordas2d_save_v1", "hordas2d_settings_v1".
- Nada de erro no console. Tudo em pt-BR na interface.
- Paleta EXATA conforme doc 01, seção 7.

AO FINAL DE CADA MARCO: valide o checklist de aceite correspondente no doc 02 versionando o que você
testou, e responda em no máximo 6 linhas. Não cole código no chat. Comece pelo Marco 1 agora.
```

---

## 3.2 — Mensagens de acompanhamento (use só se precisar)

**Se ele parar no meio do Marco 1:**
```text
Continue o Marco 1 exatamente de onde parou. Antes de seguir, confirme que o jogo abre com duplo-clique
no index.html e roda 3 minutos sem erro no console. Depois siga para o Marco 2.
```

**Se o desempenho cair:**
```text
A performance está baixa com muitos zumbis. Aplique, nesta ordem: (1) grid espacial de célula 80px
para consultas de proximidade, (2) pré-renderizar cada sprite de zumbi em canvas offscreen por rotação
e frame, (3) limitar partículas a um pool fixo de 400 com reciclagem, (4) não usar ctx.save/restore
dentro de loops de desenho. Meça com um contador de FPS no canto e me diga o número antes/depois.
```

**Se as melhorias parecerem sem graça:**
```text
Rebalanceie as melhorias para que cada carta seja perceptível em 10 segundos de jogo, conforme o doc 04.
Garanta que ao menos uma opção de cada oferta seja de raridade rara ou épica depois do nível 3, e que
Drones e Perfuração apareçam no pool só depois do nível 4.
```

**Se quiser revisar visual sem mexer em lógica:**
```text
Revise apenas a camada visual, sem alterar regras: contorno de 2px quase preto em todas as entidades,
sombra elíptica achatada sob cada uma, chão com grade fina + manchas procedural (seed fixa), flash
branco de 60ms no dano e screen shake de 3 a 14px. Mantenha a paleta do doc 01.
```

---

## 3.3 — Ordem de trabalho sugerida (sessão de várias mensagens)

| Mensagem | Conteúdo |
|---|---|
| 1 | Prompt principal (3.1) → ele faz o Marco 1 |
| 2 | "Siga para o Marco 2." |
| 3 | "Siga para o Marco 3." |
| 4 | Pedido de performance (3.2) se precisar |
| 5 | "Atualize o README e o docs/GDD.md com o que foi implementado." |

Não mande mais de um marco por mensagem: ele tende a simplificar o último pra "terminar".
