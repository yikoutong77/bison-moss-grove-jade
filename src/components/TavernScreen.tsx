import { RefreshCw, Snowflake, ArrowUpCircle, Flag, Coins, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { Hud } from "./Hud";
import { LobbyStrip } from "./LobbyStrip";
import { MinionCard } from "./MinionCard";
import { MinionInspect } from "./MinionInspect";
import { Draggable, Droppable, TableDragProvider, useTableDrag, type DragPayload } from "./table-drag";
import { useGame } from "@/game/store";
import { MAX_BOARD, defOf } from "@/game/minions";
import { upgradeCostNow } from "@/game/engine";
import { HERO_BY_ID, heroArt } from "@/game/heroes";
import { cn } from "@/lib/utils";

function EndTurnButton({ ended, onEnd }: { ended: boolean; onEnd: () => void }) {
  const endsAt = useGame((s) => s.tavernEndsAt);
  const rope = useGame((s) => s.rope);
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!endsAt) {
      setLeft(0);
      return;
    }
    const tick = () => setLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [endsAt]);
  const hot = Boolean(endsAt && (rope || left <= 15));
  return (
    <button
      type="button"
      className={cn("action-btn primary bob-btn end-turn", hot && "is-rope")}
      disabled={ended}
      onClick={onEnd}
    >
      <Flag className="size-3.5" />
      {ended ? "等待" : "结束"}
      {endsAt ? <span className="end-clock tabular">{left}s</span> : null}
    </button>
  );
}

function BobSeller({ gold }: { gold: number }) {
  const { drag } = useTableDrag();
  const selling = Boolean(drag && (drag.from === "board" || drag.from === "hand"));
  return (
    <Droppable id="sell" className={cn("bob-face", selling && "is-armed")}>
      <div className="bob-name font-display">鲍勃</div>
      <div className="bob-gold tabular">
        <Coins className="size-3.5" />
        {gold}
      </div>
      {selling && <span className="bob-sell-tip">卖掉 +1</span>}
    </Droppable>
  );
}

