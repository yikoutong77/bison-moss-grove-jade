import { useEffect, useRef, useState } from "react";
import { FastForward, Pause, Play, X } from "lucide-react";
import { CombatBoard } from "./CombatBoard";
import { CombatTimeline } from "./CombatTimeline";
import { useGame } from "@/game/store";
import { HERO_BY_ID, heroArt } from "@/game/heroes";
import { lastEventIndexOfBeat } from "@/game/timeline";
import { initialPlayback, replayTo, stepPlayback, type PlaybackState } from "@/game/playback";
import { sfx } from "@/game/audio";
import { cn } from "@/lib/utils";

export function FightReplay() {
  const record = useGame((s) => s.replay);
  const close = useGame((s) => s.openReplay);
  const speed = useGame((s) => s.speed);
  const setSpeed = useGame((s) => s.setSpeed);

  const [paused, setPaused] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [view, setView] = useState<PlaybackState | null>(null);
  const [activeBeat, setActiveBeat] = useState(0);
  const idxRef = useRef(0);
  const clockRef = useRef(0);
  const stateRef = useRef<PlaybackState | null>(null);
  const pausedRef = useRef(true);

  const events = record?.events ?? [];
  const beats = record?.beats ?? [];

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!record) return;
    const init = initialPlayback(record.playerStart, record.enemyStart);
    stateRef.current = init;
    idxRef.current = 0;
    clockRef.current = 0;
    setView(init);
    setActiveBeat(0);
    setPaused(true);
  }, [record]);

  const seek = (beatId: number) => {
    if (!record) return;
    const last = lastEventIndexOfBeat(record.events, beatId);
    const state = replayTo(record.playerStart, record.enemyStart, record.events, last);
    stateRef.current = state;
    idxRef.current = last + 1;
    const beat = record.beats[beatId];
    clockRef.current = (beat?.endAt ?? 0) / 1000;
    setView(state);
    setActiveBeat(beatId);
    setPaused(true);
  };

  useEffect(() => {
    if (!record || paused) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (pausedRef.current) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      clockRef.current += dt * speed;
      const clockMs = clockRef.current * 1000;
      let i = idxRef.current;
      let state = stateRef.current;
      if (!state) return;
      let applied = false;
      while (i < events.length && (events[i]?.at ?? 0) <= clockMs) {
        const step = stepPlayback(state, events, i);
        state = step.state;
        i = step.nextIndex;
        applied = true;
        if (state.sfx === "hit") sfx.hit();
        if (state.sfx === "death") sfx.death();
      }
      if (applied && state) {
        stateRef.current = state;
        idxRef.current = i;
        setView(state);
        const b = events[Math.max(0, i - 1)]?.beat ?? 0;
        setActiveBeat(b);
      }
      if (i >= events.length) {
        setPaused(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [record, paused, speed, events]);

  if (!record || !view) return null;
  const hero = record.oppHeroId ? HERO_BY_ID[record.oppHeroId] : undefined;
  const resultLabel =
    record.result === "win" ? "胜利" : record.result === "loss" ? "战败" : "平局";

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-bg-deep/70 p-3">
      <div className="panel max-h-[92%] w-full max-w-3xl overflow-y-auto rounded-2xl p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {hero && (
              <img src={heroArt(hero.art)} alt="" className="size-10 rounded-full object-cover object-top" />
            )}
            <div>
              <div className="font-display font-semibold">
                第 {record.turn} 回合 · {record.oppName}
                {record.ghost ? " · 残影" : ""}
              </div>
              <div className="text-xs text-muted">
                {resultLabel}
                {record.damage ? ` · ${record.damage} 伤` : ""}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-border"
            onClick={() => close(null)}
            aria-label="关闭战报"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-border bg-surface/60 p-3">
          <CombatBoard
            player={view.player}
            enemy={view.enemy}
            attacking={view.attacking}
            hit={view.hit}
            hitKind={view.hitKind}
            hitAmount={view.hitAmount}
            strikeId={view.strikeId}
            floats={view.floats}
            mid={<p className="my-2 text-center font-display text-sm text-gold-2">{view.banner}</p>}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="action-btn" onClick={() => setPaused((p) => !p)}>
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            {paused ? "播放" : "暂停"}
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={() => {
              if (!record) return;
              const state = replayTo(
                record.playerStart,
                record.enemyStart,
                record.events,
                record.events.length - 1,
              );
              stateRef.current = state;
              idxRef.current = record.events.length;
              clockRef.current = (record.beats.at(-1)?.endAt ?? 0) / 1000;
              setView(state);
              setActiveBeat(Math.max(0, record.beats.length - 1));
              setPaused(true);
            }}
          >
            <FastForward className="size-4" />
            终局
          </button>
          {([1, 2, 4] as const).map((sp) => (
            <button
              key={sp}
              type="button"
              className={cn("action-btn px-3", speed === sp && "primary")}
              onClick={() => setSpeed(sp)}
            >
              {sp}x
            </button>
          ))}
        </div>

        <div className="mt-3">
          <CombatTimeline
            beats={beats}
            activeBeat={activeBeat}
            onSeek={seek}
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
          />
        </div>
      </div>
    </div>
  );
}
