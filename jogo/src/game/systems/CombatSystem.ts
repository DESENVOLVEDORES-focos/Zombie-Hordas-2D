import { PICKUPS } from "../config/economy";
import { Pool } from "../core/Pool";
import { chance, clamp, rand } from "../core/math";
import type { Projectile, ProjectileOwner, Zombie } from "../core/types";
import type { Game } from "../core/Game";

export interface FireOpts {
  x: number;
  y: number;
  angle: number;
  speed: number;
  range: number;
  damage: number;
  owner: ProjectileOwner;
  kind: Projectile["kind"];
  pierce?: number;
  knock?: number;
  blast?: number;
  puddle?: { radius: number; time: number; dps: number };
}

export interface ExplodeOpts {
  radius: number;
  zombieDamage?: number;
  playerDamage?: number;
  structDamage?: number;
  knock?: number;
}

/** t∈[0,1] da primeira interseção do segmento com o círculo, ou -1 */
function segCircle(x0: number, y0: number, x1: number, y1: number, cx: number, cy: number, r: number): number {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const fx = x0 - cx;
  const fy = y0 - cy;
  const c = fx * fx + fy * fy - r * r;
  if (c <= 0) return 0;
  const a = dx * dx + dy * dy;
  if (a < 1e-9) return -1;
  const b = 2 * (fx * dx + fy * dy);
  const disc = b * b - 4 * a * c;
  if (disc < 0) return -1;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= 0 && t <= 1 ? t : -1;
}

const KIND_STYLE: Record<Projectile["kind"], { color: string; size: number; radius: number }> = {
  bullet: { color: "#ffe9a8", size: 2, radius: 2 },
  pellet: { color: "#ffd98a", size: 1.6, radius: 2 },
  sniper: { color: "#bfe8ff", size: 2.4, radius: 2.5 },
  grenade: { color: "#ff9f43", size: 5, radius: 4 },
  spit: { color: "#a6ff3c", size: 6, radius: 6 },
  turret: { color: "#9ff0ff", size: 2, radius: 2 },
};

/** Projéteis, explosões, dano, mortes, poças de ácido e itens coletáveis. */
export class CombatSystem {
  projectiles = new Pool<Projectile>(
    () => ({
      x: 0, y: 0, dx: 1, dy: 0, speed: 0, dist: 0, range: 0, damage: 0, owner: "player", kind: "bullet", radius: 2,
      pierce: 0, hit: [], knock: 0, blast: 0, color: "#fff", size: 2, puddleRadius: 0, puddleTime: 0, puddleDps: 0,
    }),
    320,
  );

  constructor(private g: Game) {}

  reset() {
    this.projectiles.clear();
  }

  fire(o: FireOpts): Projectile | null {
    const p = this.projectiles.spawn();
    if (!p) return null;
    const st = KIND_STYLE[o.kind];
    p.x = o.x;
    p.y = o.y;
    p.dx = Math.cos(o.angle);
    p.dy = Math.sin(o.angle);
    p.speed = o.speed;
    p.dist = 0;
    p.range = o.range;
    p.damage = o.damage;
    p.owner = o.owner;
    p.kind = o.kind;
    p.radius = st.radius;
    p.pierce = o.pierce ?? 0;
    p.hit.length = 0;
    p.knock = o.knock ?? 0;
    p.blast = o.blast ?? 0;
    p.color = st.color;
    p.size = st.size;
    p.puddleRadius = o.puddle?.radius ?? 0;
    p.puddleTime = o.puddle?.time ?? 0;
    p.puddleDps = o.puddle?.dps ?? 0;
    return p;
  }

