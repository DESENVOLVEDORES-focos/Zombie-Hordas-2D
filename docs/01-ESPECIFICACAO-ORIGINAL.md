# ESPECIFICAÇÃO ORIGINAL (base do projeto — não editar)

> Documento 1 de 6. Este é o **texto do dono do projeto**, reproduzido integralmente. É a base do jogo.
> Todos os outros documentos são ordens de execução **derivadas** dele — se algo aqui conflitar com
> qualquer coisa em outro arquivo, **este documento ganha** (exceto números de balanceamento, que vivem
> no doc 05 e podem ser ajustados).

---

PROJETO COMPLETO — JOGO 2D TOP-DOWN DE SOBREVIVÊNCIA CONTRA ZUMBIS

1. INSTRUÇÃO PRINCIPAL

Quero que você desenvolva um jogo completo de sobrevivência contra hordas de zumbis, em 2D, utilizando
perspectiva Top-Down (visão diretamente de cima, em um ângulo de 90 graus).

O jogo deverá ser focado em sobrevivência, combate, progressão de dificuldade, evolução de armas,
construção de defesas e gerenciamento de recursos.

A proposta é criar uma experiência na qual o jogador entra em um mapa, enfrenta ondas progressivas de
zumbis, ganha dinheiro eliminando inimigos, compra equipamentos, constrói barricadas, instala torretas e
tenta sobreviver ao maior número possível de hordas.

O jogo poderá ter algumas inspirações em jogos conhecidos de sobrevivência contra zumbis, incluindo o
modo Zombies de Call of Duty, mas NÃO deverá ser uma cópia integral de nenhum deles.

Utilize essas referências apenas como inspiração geral de gênero. Desenvolva uma identidade própria, com
mecânicas, interface, mapas, personagens, sistemas e progressão independentes.

**Não complique desnecessariamente o projeto.** O objetivo é criar um jogo divertido, funcional, bem
organizado e expansível, com sistemas que realmente funcionem dentro da partida.

Não quero apenas uma demonstração visual ou uma tela com elementos decorativos. Quero um jogo jogável,
com mecânicas implementadas, sistemas conectados e funcionalidades reais.

2. VISÃO GERAL DO GAMEPLAY

O funcionamento principal da partida deverá seguir este ciclo:

1. O jogador entra no lobby.
2. Escolhe um mapa.
3. Cria ou entra em uma partida.
4. A partida começa.
5. O jogador aparece no cenário com uma pistola inicial.
6. Os zumbis começam a aparecer.
7. O jogador elimina os inimigos e recebe moedas.
8. Com as moedas, compra armas e melhorias.
9. Constrói barricadas para bloquear passagens.
10. Instala torretas para ajudar no combate.
11. As hordas ficam gradualmente mais difíceis.
12. Novos tipos de zumbis aparecem.
13. O jogador tenta sobreviver o máximo possível.

O sistema deverá funcionar de maneira contínua, permitindo que o jogador desenvolva estratégias
diferentes a cada partida.

3. CÂMERA E ESTRUTURA VISUAL

O jogo deverá ser inteiramente em 2D.

Perspectiva
Utilizar câmera Top-Down com visão diretamente de cima, em 90 graus.
Isso significa que o jogador deverá visualizar: o personagem visto de cima; os zumbis vistos de cima; as
construções e objetos do cenário; as barricadas; as torretas; as paredes e obstáculos; os elementos do
ambiente. Não utilizar câmera lateral, perspectiva isométrica ou câmera em terceira pessoa.

Movimentação
O personagem deverá possuir movimentação em todas as direções: cima, baixo, esquerda, direita e
diagonais. A movimentação deverá ser fluida e responsiva. A câmera deverá acompanhar o jogador,
mantendo-o dentro da área visível.

Sistema de mira
O personagem deverá conseguir mirar e disparar em qualquer direção.
Em partidas com mouse e teclado: WASD movimentação; Mouse direção da mira; Botão esquerdo disparar;
R recarregar; Teclas numéricas selecionar armas; Tecla de interação comprar ou utilizar objetos.
Os controles deverão ser organizados e configuráveis futuramente.

4. LOBBY PRINCIPAL

Criar um lobby inicial que funcione como menu principal do jogo. O visual deverá combinar com a temática
de sobrevivência contra zumbis.

