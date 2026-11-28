import type { HudState } from "../game/core/types";

function CoinIcon() {
  return (
    <span className="inline-block h-5 w-5 rounded-full border-2 border-[#8a5a00] bg-gradient-to-br from-[#ffe08a] to-[#e0a21c] shadow-[0_0_8px_rgba(245,165,36,0.6)]" />
  );
}

export function Hud({ hud, onShop, onPause }: { hud: HudState; onShop: () => void; onPause: () => void }) {
  const hpPct = Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100));
  const low = hpPct < 30;
  const waitingFirst = hud.wave === 0;
  const phaseText =
    hud.phase === "active"
      ? `Zumbis restantes: ${hud.zombiesLeft}`
      : waitingFirst
        ? `Prepare-se! Primeira horda em ${hud.countdown}s`
        : `Horda concluída · próxima em ${hud.countdown}s`;

  return (
    <div className="pointer-events-none absolute inset-0 select-none font-display">
      {/* topo-esquerda: moedas + custos */}
      <div className="absolute left-3 top-3 flex flex-col gap-2">
        <div className="hud-chip flex items-center gap-2 px-3 py-1.5">
          <CoinIcon />
          <span className="text-2xl font-bold tabular-nums text-[#ffd76a]">{hud.coins}</span>
        </div>
        <div className="hud-chip space-y-0.5 px-3 py-1.5 text-[0.72rem] uppercase tracking-wider text-white/70">
          <div>
            <kbd className="mr-1 rounded bg-black/70 px-1.5 text-toxic">{hud.keys.barricade}</kbd>Barricada <b className="text-[#ffd76a]">{hud.barricadeCost}</b>
          </div>
          <div>
            <kbd className="mr-1 rounded bg-black/70 px-1.5 text-toxic">{hud.keys.turret}</kbd>Torreta <b className="text-[#ffd76a]">{hud.turretCost}</b>
          </div>
        </div>
      </div>

      {/* topo-centro: horda */}
      <div className="absolute left-1/2 top-3 -translate-x-1/2 text-center">
        <div className="hud-chip px-6 py-1.5">
          <div className="text-[0.65rem] uppercase tracking-[0.4em] text-blood">Horda</div>
          <div className="text-4xl font-bold leading-none tabular-nums text-white title-glow">{hud.wave || "—"}</div>
        </div>
        <div className="hud-chip mt-1.5 px-3 py-1 text-xs uppercase tracking-wider text-white/80">{phaseText}</div>
      </div>

      {/* topo-direita: botões */}
      <div className="absolute right-3 top-3 flex gap-2">
        <button className="pointer-events-auto btn !px-3 !py-1.5 !text-xs" onClick={onShop}>
          Loja [{hud.keys.shop}]
        </button>
        <button className="pointer-events-auto btn !px-3 !py-1.5 !text-xs" onClick={onPause}>
          Pausa [{hud.keys.pause}]
        </button>
      </div>

      {/* modo construção */}
      {hud.build && (
        <div className="absolute left-1/2 top-[7.5rem] -translate-x-1/2 text-center">
          <div className={`hud-chip px-4 py-2 ${hud.build.valid ? "!border-toxic/60" : "!border-blood/60"}`}>
            <div className="text-sm font-bold uppercase tracking-widest text-white">
              Construindo {hud.build.type === "barricade" ? "barricada" : "torreta"} · <span className="text-[#ffd76a]">{hud.build.cost}</span> moedas
            </div>
            <div className={`text-xs ${hud.build.valid ? "text-toxic" : "text-blood"}`}>
              {hud.build.valid ? "Local válido — clique para construir" : hud.build.reason || "Local inválido"}
            </div>
            <div className="text-[0.65rem] text-white/45">Botão direito ou Esc para cancelar · cantos dourados = pontos estratégicos</div>
          </div>
        </div>
      )}

      {/* anúncio */}
      {hud.announce && (
        <div key={hud.announce.id} className="announce absolute left-0 right-0 top-[24%] text-center">
          <div className="text-6xl font-bold uppercase tracking-[0.12em] text-white md:text-7xl" style={{ textShadow: "0 0 30px rgba(192,57,43,0.8), 0 4px 0 #000" }}>
            {hud.announce.title}
          </div>
          <div className="mt-2 text-lg uppercase tracking-[0.3em] text-ember">{hud.announce.sub}</div>
        </div>
      )}

      {/* base-esquerda: vida */}
      <div className="absolute bottom-3 left-3 w-72">
        <div className={`hud-chip px-3 py-2 ${low ? "pulse-red" : ""}`}>
          <div className="mb-1 flex items-end justify-between">
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/50">Vida</span>
            <span className={`text-xl font-bold tabular-nums ${low ? "text-blood" : "text-white"}`}>
              {hud.hp}
              <span className="text-xs text-white/40"> / {hud.maxHp}</span>
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-sm bg-black/70">
            <div
              className="h-full transition-[width] duration-150"
              style={{ width: `${hpPct}%`, background: low ? "linear-gradient(90deg,#8a1a12,#e5392b)" : "linear-gradient(90deg,#3f8f2a,#9be33a)" }}
            />
          </div>
        </div>
        <div className="mt-1.5 text-[0.65rem] uppercase tracking-wider text-white/40">
          Abates: <b className="text-white/70">{hud.kills}</b>
        </div>
      </div>

      {/* base-direita: arma e munição */}
      <div className="absolute bottom-3 right-3 w-80">
        <div className="hud-chip px-3 py-2">
          <div className="flex items-end justify-between">
            <div className="min-w-0">
              <div className="truncate text-sm font-bold uppercase tracking-wider text-white">{hud.weaponName}</div>
              <div className="text-[0.65rem] uppercase tracking-widest text-white/40">
                {hud.reloading ? "Recarregando..." : hud.ammo === 0 ? (hud.reserve > 0 ? `[${hud.keys.reload}] Recarregar` : "Sem munição") : "Pronta"}
              </div>
            </div>
            <div className="text-right">
              <span className={`text-4xl font-bold tabular-nums ${hud.ammo === 0 ? "text-blood" : "text-white"}`}>{hud.ammo}</span>
              <span className="ml-1 text-lg tabular-nums text-white/45">/ {hud.reserve}</span>
            </div>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-sm bg-black/70">
            <div className="h-full bg-[#ffd54a]" style={{ width: `${hud.reloading ? hud.reloadProgress * 100 : 0}%` }} />
          </div>
          <div className="mt-2 flex gap-1">
            {hud.slots.map((s) => (
              <div
                key={s.slot}
                title={s.name}
                className={`flex h-8 flex-1 items-center justify-center rounded-sm border text-xs font-bold ${
                  s.active ? "border-toxic bg-toxic/20 text-white" : s.owned ? "border-white/25 bg-white/5 text-white/70" : "border-white/5 bg-black/30 text-white/20"
                }`}
              >
                {s.slot + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* base-centro: interação e avisos */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        {hud.toast && (
          <div
            key={hud.toast.id}
            className={`toast hud-chip px-4 py-1.5 text-sm font-bold uppercase tracking-wider ${
              hud.toast.kind === "ok" ? "text-toxic" : hud.toast.kind === "bad" ? "text-[#ff6b5a]" : "text-white"
            }`}
          >
            {hud.toast.text}
          </div>
        )}
        {hud.prompt && (
          <div className={`hud-chip px-4 py-2 text-base font-bold uppercase tracking-wider ${hud.promptOk ? "!border-ember/70 text-ember" : "!border-white/20 text-white/50"}`}>
            {hud.prompt}
          </div>
        )}
      </div>
    </div>
  );
}
