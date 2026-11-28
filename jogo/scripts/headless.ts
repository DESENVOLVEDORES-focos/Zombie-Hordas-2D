/* Teste headless da simulação (sem DOM). Execução: ver scripts/run-headless.sh */
import { MAPS } from "../src/game/maps";
import { World } from "../src/game/core/World";
import { FlowField } from "../src/game/ai/FlowField";
import { Game } from "../src/game/core/Game";
import { AudioEngine } from "../src/game/audio/AudioEngine";
import { DEFAULT_BINDINGS } from "../src/game/config/controls";
import { TILE, T } from "../src/game/maps/types";
import { WEAPONS } from "../src/game/config/weapons";
import type { ZombieKind } from "../src/game/config/zombies";

const ASCII = process.argv.includes("--ascii");
let failures = 0;
const fail = (m: string) => {
  failures++;
  console.log("  ✗ FAIL:", m);
};
const ok = (m: string) => console.log("  ✓", m);

// ---------- 1. Mapas ----------
for (const def of MAPS) {
  console.log(`\n== MAPA ${def.name} ==`);
  const w = new World(def);
  const L = w.layout;
  const field = new FlowField(w, false);
  const crawl = new FlowField(w, true);
  field.compute(L.playerSpawn.tx, L.playerSpawn.ty);
  crawl.compute(L.playerSpawn.tx, L.playerSpawn.ty);
  if (w.tileType(L.playerSpawn.tx, L.playerSpawn.ty) !== T.FLOOR) fail("spawn do jogador não está em chão");
  for (const s of L.spawns) {
    if (w.tileType(s.tx, s.ty) !== T.FLOOR) fail(`spawn ${s.tx},${s.ty} não está em chão`);
    else if (!isFinite(field.cost[s.ty * w.cols + s.tx])) fail(`spawn ${s.tx},${s.ty} inalcançável`);
  }
  for (const b of L.buyPoints) {
    if (w.tileType(b.tx, b.ty) !== T.FLOOR) fail(`ponto de compra ${b.kind} ${b.tx},${b.ty} fora do chão`);
    else if (!isFinite(field.cost[b.ty * w.cols + b.tx])) fail(`ponto de compra ${b.tx},${b.ty} inalcançável`);
  }
  // áreas de chão desconectadas
  let floorN = 0;
  let reach = 0;
  for (let i = 0; i < w.cols * w.rows; i++) {
    if (L.tiles[i] === T.FLOOR) {
      floorN++;
      if (isFinite(field.cost[i])) reach++;
    }
  }
  console.log(`  chão: ${floorN}, alcançável: ${reach}, spawns: ${L.spawns.length}, compras: ${L.buyPoints.length}, chokes: ${L.chokePoints.length}`);
  if (reach < floorN) fail(`${floorN - reach} tiles de chão inalcançáveis (ilhas)`);
  else ok("todo o chão é alcançável");
  if (ASCII) {
    const chars: Record<number, string> = { 0: ".", 1: "#", 2: "O", 3: "l", 4: "~" };
    for (let y = 0; y < w.rows; y++) {
      let row = "";
      for (let x = 0; x < w.cols; x++) {
        let c = chars[L.tiles[y * w.cols + x]];
        if (L.spawns.some((s) => s.tx === x && s.ty === y)) c = "Z";
        if (L.buyPoints.some((s) => s.tx === x && s.ty === y)) c = "$";
        if (L.playerSpawn.tx === x && L.playerSpawn.ty === y) c = "P";
        row += c;
      }
      console.log(row);
    }
  }
  void crawl;
}

// ---------- helpers de simulação ----------
function mk(mapIdx: number, diff: "easy" | "normal" | "hard" = "normal") {
  const g = new Game({ map: MAPS[mapIdx], difficulty: diff, audio: new AudioEngine(), bindings: { ...DEFAULT_BINDINGS }, getSensitivity: () => 1 });
  return g;
}
function aimAt(g: Game, x: number, y: number) {
  g.input.mouseX = g.camera.toScreenX(x);
  g.input.mouseY = g.camera.toScreenY(y);
}
function nearest(g: Game) {
  let b = null as null | (typeof g.zombies)[number];
  let bd = Infinity;
  for (const z of g.zombies) {
    if (!z.alive) continue;
    const d = Math.hypot(z.x - g.player.x, z.y - g.player.y);
    if (d < bd) {
      bd = d;
      b = z;
    }
  }
  return b;
}
const DT = 1 / 60;

