import { aiPlayTurn } from "./ai";
import { invertCombat, simulateCombat } from "./combat";
import {
  addDiscovered,
  applyFightDamage,
  buyMinion,
  createPool,
  finishTurnBoards,
  freezeOne,
  freezeShop,
  makePlayer,
  moveMinion,
  pairPlayers,
  pickDiscoverOptions,
  playFromHand,
  recordOutcome,
  refreshShop,
  sellMinion,
  startTurn,
  upgradeTavern,
  useHeroPower,
  type Pool,
} from "./engine";
import { HEROES, HERO_BY_ID } from "./heroes";
import { createRng, shuffle, uid, type Rng } from "./rng";
import type { CombatResult, HeroDef, MinionInst, Phase, PlayerState } from "./types";
import type { ClientMsg, PublicPlayer, SeatView, Snapshot } from "../net/protocol";
import { MAX_SEATS } from "../net/protocol";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeRoomCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return s;
}

export interface HumanSeat {
  id: string;
  clientId: string;
  name: string;
  connected: boolean;
  lobbyReady: boolean;
  heroChoices: HeroDef[];
}

export interface RoomHooks {
  onChange: () => void;
  schedule: (key: string, delayMs: number, fn: () => void) => void;
  cancel: (key: string) => void;
}

const ROPE_MS = 15_000;
const RESULT_HOLD_MS = 1_200;

function tavernMs(turn: number): number {
  return Math.min(90_000, 40_000 + turn * 5_000);
}

export class GameRoom {
  readonly code: string;
  hostId: string;
  phase: Phase = "lobby";
  turn = 1;
  seed: number;
  rng: Rng;
  pool: Pool;
  players: PlayerState[] = [];
  humans = new Map<string, HumanSeat>();
  discover = new Map<string, MinionInst[]>();
  combats = new Map<string, CombatResult>();
  ended = new Set<string>();
  combatAck = new Set<string>();
  lastGhost: string | undefined;
  nextPlace = 8;
  tavernEndsAt: number | null = null;
  combatEndsAt: number | null = null;
  ropeLit = false;
  toast: string | null = null;
  hooks: RoomHooks;

  constructor(code: string, hooks: RoomHooks) {
    this.code = code;
    this.hostId = "";
    this.seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    this.rng = createRng(this.seed);
    this.pool = createPool();
    this.hooks = hooks;
  }

  addHuman(clientId: string, name: string): HumanSeat | { error: string } {
    for (const h of this.humans.values()) {
      if (h.clientId === clientId) {
        h.connected = true;
        h.name = name || h.name;
        this.hooks.onChange();
        return h;
      }
    }
    if (this.phase !== "lobby") return { error: "对局已开始，无法加入" };
    if (this.humans.size >= MAX_SEATS) return { error: "房间已满" };
    const seat: HumanSeat = {
      id: uid("p"),
      clientId,
      name: name.trim() || "旅人",
      connected: true,
      lobbyReady: false,
      heroChoices: [],
    };
    this.humans.set(seat.id, seat);
    if (!this.hostId) this.hostId = seat.id;
    this.hooks.onChange();
    return seat;
  }

  disconnect(playerId: string) {
    const h = this.humans.get(playerId);
    if (!h) return;
    h.connected = false;
    if (this.phase === "lobby") {
      this.humans.delete(playerId);
      if (this.hostId === playerId) {
        this.hostId = [...this.humans.keys()][0] ?? "";
      }
    } else if (this.phase === "tavern" || this.phase === "discover") {
      this.ended.add(playerId);
      this.maybeResolveCombat();
    } else if (this.phase === "combat" || this.phase === "result") {
      this.combatAck.add(playerId);
      this.maybeNextTurn();
    }
    this.hooks.onChange();
  }

  handle(playerId: string, msg: ClientMsg) {
    switch (msg.t) {
      case "ready":
        this.toggleReady(playerId);
        break;
      case "start":
        this.startMatch(playerId);
        break;
      case "pickHero":
        this.pickHero(playerId, msg.heroId);
        break;
      case "buy":
        this.act(playerId, (p) => buyMinion(p, msg.uid, this.rng));
        break;
      case "buyToBoard":
        this.buyToBoard(playerId, msg.uid, msg.index);
        break;
      case "playHand":
        this.act(playerId, (p) => playFromHand(p, msg.uid, msg.index, this.rng));
        break;
      case "sell":
        this.replace(playerId, (p) => sellMinion(p, msg.uid, this.pool));
        break;
      case "refresh":
        this.replace(playerId, (p) => refreshShop(p, this.pool, this.rng));
        break;
      case "freezeAll":
        this.replace(playerId, freezeShop);
        break;
      case "freezeSlot":
        this.replace(playerId, (p) => freezeOne(p, msg.uid));
        break;
      case "upgrade":
        this.replace(playerId, upgradeTavern);
        break;
      case "move":
        this.replace(playerId, (p) => moveMinion(p, msg.uid, msg.index));
        break;
      case "usePower": {
        const p = this.player(playerId);
        if (!p || this.phase !== "tavern" || this.ended.has(playerId)) break;
        const res = useHeroPower(p, this.pool, this.rng);
        if (res.ok) this.setPlayer(res.player);
        this.toast = res.message;
        this.hooks.onChange();
        break;
      }
      case "endTurn":
        this.endTurn(playerId);
        break;
      case "pickDiscover":
        this.pickDiscover(playerId, msg.defId);
        break;
      case "skipDiscover":
        this.discover.delete(playerId);
        this.hooks.onChange();
        break;
      case "combatDone":
        break;
      default:
        break;
    }
  }

