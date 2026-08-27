import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { artUrl } from "@/game/minions";

export type DragFrom = "shop" | "hand" | "board";

export interface DragPayload {
  uid: string;
  from: DragFrom;
  name?: string;
  art?: string;
  atk?: number;
  hp?: number;
}

interface DragLive extends DragPayload {
  x: number;
  y: number;
}

interface Ctx {
  drag: DragLive | null;
  begin: (payload: DragPayload, e: ReactPointerEvent) => void;
  over: string | null;
}

const TableDragCtx = createContext<Ctx | null>(null);

export function useTableDrag() {
  const ctx = useContext(TableDragCtx);
  if (!ctx) throw new Error("useTableDrag outside provider");
  return ctx;
}

export function useOptionalTableDrag() {
  return useContext(TableDragCtx);
}

export function TableDragProvider({
  onDrop,
  children,
}: {
  onDrop: (payload: DragPayload, drop: string) => void;
  children: ReactNode;
}) {
  const [drag, setDrag] = useState<DragLive | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const startRef = useRef<{ x: number; y: number; payload: DragPayload } | null>(null);
  const draggingRef = useRef(false);
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  const hitDrop = (x: number, y: number) => {
    const stack = document.elementsFromPoint(x, y);
    for (const el of stack) {
      if (!(el instanceof HTMLElement)) continue;
      const id = el.dataset.drop ?? el.closest("[data-drop]")?.getAttribute("data-drop");
      if (id) return id;
    }
    return null;
  };

  const begin = useCallback((payload: DragPayload, e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    startRef.current = { x: e.clientX, y: e.clientY, payload };
    draggingRef.current = false;
    const target = e.currentTarget as HTMLElement;
    const move = (ev: PointerEvent) => {
      const start = startRef.current;
      if (!start) return;
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (!draggingRef.current) {
        if (Math.hypot(dx, dy) < 8) return;
        draggingRef.current = true;
        try {
          target.setPointerCapture(ev.pointerId);
        } catch {
          /* ignore */
        }
      }
      setDrag({ ...start.payload, x: ev.clientX, y: ev.clientY });
      setOver(hitDrop(ev.clientX, ev.clientY));
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const start = startRef.current;
      startRef.current = null;
      const wasDrag = draggingRef.current;
      draggingRef.current = false;
      setDrag(null);
      setOver(null);
      if (!wasDrag || !start) return;
      const drop = hitDrop(ev.clientX, ev.clientY);
      if (drop) onDropRef.current(start.payload, drop);
      const block = (ce: Event) => {
        ce.preventDefault();
        ce.stopPropagation();
      };
      target.addEventListener("click", block, { capture: true, once: true });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }, []);

  const value = useMemo(() => ({ drag, begin, over }), [drag, begin, over]);
  const verb = drag?.from === "shop" ? "购买" : drag?.from === "hand" ? "上场" : "移动";

  return (
    <TableDragCtx.Provider value={value}>
      {children}
      {drag &&
        createPortal(
          <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}>
            {drag.art ? (
              <div className="drag-ghost-face">
                <img src={artUrl(drag.art)} alt="" draggable={false} />
                <span className="drag-ghost-stats">
                  {drag.atk}/{drag.hp}
                </span>
              </div>
            ) : (
              <span>{verb}</span>
            )}
            <span className="drag-ghost-tag">{over === "sell" ? "卖掉" : verb}</span>
          </div>,
          document.body,
        )}
    </TableDragCtx.Provider>
  );
}

export function Draggable({
  from,
  uid,
  name,
  art,
  atk,
  hp,
  className,
  children,
}: {
  from: DragFrom;
  uid: string;
  name?: string;
  art?: string;
  atk?: number;
  hp?: number;
  className?: string;
  children: ReactNode;
}) {
  const { begin, drag } = useTableDrag();
  return (
    <div
      className={cn(className, drag?.uid === uid && "is-lifting")}
      onPointerDown={(e) => begin({ from, uid, name, art, atk, hp }, e)}
      style={{ touchAction: "none" }}
    >
      {children}
    </div>
  );
}

export function Droppable({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const { over } = useTableDrag();
  return (
    <div data-drop={id} className={cn(className, over === id && "is-drop-hot")}>
      {children}
    </div>
  );
}
