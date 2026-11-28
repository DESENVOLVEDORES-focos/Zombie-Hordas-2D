import { useEffect, useState } from "react";
import { ACTION_LABELS, ACTION_ORDER, prettyKey, type Action } from "../game/config/controls";
import { audio } from "../game/audio/AudioEngine";
import { RESOLUTIONS, settingsStore, useSettings, type Resolution } from "../game/settings/settings";
import { Btn, ScreenHeader, Slider, click } from "./common";

/** Painel de configurações (usado no lobby e dentro da partida). Tudo é aplicado de verdade. */
export function SettingsPanel({ onBack, embedded }: { onBack: () => void; embedded?: boolean }) {
  const s = useSettings();
  const [listening, setListening] = useState<Action | null>(null);

  useEffect(() => {
    if (!listening) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.code !== "Escape") settingsStore.setBinding(listening, e.code);
      setListening(null);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [listening]);

  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const groups: { title: string; actions: Action[] }[] = [
    { title: "Movimento", actions: ["moveUp", "moveDown", "moveLeft", "moveRight"] },
    { title: "Combate", actions: ["reload", "lastWeapon", "weapon1", "weapon2", "weapon3", "weapon4", "weapon5", "weapon6"] },
    { title: "Ações", actions: ["interact", "shop", "barricade", "turret", "pause"] },
  ];

  return (
    <div className={`flex h-full w-full flex-col ${embedded ? "" : "mx-auto max-w-5xl p-8"}`}>
      <ScreenHeader title="Configurações" subtitle="As alterações são aplicadas imediatamente e salvas no navegador." onBack={onBack} />
      <div className="scrollbar-thin mt-5 grid flex-1 grid-cols-1 gap-6 overflow-y-auto pr-2 lg:grid-cols-2">
        <section className="panel space-y-5 p-5">
          <h2 className="font-display text-lg font-bold uppercase tracking-widest text-toxic">Áudio</h2>
          <Slider label="Volume geral" value={s.master} min={0} max={1} step={0.01} format={pct} onChange={(v) => settingsStore.set({ master: v })} onRelease={() => audio.play("buy")} />
          <Slider label="Volume da música" value={s.music} min={0} max={1} step={0.01} format={pct} onChange={(v) => settingsStore.set({ music: v })} />
          <Slider label="Volume dos efeitos" value={s.sfx} min={0} max={1} step={0.01} format={pct} onChange={(v) => settingsStore.set({ sfx: v })} onRelease={() => audio.play("shot_rifle")} />

          <h2 className="pt-2 font-display text-lg font-bold uppercase tracking-widest text-toxic">Vídeo</h2>
          <label className="block">
            <div className="mb-1 text-sm text-white/80">Resolução de renderização</div>
            <select
              className="w-full rounded border border-white/15 bg-black/60 px-3 py-2 text-white outline-none focus:border-toxic"
              value={s.resolution}
              onChange={(e) => {
                click();
                settingsStore.set({ resolution: e.target.value as Resolution });
              }}
            >
              {RESOLUTIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/80">Tela cheia</div>
              <div className="text-xs text-white/40">{s.fullscreen ? "Ativada" : "Desativada"}</div>
            </div>
            <Btn variant={s.fullscreen ? "primary" : undefined} onClick={() => settingsStore.setFullscreen(!s.fullscreen)}>
              {s.fullscreen ? "Sair da tela cheia" : "Entrar em tela cheia"}
            </Btn>
          </div>

          <h2 className="pt-2 font-display text-lg font-bold uppercase tracking-widest text-toxic">Mira</h2>
          <Slider label="Sensibilidade da mira" value={s.sensitivity} min={0.4} max={2} step={0.05} format={(v) => `${v.toFixed(2)}×`} onChange={(v) => settingsStore.set({ sensitivity: v })} />
          <p className="text-xs text-white/40">A mira se afasta do personagem proporcionalmente ao movimento do mouse. Valores altos alcançam alvos distantes com menos movimento.</p>
        </section>

        <section className="panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold uppercase tracking-widest text-toxic">Controles</h2>
            <Btn onClick={() => settingsStore.resetBindings()}>Restaurar padrão</Btn>
          </div>
          <p className="mb-3 text-xs text-white/45">Clique em uma tecla e pressione a nova. Esc cancela. Teclas repetidas são trocadas entre as ações.</p>
          <div className="mb-4 rounded border border-white/10 bg-white/5 px-3 py-2 text-sm">
            <span className="text-white/60">Mouse:</span> mirar · <span className="text-white/60">Botão esquerdo:</span> atirar/construir ·{" "}
            <span className="text-white/60">Botão direito:</span> cancelar construção · <span className="text-white/60">Roda:</span> trocar arma
          </div>
          {groups.map((g) => (
            <div key={g.title} className="mb-4">
              <div className="mb-1 text-xs uppercase tracking-widest text-white/40">{g.title}</div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {g.actions.map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      click();
                      setListening(a);
                    }}
                    className={`flex items-center justify-between rounded border px-3 py-1.5 text-left text-sm transition ${
                      listening === a ? "border-ember bg-ember/15" : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <span className="text-white/75">{ACTION_LABELS[a]}</span>
                    <kbd className={`min-w-[3rem] rounded bg-black/70 px-2 py-0.5 text-center font-mono text-xs ${listening === a ? "text-ember" : "text-toxic"}`}>
                      {listening === a ? "..." : prettyKey(s.bindings[a])}
                    </kbd>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {ACTION_ORDER.length === 0 && null}
        </section>
      </div>
    </div>
  );
}
