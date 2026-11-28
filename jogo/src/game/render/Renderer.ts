import { BARRICADE, TURRET } from "../config/economy";
import { WEAPON_BY_ID } from "../config/weapons";
import type { Game } from "../core/Game";
import { DEG, clamp } from "../core/math";
import type { Structure } from "../core/types";
import { TILE } from "../core/World";
import { MAP_SS, renderStaticMap } from "./mapRender";
import { drawBarricade, drawBuyPad, drawPickup, drawPlayer, drawTurret, drawZombie } from "./sprites";

const BUY_COLORS: Record<string, string> = { weapon: "#ff9f43", ammo: "#e0c040", medic: "#ff5a5a", upgrade: "#4cc9f0" };
const EYE: Record<string, string> = {
  common: "#ff4a3a",
  frenetic: "#ff1f1f",
  explosive: "#ffb02e",
  spitter: "#b6ff3c",
  tank: "#ff7a2e",
  crawler: "#ffe45c",
};

/** Desenha o jogo em Canvas 2D (visão top-down). Não altera nenhum estado da simulação. */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private mapCv: HTMLCanvasElement;
  private light: HTMLCanvasElement;
  private lctx: CanvasRenderingContext2D;
  private ghost: Structure = {
    id: 0, type: "barricade", tx: 0, ty: 0, x: 0, y: 0, hp: 1, maxHp: 1, hitFlash: 0, alive: true,
    angle: 0, cooldown: 0, flash: 0, retarget: 0, target: null, attackSoundCd: 0,
  };

  constructor(
    private canvas: HTMLCanvasElement,
    g: Game,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.mapCv = renderStaticMap(g.world);
    this.light = document.createElement("canvas");
    this.lctx = this.light.getContext("2d")!;
  }

  render(g: Game) {
    const cv = this.canvas;
    const ctx = this.ctx;
    const cam = g.camera;
    if (cv.width !== cam.canvasW || cv.height !== cam.canvasH) g.resize(cv.width, cv.height);
    const W = cv.width;
    const H = cv.height;
    const sc = cam.scale;
    const t = performance.now() / 1000;
    const world = g.world;
    const theme = world.def.theme;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    const cx = cam.x + cam.shakeX;
    const cy = cam.y + cam.shakeY;
    ctx.setTransform(sc, 0, 0, sc, W / 2 - cx * sc, H / 2 - cy * sc);

    const hx = cam.viewW / 2 + 48;
    const hy = cam.viewH / 2 + 48;
    const inView = (x: number, y: number, m = 0) => Math.abs(x - cx) < hx + m && Math.abs(y - cy) < hy + m;

    // ---- cenário + decalques
    const x0 = Math.max(0, Math.floor(cx - cam.viewW / 2) - 2);
    const y0 = Math.max(0, Math.floor(cy - cam.viewH / 2) - 2);
    const x1 = Math.min(world.width, Math.ceil(cx + cam.viewW / 2) + 2);
    const y1 = Math.min(world.height, Math.ceil(cy + cam.viewH / 2) + 2);
    if (x1 > x0 && y1 > y0) {
      ctx.drawImage(this.mapCv, x0 * MAP_SS, y0 * MAP_SS, (x1 - x0) * MAP_SS, (y1 - y0) * MAP_SS, x0, y0, x1 - x0, y1 - y0);
      if (g.effects.decals) ctx.drawImage(g.effects.decals, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
    }

    // ---- poças de ácido
    for (const h of g.hazards) {
      if (!inView(h.x, h.y, 40)) continue;
      const a = Math.min(1, h.life / 1.2) * 0.55;
      ctx.fillStyle = `rgba(110,200,40,${a})`;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r * (0.9 + Math.sin(t * 5 + h.x) * 0.06), 0, 6.3);
      ctx.fill();
      ctx.strokeStyle = `rgba(190,255,90,${a})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // ---- pontos de compra
    const pl = g.player;
    for (const bp of world.layout.buyPoints) {
      const bx = (bp.tx + 0.5) * TILE;
      const by = (bp.ty + 0.5) * TILE;
      if (!inView(bx, by, 20)) continue;
      const near = g.prompt.bp === bp;
      drawBuyPad(ctx, bx, by, bp.kind, BUY_COLORS[bp.kind], near, t, bp.weaponId ? WEAPON_BY_ID[bp.weaponId] : undefined);
    }

    for (const k of g.pickups) if (inView(k.x, k.y)) drawPickup(ctx, k);

    // ---- cadáveres
    for (const z of g.corpses) if (inView(z.x, z.y, 30)) drawZombie(ctx, z, t);

    // ---- estruturas
    for (const s of g.structures) {
      if (!inView(s.x, s.y, 20)) continue;
      if (s.type === "barricade") drawBarricade(ctx, s);
      else drawTurret(ctx, s);
    }

    // ---- zumbis (rastejantes por baixo)
    for (const z of g.zombies) if (z.kind === "crawler" && inView(z.x, z.y, 30)) drawZombie(ctx, z, t);
    for (const z of g.zombies) if (z.kind !== "crawler" && inView(z.x, z.y, 30)) drawZombie(ctx, z, t);

    // ---- jogador
    drawPlayer(ctx, pl, pl.weapons[pl.slot]!.def, !pl.alive);

    // ---- projéteis
    ctx.lineCap = "round";
    for (const p of g.combat.projectiles.items) {
      if (!inView(p.x, p.y)) continue;
      if (p.kind === "grenade") {
        ctx.fillStyle = "#3b3b3b";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, 6.3);
        ctx.fill();
        ctx.fillStyle = "#ff9f43";
        ctx.beginPath();
        ctx.arc(p.x - p.dx * 4, p.y - p.dy * 4, 2.5 + Math.sin(t * 40) * 0.8, 0, 6.3);
        ctx.fill();
      } else if (p.kind === "spit") {
        ctx.fillStyle = "rgba(160,255,60,0.9)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5 + Math.sin(t * 20) * 1, 0, 6.3);
        ctx.fill();
        ctx.fillStyle = "rgba(220,255,150,0.8)";
        ctx.beginPath();
        ctx.arc(p.x - 1, p.y - 1, 2, 0, 6.3);
        ctx.fill();
      } else {
        const len = p.kind === "sniper" ? 38 : p.kind === "pellet" ? 8 : p.kind === "turret" ? 14 : 16;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.moveTo(p.x - p.dx * Math.min(len, p.dist + 4), p.y - p.dy * Math.min(len, p.dist + 4));
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // ---- partículas
    for (const p of g.effects.particles.items) {
      if (!inView(p.x, p.y, 60)) continue;
      const f = p.life / p.max;
      const sz = p.size2 + (p.size - p.size2) * f;
      switch (p.kind) {
        case "dot":
          ctx.globalAlpha = Math.min(1, f * 2);
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
          break;
        case "ring":
          ctx.globalAlpha = f;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 4 * f + 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size2 + (p.size - p.size2) * (1 - f), 0, 6.3);
          ctx.stroke();
          break;
        case "flash":
          ctx.globalAlpha = Math.min(1, f * 1.6);
          ctx.fillStyle = p.color;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.beginPath();
          if (p.rot !== 0) ctx.ellipse(sz * 0.5, 0, sz, sz * 0.4, 0, 0, 6.3);
          else ctx.arc(0, 0, sz * (1.4 - f * 0.6), 0, 6.3);
          ctx.fill();
          ctx.restore();
          break;
        case "smoke":
          ctx.globalAlpha = f * 0.8;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size + (p.size2 - p.size) * (1 - f), 0, 6.3);
          ctx.fill();
          break;
        case "line":
          ctx.globalAlpha = Math.min(1, f * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - Math.cos(p.rot) * 7, p.y - Math.sin(p.rot) * 7);
          ctx.stroke();
          break;
        case "shell":
          ctx.globalAlpha = Math.min(1, f * 3);
          ctx.fillStyle = p.color;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot + (1 - f) * 8);
          ctx.fillRect(-p.size, -p.size / 2, p.size * 1.6, p.size);
          ctx.restore();
          break;
      }
    }
    ctx.globalAlpha = 1;

    // ---- construção: prévia e dicas
    const b = g.build;
    if (b.active) {
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pl.x, pl.y, BARRICADE.buildRange, 0, 6.3);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const c of world.layout.chokePoints) {
        const px = c.tx * TILE;
        const py = c.ty * TILE;
        if (!inView(px, py)) continue;
        const a = 0.35 + Math.sin(t * 4 + c.tx) * 0.15;
        ctx.strokeStyle = `rgba(255,205,70,${a})`;
        ctx.lineWidth = 2;
        const L = 8;
        ctx.beginPath();
        for (const [ax, ay, sx, sy] of [[px, py, 1, 1], [px + TILE, py, -1, 1], [px, py + TILE, 1, -1], [px + TILE, py + TILE, -1, -1]] as const) {
          ctx.moveTo(ax + sx * L, ay);
          ctx.lineTo(ax, ay);
          ctx.lineTo(ax, ay + sy * L);
        }
        ctx.stroke();
      }
      const gx = b.ghost.tx * TILE;
      const gy = b.ghost.ty * TILE;
      const ok = b.ghost.valid;
      this.ghost.type = b.active;
      this.ghost.x = gx + TILE / 2;
      this.ghost.y = gy + TILE / 2;
      this.ghost.angle = Math.atan2(g.cross.wy - this.ghost.y, g.cross.wx - this.ghost.x);
      if (b.active === "barricade") drawBarricade(ctx, this.ghost, 0.7);
      else {
        drawTurret(ctx, this.ghost, 0.7);
        ctx.strokeStyle = ok ? "rgba(90,255,140,0.45)" : "rgba(255,90,90,0.4)";
        ctx.setLineDash([8, 6]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.ghost.x, this.ghost.y, TURRET.range, 0, 6.3);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = ok ? "rgba(90,255,140,0.05)" : "rgba(255,90,90,0.04)";
        ctx.fill();
      }
      ctx.fillStyle = ok ? "rgba(70,255,120,0.30)" : "rgba(255,70,70,0.34)";
      ctx.fillRect(gx, gy, TILE, TILE);
      ctx.strokeStyle = ok ? "#5dff8c" : "#ff5d5d";
      ctx.lineWidth = 2;
      ctx.strokeRect(gx + 1, gy + 1, TILE - 2, TILE - 2);
      ctx.restore();
    }

    // ---- textos flutuantes
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const f of g.effects.texts.items) {
      if (!inView(f.x, f.y)) continue;
      ctx.globalAlpha = Math.min(1, (f.life / f.max) * 2);
      ctx.font = `bold ${f.size}px 'Bahnschrift','Arial Narrow',sans-serif`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.8)";
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;

    // ---- iluminação / atmosfera (espaço de tela)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.drawLighting(g, W, H, sc, cx, cy, theme.ambient, theme.ambientTint, theme.lightRadius);

    // ---- olhos brilhantes (visíveis mesmo no escuro)
    for (const z of g.zombies) {
      if (!z.alive || z.spawnT < 1) continue;
      const px = (z.x - cx) * sc + W / 2;
      const py = (z.y - cy) * sc + H / 2;
      if (px < -30 || px > W + 30 || py < -30 || py > H + 30) continue;
      const s = z.kind === "crawler" ? 1 : z.def.scale;
      const fwd = (z.kind === "crawler" ? 10 : 5.5) * s * sc;
      const side = 2.3 * s * sc;
      const ex = px + Math.cos(z.angle) * fwd;
      const ey = py + Math.sin(z.angle) * fwd;
      const ox = -Math.sin(z.angle) * side;
      const oy = Math.cos(z.angle) * side;
      ctx.fillStyle = EYE[z.kind];
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(ex + ox, ey + oy, 1.6 * sc, 0, 6.3);
      ctx.moveTo(ex - ox + 1.6 * sc, ey - oy);
      ctx.arc(ex - ox, ey - oy, 1.6 * sc, 0, 6.3);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ---- efeitos de tela
    if (pl.hurtFlash > 0.01 || (pl.alive && pl.hp / pl.maxHp < 0.3)) {
      const low = pl.alive && pl.hp / pl.maxHp < 0.3 ? 0.18 + Math.sin(t * 6) * 0.07 : 0;
      const a = Math.max(pl.hurtFlash * 0.5, low);
      const gr = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
      gr.addColorStop(0, "rgba(160,0,0,0)");
      gr.addColorStop(1, `rgba(170,0,0,${a})`);
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, W, H);
    }
    if (!pl.alive) {
      ctx.fillStyle = "rgba(60,0,0,0.35)";
      ctx.fillRect(0, 0, W, H);
    }

    if ((g.state === "playing" || g.state === "shop") && pl.alive) this.drawCrosshair(g, sc);
  }

  private drawLighting(g: Game, W: number, H: number, sc: number, cx: number, cy: number, ambient: number, tint: string, lightMul: number) {
    const L = this.light;
    if (L.width !== W || L.height !== H) {
      L.width = W;
      L.height = H;
    }
    const c = this.lctx;
    const cam = g.camera;
    const p = g.player;
    c.globalCompositeOperation = "source-over";
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);
    c.fillStyle = `rgba(${tint},${ambient})`;
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = "destination-out";
    const sx = (x: number) => (x - cx) * sc + W / 2;
    const sy = (y: number) => (y - cy) * sc + H / 2;
    const glow = (x: number, y: number, r: number, a: number) => {
      const gr = c.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(0,0,0,${a})`);
      gr.addColorStop(0.6, `rgba(0,0,0,${a * 0.5})`);
      gr.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = gr;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    };
    const psx = sx(p.x);
    const psy = sy(p.y);
    glow(psx, psy, 300 * sc * lightMul, 1);
    if (p.alive) {
      const R2 = 620 * sc * lightMul;
      c.save();
      c.translate(psx, psy);
      c.rotate(p.angle);
      c.beginPath();
      c.moveTo(0, 0);
      c.arc(0, 0, R2, -0.42, 0.42);
      c.closePath();
      const gr = c.createRadialGradient(0, 0, 0, 0, 0, R2);
      gr.addColorStop(0, "rgba(0,0,0,0.9)");
      gr.addColorStop(0.7, "rgba(0,0,0,0.4)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = gr;
      c.fill();
      c.restore();
      if (p.flash > 0) glow(psx + Math.cos(p.angle) * 24 * sc, psy + Math.sin(p.angle) * 24 * sc, 260 * sc, 0.8);
    }
    for (const s of g.structures) {
      if (s.type !== "turret" || Math.abs(s.x - cx) > cam.viewW / 2 + 160 || Math.abs(s.y - cy) > cam.viewH / 2 + 160) continue;
      glow(sx(s.x), sy(s.y), (s.flash > 0 ? 190 : 120) * sc, s.flash > 0 ? 0.8 : 0.4);
    }
    for (const q of g.effects.particles.items) {
      if (q.kind === "flash" && q.rot === 0 && q.size > 6) glow(sx(q.x), sy(q.y), q.size2 * 3.2 * sc, q.life / q.max);
    }
    for (const h of g.hazards) glow(sx(h.x), sy(h.y), h.r * 2.2 * sc, 0.35);
    for (const z of g.zombies) {
      if (z.kind === "explosive" && z.fuse >= 0) glow(sx(z.x), sy(z.y), 90 * sc, 0.7);
      else if (z.kind === "spitter") glow(sx(z.x), sy(z.y), 46 * sc, 0.35);
    }
    c.globalCompositeOperation = "source-over";
    const ctx = this.ctx;
    ctx.drawImage(L, 0, 0);
  }

  private drawCrosshair(g: Game, sc: number) {
    const ctx = this.ctx;
    const cam = g.camera;
    const p = g.player;
    const ws = p.weapons[p.slot]!;
    const st = g.weapons.stats(ws);
    const px = cam.toScreenX(p.x);
    const py = cam.toScreenY(p.y);
    const { sx, sy } = g.cross;
    const dist = Math.hypot(sx - px, sy - py);
    const moving = p.speedNow > 25;
    const deg = (ws.def.spread + (moving ? ws.def.moveSpread : 0)) * st.accMul + ws.bloom;
    const k = Math.max(0.8, sc / 1.1);
    const r = clamp(Math.tan(deg * DEG) * dist, 7 * k, 80 * k);
    const building = g.build.active;
    const color = building ? (g.build.ghost.valid ? "#5dff8c" : "#ff5d5d") : "#ffffff";
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 4 * k;
    this.ticks(sx, sy, r, 7 * k);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * k;
    this.ticks(sx, sy, r, 7 * k);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.8 * k, 0, 6.3);
    ctx.fill();
    if (p.reloadT > 0) {
      const prog = 1 - p.reloadT / Math.max(0.01, p.reloadTotal);
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 5 * k;
      ctx.beginPath();
      ctx.arc(sx, sy, r + 16 * k, 0, 6.3);
      ctx.stroke();
      ctx.strokeStyle = "#ffd54a";
      ctx.lineWidth = 3 * k;
      ctx.beginPath();
      ctx.arc(sx, sy, r + 16 * k, -Math.PI / 2, -Math.PI / 2 + prog * 6.2832);
      ctx.stroke();
    }
    ctx.restore();
  }

  private ticks(x: number, y: number, r: number, len: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x - r - len, y);
    ctx.lineTo(x - r, y);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + r + len, y);
    ctx.moveTo(x, y - r - len);
    ctx.lineTo(x, y - r);
    ctx.moveTo(x, y + r);
    ctx.lineTo(x, y + r + len);
    ctx.stroke();
  }
}