Elementos do lobby: Jogar; Criar partida; Entrar em partida; Selecionar mapa; Configurações; Sair do jogo.

Criação de partida
Ao selecionar criar partida, o jogador deverá conseguir: escolher o mapa; configurar opções disponíveis;
definir a quantidade de jogadores, caso o multiplayer esteja implementado; iniciar a sessão.

Seleção de mapas
Criar uma tela de seleção com miniaturas dos mapas. Cada mapa deverá apresentar: nome; imagem de
apresentação; descrição; ambiente; características gerais. O sistema deverá permitir adicionar mapas
novos sem precisar reconstruir o lobby. O multiplayer poderá ser desenvolvido em uma etapa posterior, mas
a arquitetura deverá permitir sua implementação.

5. SISTEMA DE MAPAS

Os mapas são uma das partes mais importantes do projeto. O jogo deverá possuir diferentes ambientes, cada
um com estrutura própria, obstáculos, corredores, áreas abertas e locais estratégicos.

MAPA 1 — TELHADOS: ambiente urbano formado por telhados de prédios, passagens, estruturas metálicas e
áreas abertas. Características: áreas abertas para movimentação; passagens estreitas; equipamentos
abandonados; obstáculos; locais estratégicos para barricadas e torretas.

MAPA 2 — METRÔ: uma estação subterrânea abandonada. Características: plataformas; trilhos; vagões;
corredores; salas de manutenção; áreas de acesso.

MAPA 3 — HOSPITAL: um hospital abandonado tomado por zumbis. Características: recepção; corredores; salas
médicas; quartos; salas de cirurgia; áreas de emergência.

MAPA 4 — ESCOLA: uma escola abandonada. Características: salas de aula; corredores; biblioteca; quadra;
refeitório; pátio.

Outros mapas deverão poder ser adicionados posteriormente.

Construção dos cenários
Cada mapa deverá possuir: paredes com colisão; objetos decorativos; obstáculos; áreas acessíveis; áreas
bloqueadas; pontos de entrada dos zumbis; pontos de posicionamento de estruturas; pontos de compra,
quando necessário.

Os zumbis deverão respeitar as colisões do cenário. Não deverão atravessar paredes, objetos sólidos ou
estruturas físicas. O mapa deverá possuir uma organização que permita adicionar novos elementos sem
modificar o funcionamento geral do jogo.

6. SISTEMA DE HORDAS

O sistema de hordas será responsável por controlar a progressão da partida. Cada horda deverá representar
uma nova onda de inimigos. Quando todos os zumbis de uma horda forem eliminados, a próxima deverá começar
após um pequeno intervalo.

Progressão
A dificuldade deverá aumentar gradualmente. Não queremos uma progressão exagerada nas primeiras hordas.
Exemplo: Horda 1: poucos zumbis comuns. Horda 2: pequeno aumento na quantidade. Horda 3: aumento gradual.
Horda 5: mais inimigos simultâneos. Horda 10: maior pressão sobre o jogador. Horda 15: zumbis mais
resistentes começam a aparecer. Horda 20: inimigos com características especiais podem começar a surgir.
Horda 30: maior variedade de inimigos. Horda 40: inimigos especiais mais frequentes. Horda 50+: desafios
maiores e combinações de inimigos. Esses valores são exemplos de balanceamento e deverão ser configuráveis.

Controle de dificuldade
O sistema deverá controlar: quantidade de zumbis; vida dos inimigos; velocidade; dano; frequência de
aparecimento; tipos de inimigos disponíveis. A dificuldade deverá crescer de maneira equilibrada. Evitar
aumentos absurdos de vida e dano que tornem os inimigos apenas esponjas de balas.

Finalização das hordas
Quando todos os inimigos forem eliminados: mostrar uma indicação de horda concluída; atualizar o
contador; aguardar alguns segundos; iniciar a próxima horda; atualizar a dificuldade. A interface deverá
mostrar claramente qual horda está acontecendo.

7. SISTEMA DE ZUMBIS E INTELIGÊNCIA ARTIFICIAL

Os zumbis deverão possuir inteligência artificial funcional. O comportamento básico deverá ser:
1. Aparecer em um ponto de entrada do mapa. 2. Identificar jogadores próximos. 3. Encontrar um caminho até
o jogador. 4. Perseguir o jogador. 5. Atacar quando estiver próximo. 6. Atacar barricadas quando elas
bloquearem seu caminho. 7. Continuar perseguindo o jogador caso consiga contornar o obstáculo.

