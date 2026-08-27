import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function visualSize() {
  const vv = window.visualViewport;
  return {
    w: Math.round(vv?.width ?? window.innerWidth),
    h: Math.round(vv?.height ?? window.innerHeight),
  };
}

function applyViewportVars() {
  const { w, h } = visualSize();
  const root = document.documentElement;
  root.style.setProperty("--vvw", `${w}px`);
  root.style.setProperty("--vvh", `${h}px`);
  const landscape = w > h;
  root.classList.toggle("is-landscape", landscape);
  root.classList.toggle("is-portrait", !landscape);
  return { w, h, landscape };
}

export function PlayStage({ children }: { children: ReactNode }) {
  const [box, setBox] = useState(() =>
    typeof window === "undefined" ? { w: 1280, h: 720, landscape: true } : applyViewportVars(),
  );

  useEffect(() => {
    let timer = 0;
    const sync = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setBox(applyViewportVars()), 16);
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    screen.orientation?.addEventListener("change", sync);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      screen.orientation?.removeEventListener("change", sync);
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
    };
  }, []);

  useEffect(() => {
    const lock = () => {
      const ori = screen.orientation as ScreenOrientation & { lock?: (m: string) => Promise<void> };
      if (typeof ori.lock === "function") void ori.lock("landscape").catch(() => undefined);
    };
    window.addEventListener("pointerup", lock, { once: true });
    return () => window.removeEventListener("pointerup", lock);
  }, []);

  const rotate = !box.landscape;
  const style: CSSProperties = rotate
    ? {
        width: box.h,
        height: box.w,
        top: 0,
        left: box.w,
        transform: "rotate(90deg)",
        transformOrigin: "top left",
      }
    : {
        width: box.w,
        height: box.h,
        top: 0,
        left: 0,
        transform: "none",
        transformOrigin: "top left",
      };

  return (
    <div className="play-frame">
      <div className={cn("play-stage", rotate && "is-rotate")} style={style}>
        {children}
      </div>
    </div>
  );
}
