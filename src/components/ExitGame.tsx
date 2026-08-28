import { useState } from "react";
import { LogOut } from "lucide-react";
import { useGame } from "@/game/store";

export function ExitGame() {
  const [ask, setAsk] = useState(false);
  const leaveRoom = useGame((s) => s.leaveRoom);
  return (
    <>
      <button type="button" className="hud-chip" onClick={() => setAsk(true)} aria-label="退出游戏" title="退出游戏">
        <LogOut className="size-4" />
      </button>
      {ask && (
        <div className="inspect-mask" onClick={() => setAsk(false)}>
          <div className="panel w-[min(20rem,90cqw)] rounded-2xl p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-lg font-semibold">退出本局？</p>
            <p className="mt-2 text-sm text-muted">将回到单人 / 多人选择页，本局进度不会保留。</p>
            <div className="mt-4 flex justify-center gap-2">
              <button type="button" className="action-btn" onClick={() => setAsk(false)}>
                取消
              </button>
              <button
                type="button"
                className="action-btn primary"
                onClick={() => {
                  setAsk(false);
                  leaveRoom();
                }}
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
