import { T, type BuyKind, type MapLayout, type TileType } from "./types";

/** Ferramenta para montar mapas de forma declarativa (retângulos, obstáculos, spawns...). */
export class MapBuilder {
  cols: number;
  rows: number;
  tiles: Uint8Array;
  zone: Uint8Array;
  style: Uint8Array;
  styles: string[] = [""];
  private layout: Omit<MapLayout, "cols" | "rows" | "tiles" | "zone" | "style" | "styles" | "playerSpawn"> & {
    playerSpawn: { tx: number; ty: number };
  };

  constructor(cols: number, rows: number, base: TileType = T.WALL) {
    this.cols = cols;
    this.rows = rows;
    this.tiles = new Uint8Array(cols * rows).fill(base);
    this.zone = new Uint8Array(cols * rows);
    this.style = new Uint8Array(cols * rows);
    this.layout = { spawns: [], playerSpawn: { tx: 2, ty: 2 }, buyPoints: [], chokePoints: [], labels: [] };
  }

  private styleId(name?: string) {
    if (!name) return 0;
    let i = this.styles.indexOf(name);
    if (i < 0) {
      this.styles.push(name);
      i = this.styles.length - 1;
    }
    return i;
  }

  fill(x: number, y: number, w: number, h: number, type: TileType, zone = 0, style?: string) {
    const sid = this.styleId(style);
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) {
        if (i < 0 || j < 0 || i >= this.cols || j >= this.rows) continue;
        const k = j * this.cols + i;
        this.tiles[k] = type;
        this.zone[k] = zone;
        this.style[k] = sid;
      }
    return this;
  }
  floor(x: number, y: number, w: number, h: number, zone = 0) {
    return this.fill(x, y, w, h, T.FLOOR, zone);
  }
  wall(x: number, y: number, w: number, h: number) {
    return this.fill(x, y, w, h, T.WALL);
  }
  pit(x: number, y: number, w: number, h: number, style = "gap") {
    return this.fill(x, y, w, h, T.PIT, 0, style);
  }
  solid(x: number, y: number, style: string, w = 1, h = 1) {
    const sid = this.styleId(style);
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) {
        const k = j * this.cols + i;
        this.tiles[k] = T.SOLID;
        this.style[k] = sid;
      }
    return this;
  }
  low(x: number, y: number, style: string, w = 1, h = 1) {
    const sid = this.styleId(style);
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) {
        const k = j * this.cols + i;
        this.tiles[k] = T.LOW;
        this.style[k] = sid;
      }
    return this;
  }
  /** muda só a zona (piso) dos tiles que são chão */
  zoneRect(x: number, y: number, w: number, h: number, zone: number) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.zone[j * this.cols + i] = zone;
    return this;
  }
  /** contorno de paredes na borda do mapa */
  border(thick = 1) {
    this.wall(0, 0, this.cols, thick);
    this.wall(0, this.rows - thick, this.cols, thick);
    this.wall(0, 0, thick, this.rows);
    this.wall(this.cols - thick, 0, thick, this.rows);
    return this;
  }
  /** abre uma passagem (porta) num muro */
  door(x: number, y: number, w: number, h: number, zone = 0) {
    this.floor(x, y, w, h, zone);
    // pontos estratégicos no centro da passagem
    const cx = x + Math.floor((w - 1) / 2);
    const cy = y + Math.floor((h - 1) / 2);
    this.choke(cx, cy);
    if (w > 1) this.choke(cx + 1, cy);
    if (h > 1) this.choke(cx, cy + 1);
    return this;
  }
  spawn(tx: number, ty: number) {
    this.layout.spawns.push({ tx, ty });
    return this;
  }
  player(tx: number, ty: number) {
    this.layout.playerSpawn = { tx, ty };
    return this;
  }
  buy(tx: number, ty: number, kind: BuyKind, weaponId?: string) {
    this.layout.buyPoints.push({ tx, ty, kind, weaponId });
    return this;
  }
  choke(tx: number, ty: number) {
    if (!this.layout.chokePoints.some((c) => c.tx === tx && c.ty === ty)) this.layout.chokePoints.push({ tx, ty });
    return this;
  }
  label(text: string, tx: number, ty: number) {
    this.layout.labels.push({ text, tx, ty });
    return this;
  }

  build(): MapLayout {
    return {
      cols: this.cols,
      rows: this.rows,
      tiles: this.tiles,
      zone: this.zone,
      style: this.style,
      styles: this.styles,
      ...this.layout,
    };
  }
}
