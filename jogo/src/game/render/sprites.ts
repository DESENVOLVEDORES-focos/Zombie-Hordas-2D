import type { WeaponDef } from "../config/weapons";
import type { Pickup, Player, Structure, Zombie } from "../core/types";

type Ctx = CanvasRenderingContext2D;

function ell(c: Ctx, x: number, y: number, rx: number, ry: number) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}
function circ(c: Ctx, x: number, y: number, r: number) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
}

// ---------------------------------------------------------------- JOGADOR
export function drawPlayer(c: Ctx, p: Player, weapon: WeaponDef, dead = false) {
  c.save();
  c.translate(p.x, p.y);
  c.fillStyle = "rgba(0,0,0,0.35)";
  ell(c, 1, 3, 12, 10);
  c.fill();
  if (dead) {
    c.rotate(p.angle);
    c.fillStyle = "#2c5f45";
    ell(c, 0, 0, 11, 7);
    c.fill();
    c.fillStyle = "#b8322a";
    circ(c, 8, 0, 5.5);
    c.fill();
    c.restore();
    return;
  }
  // pés (alinhados à direção do movimento)
  const amp = Math.min(1, p.speedNow / 120) * 5.5;
  const sw = Math.sin(p.walk) * amp;
  c.save();
  c.rotate(p.moveAngle);
  c.fillStyle = "#1b1b1f";
  ell(c, sw, -4.5, 5, 3.2);
  c.fill();
  ell(c, -sw, 4.5, 5, 3.2);
  c.fill();
  c.restore();

  c.rotate(p.angle);
  const kick = p.recoil * 2.2;
  // arma
  const gx = 8 - kick;
  c.fillStyle = weapon.color;
  c.fillRect(gx, -weapon.gunWidth / 2, weapon.gunLen, weapon.gunWidth);
  c.fillStyle = "rgba(255,255,255,0.18)";
  c.fillRect(gx, -weapon.gunWidth / 2, weapon.gunLen, 1);
  if (weapon.id === "dmr") {
    c.fillStyle = "#0e1118";
    c.fillRect(gx + 5, -weapon.gunWidth / 2 - 2, 7, 2.2);
  }
  if (weapon.id === "launcher") {
    c.fillStyle = "#2a1a1a";
    c.fillRect(gx + weapon.gunLen - 4, -weapon.gunWidth / 2 - 1, 4, weapon.gunWidth + 2);
  }
  // braços
  c.strokeStyle = "#2c5f45";
  c.lineCap = "round";
  c.lineWidth = 4.2;
  c.beginPath();
  c.moveTo(0, -8);
  c.lineTo(gx + 6, -1.5);
  c.moveTo(0, 8);
  c.lineTo(gx + Math.min(13, weapon.gunLen - 3), 1.5);
  c.stroke();
  c.fillStyle = "#e0b48a";
  circ(c, gx + 6.5, -1.5, 2.4);
  c.fill();
  circ(c, gx + Math.min(13, weapon.gunLen - 3) + 0.5, 1.5, 2.4);
  c.fill();
  // tronco
  c.fillStyle = "#2f6f4f";
  ell(c, -0.5, 0, 6.8, 11.8);
  c.fill();
  c.strokeStyle = "#173a29";
  c.lineWidth = 1.2;
  c.stroke();
  c.fillStyle = "#1f4a35";
  c.fillRect(-6.5, -4, 4, 8); // mochila
  // cabeça
  c.fillStyle = "#e0b48a";
  circ(c, 1, 0, 5.6);
  c.fill();
  c.fillStyle = "#b8322a";
  circ(c, 0, 0, 5.8);
  c.fill();
  c.fillRect(2, -3.2, 5.5, 6.4);
  c.fillStyle = "#8f2620";
  c.fillRect(6.2, -3.2, 1.5, 6.4);
  if (p.hurtFlash > 0) {
    c.fillStyle = `rgba(255,40,40,${Math.min(0.55, p.hurtFlash * 0.55)})`;
    ell(c, 0, 0, 8, 12.5);
    c.fill();
  }
  c.restore();
}