O sistema de movimentação deverá considerar obstáculos, paredes e estruturas. Utilizar navegação por
caminhos, como Pathfinding, para evitar que os inimigos fiquem presos.

Tipos de zumbis
1. ZUMBI COMUM: o inimigo básico. Velocidade normal, vida normal, dano moderado, persegue o jogador,
   ataca quando está próximo.
2. ZUMBI FRENÉTICO: inimigo extremamente rápido. Velocidade elevada, menor resistência, persegue os
   jogadores rapidamente, exige reflexos para ser eliminado.
3. ZUMBI EXPLOSIVO: explode ao chegar perto do jogador. Comportamento de aproximação, inicia explosão ao
   chegar perto, causa dano em área, pode causar dano a estruturas próximas.
4. ZUMBI CUSPIDOR: inimigo de ataque à distância. Mantém distância do jogador, lança substâncias tóxicas,
   causa dano caso o ataque acerte, pode obrigar os jogadores a saírem de posições defensivas.
5. ZUMBI TANQUE: muito resistente. Bastante vida, movimenta-se mais lentamente, causa dano elevado, é
   mais difícil de eliminar.
6. ZUMBI RASTEJANTE: movimenta-se próximo ao chão. Aparência diferenciada, pode surpreender o jogador,
   comportamento próprio, pode atacar por baixo de determinados obstáculos, caso o mapa permita.

Cada zumbi deverá possuir animações, atributos e comportamentos próprios. A criação de novos tipos de
zumbis deverá ser simples e modular.

8. SISTEMA DE DINHEIRO E RECOMPENSAS

O jogador deverá receber moedas ao eliminar zumbis. O valor recebido poderá variar de acordo com o tipo de
inimigo. Exemplo: zumbi comum 10 moedas; frenético 15; explosivo 20; cuspidor 25; tanque 35. Os valores
deverão ser configuráveis.

O dinheiro deverá ser utilizado durante a partida para comprar equipamentos e construir defesas.

Interface de dinheiro
Mostrar claramente: quantidade atual de moedas; valor de compras; valor necessário para cada melhoria.
Ao comprar algo, descontar automaticamente o valor do saldo. Não permitir compras quando o jogador não
possuir moedas suficientes.

9. SISTEMA DE BARRICADAS

O jogador poderá construir barricadas de madeira para impedir ou dificultar a passagem dos zumbis. As
barricadas deverão ser posicionadas em pontos permitidos do mapa.

Funcionamento
O jogador seleciona a opção de construir barricada. O jogo mostra uma prévia da posição. A posição válida
deverá ser identificada visualmente. O jogador confirma a construção. O dinheiro é descontado. A barricada
aparece no mapa. Os zumbis passam a reconhecer a barricada como obstáculo.

Custo progressivo
Cada barricada construída aumenta o preço da próxima. Exemplo: nenhuma → 50; 1 → 80; 2 → 90; 3 → 100;
4 → 110; 5 → 120. A progressão deverá ser configurável.

Resistência
Cada barricada deverá possuir pontos de vida. Quando um zumbi encontrar uma barricada bloqueando seu
caminho: deverá começar a atacá-la; a barricada perderá vida; deverá apresentar sinais visuais de dano;
quando chegar a zero de vida, será destruída. A construção de barricadas deverá ser uma parte importante
da estratégia.

10. SISTEMA DE TORRETAS

O jogador poderá comprar e instalar torretas automáticas. As torretas serão estruturas defensivas que
auxiliam no combate.

Funcionamento
1. O jogador seleciona a torreta. 2. O sistema mostra a área permitida de posicionamento. 3. O jogador
escolhe o local. 4. Confirma a construção. 5. O dinheiro é descontado. 6. A torreta começa a funcionar.

Comportamento
A torreta deverá: detectar zumbis próximos; verificar se os inimigos estão dentro do alcance; escolher um
alvo; girar na direção do alvo; disparar automaticamente; causar dano; trocar de alvo quando necessário.

Atributos
Cada torreta deverá possuir: dano; alcance; cadência de disparo; velocidade de rotação; vida; custo.

