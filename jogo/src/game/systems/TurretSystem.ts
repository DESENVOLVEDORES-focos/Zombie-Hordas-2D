import { TURRET } from "../config/economy";
import { DEG, angleDiff, gauss, rotateToward } from "../core/math";
import type { Structure } from "../core/types";
import type { Game } from "../core/Game";

/** Torretas automáticas: detectam alvos dentro do alcance, giram, atiram e trocam de alvo. */
export class TurretSystem {
  constructor(private g: Game) {}

  update(dt: number) {
    const g = this.g;
    for (const s of g.structures) {
      if (s.type !== "turret" || !s.alive) continue;
      s.cooldown -= dt;
      s.flash -= dt;
      s.retarget -= dt;
      s.hitFlash = Math.max(0, s.hitFlash - dt);
      s.attackSoundCd -= dt;
      this.validateTarget(s);
      if (!s.target || s.retarget <= 0) {
        s.retarget = 0.25;
        this.acquire(s);
      }
      const t = s.target;
      if (!t) {
        s.angle += dt * 0.6;
        continue;
      }
      const desired = Math.atan2(t.y - s.y, t.x - s.x);
      s.angle = rotateToward(s.angle, desired, TURRET.rotSpeed * dt);
      const d = Math.hypot(t.x - s.x, t.y - s.y);
      if (s.cooldown <= 0 && Math.abs(angleDiff(s.angle, desired)) < 0.08 && d <= TURRET.range) {
        s.cooldown = 1 / TURRET.fireRate;
        s.flash = 0.06;
        const a = s.angle + gauss() * TURRET.spread * DEG;
        g.combat.fire({
          x: s.x + Math.cos(s.angle) * 14,
          y: s.y + Math.sin(s.angle) * 14,
          angle: a,
          speed: TURRET.bulletSpeed,
          range: TURRET.range + 24,
          damage: TURRET.damage,
          owner: "turret",
          kind: "turret",
          knock: 25,
        });
        g.effects.muzzle(s.x + Math.cos(s.angle) * 18, s.y + Math.sin(s.angle) * 18, s.angle, 7);
        g.sfxAt("turret", s.x, s.y, 0.7, 1);
      }
    }
  }

  private inRange(s: Structure, x: number, y: number) {
    return Math.hypot(x - s.x, y - s.y) <= TURRET.range;
  }

  private validateTarget(s: Structure) {
    const t = s.target;
    if (!t) return;
    if (!t.alive || !this.inRange(s, t.x, t.y) || this.g.world.raycast(s.x, s.y, t.x, t.y, "bullet") >= 0) s.target = null;
  }

  private acquire(s: Structure) {
    const g = this.g;
    let best: (typeof s)["target"] = null;
    let bd = Infinity;
    for (const z of g.zombies) {
      if (!z.alive || z.spawnT < 0.6) continue;
      const d = Math.hypot(z.x - s.x, z.y - s.y);
      if (d > TURRET.range || d >= bd) continue;
      if (g.world.raycast(s.x, s.y, z.x, z.y, "bullet") >= 0) continue; // sem linha de tiro
      bd = d;
      best = z;
    }
    s.target = best;
  }
}
