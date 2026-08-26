import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRng } from "./rng.ts";
import { makeInst } from "./minions.ts";
import {
  buyMinion,
  playFromHand,
  buyCost,
  createPool,
  freezeOne,
  goldForTurn,
  makePlayer,
  pairPlayers,
  humanPair,
  refreshShop,
  rollShop,
  sellMinion,
  tryTriple,
  applyFightDamage,
  useHeroPower,
} from "./engine.ts";

describe("economy", () => {
  it("gives 3 gold on turn 1 and caps at 10", () => {
    assert.equal(goldForTurn(1), 3);
    assert.equal(goldForTurn(2), 4);
    assert.equal(goldForTurn(8), 10);
    assert.equal(goldForTurn(20), 10);
  });
});

describe("freeze + refresh", () => {
  it("keeps individually frozen minions when refreshing", () => {
    const rng = createRng(1);
    const pool = createPool();
    let p = makePlayer("you", "jaina", "吉安娜", true);
    p = { ...p, gold: 10, shop: rollShop(p, pool, rng) };
    assert.ok(p.shop.length >= 1);
    const frozenId = p.shop[0]!.defId;
    const frozenUid = p.shop[0]!.uid;
    p = freezeOne(p, frozenUid);
    p = refreshShop(p, pool, rng);
    assert.ok(p.shop.some((m) => m.uid === frozenUid));
    assert.equal(p.shop.find((m) => m.uid === frozenUid)?.defId, frozenId);
    assert.equal(p.shop.find((m) => m.uid === frozenUid)?.frozen, true);
  });
});

describe("triple", () => {
  it("fuses three copies into a golden with carried buffs", () => {
    const p = makePlayer("you", "jaina", "吉安娜", true);
    const a = makeInst("annoyotron");
    const b = makeInst("annoyotron");
    const c = makeInst("annoyotron");
    a.atk += 1;
    a.hp += 0;
    const res = tryTriple({ ...p, board: [a, b, c], hand: [] });
    assert.ok(res.triple);
    assert.equal(res.player.board.length, 0);
    assert.equal(res.player.hand.length, 1);
    assert.equal(res.player.hand[0]!.golden, true);
    assert.equal(res.player.hand[0]!.atk, 1 * 2 + 1);
    assert.equal(res.player.hand[0]!.hp, 2 * 2);
  });
});

describe("sell golden", () => {
  it("returns three copies to the pool", () => {
    const pool = createPool();
    const before = pool.annoyotron ?? 0;
    let p = makePlayer("you", "jaina", "吉安娜", true);
    const g = makeInst("annoyotron", true);
    p = { ...p, board: [g] };
    p = sellMinion(p, g.uid, pool);
    assert.equal(pool.annoyotron, before + 3);
    assert.equal(p.board.length, 0);
  });
});

describe("pairing", () => {
  it("does not use the human's real match as a ghost", () => {
    const rng = createRng(42);
    const ids = ["you", "ai-0", "ai-1"];
    const pairs = pairPlayers(ids, rng, "you");
    const visible = humanPair(pairs, "you");
    assert.ok(visible);
    const involved = pairs.filter((x) => x.a === "you" || x.b === "you");
    if (involved.length > 1) {
      assert.ok(!visible!.ghost, "human should watch the real match, not the ghost copy");
    }
  });
});

describe("buy alleycat", () => {
  it("buys into hand then battlecry summons on play", () => {
    const rng = createRng(7);
    let p = makePlayer("you", "jaina", "吉安娜", true);
    p = { ...p, gold: 10, shop: [makeInst("alleycat")] };
    const bought = buyMinion(p, p.shop[0]!.uid, rng);
    assert.equal(bought.player.hand.some((m) => m.defId === "alleycat"), true);
    assert.equal(bought.player.board.length, 0);
    const played = playFromHand(bought.player, bought.player.hand[0]!.uid, 0, rng);
    assert.equal(played.player.board.some((m) => m.defId === "alleycat"), true);
    assert.equal(played.player.board.some((m) => m.defId === "tabbycat"), true);
    assert.equal(played.player.hand.length, 0);
  });
});

describe("hero power and armor", () => {
  it("soaks combat damage with armor before health", () => {
    const pool = createPool();
    let p = makePlayer("you", "garrosh", "加尔鲁什", true);
    assert.equal(p.armor, 8);
    const out = applyFightDamage([p], "you", true, 5, 8, pool);
    const you = out.players[0]!;
    assert.equal(you.hp, 30);
    assert.equal(you.armor, 3);
  });

  it("valeera makes the next buy cost 2", () => {
    const rng = createRng(3);
    const pool = createPool();
    let p = makePlayer("you", "valeera", "瓦莉拉", true);
    p = { ...p, gold: 5, shop: [makeInst("annoyotron")] };
    const powered = useHeroPower(p, pool, rng);
    assert.equal(powered.ok, true);
    assert.equal(buyCost(powered.player), 2);
    const bought = buyMinion(powered.player, powered.player.shop[0]!.uid, rng);
    assert.equal(bought.player.gold, 3);
    assert.equal(buyCost(bought.player), 3);
    assert.equal(bought.player.hand.length, 1);
  });
});

describe("new minion effects", () => {
  it("tidecaller gains attack when another murloc is summoned", () => {
    const rng = createRng(11);
    const pool = createPool();
    let p = makePlayer("you", "jaina", "吉安娜", true);
    p = {
      ...p,
      gold: 10,
      board: [makeInst("tidecaller")],
      shop: [makeInst("rockpool")],
    };
    const atk = p.board[0]!.atk;
    const bought = buyMinion(p, p.shop[0]!.uid, rng);
    const played = playFromHand(bought.player, bought.player.hand[0]!.uid, 1, rng);
    const tide = played.player.board.find((m) => m.defId === "tidecaller");
    assert.ok(tide);
    assert.ok(tide!.atk >= atk + 1);
  });
});
