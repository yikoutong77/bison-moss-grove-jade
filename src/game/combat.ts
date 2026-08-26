import type {
  CombatCause,
  CombatEvent,
  CombatMinion,
  CombatResult,
  DamageBreakdown,
  Effect,
  Keyword,
  MinionInst,
  Side,
} from "./types";
import { BY_TIER, COLLECTIBLE, defOf, MINION_BY_ID, scaleN } from "./minions";
import type { Rng } from "./rng";
import { uid } from "./rng";
import { actorOf, buildTimeline, describeEvent } from "./timeline";

const MAX_STEPS = 240;
export const EVENT_DUR = {
  announce: 280,
  attack: 420,
  damage: 140,
  buff: 120,
  summon: 220,
  death: 220,
  reborn: 260,
  cleanup: 60,
  end: 400,
};

function hasKw(kws: Keyword[], k: Keyword): boolean {
  return kws.includes(k);
}

export function toCombatMinion(m: MinionInst, owner: Side): CombatMinion {
  const d = defOf(m.defId);
  return {
    uid: uid("c"),
    defId: m.defId,
    name: d.name,
    art: d.art,
    tribe: d.tribe,
    atk: m.atk,
    hp: m.hp,
    maxHp: m.maxHp,
    golden: m.golden,
    taunt: hasKw(m.keywords, "taunt"),
    divineShield: hasKw(m.keywords, "divineShield"),
    windfury: hasKw(m.keywords, "windfury"),
    poisonous: hasKw(m.keywords, "poisonous"),
    reborn: hasKw(m.keywords, "reborn"),
    cleave: hasKw(m.keywords, "cleave"),
    effects: d.effects.map((e) => ({ ...e })),
    owner,
    dead: false,
  };
}

function living(board: CombatMinion[]): CombatMinion[] {
  return board.filter((m) => !m.dead && m.hp > 0);
}

function makeBreakdown(tavernTier: number, leftover: CombatMinion[]): DamageBreakdown {
  return {
    tavernTier,
    leftover: leftover.map((m) => ({
      name: m.name,
      tier: Math.max(1, defOf(m.defId).tier),
      golden: m.golden,
    })),
    total: tavernTier + leftover.reduce((s, m) => s + Math.max(1, defOf(m.defId).tier), 0),
  };
}

export function simulateCombat(
  playerBoard: MinionInst[],
  enemyBoard: MinionInst[],
  playerTier: number,
  enemyTier: number,
  rng: Rng,
): CombatResult {
  const playerStart = playerBoard.map((m) => toCombatMinion(m, "player"));
  const enemyStart = enemyBoard.map((m) => toCombatMinion(m, "enemy"));
  const sim = new CombatSim(
    playerStart.map((m) => ({ ...m, effects: m.effects.map((e) => ({ ...e })) })),
    enemyStart.map((m) => ({ ...m, effects: m.effects.map((e) => ({ ...e })) })),
    rng,
  );
  sim.log({ type: "announce", at: 0, text: "战斗开始" });
  sim.startOfCombat();
  sim.startOfCombatAttacks();

  const pCount = living(sim.player).length;
  const eCount = living(sim.enemy).length;
  const firstAttacker: Side =
    pCount > eCount ? "player" : eCount > pCount ? "enemy" : rng.chance(0.5) ? "player" : "enemy";
  let attacker: Side = firstAttacker;

  sim.log({
    type: "announce",
    at: 0,
    text: firstAttacker === "player" ? "你先手攻击" : "对手先手攻击",
  });

  const nextIdx: Record<Side, number> = { player: 0, enemy: 0 };
  let steps = 0;

  while (living(sim.player).length && living(sim.enemy).length && steps < MAX_STEPS) {
    steps++;
    const board = sim.board(attacker);
    if (!sim.hasAttacker(board)) {
      const other = sim.opp(attacker);
      if (!sim.hasAttacker(sim.board(other))) break;
      attacker = other;
      continue;
    }
    const start = nextIdx[attacker];
    const atkMinion = sim.nextAttacker(board, start);
    if (!atkMinion) {
      attacker = sim.opp(attacker);
      continue;
    }
    const idxBefore = board.findIndex((m) => m.uid === atkMinion.uid);
    const attacks = atkMinion.windfury ? 2 : 1;
    for (let a = 0; a < attacks; a++) {
      if (atkMinion.dead || atkMinion.hp <= 0) break;
      if (!living(sim.board(sim.opp(attacker))).length) break;
      sim.performAttack(atkMinion);
    }
    const after = sim.board(attacker);
    const idxAfter = after.findIndex((m) => m.uid === atkMinion.uid);
    nextIdx[attacker] = idxAfter === -1 ? Math.max(0, idxBefore) : idxAfter + 1;
    attacker = sim.opp(attacker);
  }

  const pLeft = living(sim.player);
  const eLeft = living(sim.enemy);
  let winner: Side | "tie" = "tie";
  let damage = 0;
  let breakdown: CombatResult["breakdown"] = null;
  if (pLeft.length && !eLeft.length) {
    winner = "player";
    breakdown = makeBreakdown(playerTier, pLeft);
    damage = breakdown.total;
  } else if (eLeft.length && !pLeft.length) {
    winner = "enemy";
    breakdown = makeBreakdown(enemyTier, eLeft);
    damage = breakdown.total;
  }

  sim.log({
    type: "end",
    at: 0,
    winner,
    damage,
    playerLeft: pLeft.length,
    enemyLeft: eLeft.length,
  });

  const { beats, events } = buildTimeline(sim.events);

  return {
    events,
    beats,
    winner,
    damage,
    breakdown,
    firstAttacker,
    playerFinal: sim.player.filter((m) => !m.dead),
    enemyFinal: sim.enemy.filter((m) => !m.dead),
    opponentId: "",
    playerStart,
    enemyStart,
    ghost: false,
  };
}