  snapshot(viewerId: string): Snapshot {
    const you = this.players.find((p) => p.id === viewerId) ?? null;
    const human = this.humans.get(viewerId);
    const discover = this.discover.get(viewerId) ?? [];
    let phase = this.phase;
    if (you && !you.alive && this.phase !== "lobby" && this.phase !== "hero-select") phase = "gameover";
    else if (phase === "tavern" && discover.length) phase = "discover";
    else if (phase === "combat" && this.combatAck.has(viewerId)) phase = "result";
    return {
      phase,
      turn: this.turn,
      youId: viewerId,
      roomCode: this.code,
      hostId: this.hostId,
      seats: this.seats(),
      players: this.players.map((p) => this.publicOf(p)),
      you,
      combat: this.combats.get(viewerId) ?? null,
      discover,
      heroChoices: human?.heroChoices ?? [],
      tavernEndsAt: this.tavernEndsAt,
      combatEndsAt: this.combatEndsAt,
      rope: this.ropeLit || (this.tavernEndsAt != null && this.tavernEndsAt - Date.now() <= ROPE_MS),
      endedTurn: this.ended.has(viewerId),
      toast: this.toast,
    };
  }

  private seats(): SeatView[] {
    const list: SeatView[] = [];
    for (const h of this.humans.values()) {
      const p = this.players.find((x) => x.id === h.id);
      list.push({
        id: h.id,
        name: h.name,
        isBot: false,
        ready: this.phase === "lobby" ? h.lobbyReady : this.ended.has(h.id),
        connected: h.connected,
        heroId: p?.heroId ?? "",
        host: h.id === this.hostId,
      });
    }
    if (this.phase === "lobby") {
      const bots = MAX_SEATS - list.length;
      for (let i = 0; i < bots; i++) {
        list.push({
          id: `bot-slot-${i}`,
          name: "机器人",
          isBot: true,
          ready: true,
          connected: true,
          heroId: "",
          host: false,
        });
      }
    } else {
      for (const p of this.players) {
        if (this.humans.has(p.id)) continue;
        list.push({
          id: p.id,
          name: p.name,
          isBot: true,
          ready: true,
          connected: true,
          heroId: p.heroId,
          host: false,
        });
      }
    }
    return list.slice(0, MAX_SEATS);
  }

  private publicOf(p: PlayerState): PublicPlayer {
    const human = this.humans.get(p.id);
    return {
      id: p.id,
      name: p.name,
      heroId: p.heroId,
      hp: p.hp,
      armor: p.armor,
      tavernTier: p.tavernTier,
      alive: p.alive,
      placement: p.placement,
      streak: p.streak,
      triples: p.triples,
      wins: p.wins,
      losses: p.losses,
      isHuman: p.isHuman,
      connected: human ? human.connected : true,
      board: p.board,
      endedTurn: this.ended.has(p.id),
    };
  }

  private toggleReady(playerId: string) {
    if (this.phase !== "lobby") return;
    const h = this.humans.get(playerId);
    if (!h) return;
    h.lobbyReady = !h.lobbyReady;
    this.hooks.onChange();
  }

  private startMatch(playerId: string) {
    if (this.phase !== "lobby") return;
    if (playerId !== this.hostId) return;
    if (this.humans.size < 1) return;
    this.fillBotsAndDealHeroes();
    this.phase = "hero-select";
    this.toast = "选择英雄";
    this.hooks.onChange();
    this.maybeBeginTavern();
  }

  private fillBotsAndDealHeroes() {
    this.players = [];
    for (const h of this.humans.values()) {
      h.heroChoices = shuffle(HEROES, this.rng).slice(0, 4);
      const placeholder = makePlayer(h.id, h.heroChoices[0]!.id, h.name, true);
      this.players.push(placeholder);
    }
    const leftover = shuffle(HEROES, this.rng);
    let bot = 0;
    while (this.players.length < MAX_SEATS) {
      const hero = leftover[bot % leftover.length]!;
      const id = uid("bot");
      this.players.push(makePlayer(id, hero.id, `${hero.name}`, false));
      bot += 1;
    }
  }

