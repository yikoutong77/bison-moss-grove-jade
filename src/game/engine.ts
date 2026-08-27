import type { MinionInst, PlayerState, Pairing } from "./types";
import {
  applyBattlecry,
  applyEndOfTurn,
  applyOnPlay,
  applyOnSummonBuffs,
  brannExtra,
  discoverPool,
} from "./combat";
import {
  BUY_COST,
  BY_TIER,
  COLLECTIBLE,
  COPIES_PER_TIER,
  MAX_BOARD,
  MAX_GOLD,
  MAX_HAND,
  REFRESH_COST,
  SELL_REWARD,
  SHOP_SIZE,
  START_HP,
  UPGRADE_BASE,
  defOf,
  makeInst,
  scaleN,
  isGem,
  buffMinion,
} from "./minions";
import { HEROES, HERO_BY_ID } from "./heroes";
import type { Rng } from "./rng";
import { shuffle } from "./rng";

export type Pool = Record<string, number>;

export function createPool(): Pool {
  const pool: Pool = {};
  for (const m of COLLECTIBLE) {
    pool[m.id] = COPIES_PER_TIER[m.tier] ?? 10;
  }
  return pool;
}

export function takeFromPool(pool: Pool, id: string): boolean {
  if ((pool[id] ?? 0) <= 0) return false;
  pool[id] = (pool[id] ?? 0) - 1;
  return true;
}

export function returnToPool(pool: Pool, m: MinionInst) {
  const d = defOf(m.defId);
  if (d.token) return;
  const copies = m.golden ? 3 : 1;
  pool[m.defId] = (pool[m.defId] ?? 0) + copies;
}

export function goldForTurn(turn: number): number {
  return Math.min(MAX_GOLD, turn + 2);
}

export function buyCost(player: PlayerState): number {
  return Math.max(0, BUY_COST - (player.buyDiscount ?? 0));
}

export function upgradeCostNow(player: PlayerState): number {
  if (player.tavernTier >= 6) return 0;
  return Math.max(0, player.upgradeCost - (player.upgradeDiscount ?? 0));
}

export function makePlayer(
  id: string,
  heroId: string,
  name: string,
  isHuman: boolean,
): PlayerState {
  const hero = HERO_BY_ID[heroId];
  return {
    id,
    name,
    heroId,
    hp: START_HP,
    tavernTier: 1,
    gold: goldForTurn(1),
    upgradeCost: UPGRADE_BASE[1] ?? 5,
    board: [],
    hand: [],
    shop: [],
    frozen: false,
    isHuman,
    alive: true,
    placement: null,
    triples: 0,
    streak: 0,
    wins: 0,
    losses: 0,
    armor: hero?.armor ?? 0,
    powerUsed: false,
    buyDiscount: 0,
    upgradeDiscount: 0,
  };
}

export function initLobby(humanHeroId: string, rng: Rng): PlayerState[] {
  const humanHero = HEROES.find((h) => h.id === humanHeroId) ?? HEROES[0]!;
  const rest = shuffle(
    HEROES.filter((h) => h.id !== humanHero.id),
    rng,
  );
  const players: PlayerState[] = [
    makePlayer("you", humanHero.id, humanHero.name, true),
  ];
  for (let i = 0; i < 7; i++) {
    const h = rest[i]!;
    players.push(makePlayer(`ai-${i}`, h.id, h.name, false));
  }
  return players;
}

export function rollShop(
  player: PlayerState,
  pool: Pool,
  rng: Rng,
  unfreezeKept = true,
): MinionInst[] {
  const size = SHOP_SIZE[player.tavernTier] ?? 3;
  const kept = player.shop.filter((m) => m.frozen);
  const need = Math.max(0, size - kept.length);
  const available: string[] = [];
  for (let t = 1; t <= player.tavernTier; t++) {
    for (const d of BY_TIER[t] ?? []) {
      const copies = pool[d.id] ?? 0;
      for (let i = 0; i < copies; i++) available.push(d.id);
    }
  }
  const picked: MinionInst[] = [];
  const bag = shuffle(available, rng);
  for (const id of bag) {
    if (picked.length >= need) break;
    if (takeFromPool(pool, id)) {
      picked.push(makeInst(id, false));
    }
  }
  const keptNext = kept.map((m) => ({ ...m, frozen: unfreezeKept ? false : true }));
  return [...keptNext, ...picked];
}