  update(dt: number) {
    const g = this.g;
    const w = g.world;
    const items = this.projectiles.items;
    for (let i = items.length - 1; i >= 0; i--) {
      const p = items[i];
      let seg = p.speed * dt;
      let ended = false;
      if (p.dist + seg >= p.range) {
        seg = Math.max(0, p.range - p.dist);
        ended = true;
      }
      const nx = p.x + p.dx * seg;
      const ny = p.y + p.dy * seg;
      const tw = w.raycast(p.x, p.y, nx, ny, "bullet");
      const wallT = tw < 0 ? 2 : tw;
      let remove = false;
      let ex = nx;
      let ey = ny;
      let hitWall = false;

      if (p.owner === "zombie") {
        const pl = g.player;
        if (pl.alive) {
          const t = segCircle(p.x, p.y, nx, ny, pl.x, pl.y, pl.radius + p.radius);
          if (t >= 0 && t <= wallT) {
            ex = p.x + (nx - p.x) * t;
            ey = p.y + (ny - p.y) * t;
            g.damagePlayer(p.damage, p.x, p.y);
            remove = true;
          }
        }
      } else {
        let guard = 0;
        for (;;) {
          let best: Zombie | null = null;
          let bestT = Infinity;
          const zs = g.zombies;
          for (let k = 0; k < zs.length; k++) {
            const z = zs[k];
            if (!z.alive || z.spawnT < 0.35 || p.hit.includes(z.id)) continue;
            const rr = z.radius + p.radius;
            if (Math.abs(z.x - p.x) > rr + seg + 2 && Math.abs(z.x - nx) > rr + seg + 2) continue;
            const t = segCircle(p.x, p.y, nx, ny, z.x, z.y, rr);
            if (t >= 0 && t < bestT) {
              bestT = t;
              best = z;
            }
          }
          if (!best || bestT > wallT) break;
          ex = p.x + (nx - p.x) * bestT;
          ey = p.y + (ny - p.y) * bestT;
          p.hit.push(best.id);
          if (p.blast > 0) {
            remove = true;
            break;
          }
          g.damageZombie(best, p.damage, Math.atan2(p.dy, p.dx), p.knock, ex, ey);
          if (p.pierce <= 0) {
            remove = true;
            break;
          }
          p.pierce--;
          p.damage *= 0.8;
          if (++guard > 6) break;
        }
      }

      if (!remove && wallT <= 1) {
        remove = true;
        hitWall = true;
        ex = p.x + (nx - p.x) * wallT;
        ey = p.y + (ny - p.y) * wallT;
      }
      if (!remove && ended) remove = true;

      if (remove) {
        if (p.blast > 0) {
          this.explode(ex, ey, { radius: p.blast, zombieDamage: p.damage, knock: p.knock });
        } else if (p.owner === "zombie") {
          this.puddle(ex, ey, p);
        } else if (hitWall) {
          g.effects.sparks(ex, ey, Math.atan2(p.dy, p.dx), 3);
        }
        this.projectiles.removeAt(i);
      } else {
        p.x = nx;
        p.y = ny;
        p.dist += seg;
      }
    }
    this.updateHazards(dt);
    this.updatePickups(dt);
  }

  private puddle(x: number, y: number, p: Projectile) {
    const g = this.g;
    if (p.puddleRadius <= 0) return;
    g.effects.acid(x, y, p.puddleRadius);
    g.sfxAt("hit_wood", x, y, 0.4, 2);
    if (g.hazards.length < 40) g.hazards.push({ x, y, r: p.puddleRadius, life: p.puddleTime, max: p.puddleTime, dps: p.puddleDps * g.dmgScale() });
  }

  explode(x: number, y: number, o: ExplodeOpts) {
    const g = this.g;
    const p = g.player;
    g.effects.explosion(x, y, o.radius);
    g.sfxAt("explosion", x, y, 1, rand(0.9, 1.1));
    const dp = Math.hypot(p.x - x, p.y - y);
    g.camera.shake(clamp(14 - dp / 45, 2, 12));
    if (o.zombieDamage) {
      for (const z of g.zombies) {
        if (!z.alive) continue;
        const d = Math.hypot(z.x - x, z.y - y);
        if (d - z.radius < o.radius) {
          const f = 1 - 0.65 * clamp(d / o.radius, 0, 1);
          g.damageZombie(z, o.zombieDamage * f, Math.atan2(z.y - y, z.x - x), (o.knock ?? 0) * f, z.x, z.y);
        }
      }
    }
    if (o.playerDamage && p.alive && dp < o.radius + p.radius) {
      g.damagePlayer(o.playerDamage * (1 - 0.6 * clamp(dp / o.radius, 0, 1)), x, y);
    }
    if (o.structDamage) {
      for (let i = g.structures.length - 1; i >= 0; i--) {
        const s = g.structures[i];
        const d = Math.hypot(s.x - x, s.y - y);
        if (d < o.radius + 16) g.damageStructure(s, o.structDamage * (1 - 0.5 * clamp(d / o.radius, 0, 1)));
      }
    }
  }