// ---------------------------------------------------------------- ZUMBIS
export function drawZombie(c: Ctx, z: Zombie, time: number, forcedPhase?: number) {
  const def = z.def;
  const s = def.scale;
  const dead = !z.alive;
  c.save();
  c.translate(z.x, z.y);
  let alpha = 1;
  if (dead) {
    alpha = Math.max(0, 1 - z.deathT / 1.4);
    if (alpha <= 0) {
      c.restore();
      return;
    }
  } else if (z.spawnT < 1) {
    alpha = z.spawnT;
    c.translate(0, (1 - z.spawnT) * 8);
  }
  c.globalAlpha = alpha;
  // sombra
  c.fillStyle = "rgba(0,0,0,0.33)";
  ell(c, 1, 3, 12 * s, 10 * s);
  c.fill();

  c.rotate(z.angle + (dead ? Math.min(1, z.deathT * 4) * 0.6 : 0));
  const ph = forcedPhase ?? z.walk;
  const sw = dead ? 0 : Math.sin(ph);
  const reach = 7 + z.swing * 9 + (dead ? -4 : 0);
  const col = def.colors;
  const flash = z.hitFlash > 0;
  const skin = flash ? "#ffffff" : col.skin;
  const cloth = flash ? "#f0f0f0" : col.cloth;
  if (dead) c.scale(1 + z.deathT * 0.15, 1 - Math.min(0.35, z.deathT * 0.8));

  switch (z.kind) {
    case "crawler": {
      // membros em "teia" rente ao chão
      c.strokeStyle = skin;
      c.lineWidth = 3;
      c.lineCap = "round";
      c.beginPath();
      for (let i = 0; i < 2; i++) {
        const d = i === 0 ? 1 : -1;
        const o = Math.sin(ph * 1.6 + i * Math.PI) * 4;
        c.moveTo(3, d * 4);
        c.lineTo(13 + o + z.swing * 6, d * 11);
        c.moveTo(-4, d * 4);
        c.lineTo(-9 - o, d * 11);
      }
      c.stroke();
      c.fillStyle = cloth;
      ell(c, 0, 0, 10, 6.5);
      c.fill();
      c.fillStyle = col.accent;
      c.fillRect(-4, -1, 6, 2);
      c.fillStyle = skin;
      circ(c, 9, 0, 4.6);
      c.fill();
      c.fillStyle = "#c33";
      c.fillRect(11, -2.2, 1.6, 1.6);
      c.fillRect(11, 0.8, 1.6, 1.6);
      break;
    }
    case "tank": {
      c.save();
      c.scale(s, s);
      const arm = reach + 3;
      c.strokeStyle = skin;
      c.lineCap = "round";
      c.lineWidth = 6;
      c.beginPath();
      c.moveTo(0, -9);
      c.lineTo(arm + sw * 2, -9);
      c.moveTo(0, 9);
      c.lineTo(arm - sw * 2, 9);
      c.stroke();
      c.fillStyle = flash ? "#fff" : "#6d4540";
      circ(c, arm + sw * 2 + 1, -9, 5);
      c.fill();
      circ(c, arm - sw * 2 + 1, 9, 5);
      c.fill();
      c.fillStyle = cloth;
      ell(c, 0, 0, 8.5, 12.5);
      c.fill();
      c.fillStyle = flash ? "#fff" : col.accent;
      c.fillRect(-3, -14, 8, 6);
      c.fillRect(-3, 8, 8, 6);
      c.fillStyle = skin;
      circ(c, 2, 0, 5.2);
      c.fill();
      c.fillStyle = "#222";
      c.fillRect(4, -2, 3, 4);
      c.restore();
      break;
    }
    case "explosive": {
      const pulse = z.fuse >= 0 ? 1 + Math.sin(time * 40) * 0.1 : 1;
      c.scale(s * pulse, s * pulse);
      c.strokeStyle = skin;
      c.lineWidth = 3.5;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(0, -8);
      c.lineTo(reach - 1 + sw * 2, -7);
      c.moveTo(0, 8);
      c.lineTo(reach - 1 - sw * 2, 7);
      c.stroke();
      const hot = z.fuse >= 0 && Math.floor(time * 14) % 2 === 0;
      c.fillStyle = hot ? "#fff3c0" : flash ? "#fff" : "#c9a24a";
      ell(c, 0, 0, 9.5, 10.5);
      c.fill();
      c.fillStyle = hot ? "#ff3b1f" : col.accent;
      for (const [x, y, r] of [[-2, -5, 2.6], [2, 3, 3], [-4, 4, 2], [3, -2, 2]] as const) {
        circ(c, x, y, r);
        c.fill();
      }
      c.fillStyle = skin;
      circ(c, 4, 0, 4.8);
      c.fill();
      break;
    }
    case "spitter": {
      c.scale(s, s);
      c.strokeStyle = skin;
      c.lineWidth = 3.4;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(0, -8);
      c.lineTo(reach - 2 + sw * 2, -6);
      c.moveTo(0, 8);
      c.lineTo(reach - 2 - sw * 2, 6);
      c.stroke();
      c.fillStyle = cloth;
      ell(c, 0, 0, 7, 11);
      c.fill();
      c.fillStyle = skin;
      circ(c, 2, 0, 6);
      c.fill();
      const glow = 0.6 + Math.sin(time * 6 + z.id) * 0.25 + z.swing * 0.4;
      c.fillStyle = `rgba(182,255,60,${Math.min(1, glow)})`;
      circ(c, 7, 0, 3.8 + z.swing * 2);
      c.fill();
      c.fillStyle = "#2a4a12";
      circ(c, 8, 0, 1.6);
      c.fill();
      break;
    }
    default: {
      // comum e frenético
      const fren = z.kind === "frenetic";
      c.scale(s, s);
      if (fren && !dead) {
        c.strokeStyle = "rgba(255,80,60,0.25)";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(-10, -4);
        c.lineTo(-22, -4);
        c.moveTo(-10, 4);
        c.lineTo(-24, 4);
        c.stroke();
      }
      const sp = fren ? 1.7 : 1;
      c.strokeStyle = skin;
      c.lineWidth = fren ? 3 : 3.6;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(0, -8);
      c.lineTo(reach + Math.sin(ph * sp) * 3, -8 + (fren ? Math.sin(ph) * 2 : 0));
      c.moveTo(0, 8);
      c.lineTo(reach - Math.sin(ph * sp) * 3, 8 - (fren ? Math.sin(ph) * 2 : 0));
      c.stroke();
      c.fillStyle = cloth;
      ell(c, 0, 0, fren ? 6 : 7, fren ? 10 : 11.5);
      c.fill();
      c.fillStyle = col.accent;
      if (fren) c.fillRect(-4, -2, 7, 4);
      else {
        circ(c, -1, 4, 3);
        c.fill();
      }
      c.fillStyle = skin;
      circ(c, 2, 0, 5.6);
      c.fill();
      c.fillStyle = flash ? "#ddd" : "#2b1c1a";
      c.beginPath();
      c.arc(0.5, 0, 5.4, Math.PI * 0.55, Math.PI * 1.45);
      c.fill();
      if (fren) {
        c.fillStyle = "#ff3a2a";
        c.fillRect(5, -3, 1.6, 1.6);
        c.fillRect(5, 1.4, 1.6, 1.6);
      }
    }
  }
  c.restore();

  // barra de vida
  if (!dead && z.hp < z.maxHp && z.spawnT >= 1) {
    const w = 20 * Math.max(1, s * 0.9);
    const y = z.y - z.radius * s - 9;
    c.fillStyle = "rgba(0,0,0,0.6)";
    c.fillRect(z.x - w / 2 - 1, y - 1, w + 2, 4);
    c.fillStyle = z.hp / z.maxHp > 0.4 ? "#e24b4b" : "#ff8a3c";
    c.fillRect(z.x - w / 2, y, (w * Math.max(0, z.hp)) / z.maxHp, 2);
  }
}

