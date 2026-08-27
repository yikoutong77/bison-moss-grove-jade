import { useEffect, useRef, useState } from "react";
import { Snowflake, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CombatMinion, MinionInst } from "@/game/types";
import { KEYWORD_LABEL, artUrl, defOf } from "@/game/minions";

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
  const kws = isCombat(inst)
    ? ([
        inst.taunt && "taunt",
        inst.divineShield && "divineShield",
        inst.poisonous && "poisonous",
        inst.reborn && "reborn",
        inst.cleave && "cleave",
        inst.windfury && "windfury",
      ].filter(Boolean) as Array<keyof typeof KEYWORD_LABEL>)
    : inst.keywords;

  const [artBroken, setArtBroken] = useState(false);
  useEffect(() => {
    setArtBroken(false);
  }, [art]);
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

  const hold = useRef<number | null>(null);
  const didInspect = useRef(false);

  const clearHold = () => {
    if (hold.current) {
      window.clearTimeout(hold.current);
      hold.current = null;
    }
  };

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
        compact && "is-compact",
        golden && "is-golden",
        gem && "is-gem",
        selected && "is-selected",
        frozen && "is-frozen",
        taunt && "is-taunt",
        attacking && "is-attacking",
        hit && "is-hit",
        dead && "is-dead",
        dim && "opacity-50",
      )}
    >
      {taunt && <div className="kw-taunt" aria-hidden />}
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-bg-deep to-transparent" />
        {frozen && <div className="frost-sheet" />}
        {(shield || shieldBreak) && (
          <div className={cn("kw-bubble", shieldBreak && "is-break")} aria-hidden />
        )}
        <div className="minion-tier">{d.tier}</div>
        {golden && (
          <Sparkles className="absolute left-1 bottom-8 size-3.5 text-gold-2" strokeWidth={2} />
        )}
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
          <span className="kw-mark kw-reborn" title="复生">
            <svg viewBox="0 0 16 16" className="size-full" aria-hidden>
              <path d="M3 14 V7 L8 3 L13 7 V14 Z" fill="currentColor" />
              <rect x="7" y="9" width="2" height="5" fill="#1a120c" />
            </svg>
          </span>
        )}
        <div className="minion-caption">
          <div className="minion-name">{name}</div>
          {!compact && kws.length > 0 && (
            <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
              {kws.slice(0, 2).map((k) => (
                <span key={k} className="kw-chip">
                  {KEYWORD_LABEL[k]}
                </span>
              ))}
            </div>
          )}
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
