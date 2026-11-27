# PROMPT PRONTO — cole isto no chat de IA

> Documento 4 de 6. Copie o bloco da **seção 4.1** inteiro para um novo chat do Arena em **modo agent**,
> de preferência **a partir deste repositório** (para a IA já enxergar `docs/`).
> A IA é instruída a ler os outros documentos sozinha — você não precisa colar mais nada.

---

## 4.1 Prompt principal (copie tudo dentro deste bloco)

```text
Você vai implementar o jogo "HORDAS", um jogo ORIGINAL de sobrevivência 2D contra hordas de zumbis,
em HTML5 + JavaScript + Canvas 2D puro, câmera TOP-DOWN 90° (visão totalmente de cima, sem rotação,
sem perspectiva). Antes de escrever código, leia os documentos do repositório, nesta ordem:
  docs/00-RESUMO-E-ESCOPO.md   (escopo fechado, decisões travadas, 3 marcos, regras de ouro)
  docs/01-GDD.md               (tom, câmera, sistemas, mapa TELHADOS, paleta, áudio, telas)
  docs/02-ESPECIFICACAO-TECNICA.md (arquitetura, FORMATO DE MAPA, loop, IA, grid, performance, checklists)
  docs/04-BALANCEAMENTO.md     (todos os números: zumbis, hordas, armas, custos, almas)
Eles são a fonte da verdade. Se algo estiver em aberto, escolha a opção mais simples que funcione e
registre em docs/DECISOES.md. NÃO me faça perguntas antes de começar. NÃO cole código no chat.

IDENTIDADE PRÓPRIA (obrigatório): o jogo é inspirado apenas no GÊNERO survival-horde topdown com economia
e defesas construídas. NÃO reproduza nomes, mapas, HUD, perks, textos, ícones ou curvas de jogos
existentes (incluindo o modo zumbis de Call of Duty). Use exclusivamente os nomes e números do doc 00 e
do doc 04 deste projeto. Arte e áudio são 100% procedurais: nenhuma imagem, fonte, CDN ou arquivo de som.

ENTREGAS — 3 marcos, nesta ordem, cada um jogável e cada um com seu commit.
  Commit 1: "feat: marco 1 - base e mapas"
  Commit 2: "feat: marco 2 - hordas economia e defesas"
  Commit 3: "feat: marco 3 - lobby meta e polimento"

MARCO 1 — Estrutura + SISTEMA DE MAPAS (prioridade nº 1 do projeto)
  - index.html (canvas fullscreen, fundo #1b1620) + game.js (IIFE) + maps.js (só dados).
  - Game loop com requestAnimationFrame e delta time clampado em 1/30 s.
  - Câmera topdown seguindo o jogador com amortecimento e look-ahead de 40px no retículo.
  - Jogador com 8 direções (velocidade diagonal normalizada), colisão AABB×círculo com deslize em parede.
  - MAPA TELHADOS COMPLETO conforme docs/01-GDD.md seção 6 e docs/02 seção 3: parapeito, casa de máquinas,
    ACs, caixa d'água, dutos, heliponto, 7 vagas de barricada, 4 de torreta, 5 placas de compra, 7 spawns.
    O mapa inteiro vive em maps.js como DADO (sem if de mapa no engine). Chão pré-renderizado 1× em canvas
    offscreen de 3200x3200.
  - LOBBY com 6 cards: TELHADOS jogável; METRÔ, HOSPITAL, ESCOLA, INSTALAÇÕES, ZONA URBANA com cadeado
    "EM BREVE". Clique/tecla seleciona, fade de carregamento, Esc volta ao lobby.
  - HUD mínimo (vida, moeda) e um zumbi de teste andando sem combate, só para validar o mapa.
  - Valide o checklist "MARCO 1" do doc 02 seção 12.

MARCO 2 — O jogo
  - Hordas por ABATE TOTAL (a horda acaba quando morre o último zumbi), contador "restam N",
    spawn em pulsos de 6 a 14 vindos de pontos longe do jogador, 6 s de trégua com resumo entre hordas,
    2,5 s de preparação no início. Faixas de dificuldade e totais exatamente como o doc 04.
  - 7 tipos de zumbi com comportamento próprio: caminhante, frenético, rastejante, tanque, cuspidor,
    explosivo, espreitador (especiais entram a partir da horda 31). IA por máquina de estados com
    thinkTimer de 0,15 s; A* só quando preso. Zumbi ataca barricada e torreta no caminho.
  - Moedas por abate + bônus de horda limpa.
  - 5 pontos de compra na parede: arma, munição, melhoria (barra de 0,8 s segurando E).
  - 7 armas com dano, cadência, pente, recarga, alcance, dispersão e preço (doc 04); 2 slots (Q troca);
    munição esgota e você volta à pistola (que tem reserva infinita); R recarrega com penalidade de velocidade.
  - Barricadas nas 7 vagas: custo progressivo, 600 HP, zumbi bate e quebra, reparo com E, animação de
    tábuas quebrando, rastejante/frenético passam 3× mais rápido.
  - Torretas nas 4 vagas: alcance 340 px, 12 dano/s, 400 HP, 240 tiros, recarga por 150 moedas.
  - Perks por XP: carta única que NÃO pausa o jogo, escolhida com 1/2/3 em 6 s, máx 3 slots.
  - HUD completo (vida, moeda, arma/munição, XP, horda/restam, cronômetro), game over com resumo.
  - Sangue no chão em canvas separado com fade, partículas em pool, screen shake e números de dano.
  - Valide o checklist "MARCO 2" do doc 02 seção 12.

MARCO 3 — Lobby, meta e polimento
  - Almas por regra do doc 04, persistidas em localStorage (chaves e formato do doc 02 seção 9).
  - LOJA com 6 melhorias permanentes (custo crescente, máx por nível, efeito real no jogo).
  - RECORDES (horda, tempo, abates) + top 10; tela de GAME OVER com destaque de recorde novo.
  - Telas TÍTULO/LOBBY, CONFIG (volume, auto-fire, shake, lowFx, streamer, apagar progresso com
    confirmação), COMO JOGAR, PAUSA, GAME OVER — todas navegáveis 100% por teclado.
  - Áudio procedural completo conforme doc 01 seção 8, com limite de 12 vozes e desbloqueio no primeiro gesto.
  - Performance: chão pré-renderizado, sprites em offscreen, grid de 80 px, pools de partículas/textos,
    remoção por swap-pop, IA com thinkTimer. Meta: 150 zumbis + 4 torretas a 58+ FPS; stress 300.
  - Oclusão suave de parede alta, vinheta quando vida < 30%, pausa automática em document.hidden.
  - Escreva docs/MAPAS.md (passo a passo para criar um mapa novo, com exemplo completo copiável) e
    atualize README.md e docs/GDD.md com o que existe de fato.
  - Valide o checklist "MARCO 3" do doc 02 seção 12.

REGRAS TÉCNICAS OBRIGATÓRIAS
  - Zero dependências; roda em file:// (sem fetch, sem ES modules, sem imagem/áudio externos).
  - Todo o estado da partida serializável; players[] em array (prontidão multiplayer) — nunca G.player.
  - Nada de O(n²): grid espacial para zumbi↔zumbi, tiro↔zumbi, torreta↔zumbi.
  - Nunca desenhar caminho geométrico pesado por entidade; sprites pré-renderizados.
  - Ordem de update fixa do doc 02 seção 2. Delta time em tudo. Sem velocidade por frame.
  - Paleta exata do doc 01 seção 7. Interface e comentários em pt-BR; identificadores em inglês.
  - Sem erro no console. Sem travamento ao redimensionar. Sem NaN depois da horda 40.

AO FINAL DE CADA MARCO: percorra o checklist correspondente e relate em até 6 linhas o que passou,
o que não passou e como rodar o jogo. Não cole código no chat. Comece pelo MARCO 1 agora.
```

