import { useEffect, useRef, useState } from "react";
import { Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CombatMinion, MinionInst } from "@/game/types";
import { artUrl, defOf } from "@/game/minions";
import { useOptionalTableDrag } from "./table-drag";

type Size = "sm" | "md" | "lg";

interface Props {
  inst: MinionInst | CombatMinion;
  size?: Size;
  selected?: boolean;
  attacking?: boolean;
  hit?: boolean;
  dead?: boolean;
  dim?: boolean;
  lunge?: "up" | "down";
  onClick?: () => void;
  onInspect?: () => void;
  onFreeze?: () => void;
  showFreeze?: boolean;
  compact?: boolean;
}

function isCombat(m: MinionInst | CombatMinion): m is CombatMinion {
  return "name" in m && "art" in m;
}

export function MinionCard({
  inst,
  size = "md",
  selected,
  attacking,
  hit,
  dead,
  dim,
  lunge = "up",
  onClick,
  onInspect,
  onFreeze,
  showFreeze,
  compact,
}: Props) {
  const d = defOf(inst.defId);
  const gem = !isCombat(inst) && Boolean(d.gem);
  const name = isCombat(inst) ? inst.name : d.name;
  const art = isCombat(inst) ? inst.art : d.art;
  const golden = inst.golden;
  const frozen = "frozen" in inst && inst.frozen;
  const taunt = isCombat(inst) ? inst.taunt : inst.keywords.includes("taunt");
  const shield = isCombat(inst) ? inst.divineShield : inst.keywords.includes("divineShield");
  const reborn = isCombat(inst) ? inst.reborn : inst.keywords.includes("reborn");
  const windfury = isCombat(inst) ? inst.windfury : inst.keywords.includes("windfury");
  const poisonous = isCombat(inst) ? inst.poisonous : inst.keywords.includes("poisonous");
  const cleave = isCombat(inst) ? inst.cleave : inst.keywords.includes("cleave");
  const attacksMade = isCombat(inst) ? inst.attacksMade ?? 0 : 0;

  const [artBroken, setArtBroken] = useState(false);
  useEffect(() => {
    setArtBroken(false);
  }, [art]);
  const hold = useRef<number | null>(null);
  const didInspect = useRef(false);
  const clearHold = () => {
    if (hold.current) {
      window.clearTimeout(hold.current);
      hold.current = null;
    }
  };
  const dragging = useOptionalTableDrag()?.drag;
  useEffect(() => {
    if (dragging) clearHold();
  }, [dragging]);
  const prevShield = useRef(shield);
  const [shieldBreak, setShieldBreak] = useState(false);
  useEffect(() => {
    if (prevShield.current && !shield) {
      setShieldBreak(true);
      const t = window.setTimeout(() => setShieldBreak(false), 380);
      prevShield.current = shield;
      return () => window.clearTimeout(t);
    }
    prevShield.current = shield;
  }, [shield]);

  const w = compact
    ? "w-[var(--table-card)]"
    : size === "lg"
      ? "w-[5.5rem] sm:w-[6.8rem] lg:w-[7.2rem]"
      : size === "sm"
        ? "w-[4.4rem] sm:w-[5.2rem]"
        : "w-[5.1rem] sm:w-[6.1rem]";

  return (
    <button
      type="button"
      onClick={() => {
        if (didInspect.current) {
          didInspect.current = false;
          return;
        }
        onClick?.();
      }}
      onContextMenu={(e) => {
        if (!onInspect) return;
        e.preventDefault();
        onInspect();
      }}
      onPointerDown={() => {
        if (!onInspect) return;
        didInspect.current = false;
        clearHold();
        hold.current = window.setTimeout(() => {
          didInspect.current = true;
          onInspect();
        }, 420);
      }}
      onPointerUp={clearHold}
      onPointerLeave={clearHold}
      onPointerCancel={clearHold}
      style={{ ["--lunge" as string]: lunge === "up" ? "-22px" : "22px" }}
      className={cn(
        "minion-card shrink-0 text-left",
        w,
        `tribe-${d.tribe}`,
        compact && "is-compact",
        golden && "is-golden",
        gem && "is-gem",
        selected && "is-selected",
        frozen && "is-frozen",
        taunt && "is-taunt",
        reborn && "is-reborn",
        attacking && "is-attacking",
        hit && "is-hit",
        dead && "is-dead",
        dim && "opacity-50",
      )}
    >
      {taunt && <div className="kw-taunt" aria-hidden />}
      {(shield || shieldBreak) && (
        <div className={cn("kw-bubble", shieldBreak && "is-break")} aria-hidden>
          <span className="kw-bubble-shine" />
        </div>
      )}
      <div className="minion-face">
        <img
          src={artUrl(art)}
          alt={name}
          className={cn("h-full w-full object-cover object-top", artBroken && "hidden")}
          draggable={false}
          loading="eager"
          decoding="async"
          onError={() => setArtBroken(true)}
        />
        {artBroken && <div className="minion-silhouette" aria-hidden />}
        {frozen && <div className="frost-sheet" />}
        <div className="minion-tier">{d.tier}</div>
        {windfury && (
          <span
            className={cn("kw-mark kw-wind", attacksMade >= 1 && "is-spent", attacksMade >= 2 && "is-done")}
            title="风怒"
          >
            <svg viewBox="0 0 16 16" className="size-full" aria-hidden>
              <path d="M2 5 L8 2 L8 8 Z" fill="currentColor" />
              <path d="M8 11 L14 8 L8 14 Z" fill="currentColor" opacity="0.85" />
            </svg>
          </span>
        )}
        {cleave && (
          <span className="kw-mark kw-cleave" title="顺劈">
            <svg viewBox="0 0 16 16" className="size-full" aria-hidden>
              <path d="M3 13 L13 3" stroke="currentColor" strokeWidth="2" />
              <path d="M5 14 L14 5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
        )}
        {reborn && (
          <span className="kw-reborn-badge" title="复生">
            <svg viewBox="0 0 32 36" aria-hidden>
              <path
                d="M8 34 V16 C8 8 12 4 16 4 C20 4 24 8 24 16 V34 Z"
                fill="#d8d0c4"
                stroke="#2e2820"
                strokeWidth="1.6"
              />
              <rect x="5" y="32" width="22" height="3.4" rx="0.6" fill="#8a8074" stroke="#2e2820" strokeWidth="1" />
              <path d="M16 11 V24 M11.5 15.5 H20.5" stroke="#3f372e" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        )}
        <div className="minion-caption">
          <div className="minion-name">{name}</div>
        </div>
        {showFreeze && onFreeze && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onFreeze();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") onFreeze();
            }}
            className={cn(
              "absolute right-1 top-1 grid size-6 place-items-center rounded-full border border-border bg-surface/85",
              frozen && "border-ice bg-ice/25 text-ice",
            )}
            aria-label="冻结"
          >
            <Snowflake className="size-3" />
          </span>
        )}
      </div>
      <span className={cn("stat-orb atk", poisonous && "is-poison")}>{inst.atk}</span>
      <span className="stat-orb hp">{inst.hp}</span>
    </button>
  );
}
