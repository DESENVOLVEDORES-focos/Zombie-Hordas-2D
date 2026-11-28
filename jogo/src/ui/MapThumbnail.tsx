import { useEffect, useRef } from "react";
import type { MapDef } from "../game/maps";
import { T } from "../game/maps";

/** Miniatura do mapa desenhada a partir dos próprios dados do cenário. */
export function MapThumbnail({ map, width = 260 }: { map: MapDef; width?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const L = map.build();
    const ps = Math.max(2, Math.floor(width / L.cols));
    cv.width = L.cols * ps;
    cv.height = L.rows * ps;
    const c = cv.getContext("2d")!;
    const th = map.theme;
    c.fillStyle = "#050607";
    c.fillRect(0, 0, cv.width, cv.height);
    for (let y = 0; y < L.rows; y++) {
      for (let x = 0; x < L.cols; x++) {
        const i = y * L.cols + x;
        const t = L.tiles[i];
        const z = th.zones[L.zone[i]] ?? th.zones[0];
        if (t === T.WALL) c.fillStyle = th.wallTop;
        else if (t === T.PIT) c.fillStyle = L.styles[L.style[i]] === "rails" ? "#2a2723" : th.pitColor;
        else if (t === T.SOLID) c.fillStyle = "#4b4f55";
        else if (t === T.LOW) c.fillStyle = "#8a7a5a";
        else c.fillStyle = z.floor;
        c.fillRect(x * ps, y * ps, ps, ps);
      }
    }
    // paredes internas mais escuras: reforça o contorno
    c.fillStyle = "rgba(0,0,0,0.35)";
    for (let y = 0; y < L.rows; y++)
      for (let x = 0; x < L.cols; x++) {
        if (L.tiles[y * L.cols + x] !== T.WALL) continue;
        let inner = true;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < L.cols && ny < L.rows && L.tiles[ny * L.cols + nx] !== T.WALL) inner = false;
        }
        if (inner) c.fillRect(x * ps, y * ps, ps, ps);
      }
    for (const s of L.spawns) {
      c.fillStyle = "#ff3b30";
      c.fillRect(s.tx * ps - 1, s.ty * ps - 1, ps + 2, ps + 2);
    }
    for (const b of L.buyPoints) {
      c.fillStyle = "#ffb52e";
      c.fillRect(b.tx * ps, b.ty * ps, ps, ps);
    }
    c.fillStyle = "#6bff8a";
    c.beginPath();
    c.arc((L.playerSpawn.tx + 0.5) * ps, (L.playerSpawn.ty + 0.5) * ps, ps * 1.4, 0, 6.3);
    c.fill();
  }, [map, width]);
  return <canvas ref={ref} className="w-full rounded border border-white/10 bg-black" style={{ imageRendering: "pixelated" }} />;
}
