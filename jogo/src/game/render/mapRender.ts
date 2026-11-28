import { T, TILE, type ZoneDef } from "../maps/types";
import type { World } from "../core/World";

/** Escala de supersampling do mapa pré-renderizado (mantém nitidez com zoom). */
export const MAP_SS = 1.5;

type Ctx = CanvasRenderingContext2D;

const hash = (x: number, y: number, k = 0) => {
  let h = (x * 374761393 + y * 668265263 + k * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967296;
};

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

function drawFloor(c: Ctx, z: ZoneDef, tx: number, ty: number) {
  const x = tx * TILE;
  const y = ty * TILE;
  const alt = (tx + ty) & 1;
  const n = hash(tx, ty);
  c.fillStyle = shade(alt ? z.floor : z.floor2, Math.round((n - 0.5) * 8));
  c.fillRect(x, y, TILE, TILE);
  const line = z.line ?? "rgba(0,0,0,0.2)";
  switch (z.pattern) {
    case "tiles":
      c.strokeStyle = line;
      c.lineWidth = 1;
      c.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
      break;
    case "checker":
      if (alt) {
        c.fillStyle = "rgba(0,0,0,0.07)";
        c.fillRect(x, y, TILE, TILE);
      }
      c.strokeStyle = line;
      c.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
      break;
    case "plain":
      c.fillStyle = "rgba(0,0,0,0.12)";
      for (let i = 0; i < 4; i++) c.fillRect(x + hash(tx, ty, i + 1) * 30, y + hash(tx, ty, i + 9) * 30, 2, 2);
      if (tx % 4 === 0) {
        c.fillStyle = line;
        c.fillRect(x, y, 1, TILE);
      }
      if (ty % 4 === 0) {
        c.fillStyle = line;
        c.fillRect(x, y, TILE, 1);
      }
      break;
    case "metal":
      c.strokeStyle = line;
      c.lineWidth = 1;
      c.beginPath();
      for (let i = -TILE; i < TILE; i += 8) {
        c.moveTo(x + i, y + TILE);
        c.lineTo(x + i + TILE, y);
      }
      c.stroke();
      c.fillStyle = "rgba(255,255,255,0.15)";
      for (const [dx, dy] of [[3, 3], [29, 3], [3, 29], [29, 29]]) c.fillRect(x + dx - 1, y + dy - 1, 2, 2);
      break;
    case "grass":
      c.strokeStyle = "rgba(20,50,15,0.5)";
      c.lineWidth = 1;
      c.beginPath();
      for (let i = 0; i < 9; i++) {
        const gx = x + hash(tx, ty, i + 20) * 30 + 1;
        const gy = y + hash(tx, ty, i + 40) * 30 + 1;
        c.moveTo(gx, gy);
        c.lineTo(gx + (hash(tx, ty, i + 60) - 0.5) * 4, gy - 3);
      }
      c.stroke();
      if (n > 0.8) {
        c.fillStyle = "rgba(190,170,90,0.35)";
        c.fillRect(x + n * 20, y + hash(tx, ty, 5) * 24, 3, 2);
      }
      break;
    case "wood":
    case "court":
      c.strokeStyle = line.startsWith("rgba(255") ? "rgba(0,0,0,0.18)" : line;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, y + 0.5);
      c.lineTo(x + TILE, y + 0.5);
      c.moveTo(x, y + 16.5);
      c.lineTo(x + TILE, y + 16.5);
      const off = hash(tx, ty >> 1, 3) * 28;
      c.moveTo(x + off, y);
      c.lineTo(x + off, y + 16);
      c.moveTo(x + ((off + 14) % 30), y + 16);
      c.lineTo(x + ((off + 14) % 30), y + TILE);
      c.stroke();
      break;
    case "carpet":
      c.fillStyle = "rgba(255,255,255,0.04)";
      for (let i = 0; i < 6; i++) c.fillRect(x + hash(tx, ty, i + 70) * 30, y + hash(tx, ty, i + 80) * 30, 2, 2);
      break;
    case "ballast":
      c.fillStyle = "rgba(0,0,0,0.3)";
      for (let i = 0; i < 7; i++) c.fillRect(x + hash(tx, ty, i + 11) * 30, y + hash(tx, ty, i + 31) * 30, 3, 2);
      c.fillStyle = "rgba(255,255,255,0.07)";
      for (let i = 0; i < 4; i++) c.fillRect(x + hash(tx, ty, i + 51) * 30, y + hash(tx, ty, i + 71) * 30, 2, 2);
      break;
  }
}