// ---------------------------------------------------------------- ESTRUTURAS
export function drawBarricade(c: Ctx, s: Structure, alpha = 1) {
  const x = s.x - 16;
  const y = s.y - 16;
  const frac = Math.max(0, s.hp / s.maxHp);
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = "rgba(0,0,0,0.3)";
  c.fillRect(x + 2, y + 3, 32, 32);
  c.fillStyle = "#3b2a18";
  c.fillRect(x, y, 32, 32);
  // postes
  c.fillStyle = "#5a3f23";
  c.fillRect(x + 1, y, 4, 32);
  c.fillRect(x + 27, y, 4, 32);
  const planks = Math.max(1, Math.ceil(frac * 4));
  const cols = ["#a8794a", "#96693c", "#b5864f", "#9f7243"];
  for (let i = 0; i < 4; i++) {
    const py = y + 1 + i * 7.6;
    if (i >= planks) {
      // tábua quebrada (lascas)
      c.fillStyle = "#6a4a28";
      c.fillRect(x + 3 + (i % 2) * 14, py + 2, 8, 3);
      continue;
    }
    c.save();
    c.translate(x + 16, py + 3.2);
    c.rotate((frac < 0.7 ? (i % 2 ? 1 : -1) * (0.7 - frac) * 0.12 : 0));
    c.fillStyle = cols[i];
    c.fillRect(-15, -3.2, 30, 6.4);
    c.fillStyle = "rgba(0,0,0,0.25)";
    c.fillRect(-15, 2.4, 30, 1);
    c.fillStyle = "#3a3a3a";
    circ(c, -11, 0, 1);
    c.fill();
    circ(c, 11, 0, 1);
    c.fill();
    c.restore();
  }
  if (frac < 0.66) {
    c.strokeStyle = "rgba(0,0,0,0.6)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x + 8, y + 3);
    c.lineTo(x + 13, y + 14);
    c.lineTo(x + 10, y + 22);
    if (frac < 0.33) {
      c.moveTo(x + 24, y + 6);
      c.lineTo(x + 20, y + 18);
      c.lineTo(x + 25, y + 28);
    }
    c.stroke();
  }
  if (s.hitFlash > 0) {
    c.fillStyle = `rgba(255,255,255,${s.hitFlash * 3})`;
    c.fillRect(x, y, 32, 32);
  }
  c.restore();
  if (frac < 1 && alpha >= 1) hpBar(c, s.x, y - 4, 26, frac);
}

