import { useState } from "react";
import { Play, BookOpen, Users, LogIn } from "lucide-react";
import { useGame } from "@/game/store";
import { getSavedName } from "@/net/client";

export function StartScreen() {
  const startSelect = useGame((s) => s.startSelect);
  const setHelp = useGame((s) => s.setHelp);
  const createRoom = useGame((s) => s.createRoom);
  const joinRoom = useGame((s) => s.joinRoom);
  const [name, setName] = useState(getSavedName);
  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="tavern-shell relative flex h-full flex-col items-center justify-center px-5 py-4">
      <div className="absolute inset-0 bg-linear-to-b from-bg-deep/40 via-transparent to-bg-deep/80" />
      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <p className="text-sm font-medium tracking-[0.28em] text-gold-2">八人混战 · 自动对战</p>
        <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-fg sm:text-6xl">
          酒馆战棋
        </h1>
        <p className="mt-2 max-w-md text-pretty text-sm text-muted">
          横屏全屏操作。可单人打机器人，或开房间和朋友同步招募、同步开战。
        </p>
        <div className="mt-5 flex w-full max-w-xl flex-wrap justify-center gap-3">
          <button type="button" className="action-btn primary h-11 min-w-36 text-base" onClick={startSelect}>
            <Play className="size-4" />
            单人对局
          </button>
          <button type="button" className="action-btn h-11 min-w-36" onClick={() => setOpen(true)}>
            <Users className="size-4" />
            好友房间
          </button>
          <button type="button" className="action-btn h-11 min-w-36" onClick={() => setHelp(true)}>
            <BookOpen className="size-4" />
            玩法说明
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/55 p-4">
          <div className="panel w-full max-w-md rounded-2xl p-5 text-left">
            <h3 className="font-display text-xl font-bold">好友联机</h3>
            <p className="mt-1 text-sm text-muted">同一房间共用卡池和战斗。空位由机器人补齐。</p>
            <label className="mt-4 block text-xs text-faint">昵称</label>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
              value={name}
              maxLength={12}
              placeholder="旅人"
              onChange={(e) => setName(e.target.value)}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="action-btn primary flex-1"
                onClick={() => createRoom(name || "旅人")}
              >
                <Users className="size-4" />
                创建房间
              </button>
            </div>
            <label className="mt-4 block text-xs text-faint">房间号</label>
            <div className="mt-1 flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm uppercase tracking-widest"
                value={code}
                maxLength={6}
                placeholder="例如 K7M2PQ"
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                className="action-btn"
                disabled={code.trim().length < 4}
                onClick={() => joinRoom(code, name || "旅人")}
              >
                <LogIn className="size-4" />
                加入
              </button>
            </div>
            <button type="button" className="action-btn mt-4 w-full" onClick={() => setOpen(false)}>
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
