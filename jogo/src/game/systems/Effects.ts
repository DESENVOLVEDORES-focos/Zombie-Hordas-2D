import { Pool } from "../core/Pool";
import { rand, TAU } from "../core/math";
import type { FloatText, Particle } from "../core/types";
import type { World } from "../core/World";

const BLOOD = ["#7a0c0c", "#8e1010", "#5f0909", "#a01414"];

/** Partículas, textos flutuantes e decalques persistentes (sangue/marcas de explosão). */
export class Effects {
  particles = new Pool<Particle>(
    () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, size2: 1, color: "#fff", kind: "dot", drag: 3, rot: 0 }),
    650,
  );
  texts = new Pool<FloatText>(() => ({ x: 0, y: 0, vy: -30, life: 0, max: 1, text: "", color: "#fff", size: 12 }), 40);
  decals: HTMLCanvasElement | null = null;
  private dctx: CanvasRenderingContext2D | null = null;

  constructor(private world: World) {
    if (typeof document !== "undefined") {
      this.decals = document.createElement("canvas");
      this.decals.width = world.width;
      this.decals.height = world.height;
      this.dctx = this.decals.getContext("2d");
    }
  }

  reset() {
    this.particles.clear();
    this.texts.clear();
    this.dctx?.clearRect(0, 0, this.world.width, this.world.height);
  }

  emit(
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    size: number,
    size2: number,
    color: string,
    kind: Particle["kind"] = "dot",
    drag = 3,
    rot = 0,
  ) {
    const p = this.particles.spawn();
    if (!p) return;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = life;
    p.max = life;
    p.size = size;
    p.size2 = size2;
    p.color = color;
    p.kind = kind;
    p.drag = drag;
    p.rot = rot;
  }

  decal(x: number, y: number, rx: number, ry: number, color: string, rot = 0) {
    const c = this.dctx;
    if (!c) return;
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, rx, ry, rot, 0, TAU);
    c.fill();
  }

  bloodSplat(x: number, y: number, size: number, angle?: number) {
    const n = 2 + Math.floor(size / 6);
    for (let i = 0; i < n; i++) {
      const a = angle !== undefined ? angle + rand(-0.7, 0.7) : rand(0, TAU);
      const d = rand(0, size * 1.6);
      this.decal(
        x + Math.cos(a) * d,
        y + Math.sin(a) * d,
        rand(1.5, size * 0.5),
        rand(1.2, size * 0.4),
        `rgba(${90 + Math.floor(rand(0, 50))},${Math.floor(rand(5, 20))},${Math.floor(rand(5, 20))},${rand(0.35, 0.7)})`,
        a,
      );
    }
  }

  blood(x: number, y: number, angle: number, count: number, big = false) {
    for (let i = 0; i < count; i++) {
      const a = angle + rand(-0.55, 0.55);
      const s = rand(60, big ? 280 : 200);
      this.emit(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.25, 0.5), rand(1.5, big ? 3.8 : 2.8), 0.6, BLOOD[i & 3], "dot", 5);
    }
    this.bloodSplat(x + Math.cos(angle) * 6, y + Math.sin(angle) * 6, big ? 14 : 6, angle);
  }

  sparks(x: number, y: number, angle: number, n = 4, color = "#ffd36a") {
    for (let i = 0; i < n; i++) {
      const a = angle + Math.PI + rand(-0.9, 0.9);
      const s = rand(80, 260);
      this.emit(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.08, 0.2), 1.6, 0.5, color, "line", 4, a);
    }
  }

  muzzle(x: number, y: number, angle: number, size: number) {
    this.emit(x, y, 0, 0, 0.06, size, size * 0.4, "#ffe7a0", "flash", 0, angle);
    for (let i = 0; i < 3; i++) {
      const a = angle + rand(-0.35, 0.35);
      const s = rand(150, 380);
      this.emit(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.06, 0.14), 1.5, 0.4, "#ffcf5a", "line", 5, a);
    }
    this.emit(x, y, Math.cos(angle) * 30, Math.sin(angle) * 30, 0.5, 3, 9, "rgba(200,200,200,0.35)", "smoke", 2);
  }

  shell(x: number, y: number, angle: number) {
    const a = angle + Math.PI / 2 + rand(-0.4, 0.4);
    const s = rand(60, 130);
    this.emit(x, y, Math.cos(a) * s, Math.sin(a) * s, 0.5, 2, 2, "#d9a93a", "shell", 6, rand(0, TAU));
  }

  explosion(x: number, y: number, r: number) {
    this.emit(x, y, 0, 0, 0.45, r * 0.15, r, "rgba(255,170,60,0.9)", "ring", 0);
    this.emit(x, y, 0, 0, 0.14, r * 0.5, r * 0.7, "#fff1b8", "flash", 0, 0);
    for (let i = 0; i < 22; i++) {
      const a = rand(0, TAU);
      const s = rand(60, r * 3);
      this.emit(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.3, 0.7), rand(3, 7), 1, i % 2 ? "#ff8a1f" : "#ffd23a", "dot", 3);
    }
    for (let i = 0; i < 12; i++) {
      const a = rand(0, TAU);
      const s = rand(20, r * 1.2);
      this.emit(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.8, 1.6), 6, rand(18, 34), "rgba(40,40,40,0.5)", "smoke", 2);
    }
    this.decal(x, y, r * 0.55, r * 0.5, "rgba(0,0,0,0.38)");
    this.decal(x, y, r * 0.3, r * 0.28, "rgba(0,0,0,0.3)");
  }

  debris(x: number, y: number, color: string, n: number) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      const s = rand(40, 200);
      this.emit(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.3, 0.8), rand(2, 4), 1, color, "shell", 4, rand(0, TAU));
    }
  }

  acid(x: number, y: number, r: number) {
    for (let i = 0; i < 12; i++) {
      const a = rand(0, TAU);
      const s = rand(30, 120);
      this.emit(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.25, 0.5), rand(2, 3.5), 0.5, i % 2 ? "#a6ff3c" : "#6fd12a", "dot", 5);
    }
    this.decal(x, y, r * 0.8, r * 0.7, "rgba(80,140,30,0.25)");
  }

  dust(x: number, y: number, n = 6) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      this.emit(x, y, Math.cos(a) * rand(10, 60), Math.sin(a) * rand(10, 60), rand(0.4, 0.8), 3, 12, "rgba(180,170,150,0.35)", "smoke", 3);
    }
  }

  text(x: number, y: number, text: string, color = "#fff", size = 12) {
    const t = this.texts.spawn();
    if (!t) return;
    t.x = x + rand(-6, 6);
    t.y = y;
    t.vy = -38;
    t.life = 0.8;
    t.max = 0.8;
    t.text = text;
    t.color = color;
    t.size = size;
  }

  update(dt: number) {
    const ps = this.particles.items;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life -= dt;
      if (p.life <= 0) {
        // sangue "assenta" no chão ao terminar
        if (p.kind === "dot" && p.size > 2.2 && BLOOD.includes(p.color))
          this.decal(p.x, p.y, p.size * 0.9, p.size * 0.7, "rgba(100,10,10,0.5)");
        this.particles.removeAt(i);
        continue;
      }
      const k = Math.exp(-p.drag * dt);
      p.vx *= k;
      p.vy *= k;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    const ts = this.texts.items;
    for (let i = ts.length - 1; i >= 0; i--) {
      const t = ts[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.texts.removeAt(i);
        continue;
      }
      t.y += t.vy * dt;
      t.vy *= Math.exp(-2 * dt);
    }
  }
}