class CombatSim {
  player: CombatMinion[];
  enemy: CombatMinion[];
  events: CombatEvent[] = [];
  time = 0;
  rng: Rng;
  summonDepth = 0;
  deathLock = 0;
  avengeLeft = new Map<string, number>();

  constructor(player: CombatMinion[], enemy: CombatMinion[], rng: Rng) {
    this.player = player;
    this.enemy = enemy;
    this.rng = rng;
  }

  log(e: CombatEvent) {
    const ev = { ...e, at: this.time } as CombatEvent;
    if (!ev.text) ev.text = describeEvent(ev);
    this.events.push(ev);
    this.time += EVENT_DUR[e.type] ?? 200;
  }

  board(side: Side): CombatMinion[] {
    return side === "player" ? this.player : this.enemy;
  }

  setBoard(side: Side, b: CombatMinion[]) {
    if (side === "player") this.player = b;
    else this.enemy = b;
  }

  opp(side: Side): Side {
    return side === "player" ? "enemy" : "player";
  }

  nextAttacker(board: CombatMinion[], start: number): CombatMinion | null {
    const n = board.length;
    if (!n) return null;
    for (let i = 0; i < n; i++) {
      const m = board[(start + i) % n];
      if (m && !m.dead && m.hp > 0 && m.atk > 0) return m;
    }
    return null;
  }

  hasAttacker(board: CombatMinion[]): boolean {
    return board.some((m) => !m.dead && m.hp > 0 && m.atk > 0);
  }

  validTargets(side: Side): CombatMinion[] {
    const foes = living(this.board(this.opp(side)));
    const taunts = foes.filter((m) => m.taunt);
    return taunts.length ? taunts : foes;
  }

