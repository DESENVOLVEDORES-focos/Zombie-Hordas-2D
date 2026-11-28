import { useSyncExternalStore } from "react";
import { DEFAULT_BINDINGS, type Action } from "../config/controls";
import { audio } from "../audio/AudioEngine";

export type Resolution = "auto" | "1280x720" | "1600x900" | "1920x1080";
export const RESOLUTIONS: { id: Resolution; label: string }[] = [
  { id: "auto", label: "Automática (ajusta à janela)" },
  { id: "1280x720", label: "1280 × 720 (HD)" },
  { id: "1600x900", label: "1600 × 900 (HD+)" },
  { id: "1920x1080", label: "1920 × 1080 (Full HD)" },
];

export interface Settings {
  master: number;
  music: number;
  sfx: number;
  resolution: Resolution;
  fullscreen: boolean;
  sensitivity: number;
  bindings: Record<Action, string>;
}

const KEY = "ultima-barricada:settings:v1";

const defaults = (): Settings => ({
  master: 0.8,
  music: 0.5,
  sfx: 0.8,
  resolution: "auto",
  fullscreen: false,
  sensitivity: 1,
  bindings: { ...DEFAULT_BINDINGS },
});

function load(): Settings {
  const d = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return d;
    const p = JSON.parse(raw) as Partial<Settings>;
    return { ...d, ...p, bindings: { ...d.bindings, ...(p.bindings ?? {}) }, fullscreen: false };
  } catch {
    return d;
  }
}

let state: Settings = load();
const listeners = new Set<() => void>();

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  audio.setVolumes({ master: state.master, music: state.music, sfx: state.sfx });
  listeners.forEach((l) => l());
}

export const settingsStore = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  set(p: Partial<Settings>) {
    state = { ...state, ...p };
    emit();
  },
  /** Reatribui uma tecla; se já estiver em uso por outra ação, as duas trocam. */
  setBinding(action: Action, code: string) {
    const b = { ...state.bindings };
    const other = (Object.keys(b) as Action[]).find((a) => a !== action && b[a] === code);
    if (other) b[other] = b[action];
    b[action] = code;
    state = { ...state, bindings: b };
    emit();
  },
  resetBindings() {
    state = { ...state, bindings: { ...DEFAULT_BINDINGS } };
    emit();
  },
  setFullscreen(on: boolean) {
    try {
      if (on && !document.fullscreenElement) void document.documentElement.requestFullscreen?.().catch(() => {});
      else if (!on && document.fullscreenElement) void document.exitFullscreen?.().catch(() => {});
    } catch {
      /* ignore */
    }
    state = { ...state, fullscreen: on };
    emit();
  },
};

if (typeof document !== "undefined") {
  document.addEventListener("fullscreenchange", () => {
    const fs = !!document.fullscreenElement;
    if (fs !== state.fullscreen) {
      state = { ...state, fullscreen: fs };
      emit();
    }
  });
  audio.setVolumes({ master: state.master, music: state.music, sfx: state.sfx });
}

export function useSettings(): Settings {
  return useSyncExternalStore(settingsStore.subscribe, settingsStore.get);
}

export function resolutionSize(r: Resolution): { w: number; h: number } | null {
  if (r === "auto") return null;
  const [w, h] = r.split("x").map(Number);
  return { w, h };
}