export function drawTurret(c: Ctx, s: Structure, alpha = 1, angleOverride?: number) {
  const ang = angleOverride ?? s.angle;
  const frac = Math.max(0, s.hp / s.maxHp);
  c.save();
  c.globalAlpha = alpha;
  c.translate(s.x, s.y);
  c.fillStyle = "rgba(0,0,0,0.3)";
  c.fillRect(-12, -10, 28, 28);
  c.fillStyle = "#3a3f47";
  c.fillRect(-15, -15, 30, 30);
  c.strokeStyle = "#1c1f24";
  c.lineWidth = 2;
  c.strokeRect(-14, -14, 28, 28);
  c.fillStyle = "#8a8f98";
  for (const [x, y] of [[-11, -11], [11, -11], [-11, 11], [11, 11]]) {
    circ(c, x, y, 1.8);
    c.fill();
  }
  c.fillStyle = "#262a30";
  circ(c, 0, 0, 10.5);
  c.fill();
  c.rotate(ang);
  c.fillStyle = "#8b929c";
  c.fillRect(5, -5.5, 15, 3.6);
  c.fillRect(5, 1.9, 15, 3.6);
  c.fillStyle = "#c2c8d0";
  c.fillRect(5, -5.5, 15, 1);
  c.fillRect(5, 1.9, 15, 1);
  c.fillStyle = "#5f6b78";
  circ(c, 0, 0, 8);
  c.fill();
  c.fillStyle = "#e33";
  circ(c, -3.5, 0, 1.8);
  c.fill();
  if (s.flash > 0) {
    c.fillStyle = "#ffe08a";
    circ(c, 22, -3.7, 3.5);
    c.fill();
    circ(c, 22, 3.7, 3.5);
    c.fill();
  }
  c.restore();
  if (s.hitFlash > 0) {
    c.fillStyle = `rgba(255,255,255,${s.hitFlash * 3})`;
    c.fillRect(s.x - 15, s.y - 15, 30, 30);
  }
  if (frac < 1 && alpha >= 1) hpBar(c, s.x, s.y - 22, 28, frac);
}

