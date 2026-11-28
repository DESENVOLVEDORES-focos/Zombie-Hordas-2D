/** Recordes por mapa (persistidos em localStorage). */
const KEY = "ultima-barricada:records:v1";

export interface MapRecord {
  wave: number;
  kills: number;
  time: number;
}

function read(): Record<string, MapRecord> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, MapRecord>;
  } catch {
    return {};
  }
}

export const getRecord = (mapId: string): MapRecord | null => read()[mapId] ?? null;

/** Salva se for melhor. Retorna true quando é um novo recorde. */
export function submitRecord(mapId: string, rec: MapRecord): boolean {
  const all = read();
  const cur = all[mapId];
  const better = !cur || rec.wave > cur.wave || (rec.wave === cur.wave && rec.kills > cur.kills);
  if (better) {
    all[mapId] = rec;
    try {
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }
  return better && rec.wave > 1;
}
