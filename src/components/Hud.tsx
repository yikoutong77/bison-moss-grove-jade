import { Coins, Heart, Layers, Shield, Volume2, VolumeX, CircleHelp, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/store";
import { HERO_BY_ID, heroArt } from "@/game/heroes";
import { canUseHeroPower } from "@/game/engine";
import { cn } from "@/lib/utils";

function TurnClock() {
  const endsAt = useGame((s) => s.tavernEndsAt);
  const ended = useGame((s) => s.endedTurn);
  const rope = useGame((s) => s.rope);
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
  if (!endsAt) return null;
  const hot = rope || left <= 15;
  return (
    <div className={cn("hud-chip tabular", hot && "is-rope")}>
      {ended ? "等待中" : `${left}s`}
    </div>
  );
}

export function Hud({ compact = false }: { compact?: boolean }) {
  const turn = useGame((s) => s.turn);
  const phase = useGame((s) => s.phase);
  const you = useGame((s) => s.players.find((p) => p.id === s.youId));
  const setHelp = useGame((s) => s.setHelp);
  const usePower = useGame((s) => s.usePower);
  if (!you) return null;
  const hero = HERO_BY_ID[you.heroId];
  const power = hero?.power;
  const gate = canUseHeroPower(you);
  const canCast = phase === "tavern" && gate.ok;

  return (
    <header className={cn("hud-bar", compact && "is-compact")}>
      <div className="hud-id flex min-w-0 items-center gap-2">
        <img
          src={hero ? heroArt(hero.art) : ""}
          alt=""
          className="size-9 shrink-0 rounded-full border border-gold object-cover object-top"
        />
        <div className="min-w-0">
          <div className="font-display truncate text-sm font-semibold leading-tight">{you.name}</div>
          <div className="text-[0.65rem] text-muted">第 {turn} 回合</div>
        </div>
      </div>
      {power && (
        <button
          type="button"
          className={cn("hero-power", you.powerUsed && "is-used")}
          disabled={!canCast}
          onClick={usePower}
          title={you.powerUsed ? "本回合已使用" : power.text}
        >
          <Sparkles className="size-3.5 text-gold-2" />
          <span className="leading-tight">
            <span className="block text-[0.68rem] font-semibold">{power.name}</span>
            <span className="block text-[0.6rem] text-muted">
              {you.powerUsed ? "已使用" : `${power.cost} 金`}
            </span>
          </span>
        </button>
      )}
      <div className="flex shrink-0 items-center gap-1.5">
        <div className="hud-chip">
          <Heart className="size-4 text-hp" />
          <span className="tabular font-semibold">{you.hp}</span>
        </div>
        {you.armor > 0 && (
          <div className="hud-chip">
            <Shield className="size-4 text-gold-2" />
            <span className="tabular font-semibold">{you.armor}</span>
          </div>
        )}
        <div className="hud-chip">
          <Coins className="size-4 text-gold" />
          <span className="tabular font-semibold">{you.gold}</span>
        </div>
        <div className="hud-chip">
          <Layers className="size-4 text-gold-2" />
          <span className="tabular font-semibold">T{you.tavernTier}</span>
        </div>
        <TurnClock />
        {you.streak !== 0 && (
          <div className="hud-chip">
            <span className={you.streak > 0 ? "text-gold-2" : "text-hp"}>
              {you.streak > 0 ? `${you.streak}连胜` : `${-you.streak}连败`}
            </span>
          </div>
        )}
        <VolumeMixer />
        <button type="button" className="hud-chip" onClick={() => setHelp(true)} aria-label="帮助">
          <CircleHelp className="size-4" />
        </button>
      </div>
    </header>
  );
}

function VolumeMixer() {
  const muted = useGame((s) => s.muted);
  const setMuted = useGame((s) => s.setMuted);
  const bgmVol = useGame((s) => s.bgmVol);
  const sfxVol = useGame((s) => s.sfxVol);
  const setBgmVol = useGame((s) => s.setBgmVol);
  const setSfxVol = useGame((s) => s.setSfxVol);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const hide = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", hide);
    return () => window.removeEventListener("pointerdown", hide);
  }, [open]);
  return (
    <div ref={box} className="volume-mixer">
      <button
        type="button"
        className="hud-chip"
        onClick={() => setOpen((v) => !v)}
        aria-label={muted ? "打开声音" : "音量"}
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
      {open && (
        <div className="volume-pop">
          <button type="button" className="volume-mute" onClick={() => setMuted(!muted)}>
            {muted ? "取消静音" : "静音"}
          </button>
          <label>
            音乐
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(bgmVol * 100)}
              onChange={(e) => {
                setMuted(false);
                setBgmVol(Number(e.target.value) / 100);
              }}
            />
          </label>
          <label>
            音效
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(sfxVol * 100)}
              onChange={(e) => {
                setMuted(false);
                setSfxVol(Number(e.target.value) / 100);
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
