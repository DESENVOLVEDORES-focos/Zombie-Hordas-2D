import { useState } from "react";
import { DIFFICULTIES } from "../game/config/waves";
import { getMap } from "../game/maps";
import { sessions, type MatchConfig } from "../game/net/Session";
import { Btn, ScreenHeader } from "./common";

export function JoinMatch({ onBack, onJoin }: { onBack: () => void; onJoin: (m: MatchConfig) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [list, setList] = useState<MatchConfig[]>(() => sessions.listMatches());

  const join = (c: string) => {
    const m = sessions.joinMatch(c);
    if (!m) {
      setError(`Nenhuma partida encontrada com o código "${c.trim().toUpperCase()}".`);
      return;
    }
    onJoin(m);
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-8">
      <ScreenHeader title="Entrar em partida" subtitle="Digite o código de uma partida criada ou escolha uma sessão recente." onBack={onBack} />
      <div className="panel mt-5 p-4">
        <div className="mb-1 text-sm text-white/75">Código da partida</div>
        <div className="flex gap-3">
          <input
            value={code}
            placeholder="EX: AB-1234"
            maxLength={8}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && code && join(code)}
            className="flex-1 rounded border border-white/15 bg-black/60 px-3 py-2 font-mono text-lg uppercase tracking-widest text-white outline-none focus:border-toxic"
          />
          <Btn variant="primary" disabled={!code.trim()} onClick={() => join(code)}>
            Entrar
          </Btn>
        </div>
        {error && <div className="mt-2 text-sm text-blood">{error}</div>}
      </div>

      <h2 className="mb-2 mt-6 font-display text-sm uppercase tracking-widest text-white/50">Partidas recentes</h2>
      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto pr-2">
        {list.length === 0 && <div className="panel p-6 text-center text-sm text-white/45">Nenhuma partida criada ainda. Use “Criar partida” no menu principal.</div>}
        {list.map((m) => (
          <div key={m.code} className="panel flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="rounded bg-black/70 px-2 py-0.5 font-mono text-sm text-ember">{m.code}</span>
                <span className="truncate font-display text-lg font-bold uppercase tracking-wider">{m.name}</span>
              </div>
              <div className="mt-1 text-xs text-white/45">
                {getMap(m.mapId).name} · {DIFFICULTIES[m.difficulty].label} · {m.maxPlayers} jogador · {m.plays} entradas
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Btn variant="primary" onClick={() => join(m.code)}>
                Entrar
              </Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  sessions.removeMatch(m.code);
                  setList(sessions.listMatches());
                }}
              >
                Excluir
              </Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
