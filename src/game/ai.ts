import type { PlayerState, Tribe } from "./types";
import {
  addDiscovered,
  buyMinion,
  buyCost,
  freezeShop,
  pickDiscoverOptions,
  playFromHand,
  refreshShop,
  sellMinion,
  upgradeCostNow,
  upgradeTavern,
  useHeroPower,
  canUseHeroPower,
  type Pool,
} from "./engine";
import { BUY_COST, MAX_BOARD, MAX_HAND, REFRESH_COST, defOf, minionValue, isGem } from "./minions";
import { HERO_BY_ID } from "./heroes";
import type { Rng } from "./rng";

function pieces(p: PlayerState) {
  return [...p.board, ...p.hand];
}

function dominantTribe(p: PlayerState): Tribe | null {
  const counts = new Map<Tribe, number>();
  for (const m of pieces(p)) {
    const t = defOf(m.defId).tribe;
    if (t === "neutral") continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  let best: Tribe | null = null;
  let n = 0;
  for (const [t, c] of counts) {
    if (c > n) {
      best = t;
      n = c;
    }
  }
  return n >= 2 ? best : null;
}

function wantsTriple(p: PlayerState, defId: string): boolean {
  const n = pieces(p).filter((m) => m.defId === defId && !m.golden).length;
  return n >= 2;
}

function shopScore(p: PlayerState, defId: string): number {
  const d = defOf(defId);
  const m = p.shop.find((x) => x.defId === defId);
  let v = m ? minionValue(m) : d.tier * 10;
  if (wantsTriple(p, defId)) v += 55;
  const tribe = dominantTribe(p);
  if (tribe && d.tribe === tribe) v += 24;
  else if (tribe && d.tribe !== "neutral" && d.tribe !== tribe && p.board.length >= 4) v -= 8;
  return v;
}

function wantsPower(p: PlayerState): boolean {
  if (!canUseHeroPower(p).ok) return false;
  const kind = HERO_BY_ID[p.heroId]?.power.kind;
  switch (kind) {
    case "life_for_gold":
      return p.hp > 12 && p.gold <= 6;
    case "summon_token":
      return p.hand.length < MAX_HAND;
    case "refresh_freeze":
      return p.gold >= 2 && (p.board.length < 4 || p.shop.every((m) => shopScore(p, m.defId) < 18));
    case "cheap_buy":
      return p.gold >= buyCost(p) + 1 && p.shop.length > 0;
    case "cheap_upgrade":
      return p.tavernTier < 6 && p.gold >= 1 + Math.max(0, upgradeCostNow(p) - 3);
    case "buff_random":
      return p.board.length >= 1 && p.gold >= 2;
    case "heal_random":
      return p.board.length >= 1 && p.gold >= 2;
    case "random_shield":
      return p.board.length >= 2 && p.gold >= 4;
    case "gain_armor":
      return p.armor < 10 && p.gold >= 4;
    default:
      return false;
  }
}

export function aiPlayTurn(player: PlayerState, pool: Pool, rng: Rng): PlayerState {
  let p = player;
  let guard = 28;
  while (guard-- > 0) {
    if (wantsPower(p) && rng.chance(0.85)) {
      const res = useHeroPower(p, pool, rng);
      if (res.ok) {
        p = res.player;
        continue;
      }
    }

    const shopBuyable = p.shop
      .map((m) => ({ m, v: shopScore(p, m.defId) }))
      .sort((a, b) => b.v - a.v);

    const canBuy = p.gold >= buyCost(p) && shopBuyable.length > 0;
    const best = shopBuyable[0];
    const tribe = dominantTribe(p);

    const shouldUpgrade =
      p.tavernTier < 6 &&
      p.gold >= upgradeCostNow(p) &&
      (p.board.length + p.hand.length >= Math.min(4, p.tavernTier + 1) || upgradeCostNow(p) <= 4) &&
      (p.gold - upgradeCostNow(p) >= BUY_COST || p.board.length + p.hand.length >= 3);

    if (shouldUpgrade && rng.chance(p.tavernTier <= 2 ? 0.62 : tribe ? 0.48 : 0.55)) {
      p = upgradeTavern(p);
      continue;
    }

    if (canBuy && best) {
      if (p.hand.length < MAX_HAND) {
        const res = buyMinion(p, best.m.uid, rng);
        if (res.player !== p) {
          p = res.player;
          if (res.triple) {
            const opts = pickDiscoverOptions(res.triple.sourceTier, rng);
            if (opts[0]) {
              const pick = [...opts].sort((a, b) => {
                const ta = dominantTribe(p);
                const sa = minionValue(a) + (ta && defOf(a.defId).tribe === ta ? 20 : 0);
                const sb = minionValue(b) + (ta && defOf(b.defId).tribe === ta ? 20 : 0);
                return sb - sa;
              })[0]!;
              p = addDiscovered(p, pick.defId, rng);
            }
          }
          continue;
        }
      } else {
        const poolPieces = pieces(p);
        const offTribe = poolPieces
          .filter((m) => {
            const t = defOf(m.defId).tribe;
            return tribe && t !== tribe && t !== "neutral" && !m.golden;
          })
          .sort((a, b) => minionValue(a) - minionValue(b));
        const worst =
          offTribe[0] ?? [...poolPieces].sort((a, b) => minionValue(a) - minionValue(b))[0];
        if (worst && shopScore(p, best.m.defId) > minionValue(worst) + 8) {
          p = sellMinion(p, worst.uid, pool);
          continue;
        }
      }
    }

    const gem = p.hand.find((m) => isGem(m));
    if (gem && p.board.length) {
      const res = playFromHand(p, gem.uid, rng.int(p.board.length), rng);
      if (res.player !== p) {
        p = res.player;
        continue;
      }
    }

    if (p.hand.length && p.board.length < MAX_BOARD) {
      const next = p.hand[0]!;
      const res = playFromHand(p, next.uid, p.board.length, rng);
      if (res.player !== p) {
        p = res.player;
        if (res.triple) {
          const opts = pickDiscoverOptions(res.triple.sourceTier, rng);
          if (opts[0]) p = addDiscovered(p, opts[0].defId, rng);
        }
        continue;
      }
    }

    if (p.gold >= REFRESH_COST + (p.hand.length < MAX_HAND ? buyCost(p) : 0) && p.gold >= 1) {
      const bestV = best ? best.v : 0;
      const threshold = 14 + p.tavernTier * 3 + (tribe ? 6 : 0);
      if (bestV < threshold || p.board.length + p.hand.length < 3) {
        const before = p.shop.map((m) => m.uid).join();
        p = refreshShop(p, pool, rng);
        if (p.shop.map((m) => m.uid).join() !== before) continue;
      }
    }

    if (p.tavernTier < 6 && p.gold >= upgradeCostNow(p)) {
      p = upgradeTavern(p);
      continue;
    }

    break;
  }

  while (p.hand.length && p.board.length < MAX_BOARD) {
    const next = p.hand.find((m) => !isGem(m)) ?? p.hand[0]!;
    const res = playFromHand(p, next.uid, p.board.length, rng);
    if (res.player === p) break;
    p = res.player;
    if (res.triple) {
      const opts = pickDiscoverOptions(res.triple.sourceTier, rng);
      if (opts[0]) p = addDiscovered(p, opts[0].defId, rng);
    }
  }
  while (p.board.length) {
    const gem = p.hand.find((m) => isGem(m));
    if (!gem) break;
    const res = playFromHand(p, gem.uid, rng.int(p.board.length), rng);
    if (res.player === p) break;
    p = res.player;
  }

  const tribe = dominantTribe(p);
  const freezeWorthy = p.shop.some((m) => {
    if (wantsTriple(p, m.defId)) return true;
    if (tribe && defOf(m.defId).tribe === tribe) return minionValue(m) >= 12;
    return minionValue(m) >= 18 + p.tavernTier * 2;
  });
  if (p.gold <= 1 && freezeWorthy) p = freezeShop(p);

  const board = [...p.board].sort((a, b) => {
    const za = a.atk === 0 ? 1 : 0;
    const zb = b.atk === 0 ? 1 : 0;
    if (za !== zb) return za - zb;
    if (b.atk !== a.atk) return b.atk - a.atk;
    return defOf(b.defId).tier - defOf(a.defId).tier;
  });
  return { ...p, board };
}
