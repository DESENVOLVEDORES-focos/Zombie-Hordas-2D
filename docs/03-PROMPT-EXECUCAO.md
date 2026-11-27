# PROMPT DE EXECUÇÃO — cole isto no chat de IA

> Documento 4 de 6. Copie o bloco da **seção 4.1** inteiro para um chat novo no Arena **modo agent**,
> aberto **a partir deste repositório**. O agente lê o resto sozinho.

---

## 4.1 Prompt principal

```text
Você vai executar a construção do jogo "HORDAS", um jogo 2D TOP-DOWN (90°, visão de cima) de
sobrevivência contra hordas de zumbis, com economia de moedas, armas compráveis, barricadas, torretas
e progressão de dificuldade. Você é o EXECUTOR. O dono do projeto é o comandante.

ANTES DE ESCREVER CÓDIGO, leia nesta ordem e trate como contrato:
  docs/01-ESPECIFICACAO-ORIGINAL.md  → a base do projeto (texto do dono). Não contradiga.
  docs/00-ORDEM-DE-COMANDO.md        → escopo travado, decisões, 5 marcos e critérios de aceite
  docs/02-ARQUITETURA.md             → arquivos, namespaces, loop, pathfinding, colisão, render, áudio
  docs/04-BALANCEAMENTO.md           → todos os números (armas, zumbis, hordas, custos)
  docs/05-MAPAS-E-BACKLOG.md         → como criar mapa e o que fica fora desta entrega

DECISÕES JÁ TOMADAS (não perguntar, não reabrir):
  - HTML5 + JavaScript + Canvas 2D puro. ZERO dependências, ZERO assets (arte e áudio procedurais).
  - Scripts clássicos (`<script src>`), NÃO ES modules (precisa rodar em file:// por duplo-clique).
  - Modular de verdade: um arquivo por sistema, conforme docs/02-ARQUITETURA.md seção 2. Nada de monólito.
  - Todos os números em `js/config.js`. Nenhum número mágico no resto do código.
  - Identidade própria: nenhum nome, mapa, ícone, som ou mecânica copiada de franquia existente.
  - Multiplayer NÃO será implementado. Mas `Game.run.players` é array e o estado é serializável desde já.
  - 4 mapas jogáveis: TELHADOS, METRÔ, HOSPITAL, ESCOLA (dados em js/maps.js).
  - Arte: topdown 90° cartoon sombrio; contorno 2px, sombra chapada, sangue vivo e legível.

EXECUTE OS MARCOS NA ORDEM. Cada marco: implementar → testar → relatar → commit. Não pule teste.

MARCO 1 — Base jogável (Telhados)
  config, utils, canvas, input, sprites, maps(telhados), map-loader, entities, player, weapons,
  combat, render, main, hud mínimo.
  Entrega: andar em 8 direções com colisão AABB×círculo (deslizando em parede), mira no mouse, tiro,
  recarga (R), troca de slot (1/2), zumbi comum perseguindo com colisão, dano, morte com sangue,
  HUD (vida, moedas, arma, munição, recarga), pausa com Esc, game over com R para reiniciar.
  Critério: 30 s andando sem atravessar parede; 10 abates seguidos; console limpo.

MARCO 2 — Hordas, IA e pathfinding
  navigation (flow field), zombies (6 tipos), hordes.
  Entrega: flow field em grade de 50 px recalculado quando o jogador muda de célula e quando uma
  barricada muda de estado; hordas por ABATE TOTAL com contador "RESTAM N", anúncio de horda, trégua de
  6 s; escalonamento conforme docs/04; os 6 tipos com comportamento próprio (frenético em arrancada,
  explosivo com dano em área, cuspidor que mantém distância, tanque resistente que empurra, rastejante
  baixo que atravessa barricada devagar).
  Critério: nenhum zumbi atravessa parede; nenhum fica preso mais de 2 s; 15 hordas sem erro.

MARCO 3 — Economia, barricadas, torretas e armas completas
  economy, barricades, turrets, weapons completo.
  Entrega: moedas por abate (tabela), pontos de compra no mapa (arma/munição/melhoria) com barra de
  0,8 s segurando E; barricadas em vagas no chão com custo progressivo 50/80/90/100/110/120, 600 HP,
  3 estágios visuais, destruição e reparo pago; torretas com custo 400/550/700/850, alcance 340 px,
  rotação, cadência 5/s, 240 tiros, recarga paga, 400 HP, destruíveis; 6 armas com comportamento
  realmente diferente + 3 melhorias por arma.
  Critério: compra negada sem dinheiro em 100% dos casos com aviso; barricada quebrada por 2 zumbis em
  ~10 s; torreta não atira fora do alcance nem através de parede.

MARCO 4 — Lobby, telas, áudio e configurações
  screens, audio, save, hud completo.
  Entrega: TÍTULO → LOBBY (jogar, criar partida, entrar em partida com aviso de "etapa futura",
  selecionar mapa, configurações, sair) → SELEÇÃO com miniaturas/descrição/ambiente dos 4 mapas →
  PARTIDA → GAME OVER → LOBBY. Config funcional: volume geral/música/efeitos, resolução, tela cheia,
  sensibilidade da mira, mudo. Áudio procedural completo. Recordes em localStorage.
  Critério: nenhum botão sem ação; configuração tem efeito imediato; recarregar mantém tudo.

MARCO 5 — Mapas 2, 3 e 4
  Metrô, Hospital e Escola: cada um é um bloco novo em js/maps.js. Zero mudança de engine.
  Critério: 4 mapas jogáveis e distintos; criar um 5º mapa em < 30 min seguindo docs/05.

REGRAS INVIOLÁVEIS
  1. Nenhum botão, painel ou efeito decorativo. Se está na tela, funciona.
  2. Zumbi não atravessa parede nem obstáculo sólido.
  3. Torreta respeita alcance e linha de visão.
  4. Compra sem moeda é sempre negada, com aviso.
  5. Curva suave: nada de esponja de balas.
  6. Custos de barricada e torreta sempre progressivos.
  7. Um sistema por arquivo; arquivo acima de ~450 linhas deve ser dividido.
  8. Teste cada marco antes de avançar (use tools/sim.js ou modo ?autotest).
  9. Sem colar código no chat. Relate no formato do doc 00, seção 5.
 10. pt-BR na interface e nos comentários; identificadores em inglês.

COMECE PELO MARCO 1 AGORA. Não faça perguntas: o que estava em aberto já foi decidido nos docs.
```

