import { lazy, Suspense, useEffect, useState } from "react";

const GameSession = lazy(() => import("./GameSession"));

declare global {
  interface Window {
    __TAVERN_BOOT_DONE?: boolean;
  }
}

export function GameApp() {
  const [booted, setBooted] = useState(
    () => typeof window !== "undefined" && !!window.__TAVERN_BOOT_DONE,
  );

  useEffect(() => {
    if (window.__TAVERN_BOOT_DONE) {
      setBooted(true);
      return;
    }
    const onDone = () => setBooted(true);
    window.addEventListener("tavern-boot-done", onDone);
    return () => window.removeEventListener("tavern-boot-done", onDone);
  }, []);

  useEffect(() => {
    if (!booted) return;
    document.getElementById("cold-boot")?.remove();
  }, [booted]);

  if (!booted) return null;

  return (
    <Suspense fallback={null}>
      <GameSession />
    </Suspense>
  );
}