---

## 4.2 Mensagens de acompanhamento

**Se parar no meio do Marco 1:**
```text
Continue o MARCO 1 de onde parou. Antes de seguir, confirme no checklist do doc 02 seção 12 que o lobby
abre, TELHADOS carrega, você anda o mapa inteiro sem atravessar parede e o Esc volta ao lobby.
```

**Se a performance cair:**
```text
Performance baixa. Aplique nesta ordem e me diga o FPS antes/depois: (1) chão do mapa em canvas
offscreen, (2) sprites de entidade pré-renderizados (4 direções × frames, sem ctx.rotate no frame),
(3) IA com thinkTimer de 0,15 s, (4) remoção por swap-pop, (5) pool fixo de partículas. Mostre o FPS com F3.
```

**Se o mapa ficar feio/sem leitura:**
```text
Revise só a camada visual do mapa TELHADOS sem mexer em regra: contorno 2px em tudo, sombra chapada
deslocada 6px, chão com emendas de manta e poças, parapeito com topo claro (#a89c8c), silhuetas de
prédios queimando fora do mapa, e ícones pintados nas vagas (martelo = barricada, cano = torreta).
Mantenha a paleta do doc 01 seção 7.
```

**Se a dificuldade ficar injusta:**
```text
Rebalanceie só com a planilha do doc 04: garanta hordas 1–10 com pouca pressão (o jogador deve chegar à
horda 11 com ≥800 moedas), 11–20 com mais quantidade e não mais dano, e especiais só a partir da 31.
Não mexa em custo de arma nem em HP de barricada sem antes atualizar o doc 04.
```

**Para adicionar o mapa 2 depois:**
```text
Adicione o mapa METRÔ como novo bloco em maps.js seguindo docs/MAPAS.md, com paleta própria, 8 vagas de
barricada, 5 de torreta, 6 placas e 7 spawns. Não altere nenhum arquivo do engine. Depois atualize a
grade do lobby para desbloqueá-lo.
```

---

## 4.3 Ordem de trabalho

| Mensagem | Conteúdo |
|---|---|
| 1 | Prompt da 4.1 → Marco 1 |
| 2 | "Siga para o MARCO 2." |
| 3 | "Siga para o MARCO 3." |
| 4 | Uma das mensagens da 4.2, se precisar |
| 5 | "Rode os checklists do doc 02 seção 12 inteiros e corrija o que falhar." |

**Uma coisa por mensagem.** Se pedir dois marcos juntos, a IA simplifica o segundo.
