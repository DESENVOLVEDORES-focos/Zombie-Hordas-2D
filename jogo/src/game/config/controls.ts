/** Ações de controle e atalhos padrão (reconfiguráveis em Configurações). */
export type Action =
  | "moveUp"
  | "moveDown"
  | "moveLeft"
  | "moveRight"
  | "reload"
  | "interact"
  | "shop"
  | "barricade"
  | "turret"
  | "lastWeapon"
  | "pause"
  | "weapon1"
  | "weapon2"
  | "weapon3"
  | "weapon4"
  | "weapon5"
  | "weapon6";

export const ACTION_LABELS: Record<Action, string> = {
  moveUp: "Mover para cima",
  moveDown: "Mover para baixo",
  moveLeft: "Mover para esquerda",
  moveRight: "Mover para direita",
  reload: "Recarregar",
  interact: "Interagir / Comprar / Reparar",
  shop: "Abrir loja",
  barricade: "Construir barricada",
  turret: "Construir torreta",
  lastWeapon: "Última arma",
  pause: "Pausar",
  weapon1: "Arma 1",
  weapon2: "Arma 2",
  weapon3: "Arma 3",
  weapon4: "Arma 4",
  weapon5: "Arma 5",
  weapon6: "Arma 6",
};

export const DEFAULT_BINDINGS: Record<Action, string> = {
  moveUp: "KeyW",
  moveDown: "KeyS",
  moveLeft: "KeyA",
  moveRight: "KeyD",
  reload: "KeyR",
  interact: "KeyE",
  shop: "KeyB",
  barricade: "KeyF",
  turret: "KeyT",
  lastWeapon: "KeyQ",
  pause: "Escape",
  weapon1: "Digit1",
  weapon2: "Digit2",
  weapon3: "Digit3",
  weapon4: "Digit4",
  weapon5: "Digit5",
  weapon6: "Digit6",
};

export const ACTION_ORDER = Object.keys(ACTION_LABELS) as Action[];

export function prettyKey(code: string): string {
  if (!code) return "—";
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Arrow")) return "Seta " + code.slice(5);
  const map: Record<string, string> = {
    Escape: "Esc",
    Space: "Espaço",
    ShiftLeft: "Shift E",
    ShiftRight: "Shift D",
    ControlLeft: "Ctrl E",
    Tab: "Tab",
    Enter: "Enter",
    Backquote: "`",
  };
  return map[code] ?? code;
}
