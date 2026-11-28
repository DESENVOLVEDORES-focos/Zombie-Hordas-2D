import { BUYPOINT, SUPPLIES, UPGRADES, UPGRADE_MAX, upgradeCost } from "../config/economy";
import { WEAPONS, WEAPON_BY_ID, type UpgradeKey, type WeaponDef } from "../config/weapons";
import type { BuyPoint } from "../maps/types";
import type { ShopCategory, ShopItem } from "../core/types";
import type { Game } from "../core/Game";

export interface PurchaseResult {
  ok: boolean;
  msg: string;
}

const fail = (msg: string): PurchaseResult => ({ ok: false, msg });
const ok = (msg: string): PurchaseResult => ({ ok: true, msg });

/** Catálogo e compras: armas, munição, melhorias, defesas e suprimentos. Valida saldo sempre. */
export class ShopSystem {
  constructor(private g: Game) {}

  private weaponStats(def: WeaponDef) {
    return [
      { label: "Dano", value: def.pellets > 1 ? `${def.pellets}×${def.damage}` : def.blastRadius ? `${def.damage} (área)` : `${def.damage}` },
      { label: "Cadência", value: `${def.fireRate}/s ${def.mode === "auto" ? "auto" : "semi"}` },
      { label: "Pente", value: `${def.magSize} / ${def.reserveAmmo}` },
      { label: "Alcance", value: `${def.range}` },
      { label: "Recarga", value: `${def.reloadTime}s` },
      { label: "Precisão", value: `${def.spread}°` },
    ];
  }

  catalog(): ShopItem[] {
    const g = this.g;
    const p = g.player;
    const coins = g.economy.coins;
    const items: ShopItem[] = [];
    const add = (i: Omit<ShopItem, "affordable"> & { affordable?: boolean }) => items.push({ ...i, affordable: i.affordable ?? coins >= i.price });

    for (const def of WEAPONS) {
      const owned = p.weapons[def.slot];
      if (!owned) {
        add({ id: `weapon:${def.id}`, category: "weapons", name: def.name, desc: def.desc, price: def.price, action: "Comprar", status: "available", tag: `Tecla ${def.slot + 1}`, stats: this.weaponStats(def) });
      } else {
        const full = owned.reserve >= def.maxReserve && owned.mag >= g.weapons.stats(owned).magSize;
        add({
          id: `weapon:${def.id}`,
          category: "weapons",
          name: def.name,
          desc: `Na mochila · ${owned.mag}/${owned.reserve} munição`,
          price: def.ammoPrice,
          action: full ? "Cheia" : "Munição",
          status: full ? "maxed" : "owned",
          tag: `Tecla ${def.slot + 1}`,
          stats: this.weaponStats(def),
        });
      }
    }

    const ws = g.weapons.current();
    (Object.keys(UPGRADES) as UpgradeKey[]).forEach((k) => {
      const lvl = ws.levels[k];
      const maxed = lvl >= UPGRADE_MAX;
      add({
        id: `upgrade:${k}`,
        category: "upgrades",
        name: `${UPGRADES[k].label} — ${ws.def.name}`,
        desc: UPGRADES[k].desc,
        price: maxed ? 0 : upgradeCost(k, lvl, ws.def.slot),
        action: maxed ? "Máximo" : "Melhorar",
        status: maxed ? "maxed" : "available",
        tag: `Nível ${lvl}/${UPGRADE_MAX}`,
      });
    });

    const b = g.build;
    add({ id: "build:barricade", category: "defenses", name: "Barricada de Madeira", desc: "Bloqueia a passagem. Zumbis precisam destruí-la. Custo sobe a cada construção.", price: b.cost("barricade"), action: "Construir", status: "available", tag: `${b.built.barricade} construídas` });
    add({ id: "build:turret", category: "defenses", name: "Torreta Automática", desc: "Detecta, mira e atira sozinha em zumbis ao alcance. Custo sobe a cada construção.", price: b.cost("turret"), action: "Instalar", status: "available", tag: `${b.built.turret} instaladas` });

    add({ id: "supply:medkit", category: "supplies", name: "Kit Médico", desc: "Recupera toda a vida.", price: SUPPLIES.medkit.price, action: p.hp >= p.maxHp ? "Vida cheia" : "Usar", status: p.hp >= p.maxHp ? "maxed" : "available" });
    const vl = p.vestLevel;
    add({ id: "supply:vest", category: "supplies", name: "Colete Balístico", desc: `+${SUPPLIES.vest.hpPer} de vida máxima`, price: vl >= SUPPLIES.vest.prices.length ? 0 : SUPPLIES.vest.prices[vl], action: vl >= SUPPLIES.vest.prices.length ? "Máximo" : "Comprar", status: vl >= SUPPLIES.vest.prices.length ? "maxed" : "available", tag: `Nível ${vl}/${SUPPLIES.vest.prices.length}` });
    const bl = p.bootsLevel;
    add({ id: "supply:boots", category: "supplies", name: "Botas de Corrida", desc: `+${Math.round(SUPPLIES.boots.speedPer * 100)}% de velocidade`, price: bl >= SUPPLIES.boots.prices.length ? 0 : SUPPLIES.boots.prices[bl], action: bl >= SUPPLIES.boots.prices.length ? "Máximo" : "Comprar", status: bl >= SUPPLIES.boots.prices.length ? "maxed" : "available", tag: `Nível ${bl}/${SUPPLIES.boots.prices.length}` });

    return items.map((it) => (it.status === "maxed" ? { ...it, affordable: false } : it));
  }

