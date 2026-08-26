import { useEffect, useMemo, useRef, useState } from "react";
import { FastForward, Pause, Play } from "lucide-react";
import { MinionCard } from "./MinionCard";
import { MinionInspect } from "./MinionInspect";
import { LobbyStrip } from "./LobbyStrip";
import { CombatTimeline } from "./CombatTimeline";
import { useGame } from "@/game/store";
import { HERO_BY_ID, heroArt } from "@/game/heroes";
import { lastEventIndexOfBeat } from "@/game/timeline";
import { initialPlayback, replayTo, stepPlayback, type PlaybackState } from "@/game/playback";
import type { CombatMinion } from "@/game/types";
import { sfx } from "@/game/audio";
import { cn } from "@/lib/utils";

export function CombatScreen() {
  const combat = useGame((s) => s.combat);
  const events = useGame((s) => s.combatEvents);
  const phase = useGame((s) => s.phase);
  const speed = useGame((s) => s.speed);
  const setSpeed = useGame((s) => s.setSpeed);
  const skipCombat = useGame((s) => s.skipCombat);
  const continueFromResult = useGame((s) => s.continueFromResult);
  const inspectMinion = useGame((s) => s.inspectMinion);
  const players = useGame((s) => s.players);
  const youId = useGame((s) => s.youId);

  const [view, setView] = useState<PlaybackState | null>(null);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeBeat, setActiveBeat] = useState(0);
  const idxRef = useRef(0);
  const clockRef = useRef(0);
  const stateRef = useRef<PlaybackState | null>(null);
  const pausedRef = useRef(false);

  const you = players.find((p) => p.id === youId);
  const opp = players.find((p) => p.id === combat?.opponentId);
  const youHero = you ? HERO_BY_ID[you.heroId] : undefined;
  const oppHero = opp ? HERO_BY_ID[opp.heroId] : undefined;
  const beats = combat?.beats ?? [];
  const startKey = combat ? combat.playerStart.map((m) => m.uid).join() : "";

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!combat) return;
    const init = initialPlayback(combat.playerStart, combat.enemyStart);
    stateRef.current = init;
    idxRef.current = 0;
    clockRef.current = 0;
    setView(init);
    setActiveBeat(0);
    setPaused(false);
    setHeld(false);
    setExpanded(false);
  }, [startKey, combat]);

  const sync = (state: PlaybackState, index: number) => {
    setView(state);
    const beat = events[Math.max(0, index - 1)]?.beat ?? 0;
    setActiveBeat(beat);
  };

  const seekBeat = (beatId: number) => {
    if (!combat) return;
    const last = lastEventIndexOfBeat(combat.events, beatId);
    const state = replayTo(combat.playerStart, combat.enemyStart, combat.events, last);
    stateRef.current = state;
    idxRef.current = last + 1;
    const beat = combat.beats[beatId];
    clockRef.current = (beat?.endAt ?? 0) / 1000;
    setPaused(true);
    setHeld(true);
    setExpanded(true);
    sync(state, last + 1);
  };

  useEffect(() => {
    if (phase !== "combat" || paused || !events.length) return;
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
        if (events[i - 1]?.type === "end") {
          stateRef.current = state;
          idxRef.current = i;
          sync(state, i);
          useGame.getState().skipCombat();
          return;
        }
      }
      if (applied && state) {
        stateRef.current = state;
        idxRef.current = i;
        sync(state, i);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, events, speed, paused, startKey]);

  useEffect(() => {
    if (phase !== "result" || !combat || held) return;
    const endState = replayTo(
      combat.playerStart,
      combat.enemyStart,
      combat.events,
      combat.events.length - 1,
    );
    stateRef.current = endState;
    idxRef.current = combat.events.length;
    setView(endState);
    setActiveBeat(Math.max(0, (combat.beats.at(-1)?.id ?? 0)));
    const t = window.setTimeout(() => {
      continueFromResult();
    }, 4000);
    return () => window.clearTimeout(t);
  }, [phase, combat, held, continueFromResult]);

  const floatByUid = useMemo(() => {
    const m = new Map<string, string>();
    if (!view) return m;
    for (const f of view.floats) m.set(f.uid, f.text);
    return m;
  }, [view]);

  if (!combat || !you || !view) return null;

  const renderRow = (board: CombatMinion[], side: "player" | "enemy") => (
    <div className="row-cards combat-row">
      {board.map((m) => (
        <div key={m.uid} className="relative">
          <MinionCard
            inst={m}
            size="sm"
            compact
            attacking={view.attacking === m.uid}
            hit={view.hit === m.uid}
            dead={m.dead || m.hp <= 0}
            lunge={side === "player" ? "up" : "down"}
            onInspect={() => inspectMinion(m)}
          />
          {floatByUid.get(m.uid) && (
            <span className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 animate-[floatnum_700ms_ease_forwards] text-sm font-bold text-hp-fg">
              {floatByUid.get(m.uid)}
            </span>
          )}
        </div>
      ))}
      {board.length === 0 && <p className="empty-row">战场空空</p>}
    </div>
  );

  const bd = combat.breakdown;

  return (
    <div className="table-shell tavern-shell combat-shell">
      <div className="table-top">
        <LobbyStrip />
        <div className="hud-bar is-compact">
          <div className="flex items-center gap-2">
            {oppHero && (
              <img src={heroArt(oppHero.art)} alt="" className="size-8 rounded-full object-cover object-top" />
            )}
            <div className="min-w-0">
              <div className="font-display truncate text-sm font-semibold">
                {opp?.name ?? "对手"}
                {combat.ghost ? " · 残影" : ""}
              </div>
              <div className="text-[0.65rem] text-muted">
                {opp?.hp}血{opp && opp.armor > 0 ? ` · 甲${opp.armor}` : ""} · T{opp?.tavernTier}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {phase === "combat" && (
              <button type="button" className="action-btn px-3" onClick={() => setPaused((p) => !p)}>
                {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
              </button>
            )}
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
            {phase !== "result" && (
              <button type="button" className="action-btn" onClick={skipCombat}>
                <FastForward className="size-4" />
                跳过
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="combat-field">
        {renderRow(view.enemy, "enemy")}
        <div className="combat-banner">
          <span className="font-display text-sm text-gold-2">{view.banner}</span>
        </div>
        {renderRow(view.player, "player")}
        <div className="flex items-center justify-center gap-2">
          {youHero && (
            <img src={heroArt(youHero.art)} alt="" className="size-7 rounded-full object-cover object-top" />
          )}
          <span className="text-xs text-muted">{you.name}</span>
        </div>
      </div>

      <div className="combat-timeline-wrap">
        <CombatTimeline
          beats={beats}
          activeBeat={activeBeat}
          onSeek={seekBeat}
          expanded={expanded}
          onToggle={() => {
            setExpanded((v) => !v);
            setHeld(true);
            setPaused(true);
          }}
        />
      </div>

      {phase === "result" && !held && (
        <div className="fixed inset-x-0 bottom-3 z-20 grid place-items-center p-3">
          <div className="panel w-full max-w-md rounded-2xl p-5 text-center shadow-panel">
            <h3 className="font-display text-2xl font-bold">
              {combat.winner === "player" ? "胜利" : combat.winner === "enemy" ? "战败" : "势均力敌"}
            </h3>
            <p className="mt-2 text-muted">
              {combat.winner === "tie"
                ? "双方同归于尽，无人受伤。"
                : combat.ghost && combat.winner === "player"
                  ? "你击败了残影，对方本人不受伤。"
                  : combat.winner === "player"
                    ? `对手将受到 ${combat.damage} 点伤害。`
                    : `你受到 ${combat.damage} 点伤害。`}
            </p>
            {bd && combat.winner !== "tie" && (
              <div className="mt-3 text-sm text-gold-2">
                酒馆 {bd.tavernTier}
                {bd.leftover.length
                  ? ` + ${bd.leftover.map((m) => `${m.golden ? "金" : ""}${m.name}${m.tier}`).join("、")}`
                  : ""}
                {" = "}
                {bd.total} 伤
              </div>
            )}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className="action-btn"
                onClick={() => {
                  setHeld(true);
                  setExpanded(true);
                }}
              >
                查看战报
              </button>
              <button type="button" className="action-btn primary" onClick={continueFromResult}>
                回到酒馆
              </button>
            </div>
            <p className="mt-2 text-xs text-faint">数秒后自动返回酒馆</p>
          </div>
        </div>
      )}
      {phase === "result" && held && (
        <div className="flex flex-wrap items-center justify-center gap-2 px-3 pb-4">
          <span className="font-display text-gold-2">
            {combat.winner === "player" ? "胜利" : combat.winner === "enemy" ? "战败" : "平局"}
            {combat.damage ? ` · ${combat.damage} 伤` : ""}
          </span>
          <button type="button" className="action-btn primary" onClick={continueFromResult}>
            回到酒馆
          </button>
        </div>
      )}
      <MinionInspect />
    </div>
  );
}