  startOfCombat() {
    for (const side of ["player", "enemy"] as Side[]) {
      const board = living(this.board(side));
      for (let i = 0; i < board.length; i++) {
        const m = board[i]!;
        for (const fx of m.effects) {
          if (fx.kind === "start_combat_aura_adjacent") {
            const full = living(this.board(side));
            const idx = full.findIndex((x) => x.uid === m.uid);
            for (const n of [idx - 1, idx + 1]) {
              const t = full[n];
              if (t) this.buff(t, scaleN(fx.atk, m.golden), 0, false, "aura");
            }
          }
          if (fx.kind === "start_combat_aura_tribe") {
            for (const t of living(this.board(side))) {
              if (t.uid === m.uid) continue;
              if (t.tribe === fx.tribe) {
                this.buff(t, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden), false, "aura");
              }
            }
          }
        }
      }
    }
    for (const side of ["player", "enemy"] as Side[]) {
      for (const m of living(this.board(side))) {
        for (const fx of m.effects) {
          if (fx.kind === "start_combat_damage_random") {
            const foes = living(this.board(this.opp(side)));
            if (foes.length) {
              const t = this.rng.pick(foes);
              this.dealDamage(m, t, scaleN(fx.damage, m.golden), false, "start_combat");
            }
          }
        }
      }
      this.collectDeaths();
    }
  }

  startOfCombatAttacks() {
    for (const side of ["player", "enemy"] as Side[]) {
      for (const m of living(this.board(side))) {
        if (!m.effects.some((e) => e.kind === "start_combat_attack")) continue;
        const times = m.golden ? 2 : 1;
        for (let i = 0; i < times; i++) {
          if (m.dead || m.hp <= 0) break;
          if (!living(this.board(this.opp(side))).length) break;
          this.performAttack(m);
        }
      }
    }
  }

  performAttack(attacker: CombatMinion) {
    const targets = this.validTargets(attacker.owner);
    if (!targets.length) return;
    const target = this.rng.pick(targets);
    this.log({
      type: "attack",
      at: 0,
      attackerUid: attacker.uid,
      targetUid: target.uid,
      actor: actorOf(attacker),
      target: actorOf(target),
      cause: "strike",
    });

    const foes = living(this.board(this.opp(attacker.owner)));
    const tIdx = foes.findIndex((m) => m.uid === target.uid);
    const cleaveTargets: CombatMinion[] = [target];
    if (attacker.cleave) {
      if (tIdx > 0 && foes[tIdx - 1]) cleaveTargets.push(foes[tIdx - 1]!);
      if (tIdx < foes.length - 1 && foes[tIdx + 1]) cleaveTargets.push(foes[tIdx + 1]!);
    }

    const strikeBackAtk = target.atk;
    const strikeBackPoison = target.poisonous;
    const swingAtk = attacker.atk;
    const swingPoison = attacker.poisonous;

    for (const t of cleaveTargets) {
      const cause: CombatCause = t.uid === target.uid ? "strike" : "cleave";
      this.dealDamage(attacker, t, swingAtk, swingPoison, cause);
    }
    // Simultaneous strike: the defender still hits back even if it dies.
    if (strikeBackAtk > 0) {
      this.dealDamage(target, attacker, strikeBackAtk, strikeBackPoison, "strike");
    }

    this.triggerAfterAttack(attacker);
    this.collectDeaths();
  }

  triggerAfterAttack(attacker: CombatMinion) {
    if (attacker.tribe !== "pirate") return;
    const allies = this.board(attacker.owner);
    for (const m of allies) {
      if (m.uid !== attacker.uid && (m.dead || m.hp <= 0)) continue;
      for (const fx of m.effects) {
        if (fx.kind !== "after_attack_buff_tribe") continue;
        for (const t of living(this.board(attacker.owner))) {
          if (t.tribe === fx.tribe) {
            this.buff(t, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden), false, "after_attack");
          }
        }
      }
    }
  }

  dealDamage(
    source: CombatMinion,
    target: CombatMinion,
    amount: number,
    poisonous: boolean,
    cause: CombatCause,
  ) {
    if (amount <= 0 || target.dead) return;
    if (target.divineShield) {
      target.divineShield = false;
      this.log({
        type: "damage",
        at: 0,
        uid: target.uid,
        amount: 0,
        shieldPop: true,
        hpAfter: target.hp,
        actor: actorOf(source),
        target: actorOf(target),
        cause,
      });
      return;
    }
    target.hp -= amount;
    if (poisonous) target.hp = 0;
    const overkill = target.hp < 0;
    const loggedCause: CombatCause = poisonous ? "poison" : cause;
    this.log({
      type: "damage",
      at: 0,
      uid: target.uid,
      amount,
      shieldPop: false,
      hpAfter: Math.max(0, target.hp),
      actor: actorOf(source),
      target: actorOf(target),
      cause: loggedCause,
    });
    if (overkill && !poisonous) {
      for (const fx of source.effects) {
        if (fx.kind === "overkill_buff_self") {
          this.buff(source, scaleN(fx.atk, source.golden), scaleN(fx.hp, source.golden), false, "overkill");
        }
      }
    }

    for (const fx of target.effects) {
      if (fx.kind === "on_damaged_summon_random_demon") {
        const demons = COLLECTIBLE.filter((d) => d.tribe === "demon" && d.tier <= 5);
        if (!demons.length) continue;
        const pick = this.rng.pick(demons);
        this.summonToken(target.owner, pick.id, false, this.insertIndex(target), false);
      }
    }
  }

  buff(t: CombatMinion, atk: number, hp: number, divineShield = false, cause: CombatCause = "aura") {
    t.atk += atk;
    t.hp += hp;
    t.maxHp += hp;
    if (divineShield) t.divineShield = true;
    this.log({
      type: "buff",
      at: 0,
      uid: t.uid,
      atk,
      hp,
      divineShield: divineShield || undefined,
      actor: actorOf(t),
      cause,
    });
  }

  insertIndex(deadOrRef: CombatMinion): number {
    const board = this.board(deadOrRef.owner);
    const i = board.findIndex((m) => m.uid === deadOrRef.uid);
    return i === -1 ? board.length : i + 1;
  }

  baronCount(side: Side): number {
    let n = 0;
    for (const m of living(this.board(side))) {
      if (m.effects.some((e) => e.kind === "baron")) n += m.golden ? 2 : 1;
    }
    return n;
  }

  collectDeaths() {
    if (this.deathLock > 12) return;
    const dying: CombatMinion[] = [];
    for (const side of ["player", "enemy"] as Side[]) {
      for (const m of this.board(side)) {
        if (!m.dead && m.hp <= 0) dying.push(m);
      }
    }
    if (!dying.length) return;

    const baronSnap: Record<Side, number> = {
      player: this.baronCount("player"),
      enemy: this.baronCount("enemy"),
    };

    this.deathLock++;
    for (const m of dying) {
      if (m.dead) continue;
      m.dead = true;
      this.log({ type: "death", at: 0, uid: m.uid, actor: actorOf(m) });
      const times = 1 + baronSnap[m.owner];
      for (let i = 0; i < times; i++) this.runDeathrattles(m);
      if (m.reborn) {
        m.dead = false;
        m.hp = 1;
        m.maxHp = Math.max(1, m.maxHp);
        m.reborn = false;
        m.divineShield = hasKw(defOf(m.defId).keywords, "divineShield");
        this.log({ type: "reborn", at: 0, uid: m.uid, hp: 1, actor: actorOf(m), cause: "reborn" });
      }
    }
    for (const m of dying) this.triggerAvenge(m);
    for (const side of ["player", "enemy"] as Side[]) {
      this.setBoard(
        side,
        this.board(side).filter((m) => !m.dead),
      );
    }
    this.log({ type: "cleanup", at: 0 });
    this.deathLock--;
    if (
      this.board("player").some((m) => !m.dead && m.hp <= 0) ||
      this.board("enemy").some((m) => !m.dead && m.hp <= 0)
    ) {
      this.collectDeaths();
    }
  }

  triggerAvenge(dead: CombatMinion) {
    for (const m of living(this.board(dead.owner))) {
      if (m.uid === dead.uid) continue;
      for (const fx of m.effects) {
        if (fx.kind !== "avenge_buff_self") continue;
        const need = fx.count;
        const left = (this.avengeLeft.get(m.uid) ?? need) - 1;
        if (left <= 0) {
          this.buff(m, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden), false, "avenge");
          this.avengeLeft.set(m.uid, need);
        } else {
          this.avengeLeft.set(m.uid, left);
        }
      }
    }
  }

  runDeathrattles(m: CombatMinion) {
    const side = m.owner;
    const insertAt = this.insertIndex(m);
    for (const fx of m.effects) {
      switch (fx.kind) {
        case "deathrattle_summon": {
          const count = scaleN(fx.count, m.golden);
          for (let i = 0; i < count; i++) {
            this.summonToken(side, fx.tokenId, m.golden, insertAt + i, true);
          }
          break;
        }
        case "deathrattle_summon_attack": {
          const summoned = this.summonToken(side, fx.tokenId, m.golden, insertAt, true);
          if (summoned) this.performAttack(summoned);
          break;
        }
        case "deathrattle_buff_all": {
          for (const t of living(this.board(side))) {
            if (fx.tribe && t.tribe !== fx.tribe) continue;
            this.buff(t, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden), false, "deathrattle");
          }
          break;
        }
        case "deathrattle_damage_random": {
          const foes = living(this.board(this.opp(side)));
          if (foes.length) {
            this.dealDamage(m, this.rng.pick(foes), scaleN(fx.damage, m.golden), false, "deathrattle");
          }
          break;
        }
        case "deathrattle_damage_all": {
          const all = [...living(this.player), ...living(this.enemy)];
          for (const t of all) {
            this.dealDamage(m, t, scaleN(fx.damage, m.golden), false, "deathrattle");
          }
          break;
        }
        case "deathrattle_divine_shield_tribe": {
          for (const t of living(this.board(side))) {
            if (t.tribe === fx.tribe) this.buff(t, 0, 0, true, "deathrattle");
          }
          break;
        }
        case "deathrattle_summon_random_high": {
          const pool = COLLECTIBLE.filter((d) => d.tier >= 4);
          const pick = this.rng.pick(pool);
          this.summonToken(side, pick.id, false, insertAt, true);
          break;
        }
        case "deathrattle_give_shield": {
          const allies = living(this.board(side)).filter((t) => t.uid !== m.uid);
          if (allies.length) {
            const t = this.rng.pick(allies);
            this.buff(t, 0, 0, true, "deathrattle");
          }
          break;
        }
        default:
          break;
      }
    }
    this.collectDeaths();
  }

  summonToken(
    side: Side,
    defId: string,
    golden: boolean,
    index: number,
    triggerSummon: boolean,
  ): CombatMinion | null {
    const board = this.board(side);
    if (living(board).length >= 7) return null;
    const d = MINION_BY_ID[defId];
    if (!d) return null;
    const instLike: MinionInst = {
      uid: uid("c"),
      defId,
      atk: golden ? d.atk * 2 : d.atk,
      hp: golden ? d.hp * 2 : d.hp,
      maxHp: golden ? d.hp * 2 : d.hp,
      golden,
      keywords: [...d.keywords],
    };
    const cm = toCombatMinion(instLike, side);
    const insert = Math.max(0, Math.min(index, board.length));
    board.splice(insert, 0, cm);
    this.log({
      type: "summon",
      at: 0,
      owner: side,
      minion: { ...cm },
      index: insert,
      actor: actorOf(cm),
      cause: "summon",
    });

    if (triggerSummon && this.summonDepth < 4) {
      this.summonDepth++;
      this.onSummoned(cm);
      this.summonDepth--;
    }
    return cm;
  }

  onSummoned(newbie: CombatMinion) {
    const board = living(this.board(newbie.owner));
    for (const m of board) {
      if (m.uid === newbie.uid) continue;
      for (const fx of m.effects) {
        if (fx.kind === "on_summon_buff" && newbie.tribe === fx.tribe) {
          this.buff(newbie, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden), false, "summon");
        }
        if (fx.kind === "on_summon_self_buff" && newbie.tribe === fx.tribe) {
          this.buff(m, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden), false, "summon");
        }
        if (fx.kind === "on_friendly_summon_token" && newbie.defId !== fx.tokenId) {
          this.summonToken(
            newbie.owner,
            fx.tokenId,
            m.golden,
            this.insertIndex(newbie),
            false,
          );
        }
        if (fx.kind === "start_combat_aura_tribe" && newbie.tribe === fx.tribe) {
          this.buff(newbie, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden), false, "aura");
        }
        if (fx.kind === "start_combat_aura_adjacent") {
          const full = living(this.board(newbie.owner));
          const ni = full.findIndex((x) => x.uid === newbie.uid);
          const mi = full.findIndex((x) => x.uid === m.uid);
          if (ni >= 0 && mi >= 0 && Math.abs(ni - mi) === 1) {
            this.buff(newbie, scaleN(fx.atk, m.golden), 0, false, "aura");
          }
        }
      }
    }
  }
}

