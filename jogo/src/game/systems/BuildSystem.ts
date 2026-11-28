import { BARRICADE, TURRET, barricadeCost, turretCost } from "../config/economy";
import { T } from "../maps/types";
import { TILE } from "../core/World";
import { distToRect } from "../core/math";
import type { Structure, StructureType } from "../core/types";
import type { Game } from "../core/Game";

/** Construção de barricadas e torretas: prévia, validação, custo progressivo e reparo. */
export class BuildSystem {
  active: StructureType | null = null;
  built: Record<StructureType, number> = { barricade: 0, turret: 0 };
  ghost = { tx: 0, ty: 0, valid: false, reason: "" };
  private nextId = 1;

  constructor(private g: Game) {}

  cost(type: StructureType) {
    return type === "barricade" ? barricadeCost(this.built.barricade) : turretCost(this.built.turret);
  }

  start(type: StructureType): { ok: boolean; msg: string } {
    const g = this.g;
    const cost = this.cost(type);
    if (!g.economy.canAfford(cost)) {
      g.audio.play("denied");
      return { ok: false, msg: `Moedas insuficientes (${cost})` };
    }
    this.active = type;
    return { ok: true, msg: "Modo de construção" };
  }

  cancel() {
    this.active = null;
  }

  validate(tx: number, ty: number): { valid: boolean; reason: string } {
    const g = this.g;
    const w = g.world;
    if (!w.inBounds(tx, ty) || w.tileType(tx, ty) !== T.FLOOR) return { valid: false, reason: "Local bloqueado" };
    const i = w.idx(tx, ty);
    if (w.structs[i]) return { valid: false, reason: "Já existe uma estrutura" };
    if (w.buyAt[i] >= 0) return { valid: false, reason: "Ponto de compra" };
    for (const s of w.layout.spawns)
      if (Math.hypot(s.tx - tx, s.ty - ty) < BARRICADE.noBuildSpawnRadius) return { valid: false, reason: "Perto de entrada de zumbis" };
    const cx = (tx + 0.5) * TILE;
    const cy = (ty + 0.5) * TILE;
    const p = g.player;
    if (Math.hypot(p.x - cx, p.y - cy) > BARRICADE.buildRange) return { valid: false, reason: "Longe demais" };
    if (distToRect(p.x, p.y, tx * TILE, ty * TILE, TILE, TILE) < p.radius + 1) return { valid: false, reason: "Jogador no local" };
    for (const z of g.zombies)
      if (z.alive && distToRect(z.x, z.y, tx * TILE, ty * TILE, TILE, TILE) < z.radius + 1) return { valid: false, reason: "Zumbi no local" };
    return { valid: true, reason: "" };
  }

  update() {
    const g = this.g;
    if (!this.active) return;
    const inp = g.input;
    this.ghost.tx = Math.floor(g.cross.wx / TILE);
    this.ghost.ty = Math.floor(g.cross.wy / TILE);
    const v = this.validate(this.ghost.tx, this.ghost.ty);
    this.ghost.valid = v.valid;
    this.ghost.reason = v.reason;
    if (inp.rightPressed) {
      this.cancel();
      return;
    }
    if (inp.mousePressed) {
      if (!v.valid) {
        g.audio.play("denied", 0.8);
        g.notify(v.reason, "bad");
      } else this.place(this.active, this.ghost.tx, this.ghost.ty);
    }
  }

  private place(type: StructureType, tx: number, ty: number) {
    const g = this.g;
    const cost = this.cost(type);
    if (!g.economy.spend(cost)) {
      g.audio.play("denied");
      g.notify("Moedas insuficientes", "bad");
      this.cancel();
      return;
    }
    const maxHp = type === "barricade" ? BARRICADE.hp : TURRET.hp;
    const s: Structure = {
      id: this.nextId++,
      type,
      tx,
      ty,
      x: (tx + 0.5) * TILE,
      y: (ty + 0.5) * TILE,
      hp: maxHp,
      maxHp,
      hitFlash: 0,
      alive: true,
      angle: g.player.angle,
      cooldown: 0.5,
      flash: 0,
      retarget: 0,
      target: null,
      attackSoundCd: 0,
    };
    g.structures.push(s);
    g.world.addStructure(s);
    this.built[type]++;
    g.flowDirty = true;
    g.effects.dust(s.x, s.y, 8);
    g.audio.play(type === "barricade" ? "build" : "build_turret", 1);
    g.camera.shake(1.5);
    if (!g.economy.canAfford(this.cost(type))) {
      this.cancel();
      g.notify("Moedas insuficientes para a próxima construção", "info");
    }
  }

  repair(s: Structure): { ok: boolean; msg: string } {
    const g = this.g;
    const cost = s.type === "barricade" ? BARRICADE.repairCost : TURRET.repairCost;
    if (s.hp >= s.maxHp) return { ok: false, msg: "Estrutura em perfeito estado" };
    if (!g.economy.spend(cost)) {
      g.audio.play("denied");
      return { ok: false, msg: `Moedas insuficientes (${cost})` };
    }
    s.hp = Math.min(s.maxHp, s.hp + s.maxHp * BARRICADE.repairAmount);
    g.audio.play("build", 0.8, 1.2);
    g.effects.dust(s.x, s.y, 4);
    return { ok: true, msg: "Reparado!" };
  }

  repairCost(s: Structure) {
    return s.type === "barricade" ? BARRICADE.repairCost : TURRET.repairCost;
  }
}
