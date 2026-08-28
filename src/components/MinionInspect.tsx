import { X } from "lucide-react";
import { useGame } from "@/game/store";
import { KEYWORD_LABEL, TRIBE_LABEL, defOf } from "@/game/minions";
import { MinionCard } from "./MinionCard";

export function MinionInspect() {
  const inspect = useGame((s) => s.inspect);
  const inspectMinion = useGame((s) => s.inspectMinion);
  if (!inspect) return null;
  const d = defOf(inspect.defId);
  const kws = inspect.keywords;

  return (
    <div
      className="inspect-mask"
      onClick={() => inspectMinion(null)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="inspect-sheet" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="inspect-close"
          onClick={() => inspectMinion(null)}
          aria-label="关闭"
        >
          <X className="size-4" />
        </button>
        <div className="inspect-token">
          <MinionCard inst={inspect} size="lg" />
        </div>
        <div className="inspect-body">
          <h3 className="font-display">
            {d.name}
            {inspect.golden ? " · 金色" : ""}
          </h3>
          <p className="inspect-meta">
            {d.tier} 星 · {TRIBE_LABEL[d.tribe]} · {inspect.atk} 攻 / {inspect.hp} 血
          </p>
          {kws.length > 0 && (
            <div className="inspect-kws">
              {kws.map((k) => (
                <span key={k} className="kw-chip">
                  {KEYWORD_LABEL[k]}
                </span>
              ))}
            </div>
          )}
          <p className="inspect-text">{d.text || "没有额外特效。"}</p>
        </div>
      </div>
    </div>
  );
}
