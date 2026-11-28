import { REWARDS } from "../config/economy";
import type { ZombieKind } from "../config/zombies";

/** Dinheiro: saldo, recompensas por abate e validação de gastos. */
export class EconomySystem {
  coins: number;
  earned = 0;

  constructor(
    start: number,
    private rewardMul: number,
  ) {
    this.coins = start;
  }

  add(n: number) {
    this.coins += n;
    this.earned += n;
  }
  canAfford(n: number) {
    return this.coins >= n;
  }
  /** Desconta o valor se houver saldo. Retorna false (sem alterar nada) se faltar dinheiro. */
  spend(n: number): boolean {
    if (n > this.coins) return false;
    this.coins -= n;
    return true;
  }
  rewardFor(kind: ZombieKind) {
    return Math.max(1, Math.round(REWARDS[kind] * this.rewardMul));
  }
}
