import { useEffect } from "react";
import { useGame } from "@/game/store";
import { StartScreen } from "./StartScreen";
import { HeroSelect } from "./HeroSelect";
import { TavernScreen } from "./TavernScreen";
import { CombatScreen } from "./CombatScreen";
import { GameOverScreen } from "./GameOverScreen";
import { HelpOverlay } from "./HelpOverlay";
import { FightReplay } from "./FightReplay";
import { unlockAudio } from "@/game/audio";

export default function GameSession() {
  const phase = useGame((s) => s.phase);
  const toast = useGame((s) => s.toast);
  const setToast = useGame((s) => s.setToast);

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    const vis = () => {
      if (document.visibilityState === "visible") unlockAudio();
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast, setToast]);

  return (
    <div className="h-dvh overflow-hidden bg-bg text-fg">
      {phase === "menu" && <StartScreen />}
      {phase === "hero-select" && <HeroSelect />}
      {(phase === "tavern" || phase === "discover") && <TavernScreen />}
      {(phase === "matchup" || phase === "combat" || phase === "result") && <CombatScreen />}
      {phase === "gameover" && <GameOverScreen />}
      <HelpOverlay />
      <FightReplay />
    </div>
  );
}