  categories(): { id: ShopCategory; label: string }[] {
    return [
      { id: "weapons", label: "Armas" },
      { id: "upgrades", label: "Melhorias" },
      { id: "defenses", label: "Defesas" },
      { id: "supplies", label: "Suprimentos" },
    ];
  }

  purchase(id: string): PurchaseResult {
    const g = this.g;
    const [kind, key] = id.split(":");
    const r = this.doPurchase(kind, key);
    if (!r.ok && r.msg.startsWith("Moedas")) g.audio.play("denied");
    return r;
  }

  private doPurchase(kind: string, key: string): PurchaseResult {
    const g = this.g;
    const p = g.player;
    const eco = g.economy;
    switch (kind) {
      case "weapon": {
        const def = WEAPON_BY_ID[key];
        if (!def) return fail("Arma inválida");
        return this.buyWeapon(def, 1, 1);
      }
      case "upgrade": {
        const k = key as UpgradeKey;
        const ws = g.weapons.current();
        const lvl = ws.levels[k];
        if (lvl >= UPGRADE_MAX) return fail("Melhoria no nível máximo");
        const price = upgradeCost(k, lvl, ws.def.slot);
        if (!eco.spend(price)) return fail(`Moedas insuficientes (${price})`);
        ws.levels[k]++;
        g.audio.play("buy");
        return ok(`${UPGRADES[k].label} nível ${ws.levels[k]}`);
      }
      case "build": {
        const r = g.build.start(key as "barricade" | "turret");
        if (r.ok) g.closeShop();
        return r;
      }
      case "supply": {
        if (key === "medkit") {
          if (p.hp >= p.maxHp) return fail("Vida já está cheia");
          if (!eco.spend(SUPPLIES.medkit.price)) return fail(`Moedas insuficientes (${SUPPLIES.medkit.price})`);
          p.hp = p.maxHp;
          g.audio.play("heal");
          return ok("Vida restaurada");
        }
        if (key === "vest") {
          const prices = SUPPLIES.vest.prices;
          if (p.vestLevel >= prices.length) return fail("Colete no máximo");
          const price = prices[p.vestLevel];
          if (!eco.spend(price)) return fail(`Moedas insuficientes (${price})`);
          p.vestLevel++;
          p.maxHp += SUPPLIES.vest.hpPer;
          p.hp += SUPPLIES.vest.hpPer;
          g.audio.play("buy");
          return ok(`Vida máxima: ${p.maxHp}`);
        }
        if (key === "boots") {
          const prices = SUPPLIES.boots.prices;
          if (p.bootsLevel >= prices.length) return fail("Botas no máximo");
          const price = prices[p.bootsLevel];
          if (!eco.spend(price)) return fail(`Moedas insuficientes (${price})`);
          p.bootsLevel++;
          p.speedMul = 1 + SUPPLIES.boots.speedPer * p.bootsLevel;
          g.audio.play("buy");
          return ok("Velocidade aumentada");
        }
        return fail("Item inválido");
      }
    }
    return fail("Item inválido");
  }

