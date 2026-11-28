import { PLAYER } from "../config/economy";
import { TAU } from "../core/math";
import type { Player } from "../core/types";
import type { Game } from "../core/Game";

export function createPlayer(x: number, y: number): Player {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    radius: PLAYER.radius,
    hp: PLAYER.hp,
    maxHp: PLAYER.hp,
    angle: 0,
    walk: 0,
    moveAngle: 0,
    speedNow: 0,
    alive: true,
    regenT: 0,
    hurtFlash: 0,
    speedMul: 1,
    vestLevel: 0,
    bootsLevel: 0,
    weapons: [],
    slot: 0,
    lastSlot: 0,
    fireCd: 0,
    fireQueued: 0,
    reloadT: 0,
    reloadTotal: 1,
    recoil: 0,
    flash: 0,
    stepDist: 0,
    kills: 0,
  };
}

/** Movimentação (8 direções, suave), colisão, passos, regeneração de vida. */
export class PlayerSystem {
  constructor(private g: Game) {}

  update(dt: number) {
    const g = this.g;
    const p = g.player;
    const inp = g.input;
    p.hurtFlash = Math.max(0, p.hurtFlash - dt * 2.5);
    p.recoil = Math.max(0, p.recoil - dt * 6);
    p.flash = Math.max(0, p.flash - dt);
    if (!p.alive) return;

    let ax = 0;
    let ay = 0;
    if (inp.isDown("moveLeft")) ax -= 1;
    if (inp.isDown("moveRight")) ax += 1;
    if (inp.isDown("moveUp")) ay -= 1;
    if (inp.isDown("moveDown")) ay += 1;
    const len = Math.hypot(ax, ay);
    if (len > 0) {
      ax /= len;
      ay /= len;
    }
    const speed = PLAYER.speed * p.speedMul * (p.reloadT > 0 ? 0.92 : 1);
    const k = Math.min(1, dt * PLAYER.accel);
    p.vx += (ax * speed - p.vx) * k;
    p.vy += (ay * speed - p.vy) * k;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    g.world.resolve(p, p.radius, false);
    p.x = Math.max(p.radius, Math.min(g.world.width - p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(g.world.height - p.radius, p.y));

    p.speedNow = Math.hypot(p.vx, p.vy);
    if (p.speedNow > 12) {
      p.moveAngle = Math.atan2(p.vy, p.vx);
      p.walk = (p.walk + p.speedNow * dt * 0.075) % (TAU * 10);
      p.stepDist += p.speedNow * dt;
      if (p.stepDist > 50) {
        p.stepDist = 0;
        g.audio.play("step", 0.55, 0.9 + Math.random() * 0.2);
      }
    }

    // regeneração lenta depois de um tempo sem dano
    p.regenT += dt;
    if (p.regenT > PLAYER.regenDelay && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + PLAYER.regenRate * dt);
  }
}
