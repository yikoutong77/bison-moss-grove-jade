import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { MinionCard } from "./MinionCard";
import type { CombatMinion } from "@/game/types";
import type { FloatNum, HitKind } from "@/game/playback";
import { cn } from "@/lib/utils";

interface Strike {
  uid: string;
  x: number;
  y: number;
}

function measureDelta(from: HTMLElement, to: HTMLElement) {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  return {
    x: (b.left + b.width / 2 - (a.left + a.width / 2)) * 0.88,
    y: (b.top + b.height / 2 - (a.top + a.height / 2)) * 0.88,
  };
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
    setStrike({ uid: attacking, x, y });
  }, [attacking, hit, strikeId]);

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
            key={isAtk ? `${m.uid}-s${strikeId}` : m.uid}
            ref={bind(m.uid)}
            className={cn(
              "combat-piece",
              isAtk && s && "is-striking",
              isHit && "is-impact",
              isHit && hitKind && `kind-${hitKind}`,
            )}
            style={
              s
                ? {
                    ["--sx" as string]: `${s.x}px`,
                    ["--sy" as string]: `${s.y}px`,
                  }
                : undefined
            }
          >
            <MinionCard
              inst={m}
              size="sm"
              compact
              attacking={isAtk && !s}
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
      {renderRow(enemy, "enemy")}
      {mid}
      {renderRow(player, "player")}
      {foot}
    </div>
  );
}
