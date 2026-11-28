import type { Difficulty } from "../config/waves";

/**
 * CAMADA DE SESSÃO / REDE
 * Hoje a única implementação é local (salvando partidas no navegador). A interface NetworkAdapter
 * existe para que um servidor real (WebSocket/WebRTC) possa ser plugado depois sem mexer no jogo:
 * o Game já mantém uma lista de jogadores e roda toda a simulação em um único `update(dt)`.
 */
export interface MatchConfig {
  code: string;
  name: string;
  mapId: string;
  difficulty: Difficulty;
  maxPlayers: number;
  createdAt: number;
  plays: number;
}

export interface NetworkAdapter {
  readonly kind: "local" | "online";
  createMatch(cfg: Omit<MatchConfig, "code" | "createdAt" | "plays">): MatchConfig;
  joinMatch(code: string): MatchConfig | null;
  listMatches(): MatchConfig[];
  removeMatch(code: string): void;
}

const KEY = "ultima-barricada:matches:v1";

function read(): MatchConfig[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as MatchConfig[];
  } catch {
    return [];
  }
}
function write(list: MatchConfig[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 12)));
  } catch {
    /* ignore */
  }
}

function makeCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const l = () => letters[Math.floor(Math.random() * letters.length)];
  return `${l()}${l()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export class LocalSessionAdapter implements NetworkAdapter {
  readonly kind = "local" as const;

  createMatch(cfg: Omit<MatchConfig, "code" | "createdAt" | "plays">): MatchConfig {
    const m: MatchConfig = { ...cfg, code: makeCode(), createdAt: Date.now(), plays: 0 };
    write([m, ...read()]);
    return m;
  }
  joinMatch(code: string): MatchConfig | null {
    const c = code.trim().toUpperCase();
    const list = read();
    const m = list.find((x) => x.code === c);
    if (!m) return null;
    m.plays++;
    write(list);
    return m;
  }
  listMatches(): MatchConfig[] {
    return read();
  }
  removeMatch(code: string) {
    write(read().filter((m) => m.code !== code));
  }
}

export const sessions: NetworkAdapter = new LocalSessionAdapter();
