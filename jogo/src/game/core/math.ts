export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
export const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));
export const chance = (p: number) => Math.random() < p;
export const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(bx - ax, by - ay);

/** menor diferença angular com sinal (b - a) em [-PI, PI] */
export function angleDiff(a: number, b: number): number {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

export function rotateToward(cur: number, target: number, maxStep: number): number {
  const d = angleDiff(cur, target);
  if (Math.abs(d) <= maxStep) return target;
  return cur + Math.sign(d) * maxStep;
}

/** distribuição aproximadamente normal em [-1, 1] */
export const gauss = () => (Math.random() + Math.random() + Math.random()) / 1.5 - 1;

export function distToRect(px: number, py: number, rx: number, ry: number, rw: number, rh: number): number {
  const cx = clamp(px, rx, rx + rw);
  const cy = clamp(py, ry, ry + rh);
  return Math.hypot(px - cx, py - cy);
}
