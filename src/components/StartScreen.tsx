import { Play, BookOpen, Download } from "lucide-react";
import { useGame } from "@/game/store";

export function StartScreen() {
  const startSelect = useGame((s) => s.startSelect);
  const setHelp = useGame((s) => s.setHelp);

  return (
    <div className="tavern-shell relative flex h-full flex-col items-center justify-center px-5 py-4">
      <div className="absolute inset-0 bg-linear-to-b from-bg-deep/40 via-transparent to-bg-deep/80" />
      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <p className="text-sm font-medium tracking-[0.28em] text-gold-2">八人混战 · 自动对战</p>
        <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-fg sm:text-6xl">
          酒馆战棋
        </h1>
        <p className="mt-2 max-w-md text-pretty text-sm text-muted">
          横屏全屏操作。招募随从、释放英雄技能、三连升金，回合结束后自动交锋。
        </p>
        <div className="mt-5 flex w-full max-w-xl flex-wrap justify-center gap-3">
          <button type="button" className="action-btn primary h-11 min-w-36 text-base" onClick={startSelect}>
            <Play className="size-4" />
            开始对局
          </button>
          <button type="button" className="action-btn h-11 min-w-36" onClick={() => setHelp(true)}>
            <BookOpen className="size-4" />
            玩法说明
          </button>
          <a
            href="/tavern-battlegrounds.zip"
            download="tavern-battlegrounds.zip"
            className="action-btn h-11 min-w-36 no-underline"
          >
            <Download className="size-4" />
            下载源码
          </a>
        </div>
      </div>
    </div>
  );
}
