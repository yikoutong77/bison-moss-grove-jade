import { useEffect, useRef, useState } from "react";
import { FastForward, Pause, Play } from "lucide-react";
import { MinionInspect } from "./MinionInspect";
import { LobbyStrip } from "./LobbyStrip";
import { CombatBoard } from "./CombatBoard";
import { useGame } from "@/game/store";
import { HERO_BY_ID, heroArt } from "@/game/heroes";
import { initialPlayback, replayTo, stepPlayback, type PlaybackState } from "@/game/playback";
import { sfx } from "@/game/audio";
import { cn } from "@/lib/utils";

function CombatWaitClock({ label = false }: { label?: boolean }) {
  const endsAt = useGame((s) => s.combatEndsAt);
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!endsAt) {
      setLeft(0);
      return;
    }
    const tick = () => setLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [endsAt]);
  if (!endsAt) return label ? <>时间到后自动进入下一回合</> : <span className="text-xs text-faint">同步中</span>;
  return (
    <span className="tabular text-sm text-gold-2">
      {label ? `${left}s 后进入下一回合` : `${left}s`}
    </span>
  );
}

function CombatHero({
  art,
  name,
  hp,
  armor,
  ghost,
  burst,
}: {
  art?: string;
  name: string;
  hp: number;
  armor: number;
  ghost?: boolean;
  burst?: number;
}) {
  const [shown, setShown] = useState(hp);
  useEffect(() => {
    if (!burst) {
      setShown(hp);
      return;
    }
    const t = window.setTimeout(() => setShown(Math.max(0, hp - burst)), 200);
    return () => window.clearTimeout(t);
  }, [burst, hp]);
  return (
    <div className="combat-hero-wrap">
      <div className={cn("desk-portrait combat-hero", ghost && "is-ghost", burst && "is-burst")}>
        {art && <img src={heroArt(art)} alt={name} draggable={false} />}
        <span className="combat-hero-hp">
          <b className="tabular">{shown}</b>
          <small>30</small>
          {armor > 0 && !burst && <em>+{armor}</em>}
        </span>
        {!!burst && (
          <span className="hero-burst" aria-hidden>
            -{burst}
          </span>
        )}
      </div>
    </div>
  );
}

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
  const mode = useGame((s) => s.mode);
  const online = mode === "online";
  const playSpeed = online ? 1 : speed;

  const [view, setView] = useState<PlaybackState | null>(null);
  const [paused, setPaused] = useState(false);
  const [activeBeat, setActiveBeat] = useState(0);
  const idxRef = useRef(0);
  const clockRef = useRef(0);
  const stateRef = useRef<PlaybackState | null>(null);
  const pausedRef = useRef(false);

  const [facePop, setFacePop] = useState(0);

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
    setFacePop(0);
  }, [startKey, combat]);

  const sync = (state: PlaybackState, index: number) => {
    setView(state);
    const beat = events[Math.max(0, index - 1)]?.beat ?? 0;
    setActiveBeat(beat);
  };

  useEffect(() => {
    if (phase !== "combat" || paused || !events.length) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (pausedRef.current) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      clockRef.current += dt * playSpeed;
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
  }, [phase, events, playSpeed, paused, startKey]);

  useEffect(() => {
    if (online) setPaused(false);
  }, [online, startKey]);

  useEffect(() => {
    if (phase !== "result" || !combat) return;
    const dmg =
      combat.damage > 0 && combat.winner !== "tie" && !(combat.ghost && combat.winner === "player")
        ? combat.damage
        : 0;
    const endState = replayTo(
      combat.playerStart,
      combat.enemyStart,
      combat.events,
      combat.events.length - 1,
    );
    stateRef.current = endState;
    idxRef.current = combat.events.length;
    setView(endState);
    setActiveBeat(Math.max(0, combat.beats.at(-1)?.id ?? 0));
    const popTimer = window.setTimeout(() => {
      if (dmg) {
        setFacePop(dmg);
        sfx.hit();
      }
    }, 280);
    if (online) {
      return () => window.clearTimeout(popTimer);
    }
    const t = window.setTimeout(() => {
      continueFromResult();
    }, dmg ? 1280 : 600);
    return () => {
      window.clearTimeout(popTimer);
      window.clearTimeout(t);
    };
  }, [phase, combat, continueFromResult, online]);

  if (!combat || !you || !view) return null;

  const burstSide =
    facePop <= 0
      ? null
      : combat.winner === "player"
        ? "enemy"
        : combat.winner === "enemy"
          ? "player"
          : null;

  return (
    <div className="table-shell tavern-shell combat-shell">
      <div className="table-top">
        <LobbyStrip />
        <div className="hud-bar is-compact">
          <div className="flex items-center gap-1.5">
            {!online && phase === "combat" && (
              <button type="button" className="action-btn px-3" onClick={() => setPaused((p) => !p)}>
                {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
              </button>
            )}
            {!online &&
              ([1, 2, 4] as const).map((sp) => (
                <button
                  key={sp}
                  type="button"
                  className={cn("action-btn px-3", speed === sp && "primary")}
                  onClick={() => setSpeed(sp)}
                >
                  {sp}x
                </button>
              ))}
            {!online && phase !== "result" && (
              <button type="button" className="action-btn" onClick={skipCombat}>
                <FastForward className="size-4" />
                跳过
              </button>
            )}
            {online && <CombatWaitClock />}
          </div>
        </div>
      </div>

      <CombatBoard
        player={view.player}
        enemy={view.enemy}
        attacking={view.attacking}
        hit={view.hit}
        hitKind={view.hitKind}
        hitAmount={view.hitAmount}
        strikeId={view.strikeId}
        floats={view.floats}
        onInspect={inspectMinion}
        head={
          <CombatHero
            art={oppHero?.art}
            name={opp?.name ?? "对手"}
            hp={opp?.hp ?? 0}
            armor={opp?.armor ?? 0}
            ghost={combat.ghost}
            burst={burstSide === "enemy" ? facePop : 0}
          />
        }
        mid={
          <div className="combat-banner">
            <span className="font-display text-sm text-gold-2">{view.banner}</span>
          </div>
        }
        foot={
          <CombatHero
            art={youHero?.art}
            name={you.name}
            hp={you.hp}
            armor={you.armor}
            burst={burstSide === "player" ? facePop : 0}
          />
        }
      />

      {online && phase === "result" && (
        <p className="sr-only">
          <CombatWaitClock label />
        </p>
      )}
      <MinionInspect />
    </div>
  );
}