// ---------- 2. Jogador parado sem atirar: deve morrer ----------
console.log("\n== Teste: jogador passivo morre para a horda ==");
for (let m = 0; m < MAPS.length; m++) {
  const g = mk(m);
  let t = 0;
  while (g.state === "playing" && t < 240) {
    g.update(DT);
    t += DT;
  }
  if (g.state !== "gameover") fail(`${MAPS[m].name}: jogador não morreu em 240s (zumbis não chegam?) wave=${g.waves.wave} alive=${g.waves.aliveCount()}`);
  else ok(`${MAPS[m].name}: game over em ${t.toFixed(0)}s na horda ${g.waves.wave}`);
}

// ---------- 3. Jogador atirando automaticamente + armas ----------
console.log("\n== Teste: jogador ativo atirando (HP infinito) ==");
for (let m = 0; m < MAPS.length; m++) {
  const g = mk(m);
  for (const d of WEAPONS) if (!g.player.weapons[d.slot]) g.weapons.give(d);
  g.weapons.select(3, true);
  let t = 0;
  let maxWave = 0;
  const t0 = Date.now();
  let steps = 0;
  const kinds = new Set<ZombieKind>();
  while (t < 420 && g.state === "playing") {
    g.player.hp = g.player.maxHp;
    g.economy.coins = Math.max(g.economy.coins, 500);
    const z = nearest(g);
    for (const q of g.zombies) kinds.add(q.kind);
    const ws = g.weapons.current();
    ws.reserve = ws.def.maxReserve;
    if (z) {
      aimAt(g, z.x, z.y);
      g.input.mouseDown = true;
      g.input.mousePressed = Math.floor(t * 10) % 2 === 0;
    } else g.input.mouseDown = false;
    g.update(DT);
    t += DT;
    steps++;
    maxWave = Math.max(maxWave, g.waves.wave);
  }
  const ms = Date.now() - t0;
  console.log(`  ${MAPS[m].name}: horda ${maxWave} em ${t.toFixed(0)}s simulados, kills=${g.player.kills}, ${(ms / steps).toFixed(3)} ms/step, tipos vistos: ${[...kinds].join(",")}`);
  if (maxWave < 3) fail("progressão de hordas muito lenta");
  if (g.player.kills < 20) fail("poucos abates");
}

// ---------- 4. Tipos de zumbi forçados ----------
console.log("\n== Teste: comportamentos individuais ==");
{
  const kindsList: ZombieKind[] = ["common", "frenetic", "explosive", "spitter", "tank", "crawler"];
  for (const k of kindsList) {
    for (let m = 0; m < MAPS.length; m++) {
      const g = mk(m);
      g.waves.timer = 9999; // desativa hordas
      const sp = g.world.layout.spawns.slice().sort((a, b) => Math.hypot(b.tx * TILE - g.player.x, b.ty * TILE - g.player.y) - Math.hypot(a.tx * TILE - g.player.x, a.ty * TILE - g.player.y))[0];
      g.waves.wave = k === "tank" ? 15 : 8;
      const z = g.zombieSys.spawn(k, (sp.tx + 0.5) * TILE, (sp.ty + 0.5) * TILE);
      let t = 0;
      let hurt = false;
      let hp0 = g.player.hp;
      let spat = 0;
      while (t < 90 && z.alive) {
        g.update(DT);
        t += DT;
        if (g.player.hp < hp0) hurt = true;
        if (g.combat.projectiles.items.some((p) => p.kind === "spit")) spat++;
        if (g.state === "gameover") break;
      }
      const reached = hurt || !z.alive;
      if (!reached) fail(`${k}@${MAPS[m].name}: não alcançou/feriu o jogador em 90s (pos ${z.x.toFixed(0)},${z.y.toFixed(0)})`);
      else if (m === 0 || m === 2) ok(`${k}@${MAPS[m].name}: ${hurt ? "feriu o jogador" : "morreu"} em ${t.toFixed(1)}s${spat ? " (cuspiu ácido)" : ""}`);
    }
  }
}

