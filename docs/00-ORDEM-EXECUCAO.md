# ORDEM DE EXECUÇÃO — HORDAS 2D

> Documento 1 de 6. Este é o **comando** que autoriza o trabalho.
> Leia na ordem: `00 → 01 → 02 → 03 → 04`.

---

## 0. Resumo em 5 linhas

Construir um jogo **survival infinito de hordas de zumbis**, visão **topdown 90° (vista de cima)**,
em **HTML5 + JavaScript + Canvas 2D puro**, **sem nenhum asset externo** (toda arte desenhada por
código), com **ondas escaláveis**, **melhorias (upgrades)**, **habilidades especiais** e **7 tipos de
zumbi**. O projeto tem que rodar com **um duplo-clique no `index.html`** e caber em **um único
arquivo de jogo** (`game.js`) além do HTML.

---

## 1. Ordem (o que deve ser feito)

1. **Não perguntar nada.** Todas as decisões de escopo, arte, controles e regras já estão neste pacote.
   Se algo estiver ambíguo, escolha a opção mais simples que **funcione e seja divertida**, e registre
   a escolha no `docs/DECISOES.md` do projeto.
2. **Criar o projeto do zero** na raiz do repositório, respeitando exatamente a estrutura da seção 3.
3. **Implementar em 3 entregas (marcos)**, na ordem, **sem pular**. Ao final de cada marco o jogo
   tem que estar jogável — nunca deixar o repositório com código quebrado.
4. **Validar cada marco** rodando o jogo (abrir no navegador / rodar o checklist de aceite por marco da seção 12 do doc 02).
5. **Ao terminar**, escrever no `README.md`: como jogar, controles, lista de zumbis, lista de
   melhorias, lista de habilidades e o que ficou fora do escopo.

### Marco 1 — Núcleo jogável (obrigatório)
Jogador andando nas 8 direções, tiro automático no zumbi mais próximo, 1 tipo de zumbi perseguindo,
colisão, dano, morte, XP, level up com escolha de 1 entre 3 melhorias, HUD básico, game over e restart.

**Critério de pronto:** dá pra jogar 3 minutos sem bug, morrer, ver a tela de game over e reiniciar.

### Marco 2 — Conteúdo (obrigatório)
7 tipos de zumbi + elites + boss a cada 5 ondas, 4 habilidades especiais com cooldown, 18+ melhorias
upáveis, ondas com escalonamento infinito, drops (cura/moeda), moeda de alma e loja entre partidas
(meta-progressão), efeitos visuais mínimos (flash de dano, sangue em partículas, screen shake).

**Critério de pronto:** uma partida de 10+ minutos com 3 tipos de zumbi na tela ao mesmo tempo,
boss aparecendo na onda 5, e a loja de almas funcionando.

### Marco 3 — Polimento (obrigatório)
Áudio 100% procedural (WebAudio: tiros, hit, morte, level up, dano no jogador), pausa, configurações
(volume, screen shake, velocidade de digitação), tela de título, estatísticas da última partida,
balanceamento do doc 04, e performance estável com **300+ zumbis** simultâneos (usar grid espacial).

**Critério de pronto:** 300 zumbis na tela a 60 FPS (ou próximo), sem travar, com o jogo pausando
corretamente quando a aba perde o foco.

---

## 2. Regras de trabalho (não negociáveis)

| Regra | Detalhe |
|---|---|
| **Zero assets externos** | Sem imagens, sem fontes baixadas, sem CDN, sem `import` remoto. Toda arte = Canvas 2D API + `fillStyle`/`strokeStyle`/gradientes. Toda fonte = `monospace`/`sans-serif` do sistema. |
| **Zero dependências** | Sem `npm install`, sem Phaser, sem bundler. ES Modules nativos ou IIFE. |
| **Offline-first** | O jogo tem que funcionar abrindo o arquivo local (file://). Ou seja: **não usar `fetch()`** e se usar módulos, avisar que precisa de servidor local — **preferir `game.js` único em IIFE** justamente pra rodar com duplo-clique. |
| **60 FPS** | `requestAnimationFrame` com *delta time* (nunca velocidade por frame). Pausar quando `document.hidden`. |
| **Determinismo de leitura** | Números de balanceamento SEMPRE vêm do doc 04. Não inventar valores. |
| **Português (BR)** | Textos do jogo, comentários e README em pt-BR. Código (variáveis/funções) em inglês. |
| **Commits** | Um commit por marco: `feat: marco 1 - nucleo jogavel`, `feat: marco 2 - conteudo`, `feat: marco 3 - polimento`. |
| **Sem escopo extra** | Nada de multiplayer, save em nuvem, login, backend, Supabase, mobile-first, tradução. Isso é backlog (doc 05). |

---

## 3. Estrutura de arquivos obrigatória

```
/
├── index.html          # canvas + CSS de tela cheia + <script src="game.js">
├── game.js             # TODO o jogo (IIFE). ~2.500-4.000 linhas. Comentado em blocos.
├── README.md           # como jogar + controles + conteúdo
├── docs/
│   ├── GDD.md          # o que foi implementado (gerado no marco 3)
│   └── DECISOES.md     # decisões tomadas onde o prompt deixou em aberto
└── (nada mais)
```

`game.js` deve ser seccionado com cabeçalhos de comentário nesta ordem, para facilitar leitura:
`CONFIG → UTILS → INPUT → ÁUDIO → SPRITES PROCEDURAIS → ENTIDADES → ZUMBIS → ARMAS → HABILIDADES →
UPGRADES → ONDAS → DROPS → PARTÍCULAS → COLISÃO → HUD → LOJA → ESTADOS → LOOP`.

---

## 4. Definição de "pronto" (checklist final)

- [ ] Abre com duplo-clique no `index.html` e joga.
- [ ] Controles: WASD/setas mover, mouse mirar, clique/automático atirar, Espaço/Shift habilidade 1, E/Q habilidade 2, 1-4 atalhos, Esc pausa, R reinicia no game over.
- [ ] 7 tipos de zumbi visivelmente diferentes (forma + cor + comportamento).
- [ ] Boss na onda 5, 10, 15… com barra de vida no topo.
- [ ] Level up pausa o jogo e mostra 3 cartas de melhoria, clicáveis e selecionáveis por teclado.
- [ ] 4 habilidades especiais com cooldown e ícone no HUD.
- [ ] Onda infinita: a dificuldade nunca para de subir, sem overflow/NaN depois da onda 30.
- [ ] Moeda "alma" persiste entre partidas (localStorage) e compra melhorias permanentes.
- [ ] 300 zumbis sem travar (grid espacial de colisão).
- [ ] Nada de erro no console.

---

## 5. Mensagem que o agente deve responder ao final

> "Marco X concluído. Joguei/validei o checklist, o jogo está rodável em [como rodar]. Próximo: [marco]."
> — curto, sem despejar código no chat.
