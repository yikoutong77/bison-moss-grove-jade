export type Tribe =
  | "beast"
  | "murloc"
  | "mech"
  | "demon"
  | "dragon"
  | "pirate"
  | "undead"
  | "quilboar"
  | "neutral";

export type Keyword =
  | "taunt"
  | "divineShield"
  | "windfury"
  | "poisonous"
  | "reborn"
  | "cleave";

export type Effect =
  | { kind: "battlecry_summon"; tokenId: string }
  | { kind: "battlecry_buff_tribe"; tribe: Tribe; atk: number; hp: number }
  | { kind: "battlecry_buff_others"; tribe?: Tribe; atk: number; hp: number }
  | { kind: "battlecry_buff_adjacent"; atk: number; hp: number; taunt?: boolean }
  | { kind: "battlecry_adapt_beasts"; atk: number; hp: number }
  | { kind: "battlecry_buff_self_per_tribe"; tribe: Tribe; atk: number; hp: number }
  | { kind: "battlecry_give_poison"; tribe?: Tribe }
  | { kind: "battlecry_buff_random"; atk: number; hp: number; taunt?: boolean }
  | { kind: "deathrattle_summon"; tokenId: string; count: number }
  | { kind: "deathrattle_summon_attack"; tokenId: string }
  | { kind: "deathrattle_buff_all"; atk: number; hp: number; tribe?: Tribe }
  | { kind: "deathrattle_damage_random"; damage: number }
  | { kind: "deathrattle_damage_all"; damage: number }
  | { kind: "deathrattle_divine_shield_tribe"; tribe: Tribe }
  | { kind: "deathrattle_summon_random_high" }
  | { kind: "deathrattle_give_shield" }
  | { kind: "end_turn_buff_self"; atk: number; hp: number }
  | { kind: "end_turn_buff_random"; atk: number; hp: number }
  | { kind: "end_turn_buff_each_tribe"; atk: number; hp: number }
  | { kind: "end_turn_buff_rightmost"; atk: number; hp: number }
  | { kind: "end_turn_summon"; tokenId: string }
  | { kind: "on_play_tribe"; tribe: Tribe; atk: number; hp: number }
  | { kind: "on_play_deathrattle"; atk: number; hp: number }
  | { kind: "start_combat_damage_random"; damage: number }
  | { kind: "start_combat_aura_adjacent"; atk: number }
  | { kind: "start_combat_aura_tribe"; tribe: Tribe; atk: number; hp: number }
  | { kind: "start_combat_attack" }
  | { kind: "on_summon_buff"; tribe: Tribe; atk: number; hp: number }
  | { kind: "on_summon_self_buff"; tribe: Tribe; atk: number; hp: number }
  | { kind: "on_friendly_summon_token"; tokenId: string }
  | { kind: "on_damaged_summon_random_demon" }
  | { kind: "after_attack_buff_tribe"; tribe: Tribe; atk: number; hp: number }
  | { kind: "overkill_buff_self"; atk: number; hp: number }
  | { kind: "avenge_buff_self"; count: number; atk: number; hp: number }
  | { kind: "baron" }
  | { kind: "brann" }
  | { kind: "give_gems"; count: number; when?: "battlecry" | "end_turn" | "both" };

export interface MinionDef {
  id: string;
  name: string;
  art: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  tribe: Tribe;
  atk: number;
  hp: number;
  keywords: Keyword[];
  effects: Effect[];
  text: string;
  token?: boolean;
  gem?: boolean;
}

export interface MinionInst {
  uid: string;
  defId: string;
  atk: number;
  hp: number;
  maxHp: number;
  golden: boolean;
  keywords: Keyword[];
  frozen?: boolean;
}

export type HeroPowerKind =
  | "refresh_freeze"
  | "summon_token"
  | "cheap_buy"
  | "random_shield"
  | "life_for_gold"
  | "buff_random"
  | "heal_random"
  | "cheap_upgrade"
  | "gain_armor";

export interface HeroPowerDef {
  name: string;
  text: string;
  cost: number;
  kind: HeroPowerKind;
}