export function applyBattlecry(
  board: MinionInst[],
  played: MinionInst,
  playIndex: number,
  rng: Rng,
  extraTimes: number,
): MinionInst[] {
  const d = defOf(played.defId);
  const times = 1 + extraTimes;
  let next = board;
  for (let t = 0; t < times; t++) {
    for (const fx of d.effects) {
      next = runBattlecry(next, played, playIndex, fx, rng);
    }
  }
  return next;
}

function runBattlecry(
  board: MinionInst[],
  played: MinionInst,
  playIndex: number,
  fx: Effect,
  rng: Rng,
): MinionInst[] {
  const g = played.golden;
  switch (fx.kind) {
    case "battlecry_summon": {
      if (board.length >= 7) return board;
      const token = makeBoardToken(fx.tokenId, g);
      const copy = board.slice();
      copy.splice(Math.min(playIndex + 1, copy.length), 0, token);
      return applyOnSummonBuffs(copy, token).slice(0, 7);
    }
    case "battlecry_buff_tribe": {
      const cands = board.filter(
        (m) => m.uid !== played.uid && defOf(m.defId).tribe === fx.tribe,
      );
      if (!cands.length) {
        if (defOf(played.defId).tribe === fx.tribe) {
          return board.map((m) =>
            m.uid === played.uid ? buffInst(m, scaleN(fx.atk, g), scaleN(fx.hp, g)) : m,
          );
        }
        return board;
      }
      const t = rng.pick(cands);
      return board.map((m) =>
        m.uid === t.uid ? buffInst(m, scaleN(fx.atk, g), scaleN(fx.hp, g)) : m,
      );
    }
    case "battlecry_buff_others": {
      return board.map((m) => {
        if (m.uid === played.uid) return m;
        if (fx.tribe && defOf(m.defId).tribe !== fx.tribe) return m;
        return buffInst(m, scaleN(fx.atk, g), scaleN(fx.hp, g));
      });
    }
    case "battlecry_buff_adjacent": {
      return board.map((m, i) => {
        if (Math.abs(i - playIndex) === 1) {
          let n = buffInst(m, scaleN(fx.atk, g), scaleN(fx.hp, g));
          if (fx.taunt && !n.keywords.includes("taunt")) {
            n = { ...n, keywords: [...n.keywords, "taunt"] };
          }
          return n;
        }
        return m;
      });
    }
    case "battlecry_adapt_beasts": {
      return board.map((m) => {
        if (defOf(m.defId).tribe !== "beast") return m;
        let n = buffInst(m, scaleN(fx.atk, g), scaleN(fx.hp, g));
        if (!n.keywords.includes("divineShield")) {
          n = { ...n, keywords: [...n.keywords, "divineShield"] };
        }
        return n;
      });
    }
    case "battlecry_buff_self_per_tribe": {
      const n = board.filter(
        (m) => m.uid !== played.uid && defOf(m.defId).tribe === fx.tribe,
      ).length;
      if (!n) return board;
      return board.map((m) =>
        m.uid === played.uid ? buffInst(m, scaleN(fx.atk, g) * n, scaleN(fx.hp, g) * n) : m,
      );
    }
    case "battlecry_give_poison": {
      const cands = board.filter(
        (m) => !fx.tribe || defOf(m.defId).tribe === fx.tribe,
      );
      if (!cands.length) return board;
      const t = rng.pick(cands);
      return board.map((m) =>
        m.uid === t.uid && !m.keywords.includes("poisonous")
          ? { ...m, keywords: [...m.keywords, "poisonous" as const] }
          : m,
      );
    }
    case "battlecry_buff_random": {
      const others = board.filter((m) => m.uid !== played.uid);
      const pool = others.length ? others : [played];
      const t = rng.pick(pool);
      return board.map((m) => {
        if (m.uid !== t.uid) return m;
        let n = buffInst(m, scaleN(fx.atk, g), scaleN(fx.hp, g));
        if (fx.taunt && !n.keywords.includes("taunt")) {
          n = { ...n, keywords: [...n.keywords, "taunt"] };
        }
        return n;
      });
    }
    default:
      return board;
  }
}

