import type { CombatEvent, CombatMinion } from "./types";

export type HitKind = "normal" | "shield" | "poison" | "kill";

export interface FloatNum {
  id: string;
  uid: string;
  text: string;
  kind: HitKind;
}

export interface PlaybackState {
  player: CombatMinion[];
  enemy: CombatMinion[];
  banner: string;
  floats: FloatNum[];
  attacking: string | null;
  hit: string | null;
  hitKind: HitKind | null;
  hitAmount: number;
  strikeId: number;
  log: string[];
  sfx: "hit" | "death" | null;
}

export function cloneBoard(b: CombatMinion[]): CombatMinion[] {
  return b.map((m) => ({ ...m, effects: m.effects.map((e) => ({ ...e })) }));
}

export function initialPlayback(player: CombatMinion[], enemy: CombatMinion[]): PlaybackState {
  return {
    player: cloneBoard(player),
    enemy: cloneBoard(enemy),
    banner: "战斗开始",
    floats: [],
    attacking: null,
    hit: null,
    hitKind: null,
    hitAmount: 0,
    strikeId: 0,
    log: [],
    sfx: null,
  };
}

function pushLog(log: string[], line: string): string[] {
  if (!line) return log;
  return [...log.slice(-24), line];
}

function patchUid(
  board: CombatMinion[],
  uid: string,
  fn: (m: CombatMinion) => CombatMinion | null,
): CombatMinion[] {
  const next: CombatMinion[] = [];
  for (const m of board) {
    if (m.uid !== uid) next.push(m);
    else {
      const n = fn(m);
      if (n) next.push(n);
    }
  }
  return next;
}

function applyPatch(state: PlaybackState, uid: string, fn: (m: CombatMinion) => CombatMinion | null): PlaybackState {
  return {
    ...state,
    player: patchUid(state.player, uid, fn),
    enemy: patchUid(state.enemy, uid, fn),
  };
}

export function applyEvent(state: PlaybackState, ev: CombatEvent): PlaybackState {
  let next: PlaybackState = { ...state, sfx: null };
  const line = ev.text ?? "";
  switch (ev.type) {
    case "announce":
      next = { ...next, banner: ev.text, log: pushLog(next.log, ev.text) };
      break;
    case "attack":
      next = applyPatch(next, ev.attackerUid, (m) => ({
        ...m,
        attacksMade: (m.attacksMade ?? 0) + 1,
      }));
      next = {
        ...next,
        attacking: ev.attackerUid,
        hit: ev.targetUid,
        hitKind: null,
        hitAmount: 0,
        strikeId: state.strikeId + 1,
        sfx: "hit",
        log: pushLog(next.log, line),
      };
      break;
    case "damage": {
      const kind: HitKind = ev.shieldPop
        ? "shield"
        : ev.cause === "poison"
          ? "poison"
          : ev.hpAfter <= 0
            ? "kill"
            : "normal";
      next = applyPatch(next, ev.uid, (m) => ({
        ...m,
        hp: ev.hpAfter,
        divineShield: ev.shieldPop ? false : m.divineShield,
      }));
      next = {
        ...next,
        hit: ev.amount > 0 || ev.shieldPop ? ev.uid : next.hit,
        hitKind: kind,
        hitAmount: ev.amount,
        floats: [
          ...next.floats.slice(-8),
          {
            id: `${ev.uid}-${ev.at}-${next.floats.length}`,
            uid: ev.uid,
            text: ev.shieldPop ? "圣盾" : `-${ev.amount}`,
            kind,
          },
        ],
        log: pushLog(next.log, line),
      };
      break;
    }
    case "buff":
      next = applyPatch(next, ev.uid, (m) => ({
        ...m,
        atk: m.atk + ev.atk,
        hp: m.hp + ev.hp,
        maxHp: m.maxHp + ev.hp,
        divineShield: ev.divineShield ? true : m.divineShield,
      }));
      next = { ...next, log: pushLog(next.log, line) };
      break;
    case "summon": {
      const board = ev.owner === "player" ? next.player.slice() : next.enemy.slice();
      board.splice(Math.min(ev.index, board.length), 0, { ...ev.minion, effects: ev.minion.effects.map((e) => ({ ...e })) });
      next =
        ev.owner === "player"
          ? { ...next, player: board, log: pushLog(next.log, line) }
          : { ...next, enemy: board, log: pushLog(next.log, line) };
      break;
    }
    case "death":
      next = applyPatch(next, ev.uid, (m) => ({ ...m, dead: true, hp: 0 }));
      next = { ...next, sfx: "death", log: pushLog(next.log, line) };
      break;
    case "reborn":
      next = applyPatch(next, ev.uid, (m) => ({
        ...m,
        hp: ev.hp,
        maxHp: Math.max(ev.hp, m.maxHp),
        reborn: false,
        dead: false,
      }));
      next = { ...next, log: pushLog(next.log, line) };
      break;
    case "cleanup":
      next = {
        ...next,
        player: next.player.filter((m) => !m.dead && m.hp > 0),
        enemy: next.enemy.filter((m) => !m.dead && m.hp > 0),
      };
      break;
    case "end":
      next = {
        ...next,
        attacking: null,
        hit: null,
        hitKind: null,
        banner: line || next.banner,
        log: pushLog(next.log, line),
      };
      break;
  }
  return next;
}

export function stepPlayback(
  state: PlaybackState,
  events: CombatEvent[],
  index: number,
): { state: PlaybackState; nextIndex: number } {
  const ev = events[index];
  if (!ev) return { state, nextIndex: index };
  return { state: applyEvent(state, ev), nextIndex: index + 1 };
}

export function replayTo(
  playerStart: CombatMinion[],
  enemyStart: CombatMinion[],
  events: CombatEvent[],
  uptoInclusive: number,
): PlaybackState {
  let state = initialPlayback(playerStart, enemyStart);
  const last = Math.min(uptoInclusive, events.length - 1);
  for (let i = 0; i <= last; i++) {
    const ev = events[i];
    if (!ev) break;
    state = applyEvent(state, ev);
  }
  return { ...state, sfx: null };
}