export function TavernScreen() {
  const you = useGame((s) => s.players.find((p) => p.id === s.youId));
  const players = useGame((s) => s.players);
  const selectedHand = useGame((s) => s.selectedHand);
  const buy = useGame((s) => s.buy);
  const buyToBoard = useGame((s) => s.buyToBoard);
  const playHand = useGame((s) => s.playHand);
  const sell = useGame((s) => s.sell);
  const refresh = useGame((s) => s.refresh);
  const freezeAll = useGame((s) => s.freezeAll);
  const upgrade = useGame((s) => s.upgrade);
  const endTurn = useGame((s) => s.endTurn);
  const selectHand = useGame((s) => s.selectHand);
  const move = useGame((s) => s.move);
  const toast = useGame((s) => s.toast);
  const phase = useGame((s) => s.phase);
  const discover = useGame((s) => s.discover);
  const pickDiscover = useGame((s) => s.pickDiscover);
  const skipDiscover = useGame((s) => s.skipDiscover);
  const inspectMinion = useGame((s) => s.inspectMinion);
  const scoutId = useGame((s) => s.scoutId);
  const openScout = useGame((s) => s.openScout);
  const endedTurn = useGame((s) => s.endedTurn);

  if (!you) return null;
  const frozen = you.shop.some((m) => m.frozen);
  const scout = players.find((p) => p.id === scoutId);
  const costUp = upgradeCostNow(you);

  const onDrop = (payload: DragPayload, drop: string) => {
    if (drop === "sell") {
      if (payload.from === "hand" || payload.from === "board") sell(payload.uid);
      return;
    }
    if (drop === "hand") {
      if (payload.from === "shop") buy(payload.uid);
      return;
    }
    if (drop.startsWith("board:")) {
      const index = Number(drop.slice(6));
      if (Number.isNaN(index)) return;
      if (payload.from === "shop") buyToBoard(payload.uid, index);
      else if (payload.from === "hand") playHand(payload.uid, index);
      else move(payload.uid, index);
    }
  };

  return (
    <TableDragProvider onDrop={onDrop}>
      <div className="table-shell tavern-shell">
        <div className="table-top">
          <LobbyStrip />
          <Hud compact />
        </div>

        <div className="table-main">
          <aside className="bob-panel">
            <BobSeller gold={you.gold} />
            <button type="button" className="action-btn bob-btn" disabled={endedTurn || you.gold < 1} onClick={refresh} title="刷新 1金">
              <RefreshCw className="size-3.5" />
              1
            </button>
            <button type="button" className={cn("action-btn bob-btn", frozen && "is-frozen")} disabled={endedTurn} onClick={freezeAll} title={frozen ? "解冻" : "冻结商店"}>
              <Snowflake className="size-3.5" />
            </button>
            <button
              type="button"
              className="action-btn gold bob-btn"
              disabled={endedTurn || you.tavernTier >= 6 || you.gold < costUp}
              onClick={upgrade}
              title={you.tavernTier >= 6 ? "酒馆满级" : `升级到 ${you.tavernTier + 1}`}
            >
              <ArrowUpCircle className="size-3.5" />
              {you.tavernTier >= 6 ? "T6" : costUp}
            </button>
            <EndTurnButton ended={endedTurn} onEnd={endTurn} />
          </aside>

          <div className="table-field">
            <section className="table-row shop-row">
              <div className="row-cards">
                {you.shop.length === 0 && <p className="empty-row">刷新</p>}
                {you.shop.map((m) => (
                  <Draggable
                    key={m.uid}
                    from="shop"
                    uid={m.uid}
                    name={defOf(m.defId).name}
                    art={defOf(m.defId).art}
                    atk={m.atk}
                    hp={m.hp}
                  >
                    <MinionCard
                      inst={m}
                      size="md"
                      compact
                      onInspect={() => inspectMinion(m)}
                      onClick={() => buy(m.uid)}
                    />
                  </Draggable>
                ))}
              </div>
            </section>

            <section className="table-row board-row">
              <div className="row-cards">
                {Array.from({ length: MAX_BOARD }).map((_, i) => {
                  const m = you.board[i];
                  return (
                    <Droppable
                      key={m?.uid ?? `slot-${i}`}
                      id={`board:${i}`}
                      className={cn("slot table-slot", m && "is-filled", selectedHand && !m && "is-play")}
                    >
                      {m ? (
                        <Draggable
                          from="board"
                          uid={m.uid}
                          name={defOf(m.defId).name}
                          art={defOf(m.defId).art}
                          atk={m.atk}
                          hp={m.hp}
                        >
                          <MinionCard
                            inst={m}
                            size="md"
                            compact
                            onInspect={() => inspectMinion(m)}
                            onClick={() => {
                              if (selectedHand) playHand(selectedHand, i);
                            }}
                          />
                        </Draggable>
                      ) : (
                        <button
                          type="button"
                          className="slot-hit"
                          aria-label={`空位 ${i + 1}`}
                          onClick={() => {
                            if (selectedHand) playHand(selectedHand, i);
                          }}
                        />
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </section>

            <section className="table-row hand-row">
              <Droppable id="hand" className={cn("row-cards hand-drop", you.hand.length === 0 && "is-empty")}>
                {you.hand.map((m) => (
                  <Draggable
                    key={m.uid}
                    from="hand"
                    uid={m.uid}
                    name={defOf(m.defId).name}
                    art={defOf(m.defId).art}
                    atk={m.atk}
                    hp={m.hp}
                  >
                    <MinionCard
                      inst={m}
                      size="sm"
                      compact
                      selected={selectedHand === m.uid}
                      onInspect={() => inspectMinion(m)}
                      onClick={() => selectHand(selectedHand === m.uid ? null : m.uid)}
                    />
                  </Draggable>
                ))}
              </Droppable>
            </section>
          </div>
        </div>

        {toast && (
          <div className="pointer-events-none fixed left-1/2 top-14 z-20 -translate-x-1/2 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm shadow-panel">
            {toast}
          </div>
        )}

        {scout && (
          <div className="fixed inset-0 z-30 grid place-items-center bg-bg-deep/55 p-3" onClick={() => openScout(null)}>
            <div className="panel w-full max-w-lg rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-gold-2" />
                <img
                  src={heroArt(HERO_BY_ID[scout.heroId]?.art ?? "HERO_08")}
                  alt=""
                  className="size-8 rounded-full object-cover object-top"
                />
                <div>
                  <div className="font-display font-semibold">{scout.name}</div>
                  <div className="text-xs text-muted">
                    生命 {scout.hp}
                    {scout.armor > 0 ? ` · 护甲 ${scout.armor}` : ""}
                    {" · "}酒馆 {scout.tavernTier} · {scout.board.length} 随从
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-center gap-2 overflow-x-auto">
                {scout.board.length === 0 && <p className="py-6 text-sm text-muted">还没有随从。</p>}
                {scout.board.map((m) => (
                  <MinionCard key={m.uid} inst={m} size="sm" compact onInspect={() => inspectMinion(m)} />
                ))}
              </div>
              <button type="button" className="action-btn mt-4 w-full" onClick={() => openScout(null)}>
                关闭
              </button>
            </div>
          </div>
        )}

        {phase === "discover" && (
          <div className="fixed inset-0 z-30 grid place-items-center bg-bg-deep/70 p-4">
            <div className="panel w-full max-w-xl rounded-2xl p-5">
              <h3 className="font-display text-center text-xl font-semibold">三连发现</h3>
              <p className="mt-1 text-center text-sm text-muted">从更高一级的随从中挑选一只加入手牌。</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {discover.map((m) => (
                  <MinionCard
                    key={m.uid}
                    inst={m}
                    size="md"
                    onInspect={() => inspectMinion(m)}
                    onClick={() => pickDiscover(m.defId)}
                  />
                ))}
              </div>
              <button type="button" className="action-btn mx-auto mt-5 block" onClick={skipDiscover}>
                放弃发现
              </button>
            </div>
          </div>
        )}

        <MinionInspect />
      </div>
    </TableDragProvider>
  );
}
