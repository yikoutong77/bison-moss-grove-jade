import type {
  CombatResult,
  HeroDef,
  MinionInst,
  Phase,
  PlayerState,
} from "../game/types";

export const MAX_SEATS = 8;
export const ROOM_CODE_LEN = 6;

export type ClientMsg =
  | { t: "hello"; name: string; clientId: string }
  | { t: "create" }
  | { t: "join"; code: string }
  | { t: "leave" }
  | { t: "ping" }
  | { t: "ready" }
  | { t: "start" }
  | { t: "pickHero"; heroId: string }
  | { t: "buy"; uid: string }
  | { t: "buyToBoard"; uid: string; index: number }
  | { t: "playHand"; uid: string; index: number }
  | { t: "sell"; uid: string }
  | { t: "refresh" }
  | { t: "freezeAll" }
  | { t: "freezeSlot"; uid: string }
  | { t: "upgrade" }
  | { t: "move"; uid: string; index: number }
  | { t: "usePower" }
  | { t: "endTurn" }
  | { t: "pickDiscover"; defId: string }
  | { t: "skipDiscover" }
  | { t: "combatDone" };

export interface SeatView {
  id: string;
  name: string;
  isBot: boolean;
  ready: boolean;
  connected: boolean;
  heroId: string;
  host: boolean;
}

export interface PublicPlayer {
  id: string;
  name: string;
  heroId: string;
  hp: number;
  armor: number;
  tavernTier: number;
  alive: boolean;
  placement: number | null;
  streak: number;
  triples: number;
  wins: number;
  losses: number;
  isHuman: boolean;
  connected: boolean;
  board: PlayerState["board"];
  endedTurn: boolean;
}

export interface Snapshot {
  phase: Phase;
  turn: number;
  youId: string;
  roomCode: string;
  hostId: string;
  seats: SeatView[];
  players: PublicPlayer[];
  you: PlayerState | null;
  combat: CombatResult | null;
  discover: MinionInst[];
  heroChoices: HeroDef[];
  tavernEndsAt: number | null;
  combatEndsAt: number | null;
  rope: boolean;
  endedTurn: boolean;
  toast: string | null;
}

export type ServerMsg =
  | { t: "welcome"; clientId: string }
  | { t: "joined"; code: string; playerId: string; hostId: string }
  | { t: "snapshot"; snap: Snapshot }
  | { t: "error"; message: string }
  | { t: "toast"; message: string };