function drawPit(c: Ctx, style: string, tx: number, ty: number, pit: string) {
  const x = tx * TILE;
  const y = ty * TILE;
  c.fillStyle = pit;
  c.fillRect(x, y, TILE, TILE);
  if (style === "rails") {
    c.fillStyle = "#26231f";
    c.fillRect(x, y, TILE, TILE);
    c.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < 6; i++) c.fillRect(x + hash(tx, ty, i) * 30, y + hash(tx, ty, i + 9) * 30, 2, 2);
    // dormentes
    c.fillStyle = "#4a3926";
    for (let i = 0; i < 3; i++) c.fillRect(x + 3 + i * 11, y + 4, 5, 24);
    // trilhos
    c.fillStyle = "#9aa1a8";
    c.fillRect(x, y + 8, TILE, 3);
    c.fillRect(x, y + 21, TILE, 3);
    c.fillStyle = "rgba(255,255,255,0.25)";
    c.fillRect(x, y + 8, TILE, 1);
    c.fillRect(x, y + 21, TILE, 1);
  } else {
    // "gap": rua lá embaixo
    c.fillStyle = "rgba(255,255,255,0.025)";
    c.fillRect(x, y, TILE, TILE);
    if ((tx + ty) % 5 === 0) {
      c.fillStyle = "rgba(255,255,255,0.04)";
      c.fillRect(x + 4, y + 14, 24, 3);
    }
    const n = hash(tx, ty, 7);
    if (n > 0.93) {
      c.fillStyle = "rgba(120,30,30,0.35)";
      c.fillRect(x + 6, y + 8, 20, 12);
    }
  }
}

function drawWall(c: Ctx, world: World, tx: number, ty: number) {
  const t = world.def.theme;
  const x = tx * TILE;
  const y = ty * TILE;
  const L = world.layout;
  const is = (dx: number, dy: number) => {
    const nx = tx + dx;
    const ny = ty + dy;
    if (nx < 0 || ny < 0 || nx >= L.cols || ny >= L.rows) return true;
    return L.tiles[ny * L.cols + nx] === T.WALL;
  };
  let interior = true;
  for (let dy = -1; dy <= 1 && interior; dy++) for (let dx = -1; dx <= 1; dx++) if (!is(dx, dy)) interior = false;
  if (interior) {
    c.fillStyle = t.wallSide;
    c.fillRect(x, y, TILE, TILE);
    return;
  }
  c.fillStyle = t.wallSide;
  c.fillRect(x, y, TILE, TILE);
  c.fillStyle = t.wallTop;
  c.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
  c.fillStyle = "rgba(0,0,0,0.12)";
  const n = hash(tx, ty, 2);
  c.fillRect(x + 1, y + 15, TILE - 2, 2);
  c.fillRect(x + 4 + n * 20, y + 1, 2, 14);
  c.fillRect(x + 4 + hash(tx, ty, 3) * 20, y + 17, 2, 14);
  c.fillStyle = t.wallEdge;
  if (!is(0, -1)) c.fillRect(x, y, TILE, 2);
  if (!is(-1, 0)) c.fillRect(x, y, 2, TILE);
  c.fillStyle = "rgba(0,0,0,0.45)";
  if (!is(0, 1)) c.fillRect(x, y + TILE - 3, TILE, 3);
  if (!is(1, 0)) c.fillRect(x + TILE - 3, y, 3, TILE);
}

