import { MapBuilder } from "./MapBuilder";
import { T, type MapDef } from "./types";

/** MAPA 1 — TELHADOS: cinco telhados ligados por passarelas estreitas sobre a rua. */
export const rooftops: MapDef = {
  id: "rooftops",
  name: "Telhados",
  tagline: "Sobre a cidade morta",
  description:
    "Cinco telhados interligados por passarelas metálicas sobre ruas tomadas pela infestação. As escadas de acesso despejam zumbis nas bordas. Quem controlar as pontes, controla a horda.",
  environment: "Urbano · Exterior · Noite",
  traits: ["Áreas abertas", "Passarelas estreitas", "5 pontos de entrada", "Ideal para torretas"],
  threat: 2,
  theme: {
    zones: [
      { name: "Concreto", floor: "#4a4d52", floor2: "#45484d", pattern: "tiles", line: "rgba(0,0,0,0.25)" },
      { name: "Piche", floor: "#34373b", floor2: "#303337", pattern: "plain", line: "rgba(0,0,0,0.2)" },
      { name: "Passarela", floor: "#6b5a44", floor2: "#5f4f3b", pattern: "metal", line: "rgba(0,0,0,0.35)" },
    ],
    wallTop: "#6a6e75",
    wallSide: "#2c2f34",
    wallEdge: "#8c9098",
    pitColor: "#0d0f12",
    ambient: 0.4,
    ambientTint: "10,14,28",
    lightRadius: 1,
    musicRoot: 55,
    accent: "#f5a524",
  },
  build() {
    const b = new MapBuilder(56, 36, T.PIT);
    b.fill(0, 0, 56, 36, T.PIT, 0, "gap");
    // Telhados
    b.floor(2, 2, 17, 13, 0); // A
    b.floor(23, 2, 31, 10, 1); // B
    b.floor(2, 19, 14, 15, 1); // C
    b.floor(20, 16, 16, 18, 0); // D (centro-sul)
    b.floor(40, 15, 14, 19, 1); // E
    // Passarelas (zona 2)
    const bridge = (x: number, y: number, w: number, h: number) => {
      b.floor(x, y, w, h, 2);
      b.choke(x + Math.floor(w / 2), y + Math.floor(h / 2));
      b.choke(x + Math.floor((w - 1) / 2), y + Math.floor((h - 1) / 2));
    };
    bridge(19, 6, 4, 2); // A-B
    bridge(8, 15, 2, 4); // A-C
    bridge(27, 12, 2, 4); // B-D
    bridge(46, 12, 2, 3); // B-E
    bridge(16, 25, 4, 2); // C-D
    bridge(36, 24, 4, 2); // D-E
    // Borda do mapa
    b.border(1);

    // Cabine de escada A (SO)
    b.wall(2, 11, 5, 4).floor(3, 12, 3, 2, 0);
    b.floor(6, 12, 1, 2, 0).spawn(3, 12);
    // Cabine B (NE)
    b.wall(50, 2, 4, 4).floor(51, 3, 2, 2, 1).floor(50, 3, 1, 2, 1).spawn(52, 3);
    // Cabine C (SO)
    b.wall(2, 30, 5, 4).floor(3, 31, 3, 2, 1).floor(6, 31, 1, 2, 1).spawn(3, 31);
    // Cabine D (sul)
    b.wall(26, 31, 5, 3).floor(27, 31, 3, 2, 0).spawn(28, 32);
    // Cabine E (SE)
    b.wall(49, 30, 5, 4).floor(50, 31, 3, 2, 1).floor(49, 31, 1, 2, 1).spawn(51, 31);

    // Obstáculos — Telhado A
    b.solid(4, 4, "unit", 2, 1).solid(9, 5, "unit").solid(9, 6, "unit");
    b.solid(13, 3, "tank", 2, 2);
    b.low(10, 9, "pipe", 4, 1);
    b.solid(15, 8, "crate").solid(16, 8, "crate").solid(15, 9, "crate");
    // Telhado B
    b.solid(30, 4, "tank", 2, 2).solid(36, 3, "unit", 2, 1).solid(36, 9, "unit", 2, 1);
    b.solid(41, 6, "crate", 2, 1).solid(41, 7, "crate");
    b.low(26, 8, "pipe", 8, 1);
    b.solid(45, 4, "pillar").solid(45, 9, "pillar");
    // Telhado C
    b.solid(10, 23, "crate", 2, 1).solid(10, 24, "crate");
    b.solid(4, 22, "unit", 2, 1);
    b.low(7, 28, "pipe", 6, 1);
    b.solid(12, 31, "tank", 2, 2);
    // Telhado D (centro)
    b.solid(24, 20, "unit", 2, 1).solid(30, 20, "unit", 2, 1);
    b.solid(26, 27, "crate", 2, 1).solid(29, 27, "crate");
    b.low(22, 23, "pipe", 1, 4);
    b.low(33, 22, "pipe", 1, 4);
    b.solid(21, 30, "pillar").solid(34, 30, "pillar");
    // Telhado E
    b.solid(44, 19, "tank", 2, 2).solid(48, 22, "unit", 2, 1);
    b.solid(42, 27, "crate", 2, 1).solid(43, 28, "crate");
    b.low(46, 26, "pipe", 5, 1);
    b.solid(52, 18, "crate").solid(52, 19, "crate");

    b.player(28, 24);
    // Pontos de compra
    b.buy(21, 17, "weapon", "shotgun").buy(34, 17, "weapon", "smg").buy(21, 32, "weapon", "rifle");
    b.buy(34, 32, "ammo").buy(28, 17, "upgrade").buy(24, 10, "weapon", "dmr");
    b.buy(52, 17, "weapon", "launcher").buy(31, 25, "medic");

    b.label("TELHADO A", 11, 13).label("TELHADO B", 38, 11).label("TELHADO C", 8, 33).label("CENTRAL", 28, 22).label("TELHADO E", 46, 32);
    return b.build();
  },
};
