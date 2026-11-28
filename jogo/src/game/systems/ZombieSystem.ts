import { ZOMBIES, type ZombieBehavior, type ZombieKind } from "../config/zombies";
import { WAVE } from "../config/waves";
import { TAU, clamp, distToRect, rand, rotateToward } from "../core/math";
import { TILE } from "../core/World";
import type { Zombie } from "../core/types";
import type { Game } from "../core/Game";

class SpatialHash {
  cell = 48;
  cols: number;
  rows: number;
  head: Int32Array;
  nxt = new Int32Array(512);
  constructor(w: number, h: number) {
    this.cols = Math.ceil(w / this.cell);
    this.rows = Math.ceil(h / this.cell);
    this.head = new Int32Array(this.cols * this.rows);
  }
  rebuild(zs: Zombie[]) {
    this.head.fill(-1);
    if (this.nxt.length < zs.length) this.nxt = new Int32Array(zs.length * 2);
    for (let i = 0; i < zs.length; i++) {
      const z = zs[i];
      if (!z.alive) continue;
      const c = this.cellOf(z.x, z.y);
      this.nxt[i] = this.head[c];
      this.head[c] = i;
    }
  }
  cellOf(x: number, y: number) {
    const cx = clamp(Math.floor(x / this.cell), 0, this.cols - 1);
    const cy = clamp(Math.floor(y / this.cell), 0, this.rows - 1);
    return cy * this.cols + cx;
  }
}

type Behavior = (z: Zombie, dt: number, d: number, dx: number, dy: number) => void;

/** Criação, comportamento (IA) e animação dos zumbis. Novos tipos: adicione em config/zombies.ts. */
export class ZombieSystem {
  private hash: SpatialHash;
  private nextId = 1;
  private dirX = 0;
  private dirY = 0;
  private behaviors: Record<ZombieBehavior, Behavior>;

  constructor(private g: Game) {
    this.hash = new SpatialHash(g.world.width, g.world.height);
    this.behaviors = {
      melee: (z, dt, d, dx, dy) => this.melee(z, dt, d, dx, dy),
      crawler: (z, dt, d, dx, dy) => this.crawlerAI(z, dt, d, dx, dy),
      explosive: (z, dt, d, dx, dy) => this.explosiveAI(z, dt, d, dx, dy),
      ranged: (z, dt, d, dx, dy) => this.rangedAI(z, dt, d, dx, dy),
    };
  }

  create(kind: ZombieKind, x: number, y: number): Zombie {
    const g = this.g;
    const def = ZOMBIES[kind];
    const w = Math.max(1, g.waves.wave);
    const d = g.diff;
    const hp = def.hp * WAVE.hpMul(w) * d.hp;
    return {
      id: this.nextId++,
      kind,
      def,
      x,
      y,
      kx: 0,
      ky: 0,
      radius: def.radius,
      hp,
      maxHp: hp,
      speed: def.speed * WAVE.speedMul(w) * d.speed * rand(0.92, 1.08),
      damage: def.damage * WAVE.damageMul(w) * d.damage,
      angle: rand(0, TAU),
      walk: rand(0, 6),
      attackCd: 0.6,
      attackWind: 0,
      swing: 0,
      hitFlash: 0,
      target: null,
      fuse: -1,
      spitCd: rand(1, def.ranged?.cooldown ?? 2),
      lungeT: 0,
      lungeCd: rand(0.5, 2),
      lungeDx: 0,
      lungeDy: 0,
      groanT: rand(1, 7),
      stuckT: 0,
      stuckX: x,
      stuckY: y,
      wanderT: 0,
      wanderAng: 0,
      losT: 0,
      hasLos: false,
      sight: false,
      alive: true,
      deathT: 0,
      spawnT: 0,
      pendDmg: 0,
      dmgTextCd: 0,
      crawler: def.crossLow,
      selfDestruct: false,
      wants: false,
    };
  }

  spawn(kind: ZombieKind, x: number, y: number) {
    const z = this.create(kind, x, y);
    this.g.zombies.push(z);
    this.g.effects.dust(x, y, 5);
    return z;
  }

