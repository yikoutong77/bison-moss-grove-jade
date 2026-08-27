import { RefreshCw, Snowflake, ArrowUpCircle, Flag, Coins, Eye } from "lucide-react";
import { Hud } from "./Hud";
import { LobbyStrip } from "./LobbyStrip";
import { MinionCard } from "./MinionCard";
import { MinionInspect } from "./MinionInspect";
import { BurningRope } from "./BurningRope";
import { Draggable, Droppable, TableDragProvider, useTableDrag, type DragPayload } from "./table-drag";
import { useGame } from "@/game/store";
import { MAX_BOARD, MAX_HAND, TRIBE_LABEL, defOf } from "@/game/minions";
import { buyCost, upgradeCostNow } from "@/game/engine";
import { HERO_BY_ID, heroArt } from "@/game/heroes";
import { cn } from "@/lib/utils";

function SellWell({ canClickSell, onSell }: { canClickSell: boolean; onSell: () => void }) {
  const { drag } = useTableDrag();
  const armed = Boolean(drag && (drag.from === "board" || drag.from === "hand")) || canClickSell;
  return (
    <Droppable id="sell" className={cn("bob-sell", armed && "is-armed")}>
      <Coins className="size-4 text-gold" />
      <span>{armed && drag ? "松手卖掉 +1" : "出售 +1"}</span>
      {canClickSell && (
        <button type="button" className="action-btn gold mt-1 w-full" onClick={onSell}>
          卖掉选中
        </button>
      )}
    </Droppable>
  );
}

export function TavernScreen() {
  const you = useGame((s) => s.players.find((p) => p.id === s.youId));
  const players = useGame((s) => s.players);
  const selectedShop = useGame((s) => s.selectedShop);
  const selectedBoard = useGame((s) => s.selectedBoard);
  const selectedHand = useGame((s) => s.selectedHand);
  const buy = useGame((s) => s.buy);
  const buyToBoard = useGame((s) => s.buyToBoard);
  const playHand = useGame((s) => s.playHand);
  const sell = useGame((s) => s.sell);
  const refresh = useGame((s) => s.refresh);
  const freezeAll = useGame((s) => s.freezeAll);
  const freezeSlot = useGame((s) => s.freezeSlot);
  const upgrade = useGame((s) => s.upgrade);
  const endTurn = useGame((s) => s.endTurn);
  const selectShop = useGame((s) => s.selectShop);
  const selectBoard = useGame((s) => s.selectBoard);
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
  const costBuy = buyCost(you);
  const costUp = upgradeCostNow(you);
  const tribes = Object.entries(
    you.board.reduce<Record<string, number>>((acc, m) => {
      const t = TRIBE_LABEL[defOf(m.defId).tribe];
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([t, n]) => `${t}${n}`)
    .join(" ");

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
            <div className="bob-face">
              <div className="bob-name font-display">鲍勃</div>
              <p className="bob-hint">拖到这里卖掉</p>
            </div>
            <SellWell
              canClickSell={Boolean(selectedBoard || selectedHand)}
              onSell={() => sell(selectedBoard ?? selectedHand!)}
            />
            <button type="button" className="action-btn bob-btn" disabled={endedTurn || you.gold < 1} onClick={refresh}>
              <RefreshCw className="size-3.5" />
              刷新 · 1
            </button>
            <button type="button" className={cn("action-btn bob-btn", frozen && "text-ice")} disabled={endedTurn} onClick={freezeAll}>
              <Snowflake className="size-3.5" />
              {frozen ? "解冻" : "冻结"}
            </button>
            <button
              type="button"
              className="action-btn gold bob-btn"
              disabled={endedTurn || you.tavernTier >= 6 || you.gold < costUp}
              onClick={upgrade}
            >
              <ArrowUpCircle className="size-3.5" />
              {you.tavernTier >= 6 ? "满级" : `升级 · ${costUp}`}
            </button>
            <button type="button" className="action-btn primary bob-btn end-turn" disabled={endedTurn} onClick={endTurn}>
              <Flag className="size-3.5" />
              {endedTurn ? "等待中" : "结束回合"}
            </button>
          </aside>

          <div className="table-field">
            <section className="table-row shop-row">
              <div className="row-label">
                酒馆 · {costBuy}金
              </div>
              <div className="row-cards">
                {you.shop.length === 0 && <p className="empty-row">刷新寻找随从</p>}
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
                      selected={selectedShop === m.uid}
                      showFreeze
                      onFreeze={() => freezeSlot(m.uid)}
                      onInspect={() => inspectMinion(m)}
                      onClick={() => {
                        if (you.gold >= costBuy && you.hand.length < MAX_HAND) buy(m.uid);
                        else selectShop(m.uid);
                      }}
                    />
                  </Draggable>
                ))}
              </div>
            </section>

            <section className="table-row board-row">
              <div className="row-label">
                战场 {you.board.length}/{MAX_BOARD}
                {tribes ? ` · ${tribes}` : ""}
              </div>
              <div className="row-cards">
                {Array.from({ length: MAX_BOARD }).map((_, i) => {
                  const m = you.board[i];
                  return (
                    <Droppable
                      key={m?.uid ?? `slot-${i}`}
                      id={`board:${i}`}
                      className={cn("slot table-slot", selectedHand && !m && "ring-2 ring-gold/60")}
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
                            selected={selectedBoard === m.uid}
                            onInspect={() => inspectMinion(m)}
                            onClick={() => {
                              if (selectedHand) playHand(selectedHand, i);
                              else if (selectedShop) buyToBoard(selectedShop, i);
                              else if (selectedBoard && selectedBoard !== m.uid) {
                                const from = you.board.findIndex((x) => x.uid === selectedBoard);
                                if (from >= 0) move(selectedBoard, i);
                              } else {
                                selectBoard(selectedBoard === m.uid ? null : m.uid);
                              }
                            }}
                          />
                        </Draggable>
                      ) : (
                        <button
                          type="button"
                          className="grid size-full place-items-center text-[0.65rem] text-faint"
                          onClick={() => {
                            if (selectedHand) playHand(selectedHand, i);
                            else if (selectedShop) buyToBoard(selectedShop, i);
                          }}
                        >
                          {i + 1}
                        </button>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </section>

            <section className="table-row hand-row">
              <div className="row-label">
                手牌 {you.hand.length}/{MAX_HAND}
              </div>
              <Droppable id="hand" className="row-cards hand-drop">
                {you.hand.length === 0 && <p className="empty-row">拖酒馆随从到这里购买，或点一下直接买</p>}
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
        <BurningRope />
      </div>
    </TableDragProvider>
  );
}
