import { useEffect, useState } from "react";
import type { Game } from "../game/core/Game";
import type { ShopCategory } from "../game/core/types";
import { Btn, click } from "./common";

export function ShopPanel({ game, onClose }: { game: Game; onClose: () => void }) {
  const [tab, setTab] = useState<ShopCategory>(game.shopTab);
  const [, setTick] = useState(0);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 200);
    return () => clearInterval(id);
  }, []);

  const items = game.shop.catalog().filter((i) => i.category === tab);
  const ws = game.weapons.current();

  const buy = (id: string) => {
    const r = game.shop.purchase(id);
    if (r.msg) setMsg({ text: r.msg, ok: r.ok });
    setTick((t) => t + 1);
  };

  const tabs = game.shop.categories();
  const hints: Record<ShopCategory, string> = {
    weapons: "Armas novas ficam disponíveis nas teclas 1–6. Já tem a arma? O botão reabastece a munição.",
    upgrades: `Melhorias aplicadas à arma equipada: ${ws.def.name}. Troque de arma (1–6) para melhorar outra.`,
    defenses: "O preço sobe a cada estrutura construída. Cantos dourados no mapa indicam pontos estratégicos.",
    supplies: "Equipamentos de sobrevivência permanentes e itens de cura.",
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px]">
      <div className="panel fade-in flex max-h-full w-full max-w-5xl flex-col p-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-white">Loja de Suprimentos</h2>
            <p className="text-xs text-white/45">O jogo está pausado enquanto você compra.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded border border-ember/40 bg-black/50 px-3 py-1.5">
              <span className="inline-block h-5 w-5 rounded-full border-2 border-[#8a5a00] bg-gradient-to-br from-[#ffe08a] to-[#e0a21c]" />
              <span className="font-display text-2xl font-bold tabular-nums text-[#ffd76a]">{game.economy.coins}</span>
            </div>
            <Btn onClick={onClose}>Fechar [{game.getHud().keys.shop}]</Btn>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                click();
                setTab(t.id);
                game.shopTab = t.id;
                setMsg(null);
              }}
              className={`rounded-t border-b-2 px-4 py-2 font-display text-sm font-bold uppercase tracking-widest transition ${
                tab === t.id ? "border-toxic bg-toxic/10 text-white" : "border-transparent text-white/45 hover:text-white/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-white/50">{hints[tab]}</p>

        <div className="scrollbar-thin mt-3 grid flex-1 grid-cols-1 gap-3 overflow-y-auto pr-2 md:grid-cols-2">
          {items.map((it) => {
            const disabled = it.status === "maxed" || !it.affordable;
            return (
              <div key={it.id} className={`rounded border p-3 ${it.status === "owned" ? "border-toxic/30 bg-toxic/5" : "border-white/10 bg-white/[0.03]"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-display text-base font-bold uppercase tracking-wider text-white">{it.name}</div>
                    <div className="text-xs text-white/55">{it.desc}</div>
                  </div>
                  {it.tag && <span className="shrink-0 rounded bg-black/60 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-ember">{it.tag}</span>}
                </div>
                {it.stats && (
                  <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-0.5 text-[0.68rem]">
                    {it.stats.map((s) => (
                      <div key={s.label} className="flex justify-between border-b border-white/5">
                        <span className="text-white/40">{s.label}</span>
                        <span className="font-mono text-white/80">{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div className={`font-display text-lg font-bold tabular-nums ${it.status === "maxed" ? "text-white/30" : it.affordable ? "text-[#ffd76a]" : "text-blood"}`}>
                    {it.status === "maxed" ? "—" : `${it.price} moedas`}
                  </div>
                  <Btn variant="primary" disabled={disabled} onClick={() => buy(it.id)}>
                    {it.action}
                  </Btn>
                </div>
                {!it.affordable && it.status !== "maxed" && <div className="mt-1 text-[0.68rem] text-blood">Faltam {it.price - game.economy.coins} moedas</div>}
              </div>
            );
          })}
        </div>

        <div className={`mt-3 h-6 text-sm font-bold ${msg ? (msg.ok ? "text-toxic" : "text-[#ff6b5a]") : "text-transparent"}`}>{msg?.text ?? "."}</div>
      </div>
    </div>
  );
}
