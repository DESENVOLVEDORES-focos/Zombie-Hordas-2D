export const TILE = 32;

/** Tipos de tile: FLOOR anda; WALL bloqueia tudo; SOLID bloqueia movimento e tiros;
 *  LOW bloqueia movimento (exceto rastejantes) mas tiros passam; PIT bloqueia movimento, tiros passam. */
export const T = { FLOOR: 0, WALL: 1, SOLID: 2, LOW: 3, PIT: 4 } as const;
export type TileType = (typeof T)[keyof typeof T];

export type BuyKind = "weapon" | "upgrade" | "ammo" | "medic";
export interface BuyPoint {
  tx: number;
  ty: number;
  kind: BuyKind;
  weaponId?: string;
}

export interface ZoneDef {
  name: string;
  floor: string;
  floor2: string;
  pattern: "tiles" | "plain" | "metal" | "grass" | "checker" | "lines" | "court" | "carpet" | "wood" | "ballast";
  line?: string;
}

export interface MapTheme {
  zones: ZoneDef[];
  wallTop: string;
  wallSide: string;
  wallEdge: string;
  pitColor: string;
  ambient: number; // escuridão ambiente 0..1
  ambientTint: string;
  lightRadius: number;
  musicRoot: number;
  accent: string;
}

export interface MapLayout {
  cols: number;
  rows: number;
  tiles: Uint8Array;
  zone: Uint8Array;
  style: Uint8Array;
  styles: string[];
  spawns: { tx: number; ty: number }[];
  playerSpawn: { tx: number; ty: number };
  buyPoints: BuyPoint[];
  chokePoints: { tx: number; ty: number }[];
  labels: { text: string; tx: number; ty: number }[];
}

export interface MapDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  environment: string;
  traits: string[];
  threat: number; // 1..5
  theme: MapTheme;
  build: () => MapLayout;
}
