import { useEffect, useRef, useState } from "react";
import { audio } from "../game/audio/AudioEngine";
import type { Difficulty } from "../game/config/waves";
import { Game } from "../game/core/Game";
import type { GameResult, HudState } from "../game/core/types";
import { getMap } from "../game/maps";
import { Renderer } from "../game/render/Renderer";
import { submitRecord } from "../game/settings/records";
import { resolutionSize, settingsStore, useSettings } from "../game/settings/settings";
import { GameOver, PauseMenu } from "./GameOverlays";
import { Hud } from "./Hud";
import { SettingsPanel } from "./SettingsScreen";
import { ShopPanel } from "./ShopPanel";

export function GameScreen({ mapId, difficulty, onExit, onRestart }: { mapId: string; difficulty: Difficulty; onExit: () => void; onRestart: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [hud, setHud] = useState<HudState | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const settings = useSettings();

  // cria / destrói a partida
  useEffect(() => {
    const canvas = canvasRef.current!;
    audio.unlock();
    const game = new Game({
      map: getMap(mapId),
      difficulty,
      audio,
      bindings: settingsStore.get().bindings,
      getSensitivity: () => settingsStore.get().sensitivity,
      canvas,
    });
    gameRef.current = game;
    const renderer = new Renderer(canvas, game);
    game.onRender = (g) => renderer.render(g);
    game.onGameOver = (r) => {
      const newRecord = submitRecord(r.mapId, { wave: r.wave, kills: r.kills, time: r.time });
      setTimeout(() => setResult({ ...r, newRecord }), 1400);
    };
    game.onChange = () => setHud(game.getHud());
    applySize();
    game.start();
    setHud(game.getHud());
    const id = window.setInterval(() => setHud(game.getHud()), 90);
    const onBlur = () => game.pause();
    window.addEventListener("blur", onBlur);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("blur", onBlur);
      game.stop();
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId, difficulty]);

  // tamanho do canvas conforme resolução escolhida
  function applySize() {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const game = gameRef.current;
    if (!canvas || !stage) return;
    const fixed = resolutionSize(settingsStore.get().resolution);
    let w: number;
    let h: number;
    if (fixed) {
      w = fixed.w;
      h = fixed.h;
    } else {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(320, Math.floor(stage.clientWidth * dpr));
      h = Math.max(240, Math.floor(stage.clientHeight * dpr));
      const cap = 2560 / w;
      if (cap < 1) {
        w = Math.floor(w * cap);
        h = Math.floor(h * cap);
      }
    }
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    game?.resize(w, h);
  }

  useEffect(() => {
    applySize();
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => applySize());
    ro.observe(stage);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.resolution]);

  // teclas reconfiguradas valem imediatamente
  useEffect(() => {
    if (gameRef.current) gameRef.current.input.bindings = settings.bindings;
  }, [settings.bindings]);

  // trava atalhos do jogo enquanto as configurações estão abertas (reatribuição de teclas)
  useEffect(() => {
    if (gameRef.current) gameRef.current.inputLocked = showSettings;
  }, [showSettings]);

  const game = gameRef.current;
  const fixed = resolutionSize(settings.resolution);
  const stageStyle: React.CSSProperties = fixed
    ? { width: `min(100vw, ${(100 * fixed.w) / fixed.h}vh)`, height: `min(100vh, ${(100 * fixed.h) / fixed.w}vw)` }
    : { width: "100%", height: "100%" };
  const playing = hud?.state === "playing";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div ref={stageRef} className="relative overflow-hidden" style={stageStyle}>
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ cursor: playing ? "none" : "default" }} />
        {hud && hud.state !== "gameover" && <Hud hud={hud} onShop={() => game?.openShop()} onPause={() => game?.pause()} />}
        {hud?.state === "shop" && game && <ShopPanel game={game} onClose={() => game.closeShop()} />}
        {hud?.state === "paused" && !showSettings && (
          <PauseMenu hud={hud} onResume={() => game?.resume()} onSettings={() => setShowSettings(true)} onRestart={onRestart} onExit={onExit} />
        )}
        {hud?.state === "paused" && showSettings && (
          <div className="absolute inset-0 z-30 bg-black/90 p-6">
            <SettingsPanel embedded onBack={() => setShowSettings(false)} />
          </div>
        )}
        {result && <GameOver result={result} onRetry={onRestart} onExit={onExit} />}
      </div>
    </div>
  );
}
