import { useEffect, useRef } from "react";
import type { TimelineBeat } from "@/game/types";
import { cn } from "@/lib/utils";

export function CombatTimeline({
  beats,
  activeBeat,
  onSeek,
  expanded,
  onToggle,
}: {
  beats: TimelineBeat[];
  activeBeat: number;
  onSeek: (id: number) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = listRef.current;
    if (!root || !expanded) return;
    const row = root.querySelector(`[data-beat="${activeBeat}"]`);
    if (row instanceof HTMLElement) {
      row.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeBeat, expanded]);

  if (!beats.length) return null;

  return (
    <div className="timeline-panel">
      <div className="flex items-center gap-2">
        <div className="timeline-track">
          {beats.map((b) => (
            <button
              key={b.id}
              type="button"
              title={b.title}
              aria-label={`第${b.id + 1}拍 ${b.title}`}
              className={cn(
                "timeline-tick",
                `kind-${b.kind}`,
                b.id < activeBeat && "is-done",
                b.id === activeBeat && "is-active",
              )}
              onClick={() => onSeek(b.id)}
            />
          ))}
        </div>
        <button type="button" className="action-btn px-3 text-xs" onClick={onToggle}>
          {expanded ? "收起" : "战报"}
        </button>
      </div>
      <p className="mt-1 truncate text-xs text-muted">
        <span className="text-gold-2">{beats[activeBeat]?.title ?? "战斗开始"}</span>
        {beats[activeBeat]?.summary ? ` · ${beats[activeBeat]?.summary}` : ""}
      </p>
      {expanded && (
        <ul ref={listRef} className="timeline-log">
          {beats.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                data-beat={b.id}
                className={cn("timeline-row", b.id === activeBeat && "is-active")}
                onClick={() => onSeek(b.id)}
              >
                <span className="tabular w-6 shrink-0 text-faint">{String(b.id + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1 truncate text-left">{b.title}</span>
                <span className="max-w-[45%] truncate text-right text-muted">{b.summary}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