type Same = (dx: number, dy: number) => boolean;

function merged(c: Ctx, x: number, y: number, same: Same, inset: number, fill: string, edge: string) {
  const x0 = same(-1, 0) ? x : x + inset;
  const x1 = same(1, 0) ? x + TILE : x + TILE - inset;
  const y0 = same(0, -1) ? y : y + inset;
  const y1 = same(0, 1) ? y + TILE : y + TILE - inset;
  c.fillStyle = fill;
  c.fillRect(x0, y0, x1 - x0, y1 - y0);
  c.fillStyle = edge;
  if (!same(0, -1)) c.fillRect(x0, y0, x1 - x0, 2);
  if (!same(-1, 0)) c.fillRect(x0, y0, 2, y1 - y0);
  c.fillStyle = "rgba(0,0,0,0.35)";
  if (!same(0, 1)) c.fillRect(x0, y1 - 3, x1 - x0, 3);
  if (!same(1, 0)) c.fillRect(x1 - 3, y0, 3, y1 - y0);
}

function drawSolid(c: Ctx, style: string, tx: number, ty: number, same: Same) {
  const x = tx * TILE;
  const y = ty * TILE;
  const n = hash(tx, ty, 4);
  switch (style) {
    case "crate":
      merged(c, x, y, () => false, 2, "#8a6234", "#b88a52");
      c.strokeStyle = "#5a3d1c";
      c.lineWidth = 2;
      c.strokeRect(x + 5, y + 5, TILE - 10, TILE - 10);
      c.beginPath();
      c.moveTo(x + 5, y + 5);
      c.lineTo(x + TILE - 5, y + TILE - 5);
      c.moveTo(x + TILE - 5, y + 5);
      c.lineTo(x + 5, y + TILE - 5);
      c.stroke();
      break;
    case "unit":
      merged(c, x, y, () => false, 2, "#9aa0a6", "#cfd4d8");
      c.fillStyle = "#2c3036";
      c.beginPath();
      c.arc(x + 16, y + 16, 11, 0, 6.3);
      c.fill();
      c.strokeStyle = "#6d747c";
      c.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + n;
        c.beginPath();
        c.moveTo(x + 16, y + 16);
        c.lineTo(x + 16 + Math.cos(a) * 10, y + 16 + Math.sin(a) * 10);
        c.stroke();
      }
      break;
    case "tank":
      merged(c, x, y, same, 1, "#5d7380", "#8fa5b3");
      c.strokeStyle = "rgba(0,0,0,0.3)";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(x + 16, y + 16, 10, 0, 6.3);
      c.stroke();
      c.fillStyle = "rgba(255,255,255,0.12)";
      c.beginPath();
      c.arc(x + 12, y + 12, 5, 0, 6.3);
      c.fill();
      break;
    case "pillar":
      c.fillStyle = "rgba(0,0,0,0.3)";
      c.beginPath();
      c.arc(x + 17, y + 18, 14, 0, 6.3);
      c.fill();
      c.fillStyle = "#8d9096";
      c.beginPath();
      c.arc(x + 16, y + 16, 13, 0, 6.3);
      c.fill();
      c.fillStyle = "#b5b8bd";
      c.beginPath();
      c.arc(x + 14, y + 14, 8, 0, 6.3);
      c.fill();
      c.strokeStyle = "#4a4d52";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(x + 16, y + 16, 13, 0, 6.3);
      c.stroke();
      break;
    case "wagon":
      merged(c, x, y, same, 0, "#7d3434", "#b05454");
      c.fillStyle = "#d9b45a";
      if (same(1, 0) || same(-1, 0)) c.fillRect(x, y + 14, TILE, 4);
      c.fillStyle = "rgba(0,0,0,0.25)";
      if (tx % 3 === 0) c.fillRect(x + 15, y, 2, TILE);
      break;
    case "cabinet":
      merged(c, x, y, same, 2, "#c4cacf", "#eef1f3");
      c.strokeStyle = "rgba(0,0,0,0.3)";
      c.lineWidth = 1;
      c.strokeRect(x + 4.5, y + 4.5, TILE - 9, TILE - 9);
      c.fillStyle = "#6a7178";
      c.fillRect(x + 14, y + 12, 4, 8);
      break;
    case "machine":
      merged(c, x, y, same, 2, "#3d4a52", "#6f808a");
      c.fillStyle = "#1c2328";
      c.fillRect(x + 5, y + 5, TILE - 10, 10);
      c.fillStyle = n > 0.5 ? "#4cff7a" : "#ff5a4c";
      c.fillRect(x + 6, y + 20, 4, 4);
      c.fillStyle = n > 0.5 ? "#ffd24c" : "#4cc9ff";
      c.fillRect(x + 14, y + 20, 4, 4);
      c.fillStyle = "rgba(120,255,200,0.4)";
      c.fillRect(x + 7, y + 7, 8 + n * 8, 2);
      break;
    case "locker":
      merged(c, x, y, same, 1, "#506a86", "#7d9bbb");
      c.strokeStyle = "rgba(0,0,0,0.4)";
      c.lineWidth = 1;
      c.strokeRect(x + 3.5, y + 3.5, TILE - 7, TILE - 7);
      c.fillStyle = "#c0c8d0";
      c.fillRect(x + 22, y + 14, 3, 5);
      break;
    case "shelf": {
      merged(c, x, y, same, 2, "#4f3826", "#7a5a3c");
      const cols = ["#a33b3b", "#3b6ea3", "#3ba35a", "#c9a23b", "#7a3ba3", "#d0d0d0"];
      for (let r = 0; r < 2; r++)
        for (let i = 0; i < 6; i++) {
          c.fillStyle = cols[Math.floor(hash(tx + i, ty + r, 9) * cols.length)];
          c.fillRect(x + 3 + i * 4.5, y + 4 + r * 13, 3.5, 10);
        }
      break;
    }
    case "tree":
      c.fillStyle = "rgba(0,0,0,0.28)";
      c.beginPath();
      c.arc(x + 19, y + 20, 19, 0, 6.3);
      c.fill();
      c.fillStyle = "#2f5a2a";
      c.beginPath();
      c.arc(x + 16, y + 16, 19, 0, 6.3);
      c.fill();
      c.fillStyle = "#3d7335";
      c.beginPath();
      c.arc(x + 13, y + 13, 12, 0, 6.3);
      c.fill();
      c.fillStyle = "#4f8f43";
      c.beginPath();
      c.arc(x + 11, y + 10, 5, 0, 6.3);
      c.fill();
      break;
    case "counter":
      merged(c, x, y, same, 2, "#76583a", "#b08655");
      c.fillStyle = "rgba(0,0,0,0.2)";
      c.fillRect(x + 4, y + 18, TILE - 8, 2);
      break;
    default:
      merged(c, x, y, same, 2, "#777", "#aaa");
  }
}

