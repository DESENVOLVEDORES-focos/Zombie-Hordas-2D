# BANCO DE IDEIAS (backlog)

> Documento 6 de 6. Nada aqui entra no jogo agora. Cada bloco é uma ideia pronta pra você mandar
> depois, com **esforço** (E1 = 1 sessão, E2 = 2–3, E3 = grande) e **impacto** no "será que eu jogo
> outra vez". Regra: só pedir **uma família de ideias por vez**.

---

## A. Armas / estilos de build (impacto ALTO, esforço E1–E2)

Hoje existe 1 arma que muda de stat. Isso é o teto mais baixo do design — é o que mais rende melhorar.

| Ideia | Mecânica | E | Impacto |
|---|---|---|---|
| **Escolha de arma inicial** | Na tela de título: Pistola (equilibrada) / Escopeta (curto alcance, 5 pellets) / Rifle de precisão (perfura 3, cadência baixa) / Metralhadora (cadência alta, dano baixo, spread) | E1 | ⭐⭐⭐⭐⭐ |
| **Armas como drop raro** | Caixa a cada 8 ondas: troca a arma da run (one-way, você escolhe) | E2 | ⭐⭐⭐⭐ |
| **Mods de projétil** | Ímpar: ricochete / perfuração infinita com −50% dano / bala que explode / bala que gruda e queima | E2 | ⭐⭐⭐⭐ |
| **Build de corpo a corpo** | Machado girando ao redor (órbita), cadência em área, você precisa colar na horda | E2 | ⭐⭐⭐⭐ |

**Sugestão minha:** comece por *Escolha de arma inicial*. Custa pouco e dobra a rejogabilidade.

---

## B. Zumbis adicionais (impacto ALTO, esforço E1 cada)

| Nome | Silhueta | Comportamento que muda o jogo |
|---|---|---|
| **Saltador** | pernas dobradas, corpo baixo, se agacha antes de pular | pula 180px em arco, atravessa a linha de tiro |
| **Blindado** | placas de metal no peito (cinza), capacete | −60% dano de projétil na frente; tem que acertar pelas costas |
| **Aracnídeo** | 8 patas finas, corpo baixo | corre em zigue-zague rápido, difícil de acertar |
| **Necromante** | capuz, cajado, brilho roxo nas mãos | ressuscita zumbis mortos em raio 200 (prioridade máxima de alvo) |
| **Escavador** | só a cabeça pra fora do chão, poeira | anda **embaixo do chão** e emerge embaixo do jogador (telegraph 1s) |
| **Colosso (boss 2)** | 2× o brutamontes, correntes no braço | arremessa carros / escombros em linha reta |
| **Enxame** | nuvem de moscas/carne | 12 mini-zumbis com 3 HP, colisão de área |
| **Gêmeos (boss 3)** | um zumbi dividido em 2 metades ligadas por carne | divide em 2 ao morrer; cada metade tem que morrer junta |
| **Chuva ácida** | evento, não inimigo | poças verdes no chão durante 3s, obrigam a reposicionar |

**Sugestão minha:** *Necromante* e *Escavador* são os que mais mudam a leitura de tela. Blindado é o
mais fácil de implementar com grande efeito.

---

## C. Habilidades extras (impacto MÉDIO-ALTO, esforço E1–E2)

| Habilidade | Efeito | Tecla |
|---|---|---|
| **Torreta** | planta uma torreta por 15s que atira sozinha | 1 |
| **Campo de Gelo** | congela zumbis em raio 140 por 2s | 2 |
| **Chamado do Trovão** | 5 raios caem nos 5 zumbis mais próximos (dano alto) | 3 |
| **Míssil teleguiado** | 3 mísseis que explodem (dano em área) | 4 |
| **Bomba de fumaça** | zumbis perdem o alvo por 3s (você fica "invisível") | 5 |
| **Lança-chamas** | cone de 220px por 3s, dano contínuo + queimadura | 6 |
| **Ressurreição** | revive 1× com 50% de vida (passiva, não habilidade) | — |
| **Berserk** | −30% dano recebido e +20% dano por 5s | — |
| **Tempo bala** | 2s em câmera lenta (jogador normal, zumbis 35%) | Q |

**Regra de ouro:** no máximo **4 habilidades ativas** no HUD. Mais que isso ninguém usa. Adicionar
novas significa **substituir** as atuais, não empilhar.

---

## D. Modos de jogo (impacto ALTO, esforço E2–E3)

| Modo | Descrição |
|---|---|
| **Campanha curta** | 15 ondas com mapa fixo, 3 chefes na ordem, vitória real |
| **Arena com obstáculos** | carros, muros, cercas: cobertura importa, mude a IA de path |
| **Modo quieto** | 1 vida, sem cura, ponto; puro score |
| **Coop local** | 2 jogadores, mesmo teclado (WASD + setas) — cabe em 1 arquivo, é só duplicar o jogador |
| **Desafio diário** | mesma seed pra todos, 1 tentativa por dia, ranking |
| **Modo "sem melhorias"** | skills fixas, teste de puro skill (útil pra streamers) |

