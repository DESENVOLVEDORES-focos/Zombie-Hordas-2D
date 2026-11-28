import type { ZombieDef, ZombieKind } from "../config/zombies";
import type { WeaponDef, UpgradeKey } from "../config/weapons";

export interface Zombie {
  id: number;
  kind: ZombieKind;
  def: ZombieDef;
  x: number;
  y: number;
  kx: number;
  ky: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  angle: number;
  walk: number;
  attackCd: number;
  attackWind: number;
  swing: number;
  hitFlash: number;
  target: Structure | null;
  fuse: number; // <0: inativo
  spitCd: number;
  lungeT: number;
  lungeCd: number;
  lungeDx: number;
  lungeDy: number;
  groanT: number;
  stuckT: number;
  stuckX: number;
  stuckY: number;
  wanderT: number;
  wanderAng: number;
  losT: number;
  hasLos: boolean;
  sight: boolean;
  alive: boolean;
  deathT: number;
  spawnT: number;
  pendDmg: number;
  dmgTextCd: number;
  crawler: boolean;
  selfDestruct: boolean;
  wants: boolean;
}

export type StructureType = "barricade" | "turret";
export interface Structure {
  id: number;
  type: StructureType;
  tx: number;
  ty: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  hitFlash: number;
  alive: boolean;
  angle: number;
  cooldown: number;
  flash: number;
  retarget: number;
  target: Zombie | null;
  attackSoundCd: number;
}

export type ProjectileOwner = "player" | "turret" | "zombie";
export interface Projectile {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
  dist: number;
  range: number;
  damage: number;
  owner: ProjectileOwner;
  kind: "bullet" | "pellet" | "sniper" | "grenade" | "spit" | "turret";
  radius: number;
  pierce: number;
  hit: number[];
  knock: number;
  blast: number;
  color: string;
  size: number;
  puddleRadius: number;
  puddleTime: number;
  puddleDps: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  size2: number;
  color: string;
  kind: "dot" | "ring" | "flash" | "smoke" | "line" | "shell";
  drag: number;
  rot: number;
}

export interface FloatText {
  x: number;
  y: number;
  vy: number;
  life: number;
  max: number;
  text: string;
  color: string;
  size: number;
}

export interface Pickup {
  x: number;
  y: number;
  kind: "ammo" | "health";
  life: number;
  t: number;
}

export interface Hazard {
  x: number;
  y: number;
  r: number;
  life: number;
  max: number;
  dps: number;
}

export interface WeaponState {
  def: WeaponDef;
  levels: Record<UpgradeKey, number>;
  mag: number;
  reserve: number;
  bloom: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  angle: number;
  walk: number;
  moveAngle: number;
  speedNow: number;
  alive: boolean;
  regenT: number;
  hurtFlash: number;
  speedMul: number;
  vestLevel: number;
  bootsLevel: number;
  weapons: (WeaponState | null)[];
  slot: number;
  lastSlot: number;
  fireCd: number;
  fireQueued: number;
  reloadT: number;
  reloadTotal: number;
  recoil: number;
  flash: number;
  stepDist: number;
  kills: number;
}

export type GameState = "playing" | "paused" | "shop" | "gameover";

export interface HudState {
  state: GameState;
  wave: number;
  phase: "countdown" | "active" | "intermission";
  countdown: number;
  zombiesLeft: number;
  coins: number;
  hp: number;
  maxHp: number;
  weaponName: string;
  weaponId: string;
  ammo: number;
  reserve: number;
  reloading: boolean;
  reloadProgress: number;
  slots: { slot: number; owned: boolean; name: string; active: boolean; id: string }[];
  prompt: string;
  promptOk: boolean;
  announce: { id: number; title: string; sub: string } | null;
  toast: { id: number; text: string; kind: "ok" | "bad" | "info" } | null;
  build: { type: "barricade" | "turret"; cost: number; valid: boolean; reason: string } | null;
  barricadeCost: number;
  turretCost: number;
  kills: number;
  time: number;
  keys: { barricade: string; turret: string; shop: string; interact: string; reload: string; pause: string };
}

export type ShopCategory = "weapons" | "upgrades" | "defenses" | "supplies";
export interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  desc: string;
  price: number;
  action: string; // rótulo do botão
  status: "available" | "owned" | "maxed" | "unavailable";
  affordable: boolean;
  tag?: string;
  stats?: { label: string; value: string }[];
}

export interface GameResult {
  mapId: string;
  wave: number;
  kills: number;
  coins: number;
  time: number;
  newRecord?: boolean;
}
