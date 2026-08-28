import { Shield } from "lucide-react";
import { useGame } from "@/game/store";
import { HEROES, heroArt } from "@/game/heroes";
import { ExitGame } from "./ExitGame";

export function HeroSelect() {
  const pickHero = useGame((s) => s.pickHero);
  const choices = useGame((s) => s.heroChoices);
  const heroes = choices.length ? choices : HEROES.slice(0, 4);

  return (
    <div className="tavern-shell relative h-full overflow-hidden px-4 py-3 sm:px-8">
      <div className="absolute right-3 top-3 z-10">
        <ExitGame />
      </div>
      <div className="mx-auto flex h-full max-w-5xl flex-col">
        <p className="text-center text-sm tracking-[0.2em] text-gold-2">本局英雄</p>
        <h2 className="font-display mt-1 text-center text-2xl font-bold">四选一，坐镇酒馆</h2>
        <div className="hero-pick-row">
          {heroes.map((h, i) => (
            <button
              key={h.id}
              type="button"
              onClick={() => pickHero(h.id)}
              className="hero-pick"
              style={{ animation: `pop-in 400ms ease backwards ${i * 40}ms` }}
            >
              <span className="hero-pick-face">
                <img
                  src={heroArt(h.art)}
                  alt={h.name}
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.style.opacity = "0";
                  }}
                />
                {h.armor > 0 && (
                  <span className="hero-pick-armor">
                    <Shield className="size-3" />
                    {h.armor}
                  </span>
                )}
              </span>
              <span className="hero-pick-name font-display">{h.name}</span>
              <span className="hero-pick-power">
                {h.power.name} · {h.power.cost}金
              </span>
              <span className="hero-pick-text">{h.power.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
