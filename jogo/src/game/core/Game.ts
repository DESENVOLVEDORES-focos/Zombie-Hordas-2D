import { BUYPOINT } from "../config/economy";
import { prettyKey, type Action } from "../config/controls";
import { DIFFICULTIES, type Difficulty, WAVE } from "../config/waves";
import { WEAPONS, WEAPON_BY_ID } from "../config/weapons";
import { FlowField } from "../ai/FlowField";
import type { AudioEngine } from "../audio/AudioEngine";
import { TILE, type MapDef, type BuyPoint } from "../maps/types";
import { BuildSystem } from "../systems/BuildSystem";
import { Camera } from "../systems/Camera";
import { CombatSystem } from "../systems/CombatSystem";
import { EconomySystem } from "../systems/EconomySystem";
import { Effects } from "../systems/Effects";
import { PlayerSystem, createPlayer } from "../systems/PlayerSystem";
import { ShopSystem } from "../systems/ShopSystem";
import { TurretSystem } from "../systems/TurretSystem";
import { WaveSystem } from "../systems/WaveSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import { ZombieSystem } from "../systems/ZombieSystem";
import { Input } from "./Input";
import { clamp } from "./math";
import type { GameResult, GameState, HudState, Hazard, Pickup, Player, ShopCategory, Structure, Zombie } from "./types";
import { World } from "./World";

export interface GameOptions {
  map: MapDef;
  difficulty: Difficulty;
  audio: AudioEngine;
  bindings: Record<Action, string>;
  getSensitivity: () => number;
  canvas?: HTMLCanvasElement;
}

/** Orquestrador: cria o mundo, conecta todos os sistemas e executa o loop principal. */
export class Game {
  map: MapDef;
  world: World;
  diff: (typeof DIFFICULTIES)[Difficulty];
  difficulty: Difficulty;
  audio: AudioEngine;
  input: Input;
  camera = new Camera();
  effects: Effects;
  economy: EconomySystem;
  player: Player;

  zombies: Zombie[] = [];
  corpses: Zombie[] = [];
  structures: Structure[] = [];
  hazards: Hazard[] = [];
  pickups: Pickup[] = [];

  flowNormal: FlowField;
  flowCrawl: FlowField;
  flowDirty = true;
  private flowT = 0;
  private flowTile = -1;

  playerSys: PlayerSystem;
  weapons: WeaponSystem;
  combat: CombatSystem;
  zombieSys: ZombieSystem;
  waves: WaveSystem;
  build: BuildSystem;
  turrets: TurretSystem;
  shop: ShopSystem;

  state: GameState = "playing";
  time = 0;
  inputLocked = false;
  shopTab: ShopCategory = "weapons";
  cross = { sx: 0, sy: 0, wx: 0, wy: 0 };
  prompt: { text: string; ok: boolean; bp: BuyPoint | null; struct: Structure | null } = { text: "", ok: true, bp: null, struct: null };

  onGameOver: ((r: GameResult) => void) | null = null;
  onChange: (() => void) | null = null;
  onRender: ((g: Game) => void) | null = null;

  private toast: HudState["toast"] = null;
  private toastId = 0;
  private toastT = 0;
  private getSens: () => number;
  private running = false;
  private raf = 0;
  private last = 0;

  constructor(o: GameOptions) {
    this.map = o.map;
    this.difficulty = o.difficulty;
    this.diff = DIFFICULTIES[o.difficulty];
    this.audio = o.audio;
    this.getSens = o.getSensitivity;
    this.world = new World(o.map);
    this.input = new Input(o.bindings);
    this.effects = new Effects(this.world);
    this.economy = new EconomySystem(this.diff.startCoins, this.diff.reward);
    const sp = this.world.layout.playerSpawn;
    this.player = createPlayer((sp.tx + 0.5) * TILE, (sp.ty + 0.5) * TILE);
    this.flowNormal = new FlowField(this.world, false);
    this.flowCrawl = new FlowField(this.world, true);

    this.playerSys = new PlayerSystem(this);
    this.weapons = new WeaponSystem(this);
    this.combat = new CombatSystem(this);
    this.zombieSys = new ZombieSystem(this);
    this.waves = new WaveSystem(this);
    this.build = new BuildSystem(this);
    this.turrets = new TurretSystem(this);
    this.shop = new ShopSystem(this);

    this.weapons.giveStarting();
    this.camera.snap(this.player.x, this.player.y, this.world);
    this.refreshFlow(0, true);
    this.cross.wx = this.player.x + 60;
    this.cross.wy = this.player.y;
    if (o.canvas) this.input.attach(o.canvas);
  }

