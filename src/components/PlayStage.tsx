import { useEffect, type ReactNode } from "react";

function syncViewport() {
  const vv = window.visualViewport;
  const w = Math.round(vv?.width ?? window.innerWidth);
  const h = Math.round(vv?.height ?? window.innerHeight);
  const root = document.documentElement;
  root.style.setProperty("--vvw", `${w}px`);
  root.style.setProperty("--vvh", `${h}px`);
  root.classList.toggle("is-landscape", w > h);
  root.classList.toggle("is-portrait", h >= w);
}

export function PlayStage({ children }: { children: ReactNode }) {
  useEffect(() => {
    syncViewport();
    window.addEventListener("resize", syncViewport);
    window.addEventListener("orientationchange", syncViewport);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", syncViewport);
    vv?.addEventListener("scroll", syncViewport);
    return () => {
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("orientationchange", syncViewport);
      vv?.removeEventListener("resize", syncViewport);
      vv?.removeEventListener("scroll", syncViewport);
    };
  }, []);

  return <div className="play-stage">{children}</div>;
}