function drawLow(c: Ctx, style: string, tx: number, ty: number, same: Same) {
  const x = tx * TILE;
  const y = ty * TILE;
  const horiz = same(-1, 0) || same(1, 0);
  switch (style) {
    case "pipe": {
      c.fillStyle = "rgba(0,0,0,0.3)";
      if (horiz) c.fillRect(x, y + 13, TILE, 12);
      else c.fillRect(x + 13, y, 12, TILE);
      c.fillStyle = "#7d8790";
      if (horiz) c.fillRect(x, y + 10, TILE, 11);
      else c.fillRect(x + 10, y, 11, TILE);
      c.fillStyle = "#b6c0c8";
      if (horiz) c.fillRect(x, y + 12, TILE, 3);
      else c.fillRect(x + 12, y, 3, TILE);
      c.fillStyle = "#555e66";
      if (horiz) c.fillRect(x + 14, y + 8, 4, 15);
      else c.fillRect(x + 8, y + 14, 15, 4);
      break;
    }
    case "bench":
      merged(c, x, y, same, 6, "#8a6a42", "#b08a5a");
      c.fillStyle = "rgba(0,0,0,0.3)";
      if (horiz) {
        c.fillRect(x, y + 14, TILE, 1);
        c.fillRect(x, y + 18, TILE, 1);
      } else {
        c.fillRect(x + 14, y, 1, TILE);
        c.fillRect(x + 18, y, 1, TILE);
      }
      break;
    case "bed":
      merged(c, x, y, same, 3, "#e8ecef", "#ffffff");
      c.fillStyle = "#5b86b5";
      if (same(-1, 0) || !same(1, 0)) c.fillRect(x + (same(-1, 0) ? 0 : 3), y + 8, TILE - 6, TILE - 14);
      if (!same(-1, 0)) {
        c.fillStyle = "#fff";
        c.fillRect(x + 5, y + 5, 10, 10);
        c.strokeStyle = "#bcc4ca";
        c.strokeRect(x + 5.5, y + 5.5, 9, 9);
      }
      break;
    case "table":
      merged(c, x, y, same, 2, "#cbbd9f", "#efe3c8");
      c.strokeStyle = "rgba(0,0,0,0.18)";
      c.strokeRect(x + 3.5, y + 3.5, TILE - 7, TILE - 7);
      break;
    case "desk":
      merged(c, x, y, same, 4, "#a77f4d", "#d1a46a");
      c.fillStyle = "rgba(0,0,0,0.25)";
      c.fillRect(x + 6, y + 20, 8, 7);
      break;
    case "seat":
      merged(c, x, y, same, 4, "#3a5f8f", "#6c93c4");
      c.fillStyle = "rgba(0,0,0,0.25)";
      if (horiz) c.fillRect(x, y + 14, TILE, 1);
      else c.fillRect(x + 14, y, 1, TILE);
      break;
    case "barrier": {
      merged(c, x, y, same, 6, "#e6c229", "#fff07a");
      c.fillStyle = "#222";
      for (let i = 0; i < 4; i++) c.fillRect(x + 2 + i * 8, y + 6, 4, TILE - 12);
      break;
    }
    default:
      merged(c, x, y, same, 4, "#888", "#bbb");
  }
}