  private pickHero(playerId: string, heroId: string) {
    if (this.phase !== "hero-select") return;
    const h = this.humans.get(playerId);
    if (!h) return;
    if (!h.heroChoices.some((x) => x.id === heroId)) return;
    this.players = this.players.map((p) => {
      if (p.id !== playerId) return p;
      const hero = HERO_BY_ID[heroId];
      return { ...p, heroId, name: h.name, armor: hero?.armor ?? p.armor };
    });
    h.heroChoices = [];
    this.hooks.onChange();
    this.maybeBeginTavern();
  }

  private maybeBeginTavern() {
    if (this.phase !== "hero-select") return;
    const waiting = [...this.humans.values()].some((h) => h.heroChoices.length > 0);
    if (waiting) return;
    this.turn = 1;
    this.nextPlace = 8;
    this.pool = createPool();
    this.players = this.players.map((p) => startTurn(p, this.turn, this.pool, this.rng));
    this.players = this.players.map((p) => (p.isHuman ? p : aiPlayTurn(p, this.pool, this.rng)));
    this.ended.clear();
    this.discover.clear();
    this.combats.clear();
    this.combatAck.clear();
    this.ropeLit = false;
    this.combatEndsAt = null;
    this.phase = "tavern";
    this.tavernEndsAt = Date.now() + tavernMs(this.turn);
    this.toast = `第 ${this.turn} 回合`;
    this.hooks.cancel(`tavern:${this.code}`);
    this.hooks.schedule(`tavern:${this.code}`, tavernMs(this.turn), () => {
      for (const h of this.humans.keys()) this.ended.add(h);
      this.maybeResolveCombat();
    });
    this.hooks.onChange();
  }

  private player(id: string) {
    return this.players.find((p) => p.id === id);
  }

  private setPlayer(next: PlayerState) {
    this.players = this.players.map((p) => (p.id === next.id ? next : p));
  }

  private inTavern(playerId: string) {
    return (this.phase === "tavern" || this.phase === "discover") && !this.ended.has(playerId);
  }

  private replace(playerId: string, fn: (p: PlayerState) => PlayerState) {
    if (!this.inTavern(playerId)) return;
    const p = this.player(playerId);
    if (!p) return;
    this.setPlayer(fn(p));
    this.hooks.onChange();
  }

  private act(playerId: string, fn: (p: PlayerState) => { player: PlayerState; triple?: { golden: MinionInst; sourceTier: number } }) {
    if (!this.inTavern(playerId)) return;
    const p = this.player(playerId);
    if (!p) return;
    const res = fn(p);
    if (res.player === p) return;
    this.setPlayer(res.player);
    if (res.triple) {
      this.discover.set(playerId, pickDiscoverOptions(res.triple.sourceTier, this.rng));
      this.toast = "三连！";
    }
    this.hooks.onChange();
  }

  private buyToBoard(playerId: string, uid: string, index: number) {
    if (!this.inTavern(playerId)) return;
    const p = this.player(playerId);
    if (!p) return;
    const bought = buyMinion(p, uid, this.rng);
    if (bought.player === p) return;
    if (bought.triple) {
      this.setPlayer(bought.player);
      this.discover.set(playerId, pickDiscoverOptions(bought.triple.sourceTier, this.rng));
      this.toast = "三连！";
      this.hooks.onChange();
      return;
    }
    const played = playFromHand(bought.player, uid, index, this.rng);
    this.setPlayer(played.player);
    if (played.triple) {
      this.discover.set(playerId, pickDiscoverOptions(played.triple.sourceTier, this.rng));
      this.toast = "金色合成！";
    }
    this.hooks.onChange();
  }

  private pickDiscover(playerId: string, defId: string) {
    const opts = this.discover.get(playerId);
    if (!opts?.length) return;
    const p = this.player(playerId);
    if (!p) return;
    this.setPlayer(addDiscovered(p, defId, this.rng));
    this.discover.delete(playerId);
    this.hooks.onChange();
  }

  private endTurn(playerId: string) {
    if (this.phase !== "tavern" && this.phase !== "discover") return;
    this.ended.add(playerId);
    this.discover.delete(playerId);
    this.pullRope();
    this.maybeResolveCombat();
    this.hooks.onChange();
  }

  private pullRope() {
    if (this.phase !== "tavern" && this.phase !== "discover") return;
    const humans = [...this.humans.keys()].filter((id) => this.player(id)?.alive);
    if (!humans.some((id) => this.ended.has(id))) return;
    if (humans.every((id) => this.ended.has(id))) return;
    const left = (this.tavernEndsAt ?? Date.now()) - Date.now();
    if (left <= ROPE_MS + 50) {
      this.ropeLit = true;
      return;
    }
    this.ropeLit = true;
    this.tavernEndsAt = Date.now() + ROPE_MS;
    this.toast = "有人结束了回合，绳子开始燃烧";
    this.hooks.cancel(`tavern:${this.code}`);
    this.hooks.schedule(`tavern:${this.code}`, ROPE_MS, () => {
      for (const h of this.humans.keys()) this.ended.add(h);
      this.maybeResolveCombat();
    });
  }

