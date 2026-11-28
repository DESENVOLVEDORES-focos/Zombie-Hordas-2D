import { useEffect, useRef } from "react";
import { ZOMBIES, type ZombieKind } from "../game/config/zombies";
import type { Zombie } from "../game/core/types";
import { drawZombie } from "../game/render/sprites";

function fake(kind: ZombieKind, x: number, y: number, angle: number): Zombie {
  const def = ZOMBIES[kind];
  return {
    id: Math.floor(Math.random() * 1e6), kind, def, x, y, kx: 0, ky: 0, radius: def.radius, hp: 1, maxHp: 1, speed: def.speed,
    damage: 0, angle, walk: Math.random() * 6, attackCd: 0, attackWind: 0, swing: 0, hitFlash: 0, target: null, fuse: -1, spitCd: 0,
    lungeT: 0, lungeCd: 0, lungeDx: 0, lungeDy: 0, groanT: 0, stuckT: 0, stuckX: 0, stuckY: 0, wanderT: 0, wanderAng: 0, losT: 0,
    hasLos: false, sight: false, alive: true, deathT: 0, spawnT: 1, pendDmg: 0, dmgTextCd: 0, crawler: def.crossLow, selfDestruct: false, wants: false,
  };
}

/** Fundo animado do lobby: horda de zumbis caminhando sob névoa. */
export function LobbyBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const c = cv.getContext("2d")!;
    const kinds: ZombieKind[] = ["common", "common", "frenetic", "common", "tank", "crawler", "common", "explosive", "spitter", "common", "common", "frenetic"];
    let W = 0;
    let H = 0;
    const zs = kinds.map((k, i) => ({ z: fake(k, 0, 0, 0), sp: 20 + Math.random() * 50, y: 0.1 + (i / kinds.length) * 0.85, x: Math.random() }));
    const resize = () => {
      W = cv.width = cv.clientWidth;
      H = cv.height = cv.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      c.fillStyle = "#07090a";
      c.fillRect(0, 0, W, H);
      // grade de chão
      c.strokeStyle = "rgba(142,203,62,0.045)";
      c.lineWidth = 1;
      const g = 64;
      c.beginPath();
      for (let x = 0; x < W; x += g) {
        c.moveTo(x, 0);
        c.lineTo(x, H);
      }
      for (let y = 0; y < H; y += g) {
        c.moveTo(0, y);
        c.lineTo(W, y);
      }
      c.stroke();
      const t = now / 1000;
      for (const o of zs) {
        o.x += (o.sp * dt) / W;
        if (o.x > 1.1) {
          o.x = -0.1;
          o.y = 0.08 + Math.random() * 0.85;
        }
        const z = o.z;
        z.x = o.x * W;
        z.y = o.y * H;
        z.angle = 0.05 * Math.sin(t + o.y * 9);
        z.walk += o.sp * dt * 0.09;
        c.save();
        c.translate(z.x, z.y);
        c.scale(3.2, 3.2);
        c.translate(-z.x, -z.y);
        c.globalAlpha = 0.5;
        drawZombie(c, z, t);
        c.restore();
      }
      const v = c.createRadialGradient(W * 0.6, H * 0.5, H * 0.1, W * 0.5, H * 0.5, H * 0.95);
      v.addColorStop(0, "rgba(5,7,6,0.25)");
      v.addColorStop(1, "rgba(5,7,6,0.97)");
      c.fillStyle = v;
      c.fillRect(0, 0, W, H);
      const l = c.createLinearGradient(0, 0, W * 0.55, 0);
      l.addColorStop(0, "rgba(5,7,6,0.95)");
      l.addColorStop(1, "rgba(5,7,6,0)");
      c.fillStyle = l;
      c.fillRect(0, 0, W * 0.55, H);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