// ---------- 5. Barricadas e torretas ----------
console.log("\n== Teste: construção ==");
{
  const g = mk(0);
  g.waves.timer = 9999;
  g.economy.coins = 5000;
  // posiciona o jogador num ponto de gargalo
  const p = g.player;
  const placeAt = (tx: number, ty: number, type: "barricade" | "turret") => {
    g.build.start(type);
    aimAt(g, (tx + 0.5) * TILE, (ty + 0.5) * TILE);
    g.input.mousePressed = true;
    g.update(DT);
  };
  const before = g.economy.coins;
  const c0 = g.build.cost("barricade");
  placeAt(Math.floor(p.x / TILE) + 2, Math.floor(p.y / TILE), "barricade");
  const c1 = g.build.cost("barricade");
  if (g.structures.length !== 1) fail("barricada não foi construída");
  else ok(`barricada construída; custo ${c0} -> ${c1}`);
  if (g.economy.coins !== before - c0) fail("dinheiro não descontado corretamente");
  if (c1 <= c0) fail("custo progressivo não aumentou");
  g.build.start("barricade");
  aimAt(g, p.x, p.y);
  g.input.mousePressed = true;
  g.update(DT);
  if (g.structures.length !== 1) fail("construiu em cima do jogador");
  else ok("posição inválida (sobre o jogador) rejeitada");
  g.build.cancel();
  const t0 = g.build.cost("turret");
  placeAt(Math.floor(p.x / TILE) - 2, Math.floor(p.y / TILE), "turret");
  if (g.structures.filter((s) => s.type === "turret").length !== 1) fail("torreta não construída");
  else ok(`torreta construída; próximo custo ${t0} -> ${g.build.cost("turret")}`);

  // torreta mata zumbis; jogador não atira
  g.waves.phase = "countdown";
  g.waves.timer = 0;
  g.economy.coins = 0;
  let t = 0;
  const tur = g.structures.find((s) => s.type === "turret")!;
  let outOfRangeShots = 0;
  while (t < 60 && g.state === "playing") {
    g.player.hp = g.player.maxHp;
    g.update(DT);
    t += DT;
    for (const pr of g.combat.projectiles.items) {
      if (pr.owner === "turret" && pr.dist > 300) outOfRangeShots++;
    }
  }
  console.log(`  torreta: kills=${g.player.kills} em 60s (HP torreta ${tur.hp.toFixed(0)}/${tur.maxHp})`);
  if (g.player.kills === 0) fail("torreta não abateu nenhum zumbi");
  if (outOfRangeShots > 0) fail("projéteis de torreta ultrapassaram o alcance");

  // zumbis atacam barricada que bloqueia totalmente
  const g2 = mk(0);
  g2.waves.timer = 9999;
  g2.economy.coins = 9999;
  // bloqueia a ponte A-B inteira (x=19..22 e y=6..7) -> zumbis precisam atravessar
  const px = 19 * TILE + 16;
  g2.player.x = px - 3 * TILE;
  g2.player.y = 6.5 * TILE + 0;
  g2.camera.snap(g2.player.x, g2.player.y, g2.world);
  for (const [tx, ty] of [[20, 6], [20, 7]]) {
    g2.build.start("barricade");
    aimAt(g2, (tx + 0.5) * TILE, (ty + 0.5) * TILE);
    g2.input.mousePressed = true;
    g2.update(DT);
  }
  g2.build.cancel();
  console.log(`  barricadas bloqueando ponte: ${g2.structures.length}`);
  g2.player.x = 14 * TILE;
  g2.player.y = 6.5 * TILE;
  g2.camera.snap(g2.player.x, g2.player.y, g2.world);
  g2.flowDirty = true;
  const z = g2.zombieSys.spawn("common", 25.5 * TILE, 6.5 * TILE);
  let tt = 0;
  let broke = false;
  while (tt < 60) {
    g2.player.hp = g2.player.maxHp;
    g2.update(DT);
    tt += DT;
    if (g2.structures.length < 2) {
      broke = true;
      break;
    }
    if (tt > 0.5 && g2.structures.length === 0) break;
  }
  if (!broke) fail(`zumbi não atacou/destruiu a barricada (pos ${z.x.toFixed(0)},${z.y.toFixed(0)}, hp barricada ${g2.structures.map((s) => s.hp.toFixed(0)).join("/")})`);
  else ok(`zumbi destruiu barricada em ${tt.toFixed(1)}s`);
}

// ---------- 6. Compras ----------
console.log("\n== Teste: loja ==");
{
  const g = mk(1);
  g.economy.coins = 100;
  const r1 = g.shop.purchase("weapon:shotgun");
  if (r1.ok) fail("comprou espingarda sem dinheiro");
  else ok("compra sem dinheiro negada: " + r1.msg);
  if (g.economy.coins !== 100) fail("saldo mudou numa compra negada");
  g.economy.coins = 5000;
  const r2 = g.shop.purchase("weapon:shotgun");
  if (!r2.ok || !g.player.weapons[1]) fail("compra de espingarda falhou");
  else ok(`espingarda comprada, saldo ${g.economy.coins}`);
  const r3 = g.shop.purchase("upgrade:damage");
  const dmg1 = g.weapons.stats(g.weapons.current()).damage;
  if (!r3.ok || dmg1 <= 11) fail("melhoria de dano não aplicada");
  else ok(`melhoria de dano aplicada (${dmg1.toFixed(1)})`);
  console.log("  itens no catálogo:", g.shop.catalog().length);
}

console.log(failures ? `\n❌ ${failures} falha(s)` : "\n✅ todos os testes passaram");
process.exit(failures ? 1 : 0);
