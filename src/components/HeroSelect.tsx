import { Shield } from "lucide-react";
import { useGame } from "@/game/store";
import { HEROES, heroArt } from "@/game/heroes";

export function HeroSelect() {
  const pickHero = useGame((s) => s.pickHero);
  const choices = useGame((s) => s.heroChoices);
  const heroes = choices.length ? choices : HEROES.slice(0, 4);

  return (
    <div className="tavern-shell h-full overflow-y-auto px-4 py-4 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-sm tracking-[0.2em] text-gold-2">本局英雄</p>
        <h2 className="font-display mt-2 text-center text-3xl font-bold">四选一，坐镇酒馆</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted">
          每位英雄拥有独特技能。有的带护甲，有的换经济，有的强化场面。
        </p>
        <div className="mt-6 grid grid-cols-4 gap-3">
          {heroes.map((h, i) => (
            <button
              key={h.id}
              type="button"
              onClick={() => pickHero(h.id)}
              className="group overflow-hidden rounded-xl border border-border bg-surface text-left shadow-panel transition-transform duration-150 ease-out hover:-translate-y-1 active:scale-[0.96]"
              style={{ animation: `pop-in 400ms ease backwards ${i * 40}ms` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={heroArt(h.art)}
                  alt={h.name}
                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
                {h.armor > 0 && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-border bg-surface/85 px-2 py-0.5 text-[0.65rem] font-semibold text-gold-2">
                    <Shield className="size-3" />
                    {h.armor}
                  </span>
                )}
              </div>
              <div className="px-3 py-2">
                <div className="font-display text-base font-semibold">{h.name}</div>
                <div className="text-[0.7rem] text-gold-2">
                  {h.power.name} · {h.power.cost} 金
                </div>
                <p className="mt-1 line-clamp-3 text-[0.68rem] leading-snug text-muted">{h.power.text}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
