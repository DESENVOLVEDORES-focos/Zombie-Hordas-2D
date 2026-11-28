import { MapBuilder } from "./MapBuilder";
import { T, type MapDef } from "./types";

/** MAPA 4 — ESCOLA: salas de aula, corredor, biblioteca, refeitório, pátio e quadra. */
export const school: MapDef = {
  id: "school",
  name: "Escola Vila Nova",
  tagline: "O sinal tocou pela última vez",
  description:
    "Escola abandonada com salas de aula, biblioteca, refeitório, um grande pátio central e uma quadra coberta. Muitos espaços abertos e portas largas exigem barricadas bem planejadas.",
  environment: "Interior + Pátio · Diurno sombrio",
  traits: ["Pátio aberto", "Quadra coberta", "Carteiras baixas (rastejantes)", "7 pontos de entrada"],
  threat: 3,
  theme: {
    zones: [
      { name: "Corredor", floor: "#a79d86", floor2: "#9f957f", pattern: "checker", line: "rgba(0,0,0,0.12)" },
      { name: "Sala de aula", floor: "#8d7656", floor2: "#85704f", pattern: "wood", line: "rgba(0,0,0,0.25)" },
      { name: "Biblioteca", floor: "#6a4f58", floor2: "#634852", pattern: "carpet" },
      { name: "Refeitório", floor: "#9ba39a", floor2: "#939b92", pattern: "checker", line: "rgba(0,0,0,0.12)" },
      { name: "Banheiros", floor: "#6f98a3", floor2: "#678f9a", pattern: "tiles", line: "rgba(0,0,0,0.25)" },
      { name: "Pátio", floor: "#4d6b3f", floor2: "#476439", pattern: "grass" },
      { name: "Quadra", floor: "#a8683a", floor2: "#9f6136", pattern: "court", line: "rgba(255,255,255,0.6)" },
    ],
    wallTop: "#b9a98e",
    wallSide: "#5b4e3d",
    wallEdge: "#d8cbb2",
    pitColor: "#000",
    ambient: 0.36,
    ambientTint: "22,16,26",
    lightRadius: 1,
    musicRoot: 52,
    accent: "#8ecb3e",
  },
  build() {
    const b = new MapBuilder(60, 40, T.WALL);
    // Salas de aula (norte)
    for (const x of [2, 13, 24, 35]) b.floor(x, 2, 10, 8, 1);
    b.floor(46, 2, 12, 8, 2); // biblioteca
    for (const x of [6, 17, 28, 39]) b.door(x, 10, 2, 1, 0);
    b.door(51, 10, 2, 1, 0);
    // Corredor
    b.floor(2, 11, 56, 3, 0);
    // Refeitório
    b.floor(2, 15, 23, 7, 3);
    b.door(6, 14, 4, 1, 0);
    // Hall central + pátio
    b.floor(26, 14, 8, 9, 0);
    b.floor(13, 23, 21, 15, 5);
    b.door(25, 17, 1, 2, 3);
    b.door(18, 22, 4, 1, 3);
    // Banheiros / depósito (sudoeste)
    b.floor(2, 23, 10, 15, 4);
    b.door(12, 29, 1, 2, 4);
    // Quadra
    b.floor(35, 15, 23, 23, 6);
    b.door(34, 17, 1, 2, 0);
    b.door(34, 30, 1, 2, 6);
    b.door(49, 14, 4, 1, 0);

    // Salas de aula: carteiras
    for (const x of [2, 13, 24, 35]) {
      for (const dy of [4, 6, 8]) {
        b.low(x + 1, dy, "desk", 2, 1).low(x + 4, dy, "desk", 2, 1).low(x + 7, dy, "desk", 2, 1);
      }
      b.solid(x + 1, 2, "cabinet", 3, 1);
    }
    // Biblioteca
    for (const y of [3, 5, 7]) b.solid(47, y, "shelf", 4, 1).solid(54, y, "shelf", 2, 1);
    b.low(51, 2, "table", 2, 1);
    // Refeitório
    for (const y of [16, 19]) for (const x of [9, 14, 19]) b.low(x, y, "table", 3, 1);
    b.solid(3, 15, "counter", 1, 6);
    // Hall
    b.solid(27, 15, "pillar").solid(32, 15, "pillar");
    b.low(28, 20, "bench", 4, 1);
    // Pátio
    for (const [x, y] of [
      [16, 26],
      [31, 26],
      [16, 35],
      [31, 35],
    ])
      b.solid(x, y, "tree");
    b.low(21, 29, "bench", 5, 1).low(21, 33, "bench", 5, 1);
    b.solid(23, 31, "pillar").solid(24, 31, "pillar");
    b.low(14, 30, "bench", 1, 3);
    // Banheiros
    b.solid(3, 25, "cabinet", 1, 4).solid(3, 31, "cabinet", 1, 4).solid(10, 25, "cabinet", 1, 3).solid(6, 36, "cabinet", 4, 1);
    b.low(6, 28, "bench", 3, 1);
    // Quadra
    b.solid(36, 26, "pillar").solid(56, 26, "pillar");
    b.low(37, 16, "bench", 5, 1).low(51, 16, "bench", 5, 1);
    b.low(37, 36, "bench", 5, 1).low(51, 36, "bench", 5, 1);
    b.solid(46, 18, "crate", 2, 1).solid(46, 33, "crate", 2, 1);

    b.spawn(3, 3).spawn(43, 3).spawn(56, 3).spawn(4, 16).spawn(56, 36).spawn(23, 37).spawn(3, 36);
    b.player(29, 25);
    b.buy(27, 21, "weapon", "shotgun").buy(4, 20, "weapon", "smg").buy(36, 16, "weapon", "rifle");
    b.buy(47, 2, "weapon", "dmr").buy(3, 24, "weapon", "launcher").buy(20, 24, "upgrade");
    b.buy(31, 37, "ammo").buy(13, 16, "medic");

    b.label("SALA 1", 7, 9).label("SALA 2", 18, 9).label("SALA 3", 29, 9).label("SALA 4", 40, 9).label("BIBLIOTECA", 52, 9);
    b.label("REFEITÓRIO", 14, 21).label("PÁTIO", 23, 37).label("QUADRA", 46, 36).label("CORREDOR", 30, 12);
    return b.build();
  },
};