function makeBoardToken(defId: string, golden: boolean): MinionInst {
  const d = defOf(defId);
  const atk = golden ? d.atk * 2 : d.atk;
  const hp = golden ? d.hp * 2 : d.hp;
  return {
    uid: uid("m"),
    defId,
    atk,
    hp,
    maxHp: hp,
    golden,
    keywords: [...d.keywords],
  };
}

function buffInst(m: MinionInst, atk: number, hp: number): MinionInst {
  return { ...m, atk: m.atk + atk, hp: m.hp + hp, maxHp: m.maxHp + hp };
}

export function applyOnSummonBuffs(board: MinionInst[], newbie: MinionInst): MinionInst[] {
  let extraAtk = 0;
  let extraHp = 0;
  const dNew = defOf(newbie.defId);
  for (const m of board) {
    if (m.uid === newbie.uid) continue;
    const d = defOf(m.defId);
    for (const fx of d.effects) {
      if (fx.kind === "on_summon_buff" && dNew.tribe === fx.tribe) {
        extraAtk += scaleN(fx.atk, m.golden);
        extraHp += scaleN(fx.hp, m.golden);
      }
    }
  }
  let next = extraAtk || extraHp
    ? board.map((m) => (m.uid === newbie.uid ? buffInst(m, extraAtk, extraHp) : m))
    : board;
  return next.map((m) => {
    if (m.uid === newbie.uid) return m;
    const d = defOf(m.defId);
    let n = m;
    for (const fx of d.effects) {
      if (fx.kind === "on_summon_self_buff" && dNew.tribe === fx.tribe) {
        n = buffInst(n, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden));
      }
    }
    return n;
  });
}

