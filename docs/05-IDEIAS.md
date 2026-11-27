# BANCO DE IDEIAS (backlog)

> Documento 6 de 6. **Nada aqui entra no jogo agora.** É a fila do que pedir depois, com esforço
> (E1 = 1 sessão, E2 = 2–3, E3 = grande) e impacto. Regra: **uma família por vez**.

---

## 0. Antes de qualquer ideia nova

Ordem de prioridade absoluta: **terminar os 3 marcos do doc 00**. Um jogo com 1 mapa polido vale mais que
5 mapas pela metade. Só abra este documento quando o checklist do doc 02 seção 12 estiver 100%.

---

## A. Mapas 2 a 6 (E2 cada) — a prioridade natural

O engine já nasce pronto para isso (`maps.js`). Cada mapa precisa de: paleta própria, 2–3 obstáculos
característicos, 7–8 vagas de barricada, 4–5 de torreta, 5–6 placas, 7–9 spawns, 1–2 zonas de risco.

| Mapa | Identidade | Gancho de gameplay | Paleta |
|---|---|---|---|
| **Metrô** | estação subterrânea, vagão parado, catracas, plataforma | corredores longos: horda vem em fila, torreta brilha; vagão é sala de morte | verde-fantasma + azulejo |
| **Hospital** | corredores, recepção, macas, luz de emergência | portas que fecham e abrem, sala sem saída; cuspidor domina | branco-azulado + vermelho |
| **Escola** | salas de aula, quadra, corredores, armários | quadra aberta (caos) vs. corredores (funil) | vinho + madeira |
| **Instalações** | galpão industrial, esteiras, tanques, passarelas | barricadas valem dobro, espaço apertado | ferrugem + amarelo |
| **Zona Urbana** | rua, ônibus, carros, becos, tapumes | mapa maior, más rotas, deslocamento é o desafio | asfalto + neon |
| Telhados **Noite** | variação do mapa 1 com chuva | visa reduzir campo, som de chuva, poças | azul-escuro |

**Sugestão:** Metrô primeiro — é o que mais muda a leitura de tela em relação a Telhados.

---

## B. Estruturas defensivas extras (E1–E2)

| Ideia | Efeito | Custo sugerido |
|---|---|---|
| **Arame farpado** | dano 8/s a quem passa, 200 HP, não bloqueia | 120 |
| **Barricada reforçada** | 1.200 HP, ocupa 2 vagas | 220 |
| **Armadilha de espinhos** | dano em área ao ser pisada, 1 uso | 90 |
| **Holofote** | ilumina zona e +10% dano do jogador ali | 300 |
| **Portão elétrico** | dano 25/s em corredor, 20 s de carga | 500 |
| **Sino de aviso** | toca quando zumbi passa (aviso de flanco) | 100 |

**Cuidado:** cada estrutura nova precisa de vaga no mapa. Prefira **transformar** vaga existente
(`barricadeSlots` com `allowed:['wood','wire']`) em vez de espalhar vagas.

---

## C. Zumbis e chefes (E1 cada / E3 o chefe)

| Nome | Comportamento que muda o jogo |
|---|---|
| **Blindado** | −70% dano de frente; tem que flanquear ou usar perfuração |
| **Necromante** | ressuscita zumbis mortos em raio 200; prioridade de alvo máxima |
| **Escavador** | anda sob o chão e emerge sob o jogador (telegraph de 1 s) |
| **Gritador** | buffa +25% velocidade de quem está perto (suporte) |
| **Chefe "Aberraça"** (horda 50) | 3 cabeças, 3 ataques (pisotear, investida, invocar), barra de vida no topo |
| **Chefe "Coro"** (horda 80) | 4 gritadores fundidos; precisa destruir 4 pontos fracos |
| **Chefe final "Maré"** (horda 100) | ocupa metade do mapa, obriga barricadas em massa |

Chefes **não** são necessários para o gênero, mas resolvem o "a horda 60 já não tem novidade".

---

