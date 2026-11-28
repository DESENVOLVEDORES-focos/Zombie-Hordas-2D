import { TILE, T, type MapDef, type MapLayout } from "../maps/types";
import { clamp } from "./math";
import type { Structure } from "./types";

export { TILE };
export type RayMode = "bullet" | "move" | "crawl";

/** Mundo: grade de colisão, estruturas dinâmicas, raycast e resolução de colisão círculo-vs-tile. */
export class World {
  def: MapDef;
  layout: MapLayout;
  cols: number;
  rows: number;
  width: number;
  height: number;
  blockMove: Uint8Array;
  blockCrawl: Uint8Array;
  blockBullet: Uint8Array;
  structs: (Structure | null)[];
  buyAt: Int32Array;

  constructor(def: MapDef) {
    this.def = def;
    this.layout = def.build();
    const { cols, rows, tiles } = this.layout;
    this.cols = cols;
    this.rows = rows;
    this.width = cols * TILE;
    this.height = rows * TILE;
    const n = cols * rows;
    this.blockMove = new Uint8Array(n);
    this.blockCrawl = new Uint8Array(n);
    this.blockBullet = new Uint8Array(n);
    this.structs = new Array(n).fill(null);
    this.buyAt = new Int32Array(n).fill(-1);
    for (let i = 0; i < n; i++) {
      const t = tiles[i];
      this.blockMove[i] = t !== T.FLOOR ? 1 : 0;
      this.blockCrawl[i] = t === T.WALL || t === T.SOLID || t === T.PIT ? 1 : 0;
      this.blockBullet[i] = t === T.WALL || t === T.SOLID ? 1 : 0;
    }
    this.layout.buyPoints.forEach((b, i) => (this.buyAt[b.ty * cols + b.tx] = i));
  }

  idx(tx: number, ty: number) {
    return ty * this.cols + tx;
  }
  inBounds(tx: number, ty: number) {
    return tx >= 0 && ty >= 0 && tx < this.cols && ty < this.rows;
  }
  tileType(tx: number, ty: number) {
    return this.inBounds(tx, ty) ? this.layout.tiles[ty * this.cols + tx] : T.WALL;
  }

  /** bloqueado para movimento (estático + estruturas) */
  solidFor(tx: number, ty: number, crawler: boolean): boolean {
    if (!this.inBounds(tx, ty)) return true;
    const i = ty * this.cols + tx;
    if (this.structs[i]) return true;
    return (crawler ? this.blockCrawl[i] : this.blockMove[i]) === 1;
  }

  staticBlocked(i: number, crawler: boolean) {
    return (crawler ? this.blockCrawl[i] : this.blockMove[i]) === 1;
  }

  addStructure(s: Structure) {
    this.structs[s.ty * this.cols + s.tx] = s;
  }
  removeStructure(s: Structure) {
    const i = s.ty * this.cols + s.tx;
    if (this.structs[i] === s) this.structs[i] = null;
  }

  /** Empurra o círculo para fora de tiles sólidos. Retorna true se houve colisão. */
  resolve(e: { x: number; y: number }, r: number, crawler = false): boolean {
    let hit = false;
    for (let iter = 0; iter < 2; iter++) {
      const minX = Math.floor((e.x - r) / TILE);
      const maxX = Math.floor((e.x + r) / TILE);
      const minY = Math.floor((e.y - r) / TILE);
      const maxY = Math.floor((e.y + r) / TILE);
      for (let ty = minY; ty <= maxY; ty++) {
        for (let tx = minX; tx <= maxX; tx++) {
          if (!this.solidFor(tx, ty, crawler)) continue;
          const left = tx * TILE;
          const top = ty * TILE;
          const cx = clamp(e.x, left, left + TILE);
          const cy = clamp(e.y, top, top + TILE);
          const dx = e.x - cx;
          const dy = e.y - cy;
          const d2 = dx * dx + dy * dy;
          if (d2 >= r * r) continue;
          hit = true;
          if (d2 > 0.0001) {
            const d = Math.sqrt(d2);
            const k = (r - d) / d;
            e.x += dx * k;
            e.y += dy * k;
          } else {
            const l = e.x - left;
            const rr = left + TILE - e.x;
            const t = e.y - top;
            const b = top + TILE - e.y;
            const m = Math.min(l, rr, t, b);
            if (m === l) e.x = left - r;
            else if (m === rr) e.x = left + TILE + r;
            else if (m === t) e.y = top - r;
            else e.y = top + TILE + r;
          }
        }
      }
    }
    return hit;
  }

  private rayBlocked(tx: number, ty: number, mode: RayMode): boolean {
    if (!this.inBounds(tx, ty)) return true;
    const i = ty * this.cols + tx;
    if (mode === "bullet") return this.blockBullet[i] === 1;
    if (this.structs[i]) return true;
    return (mode === "crawl" ? this.blockCrawl[i] : this.blockMove[i]) === 1;
  }

  /** Raycast em grade (DDA). Retorna t∈[0,1] do primeiro bloqueio ou -1 se livre. */
  raycast(x0: number, y0: number, x1: number, y1: number, mode: RayMode = "bullet"): number {
    const dx = x1 - x0;
    const dy = y1 - y0;
    let tx = Math.floor(x0 / TILE);
    let ty = Math.floor(y0 / TILE);
    const stepX = dx > 0 ? 1 : -1;
    const stepY = dy > 0 ? 1 : -1;
    const tDeltaX = dx !== 0 ? Math.abs(TILE / dx) : Infinity;
    const tDeltaY = dy !== 0 ? Math.abs(TILE / dy) : Infinity;
    let tMaxX = dx > 0 ? ((tx + 1) * TILE - x0) / dx : dx < 0 ? (x0 - tx * TILE) / -dx : Infinity;
    let tMaxY = dy > 0 ? ((ty + 1) * TILE - y0) / dy : dy < 0 ? (y0 - ty * TILE) / -dy : Infinity;
    let t = 0;
    for (let i = 0; i < 400; i++) {
      if (this.rayBlocked(tx, ty, mode)) return t;
      if (tMaxX < tMaxY) {
        if (tMaxX > 1) return -1;
        t = tMaxX;
        tMaxX += tDeltaX;
        tx += stepX;
      } else {
        if (tMaxY > 1) return -1;
        t = tMaxY;
        tMaxY += tDeltaY;
        ty += stepY;
      }
    }
    return -1;
  }

  /** Linha livre considerando a espessura do corpo (3 raios). */
  clearPath(ax: number, ay: number, bx: number, by: number, r: number, mode: RayMode): boolean {
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const ox = (-dy / len) * r * 0.9;
    const oy = (dx / len) * r * 0.9;
    return (
      this.raycast(ax, ay, bx, by, mode) < 0 &&
      this.raycast(ax + ox, ay + oy, bx + ox, by + oy, mode) < 0 &&
      this.raycast(ax - ox, ay - oy, bx - ox, by - oy, mode) < 0
    );
  }
}
