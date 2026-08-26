import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRng } from "./rng.ts";
import { makeInst } from "./minions.ts";
import { simulateCombat } from "./combat.ts";

describe("combat", () => {
  it("ties immediately when neither side can attack", () => {
    const rng = createRng(1);
    const egg = makeInst("mechanoegg");
    const r = simulateCombat([egg], [makeInst("mechanoegg")], 4, 4, rng);
    assert.equal(r.winner, "tie");
    assert.equal(r.damage, 0);
    assert.ok(r.events.filter((e) => e.type === "attack").length === 0);
  });

  it("does not let 0-attack minions swing", () => {
    const rng = createRng(2);
    const wall = makeInst("annoyotron");
    wall.atk = 0;
    const cat = makeInst("tabbycat");
    const r = simulateCombat([wall], [cat], 1, 1, rng);
    assert.equal(r.winner, "enemy");
    const attacks = r.events.filter((e) => e.type === "attack");
    assert.ok(attacks.length >= 1);
    const start = [...r.playerStart, ...r.enemyStart];
    for (const ev of attacks) {
      if (ev.type !== "attack") continue;
      const atk = start.find((m) => m.uid === ev.attackerUid);
      if (atk) assert.ok(atk.atk > 0, "0-attack minion attacked");
    }
  });

  it("pops divine shield instead of applying poison", () => {
    const rng = createRng(3);
    const spider = makeInst("maexxna");
    const bot = makeInst("annoyotron");
    const r = simulateCombat([spider], [bot], 5, 1, rng);
    const shieldPop = r.events.some((e) => e.type === "damage" && e.shieldPop);
    assert.equal(shieldPop, true);
  });

  it("reborns bronze warden with divine shield", () => {
    const rng = createRng(9);
    const ward = makeInst("bronzewarden");
    const hydra = makeInst("cavehydra");
    hydra.atk = 10;
    const r = simulateCombat([ward], [hydra], 3, 3, rng);
    assert.ok(r.events.some((e) => e.type === "reborn"));
    const reborns = r.events.filter((e) => e.type === "reborn");
    assert.ok(reborns.length >= 1);
  });

  it("computes damage as tavern tier plus remaining minion tiers", () => {
    const rng = createRng(4);
    const big = makeInst("malganis");
    const r = simulateCombat([big], [makeInst("tabbycat")], 6, 1, rng);
    assert.equal(r.winner, "player");
    assert.equal(r.damage, 6 + 6);
  });

  it("attacker takes counter damage even when it kills the defender", () => {
    const rng = createRng(5);
    const a = makeInst("tabbycat");
    a.atk = 3;
    a.hp = 3;
    a.maxHp = 3;
    const b = makeInst("tabbycat");
    b.atk = 2;
    b.hp = 2;
    b.maxHp = 2;
    const r = simulateCombat([a], [b], 1, 1, rng);
    assert.equal(r.winner, "player");
    assert.equal(r.playerFinal.length, 1);
    assert.equal(r.playerFinal[0]!.hp, 1);
    const hits = r.events.filter((e) => e.type === "damage" && !e.shieldPop);
    assert.equal(hits.length, 2);
  });

  it("mutual lethal is a tie", () => {
    const rng = createRng(6);
    const a = makeInst("tabbycat");
    a.atk = 5;
    a.hp = 2;
    a.maxHp = 2;
    const b = makeInst("tabbycat");
    b.atk = 5;
    b.hp = 2;
    b.maxHp = 2;
    const r = simulateCombat([a], [b], 1, 1, rng);
    assert.equal(r.winner, "tie");
    assert.equal(r.playerFinal.length, 0);
    assert.equal(r.enemyFinal.length, 0);
  });

  it("leeroy attacks at the start of combat", () => {
    const rng = createRng(8);
    const leeroy = makeInst("leeroy");
    const wall = makeInst("voidwalker");
    const r = simulateCombat([leeroy], [wall], 5, 1, rng);
    const attacks = r.events.filter((e) => e.type === "attack");
    assert.ok(attacks.length >= 1);
  });
});
