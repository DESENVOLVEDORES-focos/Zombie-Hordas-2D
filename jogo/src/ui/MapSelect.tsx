import { MAPS, type MapDef } from "../game/maps";
import { getRecord } from "../game/settings/records";
import { Btn, ScreenHeader, ThreatDots, click } from "./common";
import { MapThumbnail } from "./MapThumbnail";

export function MapCard({ map, selected, onSelect }: { map: MapDef; selected: boolean; onSelect: () => void }) {
  const rec = getRecord(map.id);
  return (
    <button
      onClick={() => {
        click();
        onSelect();
      }}
      className={`panel group overflow-hidden text-left transition ${selected ? "!border-toxic shadow-[0_0_30px_rgba(142,203,62,0.25)]" : "hover:!border-white/30"}`}
    >
      <div className="relative">
        <MapThumbnail map={map} width={300} />
        {selected && <div className="absolute right-2 top-2 rounded bg-toxic px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wider text-black">Selecionado</div>}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold uppercase tracking-wider text-white">{map.name}</h3>
          <ThreatDots n={map.threat} />
        </div>
        <div className="text-xs italic text-white/45">{map.tagline}</div>
        <p className="mt-2 text-[0.8rem] leading-snug text-white/70">{map.description}</p>
        <div className="mt-2 text-xs text-ember">{map.environment}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {map.traits.map((t) => (
            <span key={t} className="rounded bg-white/8 px-2 py-0.5 text-[0.68rem] text-white/60" style={{ background: "rgba(255,255,255,0.07)" }}>
              {t}
            </span>
          ))}
        </div>
        <div className="mt-3 text-xs text-white/40">{rec ? `Recorde: horda ${rec.wave} · ${rec.kills} abates` : "Sem recorde ainda"}</div>
      </div>
    </button>
  );
}

export function MapSelect({
  selected,
  onSelect,
  onBack,
  onPlay,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  onPlay: () => void;
}) {
  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col p-8">
      <ScreenHeader title="Selecionar mapa" subtitle="Cada cenário tem rotas, gargalos e pontos de construção próprios." onBack={onBack} />
      <div className="scrollbar-thin mt-5 grid flex-1 grid-cols-1 gap-5 overflow-y-auto pb-4 pr-2 sm:grid-cols-2 xl:grid-cols-4">
        {MAPS.map((m) => (
          <MapCard key={m.id} map={m} selected={m.id === selected} onSelect={() => onSelect(m.id)} />
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <div className="text-xs text-white/45">
          <span className="mr-3 inline-block h-2 w-2 rounded-full bg-[#ff3b30]" /> entradas dos zumbis
          <span className="mx-3 inline-block h-2 w-2 rounded-full bg-[#ffb52e]" /> pontos de compra
          <span className="mx-3 inline-block h-2 w-2 rounded-full bg-[#6bff8a]" /> início do jogador
        </div>
        <div className="flex gap-3">
          <Btn onClick={onBack}>Confirmar mapa</Btn>
          <Btn variant="primary" onClick={onPlay}>
            Jogar neste mapa
          </Btn>
        </div>
      </div>
    </div>
  );
}
