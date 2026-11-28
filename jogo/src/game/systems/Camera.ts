import { clamp, rand } from "../core/math";
import type { World } from "../core/World";

export const VIEW_HEIGHT = 640; // altura visível em unidades de mundo (20 tiles)

/** Câmera top-down (90°) que acompanha o jogador com suavização e tremor de tela. */
export class Camera {
  x = 0;
  y = 0;
  scale = 1;
  viewW = 1138;
  viewH = VIEW_HEIGHT;
  canvasW = 1280;
  canvasH = 720;
  shakeAmt = 0;
  shakeX = 0;
  shakeY = 0;

  resize(cw: number, ch: number) {
    this.canvasW = cw;
    this.canvasH = ch;
    this.scale = ch / VIEW_HEIGHT;
    this.viewW = cw / this.scale;
    this.viewH = VIEW_HEIGHT;
  }

  snap(x: number, y: number, world: World) {
    this.x = x;
    this.y = y;
    this.clampToWorld(world);
  }

  private clampToWorld(world: World) {
    const hw = this.viewW / 2;
    const hh = this.viewH / 2;
    this.x = world.width <= this.viewW ? world.width / 2 : clamp(this.x, hw, world.width - hw);
    this.y = world.height <= this.viewH ? world.height / 2 : clamp(this.y, hh, world.height - hh);
  }

  follow(px: number, py: number, ax: number, ay: number, world: World, dt: number) {
    const lx = clamp((ax - px) * 0.2, -110, 110);
    const ly = clamp((ay - py) * 0.2, -80, 80);
    const k = Math.min(1, dt * 7);
    this.x += (px + lx - this.x) * k;
    this.y += (py + ly - this.y) * k;
    this.clampToWorld(world);
    this.shakeAmt *= Math.exp(-9 * dt);
    if (this.shakeAmt < 0.05) this.shakeAmt = 0;
    this.shakeX = rand(-1, 1) * this.shakeAmt;
    this.shakeY = rand(-1, 1) * this.shakeAmt;
  }

  shake(a: number) {
    this.shakeAmt = Math.min(14, Math.max(this.shakeAmt, a));
  }

  toScreenX(wx: number) {
    return (wx - this.x) * this.scale + this.canvasW / 2;
  }
  toScreenY(wy: number) {
    return (wy - this.y) * this.scale + this.canvasH / 2;
  }
  toWorldX(sx: number) {
    return (sx - this.canvasW / 2) / this.scale + this.x;
  }
  toWorldY(sy: number) {
    return (sy - this.canvasH / 2) / this.scale + this.y;
  }
}
