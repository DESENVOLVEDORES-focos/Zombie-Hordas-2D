import { MapBuilder } from "./MapBuilder";
import { T, type MapDef } from "./types";

/** MAPA 2 — METRÔ: plataformas, trilhos (fosso), vagão atravessável e salas de manutenção. */
export const metro: MapDef = {
  id: "metro",
  name: "Metrô",
  tagline: "Última estação",
  description:
    "Uma estação subterrânea abandonada. Duas plataformas separadas por trilhos letais só se conectam pelo vagão tombado, pelos túneis e pelos corredores de serviço. Os infectados vêm dos túneis escuros.",
  environment: "Subterrâneo · Interior · Escuro",
  traits: ["Trilhos intransponíveis", "Vagão atravessável", "Salas de manutenção", "6 pontos de entrada"],
  threat: 3,
  theme: {
    zones: [
      { name: "Saguão", floor: "#8a8f94", floor2: "#80858a", pattern: "tiles", line: "rgba(0,0,0,0.22)" },
      { name: "Plataforma", floor: "#6f7377", floor2: "#676b6f", pattern: "tiles", line: "rgba(0,0,0,0.3)" },
      { name: "Túnel", floor: "#3b3a38", floor2: "#353433", pattern: "ballast" },
      { name: "Vagão", floor: "#5a4b46", floor2: "#52443f", pattern: "lines", line: "rgba(0,0,0,0.3)" },
      { name: "Manutenção", floor: "#4a4f45", floor2: "#444940", pattern: "metal", line: "rgba(0,0,0,0.3)" },
    ],
    wallTop: "#5b6068",
    wallSide: "#23262b",
    wallEdge: "#7d838c",
    pitColor: "#121110",
    ambient: 0.5,
    ambientTint: "6,10,16",
    lightRadius: 1.05,
    musicRoot: 49,
    accent: "#4cc9f0",
  },
  build() {
    const b = new MapBuilder(60, 36, T.WALL);
    // Saguão
    b.floor(2, 2, 56, 7, 0);
    // Plataforma N
    b.floor(2, 10, 56, 5, 1);
    b.door(14, 9, 4, 1).door(28, 9, 4, 1).door(42, 9, 4, 1);
    // Trilhos + túneis
    b.pit(4, 15, 52, 5, "rails");
    b.floor(2, 15, 2, 5, 2).floor(56, 15, 2, 5, 2);
    // Plataforma S
    b.floor(2, 20, 56, 5, 1);
    // Salas de manutenção + corredor central
    b.floor(2, 26, 16, 8, 4).floor(19, 26, 22, 8, 0).floor(42, 26, 16, 8, 4);
    b.door(8, 25, 4, 1).door(28, 25, 4, 1).door(48, 25, 4, 1);
    b.door(18, 29, 1, 2, 4).door(41, 29, 1, 2, 4);

    // Vagão tombado sobre os trilhos
    b.fill(22, 15, 16, 5, T.SOLID, 0, "wagon");
    b.floor(23, 16, 14, 3, 3);
    b.door(27, 15, 2, 1, 3).door(31, 15, 2, 1, 3).door(27, 19, 2, 1, 3).door(31, 19, 2, 1, 3);
    b.low(24, 16, "seat", 3, 1).low(29, 16, "seat", 2, 1).low(33, 16, "seat", 3, 1);
    b.low(24, 18, "seat", 3, 1).low(29, 18, "seat", 2, 1).low(33, 18, "seat", 3, 1);

    // Pilares das plataformas
    for (const x of [8, 16, 44, 52]) b.solid(x, 12, "pillar").solid(x, 22, "pillar");
    b.solid(22, 12, "pillar").solid(38, 12, "pillar").solid(22, 22, "pillar").solid(38, 22, "pillar");
    // Bancos de espera
    b.low(10, 13, "bench", 3, 1).low(47, 13, "bench", 3, 1).low(10, 21, "bench", 3, 1).low(47, 21, "bench", 3, 1);
    // Saguão: bilheterias e catracas
    b.solid(6, 4, "machine", 3, 1).solid(51, 4, "machine", 3, 1);
    b.low(15, 9, "barrier", 2, 1).low(43, 9, "barrier", 2, 1);
    b.solid(20, 5, "pillar").solid(39, 5, "pillar").solid(30, 3, "crate", 2, 1);
    b.low(12, 6, "bench", 4, 1).low(44, 6, "bench", 4, 1);
    // Manutenção
    b.solid(4, 28, "machine", 3, 2).solid(12, 31, "crate", 2, 2).solid(6, 32, "locker", 3, 1);
    b.solid(44, 28, "machine", 3, 2).solid(51, 31, "crate", 2, 2).solid(53, 27, "locker", 4, 1);
    b.solid(24, 29, "crate", 2, 2).solid(35, 29, "crate", 2, 2).low(28, 31, "desk", 4, 1);

    // Entradas dos zumbis (túneis, escadas e fundos)
    b.spawn(3, 3).spawn(56, 3).spawn(3, 17).spawn(56, 17).spawn(3, 32).spawn(56, 32);
    b.player(29, 22);
    b.buy(5, 22, "weapon", "shotgun").buy(54, 22, "weapon", "smg").buy(21, 28, "weapon", "rifle");
    b.buy(39, 28, "weapon", "dmr").buy(29, 3, "weapon", "launcher").buy(30, 28, "upgrade");
    b.buy(22, 32, "ammo").buy(37, 32, "medic");

    b.label("SAGUÃO", 8, 8).label("PLATAFORMA NORTE", 30, 14).label("PLATAFORMA SUL", 30, 24).label("MANUTENÇÃO", 10, 33).label("MANUTENÇÃO", 50, 33);
    return b.build();
  },
};
