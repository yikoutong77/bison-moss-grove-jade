import type {
  BeatKind,
  CombatActor,
  CombatEvent,
  CombatMinion,
  TimelineBeat,
} from "./types";

export function actorOf(
  m: Pick<CombatMinion, "uid" | "name" | "owner" | "golden" | "art">,
): CombatActor {
  return { uid: m.uid, name: m.name, side: m.owner, golden: m.golden, art: m.art };
}

export function sideLabel(side: CombatActor["side"] | undefined): string {
  return side === "enemy" ? "对方" : "你方";
}

function nameOf(actor?: CombatActor, fallback = "随从"): string {
  if (!actor) return fallback;
  return actor.golden ? `金色${actor.name}` : actor.name;
}

export function describeEvent(e: CombatEvent): string {
  if (e.text && e.type === "announce") return e.text;
  switch (e.type) {
    case "announce":
      return e.text;
    case "attack":
      return `${nameOf(e.actor)} 攻击 ${nameOf(e.target, "目标")}`;
    case "damage":
      if (e.shieldPop) return `${nameOf(e.target ?? e.actor)} 圣盾破碎`;
      if (e.cause === "poison") return `${nameOf(e.actor)} 剧毒击杀 ${nameOf(e.target ?? e.actor)}`;
      if (e.cause === "cleave") return `顺劈 ${nameOf(e.target ?? e.actor)} -${e.amount}`;
      return `${nameOf(e.target ?? e.actor)} -${e.amount}`;
    case "buff": {
      const bits: string[] = [];
      if (e.atk) bits.push(`+${e.atk}攻`);
      if (e.hp) bits.push(`+${e.hp}血`);
      if (e.divineShield) bits.push("获得圣盾");
      return `${nameOf(e.actor)} ${bits.join(" ") || "获得增益"}`;
    }
    case "summon":
      return `召唤 ${e.minion.golden ? "金色" : ""}${e.minion.name}`;
    case "death":
      return `${nameOf(e.actor)} 死亡`;
    case "reborn":
      return `${nameOf(e.actor)} 复生`;
    case "cleanup":
      return "";
    case "end":
      if (e.winner === "player") return e.damage ? `胜利 · 造成 ${e.damage} 点伤害` : "胜利";
      if (e.winner === "enemy") return e.damage ? `战败 · 受到 ${e.damage} 点伤害` : "战败";
      return "平局";
  }
}

function isBoundary(type: CombatEvent["type"]): boolean {
  return type === "announce" || type === "attack" || type === "end";
}

function kindOf(group: CombatEvent[]): BeatKind {
  if (group.some((e) => e.type === "end")) return "end";
  if (group.some((e) => e.type === "attack")) return "attack";
  if (group.some((e) => e.type === "death")) return "deathwave";
  return "soc";
}

function summarize(group: CombatEvent[], kind: BeatKind): { title: string; summary: string } {
  const visible = group.filter((e) => e.type !== "cleanup");
  const firstAttack = visible.find((e) => e.type === "attack");
  const announce = visible.find((e) => e.type === "announce");
  const end = visible.find((e) => e.type === "end");
  const deaths = visible.filter((e) => e.type === "death");
  const summons = visible.filter((e) => e.type === "summon");
  const dmg = visible.filter((e) => e.type === "damage" && !e.shieldPop);
  const shields = visible.filter((e) => e.type === "damage" && e.shieldPop);
  const buffs = visible.filter((e) => e.type === "buff");

  const bits: string[] = [];
  if (dmg.length) {
    const total = dmg.reduce((s, e) => (e.type === "damage" ? s + e.amount : s), 0);
    bits.push(`伤害 ${total}`);
  }
  if (shields.length) bits.push(`圣盾 ${shields.length}`);
  if (deaths.length) bits.push(`击杀 ${deaths.length}`);
  if (summons.length) bits.push(`召唤 ${summons.length}`);
  if (buffs.length) bits.push(`增益 ${buffs.length}`);

  if (kind === "end" && end && end.type === "end") {
    return {
      title: describeEvent(end),
      summary:
        end.winner === "tie"
          ? "双方同归于尽"
          : `你方剩余 ${end.playerLeft} · 对方剩余 ${end.enemyLeft}`,
    };
  }

  if (kind === "attack" && firstAttack && firstAttack.type === "attack") {
    const who = `${sideLabel(firstAttack.actor?.side)} ${nameOf(firstAttack.actor)}`;
    return {
      title: `${who} 进攻`,
      summary: bits.join(" · ") || `攻击 ${nameOf(firstAttack.target, "目标")}`,
    };
  }

  if (kind === "deathwave") {
    const names = deaths
      .map((e) => (e.type === "death" ? nameOf(e.actor) : ""))
      .filter(Boolean)
      .join("、");
    return { title: "亡语连锁", summary: names || bits.join(" · ") };
  }

  const title =
    announce && announce.type === "announce"
      ? announce.text
      : bits.length
        ? "开战效果"
        : "战斗开始";
  return { title, summary: bits.join(" · ") };
}

export function buildTimeline(raw: CombatEvent[]): { beats: TimelineBeat[]; events: CombatEvent[] } {
  const groups: CombatEvent[][] = [];
  let cur: CombatEvent[] = [];
  for (const ev of raw) {
    if (isBoundary(ev.type) && cur.length) {
      groups.push(cur);
      cur = [ev];
    } else {
      cur.push(ev);
    }
  }
  if (cur.length) groups.push(cur);

  const events: CombatEvent[] = [];
  const beats: TimelineBeat[] = groups.map((group, id) => {
    const stamped = group.map((e) => ({ ...e, beat: id, text: e.text || describeEvent(e) }));
    events.push(...stamped);
    const kind = kindOf(stamped);
    const first = stamped[0]!;
    const last = stamped[stamped.length - 1]!;
    const { title, summary } = summarize(stamped, kind);
    return {
      id,
      startAt: first.at,
      endAt: last.at,
      kind,
      title,
      summary,
      events: stamped,
    };
  });
  return { beats, events };
}

export function lastEventIndexOfBeat(events: CombatEvent[], beatId: number): number {
  let last = -1;
  for (let i = 0; i < events.length; i++) {
    if (events[i]?.beat === beatId) last = i;
  }
  return last;
}

export function beatIndexAtEvent(events: CombatEvent[], eventIndex: number): number {
  const ev = events[Math.min(Math.max(0, eventIndex), Math.max(0, events.length - 1))];
  return ev?.beat ?? 0;
}