Preço progressivo
Cada torreta construída deverá aumentar o preço da próxima. O objetivo é impedir que o jogador construa
torretas ilimitadamente sem planejamento. As torretas também poderão ser atacadas e destruídas pelos
zumbis.

11. SISTEMA DE ARMAS

O jogador começará com uma pistola básica. Durante a partida, poderá comprar armas mais poderosas
utilizando as moedas adquiridas.

Progressão de armas (exemplo): 1. Pistola. 2. Espingarda calibre 12. 3. Submetralhadora. 4. Rifle.
5. Rifle avançado. 6. Armas especiais.

Atributos das armas: dano; cadência de tiro; munição no carregador; munição reserva; tempo de recarga;
precisão; dispersão; alcance; preço.

Compra de armas
O sistema deverá possuir pontos de compra ou uma interface de aquisição. Quando o jogador comprar uma
arma: verificar se possui dinheiro suficiente; descontar o valor; entregar a arma; permitir equipá-la;
atualizar a interface.

As armas deverão possuir diferenças reais de desempenho. Não basta mudar apenas a aparência ou o nome.
Uma espingarda deverá funcionar de maneira diferente de um rifle, por exemplo.

Melhorias
Também deverá existir a possibilidade de melhorar armas durante a partida. Exemplos: aumentar dano;
melhorar cadência; aumentar capacidade do carregador; reduzir tempo de recarga; melhorar precisão. Cada
melhoria deverá possuir um preço próprio.

12. SISTEMA DE COMBATE

O combate deverá ser responsivo e satisfatório. O jogador deverá conseguir: mirar livremente; disparar;
recarregar; trocar de arma; eliminar diferentes tipos de zumbis.

Efeitos
Implementar: efeitos de disparo; animações de impacto; efeitos de sangue adequados à direção visual
escolhida; sons de armas; sons de impacto; animações de morte; indicadores de dano quando necessário.

Os disparos deverão detectar colisões corretamente. Os projéteis não deverão atravessar paredes sólidas.

13. SISTEMA DE VIDA DO JOGADOR

O jogador deverá possuir uma quantidade de vida definida. Quando receber ataques: perderá pontos de vida;
a interface deverá atualizar; poderá receber efeitos visuais de dano.

Se a vida chegar a zero: o jogador será eliminado; a partida individual será encerrada; no multiplayer,
poderá existir um sistema de reviver jogadores. O sistema deverá ser preparado para futuras melhorias de
vida, cura e equipamentos defensivos.

14. INTERFACE DURANTE A PARTIDA

A interface deverá ser limpa, organizada e fácil de entender.

Elementos obrigatórios: número da horda atual; quantidade de moedas; vida do jogador; arma equipada;
munição atual; munição reserva; indicador de recarga; quantidade de zumbis restantes na horda.

Também deverá existir uma interface de compra para: armas; melhorias; barricadas; torretas.

A interface deverá combinar com a temática do jogo e não ocupar uma parte excessiva da tela.

15. SISTEMA DE ÁUDIO

Implementar áudio para tornar a partida mais imersiva. Sons necessários: disparos; recargas; passos;
ataques dos zumbis; sons de zumbis; explosões; construção de barricadas; destruição de estruturas; compra
de equipamentos; transição entre hordas; música de fundo.

O áudio deverá possuir controles de volume nas configurações.

16. SISTEMA DE CONFIGURAÇÕES

Criar uma tela de configurações contendo: volume geral; volume da música; volume dos efeitos; resolução;
tela cheia; sensibilidade da mira; configuração de controles.

As configurações deverão funcionar de verdade e não ser apenas elementos decorativos.

17. ORGANIZAÇÃO E ARQUITETURA DO PROJETO

O projeto deverá ser organizado de maneira modular. Não concentrar todas as funcionalidades em um único
arquivo ou script. Separar os sistemas de: jogador; câmera; armas; combate; zumbis; inteligência
artificial; hordas; dinheiro; compras; barricadas; torretas; mapas; interface; áudio; lobby; configurações.

Sempre que possível, utilizar configurações externas para definir atributos. Por exemplo, os valores de
dano, vida, velocidade e preço dos zumbis e armas deverão ser facilmente ajustáveis. Isso permitirá
equilibrar o jogo sem precisar reescrever os sistemas.

18. DESEMPENHO E OTIMIZAÇÃO

