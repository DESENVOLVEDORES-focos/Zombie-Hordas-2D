import { World } from "../core/World";

/**
 * Pathfinding por campo de fluxo (Dijkstra a partir do alvo).
 * Um único cálculo serve a todos os zumbis. Estruturas (barricadas/torretas) são atravessáveis
 * com custo extra — o zumbi contorna se o desvio for curto, senão ataca a estrutura.
 */
const STRUCT_COST: Record<string, number> = { barricade: 9, turret: 14 };
const DIRS = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, 1.4142],
  [-1, 1, 1.4142],
  [1, -1, 1.4142],
  [-1, -1, 1.4142],
];

export class FlowField {
  cost: Float64Array;
  next: Int32Array;
  private hk: number[] = [];
  private hv: number[] = [];

  constructor(
    private world: World,
    public crawler: boolean,
  ) {
    const n = world.cols * world.rows;
    this.cost = new Float64Array(n).fill(Infinity);
    this.next = new Int32Array(n).fill(-1);
  }

  private push(k: number, v: number) {
    const hk = this.hk;
    const hv = this.hv;
    let i = hk.length;
    hk.push(k);
    hv.push(v);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (hk[p] <= k) break;
      hk[i] = hk[p];
      hv[i] = hv[p];
      i = p;
    }
    hk[i] = k;
    hv[i] = v;
  }

  private pop(): number {
    const hk = this.hk;
    const hv = this.hv;
    const top = hv[0];
    const lk = hk.pop()!;
    const lv = hv.pop()!;
    const n = hk.length;
    if (n > 0) {
      let i = 0;
      for (;;) {
        let c = i * 2 + 1;
        if (c >= n) break;
        if (c + 1 < n && hk[c + 1] < hk[c]) c++;
        if (hk[c] >= lk) break;
        hk[i] = hk[c];
        hv[i] = hv[c];
        i = c;
      }
      hk[i] = lk;
      hv[i] = lv;
    }
    return top;
  }

  compute(gx: number, gy: number) {
    const w = this.world;
    const { cols, rows } = w;
    const { cost, next } = this;
    cost.fill(Infinity);
    next.fill(-1);
    this.hk.length = 0;
    this.hv.length = 0;
    gx = Math.max(0, Math.min(cols - 1, gx));
    gy = Math.max(0, Math.min(rows - 1, gy));
    const g = gy * cols + gx;
    cost[g] = 0;
    this.push(0, g);
    const crawler = this.crawler;
    while (this.hv.length) {
      const hkTop = this.hk[0];
      const i = this.pop();
      if (hkTop > cost[i]) continue;
      const tx = i % cols;
      const ty = (i / cols) | 0;
      for (let d = 0; d < 8; d++) {
        const dir = DIRS[d];
        const nx = tx + dir[0];
        const ny = ty + dir[1];
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const ni = ny * cols + nx;
        if (w.staticBlocked(ni, crawler)) continue;
        if (d >= 4) {
          // diagonal: ambos vizinhos ortogonais não podem ser estáticos
          if (w.staticBlocked(ty * cols + nx, crawler) || w.staticBlocked(ny * cols + tx, crawler)) continue;
        }
        let step = dir[2];
        const s = w.structs[ni];
        if (s && s.alive) step += STRUCT_COST[s.type] ?? 10;
        const nc = hkTop + step;
        if (nc < cost[ni]) {
          cost[ni] = nc;
          next[ni] = i;
          this.push(nc, ni);
        }
      }
    }
  }
}