export function refreshShop(player: PlayerState, pool: Pool, rng: Rng): PlayerState {
  if (player.gold < REFRESH_COST) return player;
  for (const m of player.shop) {
    if (!m.frozen) returnToPool(pool, m);
  }
  const held = player.shop.filter((m) => m.frozen);
  const next: PlayerState = {
    ...player,
    gold: player.gold - REFRESH_COST,
    shop: held,
    frozen: held.length > 0,
  };
  next.shop = rollShop(next, pool, rng, false);
  next.frozen = next.shop.some((m) => m.frozen);
  return next;
}

export function freezeShop(player: PlayerState): PlayerState {
  const anyUnfrozen = player.shop.some((m) => !m.frozen);
  return {
    ...player,
    frozen: anyUnfrozen,
    shop: player.shop.map((m) => ({ ...m, frozen: anyUnfrozen })),
  };
}

export function freezeOne(player: PlayerState, uid: string): PlayerState {
  return {
    ...player,
    shop: player.shop.map((m) => (m.uid === uid ? { ...m, frozen: !m.frozen } : m)),
    frozen: player.shop.some((m) => (m.uid === uid ? !m.frozen : m.frozen)),
  };
}

export function upgradeTavern(player: PlayerState): PlayerState {
  if (player.tavernTier >= 6) return player;
  const cost = upgradeCostNow(player);
  if (player.gold < cost) return player;
  const tier = player.tavernTier + 1;
  return {
    ...player,
    gold: player.gold - cost,
    tavernTier: tier,
    upgradeCost: UPGRADE_BASE[tier] ?? 0,
    upgradeDiscount: 0,
  };
}

export function startTurn(player: PlayerState, turn: number, pool: Pool, rng: Rng): PlayerState {
  const gold = goldForTurn(turn);
  const upgradeCost =
    player.tavernTier >= 6 ? 0 : Math.max(0, player.upgradeCost - (turn === 1 ? 0 : 1));
  for (const m of player.shop) {
    if (!m.frozen) returnToPool(pool, m);
  }
  const kept = player.shop.filter((m) => m.frozen);
  let next: PlayerState = {
    ...player,
    gold,
    upgradeCost,
    shop: kept,
    frozen: kept.length > 0,
    powerUsed: false,
    buyDiscount: 0,
    upgradeDiscount: 0,
  };
  next.shop = rollShop(next, pool, rng, true);
  next.frozen = false;
  return next;
}

export interface BuyResult {
  player: PlayerState;
  triple?: { golden: MinionInst; sourceTier: number };
}

export function buyMinion(
  player: PlayerState,
  shopUid: string,
  rng: Rng,
): BuyResult {
  if (player.gold < buyCost(player)) return { player };
  if (player.hand.length >= MAX_HAND) return { player };
  const shopMinion = player.shop.find((m) => m.uid === shopUid);
  if (!shopMinion) return { player };

  const bought = { ...shopMinion, frozen: false };
  const shop = player.shop.filter((m) => m.uid !== shopUid);
  const next: PlayerState = {
    ...player,
    gold: player.gold - buyCost(player),
    hand: [...player.hand, bought],
    shop,
    buyDiscount: 0,
  };

  return tryTriple(next);
}

export function playFromHand(
  player: PlayerState,
  handUid: string,
  slot: number,
  rng: Rng,
): BuyResult {
  const i = player.hand.findIndex((m) => m.uid === handUid);
  if (i < 0) return { player };
  const played = player.hand[i]!;
  if (isGem(played)) {
    if (player.board.length === 0) return { player };
    const idx = Math.max(0, Math.min(slot, player.board.length - 1));
    const target = player.board[idx]!;
    const atk = scaleN(1, played.golden);
    const hp = scaleN(1, played.golden);
    const board = player.board.map((m) => (m.uid === target.uid ? buffMinion(m, atk, hp) : m));
    const hand = player.hand.filter((m) => m.uid !== handUid);
    return { player: { ...player, hand, board } };
  }
  if (player.board.length >= MAX_BOARD) return { player };
  const hand = player.hand.filter((m) => m.uid !== handUid);
  const idx = Math.max(0, Math.min(slot, player.board.length));
  let board = player.board.slice();
  board.splice(idx, 0, played);
  board = applyOnSummonBuffs(board, played);
  board = applyOnPlay(board, played);
  board = applyBattlecry(board, played, idx, rng, brannExtra(player.board));
  let next = tryTriple({ ...player, hand, board });
  const extra = 1 + brannExtra(player.board);
  for (const fx of defOf(played.defId).effects) {
    if (fx.kind === "give_gems" && fx.when !== "end_turn") {
      next = { player: grantGems(next.player, scaleN(fx.count, played.golden) * extra), triple: next.triple };
    }
  }
  return next;
}