---

## 4.2 Mensagens de acompanhamento

**Avançar de marco**
```text
Marco concluído. Siga para o MARCO N. Rode o teste antes de relatar.
```

**Se zumbi travar em parede**
```text
Há zumbi preso em geometria. Corrija assim, nesta ordem: (1) flow field deve ser recalculado quando o
jogador muda de célula, quando barricada muda de estado e a cada 0,5 s; (2) se a célula do zumbi estiver
bloqueada, empurre-o para a célula livre mais próxima; (3) se ficar 2 s sem andar, o zumbi ataca a
estrutura/entra em desvio aleatório por 0,6 s. Depois me diga quantos zumbis ficaram presos em 5 min de
teste (deve ser zero).
```

**Se o desempenho cair**
```text
Performance baixa. Aplique nesta ordem e informe FPS antes/depois com F3: (1) chão do mapa em canvas
offscreen; (2) sprites de entidade pré-renderizados (4 direções × frames, sem ctx.rotate no frame);
(3) IA com thinkTimer de 0,15 s; (4) remoção por swap-pop; (5) pool fixo de partículas; (6) grid espacial
para colisão. Meta: 150 zumbis ≥ 58 FPS.
```

**Se a dificuldade estiver errada**
```text
Rebalanceie SÓ com docs/04: o jogador deve chegar à horda 11 com 800–1.200 moedas e morrer entre 15 e
25 min numa partida casual. Não aumente vida de zumbi para "dar dificuldade": aumente quantidade e
variedade. Atualize docs/04 se mudar algum número.
```

**Se aparecer botão sem função**
```text
Regra §20.2 da especificação: nenhum botão sem ação. Liste todos os botões de todas as telas, diga qual
função cada um chama e remova (ou implemente) qualquer um que não tenha efeito real.
```

**Para criar um mapa novo depois**
```text
Crie o mapa <NOME> como um bloco novo em js/maps.js seguindo docs/05-MAPAS-E-BACKLOG.md: paleta própria,
12–18 paredes, 8 obstáculos, 8 vagas de barricada, 5 de torreta, 6 placas de compra, 8 spawns, 1–2 zonas
de risco. Não altere nenhum outro arquivo. Depois adicione o card no lobby e teste as colisões.
```

---

## 4.3 Ritmo de trabalho

| Mensagem | O que mandar |
|---|---|
| 1 | Prompt da 4.1 (Marcos 1–5 definidos nele) |
| 2 | "Siga para o MARCO 2." |
| 3 | "Siga para o MARCO 3." |
| 4 | "Siga para o MARCO 4." |
| 5 | "Siga para o MARCO 5." |
| 6 | "Rode os critérios de aceite dos 5 marcos e corrija o que falhar." |

**Um marco por mensagem.** Se mandar dois, o segundo sai simplificado.
