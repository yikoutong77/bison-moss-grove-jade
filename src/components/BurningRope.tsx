import { useEffect, useState } from "react";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

const ROPE_MS = 15_000;

export function BurningRope() {
  const mode = useGame((s) => s.mode);
  const phase = useGame((s) => s.phase);
  const endsAt = useGame((s) => s.tavernEndsAt);
  const rope = useGame((s) => s.rope);
  const ended = useGame((s) => s.endedTurn);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (!endsAt) {
      setLeft(0);
      return;
    }
    const tick = () => setLeft(Math.max(0, endsAt - Date.now()));
    tick();
    const id = window.setInterval(tick, 50);
    return () => window.clearInterval(id);
  }, [endsAt]);

  if (mode !== "online" || (phase !== "tavern" && phase !== "discover") || !endsAt) return null;
  const show = rope || left <= ROPE_MS + 80;
  if (!show) return null;
  const pct = Math.max(0, Math.min(100, (left / ROPE_MS) * 100));

  return (
    <div className={cn("fuse-wrap", ended && "is-waiting")} role="timer" aria-label={`剩余 ${Math.ceil(left / 1000)} 秒`}>
      <div className="fuse-track">
        <div className="fuse-left" style={{ width: `${pct}%` }}>
          <span className="fuse-ember" />
        </div>
      </div>
      <div className="fuse-label">{ended ? `等待其他玩家 · ${Math.ceil(left / 1000)}s` : `${Math.ceil(left / 1000)}s`}</div>
    </div>
  );
}
