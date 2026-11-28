/**
 * CONFIGURAÇÃO DAS ARMAS
 * Cada arma possui comportamento real distinto (pellets, perfuração, explosão, modo de disparo...).
 * Para adicionar uma nova arma basta incluir uma entrada na lista (slot = tecla numérica - 1).
 */
export type UpgradeKey = "damage" | "rate" | "mag" | "reload" | "accuracy";
export type FireMode = "semi" | "auto";
export type ProjectileKind = "bullet" | "pellet" | "sniper" | "grenade";

export interface WeaponDef {
  id: string;
  name: string;
  slot: number;
  desc: string;
  price: number; // preço de compra
  ammoPrice: number; // preço de reabastecimento total
  damage: number; // por projétil
  fireRate: number; // disparos por segundo
  mode: FireMode;
  magSize: number;
  reserveAmmo: number; // reserva inicial ao comprar
  maxReserve: number;
  reloadTime: number;
  spread: number; // precisão: cone base (graus)
  bloomPerShot: number; // dispersão acumulada por disparo (graus)
  bloomMax: number;
  bloomRecovery: number; // graus/s
  moveSpread: number; // graus extras ao se mover
  range: number;
  pellets: number;
  projectileSpeed: number;
  pierce: number;
  knockback: number;
  blastRadius: number; // >0 = projétil explosivo
  kind: ProjectileKind;
  sound: string;
  shake: number;
  recoil: number;
  color: string;
  gunLen: number;
  gunWidth: number;
}

export const WEAPONS: WeaponDef[] = [
  {
    id: "pistol",
    name: "Pistola M9",
    slot: 0,
    desc: "Confiável e precisa. Disparo semiautomático.",
    price: 0,
    ammoPrice: 60,
    damage: 22,
    fireRate: 5,
    mode: "semi",
    magSize: 12,
    reserveAmmo: 60,
    maxReserve: 120,
    reloadTime: 1.3,
    spread: 1.1,
    bloomPerShot: 1.5,
    bloomMax: 5,
    bloomRecovery: 9,
    moveSpread: 1.6,
    range: 520,
    pellets: 1,
    projectileSpeed: 1000,
    pierce: 0,
    knockback: 60,
    blastRadius: 0,
    kind: "bullet",
    sound: "shot_pistol",
    shake: 1.2,
    recoil: 0.5,
    color: "#2b2f36",
    gunLen: 11,
    gunWidth: 3.2,
  },
  {
    id: "shotgun",
    name: "Espingarda 12",
    slot: 1,
    desc: "8 projéteis por tiro. Devastadora de perto, fraca de longe.",
    price: 500,
    ammoPrice: 110,
    damage: 11,
    fireRate: 1.1,
    mode: "semi",
    magSize: 6,
    reserveAmmo: 30,
    maxReserve: 60,
    reloadTime: 2.3,
    spread: 6.5,
    bloomPerShot: 0,
    bloomMax: 0,
    bloomRecovery: 10,
    moveSpread: 1.5,
    range: 290,
    pellets: 8,
    projectileSpeed: 900,
    pierce: 0,
    knockback: 70,
    blastRadius: 0,
    kind: "pellet",
    sound: "shot_shotgun",
    shake: 5,
    recoil: 1.4,
    color: "#5a3d24",
    gunLen: 17,
    gunWidth: 4,
  },
  {
    id: "smg",
    name: "Submetralhadora Vespa",
    slot: 2,
    desc: "Cadência altíssima, pouca precisão. Ótima contra grupos.",
    price: 900,
    ammoPrice: 140,
    damage: 13,
    fireRate: 14,
    mode: "auto",
    magSize: 32,
    reserveAmmo: 160,
    maxReserve: 320,
    reloadTime: 1.6,
    spread: 2.2,
    bloomPerShot: 0.55,
    bloomMax: 6,
    bloomRecovery: 10,
    moveSpread: 1.8,
    range: 430,
    pellets: 1,
    projectileSpeed: 1100,
    pierce: 0,
    knockback: 25,
    blastRadius: 0,
    kind: "bullet",
    sound: "shot_smg",
    shake: 1.4,
    recoil: 0.4,
    color: "#23272e",
    gunLen: 14,
    gunWidth: 3.6,
  },
  {
    id: "rifle",
    name: "Carabina AR-14",
    slot: 3,
    desc: "Rifle automático preciso e de bom alcance.",
    price: 1400,
    ammoPrice: 180,
    damage: 28,
    fireRate: 8.5,
    mode: "auto",
    magSize: 30,
    reserveAmmo: 150,
    maxReserve: 270,
    reloadTime: 2.0,
    spread: 0.9,
    bloomPerShot: 0.45,
    bloomMax: 4,
    bloomRecovery: 8,
    moveSpread: 1.4,
    range: 720,
    pellets: 1,
    projectileSpeed: 1300,
    pierce: 0,
    knockback: 40,
    blastRadius: 0,
    kind: "bullet",
    sound: "shot_rifle",
    shake: 2.2,
    recoil: 0.7,
    color: "#2f3a2c",
    gunLen: 19,
    gunWidth: 3.6,
  },
  {
    id: "dmr",
    name: "Falcão (Rifle de Precisão)",
    slot: 4,
    desc: "Tiro perfurante: atravessa até 3 zumbis. Muito preciso.",
    price: 2200,
    ammoPrice: 260,
    damage: 85,
    fireRate: 2.4,
    mode: "semi",
    magSize: 10,
    reserveAmmo: 50,
    maxReserve: 100,
    reloadTime: 2.4,
    spread: 0.12,
    bloomPerShot: 0.3,
    bloomMax: 2,
    bloomRecovery: 5,
    moveSpread: 2.2,
    range: 1100,
    pellets: 1,
    projectileSpeed: 1900,
    pierce: 2,
    knockback: 110,
    blastRadius: 0,
    kind: "sniper",
    sound: "shot_sniper",
    shake: 3.4,
    recoil: 1.2,
    color: "#1c2230",
    gunLen: 23,
    gunWidth: 3.4,
  },
  {
    id: "launcher",
    name: "Trovão (Lança-Granadas)",
    slot: 5,
    desc: "Granada explosiva com dano em área. Munição escassa.",
    price: 3500,
    ammoPrice: 450,
    damage: 140,
    fireRate: 0.9,
    mode: "semi",
    magSize: 3,
    reserveAmmo: 15,
    maxReserve: 30,
    reloadTime: 2.8,
    spread: 0.8,
    bloomPerShot: 0,
    bloomMax: 0,
    bloomRecovery: 5,
    moveSpread: 1,
    range: 650,
    pellets: 1,
    projectileSpeed: 540,
    pierce: 0,
    knockback: 220,
    blastRadius: 100,
    kind: "grenade",
    sound: "shot_launcher",
    shake: 6,
    recoil: 1.6,
    color: "#4a2d2d",
    gunLen: 20,
    gunWidth: 6,
  },
];

export const WEAPON_BY_ID: Record<string, WeaponDef> = Object.fromEntries(WEAPONS.map((w) => [w.id, w]));
export const WEAPON_SLOTS = WEAPONS.length;