## D. Armas e progressão (E1–E2)

- **Caixa Cega** (E2): pagar 950 por uma arma aleatória das 7. Uma por mapa. Puro vício.
- **Arma de parede "coringa"** (E1): placa que troca de arma a cada horda.
- **Melhorias de arma nível 2** (E1): após comprar as três melhorias, liberar "Pacote" (+perfuração ou
  balas explosivas).
- **Arma corpo a corpo** (E2): facão com golpe em arco, sem munição, bom pra emergência.
- **Foguete teleguiado** (E2): arma 8, mira sozinha, 1 por horda.

---

## E. Modos e sistemas (E2–E3)

| Modo | Descrição | E |
|---|---|---|
| **Coop local** | 2 jogadores no mesmo teclado (WASD + setas), moeda compartilhada, 2 downs | E2 |
| **Multiplayer online** | host autoritativo + WebRTC/socket; estado já serializável | E3 |
| **Horda infinita** | sem fim, dificuldade capada, foco em score | E1 |
| **Modo caos** | hordas já começam na 25, sem trégua longa | E1 |
| **Desafio diário** | seed fixa, 1 tentativa, ranking local | E2 |
| **Modo construtor** | moedas infinitas, só testar defesas (ótimo pra debug) | E1 |

---

## F. Meta-progressão e apresentação (E1–E2)

- **Hub andável** (E2): bunker topdown onde você anda até a armaria, a bancada de barricada e o quadro
  de mapas. Substitui o menu, não o jogo.
- **Bestiário** (E1): contador de abates por tipo, desenho do zumbi, dica de combate.
- **Medalhas** (E1): "horda 20 sem barricada", "100 abates com lançador" etc. → almas.
- **Resumo pós-run com gráfico** (E1): linha de vida ao longo do tempo, desenhada no canvas.
- **Modo streamer** (E1): sem som, HUD limpo, sem nomes de arquivo.
- **Gamepad** (E2): Gamepad API — analógico move, gatilho atira.
- **Acessibilidade** (E1): reduzir flash, alto contraste, escala de HUD 125%, remover shake.

---

## G. Não recomendo agora

| Ideia tentadora | Por quê não |
|---|---|
| Login + ranking em nuvem | quebra o duplo-clique e adiciona latência por 1 feature; faça local |
| Mobile touch | muda controle e balanceamento inteiros; precisa de joystick virtual dedicado |
| Sprites gerados por IA | quebra a regra "zero assets" e a consistência visual |
| 3D / isométrico | é outro jogo; o topdown 90° é a identidade |
| Copiar perks/mapas de referência | risco legal e mata a originalidade (doc 00 seção 8) |
| Editor visual de mapa | o `maps.js` já é o editor; só vale com 10+ mapas |

---

## H. Roadmap sugerido de 6 sessões

| Sessão | Pedido | Por quê |
|---|---|---|
| 1 | Mapa **Metrô** + desbloqueio no lobby | valida o sistema de mapas (o teste real do M1) |
| 2 | **Arame farpado** + **Blindado** | 1 defesa + 1 zumbi que muda a mira |
| 3 | **Coop local** | melhor diversão por esforço de todo o backlog |
| 4 | **Caixa Cega** + **Necromante** | vício + ameaça nova |
| 5 | **Chefe Aberraça** na horda 50 + bestiário | dá um "marco" para a run longa |
| 6 | **Hub andável** + gamepad + acessibilidade | deixa com cara de produto |

---

## I. Se for publicar

- **itch.io** aceita HTML5 zipado direto (o projeto já é isso).
- Página precisa: GIF de 10 s com a tela cheia de zumbis e uma barricada quebrando, 3 prints, e a frase
  de uma linha: **"Segure o telhado. Cada horda cobra mais caro que a anterior."**
- Licença MIT; "arte e áudio 100% procedurais" é um diferencial bom de divulgação.
- Não use nome, logo ou arte que remeta a franquias existentes — a identidade própria é regra do projeto.
