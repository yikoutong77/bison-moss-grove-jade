import { useEffect, useState } from "react";
import { PlayStage } from "./PlayStage";
import GameSession from "./GameSession";

declare global {
  interface Window {
    __TAVERN_BOOT_DONE?: boolean;
  }
}

function dismissBoot() {
  document.getElementById("cold-boot")?.remove();
}

export function GameApp() {
  const [booted, setBooted] = useState(
    () => typeof window !== "undefined" && !!window.__TAVERN_BOOT_DONE,
  );

  useEffect(() => {
    const enter = () => {
      setBooted(true);
      dismissBoot();
    };
    if (window.__TAVERN_BOOT_DONE) {
      enter();
      return;
    }
    window.addEventListener("tavern-boot-done", enter);
    const poll = window.setInterval(() => {
      if (window.__TAVERN_BOOT_DONE) enter();
    }, 200);
    const failsafe = window.setTimeout(enter, 6000);
    return () => {
      window.removeEventListener("tavern-boot-done", enter);
      window.clearInterval(poll);
      window.clearTimeout(failsafe);
    };
  }, []);

  useEffect(() => {
    if (booted) dismissBoot();
  }, [booted]);

  if (!booted) return null;

  return (
    <PlayStage>
      <GameSession />
    </PlayStage>
  );
}