function grantGems(player: PlayerState, count: number): PlayerState {
  if (count <= 0) return player;
  let hand = player.hand.slice();
  for (let i = 0; i < count && hand.length < MAX_HAND; i++) {
    hand.push(makeInst("bloodgem"));
  }
  return { ...player, hand };
}

export function tryTriple(player: PlayerState): BuyResult {
  let current = player;
  let last: BuyResult["triple"];
  for (let guard = 0; guard < 6; guard++) {
    const once = tryTripleOnce(current);
    if (!once.triple) return last ? { player: current, triple: last } : { player: current };
    current = once.player;
    last = once.triple;
  }
  return last ? { player: current, triple: last } : { player: current };
}

function tryTripleOnce(player: PlayerState): BuyResult {
  const counts = new Map<string, MinionInst[]>();
  const add = (m: MinionInst) => {
    if (m.golden) return;
    const d = defOf(m.defId);
    if (d.token) return;
    const arr = counts.get(m.defId) ?? [];
    arr.push(m);
    counts.set(m.defId, arr);
  };
  for (const m of player.board) add(m);
  for (const m of player.hand) add(m);
  for (const m of player.shop) add(m);
  for (const [defId, copies] of counts) {
    if (copies.length < 3) continue;
    const used = copies.slice(0, 3);
    const usedUids = new Set(used.map((m) => m.uid));
    const d = defOf(defId);
    const extraAtk = used.reduce((s, m) => s + (m.atk - d.atk), 0);
    const extraHp = used.reduce((s, m) => s + (m.hp - d.hp), 0);
    const golden = makeInst(defId, true);
    golden.atk += extraAtk;
    golden.hp += extraHp;
    golden.maxHp = golden.hp;
    const kw = new Set<MinionInst["keywords"][number]>();
    for (const m of used) for (const k of m.keywords) kw.add(k);
    golden.keywords = [...kw];

    const board = player.board.filter((m) => !usedUids.has(m.uid));
    const shop = player.shop.filter((m) => !usedUids.has(m.uid));
    let hand = player.hand.filter((m) => !usedUids.has(m.uid));
    if (hand.length < MAX_HAND) hand = [...hand, golden];
    else if (board.length < MAX_BOARD) {
      return {
        player: { ...player, board: [...board, golden], shop, hand, triples: player.triples + 1 },
        triple: { golden, sourceTier: d.tier },
      };
    } else shop.push(golden);
    return {
      player: { ...player, board, shop, hand, triples: player.triples + 1 },
      triple: { golden, sourceTier: d.tier },
    };
  }
  return { player };
}

export function sellMinion(player: PlayerState, uid: string, pool: Pool): PlayerState {
  const onBoard = player.board.find((x) => x.uid === uid);
  const onHand = player.hand.find((x) => x.uid === uid);
  const m = onBoard ?? onHand;
  if (!m) return player;
  returnToPool(pool, m);
  return {
    ...player,
    gold: Math.min(MAX_GOLD, player.gold + SELL_REWARD),
    board: player.board.filter((x) => x.uid !== uid),
    hand: player.hand.filter((x) => x.uid !== uid),
  };
}

export function moveMinion(player: PlayerState, fromUid: string, toIndex: number): PlayerState {
  const from = player.board.findIndex((m) => m.uid === fromUid);
  if (from < 0) return player;
  const board = player.board.slice();
  const [item] = board.splice(from, 1);
  if (!item) return player;
  const idx = Math.max(0, Math.min(toIndex, board.length));
  board.splice(idx, 0, item);
  return { ...player, board };
}

