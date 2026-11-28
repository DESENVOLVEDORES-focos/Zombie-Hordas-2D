/**
 * CONFIGURAÇÃO DOS ZUMBIS
 * Para criar um novo tipo: adicione a chave em ZombieKind, uma entrada em ZOMBIES
 * e (se precisar de comportamento novo) um handler em systems/ZombieSystem.ts (BEHAVIORS).
 */
export type ZombieKind = "common" | "frenetic" | "explosive" | "spitter" | "tank" | "crawler";
export type ZombieBehavior = "melee" | "explosive" | "ranged" | "crawler";

export interface ZombieDef {
  kind: ZombieKind;
  name: string;
  description: string;
  behavior: ZombieBehavior;
  hp: number;
  speed: number; // px/s
  damage: number;
  radius: number;
  attackRange: number; // alcance extra além dos raios
  attackCooldown: number;
  attackWindup: number;
  structureDamageMul: number;
  knockbackResist: number; // 0..1
  crossLow: boolean; // pode passar por baixo de obstáculos baixos
  minWave: number; // primeira horda em que aparece
  weight: number; // peso de sorteio após liberado
  scale: number;
  colors: { skin: string; cloth: string; accent: string };
  explosion?: { radius: number; damage: number; structureDamage: number; fuse: number; trigger: number };
  ranged?: {
    range: number;
    keepDistance: number;
    cooldown: number;
    projectileSpeed: number;
    damage: number;
    puddleRadius: number;
    puddleTime: number;
    puddleDps: number;
  };
  lunge?: { trigger: number; duration: number; speedMul: number; cooldown: number };
}

export const ZOMBIES: Record<ZombieKind, ZombieDef> = {
  common: {
    kind: "common",
    name: "Zumbi Comum",
    description: "O infectado básico. Lento, mas persistente.",
    behavior: "melee",
    hp: 60,
    speed: 70,
    damage: 12,
    radius: 11,
    attackRange: 9,
    attackCooldown: 1.0,
    attackWindup: 0.22,
    structureDamageMul: 1,
    knockbackResist: 0,
    crossLow: false,
    minWave: 1,
    weight: 100,
    scale: 1,
    colors: { skin: "#7f9c66", cloth: "#4b5663", accent: "#3a2a2a" },
  },
  frenetic: {
    kind: "frenetic",
    name: "Zumbi Frenético",
    description: "Extremamente rápido e frágil. Exige reflexos.",
    behavior: "melee",
    hp: 34,
    speed: 150,
    damage: 8,
    radius: 10,
    attackRange: 8,
    attackCooldown: 0.6,
    attackWindup: 0.1,
    structureDamageMul: 0.7,
    knockbackResist: 0,
    crossLow: false,
    minWave: 3,
    weight: 30,
    scale: 0.92,
    colors: { skin: "#a9b7c4", cloth: "#7a2e2e", accent: "#ff4a3a" },
  },
  explosive: {
    kind: "explosive",
    name: "Zumbi Explosivo",
    description: "Detona ao chegar perto. Dano em área, inclusive em estruturas.",
    behavior: "explosive",
    hp: 55,
    speed: 88,
    damage: 0,
    radius: 13,
    attackRange: 0,
    attackCooldown: 1,
    attackWindup: 0,
    structureDamageMul: 1,
    knockbackResist: 0.2,
    crossLow: false,
    minWave: 8,
    weight: 18,
    scale: 1.2,
    colors: { skin: "#c9a24a", cloth: "#6b4a1f", accent: "#ff8a1f" },
    explosion: { radius: 88, damage: 48, structureDamage: 130, fuse: 0.75, trigger: 44 },
  },
  spitter: {
    kind: "spitter",
    name: "Zumbi Cuspidor",
    description: "Mantém distância e cospe ácido que corrói o chão.",
    behavior: "ranged",
    hp: 46,
    speed: 64,
    damage: 0,
    radius: 11,
    attackRange: 0,
    attackCooldown: 1,
    attackWindup: 0,
    structureDamageMul: 1,
    knockbackResist: 0,
    crossLow: false,
    minWave: 10,
    weight: 18,
    scale: 1.05,
    colors: { skin: "#6fae4e", cloth: "#2f4a2a", accent: "#b6ff3c" },
    ranged: {
      range: 300,
      keepDistance: 190,
      cooldown: 2.6,
      projectileSpeed: 280,
      damage: 14,
      puddleRadius: 30,
      puddleTime: 4,
      puddleDps: 9,
    },
  },
  tank: {
    kind: "tank",
    name: "Zumbi Tanque",
    description: "Enorme, lento e muito resistente. Cada golpe dói.",
    behavior: "melee",
    hp: 380,
    speed: 46,
    damage: 34,
    radius: 15, // < 16 para caber em vãos de 1 tile (o visual usa "scale")
    attackRange: 12,
    attackCooldown: 1.6,
    attackWindup: 0.4,
    structureDamageMul: 2.2,
    knockbackResist: 0.85,
    crossLow: false,
    minWave: 15,
    weight: 11,
    scale: 1.55,
    colors: { skin: "#8a5d57", cloth: "#3b2f35", accent: "#8c8f99" },
  },
  crawler: {
    kind: "crawler",
    name: "Zumbi Rastejante",
    description: "Rasteja rente ao chão, passa por baixo de móveis e dá o bote.",
    behavior: "crawler",
    hp: 48,
    speed: 82,
    damage: 10,
    radius: 9,
    attackRange: 8,
    attackCooldown: 0.9,
    attackWindup: 0.15,
    structureDamageMul: 0.8,
    knockbackResist: 0,
    crossLow: true,
    minWave: 5,
    weight: 24,
    scale: 0.95,
    colors: { skin: "#6b7a5a", cloth: "#33303a", accent: "#d8d17a" },
    lunge: { trigger: 130, duration: 0.32, speedMul: 3.4, cooldown: 3.2 },
  },
};

export const ZOMBIE_LIST: ZombieDef[] = Object.values(ZOMBIES);
