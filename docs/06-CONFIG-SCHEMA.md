# CONFIG SCHEMA — `js/config.js` completo

> Documento 6 de 16. Este arquivo é **literalmente** o conteúdo que deve existir em `js/config.js`.
> Regra: **nenhum número de gameplay pode existir fora daqui.** Se o executor precisar de um valor novo,
> ele nasce neste arquivo com nome claro.
>
> Por que assim: o dono do projeto precisa ajustar dano/vida/preço sem tocar em lógica. É o que a
> especificação chama de "configurações externas" (§17).

---

## 1. Estrutura do arquivo

```js
/* =============================================================================
   HORDAS — js/config.js
   ÚNICO lugar com números de gameplay. Zero lógica aqui.
   ============================================================================= */
window.CFG = {

  /* ---------------------------------------------------------------- VIEW */
  VIEW: {
    W: 1280,              // resolução lógica do canvas
    H: 720,
    DPR_MAX: 2,           // limite de devicePixelRatio (performance)
    NAV_CELL: 50,         // célula da grade de navegação (flow field)
    SPATIAL_CELL: 80,     // célula do grid espacial de colisão
    CAMERA_LERP: 9,       // 9/s — suavidade do follow
    CAMERA_LOOKAHEAD: 60, // px na direção do mouse
    SHAKE_DECAY: 60       // px/s de redução do screen shake
  },

  /* -------------------------------------------------------------- PLAYER */
  PLAYER: {
    hp: 100,
    speed: 210,            // px/s
    radius: 13,
    iframe: 0.35,          // s de invencibilidade após levar dano
    regenDelay: -1,        // -1 = sem regeneração (cura só por kit)
    coinsStart: 500,
    slots: 2,              // 2 slots de arma (teclas 1 e 2)
    focusMoveMul: 0.85,    // segurar botão direito = foco manual
    reloadMoveMul: 0.72,   // recarregando você fica lento
    interactRadius: 78,    // distância para comprar/reparar
    interactTime: 0.8,     // s segurando E para comprar
    deathDelay: 1.4        // s de "câmera lenta" antes do game over
  },

  /* ------------------------------------------------------------- WEAPONS */
  /* dmg        dano por projétil (bagos contam individualmente)
     rate       tiros por segundo
     mag        munição no pente
     reserve    munição reserva inicial (null = infinita)
     reload     s
     spread     graus de dispersão total
     range      px
     pellets    projéteis por tiro
     pierce     quantos zumbis o projétil atravessa
     splash     px de raio de explosão (0 = nenhum)
     price      custo no ponto de compra
     ammoPrice  custo para reabastecer 4 pentes
     kick       screen shake por tiro
     recoil     incremento visual do retículo
     upgrade    { dmg, mag, reload } — custos individuais das 3 melhorias       */
  WEAPONS: {
    pistol: {
      name:'PISTOLA', dmg:10, rate:4.0, mag:12, reserve:null, reload:1.1,
      spread:1.5, range:420, pellets:1, pierce:0, splash:0,
      price:0, ammoPrice:0, kick:2, recoil:0.5,
      upgrade:{ dmg:0, mag:0, reload:0 }   // pistola não tem ponto de upgrade
    },
    shotgun: {
      name:'CALIBRE 12', dmg:9, rate:1.1, mag:6, reserve:24, reload:2.2,
      spread:9, range:260, pellets:6, pierce:0, splash:0,
      price:500, ammoPrice:60, kick:7, recoil:1.0,
      upgrade:{ dmg:400, mag:450, reload:500 }
    },
    vetor: {
      name:'VETOR', dmg:14, rate:8.5, mag:30, reserve:120, reload:1.8,
      spread:2.5, range:520, pellets:1, pierce:0, splash:0,
      price:1000, ammoPrice:80, kick:2.6, recoil:0.45,
      upgrade:{ dmg:400, mag:450, reload:500 }
    },
    zumbido: {
      name:'ZUMBIDO', dmg:9, rate:13.0, mag:45, reserve:180, reload:1.6,
      spread:4.5, range:380, pellets:1, pierce:0, splash:0,
      price:1400, ammoPrice:80, kick:2, recoil:0.35,
      upgrade:{ dmg:400, mag:450, reload:500 }
    },
    brasa: {
      name:'BRASA', dmg:32, rate:3.2, mag:20, reserve:60, reload:2.4,
      spread:1.0, range:640, pellets:1, pierce:1, splash:0,
      price:1900, ammoPrice:110, kick:5, recoil:0.8,
      upgrade:{ dmg:400, mag:450, reload:500 }
    },
    estilhaco: {
      name:'ESTILHAÇO', dmg:90, rate:0.9, mag:4, reserve:12, reload:3.2,
      spread:3, range:600, pellets:1, pierce:0, splash:140,
      price:3400, ammoPrice:150, kick:9, recoil:1.4,
      upgrade:{ dmg:400, mag:450, reload:500 }
    }
  },
  WEAPON_UPGRADE: {        // efeito de cada melhoria, uma vez por arma
    dmg: 0.20,             // +20% dano
    mag: 0.50,             // +50% pente
    reload: 0.25,          // −25% tempo de recarga
    priceStep: 25          // +25 moedas por horda acima da 1 no preço do upgrade
  },
  AMMO_PRICE_STEP: 0.15,   // +15% no preço da munição por horda após a 10
  CRIT: { chance:0.05, mult:2 },   // crítico base (pode ser 0 se não quiser crítico)

  /* ------------------------------------------------------------- ZOMBIES */
  /* hp/dmg/speed são valores da horda 1; multiplicadores em HORDES.
     behavior: chase | dash | explode | kite | push | low
     hitbox: raio de colisão | drawR: raio visual (pode ser maior que hitbox)
     coin: moedas por abate | weight: peso no sorteio | minHorde: liberação        */
  ZOMBIES: {
    walker: {
      name:'COMUM', hp:60, dmg:12, speed:70, hitbox:15, drawR:18,
      coin:10, weight:45, minHorde:1, behavior:'chase',
      color:'#8fd14f', colorDark:'#5c8f2f', skin:'#a8bf6a',
      body:{ w:20, h:26, head:9, arm:14, leg:9 }
    },
    runner: {
      name:'FRENÉTICO', hp:45, dmg:15, speed:128, hitbox:13, drawR:16,
      coin:15, weight:18, minHorde:11, behavior:'dash',
      color:'#e3f26a', colorDark:'#a8b72c', skin:'#cfd97a',
      body:{ w:16, h:26, head:8, arm:16, leg:11 },
      dash:{ windup:0.25, duration:0.55, speedMul:1.48, recover:1.1 }
    },
    tank: {
      name:'TANQUE', hp:380, dmg:22, speed:52, hitbox:24, drawR:30,
      coin:35, weight:8, minHorde:15, behavior:'push',
      color:'#9a7b52', colorDark:'#6d5436', skin:'#b79b6d',
      body:{ w:34, h:30, head:11, arm:18, leg:10 },
      push:{ force:240 }     // empurra o jogador ao encostar
    },
    bomber: {
      name:'EXPLOSIVO', hp:70, dmg:45, speed:95, hitbox:14, drawR:17,
      coin:20, weight:9, minHorde:20, behavior:'explode',
      color:'#ffcf3d', colorDark:'#c79a12', skin:'#e8d76a',
      body:{ w:24, h:22, head:8, arm:10, leg:7 },
      explode:{ radius:90, telegraph:0.45, structDmg:120 }
    },
    spitter: {
      name:'CUSPIDOR', hp:120, dmg:10, speed:55, hitbox:15, drawR:18,
      coin:25, weight:8, minHorde:20, behavior:'kite',
      color:'#b06cf0', colorDark:'#7d3fb5', skin:'#c9a3e8',
      body:{ w:24, h:24, head:8, arm:12, leg:8 },
      kite:{ minDist:200, maxDist:262, shootCd:2.6, projSpeed:300, projLife:2.0 }
    },
    crawler: {
      name:'RASTEJANTE', hp:35, dmg:8, speed:88, hitbox:11, drawR:14,
      coin:10, weight:12, minHorde:21, behavior:'low',
      color:'#5c8f2f', colorDark:'#3f6620', skin:'#93ab55',
      body:{ w:24, h:15, head:8, arm:13, leg:5 },
      low:{ barricadePassMul:3.0 }   // atravessa barricada 3x mais devagar
    }
  },
  ZOMBIE_DMG_COOLDOWN: 0.8,   // s por zumbi entre dois acertos no jogador
  ZOMBIE_BARRICADE_DPS: 30,   // dano que zumbi faz na barricada
  ZOMBIE_TURRET_DPS: 18,      // dano que zumbi faz na torreta
  ZOMBIE_THINK: { min:0.15, max:0.23 },   // jitter de IA (não pensa todo frame)
  ZOMBIE_STUCK_TIME: 2.0,     // s parado até entrar em modo "atacar estrutura"

  /* -------------------------------------------------------------- HORDES */
  HORDES: {
    prepTime: 2.5,        // s antes da horda 1
    breakTime: 6.0,       // s de trégua entre hordas
    maxZombies: 140,      // cap global de zumbis vivos (segurança)
    spawnBurst: 3,        // máx. de zumbis que nascem por tick de spawn
    spawnInterval: 0.55,  // s entre ticks de spawn
    // todas as funções abaixo são puras: recebem a horda e devolvem número
    count:     function (h) { return Math.min(240, Math.round(6 + 2.4*(h-1) + 0.045*Math.pow(h-1,2))); },
    maxAlive:  function (h) { return Math.min(80, Math.round(6 + 1.2*(h-1))); },
    pulses:    function (h) { return Math.max(1, Math.min(6, Math.ceil(CFG.HORDES.count(h)/12))); },
    hpMul:     function (h) { return Math.min(12,  1 + 0.20*(h-1)); },
    dmgMul:    function (h) { return Math.min(3.2, 1 + 0.04*(h-1)); },
    speedMul:  function (h) { return Math.min(1.25, 1 + 0.006*(h-1)); },
    // peso extra dos especiais depois da horda 30
    specialWeightBonusFrom: 30,
    specialWeightMul: 1.4,
    // anúncio
    bannerTime: 2.2
  },

  /* --------------------------------------------------------------- CUSTOS */
  COSTS: {
    barricade: [50, 80, 90, 100, 110, 120],  // por nº de barricadas vivas
    barricadeStep: 20,                        // +20 por cada acima de 6
    turret:    [400, 550, 700, 850],          // por nº de torretas vivas
    turretStep: 180,                          // +180 por cada acima de 4
    turretReload: 150,                        // recarregar munição da torreta
    repairPct: 0.5,                           // reparo custa 50% do preço atual
    repairHeal: 0.4                           // devolve 40% da vida máxima
  },

  /* ------------------------------------------------------------- DEFESAS */
  BARRICADE: {
    hp: 600,
    w: 96, h: 60,          // AABB de colisão (centrada na vaga)
    stages: [0.66, 0.33],  // limiares de vida para os 3 visuais
    debrisTime: 10         // s que os destroços ficam no chão (visual)
  },
  TURRET: {
    hp: 400,
    range: 340,
    dmg: 12,
    rate: 5,               // tiros/s
    ammo: 240,
    rotSpeed: 8,           // rad/s de giro (suaviza a mira)
    radius: 22,            // colisão com zumbis
    bulletSpeed: 800,
    retargetTime: 0.2      // s entre reavaliações de alvo
  },

  /* ------------------------------------------------------------- ECONOMIA */
  ECONOMY: {
    killsBonusHordeClear: 0,   // bônus de horda limpa (0 = desligado)
    priceHikeEveryHorde: 0,    // aumenta preço de arma por horda? (0 = não)
    medkitChance: 0.02,        // 2% por abate
    ammoPackChance: 0.015,     // 1,5%
    coinDropChance: 0.05,      // 5% de moeda extra no chão
    pickupLife: 20,            // s até sumir
    pickupBlink: 4             // s finais piscando
  },

  /* ---------------------------------------------------------------- AUDIO */
  AUDIO: {
    masterVolume: 0.7,
    musicVolume: 0.35,
    sfxVolume: 0.9,
    maxVoices: 12,             // sons simultâneos
    footstepInterval: 0.42     // s entre passos
  },

  /* ------------------------------------------------------------------ UI */
  UI: {
    hudMargin: 24,
    hpBarW: 246, hpBarH: 22,
    minimapSize: 148,          // 0 = sem minimapa
    bannerFont: 64,
    fontBody: 'monospace',
    shakeScale: 1.0,           // multiplicador global do screen shake
    bloodFade: 0.010,          // alpha por frame do fade do sangue no chão
    maxParticles: 500,
    maxDamageTexts: 40,
    lowFx: false               // reduz partículas/sangue/números
  },

  /* --------------------------------------------------------------- CORES */
  /* Paleta oficial. Nenhuma cor fora desta lista pode ser usada. */
  PAL: {
    bg:'#1b1620', sky:'#241a2e',
    floor:'#4a4f57', floorSeam:'#3a3e46', floorDark:'#3f444b',
    wall:'#8b8175', wallTop:'#a89c8c', wallEdge:'#171319',
    player:'#37c6ff', playerDark:'#1a7fa8', skin:'#d9a97e', hair:'#2b2f36',
    bullet:'#fff3b0', bulletTrail:'rgba(255,215,94,.35)',
    coin:'#ffd44d', ammo:'#f2f4f8',
    ok:'#54e08a', danger:'#ff5548', warn:'#ffc23d', fire:'#ff9f1c',
    blood:'#d63a30', bloodDry:'#7d2320',
    ui:'#f2f4f8', uiDim:'#8a8f99', uiPanel:'rgba(10,13,18,.85)', uiBorder:'#39424f',
    wood:'#9a6b3f', woodDark:'#6f4a29', metal:'#4d5a66'
  },

  /* --------------------------------------------------------------- DEBUG */
  DEBUG: {
    startMap: 'telhados',       // mapa usado no ?autotest
    autotest: false,            // ?autotest força true
    showFps: false,
    showNavGrid: false,
    invincible: false,
    infiniteMoney: false
  }
};
```

