import type { GameResult, HudState } from "../game/core/types";
import { getMap } from "../game/maps";
import { Btn, MenuButton, fmtTime } from "./common";

export function PauseMenu({
  hud,
  onResume,
  onSettings,
  onRestart,
  onExit,
}: {
  hud: HudState;
  onResume: () => void;
  onSettings: () => void;
  onRestart: () => void;
  onExit: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-[2px]">
      <div className="panel fade-in w-full max-w-md p-6">
        <h2 className="font-display text-3xl font-bold uppercase tracking-[0.25em] text-white title-glow">Pausado</h2>
        <p className="mb-5 mt-1 text-sm text-white/50">
          Horda {hud.wave || "—"} · {hud.kills} abates · {fmtTime(hud.time)}
        </p>
        <div className="space-y-2.5">
          <MenuButton variant="primary" onClick={onResume} sub={hud.keys.pause}>
            Continuar
          </MenuButton>
          <MenuButton onClick={onSettings}>Configurações</MenuButton>
          <MenuButton onClick={onRestart}>Reiniciar partida</MenuButton>
          <MenuButton variant="danger" onClick={onExit}>
            Voltar ao lobby
          </MenuButton>
        </div>
      </div>
    </div>
  );
}

export function GameOver({ result, onRetry, onExit }: { result: GameResult; onRetry: () => void; onExit: () => void }) {
  const map = getMap(result.mapId);
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 p-4 backdrop-blur-[3px]">
      <div className="panel fade-in w-full max-w-lg p-8 text-center">
        <div className="font-display text-xs uppercase tracking-[0.5em] text-blood">{map.name}</div>
        <h2 className="mt-1 font-display text-5xl font-bold uppercase tracking-[0.12em] text-blood" style={{ textShadow: "0 0 24px rgba(192,57,43,0.6)" }}>
          Você caiu
        </h2>
        {result.newRecord && <div className="mx-auto mt-3 inline-block rounded bg-ember px-3 py-1 font-display text-sm font-bold uppercase tracking-widest text-black">Novo recorde!</div>}
        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          {[
            ["Horda alcançada", String(result.wave || 1)],
            ["Zumbis abatidos", String(result.kills)],
            ["Moedas ganhas", String(result.coins)],
            ["Tempo de sobrevivência", fmtTime(result.time)],
          ].map(([k, v]) => (
            <div key={k} className="rounded border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-[0.65rem] uppercase tracking-widest text-white/45">{k}</div>
              <div className="font-display text-3xl font-bold tabular-nums text-white">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Btn variant="primary" onClick={onRetry}>
            Jogar novamente
          </Btn>
          <Btn onClick={onExit}>Voltar ao lobby</Btn>
        </div>
      </div>
    </div>
  );
}
