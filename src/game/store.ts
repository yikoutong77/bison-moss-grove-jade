import { create } from "zustand";
import type { CombatEvent, CombatMinion, CombatResult, FightRecord, HeroDef, MinionInst, Phase, PlayerState } from "./types";
import { simulateCombat } from "./combat";
import { aiPlayTurn } from "./ai";
import {
  addDiscovered,
  buyMinion,
  playFromHand,
  buyCost,
  createPool,
  finishTurnBoards,
  freezeOne,
  freezeShop,
  humanPair,
  initLobby,
  makePlayer,
  moveMinion,
  pairPlayers,
  pickDiscoverOptions,
  refreshShop,
  sellMinion,
  startTurn,
  upgradeTavern,
  upgradeCostNow,
  applyFightDamage,
  recordOutcome,
  useHeroPower,
  type Pool,
} from "./engine";
import { createRng, shuffle, uid, type Rng } from "./rng";
import { HEROES, HERO_BY_ID } from "./heroes";
import { sfx, unlockAudio, setMuted as setAudioMuted } from "./audio";
import { connect, disconnect, send } from "@/net/client";
import type { ClientMsg, SeatView, ServerMsg, Snapshot } from "@/net/protocol";

export type CombatSpeed = 1 | 2 | 4;
export type PlayMode = "solo" | "online";

interface GameState {
  phase: Phase;
  turn: number;
  players: PlayerState[];
  youId: string;
  selectedShop: string | null;
  selectedBoard: string | null;
  selectedHand: string | null;
  combat: CombatResult | null;
  combatCursor: number;
  combatEvents: CombatEvent[];
  discover: MinionInst[];
  toast: string | null;
  muted: boolean;
  speed: CombatSpeed;
  nextPlace: number;
  lastOpponent: string | null;
  help: boolean;
  seed: number;
  inspect: MinionInst | null;
  scoutId: string | null;
  heroChoices: HeroDef[];
  history: FightRecord[];
  replay: FightRecord | null;
  mode: PlayMode;
  roomCode: string;
  hostId: string;
  seats: SeatView[];
  endedTurn: boolean;
  tavernEndsAt: number | null;
}

interface GameActions {
  startSelect: () => void;
  pickHero: (heroId: string) => void;
  buy: (uid: string) => void;
  buyToBoard: (uid: string, index: number) => void;
  playHand: (uid: string, index: number) => void;
  sell: (uid: string) => void;
  refresh: () => void;
  freezeAll: () => void;
  freezeSlot: (uid: string) => void;
  upgrade: () => void;
  move: (uid: string, index: number) => void;
  selectShop: (uid: string | null) => void;
  selectBoard: (uid: string | null) => void;
  selectHand: (uid: string | null) => void;
  endTurn: () => void;
  startFight: () => void;
  skipCombat: () => void;
  skipDiscover: () => void;
  continueFromResult: () => void;
  pickDiscover: (defId: string) => void;
  setMuted: (v: boolean) => void;
  setSpeed: (s: CombatSpeed) => void;
  setHelp: (v: boolean) => void;
  setToast: (t: string | null) => void;
  setCombatCursor: (n: number) => void;
  inspectMinion: (m: MinionInst | CombatMinion | null) => void;
  openScout: (id: string | null) => void;
  openReplay: (record: FightRecord | null) => void;
  usePower: () => void;
  you: () => PlayerState | undefined;
  createRoom: (name: string) => Promise<void>;
  joinRoom: (code: string, name: string) => Promise<void>;
  leaveRoom: () => void;
  setLobbyReady: () => void;
  startRoom: () => void;
  applyNet: (msg: ServerMsg) => void;
}

function publicToPlayer(pub: Snapshot["players"][number], you: PlayerState | null, youId: string): PlayerState {
  if (pub.id === youId && you) return you;
  const base = makePlayer(pub.id, pub.heroId || "jaina", pub.name, pub.isHuman);
  return {
    ...base,
    hp: pub.hp,
    armor: pub.armor,
    tavernTier: pub.tavernTier,
    alive: pub.alive,
    placement: pub.placement,
    streak: pub.streak,
    triples: pub.triples,
    wins: pub.wins,
    losses: pub.losses,
    board: pub.board,
    hand: [],
    shop: [],
    gold: 0,
  };
}