function hasDeathrattle(defId: string): boolean {
  return defOf(defId).effects.some((e) => e.kind.startsWith("deathrattle"));
}

export function applyOnPlay(board: MinionInst[], played: MinionInst): MinionInst[] {
  const playedTribe = defOf(played.defId).tribe;
  const playedDR = hasDeathrattle(played.defId);
  return board.map((m) => {
    if (m.uid === played.uid) return m;
    const d = defOf(m.defId);
    let n = m;
    for (const fx of d.effects) {
      if (fx.kind === "on_play_tribe" && playedTribe === fx.tribe) {
        n = buffInst(n, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden));
      }
      if (fx.kind === "on_play_deathrattle" && playedDR) {
        n = buffInst(n, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden));
      }
    }
    return n;
  });
}

export function applyEndOfTurn(board: MinionInst[], rng: Rng): MinionInst[] {
  let next = board.map((m) => ({ ...m, keywords: [...m.keywords] }));
  for (const m of board) {
    const d = defOf(m.defId);
    for (const fx of d.effects) {
      if (fx.kind === "end_turn_buff_self") {
        next = next.map((x) =>
          x.uid === m.uid ? buffInst(x, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden)) : x,
        );
      }
      if (fx.kind === "end_turn_buff_random") {
        const others = next.filter((x) => x.uid !== m.uid);
        const t = others.length ? rng.pick(others) : next.find((x) => x.uid === m.uid);
        if (t) {
          next = next.map((x) =>
            x.uid === t.uid ? buffInst(x, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden)) : x,
          );
        }
      }
      if (fx.kind === "end_turn_buff_each_tribe") {
        const tribes = new Set(
          next.map((x) => defOf(x.defId).tribe).filter((t) => t !== "neutral"),
        );
        for (const tribe of tribes) {
          const cands = next.filter((x) => defOf(x.defId).tribe === tribe);
          if (!cands.length) continue;
          const t = rng.pick(cands);
          next = next.map((x) =>
            x.uid === t.uid ? buffInst(x, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden)) : x,
          );
        }
      }
      if (fx.kind === "end_turn_buff_rightmost") {
        const last = next[next.length - 1];
        if (last) {
          next = next.map((x) =>
            x.uid === last.uid ? buffInst(x, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden)) : x,
          );
        }
      }
      if (fx.kind === "end_turn_summon") {
        const times = m.golden ? 2 : 1;
        for (let i = 0; i < times; i++) {
          if (next.length >= 7) break;
          const token = makeBoardToken(fx.tokenId, false);
          next = applyOnSummonBuffs([...next, token], token).slice(0, 7);
        }
      }
    }
  }
  return next;
}

export function brannExtra(board: MinionInst[]): number {
  let n = 0;
  for (const m of board) {
    if (defOf(m.defId).effects.some((e) => e.kind === "brann")) n += m.golden ? 2 : 1;
  }
  return n;
}

export function discoverPool(tier: number): MinionInst[] {
  const t = Math.min(6, Math.max(1, tier));
  return (BY_TIER[t] ?? []).map((d) => ({
    uid: uid("d"),
    defId: d.id,
    atk: d.atk,
    hp: d.hp,
    maxHp: d.hp,
    golden: false,
    keywords: [...d.keywords],
  }));
}