**Sugestão minha:** *Coop local* é a ideia com melhor relação diversão/esforço de todo este documento.

---

## E. Eventos e ritmo (impacto MÉDIO, esforço E1)

- **Noite caindo**: a cada 5 ondas, a luz escurece e você tem um círculo de visão ao redor → tensão nova.
- **Cerco**: onda em que todos os zumbis vêm de **um lado só** (seta no HUD).
- **Horda dourada**: 30s com 3× almas, mas 1,5× dano.
- **Apagão**: zumbis invisíveis fora do seu raio de luz por 6s.
- **Cura global**: a cada 10 ondas, um kit médico garantido no centro da arena (obriga a mover).
- **"Última bala"**: quando a vida está baixa, o próximo tiro é crítico garantido (feedback dramático).

---

## F. Meta e progressão (impacto ALTO no retorno, esforço E2)

- **Árvore de talentos** fora da loja: nós conectados (dano → perfuração → explosão), 3 ramos.
- **Desafios semanais**: "mate 3 brutamontes com granada" → recompensa em almas.
- **Personagens desbloqueáveis**: 3 sobreviventes com passivas diferentes (o detetive tem +crítico,
  a médica tem regen, o mecânico tem drones iniciais). Custo em almas.
- **Códices**: bestiário com contador de kills por tipo; preenche conforme joga. Custa pouco e dá
  sensação de progresso.
- **Fantasma/ranking local**: top 10 na tela de título com sua inicial.

---

## G. Apresentação (impacto ALTO, esforço E1)

- **Tela de título animada**: hordas de silhuetas cruzando o fundo, névoa, luz piscando.
- **Transições**: fade preto de 0,3s entre estados.
- **Hitstop** de 2 frames nos críticos (hoje só no boss).
- **Câmera com "peso"**: micro-lag de 0,08s no follow — parece cinema.
- **Anúncio de onda** com letras grandes entrando de baixo (tipo filme de terror).
- **Modo streamer**: HUD sem sons, sem nomes de arquivo, mudo automático.
- **Suporte a gamepad** (Gamepad API): analógico move, gatilho atira. Custo baixo, agrada muito.

---

## H. Qualidade de vida (impacto MÉDIO, esforço E1)

- **Build resumida** na tela de pausa (lista dos upgrades pegos).
- **Botão "continuar"** no save de run em andamento.
- **Acessibilidade**: opção de reduzir flash, aumentar contraste, remover screen shake, escala de UI 125%.
- **Resumo pós-run**: gráfico de vida ao longo do tempo (uma linha desenhada no canvas).
- **Tecla F3**: overlay de debug (FPS, entidades, grid) — já sugerido no doc técnico.

---

## I. Coisas que parecem boas mas eu NÃO recomendo ainda

| Ideia tentadora | Por quê não agora |
|---|---|
| Login + Supabase com ranking global | Quebra o "duplo-clique", adiciona backend e latência de rede por 1 feature. Faça local primeiro. |
| Mobile touch | Muda todo o controle e o balanceamento (dedo cobre tela). Precisa de joystick virtual dedicado. |
| Multiplayer online | Sincronização de horda é um projeto inteiro, não uma feature. |
| Arte gerada por IA (imagens) | Quebra a regra "zero assets" e o jogo fica irregular entre entidades. |
| 3D / pseudo-3D | Vira outro projeto. Topdown 90° é o charme. |
| Música licenciada | Direitos autorais + peso no repo. Áudio procedural resolve. |

---

## J. Ordem sugerida de evolução (roadmap de 6 mensagens)

| Sessão | Pedido | Por quê |
|---|---|---|
| 1 | A1 — 4 armas iniciais | dobra a rejogabilidade |
| 2 | B — +3 zumbis (Blindado, Necromante, Saltador) | muda a leitura de tela |
| 3 | D — Coop local | melhor diversão/esforço |
| 4 | E — eventos (noite, cerco, horda dourada) | varia o ritmo dentro da run |
| 5 | F — 3 personagens desbloqueáveis + bestiário | dá motivo pra voltar |
| 6 | G+H — gamepad, resumo pós-run, acessibilidade | deixa "de produto" |

---

## K. Se quiser vender/publicar depois

- **itch.io** aceita HTML5 zipado direto (o projeto já é isso). Taxa opcional.
- Página de jogo precisa: GIF de 10s com a tela cheia de zumbis, 3 screenshots, e a frase de 1 linha
  ("Sobreviva à horda. Não existe vitória — existe recorde.").
- Licença MIT no repo; crédito "arte e áudio 100% procedurais" é um diferencial bom de divulgação.