---

## 2. Regras de uso (o executor precisa seguir)

1. **Nunca hardcodar.** `p.hp -= 12` é proibido; o certo é `p.hp -= CFG.ZOMBIES.walker.dmg * dmgMul`.
2. **Funções dentro do `CFG`** (`count`, `hpMul`...) são permitidas porque são puras e não guardam estado.
   Nada de função que dependa de `Game` aqui.
3. **Ao mudar um número**, atualizar também `docs/04-BALANCEAMENTO.md` na mesma alteração.
4. **Validação no boot**: `main.js` deve checar que todos os campos obrigatórios existem e que os
   valores são plausíveis (hp > 0, price ≥ 0, arrays de custo não vazios). Se faltar, lançar erro claro
   no console em vez de quebrar no meio da partida.
5. **Escala de balanceamento** deve ser possível só com este arquivo: mudar `hpMul` e `count` não pode
   exigir mexer em `zombies.js` nem `hordes.js`.

---

## 3. Exemplo de validação no boot (`main.js`)

```js
function validateConfig() {
  var need = ['VIEW','PLAYER','WEAPONS','ZOMBIES','HORDES','COSTS','BARRICADE','TURRET','ECONOMY','PAL'];
  for (var i=0;i<need.length;i++) if (!CFG[need[i]]) throw new Error('CFG.'+need[i]+' ausente');
  if (!CFG.WEAPONS.pistol) throw new Error('CFG.WEAPONS.pistol é obrigatória');
  if (CFG.COSTS.barricade.length < 1) throw new Error('CFG.COSTS.barricade vazio');
  for (var z in CFG.ZOMBIES) {
    var d = CFG.ZOMBIES[z];
    if (!(d.hp > 0) || !(d.speed > 0) || !(d.hitbox > 0)) throw new Error('zumbi inválido: '+z);
  }
}
```
