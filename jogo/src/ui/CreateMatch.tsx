import { useState } from "react";
import { DIFFICULTIES, type Difficulty } from "../game/config/waves";
import { MAPS, getMap } from "../game/maps";
import { sessions, type MatchConfig } from "../game/net/Session";
import { Btn, ScreenHeader, Segmented, ThreatDots, click } from "./common";
import { MapThumbnail } from "./MapThumbnail";

export function CreateMatch({
  mapId,
  onMap,
  onBack,
  onStart,
}: {
  mapId: string;
  onMap: (id: string) => void;
  onBack: () => void;
  onStart: (m: MatchConfig) => void;
}) {
  const [name, setName] = useState("Minha partida");
  const [diff, setDiff] = useState<Difficulty>("normal");
  const map = getMap(mapId);
  const d = DIFFICULTIES[diff];

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col p-8">
      <ScreenHeader title="Criar partida" subtitle="Escolha o mapa, ajuste as regras e inicie a sessão." onBack={onBack} />
      <div className="scrollbar-thin mt-5 grid flex-1 grid-cols-1 gap-6 overflow-y-auto pr-2 lg:grid-cols-[1fr_1.2fr]">
        <section>
          <h2 className="mb-2 font-display text-sm uppercase tracking-widest text-white/50">1 · Mapa</h2>
          <div className="space-y-2">
            {MAPS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  click();
                  onMap(m.id);
                }}
                className={`panel flex w-full items-center gap-3 p-2 text-left transition ${m.id === mapId ? "!border-toxic" : "hover:!border-white/30"}`}
              >
                <div className="w-28 shrink-0">
                  <MapThumbnail map={m} width={112} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-base font-bold uppercase tracking-wider">{m.name}</div>
                  <div className="truncate text-xs text-white/45">{m.environment}</div>
                  <ThreatDots n={m.threat} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="panel overflow-hidden">
            <MapThumbnail map={map} width={520} />
            <div className="p-4">
              <h3 className="font-display text-xl font-bold uppercase tracking-wider">{map.name}</h3>
              <p className="mt-1 text-sm text-white/65">{map.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {map.traits.map((t) => (
                  <span key={t} className="rounded px-2 py-0.5 text-[0.7rem] text-white/60" style={{ background: "rgba(255,255,255,0.07)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="panel space-y-4 p-4">
            <h2 className="font-display text-sm uppercase tracking-widest text-white/50">2 · Opções</h2>
            <label className="block">
              <div className="mb-1 text-sm text-white/75">Nome da partida</div>
              <input
                value={name}
                maxLength={28}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-white/15 bg-black/60 px-3 py-2 text-white outline-none focus:border-toxic"
              />
            </label>
            <div>
              <div className="mb-1 text-sm text-white/75">Dificuldade</div>
              <Segmented
                value={diff}
                onChange={setDiff}
                options={(Object.keys(DIFFICULTIES) as Difficulty[]).map((k) => ({ id: k, label: DIFFICULTIES[k].label, sub: DIFFICULTIES[k].desc }))}
              />
              <div className="mt-2 text-xs text-white/45">
                Moedas iniciais: <b className="text-ember">{d.startCoins}</b> · Zumbis ×{d.count} · Vida ×{d.hp} · Dano ×{d.damage} · Recompensa ×{d.reward}
              </div>
            </div>
            <div className="flex items-center justify-between rounded border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <span className="text-white/75">Jogadores</span>
              <span className="font-mono text-toxic">1 / 1 (solo)</span>
            </div>
            <p className="text-xs text-white/35">
              A sessão é registrada localmente com um código — a camada de rede (NetworkAdapter) já está preparada para receber o modo cooperativo online.
            </p>
          </div>

          <Btn
            variant="primary"
            className="w-full !py-3 !text-lg"
            onClick={() => onStart(sessions.createMatch({ name: name.trim() || "Partida sem nome", mapId, difficulty: diff, maxPlayers: 1 }))}
          >
            Iniciar partida
          </Btn>
        </section>
      </div>
    </div>
  );
}