  killZombie(z: Zombie, angle: number) {
    if (!z.alive) return;
    const g = this.g;
    z.alive = false;
    z.deathT = 0;
    z.target = null;
    if (z.pendDmg >= 1) {
      g.effects.text(z.x, z.y - 14, String(Math.round(z.pendDmg)), "#ffffff", 11);
      z.pendDmg = 0;
    }
    if (!z.selfDestruct) {
      const r = g.economy.rewardFor(z.kind);
      g.economy.add(r);
      g.player.kills++;
      g.effects.text(z.x, z.y - 22, `+${r}`, "#ffd54a", 14);
      if (chance(PICKUPS.ammoChance)) g.pickups.push({ x: z.x, y: z.y, kind: "ammo", life: PICKUPS.life, t: 0 });
      else if (chance(PICKUPS.healthChance)) g.pickups.push({ x: z.x, y: z.y, kind: "health", life: PICKUPS.life, t: 0 });
    }
    g.effects.blood(z.x, z.y, angle, z.kind === "tank" ? 26 : 14, true);
    g.effects.bloodSplat(z.x, z.y, z.kind === "tank" ? 26 : 15);
    g.sfxAt("zombie_die", z.x, z.y, 0.9, z.kind === "tank" ? 0.6 : z.kind === "frenetic" ? 1.3 : rand(0.9, 1.1));
    if (z.kind === "explosive" && !z.selfDestruct) g.zombieSys.explodeZombie(z, 0.7);
    g.camera.shake(z.kind === "tank" ? 3 : 0.8);
  }

  private updateHazards(dt: number) {
    const g = this.g;
    const p = g.player;
    for (let i = g.hazards.length - 1; i >= 0; i--) {
      const h = g.hazards[i];
      h.life -= dt;
      if (h.life <= 0) {
        g.hazards.splice(i, 1);
        continue;
      }
      if (Math.random() < dt * 5) g.effects.emit(h.x + rand(-h.r, h.r) * 0.7, h.y + rand(-h.r, h.r) * 0.7, 0, -14, 0.6, 2, 0.5, "#9be33a", "dot", 1);
      if (p.alive && Math.hypot(p.x - h.x, p.y - h.y) < h.r + p.radius * 0.5) g.damagePlayer(h.dps * dt, h.x, h.y, true);
      for (const s of g.structures) if (Math.hypot(s.x - h.x, s.y - h.y) < h.r + 12) g.damageStructure(s, h.dps * 0.6 * dt, true);
    }
  }

  private updatePickups(dt: number) {
    const g = this.g;
    const p = g.player;
    for (let i = g.pickups.length - 1; i >= 0; i--) {
      const k = g.pickups[i];
      k.life -= dt;
      k.t += dt;
      if (k.life <= 0) {
        g.pickups.splice(i, 1);
        continue;
      }
      if (!p.alive || Math.hypot(p.x - k.x, p.y - k.y) > p.radius + 12) continue;
      if (k.kind === "ammo") {
        const ws = g.weapons.current();
        g.weapons.addReserve(ws, Math.ceil(ws.def.maxReserve * PICKUPS.ammoFrac));
        g.notify("+ Munição", "ok");
      } else {
        if (p.hp >= p.maxHp) continue;
        p.hp = Math.min(p.maxHp, p.hp + PICKUPS.healAmount);
        g.notify("+ Vida", "ok");
      }
      g.audio.play("pickup", 0.9);
      g.pickups.splice(i, 1);
    }
  }
}