  update(dt: number) {
    const g = this.g;
    const zs = g.zombies;
    this.hash.rebuild(zs);
    for (let i = 0; i < zs.length; i++) {
      const z = zs[i];
      if (z.alive) this.updateOne(z, i, dt);
    }
    // move mortos para a lista de cadáveres
    for (let i = zs.length - 1; i >= 0; i--) {
      if (!zs[i].alive) {
        g.corpses.push(zs[i]);
        zs[i] = zs[zs.length - 1];
        zs.pop();
      }
    }
    const cs = g.corpses;
    for (let i = cs.length - 1; i >= 0; i--) {
      cs[i].deathT += dt;
      if (cs[i].deathT > 1.6) {
        cs[i] = cs[cs.length - 1];
        cs.pop();
      }
    }
    if (cs.length > 60) cs.splice(0, cs.length - 60);
  }

  private updateOne(z: Zombie, idx: number, dt: number) {
    const g = this.g;
    const p = g.player;
    z.hitFlash = Math.max(0, z.hitFlash - dt);
    z.swing = Math.max(0, z.swing - dt * 3);
    z.attackCd -= dt;
    z.lungeCd -= dt;
    z.dmgTextCd -= dt;
    z.wants = false;
    if (z.pendDmg >= 1 && z.dmgTextCd <= 0) {
      g.effects.text(z.x, z.y - z.radius - 6, String(Math.round(z.pendDmg)), z.pendDmg > 60 ? "#ffb347" : "#ffffff", z.pendDmg > 60 ? 13 : 11);
      z.pendDmg = 0;
      z.dmgTextCd = 0.2;
    }
    this.applyKnock(z, dt);
    if (z.spawnT < 1) {
      z.spawnT = Math.min(1, z.spawnT + dt / 0.7);
      return;
    }
    z.groanT -= dt;
    if (z.groanT <= 0) {
      z.groanT = rand(4, 11);
      g.sfxAt("zombie_groan", z.x, z.y, 0.55, z.kind === "tank" ? 0.62 : z.kind === "frenetic" ? 1.45 : z.kind === "crawler" ? 1.15 : rand(0.9, 1.1));
    }
    if (!p.alive) {
      z.angle += dt * 0.5;
      return;
    }
    const dx = p.x - z.x;
    const dy = p.y - z.y;
    const d = Math.hypot(dx, dy) || 0.001;
    this.behaviors[z.def.behavior](z, dt, d, dx, dy);
    this.separate(z, idx, d, dx, dy);

    // detecção de travamento
    z.stuckT += dt;
    if (z.stuckT >= 0.7) {
      const moved = Math.hypot(z.x - z.stuckX, z.y - z.stuckY);
      if (z.wants && moved < 5 && z.wanderT <= 0 && !z.target && z.attackWind <= 0 && z.fuse < 0) {
        z.wanderT = 0.6;
        z.wanderAng = z.angle + (Math.random() < 0.5 ? 1 : -1) * (Math.PI / 2 + rand(-0.4, 0.4));
      }
      z.stuckT = 0;
      z.stuckX = z.x;
      z.stuckY = z.y;
    }
  }

  private applyKnock(z: Zombie, dt: number) {
    if (Math.abs(z.kx) + Math.abs(z.ky) < 1) return;
    z.x += z.kx * dt;
    z.y += z.ky * dt;
    this.g.world.resolve(z, z.radius, z.crawler);
    const k = Math.exp(-9 * dt);
    z.kx *= k;
    z.ky *= k;
  }

  private separate(z: Zombie, idx: number, d: number, dx: number, dy: number) {
    const g = this.g;
    const h = this.hash;
    const zs = g.zombies;
    const cx = clamp(Math.floor(z.x / h.cell), 0, h.cols - 1);
    const cy = clamp(Math.floor(z.y / h.cell), 0, h.rows - 1);
    for (let yy = Math.max(0, cy - 1); yy <= Math.min(h.rows - 1, cy + 1); yy++) {
      for (let xx = Math.max(0, cx - 1); xx <= Math.min(h.cols - 1, cx + 1); xx++) {
        for (let j = h.head[yy * h.cols + xx]; j !== -1; j = h.nxt[j]) {
          if (j === idx) continue;
          const o = zs[j];
          if (!o.alive) continue;
          const ox = z.x - o.x;
          const oy = z.y - o.y;
          const min = (z.radius + o.radius) * 0.82;
          const d2 = ox * ox + oy * oy;
          if (d2 >= min * min) continue;
          const dd = Math.sqrt(d2) || 0.01;
          const push = (min - dd) * 0.5;
          z.x += (ox / dd) * push;
          z.y += (oy / dd) * push;
        }
      }
    }
    // afasta do jogador (sem empurrá-lo)
    const pr = z.radius + g.player.radius * 0.8;
    if (d < pr) {
      z.x -= (dx / d) * (pr - d);
      z.y -= (dy / d) * (pr - d);
    }
    g.world.resolve(z, z.radius, z.crawler);
  }