  // ---------------- ciclo de vida ----------------
  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.audio.startMusic(this.map.theme.musicRoot, 0);
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.033, (now - this.last) / 1000);
      this.last = now;
      this.update(dt);
      this.onRender?.(this);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.input.detach();
    this.audio.stopMusic();
  }

  resize(w: number, h: number) {
    this.camera.resize(w, h);
  }

  // ---------------- atualização ----------------
  update(dt: number) {
    if (!this.inputLocked) this.handleGlobalKeys();
    if (this.toastT > 0) this.toastT -= dt;
    if (this.state === "playing") {
      this.time += dt;
      this.updateAim();
      this.playerSys.update(dt);
      this.weapons.update(dt);
      this.build.update();
      this.updateInteract();
      this.refreshFlow(dt);
      this.waves.update(dt);
      this.zombieSys.update(dt);
      this.turrets.update(dt);
      this.combat.update(dt);
      for (const s of this.structures) {
        s.hitFlash = Math.max(0, s.hitFlash - dt);
        s.attackSoundCd -= dt;
      }
      this.effects.update(dt);
      this.camera.follow(this.player.x, this.player.y, this.cross.wx, this.cross.wy, this.world, dt);
    } else if (this.state !== "gameover") {
      this.updateAim();
    } else {
      this.effects.update(dt);
      this.camera.follow(this.player.x, this.player.y, this.player.x, this.player.y, this.world, dt);
    }
    this.input.endStep();
  }

  private handleGlobalKeys() {
    const inp = this.input;
    if (this.state === "gameover") return;
    if (inp.wasPressed("pause")) {
      if (this.state === "playing") {
        if (this.build.active) this.build.cancel();
        else this.setState("paused");
      } else if (this.state === "paused") this.resume();
      else if (this.state === "shop") this.closeShop();
    }
    if (inp.wasPressed("shop")) {
      if (this.state === "playing") this.openShop();
      else if (this.state === "shop") this.closeShop();
    }
    if (this.state === "playing") {
      if (inp.wasPressed("barricade")) this.toggleBuild("barricade");
      if (inp.wasPressed("turret")) this.toggleBuild("turret");
    }
  }

  private toggleBuild(type: "barricade" | "turret") {
    if (this.build.active === type) {
      this.build.cancel();
      return;
    }
    const r = this.build.start(type);
    if (!r.ok) this.notify(r.msg, "bad");
  }

  setState(s: GameState) {
    if (this.state === s) return;
    this.state = s;
    this.input.mouseDown = false;
    this.onChange?.();
  }
  pause() {
    if (this.state === "playing") this.setState("paused");
  }
  resume() {
    if (this.state === "paused" || this.state === "shop") this.setState("playing");
  }
  openShop(tab?: ShopCategory) {
    if (this.state !== "playing" || !this.player.alive) return;
    this.build.cancel();
    if (tab) this.shopTab = tab;
    this.setState("shop");
  }
  closeShop() {
    if (this.state === "shop") this.setState("playing");
  }

  /** Mira: posição relativa ao jogador multiplicada pela sensibilidade. */
  private updateAim() {
    const cam = this.camera;
    const p = this.player;
    const ps = { x: cam.toScreenX(p.x), y: cam.toScreenY(p.y) };
    const sens = this.getSens();
    const sx = clamp(ps.x + (this.input.mouseX - ps.x) * sens, 0, cam.canvasW);
    const sy = clamp(ps.y + (this.input.mouseY - ps.y) * sens, 0, cam.canvasH);
    this.cross.sx = sx;
    this.cross.sy = sy;
    this.cross.wx = cam.toWorldX(sx);
    this.cross.wy = cam.toWorldY(sy);
    if (p.alive && this.state === "playing") p.angle = Math.atan2(this.cross.wy - p.y, this.cross.wx - p.x);
  }

  /** Recalcula o campo de fluxo quando o jogador muda de tile ou estruturas mudam. */
  refreshFlow(dt: number, force = false) {
    this.flowT -= dt;
    const w = this.world;
    const p = this.player;
    const tx = clamp(Math.floor(p.x / TILE), 0, w.cols - 1);
    const ty = clamp(Math.floor(p.y / TILE), 0, w.rows - 1);
    const tile = ty * w.cols + tx;
    if (force || this.flowDirty || (tile !== this.flowTile && this.flowT <= 0)) {
      this.flowNormal.compute(tx, ty);
      this.flowCrawl.compute(tx, ty);
      this.flowTile = tile;
      this.flowT = 0.12;
      this.flowDirty = false;
    }
  }

  // ---------------- interação ----------------
  private updateInteract() {
    const p = this.player;
    const inp = this.input;
    this.prompt.text = "";
    this.prompt.bp = null;
    this.prompt.struct = null;
    if (!p.alive || this.build.active) return;
    const key = prettyKey(inp.bindings.interact);
    let best: BuyPoint | null = null;
    let bd = BUYPOINT.range;
    for (const bp of this.world.layout.buyPoints) {
      const d = Math.hypot(p.x - (bp.tx + 0.5) * TILE, p.y - (bp.ty + 0.5) * TILE);
      if (d < bd) {
        bd = d;
        best = bp;
      }
    }
    if (best) {
      const info = this.shop.buyPointInfo(best);
      this.prompt.text = `[${key}] ${info.text}${info.price ? ` — ${info.price}` : ""}`;
      this.prompt.ok = info.can;
      this.prompt.bp = best;
    } else {
      let bs: Structure | null = null;
      let sd = 58;
      for (const s of this.structures) {
        if (s.hp >= s.maxHp) continue;
        const d = Math.hypot(p.x - s.x, p.y - s.y);
        if (d < sd) {
          sd = d;
          bs = s;
        }
      }
      if (bs) {
        const cost = this.build.repairCost(bs);
        this.prompt.text = `[${key}] Reparar ${bs.type === "barricade" ? "barricada" : "torreta"} — ${cost}`;
        this.prompt.ok = this.economy.canAfford(cost);
        this.prompt.struct = bs;
      }
    }
    if (inp.wasPressed("interact")) {
      if (this.prompt.bp) {
        const r = this.shop.useBuyPoint(this.prompt.bp);
        if (r.msg) this.notify(r.msg, r.ok ? "ok" : "bad");
      } else if (this.prompt.struct) {
        const r = this.build.repair(this.prompt.struct);
        this.notify(r.msg, r.ok ? "ok" : "bad");
      }
    }
  }

  // ---------------- dano / eventos ----------------
  dmgScale() {
    return WAVE.damageMul(Math.max(1, this.waves.wave)) * this.diff.damage;
  }

  damagePlayer(amount: number, sx: number, sy: number, continuous = false) {
    const p = this.player;
    if (!p.alive || this.state === "gameover" || amount <= 0) return;
    p.hp -= amount;
    p.regenT = 0;
    if (!continuous) {
      p.hurtFlash = 1;
      this.camera.shake(5);
      this.audio.play("player_hurt", 1);
      this.effects.blood(p.x, p.y, Math.atan2(p.y - sy, p.x - sx), 6);
    } else p.hurtFlash = Math.max(p.hurtFlash, 0.4);
    if (p.hp <= 0) {
      p.hp = 0;
      p.alive = false;
      this.gameOver();
    }
  }

  damageZombie(z: Zombie, dmg: number, angle: number, knock: number, hx: number, hy: number) {
    if (!z.alive) return;
    z.hp -= dmg;
    z.hitFlash = 0.1;
    z.pendDmg += dmg;
    const kb = knock * (1 - z.def.knockbackResist);
    z.kx += Math.cos(angle) * kb;
    z.ky += Math.sin(angle) * kb;
    this.effects.blood(hx, hy, angle, Math.min(6, 2 + Math.floor(dmg / 14)));
    this.sfxAt("zombie_hurt", z.x, z.y, 0.6, z.kind === "tank" ? 0.6 : 0.9 + Math.random() * 0.3);
    if (z.hp <= 0) this.combat.killZombie(z, angle);
  }

  damageStructure(s: Structure, amount: number, silent = false) {
    if (!s.alive) return;
    s.hp -= amount;
    s.hitFlash = 0.12;
    if (!silent && s.attackSoundCd <= 0) {
      s.attackSoundCd = 0.3;
      this.sfxAt("hit_wood", s.x, s.y, 0.9, s.type === "turret" ? 1.7 : 1);
      this.effects.debris(s.x, s.y, s.type === "turret" ? "#9aa0aa" : "#8a6a3a", 2);
    }
    if (s.hp <= 0) this.destroyStructure(s);
  }

  private destroyStructure(s: Structure) {
    s.alive = false;
    this.world.removeStructure(s);
    const i = this.structures.indexOf(s);
    if (i >= 0) this.structures.splice(i, 1);
    this.flowDirty = true;
    this.effects.debris(s.x, s.y, s.type === "barricade" ? "#9a7440" : "#8a8f99", 16);
    this.effects.dust(s.x, s.y, 10);
    this.sfxAt("break", s.x, s.y, 1);
    this.notify(s.type === "barricade" ? "Barricada destruída!" : "Torreta destruída!", "bad");
  }

  /** som posicional simples (atenuação por distância ao jogador) */
  sfxAt(name: string, x: number, y: number, vol = 1, pitch = 1) {
    const d = Math.hypot(x - this.player.x, y - this.player.y);
    const v = clamp(1 - d / 680, 0, 1);
    this.audio.play(name, vol * Math.pow(v, 1.3), pitch);
  }

  notify(text: string, kind: "ok" | "bad" | "info" = "info") {
    this.toast = { id: ++this.toastId, text, kind };
    this.toastT = 2.4;
  }

  private gameOver() {
    this.setState("gameover");
    this.build.cancel();
    this.audio.play("gameover");
    this.audio.stopMusic();
    this.onGameOver?.({
      mapId: this.map.id,
      wave: this.waves.wave,
      kills: this.player.kills,
      coins: this.economy.earned,
      time: this.time,
    });
  }

  // ---------------- interface ----------------
  getHud(): HudState {
    const p = this.player;
    const ws = p.weapons[p.slot]!;
    const st = this.weapons.stats(ws);
    const b = this.build;
    const k = this.input.bindings;
    return {
      state: this.state,
      wave: this.waves.wave,
      phase: this.waves.phase,
      countdown: Math.max(0, Math.ceil(this.waves.timer)),
      zombiesLeft: this.waves.remaining(),
      coins: this.economy.coins,
      hp: Math.ceil(p.hp),
      maxHp: p.maxHp,
      weaponName: ws.def.name,
      weaponId: ws.def.id,
      ammo: ws.mag,
      reserve: ws.reserve,
      reloading: p.reloadT > 0,
      reloadProgress: p.reloadT > 0 ? 1 - p.reloadT / Math.max(0.01, st.reloadTime) : 0,
      slots: WEAPONS.map((d) => ({ slot: d.slot, owned: !!p.weapons[d.slot], name: d.name, active: p.slot === d.slot, id: d.id })),
      prompt: this.prompt.text,
      promptOk: this.prompt.ok,
      announce: this.waves.announce,
      toast: this.toastT > 0 ? this.toast : null,
      build: b.active ? { type: b.active, cost: b.cost(b.active), valid: b.ghost.valid, reason: b.ghost.reason } : null,
      barricadeCost: b.cost("barricade"),
      turretCost: b.cost("turret"),
      kills: p.kills,
      time: this.time,
      keys: {
        barricade: prettyKey(k.barricade),
        turret: prettyKey(k.turret),
        shop: prettyKey(k.shop),
        interact: prettyKey(k.interact),
        reload: prettyKey(k.reload),
        pause: prettyKey(k.pause),
      },
    };
  }

  weaponName(id: string) {
    return WEAPON_BY_ID[id]?.name ?? id;
  }
}
