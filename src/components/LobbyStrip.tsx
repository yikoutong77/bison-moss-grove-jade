import { useState } from "react";
import { useGame } from "@/game/store";
import { HERO_BY_ID, heroArt } from "@/game/heroes";
import { cn } from "@/lib/utils";

function streakLabel(n: number): string | null {
  if (n > 1) return `${n}连胜`;
  if (n < -1) return `${-n}连败`;
  if (n === 1) return "上轮胜";
  if (n === -1) return "上轮负";
  return null;
}

export function LobbyStrip() {
  const players = useGame((s) => s.players);
  const youId = useGame((s) => s.youId);
  const last = useGame((s) => s.lastOpponent);
  const scoutId = useGame((s) => s.scoutId);
  const openScout = useGame((s) => s.openScout);
  const history = useGame((s) => s.history);
  const openReplay = useGame((s) => s.openReplay);
  const [showHistory, setShowHistory] = useState(false);

  const living = [...players].filter((p) => p.alive).sort((a, b) => b.hp - a.hp);
  const ranked = [...players].sort((a, b) => {
    if (a.alive !== b.alive) return a.alive ? -1 : 1;
    if (a.alive) return b.hp - a.hp;
    return (a.placement ?? 99) - (b.placement ?? 99);
  });

  return (
    <div className="orb-rail">
      {ranked.map((p) => {
        const hero = HERO_BY_ID[p.heroId];
        const rank = p.alive ? living.findIndex((x) => x.id === p.id) + 1 : p.placement ?? 8;
        const streak = streakLabel(p.streak);
        const hpPct = Math.max(0, Math.min(100, (p.hp / 30) * 100));
        return (
          <button
            key={p.id}
            type="button"
            title={`${p.name} · ${p.alive ? `${p.hp}生命` : "出局"}${streak ? ` · ${streak}` : ""}`}
            onClick={() => openScout(scoutId === p.id ? null : p.id)}
            className={cn(
              "hero-orb",
              !p.alive && "is-dead",
              p.id === youId && "is-you",
              p.id === last && "is-last",
              scoutId === p.id && "is-scout",
            )}
          >
            <span className="hero-orb-rank">{rank}</span>
            <img src={hero ? heroArt(hero.art) : ""} alt="" />
            <span className={cn("hero-orb-hp tabular", !p.alive && "is-out")}>
              {p.alive ? p.hp + (p.armor > 0 ? `+${p.armor}` : "") : "出局"}
            </span>
            <span className="hero-orb-bar" style={{ width: `${p.alive ? hpPct : 0}%` }} />
          </button>
        );
      })}
      {history.length > 0 && (
        <div className="relative">
          <button
            type="button"
            className="hero-orb history-orb"
            onClick={() => setShowHistory((v) => !v)}
          >
            <span className="hero-orb-rank">报</span>
            <span className="hero-orb-hp">战报</span>
          </button>
          {showHistory && (
            <ul className="history-pop">
              {history.slice(-4).reverse().map((h, i) => (
                <li key={h.id ?? `${h.turn}-${i}`}>
                  <button
                    type="button"
                    className="flex w-full justify-between gap-2 text-left text-xs"
                    onClick={() => {
                      openReplay(h);
                      setShowHistory(false);
                    }}
                  >
                    <span className="truncate text-muted">
                      T{h.turn} {h.oppName}
                    </span>
                    <span
                      className={
                        h.result === "win" ? "text-gold-2" : h.result === "loss" ? "text-hp" : "text-faint"
                      }
                    >
                      {h.result === "win" ? "胜" : h.result === "loss" ? "负" : "平"}
                      {h.damage ? h.damage : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