  private buyWeapon(def: WeaponDef, priceMul: number, ammoMul: number): PurchaseResult {
    const g = this.g;
    const owned = g.player.weapons[def.slot];
    if (owned) {
      const st = g.weapons.stats(owned);
      if (owned.reserve >= def.maxReserve && owned.mag >= st.magSize) return fail("Munição já está cheia");
      const price = Math.round(def.ammoPrice * ammoMul);
      if (!g.economy.spend(price)) return fail(`Moedas insuficientes (${price})`);
      g.weapons.refill(owned);
      g.audio.play("buy");
      return ok(`${def.name}: munição reabastecida`);
    }
    const price = Math.round(def.price * priceMul);
    if (!g.economy.spend(price)) return fail(`Moedas insuficientes (${price})`);
    g.weapons.give(def);
    g.audio.play("buy");
    return ok(`${def.name} comprada e equipada!`);
  }

  /** Informações do ponto de compra para o prompt de interação. */
  buyPointInfo(bp: BuyPoint): { text: string; price: number; can: boolean } {
    const g = this.g;
    const coins = g.economy.coins;
    if (bp.kind === "weapon") {
      const def = WEAPON_BY_ID[bp.weaponId ?? "shotgun"];
      const owned = g.player.weapons[def.slot];
      if (!owned) {
        const price = Math.round(def.price * BUYPOINT.discount);
        return { text: `Comprar ${def.name}`, price, can: coins >= price };
      }
      const price = Math.round(def.ammoPrice * BUYPOINT.ammoMul);
      return { text: `Munição ${def.name}`, price, can: coins >= price };
    }
    if (bp.kind === "ammo") {
      const ws = g.weapons.current();
      const price = Math.round(ws.def.ammoPrice * BUYPOINT.ammoMul);
      return { text: `Munição (${ws.def.name})`, price, can: coins >= price };
    }
    if (bp.kind === "medic") {
      const price = Math.round(SUPPLIES.medkit.price * 0.7);
      return { text: "Posto médico", price, can: coins >= price };
    }
    return { text: "Bancada de melhorias", price: 0, can: true };
  }

  useBuyPoint(bp: BuyPoint): PurchaseResult {
    const g = this.g;
    const p = g.player;
    if (bp.kind === "upgrade") {
      g.openShop("upgrades");
      return ok("");
    }
    if (bp.kind === "weapon") {
      const r = this.buyWeapon(WEAPON_BY_ID[bp.weaponId ?? "shotgun"], BUYPOINT.discount, BUYPOINT.ammoMul);
      if (!r.ok && r.msg.startsWith("Moedas")) g.audio.play("denied");
      return r;
    }
    if (bp.kind === "ammo") {
      const ws = g.weapons.current();
      if (ws.reserve >= ws.def.maxReserve && ws.mag >= g.weapons.stats(ws).magSize) return fail("Munição já está cheia");
      const price = Math.round(ws.def.ammoPrice * BUYPOINT.ammoMul);
      if (!g.economy.spend(price)) {
        g.audio.play("denied");
        return fail(`Moedas insuficientes (${price})`);
      }
      g.weapons.refill(ws);
      g.audio.play("buy");
      return ok("Munição reabastecida");
    }
    if (p.hp >= p.maxHp) return fail("Vida já está cheia");
    const price = Math.round(SUPPLIES.medkit.price * 0.7);
    if (!g.economy.spend(price)) {
      g.audio.play("denied");
      return fail(`Moedas insuficientes (${price})`);
    }
    p.hp = p.maxHp;
    g.audio.play("heal");
    return ok("Vida restaurada");
  }
}
