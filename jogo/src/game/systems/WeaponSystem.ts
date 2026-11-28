import { UPGRADES } from "../config/economy";
import { WEAPONS, WEAPON_SLOTS, type WeaponDef } from "../config/weapons";
import type { Action } from "../config/controls";
import { DEG, gauss, rand } from "../core/math";
import type { WeaponState } from "../core/types";
import type { Game } from "../core/Game";

export interface WeaponStats {
  damage: number;
  fireRate: number;
  magSize: number;
  reloadTime: number;
  accMul: number;
}

/** Arsenal do jogador: inventário por slot, munição, recarga, disparo e melhorias. */
export class WeaponSystem {
  constructor(private g: Game) {}

  giveStarting() {
    this.give(WEAPONS[0]);
  }

  give(def: WeaponDef) {
    const ws: WeaponState = {
      def,
      levels: { damage: 0, rate: 0, mag: 0, reload: 0, accuracy: 0 },
      mag: def.magSize,
      reserve: def.reserveAmmo,
      bloom: 0,
    };
    this.g.player.weapons[def.slot] = ws;
    this.select(def.slot, true);
  }

  current(): WeaponState {
    const p = this.g.player;
    return p.weapons[p.slot]!;
  }

  stats(ws: WeaponState): WeaponStats {
    const L = ws.levels;
    const d = ws.def;
    return {
      damage: d.damage * (1 + UPGRADES.damage.perLevel * L.damage),
      fireRate: d.fireRate * (1 + UPGRADES.rate.perLevel * L.rate),
      magSize: Math.ceil(d.magSize * (1 + UPGRADES.mag.perLevel * L.mag)),
      reloadTime: d.reloadTime * Math.pow(1 - UPGRADES.reload.perLevel, L.reload),
      accMul: Math.pow(1 - UPGRADES.accuracy.perLevel, L.accuracy),
    };
  }

  select(slot: number, force = false): boolean {
    const p = this.g.player;
    if (!p.weapons[slot]) return false;
    if (slot === p.slot && !force) return false;
    if (slot !== p.slot) p.lastSlot = p.slot;
    p.slot = slot;
    p.reloadT = 0;
    p.fireCd = Math.max(p.fireCd, 0.18);
    p.fireQueued = 0;
    this.g.audio.play("empty", 0.7, 0.7);
    return true;
  }

  startReload() {
    const g = this.g;
    const p = g.player;
    const ws = this.current();
    const st = this.stats(ws);
    if (p.reloadT > 0 || ws.mag >= st.magSize || ws.reserve <= 0) return;
    p.reloadT = st.reloadTime;
    p.reloadTotal = st.reloadTime;
    g.audio.play("reload", 0.9, 0.85 + 0.3 / Math.max(0.6, st.reloadTime));
  }

  private finishReload() {
    const ws = this.current();
    const st = this.stats(ws);
    const take = Math.min(st.magSize - ws.mag, ws.reserve);
    ws.mag += take;
    ws.reserve -= take;
  }

  refill(ws: WeaponState) {
    ws.reserve = ws.def.maxReserve;
    ws.mag = this.stats(ws).magSize;
  }

  addReserve(ws: WeaponState, amount: number) {
    ws.reserve = Math.min(ws.def.maxReserve, ws.reserve + amount);
  }

  update(dt: number) {
    const g = this.g;
    const p = g.player;
    const inp = g.input;
    if (!p.alive) return;
    const ws = this.current();
    const st = this.stats(ws);
    p.fireCd = Math.max(0, p.fireCd - dt);
    p.fireQueued = Math.max(0, p.fireQueued - dt);
    ws.bloom = Math.max(0, ws.bloom - ws.def.bloomRecovery * dt);

    for (let i = 0; i < WEAPON_SLOTS; i++) if (inp.wasPressed(`weapon${i + 1}` as Action)) this.select(i);
    if (inp.wasPressed("lastWeapon")) this.select(p.lastSlot);
    if (inp.wheel !== 0) this.cycle(inp.wheel > 0 ? 1 : -1);

    if (p.reloadT > 0) {
      p.reloadT -= dt;
      if (p.reloadT <= 0) {
        p.reloadT = 0;
        this.finishReload();
      }
    } else if (inp.wasPressed("reload")) this.startReload();

    if (g.build.active) return;
    if (inp.mousePressed) p.fireQueued = 0.12;
    const auto = ws.def.mode === "auto";
    const trigger = auto ? inp.mouseDown : p.fireQueued > 0;
    if (trigger && p.reloadT <= 0 && p.fireCd <= 0) {
      if (ws.mag > 0) {
        this.fire(ws, st);
        p.fireQueued = 0;
      } else if (ws.reserve > 0) {
        this.startReload();
      } else {
        g.audio.play("empty", 1);
        p.fireCd = 0.3;
        p.fireQueued = 0;
        g.notify("Sem munição! Compre mais na loja ou em um ponto de compra.", "bad");
      }
    }
  }

  private cycle(dir: number) {
    const p = this.g.player;
    let s = p.slot;
    for (let i = 0; i < WEAPON_SLOTS; i++) {
      s = (s + dir + WEAPON_SLOTS) % WEAPON_SLOTS;
      if (p.weapons[s]) {
        this.select(s);
        return;
      }
    }
  }

  private fire(ws: WeaponState, st: WeaponStats) {
    const g = this.g;
    const p = g.player;
    const def = ws.def;
    ws.mag--;
    p.fireCd = 1 / st.fireRate;
    const moving = p.speedNow > 25;
    const spread = ((def.spread + (moving ? def.moveSpread : 0)) * st.accMul + ws.bloom) * DEG;
    const cos = Math.cos(p.angle);
    const sin = Math.sin(p.angle);
    const sx = p.x + cos * 9;
    const sy = p.y + sin * 9;
    for (let i = 0; i < def.pellets; i++) {
      const multi = def.pellets > 1;
      g.combat.fire({
        x: sx,
        y: sy,
        angle: p.angle + gauss() * spread,
        speed: def.projectileSpeed * (multi ? rand(0.88, 1.1) : 1),
        range: def.range * (multi ? rand(0.85, 1.05) : 1),
        damage: st.damage,
        owner: "player",
        kind: def.kind,
        pierce: def.pierce,
        knock: def.knockback,
        blast: def.blastRadius,
      });
    }
    ws.bloom = Math.min(def.bloomMax, ws.bloom + def.bloomPerShot * st.accMul);
    const mx = p.x + cos * (def.gunLen + 8);
    const my = p.y + sin * (def.gunLen + 8);
    g.effects.muzzle(mx, my, p.angle, def.kind === "grenade" ? 15 : def.pellets > 1 ? 14 : 10);
    if (def.kind !== "grenade" && def.pellets === 1) g.effects.shell(p.x + cos * 6, p.y + sin * 6, p.angle);
    p.flash = 0.06;
    p.recoil = def.recoil;
    g.camera.shake(def.shake);
    g.audio.play(def.sound, 1, rand(0.95, 1.05));
    if (ws.mag === 0 && ws.reserve > 0) this.startReload();
  }
}
