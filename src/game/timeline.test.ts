import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRng } from "./rng.ts";
import { makeInst } from "./minions.ts";
import { simulateCombat } from "./combat.ts";
import { buildTimeline, describeEvent } from "./timeline.ts";
import { replayTo } from "./playback.ts";

describe("timeline", () => {
  it("groups a simple kill into start / attack / end beats", () => {
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
    assert.ok(r.beats.length >= 3);
    assert.equal(r.beats[0]?.kind, "soc");
    assert.ok(r.beats.some((b) => b.kind === "attack"));
    assert.equal(r.beats[r.beats.length - 1]?.kind, "end");
    const attack = r.beats.find((b) => b.kind === "attack");
    assert.ok(attack);
    assert.match(attack.title, /进攻/);
    const dmg = attack.events.filter((e) => e.type === "damage" && !e.shieldPop);
    assert.equal(dmg.length, 2);
  });

  it("stamps chinese text on attack and counter damage", () => {
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
    const attack = r.events.find((e) => e.type === "attack");
    assert.ok(attack);
    assert.ok(attack.text && attack.text.includes("攻击"));
    assert.ok(attack.actor?.name);
    assert.ok(attack.target?.name);
    const hits = r.events.filter((e) => e.type === "damage" && !e.shieldPop);
    assert.equal(hits.length, 2);
    for (const h of hits) {
      assert.ok(h.text);
      assert.ok(h.actor && h.target);
    }
  });

  it("replayTo after the attack beat leaves the winner at 1 hp", () => {
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
    const attackBeat = r.beats.find((b) => b.kind === "attack")!;
    const last = r.events.reduce((idx, e, i) => (e.beat === attackBeat.id ? i : idx), -1);
    const mid = replayTo(r.playerStart, r.enemyStart, r.events, last);
    assert.equal(mid.player.length, 1);
    assert.equal(mid.player[0]!.hp, 1);
    const fin = replayTo(r.playerStart, r.enemyStart, r.events, r.events.length - 1);
    assert.equal(fin.player.length, 1);
    assert.equal(fin.enemy.length, 0);
    assert.match(fin.banner, /胜利/);
  });

  it("buildTimeline keeps announce and end as their own beats", () => {
    const rng = createRng(1);
    const egg = makeInst("mechanoegg");
    const r = simulateCombat([egg], [makeInst("mechanoegg")], 4, 4, rng);
    const kinds = r.beats.map((b) => b.kind);
    assert.ok(kinds.includes("soc"));
    assert.ok(kinds.includes("end"));
    assert.ok(!kinds.includes("attack"));
    assert.equal(r.winner, "tie");
  });

  it("describeEvent falls back for a bare death", () => {
    const text = describeEvent({
      type: "death",
      at: 0,
      uid: "x",
      actor: { uid: "x", name: "机械蛋", side: "player", golden: false, art: "" },
    });
    assert.equal(text, "机械蛋 死亡");
  });

  it("rebuilds the same beats from raw events", () => {
    const rng = createRng(8);
    const leeroy = makeInst("leeroy");
    const wall = makeInst("voidwalker");
    const r = simulateCombat([leeroy], [wall], 5, 1, rng);
    const rebuilt = buildTimeline(r.events.map((e) => ({ ...e, beat: undefined })));
    assert.equal(rebuilt.beats.length, r.beats.length);
    assert.equal(rebuilt.beats.map((b) => b.kind).join(), r.beats.map((b) => b.kind).join());
  });
});