function hpBar(c: Ctx, cx: number, y: number, w: number, frac: number) {
  c.fillStyle = "rgba(0,0,0,0.65)";
  c.fillRect(cx - w / 2 - 1, y - 1, w + 2, 5);
  c.fillStyle = frac > 0.5 ? "#6bd66b" : frac > 0.25 ? "#f0b43c" : "#e24b4b";
  c.fillRect(cx - w / 2, y, w * frac, 3);
}

// ---------------------------------------------------------------- ITENS
export function drawPickup(c: Ctx, k: Pickup) {
  const bob = Math.sin(k.t * 5) * 1.5;
  const fade = k.life < 4 ? (Math.floor(k.t * 8) % 2 ? 0.35 : 1) : 1;
  c.save();
  c.globalAlpha = fade;
  c.translate(k.x, k.y + bob);
  c.fillStyle = "rgba(0,0,0,0.3)";
  ell(c, 1, 6, 8, 4);
  c.fill();
  if (k.kind === "ammo") {
    c.fillStyle = "#5a6b3a";
    c.fillRect(-8, -6, 16, 12);
    c.strokeStyle = "#2f3a1c";
    c.lineWidth = 1.5;
    c.strokeRect(-8, -6, 16, 12);
    c.fillStyle = "#e0b840";
    for (let i = 0; i < 3; i++) c.fillRect(-5 + i * 4, -4, 2.5, 7);
  } else {
    c.fillStyle = "#f2f2f2";
    c.fillRect(-8, -7, 16, 14);
    c.strokeStyle = "#999";
    c.lineWidth = 1.5;
    c.strokeRect(-8, -7, 16, 14);
    c.fillStyle = "#d62b2b";
    c.fillRect(-2, -5, 4, 10);
    c.fillRect(-5, -2, 10, 4);
  }
  c.restore();
}

export function drawBuyPad(c: Ctx, x: number, y: number, kind: string, color: string, near: boolean, t: number, weapon?: WeaponDef) {
  c.save();
  c.translate(x, y);
  const glow = near ? 0.6 + Math.sin(t * 6) * 0.25 : 0.25;
  c.fillStyle = "rgba(0,0,0,0.5)";
  c.fillRect(-13, -13, 26, 26);
  c.strokeStyle = color;
  c.globalAlpha = 0.5 + glow;
  c.lineWidth = 2;
  c.strokeRect(-13, -13, 26, 26);
  c.globalAlpha = 1;
  if (kind === "weapon" && weapon) {
    c.fillStyle = weapon.color === "#2b2f36" ? "#6a7078" : weapon.color;
    const len = Math.min(20, weapon.gunLen + 2);
    c.fillRect(-len / 2, -weapon.gunWidth / 2 - 1, len, weapon.gunWidth + 2);
    c.fillStyle = color;
    c.fillRect(-len / 2, weapon.gunWidth / 2 + 3, len, 2);
  } else if (kind === "ammo") {
    c.fillStyle = "#e0b840";
    for (let i = 0; i < 3; i++) c.fillRect(-7 + i * 5, -6, 3.5, 12);
    c.fillStyle = "#a07a20";
    for (let i = 0; i < 3; i++) c.fillRect(-7 + i * 5, -6, 3.5, 3);
  } else if (kind === "medic") {
    c.fillStyle = "#f2f2f2";
    c.fillRect(-9, -9, 18, 18);
    c.fillStyle = "#d62b2b";
    c.fillRect(-2.5, -7, 5, 14);
    c.fillRect(-7, -2.5, 14, 5);
  } else {
    // bancada de melhorias: engrenagem
    c.fillStyle = color;
    circ(c, 0, 0, 6.5);
    c.fill();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + t * 0.5;
      c.fillRect(Math.cos(a) * 8 - 1.8, Math.sin(a) * 8 - 1.8, 3.6, 3.6);
    }
    c.fillStyle = "#222";
    circ(c, 0, 0, 2.6);
    c.fill();
  }
  c.restore();
}
