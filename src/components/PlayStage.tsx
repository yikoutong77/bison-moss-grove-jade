import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Mode = "fill" | "rotate" | "letterbox";

interface StageBox {
  mode: Mode;
  width: number;
  height: number;
}

function isTouchPhone() {
  return window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(hover: none)").matches;
}

function measure(): StageBox {
  const vv = window.visualViewport;
  const vw = Math.round(vv?.width ?? window.innerWidth);
  const vh = Math.round(vv?.height ?? window.innerHeight);
  if (vw >= vh) {
    return { mode: "fill", width: vw, height: vh };
  }
  if (isTouchPhone()) {
    return { mode: "rotate", width: vh, height: vw };
  }
  const aspect = 16 / 9;
  let width = vw;
  let height = Math.round(vw / aspect);
  if (height > vh * 0.9) {
    height = Math.round(vh * 0.9);
    width = Math.round(height * aspect);
  }
  return { mode: "letterbox", width, height };
}

export function PlayStage({ children }: { children: ReactNode }) {
  const [box, setBox] = useState<StageBox>(() =>
    typeof window === "undefined" ? { mode: "fill", width: 1280, height: 720 } : measure(),
  );

  useEffect(() => {
    const apply = () => setBox(measure());
    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
    };
  }, []);

  useEffect(() => {
    const lock = () => {
      const ori = screen.orientation as ScreenOrientation & { lock?: (m: string) => Promise<void> };
      if (ori && typeof ori.lock === "function") {
        void ori.lock("landscape").catch(() => undefined);
      }
    };
    window.addEventListener("pointerdown", lock);
    return () => window.removeEventListener("pointerdown", lock);
  }, []);

  const style: CSSProperties =
    box.mode === "rotate"
      ? {
          width: box.width,
          height: box.height,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(90deg)",
        }
      : box.mode === "letterbox"
        ? {
            width: box.width,
            height: box.height,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }
        : {
            width: box.width,
            height: box.height,
            top: 0,
            left: 0,
          };

  return (
    <div className={cn("play-frame", box.mode === "letterbox" && "is-letterbox")}>
      {box.mode === "rotate" && (
        <div className="rotate-cue" aria-hidden>
          将手机横过来游玩
        </div>
      )}
      <div className={cn("play-stage", `is-${box.mode}`)} style={style}>
        {children}
      </div>
    </div>
  );
}