  // ---------- navegação ----------
  /** Define a direção desejada (this.dirX/Y) e z.target (estrutura que bloqueia o caminho). */
  private steer(z: Zombie, dt: number) {
    const g = this.g;
    const w = g.world;
    const p = g.player;
    z.target = null;
    if (z.wanderT > 0) {
      z.wanderT -= dt;
      this.dirX = Math.cos(z.wanderAng);
      this.dirY = Math.sin(z.wanderAng);
      return;
    }
    z.losT -= dt;
    const dx = p.x - z.x;
    const dy = p.y - z.y;
    const d = Math.hypot(dx, dy) || 0.001;
    if (z.losT <= 0) {
      z.losT = 0.18 + Math.random() * 0.1;
      z.hasLos = d < 640 && w.clearPath(z.x, z.y, p.x, p.y, z.radius, z.crawler ? "crawl" : "move");
      z.sight = w.raycast(z.x, z.y, p.x, p.y, "bullet") < 0;
    }
    if (z.hasLos) {
      this.dirX = dx / d;
      this.dirY = dy / d;
      return;
    }
    const field = z.crawler ? g.flowCrawl : g.flowNormal;
    const tx = clamp(Math.floor(z.x / TILE), 0, w.cols - 1);
    const ty = clamp(Math.floor(z.y / TILE), 0, w.rows - 1);
    const nx = field.next[ty * w.cols + tx];
    if (nx < 0) {
      this.dirX = dx / d;
      this.dirY = dy / d;
      return;
    }
    const s = w.structs[nx];
    if (s && s.alive) z.target = s;
    const cx = ((nx % w.cols) + 0.5) * TILE;
    const cy = (Math.floor(nx / w.cols) + 0.5) * TILE;
    const ddx = cx - z.x;
    const ddy = cy - z.y;
    const dd = Math.hypot(ddx, ddy) || 1;
    this.dirX = ddx / dd;
    this.dirY = ddy / dd;
  }

  private move(z: Zombie, dirX: number, dirY: number, speed: number, dt: number) {
    z.x += dirX * speed * dt;
    z.y += dirY * speed * dt;
    this.g.world.resolve(z, z.radius, z.crawler);
    z.angle = rotateToward(z.angle, Math.atan2(dirY, dirX), 9 * dt);
    z.walk += speed * dt * 0.11;
    z.wants = true;
  }

  private face(z: Zombie, dx: number, dy: number, dt: number) {
    z.angle = rotateToward(z.angle, Math.atan2(dy, dx), 10 * dt);
  }

  /** ataca a estrutura bloqueando o caminho, se estiver encostado nela. Retorna true se atacou. */
  private attackStructure(z: Zombie, dt: number): boolean {
    const s = z.target;
    if (!s || !s.alive) return false;
    const ds = distToRect(z.x, z.y, s.x - TILE / 2, s.y - TILE / 2, TILE, TILE);
    if (ds > z.radius + 7) return false;
    this.face(z, s.x - z.x, s.y - z.y, dt);
    if (z.attackCd <= 0) {
      z.attackCd = Math.max(0.5, z.def.attackCooldown);
      z.swing = 1;
      this.g.damageStructure(s, Math.max(6, z.damage) * z.def.structureDamageMul);
    }
    return true;
  }

  // ---------- comportamentos ----------
  private melee(z: Zombie, dt: number, d: number, dx: number, dy: number) {
    const g = this.g;
    const p = g.player;
    const reach = z.radius + p.radius + z.def.attackRange;
    if (z.attackWind > 0) {
      z.attackWind -= dt;
      this.face(z, dx, dy, dt);
      if (z.attackWind <= 0) {
        if (d <= reach * 1.25 + 4) {
          g.damagePlayer(z.damage, z.x, z.y);
          g.sfxAt("zombie_attack", z.x, z.y, 0.7, z.kind === "tank" ? 0.6 : rand(0.9, 1.1));
        }
      }
      return;
    }
    this.steer(z, dt);
    if (z.target && d > reach && this.attackStructure(z, dt)) return;
    if (d <= reach) {
      this.face(z, dx, dy, dt);
      if (z.attackCd <= 0) {
        z.attackCd = z.def.attackCooldown;
        z.attackWind = z.def.attackWindup;
        z.swing = 1;
      }
      return;
    }
    this.move(z, this.dirX, this.dirY, z.speed, dt);
  }

