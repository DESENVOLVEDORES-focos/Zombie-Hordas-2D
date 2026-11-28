import { useEffect, useState } from "react";
import { audio } from "./game/audio/AudioEngine";
import type { Difficulty } from "./game/config/waves";
import { MAPS } from "./game/maps";
import type { MatchConfig } from "./game/net/Session";
import { CreateMatch } from "./ui/CreateMatch";
import { GameScreen } from "./ui/GameScreen";
import { JoinMatch } from "./ui/JoinMatch";
import { Lobby } from "./ui/Lobby";
import { MapSelect } from "./ui/MapSelect";
import { SettingsPanel } from "./ui/SettingsScreen";
import { MenuButton } from "./ui/common";

type Screen = "lobby" | "create" | "join" | "maps" | "settings" | "game" | "exit";

export default function App() {
  const [screen, setScreen] = useState<Screen>("lobby");
  const [mapId, setMapId] = useState(MAPS[0].id);
  const [run, setRun] = useState<{ mapId: string; difficulty: Difficulty; key: number }>({ mapId: MAPS[0].id, difficulty: "normal", key: 0 });
  const [unlocked, setUnlocked] = useState(false);

  // o navegador só libera o áudio após um gesto do usuário
  useEffect(() => {
    const unlock = () => {
      audio.unlock();
      setUnlocked(true);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // música ambiente nos menus (na partida o Game assume)
  useEffect(() => {
    if (!unlocked) return;
    if (screen === "game") return;
    if (screen === "exit") audio.stopMusic();
    else audio.startMusic(46, 0);
  }, [screen, unlocked]);

  const start = (id: string, difficulty: Difficulty) => {
    setRun((r) => ({ mapId: id, difficulty, key: r.key + 1 }));
    setScreen("game");
  };

  if (screen === "game")
    return (
      <GameScreen
        key={run.key}
        mapId={run.mapId}
        difficulty={run.difficulty}
        onExit={() => setScreen("lobby")}
        onRestart={() => setRun((r) => ({ ...r, key: r.key + 1 }))}
      />
    );

  return (
    <div className="h-full w-full bg-ink">
      {screen === "lobby" && (
        <Lobby
          mapId={mapId}
          onPlay={() => start(mapId, "normal")}
          onCreate={() => setScreen("create")}
          onJoin={() => setScreen("join")}
          onMaps={() => setScreen("maps")}
          onSettings={() => setScreen("settings")}
          onExit={() => setScreen("exit")}
        />
      )}
      {screen === "maps" && <MapSelect selected={mapId} onSelect={setMapId} onBack={() => setScreen("lobby")} onPlay={() => start(mapId, "normal")} />}
      {screen === "create" && (
        <CreateMatch
          mapId={mapId}
          onMap={setMapId}
          onBack={() => setScreen("lobby")}
          onStart={(m: MatchConfig) => {
            setMapId(m.mapId);
            start(m.mapId, m.difficulty);
          }}
        />
      )}
      {screen === "join" && (
        <JoinMatch
          onBack={() => setScreen("lobby")}
          onJoin={(m: MatchConfig) => {
            setMapId(m.mapId);
            start(m.mapId, m.difficulty);
          }}
        />
      )}
      {screen === "settings" && <SettingsPanel onBack={() => setScreen("lobby")} />}
      {screen === "exit" && (
        <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
          <h1 className="font-display text-5xl font-bold uppercase tracking-[0.15em] text-white title-glow">Até a próxima horda</h1>
          <p className="max-w-md text-white/50">Você saiu do jogo. Feche a aba do navegador ou volte ao menu para continuar sobrevivendo.</p>
          <div className="w-64">
            <MenuButton
              variant="primary"
              onClick={() => {
                window.close();
                setScreen("lobby");
              }}
            >
              Voltar ao menu
            </MenuButton>
          </div>
        </div>
      )}
    </div>
  );
}
