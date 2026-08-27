import { Copy, Play, LogOut, UserCheck } from "lucide-react";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

export function LobbyScreen() {
  const roomCode = useGame((s) => s.roomCode);
  const seats = useGame((s) => s.seats);
  const youId = useGame((s) => s.youId);
  const hostId = useGame((s) => s.hostId);
  const startRoom = useGame((s) => s.startRoom);
  const setLobbyReady = useGame((s) => s.setLobbyReady);
  const leaveRoom = useGame((s) => s.leaveRoom);
  const you = seats.find((s) => s.id === youId);
  const humans = seats.filter((s) => !s.isBot).length;

  const copy = () => {
    void navigator.clipboard?.writeText(roomCode);
  };

  return (
    <div className="tavern-shell flex h-full flex-col px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold-2">好友房间</p>
          <h2 className="font-display text-2xl font-bold">房间号 {roomCode || "……"}</h2>
        </div>
        <button type="button" className="action-btn" onClick={copy}>
          <Copy className="size-4" />
          复制
        </button>
      </div>
      <p className="mt-1 text-sm text-muted">
        把房间号发给朋友。空位开打后由机器人补齐，共 8 人。
      </p>
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-4 gap-2">
        {seats.map((seat) => (
          <div
            key={seat.id}
            className={cn(
              "rounded-xl border border-border bg-surface px-2 py-2",
              seat.id === youId && "border-gold",
              seat.isBot && "opacity-70",
            )}
          >
            <div className="truncate text-sm font-semibold">{seat.name}</div>
            <div className="text-[0.65rem] text-faint">
              {seat.isBot ? "待补位" : seat.host ? "房主" : seat.connected ? "已入座" : "掉线"}
              {!seat.isBot && seat.ready ? " · 准备" : ""}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="action-btn" onClick={leaveRoom}>
          <LogOut className="size-4" />
          离开
        </button>
        <button type="button" className="action-btn" onClick={setLobbyReady}>
          <UserCheck className="size-4" />
          {you?.ready ? "取消准备" : "准备"}
        </button>
        {youId === hostId && (
          <button type="button" className="action-btn primary ml-auto" onClick={startRoom}>
            <Play className="size-4" />
            开始（{humans} 真人）
          </button>
        )}
      </div>
    </div>
  );
}
