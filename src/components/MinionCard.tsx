import { useRef } from "react";
import { Snowflake, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CombatMinion, MinionInst } from "@/game/types";
import { KEYWORD_LABEL, TRIBE_LABEL, artUrl, defOf } from "@/game/minions";

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
  const name = isCombat(inst) ? inst.name : d.name;
  const art = isCombat(inst) ? inst.art : d.art;
  const golden = inst.golden;
  const frozen = "frozen" in inst && inst.frozen;
  const taunt = isCombat(inst) ? inst.taunt : inst.keywords.includes("taunt");
  const shield = isCombat(inst) ? inst.divineShield : inst.keywords.includes("divineShield");
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
        selected && "is-selected",
        frozen && "is-frozen",
        taunt && "is-taunt",
        attacking && "is-attacking",
        hit && "is-hit",
        dead && "is-dead",
        dim && "opacity-50",
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-2">
        <img
          src={artUrl(art)}
          alt={name}
          className="h-full w-full object-cover object-top"
          draggable={false}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-bg-deep to-transparent" />
        {frozen && <div className="frost-sheet" />}
        <div className="absolute left-1 top-1 rounded-sm bg-bg-deep/70 px-1 py-0.5 text-[0.6rem] font-semibold text-gold-2">
          {d.tier}
        </div>
        {golden && (
          <Sparkles className="absolute left-1 bottom-8 size-3.5 text-gold-2" strokeWidth={2} />
        )}
        {shield && (
          <span className="absolute right-1 top-5 size-2.5 rounded-full border border-gold-2 bg-shield/80" />
        )}
        <div className="absolute inset-x-0 bottom-7 px-1">
          <div className="truncate text-center text-[0.68rem] font-semibold leading-tight text-fg drop-shadow">
            {name}
          </div>
          <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
            {kws.slice(0, 3).map((k) => (
              <span key={k} className="kw-chip">
                {KEYWORD_LABEL[k]}
              </span>
            ))}
          </div>
        </div>
        <span className="stat-orb atk">{inst.atk}</span>
        <span className="stat-orb hp">{inst.hp}</span>
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
              "absolute right-1 top-1 grid size-7 place-items-center rounded-full border border-border bg-surface/85",
              frozen && "border-ice bg-ice/25 text-ice",
            )}
            aria-label="冻结"
          >
            <Snowflake className="size-3.5" />
          </span>
        )}
      </div>
      {compact ? null : size === "lg" && d.text ? (
        <p className="line-clamp-2 bg-surface px-1.5 py-1 text-[0.62rem] leading-snug text-muted">
          {d.text}
        </p>
      ) : (
        <p className="truncate bg-surface px-1 py-0.5 text-center text-[0.58rem] text-faint">
          {TRIBE_LABEL[d.tribe]}
        </p>
      )}
    </button>
  );
}