let rng: Rng = createRng(Date.now());
let pool: Pool = createPool();

function withYou(players: PlayerState[], youId: string, fn: (p: PlayerState) => PlayerState): PlayerState[] {
  return players.map((p) => (p.id === youId ? fn(p) : p));
}

function asInspect(m: MinionInst | CombatMinion): MinionInst {
  if ("owner" in m) {
    const keywords: MinionInst["keywords"] = [];
    if (m.taunt) keywords.push("taunt");
    if (m.divineShield) keywords.push("divineShield");
    if (m.poisonous) keywords.push("poisonous");
    if (m.reborn) keywords.push("reborn");
    if (m.cleave) keywords.push("cleave");
    if (m.windfury) keywords.push("windfury");
    return {
      uid: m.uid,
      defId: m.defId,
      atk: m.atk,
      hp: m.hp,
      maxHp: m.maxHp,
      golden: m.golden,
      keywords,
    };
  }
  return m;
}

export const useGame = create<GameState & GameActions>((set, get) => {
  const online = (msg: ClientMsg) => {
    if (get().mode !== "online") return false;
    if (!send(msg)) set({ toast: "联机已断开，请重新进房" });
    return true;
  };

  return {
  phase: "menu",
  turn: 1,
  players: [],
  youId: "you",
  selectedShop: null,
  selectedBoard: null,
  selectedHand: null,
  combat: null,
  combatCursor: 0,
  combatEvents: [],
  discover: [],
  toast: null,
  muted: false,
  speed: 1,
  nextPlace: 8,
  lastOpponent: null,
  help: false,
  seed: 0,
  inspect: null,
  scoutId: null,
  heroChoices: [],
  history: [],
  replay: null,
  mode: "solo",
  roomCode: "",
  hostId: "",
  seats: [],
  endedTurn: false,
  tavernEndsAt: null,

  you: () => get().players.find((p) => p.id === get().youId),

  startSelect: () => {
    unlockAudio();
    sfx.click();
    disconnect();
    const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    rng = createRng(seed);
    const heroChoices = shuffle(HEROES, rng).slice(0, 4);
    set({ phase: "hero-select", heroChoices, seed, mode: "solo", roomCode: "", seats: [] });
  },

  pickHero: (heroId) => {
    if (online({ t: "pickHero", heroId })) {
      sfx.buy();
      return;
    }
    unlockAudio();
    sfx.buy();
    const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    rng = createRng(seed);
    pool = createPool();
    const players = initLobby(heroId, rng);
    const turn = 1;
    const rolled = players.map((p) => startTurn(p, turn, pool, rng));
    const afterAi = rolled.map((p) => (p.isHuman ? p : aiPlayTurn(p, pool, rng)));
    set({
      phase: "tavern",
      turn,
      players: afterAi,
      youId: "you",
      selectedShop: null,
      selectedBoard: null,
      combat: null,
      discover: [],
      nextPlace: 8,
      lastOpponent: null,
      seed,
      toast: `${HERO_BY_ID[heroId]?.name ?? "英雄"} 进入酒馆`,
      history: [],
      inspect: null,
      scoutId: null,
      replay: null,
    });
  },

  selectShop: (uid) => set({ selectedShop: uid, selectedBoard: null, selectedHand: null }),
  selectBoard: (uid) => set({ selectedBoard: uid, selectedShop: null, selectedHand: null }),
  selectHand: (uid) => set({ selectedHand: uid, selectedShop: null, selectedBoard: null }),
  setToast: (t) => set({ toast: t }),
  setHelp: (v) => set({ help: v }),
  setSpeed: (s) => set({ speed: s }),
  setCombatCursor: (n) => set({ combatCursor: n }),
  setMuted: (v) => {
    set({ muted: v });
    setAudioMuted(v);
  },

  buy: (uid) => {
    if (online({ t: "buy", uid })) return;
    const { players, youId, phase } = get();
    if (phase !== "tavern") return;
    const you = players.find((p) => p.id === youId);
    if (!you) return;
    const res = buyMinion(you, uid, rng);
    if (res.player === you) {
      if (you.gold < buyCost(you)) set({ toast: "金币不足" });
      else if (you.hand.length >= 10) set({ toast: "手牌已满，先上场或卖掉" });
      return;
    }
    sfx.buy();
    if (res.triple) {
      sfx.triple();
      const opts = pickDiscoverOptions(res.triple.sourceTier, rng);
      set({
        players: withYou(players, youId, () => res.player),
        selectedShop: null,
        phase: "discover",
        discover: opts,
        toast: `${res.triple.golden.golden ? "金色合成！" : "三连！"}`,
      });
      return;
    }
    set({
      players: withYou(players, youId, () => res.player),
      selectedShop: null,
    });
  },

  buyToBoard: (uid, index) => {
    if (online({ t: "buyToBoard", uid, index })) return;
    const { players, youId, phase } = get();
    if (phase !== "tavern") return;
    const you = players.find((p) => p.id === youId);
    if (!you) return;
    const bought = buyMinion(you, uid, rng);
    if (bought.player === you) {
      if (you.gold < buyCost(you)) set({ toast: "金币不足" });
      else if (you.hand.length >= 10) set({ toast: "手牌已满，先上场或卖掉" });
      return;
    }
    sfx.buy();
    if (bought.triple) {
      sfx.triple();
      const opts = pickDiscoverOptions(bought.triple.sourceTier, rng);
      set({
        players: withYou(players, youId, () => bought.player),
        selectedShop: null,
        phase: "discover",
        discover: opts,
        toast: "三连！",
      });
      return;
    }
    if (!bought.player.hand.some((m) => m.uid === uid) || bought.player.board.length >= 7) {
      set({
        players: withYou(players, youId, () => bought.player),
        selectedShop: null,
        toast: bought.player.board.length >= 7 ? "已买到手牌，战场已满" : null,
      });
      return;
    }
    const played = playFromHand(bought.player, uid, index, rng);
    if (played.triple) {
      sfx.triple();
      const opts = pickDiscoverOptions(played.triple.sourceTier, rng);
      set({
        players: withYou(players, youId, () => played.player),
        selectedShop: null,
        selectedHand: null,
        phase: "discover",
        discover: opts,
        toast: "金色合成！",
      });
      return;
    }
    set({
      players: withYou(players, youId, () => played.player),
      selectedShop: null,
      selectedHand: null,
    });
  },

  sell: (uid) => {
    if (online({ t: "sell", uid })) {
      sfx.sell();
      return;
    }
    const { players, youId, phase } = get();
    if (phase !== "tavern") return;
    const you = players.find((p) => p.id === youId);
    if (!you) return;
    sfx.sell();
    set({
      players: withYou(players, youId, (p) => sellMinion(p, uid, pool)),
      selectedBoard: null,
      selectedHand: null,
    });
  },

  playHand: (uid, index) => {
    if (online({ t: "playHand", uid, index })) return;
    const { players, youId, phase } = get();
    if (phase !== "tavern") return;
    const you = players.find((p) => p.id === youId);
    if (!you) return;
    const res = playFromHand(you, uid, index, rng);
    if (res.player === you) {
      if (you.board.length >= 7) set({ toast: "战场已满，先卖掉一只随从" });
      return;
    }
    sfx.buy();
    if (res.triple) {
      sfx.triple();
      const opts = pickDiscoverOptions(res.triple.sourceTier, rng);
      set({
        players: withYou(players, youId, () => res.player),
        selectedHand: null,
        selectedBoard: null,
        phase: "discover",
        discover: opts,
        toast: "金色合成！",
      });
      return;
    }
    set({
      players: withYou(players, youId, () => res.player),
      selectedHand: null,
      selectedBoard: null,
    });
  },

  refresh: () => {
    if (online({ t: "refresh" })) {
      sfx.refresh();
      return;
    }
    const { players, youId, phase } = get();
    if (phase !== "tavern") return;
    const you = players.find((p) => p.id === youId);
    if (!you || you.gold < 1) {
      set({ toast: "金币不足" });
      return;
    }
    sfx.refresh();
    set({
      players: withYou(players, youId, (p) => refreshShop(p, pool, rng)),
      selectedShop: null,
    });
  },

  freezeAll: () => {
    if (online({ t: "freezeAll" })) {
      sfx.freeze();
      return;
    }
    const { phase } = get();
    if (phase !== "tavern") return;
    sfx.freeze();
    set({ players: withYou(get().players, get().youId, freezeShop) });
  },

  freezeSlot: (uid) => {
    if (online({ t: "freezeSlot", uid })) {
      sfx.freeze();
      return;
    }
    if (get().phase !== "tavern") return;
    sfx.freeze();
    set({ players: withYou(get().players, get().youId, (p) => freezeOne(p, uid)) });
  },

  upgrade: () => {
    if (online({ t: "upgrade" })) {
      sfx.upgrade();
      return;
    }
    const { players, youId, phase } = get();
    if (phase !== "tavern") return;
    const you = players.find((p) => p.id === youId);
    if (!you) return;
    if (you.tavernTier >= 6) {
      set({ toast: "酒馆已满级" });
      return;
    }
    if (you.gold < upgradeCostNow(you)) {
      set({ toast: "金币不足，无法升级" });
      return;
    }
    sfx.upgrade();
    set({
      players: withYou(players, youId, upgradeTavern),
      toast: `酒馆升至 ${you.tavernTier + 1} 级`,
    });
  },

  move: (uid, index) => {
    if (online({ t: "move", uid, index })) return;
    if (get().phase !== "tavern") return;
    set({
      players: withYou(get().players, get().youId, (p) => moveMinion(p, uid, index)),
      selectedBoard: null,
    });
  },

  pickDiscover: (defId) => {
    if (online({ t: "pickDiscover", defId })) {
      sfx.coin();
      return;
    }
    const { players, youId } = get();
    sfx.coin();
    set({
      players: withYou(players, youId, (p) => addDiscovered(p, defId, rng)),
      phase: "tavern",
      discover: [],
    });
  },

  inspectMinion: (m) => set({ inspect: m ? asInspect(m) : null }),
  openScout: (id) => set({ scoutId: id, replay: id ? null : get().replay }),
  openReplay: (record) => set({ replay: record, scoutId: record ? null : get().scoutId }),

  usePower: () => {
    if (online({ t: "usePower" })) return;
    const { players, youId, phase } = get();
    if (phase !== "tavern") return;
    const you = players.find((p) => p.id === youId);
    if (!you) return;
    const res = useHeroPower(you, pool, rng);
    if (!res.ok) {
      set({ toast: res.message });
      return;
    }
    sfx.upgrade();
    set({
      players: withYou(players, youId, () => res.player),
      toast: res.message,
    });
  },

  skipDiscover: () => {
    if (online({ t: "skipDiscover" })) {
      set({ phase: "tavern", discover: [] });
      return;
    }
    set({ phase: "tavern", discover: [] });
  },

  endTurn: () => {
    if (online({ t: "endTurn" })) {
      sfx.click();
      set({ endedTurn: true, toast: "等待其他玩家…" });
      return;
    }
    const st = get();
    if (st.phase !== "tavern") return;
    sfx.click();
    let players = st.players.map((p) => (p.alive ? finishTurnBoards(p, rng) : p));
    const alive = players.filter((p) => p.alive);
    const pairs = pairPlayers(
      alive.map((p) => p.id),
      rng,
      st.lastOpponent ?? undefined,
    );
    const youPair = humanPair(pairs, st.youId);
    if (!youPair) {
      set({ phase: "gameover", players });
      return;
    }
    const oppId = youPair.a === st.youId ? youPair.b : youPair.a;
    const you = players.find((p) => p.id === st.youId)!;
    const opp = players.find((p) => p.id === oppId)!;
    const result = simulateCombat(you.board, opp.board, you.tavernTier, opp.tavernTier, rng);
    result.opponentId = oppId;
    result.ghost = Boolean(youPair.ghost);

    let nextPlace = st.nextPlace;
    for (const pair of pairs) {
      if (pair.a === st.youId || pair.b === st.youId) continue;
      const a = players.find((p) => p.id === pair.a);
      const b = players.find((p) => p.id === pair.b);
      if (!a || !b) continue;
      const r = simulateCombat(a.board, b.board, a.tavernTier, b.tavernTier, rng);
      if (r.winner === "enemy") {
        const out = applyFightDamage(players, a.id, true, r.damage, nextPlace, pool);
        players = out.players.map((p) => {
          if (p.id === a.id) return recordOutcome(p, "loss");
          if (p.id === b.id && !pair.ghost) return recordOutcome(p, "win");
          return p;
        });
        nextPlace = out.nextPlace;
      } else if (r.winner === "player") {
        if (!pair.ghost) {
          const out = applyFightDamage(players, b.id, true, r.damage, nextPlace, pool);
          players = out.players.map((p) => {
            if (p.id === b.id) return recordOutcome(p, "loss");
            if (p.id === a.id) return recordOutcome(p, "win");
            return p;
          });
          nextPlace = out.nextPlace;
        } else {
          players = players.map((p) => (p.id === a.id ? recordOutcome(p, "win") : p));
        }
      } else {
        players = players.map((p) =>
          p.id === a.id || (p.id === b.id && !pair.ghost) ? recordOutcome(p, "tie") : p,
        );
      }
    }

    set({
      phase: "combat",
      players,
      combat: result,
      combatEvents: result.events,
      combatCursor: 0,
      lastOpponent: oppId,
      nextPlace,
      selectedShop: null,
      selectedBoard: null,
      selectedHand: null,
      scoutId: null,
    });
  },

  startFight: () => {
    if (get().phase !== "matchup") return;
    sfx.click();
    set({ phase: "combat", combatCursor: 0 });
  },

  skipCombat: () => {
    const { combat, phase, mode } = get();
    if ((phase !== "combat" && phase !== "matchup") || !combat) return;
    set({ combatCursor: combat.events.length - 1, phase: "result" });
    if (mode === "online") send({ t: "combatDone" });
  },

  continueFromResult: () => {
    if (get().mode === "online") {
      send({ t: "combatDone" });
      set({ toast: "等待其他玩家进入下一回合…" });
      return;
    }
    const st = get();
    const combat = st.combat;
    if (!combat) return;
    let players = st.players;
    let nextPlace = st.nextPlace;
    const you = players.find((p) => p.id === st.youId)!;
    const opp = players.find((p) => p.id === combat.opponentId);

    if (combat.winner === "enemy") {
      sfx.lose();
      const out = applyFightDamage(players, you.id, true, combat.damage, nextPlace, pool);
      players = out.players.map((p) => {
        if (p.id === you.id) return recordOutcome(p, "loss");
        if (opp && p.id === opp.id && !combat.ghost) return recordOutcome(p, "win");
        return p;
      });
      nextPlace = out.nextPlace;
    } else if (combat.winner === "player" && opp && opp.alive && !combat.ghost) {
      sfx.win();
      const out = applyFightDamage(players, opp.id, true, combat.damage, nextPlace, pool);
      players = out.players.map((p) => {
        if (p.id === opp.id) return recordOutcome(p, "loss");
        if (p.id === you.id) return recordOutcome(p, "win");
        return p;
      });
      nextPlace = out.nextPlace;
    } else if (combat.winner === "tie") {
      sfx.click();
      players = players.map((p) =>
        p.id === you.id || (opp && p.id === opp.id && !combat.ghost) ? recordOutcome(p, "tie") : p,
      );
    } else if (combat.winner === "player") {
      sfx.win();
      players = players.map((p) => (p.id === you.id ? recordOutcome(p, "win") : p));
    }

    const record: FightRecord = {
      id: uid("f"),
      turn: st.turn,
      oppName: opp?.name ?? "残影",
      oppHeroId: opp?.heroId ?? "",
      result: combat.winner === "player" ? "win" : combat.winner === "enemy" ? "loss" : "tie",
      damage: combat.damage,
      ghost: combat.ghost,
      breakdown: combat.breakdown,
      firstAttacker: combat.firstAttacker,
      events: combat.events,
      beats: combat.beats,
      playerStart: combat.playerStart,
      enemyStart: combat.enemyStart,
    };
    const history = [...st.history, record].slice(-8);

    const living = players.filter((p) => p.alive);
    const youNow = players.find((p) => p.id === st.youId)!;
    if (!youNow.alive || living.length <= 1) {
      if (living.length === 1) {
        players = players.map((p) =>
          p.id === living[0]!.id && p.placement == null ? { ...p, placement: 1 } : p,
        );
      }
      set({ phase: "gameover", players, nextPlace, combat: null, history });
      return;
    }

    const turn = st.turn + 1;
    players = players.map((p) => (p.alive ? startTurn(p, turn, pool, rng) : p));
    players = players.map((p) => (p.alive && !p.isHuman ? aiPlayTurn(p, pool, rng) : p));
    set({
      phase: "tavern",
      turn,
      players,
      nextPlace,
      combat: null,
      combatEvents: [],
      combatCursor: 0,
      history,
      toast: `第 ${turn} 回合`,
    });
  },

  createRoom: async (name) => {
    unlockAudio();
    try {
      await connect(name);
      set({ mode: "online", phase: "lobby", toast: "正在创建房间…" });
      send({ t: "create" });
    } catch (err) {
      set({
        toast: err instanceof Error ? err.message : "无法连接房间服务",
        phase: "menu",
        mode: "solo",
      });
    }
  },

  joinRoom: async (code, name) => {
    unlockAudio();
    try {
      await connect(name);
      set({ mode: "online", phase: "lobby", toast: "正在加入…" });
      send({ t: "join", code: code.trim().toUpperCase() });
    } catch (err) {
      set({
        toast: err instanceof Error ? err.message : "无法连接房间服务",
        phase: "menu",
        mode: "solo",
      });
    }
  },

  leaveRoom: () => {
    send({ t: "leave" });
    disconnect();
    set({
      mode: "solo",
      phase: "menu",
      roomCode: "",
      hostId: "",
      seats: [],
      players: [],
      combat: null,
    });
  },

  setLobbyReady: () => {
    send({ t: "ready" });
  },

  startRoom: () => {
    send({ t: "start" });
  },

  applyNet: (msg) => {
    if (msg.t === "error") {
      set({ toast: msg.message });
      return;
    }
    if (msg.t === "toast") {
      set({ toast: msg.message });
      return;
    }
    if (msg.t === "joined") {
      set({
        mode: "online",
        phase: "lobby",
        roomCode: msg.code,
        youId: msg.playerId,
        hostId: msg.hostId,
        toast: `房间 ${msg.code}`,
      });
      return;
    }
    if (msg.t !== "snapshot") return;
    const s = msg.snap;
    const prev = get().combat;
    const sameFight =
      prev &&
      s.combat &&
      prev.opponentId === s.combat.opponentId &&
      prev.events.length === s.combat.events.length;
    set({
      mode: "online",
      phase: s.phase,
      turn: s.turn,
      youId: s.youId,
      roomCode: s.roomCode,
      hostId: s.hostId,
      seats: s.seats,
      players: s.players.map((p) => publicToPlayer(p, s.you, s.youId)),
      combat: s.combat,
      combatEvents: s.combat?.events ?? [],
      combatCursor: sameFight ? get().combatCursor : 0,
      discover: s.discover,
      heroChoices: s.heroChoices,
      tavernEndsAt: s.tavernEndsAt,
      endedTurn: s.endedTurn,
      toast: s.toast ?? get().toast,
    });
  },
  };
});