export interface HeroDef {
  id: string;
  name: string;
  title: string;
  art: string;
  armor: number;
  power: HeroPowerDef;
}

export interface PlayerState {
  id: string;
  name: string;
  heroId: string;
  hp: number;
  tavernTier: number;
  gold: number;
  upgradeCost: number;
  board: MinionInst[];
  hand: MinionInst[];
  shop: MinionInst[];
  frozen: boolean;
  isHuman: boolean;
  alive: boolean;
  placement: number | null;
  triples: number;
  streak: number;
  wins: number;
  losses: number;
  armor: number;
  powerUsed: boolean;
  buyDiscount: number;
  upgradeDiscount: number;
}

export type Phase =
  | "menu"
  | "lobby"
  | "hero-select"
  | "tavern"
  | "discover"
  | "matchup"
  | "combat"
  | "result"
  | "gameover";

export type Side = "player" | "enemy";

export interface CombatMinion {
  uid: string;
  defId: string;
  name: string;
  art: string;
  tribe: Tribe;
  atk: number;
  hp: number;
  maxHp: number;
  golden: boolean;
  taunt: boolean;
  divineShield: boolean;
  windfury: boolean;
  poisonous: boolean;
  reborn: boolean;
  cleave: boolean;
  effects: Effect[];
  owner: Side;
  dead: boolean;
  attacksMade?: number;
}

export type CombatCause =
  | "strike"
  | "cleave"
  | "deathrattle"
  | "start_combat"
  | "overkill"
  | "poison"
  | "aura"
  | "avenge"
  | "after_attack"
  | "reborn"
  | "summon";

export interface CombatActor {
  uid: string;
  name: string;
  side: Side;
  golden: boolean;
  art: string;
}

export type BeatKind = "soc" | "attack" | "deathwave" | "end";

export interface TimelineBeat {
  id: number;
  startAt: number;
  endAt: number;
  kind: BeatKind;
  title: string;
  summary: string;
  events: CombatEvent[];
}

interface CombatEventMeta {
  at: number;
  beat?: number;
  actor?: CombatActor;
  target?: CombatActor;
  cause?: CombatCause;
  text?: string;
}

export type CombatEvent =
  | (CombatEventMeta & { type: "announce"; text: string })
  | (CombatEventMeta & { type: "attack"; attackerUid: string; targetUid: string })
  | (CombatEventMeta & {
      type: "damage";
      uid: string;
      amount: number;
      shieldPop: boolean;
      hpAfter: number;
    })
  | (CombatEventMeta & { type: "buff"; uid: string; atk: number; hp: number; divineShield?: boolean })
  | (CombatEventMeta & { type: "summon"; owner: Side; minion: CombatMinion; index: number })
  | (CombatEventMeta & { type: "death"; uid: string })
  | (CombatEventMeta & { type: "reborn"; uid: string; hp: number })
  | (CombatEventMeta & { type: "cleanup" })
  | (CombatEventMeta & {
      type: "end";
      winner: Side | "tie";
      damage: number;
      playerLeft: number;
      enemyLeft: number;
    });

export interface DamageBreakdown {
  tavernTier: number;
  leftover: Array<{ name: string; tier: number; golden: boolean }>;
  total: number;
}

export interface CombatResult {
  events: CombatEvent[];
  beats: TimelineBeat[];
  winner: Side | "tie";
  damage: number;
  breakdown: DamageBreakdown | null;
  firstAttacker: Side;
  playerFinal: CombatMinion[];
  enemyFinal: CombatMinion[];
  opponentId: string;
  playerStart: CombatMinion[];
  enemyStart: CombatMinion[];
  ghost: boolean;
}

export interface Pairing {
  a: string;
  b: string;
  ghost?: boolean;
}

export interface FightRecord {
  id: string;
  turn: number;
  oppName: string;
  oppHeroId: string;
  result: "win" | "loss" | "tie";
  damage: number;
  ghost: boolean;
  breakdown: DamageBreakdown | null;
  firstAttacker: Side;
  events: CombatEvent[];
  beats: TimelineBeat[];
  playerStart: CombatMinion[];
  enemyStart: CombatMinion[];
}