  private crawlerAI(z: Zombie, dt: number, d: number, dx: number, dy: number) {
    const g = this.g;
    const p = g.player;
    const lg = z.def.lunge!;
    const reach = z.radius + p.radius + z.def.attackRange;
    if (z.lungeT > 0) {
      z.lungeT -= dt;
      this.move(z, z.lungeDx, z.lungeDy, z.speed * lg.speedMul, dt);
      if (d <= reach + 3) {
        z.lungeT = 0;
        z.attackCd = z.def.attackCooldown;
        z.swing = 1;
        g.damagePlayer(z.damage * 1.4, z.x, z.y);
        g.sfxAt("zombie_attack", z.x, z.y, 0.7, 1.3);
      }
      return;
    }
    if (z.attackWind <= 0 && z.hasLos && d < lg.trigger && d > reach + 10 && z.lungeCd <= 0 && z.attackCd <= 0) {
      z.lungeT = lg.duration;
      z.lungeCd = lg.cooldown;
      z.lungeDx = dx / d;
      z.lungeDy = dy / d;
      g.sfxAt("zombie_groan", z.x, z.y, 0.5, 1.7);
      return;
    }
    this.melee(z, dt, d, dx, dy);
  }

  private explosiveAI(z: Zombie, dt: number, d: number, dx: number, dy: number) {
    const g = this.g;
    const ex = z.def.explosion!;
    if (z.fuse >= 0) {
      const before = Math.floor(z.fuse / 0.15);
      z.fuse -= dt;
      if (Math.floor(z.fuse / 0.15) !== before) g.sfxAt("fuse", z.x, z.y, 0.6, 1 + (ex.fuse - z.fuse));
      this.face(z, dx, dy, dt);
      if (z.fuse <= 0) {
        z.selfDestruct = true;
        this.explodeZombie(z, 1);
        g.combat.killZombie(z, z.angle);
      }
      return;
    }
    this.steer(z, dt);
    const nearStruct = z.target && z.target.alive && distToRect(z.x, z.y, z.target.x - 16, z.target.y - 16, TILE, TILE) < ex.trigger * 0.55;
    if (d < ex.trigger || nearStruct) {
      z.fuse = ex.fuse;
      g.sfxAt("fuse", z.x, z.y, 0.7, 1);
      return;
    }
    this.move(z, this.dirX, this.dirY, z.speed, dt);
  }

  private rangedAI(z: Zombie, dt: number, d: number, dx: number, dy: number) {
    const g = this.g;
    const r = z.def.ranged!;
    z.spitCd -= dt;
    this.steer(z, dt);
    if (z.sight && d < r.range && !z.target) {
      this.face(z, dx, dy, dt);
      if (d < r.keepDistance * 0.75) this.move(z, -dx / d, -dy / d, z.speed * 0.95, dt);
      else if (d > r.keepDistance * 1.2) this.move(z, dx / d, dy / d, z.speed * 0.8, dt);
      if (z.spitCd <= 0 && d > 50) {
        z.spitCd = r.cooldown * rand(0.9, 1.25);
        z.swing = 1;
        const p = g.player;
        const lead = d / r.projectileSpeed;
        const tx = p.x + p.vx * lead * 0.6;
        const ty = p.y + p.vy * lead * 0.6;
        const ang = Math.atan2(ty - z.y, tx - z.x);
        g.combat.fire({
          x: z.x + Math.cos(ang) * 10,
          y: z.y + Math.sin(ang) * 10,
          angle: ang,
          speed: r.projectileSpeed,
          range: clamp(Math.hypot(tx - z.x, ty - z.y), 70, r.range + 40),
          damage: r.damage * g.dmgScale(),
          owner: "zombie",
          kind: "spit",
          puddle: { radius: r.puddleRadius, time: r.puddleTime, dps: r.puddleDps },
        });
        g.sfxAt("spit", z.x, z.y, 0.8, rand(0.9, 1.1));
      }
      return;
    }
    if (z.target && this.attackStructure(z, dt)) return;
    if (d < 60) {
      this.move(z, -dx / d, -dy / d, z.speed, dt);
      return;
    }
    this.move(z, this.dirX, this.dirY, z.speed, dt);
  }

  explodeZombie(z: Zombie, scale: number) {
    const ex = z.def.explosion;
    if (!ex) return;
    this.g.combat.explode(z.x, z.y, {
      radius: ex.radius,
      playerDamage: ex.damage * this.g.dmgScale() * scale,
      structDamage: ex.structureDamage * scale,
    });
  }
}
