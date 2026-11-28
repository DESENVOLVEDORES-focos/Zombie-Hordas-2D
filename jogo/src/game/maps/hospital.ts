import { MapBuilder } from "./MapBuilder";
import { T, type MapDef } from "./types";

/** MAPA 3 — HOSPITAL: corredor principal, quartos, centros cirúrgicos, emergência e recepção. */
export const hospital: MapDef = {
  id: "hospital",
  name: "Hospital St. Mary",
  tagline: "Ala de quarentena",
  description:
    "Um hospital abandonado tomado por infectados. Quartos e salas de cirurgia ao norte, emergência e laboratório ao sul, recepção no centro. Camas e mesas baixas escondem rastejantes.",
  environment: "Interior · Clínico · Corredores",
  traits: ["Muitas portas estreitas", "Móveis baixos (rastejantes)", "Recepção central", "6 pontos de entrada"],
  threat: 4,
  theme: {
    zones: [
      { name: "Corredor", floor: "#8d9a9b", floor2: "#869394", pattern: "tiles", line: "rgba(0,0,0,0.2)" },
      { name: "Quarto", floor: "#7f8f9c", floor2: "#788895", pattern: "checker", line: "rgba(0,0,0,0.15)" },
      { name: "Cirurgia", floor: "#5f8a7c", floor2: "#588174", pattern: "tiles", line: "rgba(0,0,0,0.25)" },
      { name: "Emergência", floor: "#9a8486", floor2: "#927c7e", pattern: "tiles", line: "rgba(0,0,0,0.2)" },
      { name: "Recepção", floor: "#9a9078", floor2: "#928870", pattern: "checker", line: "rgba(0,0,0,0.15)" },
      { name: "Laboratório", floor: "#6c8a95", floor2: "#65828d", pattern: "tiles", line: "rgba(0,0,0,0.25)" },
      { name: "Exterior", floor: "#3c4046", floor2: "#373b41", pattern: "plain" },
    ],
    wallTop: "#c4c9cc",
    wallSide: "#5a6166",
    wallEdge: "#e2e6e8",
    pitColor: "#000",
    ambient: 0.48,
    ambientTint: "8,16,16",
    lightRadius: 1.05,
    musicRoot: 46,
    accent: "#ff4d6d",
  },
  build() {
    const b = new MapBuilder(58, 38, T.WALL);
    // Corredor principal
    b.floor(2, 15, 54, 4, 0);
    // Quartos e cirurgias (norte)
    b.floor(2, 2, 8, 12, 1).floor(11, 2, 8, 12, 1).floor(20, 2, 8, 12, 1);
    b.floor(29, 2, 13, 12, 2).floor(43, 2, 13, 12, 2);
    for (const x of [5, 14, 23, 34, 48]) b.door(x, 14, 2, 1, 0);
    // Emergência, recepção, laboratório (sul)
    b.floor(2, 20, 18, 16, 3).floor(21, 20, 16, 15, 4).floor(38, 20, 18, 16, 5);
    b.door(8, 19, 4, 1).door(27, 19, 4, 1).door(45, 19, 4, 1);
    b.door(20, 27, 1, 2, 3).door(37, 27, 1, 2, 5);
    // Entrada principal e exterior
    b.door(27, 35, 4, 1, 4);
    b.floor(22, 36, 14, 1, 6);

    // Quartos: camas
    for (const rx of [2, 11, 20]) {
      b.low(rx + 1, 3, "bed", 2, 1).low(rx + 5, 3, "bed", 2, 1);
      b.low(rx + 1, 7, "bed", 2, 1).low(rx + 5, 7, "bed", 2, 1);
      b.solid(rx + 3, 3, "cabinet").solid(rx + 4, 11, "cabinet", 2, 1);
    }
    // Cirurgias
    for (const sx of [29, 43]) {
      b.low(sx + 5, 5, "table", 3, 2);
      b.solid(sx + 2, 3, "machine", 2, 1).solid(sx + 9, 3, "machine", 2, 1);
      b.solid(sx + 2, 10, "cabinet", 3, 1).low(sx + 8, 10, "table", 3, 1);
    }
    // Emergência: leitos
    for (const bx of [3, 7, 11, 15]) {
      b.low(bx, 22, "bed", 2, 1);
      b.low(bx, 26, "bed", 2, 1);
    }
    b.solid(3, 32, "cabinet", 2, 1).solid(16, 32, "cabinet", 3, 1).solid(9, 30, "machine", 2, 2);
    b.low(5, 29, "table", 3, 1);
    // Recepção
    b.low(22, 23, "seat", 5, 1).low(31, 23, "seat", 5, 1);
    b.solid(24, 30, "counter", 9, 1);
    b.solid(22, 21, "pillar").solid(35, 21, "pillar");
    b.low(22, 26, "seat", 1, 3).low(36, 24, "seat", 1, 2);
    // Laboratório / necrotério
    b.solid(40, 22, "cabinet", 4, 1).solid(47, 22, "cabinet", 4, 1).solid(53, 22, "cabinet", 2, 1);
    b.low(41, 27, "table", 3, 2).low(47, 27, "table", 3, 2);
    b.solid(40, 33, "machine", 3, 1).solid(52, 32, "cabinet", 3, 2);

    b.spawn(3, 2).spawn(54, 3).spawn(3, 34).spawn(54, 34).spawn(23, 36).spawn(34, 36);
    b.player(28, 25);
    b.buy(22, 33, "ammo").buy(35, 22, "upgrade").buy(36, 33, "medic");
    b.buy(3, 21, "weapon", "smg").buy(22, 22, "weapon", "shotgun").buy(54, 21, "weapon", "rifle");
    b.buy(30, 3, "weapon", "dmr").buy(44, 3, "weapon", "launcher");

    b.label("CORREDOR PRINCIPAL", 28, 17).label("EMERGÊNCIA", 11, 34).label("RECEPÇÃO", 29, 33).label("LABORATÓRIO", 47, 34);
    b.label("QUARTO 1", 6, 13).label("QUARTO 2", 15, 13).label("QUARTO 3", 24, 13).label("CIRURGIA A", 35, 13).label("CIRURGIA B", 49, 13);
    return b.build();
  },
};
