import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { MinionCard } from "./MinionCard";
import type { CombatMinion } from "@/game/types";
import type { FloatNum, HitKind } from "@/game/playback";
import { cn } from "@/lib/utils";

interface Strike {
  uid: string;
  hitUid: string;
  x: number;
  y: number;
}

function measureDelta(from: HTMLElement, to: HTMLElement) {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const dvx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dvy = b.top + b.height / 2 - (a.top + a.height / 2);
  const rotated = document.documentElement.classList.contains("is-portrait");
  const x = rotated ? dvy : dvx;
  const y = rotated ? -dvx : dvy;
  return { x, y };
}

function setVec(el: HTMLElement, prefix: "s" | "w" | "k", x: number, y: number) {
  el.style.setProperty(`--${prefix}x`, `${x}px`);
  el.style.setProperty(`--${prefix}y`, `${y}px`);
}

export function CombatBoard({
  player,
  enemy,
  attacking,
  hit,
  hitKind,
  hitAmount = 0,
  strikeId = 0,
  floats,
  onInspect,
  mid,
  head,
  foot,
}: {
  player: CombatMinion[];
  enemy: CombatMinion[];
  attacking: string | null;
  hit: string | null;
  hitKind: HitKind | null;
  hitAmount?: number;
  strikeId?: number;
  floats: FloatNum[];
  onInspect?: (m: CombatMinion) => void;
  mid?: ReactNode;
  head?: ReactNode;
  foot?: ReactNode;
}) {
  const refs = useRef(new Map<string, HTMLElement>());
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const [strike, setStrike] = useState<Strike | null>(null);

  const bind = (uid: string) => (el: HTMLDivElement | null) => {
    if (el) refs.current.set(uid, el);
    else refs.current.delete(uid);
  };

  useLayoutEffect(() => {
    if (!attacking || !hit) {
      setStrike(null);
      return;
    }
    const from = refs.current.get(attacking);
    const to = refs.current.get(hit);
    if (!from || !to) {
      setStrike(null);
      return;
    }
    const { x, y } = measureDelta(from, to);
    setVec(from, "s", x, y);
    setVec(from, "w", -x * 0.12, -y * 0.12);
    setVec(to, "k", x * 0.16, y * 0.16);
    setStrike({ uid: attacking, hitUid: hit, x, y });
  }, [attacking, hit, strikeId]);

  useLayoutEffect(() => {
    if (!strike) return;
    const from = refs.current.get(strike.uid);
    if (!from) return;
    from.style.animation = "none";
    void from.offsetWidth;
    from.style.removeProperty("animation");
    const to = refs.current.get(strike.hitUid);
    if (to) {
      to.style.animation = "none";
      void to.offsetWidth;
      to.style.removeProperty("animation");
    }
  }, [strikeId, strike]);

  useLayoutEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.classList.remove("is-quake");
    if (hitKind === "kill" || hitAmount >= 5) {
      void el.offsetWidth;
      el.classList.add("is-quake");
    }
  }, [hit, hitKind, hitAmount]);

  const floatByUid = new Map<string, FloatNum>();
  for (const f of floats) floatByUid.set(f.uid, f);

  const renderRow = (board: CombatMinion[], side: "player" | "enemy") => (
    <div className="row-cards combat-row">
      {board.map((m) => {
        const isAtk = attacking === m.uid;
        const isHit = hit === m.uid;
        const fl = floatByUid.get(m.uid);
        const s = isAtk && strike?.uid === m.uid ? strike : null;
        return (
          <div
            key={m.uid}
            ref={bind(m.uid)}
            className={cn(
              "combat-piece",
              isAtk && s && "is-striking",
              isHit && "is-impact",
              isHit && hitKind && `kind-${hitKind}`,
            )}
          >
            <MinionCard
              inst={m}
              size="sm"
              compact
              attacking={false}
              hit={false}
              dead={m.dead || m.hp <= 0}
              lunge={side === "player" ? "up" : "down"}
              onInspect={onInspect ? () => onInspect(m) : undefined}
            />
            {fl && <span className={cn("combat-float", `kind-${fl.kind}`)}>{fl.text}</span>}
          </div>
        );
      })}
      {board.length === 0 && <p className="empty-row">战场空空</p>}
    </div>
  );

  return (
    <div ref={fieldRef} className="combat-field">
      {head}
      {renderRow(enemy, "enemy")}
      {mid}
      {renderRow(player, "player")}
      {foot}
    </div>
  );
}