export function addDiscovered(player: PlayerState, defId: string, rng: Rng): PlayerState {
  if (player.hand.length >= MAX_HAND) {
    if (player.board.length < MAX_BOARD) {
      const inst = makeInst(defId, false);
      let board = [...player.board, inst];
      board = applyOnSummonBuffs(board, inst);
      board = applyOnPlay(board, inst);
      board = applyBattlecry(board, inst, board.length - 1, rng, brannExtra(player.board));
      return tryTriple({ ...player, board }).player;
    }
    return player;
  }
  const inst = makeInst(defId, false);
  return tryTriple({ ...player, hand: [...player.hand, inst] }).player;
}

export function pickDiscoverOptions(tier: number, rng: Rng): MinionInst[] {
  const pool = discoverPool(Math.min(6, tier + 1));
  return shuffle(pool, rng).slice(0, 3);
}

export function pairPlayers(aliveIds: string[], rng: Rng, lastGhost?: string): Pairing[] {
  const ids = shuffle(aliveIds, rng);
  const pairs: Pairing[] = [];
  if (ids.length % 2 === 1) {
    const leftover = ids.pop()!;
    const ghostCand = lastGhost && lastGhost !== leftover && aliveIds.includes(lastGhost)
      ? lastGhost
      : (ids.find((id) => id !== leftover) ?? leftover);
    pairs.push({ a: leftover, b: ghostCand, ghost: true });
  }
  for (let i = 0; i < ids.length; i += 2) {
    pairs.push({ a: ids[i]!, b: ids[i + 1]! });
  }
  return pairs;
}

export function humanPair(pairs: Pairing[], youId: string): Pairing | undefined {
  return pairs.find((p) => !p.ghost && (p.a === youId || p.b === youId))
    ?? pairs.find((p) => p.a === youId || p.b === youId);
}

export function knockOut(p: PlayerState, placement: number, pool: Pool): PlayerState {
  for (const m of p.board) returnToPool(pool, m);
  for (const m of p.hand) returnToPool(pool, m);
  for (const m of p.shop) returnToPool(pool, m);
  return { ...p, hp: 0, alive: false, placement, board: [], hand: [], shop: [] };
}

export function applyFightDamage(
  players: PlayerState[],
  id: string,
  lost: boolean,
  damage: number,
  nextPlace: number,
  pool: Pool,
): { players: PlayerState[]; nextPlace: number } {
  if (!lost || damage <= 0) return { players, nextPlace };
  let placed = nextPlace;
  const next = players.map((p) => {
    if (p.id !== id || !p.alive) return p;
    const soaked = Math.min(p.armor, damage);
    const armor = p.armor - soaked;
    const hp = p.hp - (damage - soaked);
    if (hp <= 0) {
      const dead = knockOut({ ...p, armor: 0 }, placed, pool);
      placed -= 1;
      return dead;
    }
    return { ...p, hp, armor };
  });
  return { players: next, nextPlace: placed };
}

export function finishTurnBoards(player: PlayerState, rng: Rng): PlayerState {
  let next: PlayerState = { ...player, board: applyEndOfTurn(player.board, rng) };
  for (const m of next.board) {
    for (const fx of defOf(m.defId).effects) {
      if (fx.kind === "give_gems" && (fx.when === "end_turn" || fx.when === "both")) {
        next = grantGems(next, scaleN(fx.count, m.golden));
      }
    }
  }
  return next;
}

export function recountAlive(players: PlayerState[]): PlayerState[] {
  const living = players.filter((p) => p.alive);
  if (living.length === 1) {
    return players.map((p) =>
      p.id === living[0]!.id ? { ...p, placement: 1 } : p,
    );
  }
  return players;
}

export function recordOutcome(
  p: PlayerState,
  outcome: "win" | "loss" | "tie",
): PlayerState {
  if (outcome === "tie") return { ...p, streak: 0 };
  if (outcome === "win") {
    return {
      ...p,
      wins: p.wins + 1,
      streak: p.streak >= 0 ? p.streak + 1 : 1,
    };
  }
  return {
    ...p,
    losses: p.losses + 1,
    streak: p.streak <= 0 ? p.streak - 1 : -1,
  };
}

