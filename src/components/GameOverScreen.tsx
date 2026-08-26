import { Crown, RotateCcw } from "lucide-react";
import { useGame } from "@/game/store";
import { HERO_BY_ID, heroArt } from "@/game/heroes";
import { cn } from "@/lib/utils";

export function GameOverScreen() {
  const players = useGame((s) => s.players);
  const youId = useGame((s) => s.youId);
  const startSelect = useGame((s) => s.startSelect);
  const history = useGame((s) => s.history);
  const openReplay = useGame((s) => s.openReplay);
  const you = players.find((p) => p.id === youId);
  const ranked = [...players].sort((a, b) => {
    const pa = a.placement ?? 99;
    const pb = b.placement ?? 99;
    if (pa !== pb) return pa - pb;
    return b.hp - a.hp;
  });
  const place = you?.placement ?? ranked.findIndex((p) => p.id === youId) + 1;
  const title = place === 1 ? "冠军" : `第 ${place} 名`;

  return (
    <div className="tavern-shell flex h-dvh flex-col items-center overflow-y-auto px-4 py-6">
      <div className="panel w-full max-w-lg rounded-2xl p-6">
        <div className="flex flex-col items-center text-center">
          <Crown className={cn("size-10", place === 1 ? "text-gold" : "text-muted")} />
          <h1 className="font-display mt-3 text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted">
            {place === 1 ? "整座酒馆都为你干杯。" : "再来一局，下一次坐上首席。"}
          </p>
        </div>
        <ol className="mt-6 space-y-2">
          {ranked.map((p, i) => {
            const hero = HERO_BY_ID[p.heroId];
            const rank = p.placement ?? i + 1;
            return (
              <li
                key={p.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2",
                  p.id === youId && "border-gold",
                )}
              >
                <span className="tabular w-6 text-center font-semibold text-gold-2">{rank}</span>
                <img
                  src={hero ? heroArt(hero.art) : ""}
                  alt=""
                  className="size-9 rounded-full object-cover object-top"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{p.name}</div>
                  <div className="text-xs text-muted">酒馆 {p.tavernTier} · 三连 {p.triples}</div>
                </div>
                <span className="tabular text-sm text-hp">{p.hp}</span>
              </li>
            );
          })}
        </ol>
        {history.length > 0 && (
          <div className="mt-5">
            <div className="text-xs tracking-wider text-faint">本局战报</div>
            <ul className="mt-2 space-y-1">
              {history.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
                    onClick={() => openReplay(h)}
                  >
                    <span className="truncate text-muted">
                      第 {h.turn} 回合 · {h.oppName}
                      {h.ghost ? " · 残影" : ""}
                    </span>
                    <span
                      className={
                        h.result === "win" ? "text-gold-2" : h.result === "loss" ? "text-hp" : "text-faint"
                      }
                    >
                      {h.result === "win" ? "胜" : h.result === "loss" ? "负" : "平"}
                      {h.damage ? ` ${h.damage}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button type="button" className="action-btn primary mt-6 w-full" onClick={startSelect}>
          <RotateCcw className="size-4" />
          再来一局
        </button>
      </div>
    </div>
  );
}
