import { X } from "lucide-react";
import { useGame } from "@/game/store";
import { KEYWORD_LABEL, TRIBE_LABEL, artUrl, defOf } from "@/game/minions";

export function MinionInspect() {
  const inspect = useGame((s) => s.inspect);
  const inspectMinion = useGame((s) => s.inspectMinion);
  if (!inspect) return null;
  const d = defOf(inspect.defId);
  const kws = inspect.keywords;

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-bg-deep/70 p-4"
      onClick={() => inspectMinion(null)}
    >
      <div
        className="panel relative w-full max-w-sm overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-2 top-2 z-10 grid size-10 place-items-center rounded-full border border-border bg-surface/80"
          onClick={() => inspectMinion(null)}
          aria-label="关闭"
        >
          <X className="size-4" />
        </button>
        <div className="relative h-40 overflow-hidden">
          <img
            src={artUrl(d.art)}
            alt=""
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-linear-to-t from-surface to-transparent" />
        </div>
        <div className="px-5 pb-5 pt-2">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display text-xl font-bold">
              {d.name}
              {inspect.golden ? " · 金色" : ""}
            </h3>
            <span className="text-xs text-gold-2">{d.tier} 星 · {TRIBE_LABEL[d.tribe]}</span>
          </div>
          <p className="mt-1 tabular text-sm text-muted">
            {inspect.atk} 攻 / {inspect.hp} 血
          </p>
          {kws.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {kws.map((k) => (
                <span key={k} className="kw-chip">
                  {KEYWORD_LABEL[k]}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 text-sm leading-relaxed text-fg">
            {d.text || "没有额外特效。"}
          </p>
          <p className="mt-4 text-xs text-faint">长按或右键任意随从可再次查看。</p>
        </div>
      </div>
    </div>
  );
}
