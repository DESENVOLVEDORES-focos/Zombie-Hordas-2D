# MAPAS E BACKLOG

> Documento 6 de 6. Como criar mapa novo (o "expansível" da spec §5 e §20.15) e o que fica para depois.

---

## 1. Formato de mapa (dado puro — nada de código de engine)

```js
MAPS.push({
  id:'telhados', name:'TELHADOS', subtitle:'Cobertura do Edifício Aurora',
  desc:'Telhados vizinhos ligados por passarelas. Áreas abertas, dutos e muito vento.',
  env:'Externo · noite', locked:false,
  size:{ tw:32, th:32, tile:100 },          // 3200 x 3200 px
  palette:{ floor:'#4a4f57', wall:'#8b8175', wallTop:'#a89c8c', accent:'#d6c9a8', sky:'#1b1620' },
  walls:[       { x:0, y:0, w:32, h:0.5, kind:'parapet' } ],       // colisão
  obstacles:[   { x:4, y:4, w:2, h:2, kind:'ac' } ],                // props com colisão
  decor:[       { x:18, y:13, w:7, h:7, kind:'helipad' } ],          // sem colisão, só arte
  barricadeSlots:[ { x:6, y:8.6 } ],                                 // 7 a 8 vagas
  turretSlots:[    { x:26, y:14.5 } ],                               // 4 a 5 vagas
  buyPoints:[      { x:2.6, y:11.5, rot:0, type:'weapon', weapon:'shotgun' } ],
  spawns:[         { x:1.6, y:1.6 } ],                               // 7 a 9 pontos
  zones:[          { id:'helipad', name:'HELIPONTO', x:18, y:13, w:7, h:7 } ],
  tips:[ 'Barricadas atrasam, não prendem.' ]
});
```

O que o engine deriva automaticamente no load (você **não** faz à mão):
colisão AABB das paredes e obstáculos · grade de navegação · flow field · chão pré-renderizado
(piso, emendas, manchas, ícone das vagas pintado no chão) · posição válida das vagas · zonas.

**Regra absoluta:** se você precisar tocar em qualquer arquivo que não seja `js/maps.js` para adicionar
um mapa, o sistema de mapas está errado — conserte o sistema, não o mapa.

---

## 2. Receita para criar um mapa (30–45 min)

1. Copie o bloco do Telhados em `js/maps.js` e troque `id`, `name`, `subtitle`, `desc`, `env`.
2. Escolha a paleta (3–4 cores). Mantenha contraste chão↔parede; o jogador precisa ler o mapa em 1 s.
3. Feche a borda: parapeito/parede em toda a volta (o mapa é a arena).
4. Crie 3–4 "salas"/massas de parede com **pelo menos duas entradas** cada (nada de sala-armadilha sem
   saída, a não ser que seja intencional e sinalizada).
5. Espalhe 8–14 obstáculos (props característicos do tema) criando corredores e funis.
6. Coloque **8 vagas de barricada** cobrindo os corredores principais e **5 de torreta** em
   posições com boa visão de corredor (não em canto cego).
7. Coloque **6 placas de compra**: 2 de arma, 2 de munição, 2 de melhoria, distribuídas longe uma da
   outra (forçam movimentação).
8. Coloque **8 spawns** nos cantos e nas duas pontas de cada corredor principal, longe do centro.
9. Defina 1–2 zonas de risco (área aberta sem cobertura / sala com uma saída só).
10. Teste: rode o mapa, verifique que (a) não há célula inalcançável, (b) nenhuma vaga está dentro de
    parede, (c) todas as placas são alcançáveis, (d) os 8 spawns estão em célula livre.

Checklist rápido no debug (F3): deve mostrar `células livres / total`, `vagas válidas 8/8`,
`spawns válidos 8/8`, `flow field alcança o jogador de todos os spawns`.

---

## 3. Os 4 mapas desta entrega (conceito)

| Mapa | Ambiente | Identidade de gameplay | Paleta |
|---|---|---|---|
| **TELHADOS** | cobertura urbana, céu, dutos, caixa d'água, heliponto | áreas abertas + funis curtos; bom para kitar | cinza-azulado + bege |
| **METRÔ** | plataforma, trilhos, vagão parado, sala de manutenção | corredores longos: a horda vem em fila, torreta brilha | verde-fantasma + azulejo |
| **HOSPITAL** | recepção, corredores, quartos, centro cirúrgico | salas com portas; cuspidor domina; cobertura farta | branco-azulado + vermelho |
| **ESCOLA** | sala de aula, corredores, biblioteca, quadra, refeitório, pátio | quadra aberta (caos) vs. corredor (funil) | vinho + madeira |

Os três novos entram nos marcos 5 em diante, **um por commit**, sem tocar no engine.

---

## 4. Backlog (só depois dos 5 marcos aceitos)

| Ideia | Esforço | Ganho |
|---|---|---|
| Mapa 5 "Instalações" (galpão industrial) | E1 | variedade de layout |
| Mapa 6 "Zona Urbana" (rua, ônibus, becos) | E2 | mapa grande, rota como desafio |
| 7º zumbi: **Blindado** (−70% dano de frente) | E1 | muda a mira e o posicionamento |
| 7º zumbi: **Necromante** (ressuscita mortos) | E2 | prioridade de alvo |
| Chefe na horda 50 (3 ataques, barra de vida) | E3 | marco para a run longa |
| "Caixa cega" (arma aleatória por 950) | E1 | vício saudável |
| Arame farpado / portão elétrico (vagas novas) | E2 | mais decisão de defesa |
| Coop local (2 jogadores no mesmo teclado) | E2 | melhor diversão por esforço |
| Multiplayer online | E3 | só com a arquitetura já pronta |
| Hub andável (bunker) no lugar do menu | E2 | imersão |
| Gamepad | E2 | conforto |
| Acessibilidade (reduzir flash, alto contraste, escala de HUD) | E1 | alcance |
| Bestiário / medalhas | E1 | retenção |

**Proibido neste backlog:** login/backend/save em nuvem, imagens geradas ou assets externos, mobile
touch-first, copiar conteúdo de franquia existente.

---

## 5. Se for publicar

- **itch.io** aceita HTML5 zipado (o projeto já é isso). A página precisa de GIF de 10 s com horda cheia
  + barricada quebrando, 3 prints e a frase: **"Segure o telhado. Cada horda cobra mais caro que a
  anterior."**
- Licença MIT. "Arte e áudio 100% procedurais" é diferencial de divulgação.
- Nenhum nome, logo ou arte que remeta a franquia existente — a identidade própria é regra do projeto.