  private maybeResolveCombat() {
    const humans = [...this.humans.keys()].filter((id) => {
      const p = this.player(id);
      return p?.alive;
    });
    if (humans.some((id) => !this.ended.has(id))) return;
    this.resolveCombat();
  }

  private resolveCombat() {
    this.hooks.cancel(`tavern:${this.code}`);
    let players = this.players.map((p) => (p.alive ? finishTurnBoards(p, this.rng) : p));
    const alive = players.filter((p) => p.alive);
    if (alive.length <= 1) {
      this.players = players;
      this.phase = "gameover";
      this.tavernEndsAt = null;
      this.hooks.onChange();
      return;
    }
    const pairs = pairPlayers(
      alive.map((p) => p.id),
      this.rng,
      this.lastGhost,
    );
    this.combats.clear();
    let nextPlace = this.nextPlace;
    for (const pair of pairs) {
      const a = players.find((p) => p.id === pair.a)!;
      const b = players.find((p) => p.id === pair.b)!;
      const result = simulateCombat(a.board, b.board, a.tavernTier, b.tavernTier, this.rng);
      result.ghost = Boolean(pair.ghost);
      result.opponentId = b.id;
      const forA = result;
      const forB = pair.ghost ? null : invertCombat(result, a.id);
      if (this.humans.has(a.id)) this.combats.set(a.id, forA);
      if (forB && this.humans.has(b.id)) this.combats.set(b.id, forB);

      if (result.winner === "enemy") {
        const out = applyFightDamage(players, a.id, true, result.damage, nextPlace, this.pool);
        players = out.players.map((p) => {
          if (p.id === a.id) return recordOutcome(p, "loss");
          if (p.id === b.id && !pair.ghost) return recordOutcome(p, "win");
          return p;
        });
        nextPlace = out.nextPlace;
      } else if (result.winner === "player") {
        if (!pair.ghost) {
          const out = applyFightDamage(players, b.id, true, result.damage, nextPlace, this.pool);
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
      if (pair.ghost) this.lastGhost = pair.a;
    }
    this.players = players;
    this.nextPlace = nextPlace;
    this.phase = "combat";
    this.tavernEndsAt = null;
    this.ropeLit = false;
    this.combatAck.clear();
    this.ended.clear();
    let maxAt = 3500;
    for (const c of this.combats.values()) {
      for (const e of c.events) {
        if ((e.at ?? 0) > maxAt) maxAt = e.at;
      }
    }
    const watchMs = maxAt + RESULT_HOLD_MS;
    this.combatEndsAt = Date.now() + watchMs;
    this.hooks.cancel(`combat:${this.code}`);
    this.hooks.schedule(`combat:${this.code}`, watchMs, () => {
      for (const id of this.humans.keys()) this.combatAck.add(id);
      this.maybeNextTurn();
    });
    this.hooks.onChange();
  }

  private maybeNextTurn() {
    const humans = [...this.humans.keys()].filter((id) => this.player(id)?.alive);
    if (humans.some((id) => !this.combatAck.has(id))) return;
    this.hooks.cancel(`combat:${this.code}`);
    const living = this.players.filter((p) => p.alive);
    if (living.length <= 1 || [...this.humans.values()].every((h) => !this.player(h.id)?.alive)) {
      if (living.length === 1) {
        this.players = this.players.map((p) =>
          p.id === living[0]!.id && p.placement == null ? { ...p, placement: 1 } : p,
        );
      }
      this.phase = "gameover";
      this.hooks.onChange();
      return;
    }
    this.turn += 1;
    this.players = this.players.map((p) => (p.alive ? startTurn(p, this.turn, this.pool, this.rng) : p));
    this.players = this.players.map((p) => (p.alive && !p.isHuman ? aiPlayTurn(p, this.pool, this.rng) : p));
    this.combats.clear();
    this.discover.clear();
    this.combatAck.clear();
    this.ended.clear();
    this.ropeLit = false;
    this.combatEndsAt = null;
    this.phase = "tavern";
    this.tavernEndsAt = Date.now() + tavernMs(this.turn);
    this.toast = `第 ${this.turn} 回合`;
    this.hooks.cancel(`tavern:${this.code}`);
    this.hooks.schedule(`tavern:${this.code}`, tavernMs(this.turn), () => {
      for (const h of this.humans.keys()) this.ended.add(h);
      this.maybeResolveCombat();
    });
    this.hooks.onChange();
  }
}