/** Pré-renderiza todo o cenário estático em um canvas. */
export function renderStaticMap(world: World): HTMLCanvasElement {
  const L = world.layout;
  const theme = world.def.theme;
  const cv = document.createElement("canvas");
  cv.width = Math.ceil(world.width * MAP_SS);
  cv.height = Math.ceil(world.height * MAP_SS);
  const c = cv.getContext("2d")!;
  c.scale(MAP_SS, MAP_SS);
  c.fillStyle = "#050607";
  c.fillRect(0, 0, world.width, world.height);

  const tileAt = (tx: number, ty: number) => (tx < 0 || ty < 0 || tx >= L.cols || ty >= L.rows ? T.WALL : L.tiles[ty * L.cols + tx]);

  for (let ty = 0; ty < L.rows; ty++) {
    for (let tx = 0; tx < L.cols; tx++) {
      const i = ty * L.cols + tx;
      const t = L.tiles[i];
      const zone = theme.zones[L.zone[i]] ?? theme.zones[0];
      const style = L.styles[L.style[i]] ?? "";
      if (t === T.WALL) drawWall(c, world, tx, ty);
      else if (t === T.PIT) drawPit(c, style, tx, ty, theme.pitColor);
      else {
        drawFloor(c, zone, tx, ty);
        if (t === T.SOLID || t === T.LOW) {
          const same: Same = (dx, dy) => {
            const j = (ty + dy) * L.cols + (tx + dx);
            return tx + dx >= 0 && ty + dy >= 0 && tx + dx < L.cols && ty + dy < L.rows && L.tiles[j] === t && L.style[j] === L.style[i];
          };
          // sombra do objeto no chão
          c.fillStyle = "rgba(0,0,0,0.22)";
          c.fillRect(tx * TILE + 3, ty * TILE + 4, TILE, TILE);
          if (t === T.SOLID) drawSolid(c, style, tx, ty, same);
          else drawLow(c, style, tx, ty, same);
        }
      }
    }
  }

  // sombras de paredes sobre o chão
  for (let ty = 0; ty < L.rows; ty++) {
    for (let tx = 0; tx < L.cols; tx++) {
      if (L.tiles[ty * L.cols + tx] !== T.FLOOR) continue;
      const x = tx * TILE;
      const y = ty * TILE;
      if (tileAt(tx, ty - 1) === T.WALL) {
        const g = c.createLinearGradient(0, y, 0, y + 11);
        g.addColorStop(0, "rgba(0,0,0,0.45)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g;
        c.fillRect(x, y, TILE, 11);
      }
      if (tileAt(tx - 1, ty) === T.WALL) {
        const g = c.createLinearGradient(x, 0, x + 9, 0);
        g.addColorStop(0, "rgba(0,0,0,0.35)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g;
        c.fillRect(x, y, 9, TILE);
      }
      if (tileAt(tx, ty - 1) === T.PIT) {
        // beirada dos telhados
        c.fillStyle = "rgba(255,255,255,0.07)";
        c.fillRect(x, y, TILE, 2);
      }
    }
  }

  // marcações de quadra
  theme.zones.forEach((z, zi) => {
    if (z.pattern !== "court") return;
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let ty = 0; ty < L.rows; ty++)
      for (let tx = 0; tx < L.cols; tx++)
        if (L.zone[ty * L.cols + tx] === zi && L.tiles[ty * L.cols + tx] !== T.WALL) {
          x0 = Math.min(x0, tx);
          y0 = Math.min(y0, ty);
          x1 = Math.max(x1, tx);
          y1 = Math.max(y1, ty);
        }
    if (x1 < 0) return;
    c.strokeStyle = z.line ?? "#fff";
    c.lineWidth = 2.5;
    const rx = (x0 + 1.5) * TILE;
    const ry = (y0 + 2) * TILE;
    const rw = (x1 - x0 - 2) * TILE;
    const rh = (y1 - y0 - 3) * TILE;
    c.strokeRect(rx, ry, rw, rh);
    c.beginPath();
    c.moveTo(rx + rw / 2, ry);
    c.lineTo(rx + rw / 2, ry + rh);
    c.stroke();
    c.beginPath();
    c.arc(rx + rw / 2, ry + rh / 2, 3 * TILE, 0, 6.3);
    c.stroke();
    c.strokeRect(rx, ry + rh / 2 - 3 * TILE, 4 * TILE, 6 * TILE);
    c.strokeRect(rx + rw - 4 * TILE, ry + rh / 2 - 3 * TILE, 4 * TILE, 6 * TILE);
  });

  // pontos de entrada dos zumbis (alçapões/escadas)
  for (const s of L.spawns) {
    const x = s.tx * TILE;
    const y = s.ty * TILE;
    c.fillStyle = "#14090a";
    c.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
    c.save();
    c.beginPath();
    c.rect(x + 1, y + 1, TILE - 2, TILE - 2);
    c.clip();
    c.strokeStyle = "rgba(200,40,40,0.55)";
    c.lineWidth = 3;
    for (let i = -TILE; i < TILE * 2; i += 9) {
      c.beginPath();
      c.moveTo(x + i, y + TILE);
      c.lineTo(x + i + TILE, y);
      c.stroke();
    }
    c.restore();
    c.strokeStyle = "#c33";
    c.lineWidth = 2;
    c.strokeRect(x + 1.5, y + 1.5, TILE - 3, TILE - 3);
  }

  // rótulos de ambiente
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.font = "bold 13px 'Bahnschrift', 'Arial Narrow', sans-serif";
  for (const l of L.labels) {
    c.fillStyle = "rgba(255,255,255,0.13)";
    c.fillText(l.text, (l.tx + 0.5) * TILE, (l.ty + 0.5) * TILE);
  }
  return cv;
}
