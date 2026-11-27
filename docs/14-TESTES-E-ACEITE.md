# TESTES E ACEITE — como provar que está pronto

> Documento 14 de 16. Arquivos: `tools/sim.js`, modo `?autotest`, checklist de aceite por marco.
> Regra §20.13 da especificação: **testar cada sistema antes de passar para a próxima etapa.**
> Quem só "olha a tela" não testa: precisa de número.

---

## 1. Dois níveis de teste

| Nível | O que é | Quando usar |
|---|---|---|
| **Manual** | o dono abre o jogo e joga 5 min | sempre, ao final do marco |
| **Automático** | `tools/sim.js` roda o jogo sem navegador e reporta números | antes de cada entrega de marco |

O automático não substitui o manual. Ele existe para pegar o que o olho não vê: zumbi preso, moeda
negativa, horda que não termina, `NaN` de posição.

---

## 2. `tools/sim.js` — especificação

Fica **fora** do jogo (não é carregado pelo `index.html`). Roda em Node com um canvas falso.

### 2.1 Setup
```
- criar `window` falso com: requestAnimationFrame no-op, localStorage em memória,
  document.createElement('canvas') → canvas real (node-canvas ou @napi-rs/canvas)
- carregar na ordem: config, utils, save, audio(stub), input, canvas(stub),
  sprites, maps, map-loader, navigation, entities, weapons, combat, player,
  zombies, hordes, economy, barricades, turrets, hud, render, screens, main
- iniciar partida: Game.start('telhados')
```

### 2.2 Roteiro (script de input sintético)
```
loop de 60 FPS por até 20 minutos de jogo:
  - andar em círculo (raios variados)
  - atirar sempre no zumbi mais próximo
  - recarregar quando o pente zerar
  - comprar a placa mais próxima quando tiver dinheiro (E por 1 s)
  - construir barricada quando moeda > 300 e houver vaga a < 100 px
  - construir torreta quando moeda > 900
  - escolher perk quando aparecer
  - se HP < 30: correr para longe do centro de massa dos zumbis

a cada 5 s de simulação, coletar amostra:
  { t, horde, remaining, zombiesVivos, hp, coins, kills, fpsEstimado, barricadas, torretas }
```

### 2.3 Invariantes que **devem** falhar o teste (asserts)
| Invariante | Verificação |
|---|---|
| Zumbi em parede | nenhum zumbi com `hitsWall(x,y,hitbox)` verdadeiro por 2 frames seguidos |
| Zumbi preso | nenhum zumbi com deslocamento < 2 px por mais de 2 s (exceto `attack`) |
| Moeda negativa | `player.coins >= 0` em toda amostra |
| Restantes negativo | `remaining >= 0` em toda amostra |
| Horda infinita | cada horda termina em ≤ 240 s |
| NaN | nenhuma posição/vida/projétil com `NaN` |
| Compra fantasma | soma de compras ≤ moedas ganhas + iniciais |
| Torreta ilegal | nenhum tiro de torreta com distância > `range + 5` |
| Projétil atravessa parede | nenhum projétil termina com vida > 0 dentro de sólido |
| Array crescendo | `zombies.length`, `bullets.length`, `parts.length` sempre ≤ caps |

### 2.4 Métricas que devem ser impressas
```
tempo até horda 10 / 20 / 30
moedas ao fim de cada 10 hordas
abates por minuto
zumbis simultâneos (máximo)
média e pior FPS estimado
nº de barricadas construídas / quebradas
nº de torretas construídas / destruídas
perks escolhidos
tempo total até morrer
```

### 2.5 Saída esperada (exemplo saudável)
```
horda 10 em 06:40 · moedas 1.040 · 21 abates/min · pico 17 zumbis
horda 20 em 15:10 · moedas 2.890 · pico 29 zumbis · 2 barricadas (1 quebrada)
horda 30 em 26:20 · moedas 5.420 · pico 41 zumbis · 1 torreta
morte na horda 31 · 812 abates · 0 erros · fps mín 58
```

### 2.6 Modo fallback (se não houver Node/navegador)
Implementar `?autotest` no próprio jogo: roda o mesmo roteiro em tempo acelerado (dt fixo de 1/60,
10× por frame), desenha as métricas num painel e escreve no console. É pior, mas cobre o essencial.

---

## 3. Testes manuais por sistema (roteiro do dono)

### 3.1 Movimento e colisão (3 min)
1. Andar nas 8 direções: a velocidade na diagonal é igual à reta?
2. Correr contra a parede em ângulo: desliza ou vibra?
3. Entrar na casa de máquinas e sair pelas duas portas.

### 3.2 Combate (3 min)
1. Matar 3 zumbis com cada arma (usar `?debug=weapons` para pegar todas).
2. Verificar: calibre 12 mata de perto e falha longe; brasa atravessa 2 zumbis.
3. Mirar para trás enquanto anda: o personagem atira para trás?

### 3.3 Hordas (5 min)
1. Deixar 1 zumbi vivo no canto: a horda não termina (correto).
2. Matar o último: aparece `HORDA LIMPA` e o banner da próxima.
3. Verificar o tipo novo na horda certa (11/15/20/21).

