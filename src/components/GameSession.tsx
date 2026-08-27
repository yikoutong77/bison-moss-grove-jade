import { useEffect } from "react";
import { useGame } from "@/game/store";
import { StartScreen } from "./StartScreen";
import { LobbyScreen } from "./LobbyScreen";
import { HeroSelect } from "./HeroSelect";
import { TavernScreen } from "./TavernScreen";
import { CombatScreen } from "./CombatScreen";
import { GameOverScreen } from "./GameOverScreen";
import { HelpOverlay } from "./HelpOverlay";
import { FightReplay } from "./FightReplay";
import { unlockAudio, playBgm, restoreMute } from "@/game/audio";
import { onServer } from "@/net/client";

export default function GameSession() {
  const phase = useGame((s) => s.phase);
  const toast = useGame((s) => s.toast);
  const setToast = useGame((s) => s.setToast);
  const applyNet = useGame((s) => s.applyNet);

  useEffect(() => {
    if (restoreMute()) useGame.getState().setMuted(true);
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
    if (phase === "tavern" || phase === "discover") playBgm("tavern");
    else if (phase === "matchup" || phase === "combat" || phase === "result") playBgm("combat");
    else playBgm("menu");
  }, [phase]);

  useEffect(() => onServer(applyNet), [applyNet]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast, setToast]);

  return (
    <div className="session-root">
      {phase === "menu" && <StartScreen />}
      {phase === "lobby" && <LobbyScreen />}
      {phase === "hero-select" && <HeroSelect />}
      {(phase === "tavern" || phase === "discover") && <TavernScreen />}
      {(phase === "matchup" || phase === "combat" || phase === "result") && <CombatScreen />}
      {phase === "gameover" && <GameOverScreen />}
      <HelpOverlay />
      <FightReplay />
    </div>
  );
}
