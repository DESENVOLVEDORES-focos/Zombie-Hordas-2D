import type { MapDef } from "./types";
import { rooftops } from "./rooftops";
import { metro } from "./metro";
import { hospital } from "./hospital";
import { school } from "./school";

/**
 * REGISTRO DE MAPAS — para adicionar um novo mapa, crie o arquivo (MapDef + MapBuilder)
 * e inclua-o nesta lista. O lobby, a seleção de mapas e o jogo o reconhecem automaticamente.
 */
export const MAPS: MapDef[] = [rooftops, metro, hospital, school];

export const getMap = (id: string): MapDef => MAPS.find((m) => m.id === id) ?? MAPS[0];

export * from "./types";