### 3.4 Economia (3 min)
1. Tentar comprar sem dinheiro: nenhuma moeda sai.
2. Comprar arma: aparece no slot, munição correta.
3. Comprar munição: reserva aumenta exatamente 4 pentes.

### 3.5 Defesas (5 min)
1. Construir barricada em vaga: preço seguinte sobe.
2. Deixar zumbis baterem: ver rachar e quebrar; depois recriar e ver o preço cair.
3. Construir torreta e sair de perto: ela atira só no alcance.
4. Colocar-se entre a torreta e o zumbi: ela **não** atira em você (obviamente), mas verificar que não
   atira através da parede quando o zumbi está atrás dela.

### 3.6 Telas (3 min)
1. Clicar em **todos** os botões de todas as telas (um por um).
2. Mudar cada configuração e sentir o efeito (o mais fácil de esquecer: sensibilidade da mira).
3. F5: configurações e recordes continuam.

---

## 4. Checklists de aceite por marco (copiar e marcar)

### MARCO 1 — base jogável
- [ ] Abre por duplo clique, console sem erro
- [ ] Anda em 8 direções, diagonal correta
- [ ] Colide e desliza em parede/obstáculo
- [ ] Mira e atira em qualquer direção
- [ ] `R` recarrega; recarregar deixa lento
- [ ] Pistola com reserva infinita
- [ ] Zumbi comum persegue, colide e dá dano
- [ ] Morte e reinício com `R`
- [ ] HUD: vida, moeda, arma, munição, recarga
- [ ] Esc pausa e retoma sem salto de tempo

### MARCO 2 — hordas e IA
- [ ] 6 tipos implementados e distinguíveis
- [ ] Horda por abate total com `RESTAM N`
- [ ] Trégua 6 s e banner de horda
- [ ] Liberação dos tipos nas hordas 11/15/20/21
- [ ] Nenhum zumbi em parede em 10 min de sim
- [ ] Nenhum zumbi preso > 2 s
- [ ] Frenético com windup visível
- [ ] Explosivo com telegraph e dano em área
- [ ] Cuspidor mantém distância e não atira por parede
- [ ] Tanque empurra o jogador
- [ ] Rastejante atravessa barricada devagar

### MARCO 3 — economia, defesas, armas
- [ ] 6 armas com comportamento distinto
- [ ] Compra de arma/munição/melhoria na parede
- [ ] Barra de compra de 0,8 s e cancelamento
- [ ] Barricada com HP, 3 estágios, quebra e reparo
- [ ] Custo progressivo de barricada (50→120)
- [ ] Torreta gira, atira, gasta munição, recarrega, é destruída
- [ ] Custo progressivo de torreta (400→850)
- [ ] Torreta nunca atira fora do alcance/parede
- [ ] Compra sem dinheiro negada em 100% dos casos

### MARCO 4 — telas, áudio, configs
- [ ] Título, lobby, seleção de mapa, criação, pausa, game over
- [ ] Nenhum botão sem ação
- [ ] 4 mapas na seleção com miniatura, descrição e ambiente
- [ ] Configs: 3 volumes, resolução, tela cheia, sensibilidade, auto-fire, shake, lowFx, streamer
- [ ] Configs aplicam na hora e persistem
- [ ] 18 sons implementados
- [ ] Recordes salvos e top 10
- [ ] Almas ganhas e loja funcionando

### MARCO 5 — os 4 mapas
- [ ] Telhados, Metrô, Hospital, Escola jogáveis
- [ ] Cada um com 8 vagas de barricada, 5 de torreta, 6 placas, 8 spawns
- [ ] Validação automática de mapa passa em todos
- [ ] Miniaturas no lobby batem com o layout real
- [ ] Criar um 5º mapa em < 30 min seguindo `docs/05`

---

## 5. Critérios de "não aceito" (devolver ao executor)

| Sintoma | Por que não aceito |
|---|---|
| "Funciona, mas o botão X ainda não faz nada" | viola §20.2 |
| "A torreta às vezes atira longe" | viola §20.5 |
| "Dá pra comprar com 0 moedas se clicar rápido" | viola §20.6 |
| "O zumbi atravessou a parede uma vez" | viola §20.4 |
| "O FPS cai para 40 com 80 zumbis" | viola §18 |
| "Está tudo em um arquivo só" | viola §20.10 |
| "Testei olhando a tela" | viola §20.13 |
| "Não deu tempo de testar o marco anterior" | viola §20.14 |

---

## 6. Relatório de marco (formato obrigatório)

```
MARCO 3 — economia, defesas e armas
Passou: 9/9 do checklist (anexar sim.log com as métricas)
Falhou/ajustado: torreta atirava antes de girar → corrigido com tolerância de 0,12 rad
Números do sim: horda 10 em 06:40 · 1.040 moedas · pico 17 zumbis · 0 erros
Como rodar: abrir index.html
Próximo: MARCO 4
```