export function canUseHeroPower(player: PlayerState): { ok: boolean; reason: string } {
  const hero = HERO_BY_ID[player.heroId];
  if (!hero) return { ok: false, reason: "没有技能" };
  if (player.powerUsed) return { ok: false, reason: "本回合已使用" };
  if (player.gold < hero.power.cost) return { ok: false, reason: "金币不足" };
  switch (hero.power.kind) {
    case "summon_token":
      if (player.hand.length >= MAX_HAND && player.board.length >= MAX_BOARD) {
        return { ok: false, reason: "手牌和战场都满了" };
      }
      break;
    case "random_shield":
    case "buff_random":
    case "heal_random":
      if (player.board.length === 0) return { ok: false, reason: "战场上没有随从" };
      break;
    case "life_for_gold":
      if (player.hp <= 2) return { ok: false, reason: "生命过低" };
      break;
    default:
      break;
  }
  return { ok: true, reason: "" };
}

export function useHeroPower(
  player: PlayerState,
  pool: Pool,
  rng: Rng,
): { player: PlayerState; ok: boolean; message: string } {
  const hero = HERO_BY_ID[player.heroId];
  const gate = canUseHeroPower(player);
  if (!hero || !gate.ok) return { player, ok: false, message: gate.reason };

  let next: PlayerState = {
    ...player,
    gold: player.gold - hero.power.cost,
    powerUsed: true,
  };

  switch (hero.power.kind) {
    case "refresh_freeze": {
      for (const m of next.shop) {
        if (!m.frozen) returnToPool(pool, m);
      }
      const held = next.shop.filter((m) => m.frozen);
      next = { ...next, shop: held, frozen: held.length > 0 };
      next.shop = rollShop(next, pool, rng, false).map((m) => ({ ...m, frozen: true }));
      next.frozen = next.shop.length > 0;
      return { player: next, ok: true, message: "酒馆已刷新并冻结" };
    }
    case "summon_token": {
      const token = makeInst("tabbycat");
      if (next.hand.length < MAX_HAND) {
        return { player: { ...next, hand: [...next.hand, token] }, ok: true, message: "虎斑猫加入手牌" };
      }
      let board = [...next.board, token];
      board = applyOnSummonBuffs(board, token);
      return { player: { ...next, board }, ok: true, message: "召唤了虎斑猫" };
    }
    case "cheap_buy":
      return { player: { ...next, buyDiscount: 1 }, ok: true, message: "下一次购买 2 金币" };
    case "random_shield": {
      const t = rng.pick(next.board);
      const board = next.board.map((m) => {
        if (m.uid !== t.uid || m.keywords.includes("divineShield")) return m;
        return { ...m, keywords: [...m.keywords, "divineShield" as const] };
      });
      return { player: { ...next, board }, ok: true, message: `${defOf(t.defId).name} 获得圣盾` };
    }
    case "life_for_gold": {
      const hp = next.hp - 2;
      const gold = Math.min(MAX_GOLD, next.gold + 2);
      return { player: { ...next, hp, gold }, ok: true, message: "以血换金 +2" };
    }
    case "buff_random": {
      const t = rng.pick(next.board);
      const board = next.board.map((m) =>
        m.uid === t.uid ? { ...m, atk: m.atk + 2, hp: m.hp + 1, maxHp: m.maxHp + 1 } : m,
      );
      return { player: { ...next, board }, ok: true, message: `${defOf(t.defId).name} +2/+1` };
    }
    case "heal_random": {
      const t = rng.pick(next.board);
      const board = next.board.map((m) =>
        m.uid === t.uid ? { ...m, hp: m.hp + 3, maxHp: m.maxHp + 3 } : m,
      );
      return { player: { ...next, board }, ok: true, message: `${defOf(t.defId).name} +3 生命` };
    }
    case "cheap_upgrade":
      return { player: { ...next, upgradeDiscount: 3 }, ok: true, message: "本回合升级减 3 金" };
    case "gain_armor":
      return { player: { ...next, armor: next.armor + 3 }, ok: true, message: "获得 3 点护甲" };
    default:
      return { player, ok: false, message: "未知技能" };
  }
}

