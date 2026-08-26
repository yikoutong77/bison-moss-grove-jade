import { useEffect, useState } from "react";
import {
  formatBytes,
  formatMs,
  preloadAssets,
  type LoadProgress,
} from "@/game/assets";

export function BootScreen({ onReady }: { onReady: () => void }) {
  const [p, setP] = useState<LoadProgress>({
    loaded: 0,
    total: 1,
    failed: 0,
    bytes: 0,
    bytesTotal: 0,
    current: "准备清单",
    elapsedMs: 0,
  });

  useEffect(() => {
    document.getElementById("cold-boot")?.remove();
    const ac = new AbortController();
    void preloadAssets(setP, ac.signal).then(() => {
      if (!ac.signal.aborted) onReady();
    });
    return () => ac.abort();
  }, [onReady]);

  const pct = p.total ? Math.min(100, Math.round((p.loaded / p.total) * 100)) : 0;
  const bytePct =
    p.bytesTotal > 0 ? Math.min(100, Math.round((p.bytes / p.bytesTotal) * 100)) : pct;

  return (
    <div className="boot-shell">
      <div className="boot-card">
        <p className="text-xs font-medium tracking-[0.28em] text-gold-2">八人混战 · 自动对战</p>
        <h1 className="font-display mt-3 text-4xl font-semibold">酒馆战棋</h1>
        <p className="mt-2 text-sm text-muted">正在装填卡图与英雄立绘</p>

        <div className="boot-track mt-8" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="boot-fill" style={{ width: `${bytePct}%` }} />
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-3 text-sm">
          <span className="tabular font-semibold text-gold-2">{pct}%</span>
          <span className="tabular text-muted">
            {p.loaded}/{p.total}
            {p.bytes > 0 ? ` · ${formatBytes(p.bytes)}` : ""}
            {p.bytesTotal > 0 ? ` / ${formatBytes(p.bytesTotal)}` : ""}
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-faint">
          <span className="truncate">{p.current}</span>
          <span className="tabular">{formatMs(p.elapsedMs)}</span>
        </div>
        {p.failed > 0 && <p className="mt-2 text-xs text-hp">{p.failed} 张读取失败，将用占位继续</p>}
      </div>
    </div>
  );
}
