/**
 * ECONOMIA, CONSTRUÇÃO, MELHORIAS E JOGADOR — todos os valores de balanceamento ficam aqui.
 */
import type { UpgradeKey } from "./weapons";
import type { ZombieKind } from "./zombies";

export const REWARDS: Record<ZombieKind, number> = {
  common: 10,
  frenetic: 15,
  explosive: 20,
  spitter: 25,
  tank: 35,
  crawler: 12,
};

export const waveBonus = (wave: number) => 25 + wave * 5;

export const PLAYER = {
  hp: 100,
  speed: 185,
  radius: 11,
  regenDelay: 6,
  regenRate: 6,
  accel: 14,
};

/** Barricadas: custo progressivo por quantidade já construída (tabela + passo contínuo). */
export const BARRICADE = {
  costs: [50, 80, 90, 100, 110, 120],
  costStep: 10,
  hp: 220,
  repairCost: 15,
  repairAmount: 0.5,
  buildRange: 230,
  noBuildSpawnRadius: 4, // em tiles
};
export const barricadeCost = (built: number) =>
  built < BARRICADE.costs.length
    ? BARRICADE.costs[built]
    : BARRICADE.costs[BARRICADE.costs.length - 1] + (built - BARRICADE.costs.length + 1) * BARRICADE.costStep;

/** Torretas */
export const TURRET = {
  costs: [300, 450, 650, 900, 1200],
  costStep: 350,
  hp: 260,
  damage: 11,
  range: 270,
  fireRate: 5.5,
  rotSpeed: 6.5,
  bulletSpeed: 1100,
  spread: 1.6,
  repairCost: 40,
};
export const turretCost = (built: number) =>
  built < TURRET.costs.length
    ? TURRET.costs[built]
    : TURRET.costs[TURRET.costs.length - 1] + (built - TURRET.costs.length + 1) * TURRET.costStep;

/** Melhorias de arma (por arma, nível máximo igual para todas). */
export const UPGRADE_MAX = 5;
export const UPGRADES: Record<UpgradeKey, { label: string; desc: string; base: number; perLevel: number }> = {
  damage: { label: "Dano", desc: "+18% de dano por nível", base: 250, perLevel: 0.18 },
  rate: { label: "Cadência", desc: "+10% de cadência por nível", base: 200, perLevel: 0.1 },
  mag: { label: "Carregador", desc: "+20% de capacidade por nível", base: 150, perLevel: 0.2 },
  reload: { label: "Recarga", desc: "-10% no tempo de recarga por nível", base: 150, perLevel: 0.1 },
  accuracy: { label: "Precisão", desc: "-15% de dispersão por nível", base: 150, perLevel: 0.15 },
};
/** Multiplicador de preço por slot (armas melhores = melhorias mais caras). */
export const UPGRADE_TIER_MUL = [0.6, 1, 1.3, 1.6, 2.0, 2.6];
export const upgradeCost = (key: UpgradeKey, level: number, slot: number) =>
  Math.round((UPGRADES[key].base * (level + 1) * (UPGRADE_TIER_MUL[slot] ?? 1)) / 10) * 10;

export const SUPPLIES = {
  medkit: { price: 120 },
  vest: { prices: [300, 500, 750, 1000], hpPer: 25 },
  boots: { prices: [250, 400, 600], speedPer: 0.06 },
};

export const BUYPOINT = { discount: 0.85, ammoMul: 0.6, range: 56 };

export const PICKUPS = { ammoChance: 0.045, healthChance: 0.03, life: 18, ammoFrac: 0.35, healAmount: 30 };
