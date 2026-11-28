/**
 * CONFIGURAÇÃO DE HORDAS E DIFICULDADE — curvas facilmente ajustáveis.
 */
import { ZOMBIE_LIST, type ZombieKind } from "./zombies";

export type Difficulty = "easy" | "normal" | "hard";

export const DIFFICULTIES: Record<
  Difficulty,
  { label: string; desc: string; count: number; hp: number; damage: number; speed: number; reward: number; startCoins: number }
> = {
  easy: { label: "Recruta", desc: "Menos zumbis, mais moedas iniciais.", count: 0.8, hp: 0.85, damage: 0.8, speed: 0.95, reward: 1.1, startCoins: 300 },
  normal: { label: "Sobrevivente", desc: "A experiência balanceada.", count: 1, hp: 1, damage: 1, speed: 1, reward: 1, startCoins: 200 },
  hard: { label: "Pesadelo", desc: "Hordas grandes, inimigos mais fortes.", count: 1.25, hp: 1.2, damage: 1.25, speed: 1.05, reward: 0.9, startCoins: 120 },
};

export const WAVE = {
  firstDelay: 5,
  intermission: 9,
  /** quantidade total de zumbis na horda */
  count: (w: number) => Math.round(4 + 2 * w + 0.06 * w * w),
  /** máximo de zumbis vivos simultaneamente */
  maxAlive: (w: number) => Math.min(60, Math.round(8 + w * 1.8)),
  /** intervalo entre spawns (s) */
  spawnInterval: (w: number) => Math.max(0.3, 1.6 - w * 0.04),
  hpMul: (w: number) => Math.min(6, 1 + 0.05 * (w - 1) + 0.0015 * (w - 1) * (w - 1)),
  speedMul: (w: number) => 1 + Math.min(0.3, 0.007 * (w - 1)),
  damageMul: (w: number) => 1 + Math.min(0.6, 0.012 * (w - 1)),
  commonWeight: (w: number) => Math.max(35, 100 - w * 1.2),
};

function weightedPick(kinds: ZombieKind[], weights: number[]): ZombieKind {
  let total = 0;
  for (const w of weights) total += w;
  let r = Math.random() * total;
  for (let i = 0; i < kinds.length; i++) {
    r -= weights[i];
    if (r <= 0) return kinds[i];
  }
  return kinds[0];
}

/** Gera a lista (fila) de zumbis que serão liberados na horda. */
export function buildWaveQueue(wave: number, countMul = 1): ZombieKind[] {
  const total = Math.max(3, Math.round(WAVE.count(wave) * countMul));
  const unlocked = ZOMBIE_LIST.filter((z) => z.minWave <= wave);
  const kinds = unlocked.map((z) => z.kind);
  const weights = unlocked.map((z) => (z.kind === "common" ? WAVE.commonWeight(wave) : z.weight));
  const queue: ZombieKind[] = [];

  // Hordas de "surto": a cada 5 hordas (a partir da 10) entram reforços especiais garantidos
  if (wave >= 10 && wave % 5 === 0) {
    const n = Math.floor(wave / 5);
    const special: ZombieKind = wave >= 15 ? "tank" : "frenetic";
    for (let i = 0; i < n; i++) queue.push(special);
    if (wave >= 20) for (let i = 0; i < Math.floor(n / 2); i++) queue.push(wave % 10 === 0 ? "explosive" : "spitter");
  }
  while (queue.length < total) queue.push(weightedPick(kinds, weights));
  // embaralha, mas mantém os tanques mais para o final
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  queue.sort((a, b) => (a === "tank" ? 1 : 0) - (b === "tank" ? 1 : 0) + (Math.random() - 0.5) * 0.001);
  return queue;
}
