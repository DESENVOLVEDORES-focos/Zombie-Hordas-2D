import { waveBonus } from "../config/economy";
import { WAVE, buildWaveQueue } from "../config/waves";
import { TILE } from "../core/World";
import { rand } from "../core/math";
import type { ZombieKind } from "../config/zombies";
import type { Game } from "../core/Game";

/** Controle de hordas: contagem, spawns, progressão de dificuldade e transições. */
export class WaveSystem {
  wave = 0;
  phase: "countdown" | "active" | "intermission" = "countdown";
  timer = WAVE.firstDelay;
  queue: ZombieKind[] = [];
  spawnT = 0;
  announce: { id: number; title: string; sub: string } | null = null;
  private announceId = 0;

  constructor(private g: Game) {}

  aliveCount() {
    let n = 0;
    for (const z of this.g.zombies) if (z.alive) n++;
    return n;
  }
  remaining() {
    return this.queue.length + this.aliveCount();
  }

  private say(title: string, sub: string) {
    this.announce = { id: ++this.announceId, title, sub };
  }

  update(dt: number) {
    if (this.phase !== "active") {
      this.timer -= dt;
      if (this.timer <= 0) this.startWave();
      return;
    }
    const alive = this.aliveCount();
    this.spawnT -= dt;
    if (this.queue.length && alive < WAVE.maxAlive(this.wave) && this.spawnT <= 0) {
      this.spawnOne();
      this.spawnT = WAVE.spawnInterval(this.wave) * rand(0.8, 1.2);
    }
    if (!this.queue.length && alive === 0) this.finishWave();
  }

  private startWave() {
    const g = this.g;
    this.wave++;
    this.queue = buildWaveQueue(this.wave, g.diff.count);
    this.phase = "active";
    this.spawnT = 0.8;
    this.say(`HORDA ${this.wave}`, `${this.queue.length} infectados se aproximam`);
    g.audio.play("wave_start", 1);
    g.audio.setIntensity(this.wave >= 10 ? 2 : this.wave >= 4 ? 1 : this.wave >= 2 ? 0.5 : 0);
    g.camera.shake(3);
  }

  private finishWave() {
    const g = this.g;
    const bonus = waveBonus(this.wave);
    g.economy.add(bonus);
    this.phase = "intermission";
    this.timer = WAVE.intermission;
    this.say("HORDA CONCLUÍDA", `+${bonus} moedas · próxima horda em ${WAVE.intermission}s`);
    g.audio.play("wave_end", 1);
    g.notify(`Horda ${this.wave} concluída! +${bonus} moedas`, "ok");
  }

  private spawnOne() {
    const g = this.g;
    const p = g.player;
    const w = g.world;
    const kind = this.queue.pop()!;
    const crawler = kind === "crawler";
    const field = crawler ? g.flowCrawl : g.flowNormal;
    const pts = w.layout.spawns
      .map((s) => ({ x: (s.tx + 0.5) * TILE, y: (s.ty + 0.5) * TILE, ok: field.cost[s.ty * w.cols + s.tx] < Infinity }))
      .filter((s) => s.ok);
    if (!pts.length) return;
    let far = pts.filter((s) => Math.hypot(s.x - p.x, s.y - p.y) >= 340);
    if (!far.length) {
      const best = pts.reduce((a, b) => (Math.hypot(a.x - p.x, a.y - p.y) > Math.hypot(b.x - p.x, b.y - p.y) ? a : b));
      far = [best];
    }
    const s = far[Math.floor(Math.random() * far.length)];
    g.zombieSys.spawn(kind, s.x + rand(-8, 8), s.y + rand(-8, 8));
  }
}