O jogo deverá funcionar de maneira estável mesmo quando houver muitos zumbis simultaneamente. Considerar:
otimização da inteligência artificial; gerenciamento de entidades; controle de quantidade de projéteis;
detecção de colisões eficiente; otimização de efeitos visuais; gerenciamento de memória. Evitar criar
sistemas desnecessariamente pesados.

19. ORDEM DE DESENVOLVIMENTO

O desenvolvimento deverá acontecer por etapas, mas sempre pensando no resultado final.

ETAPA 1 — BASE DO JOGO: criar o projeto; configurar a resolução; implementar a câmera Top-Down; criar
movimentação do jogador; implementar mira; implementar disparos; criar colisões.

ETAPA 2 — MAPAS: criar a estrutura dos mapas; desenvolver o primeiro cenário; implementar paredes e
obstáculos; configurar pontos de entrada dos zumbis; implementar navegação dos inimigos; preparar o
sistema para novos mapas.

ETAPA 3 — ZUMBIS: criar zumbi comum; implementar perseguição; implementar ataques; criar sistema de
vida; implementar morte; criar variações de inimigos.

ETAPA 4 — HORDAS: criar sistema de ondas; implementar contador; controlar quantidade de inimigos;
implementar progressão; adicionar dificuldade gradual.

ETAPA 5 — ECONOMIA: criar moedas; recompensar eliminações; implementar compras; criar interface de dinheiro.

ETAPA 6 — CONSTRUÇÃO: implementar barricadas; criar posicionamento; implementar resistência; implementar
destruição; criar torretas; implementar disparos automáticos; implementar custos progressivos.

ETAPA 7 — ARMAS: criar diferentes armas; implementar compra; criar sistema de munição; implementar
recarga; criar melhorias.

ETAPA 8 — INTERFACE E ÁUDIO: criar HUD; criar menu principal; criar lobby; criar configurações; adicionar
efeitos sonoros; adicionar música.

ETAPA 9 — FINALIZAÇÃO: testar todas as mecânicas; corrigir erros; ajustar dificuldade; ajustar preços;
otimizar desempenho; testar diferentes mapas; preparar a estrutura multiplayer.

20. REGRAS IMPORTANTES PARA O DESENVOLVIMENTO

1. Não criar funcionalidades apenas visuais. Tudo que estiver disponível na interface deverá funcionar.
2. Não deixar botões sem ação.
3. Não utilizar sistemas falsos ou simulações que não estejam conectados ao gameplay.
4. Não criar zumbis que atravessem paredes ou obstáculos sólidos.
5. Não permitir que as torretas atirem em alvos fora de alcance.
6. Não permitir compras sem dinheiro suficiente.
7. Não aumentar a dificuldade exageradamente nas primeiras hordas.
8. Não deixar os custos de barricadas e torretas fixos.
9. Não criar todas as armas com o mesmo comportamento.
10. Não misturar todos os sistemas em um único arquivo.
11. Não copiar integralmente a estrutura de outro jogo.
12. Não desenvolver funcionalidades futuras de maneira improvisada.
13. Testar cada sistema antes de passar para a próxima etapa.
14. Manter compatibilidade entre os sistemas já implementados.
15. Garantir que o jogo possa receber novos mapas, armas, zumbis e estruturas.

21. RESULTADO ESPERADO

O resultado final deverá ser um jogo 2D Top-Down de sobrevivência contra hordas de zumbis, com uma
estrutura completa e funcional.

O jogador deverá conseguir entrar no jogo, selecionar um mapa, iniciar uma partida, enfrentar hordas,
eliminar zumbis, ganhar dinheiro, comprar armas, construir barricadas, posicionar torretas e sobreviver a
inimigos cada vez mais perigosos.

O projeto deverá possuir uma boa base técnica, identidade visual própria e arquitetura preparada para
receber novas funcionalidades.

O jogo deverá ser divertido desde as primeiras hordas, mas oferecer desafios crescentes para quem
conseguir sobreviver por bastante tempo.

**PRIORIDADE ABSOLUTA: entregar um jogo realmente jogável. Não priorize quantidade de menus, efeitos ou
funcionalidades decorativas em detrimento das mecânicas principais.**

Desenvolva os sistemas de maneira integrada, teste cada funcionalidade e mantenha o projeto organizado
durante todo o processo.

O objetivo é transformar essa proposta em um jogo completo, funcional, expansível e com identidade própria.
