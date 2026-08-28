import { RefreshCw, Snowflake, ArrowUpCircle, Flag, Coins, Eye, Sparkles, Heart, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Hud } from "./Hud";
import { LobbyStrip } from "./LobbyStrip";
import { MinionCard } from "./MinionCard";
import { MinionInspect } from "./MinionInspect";
import { Draggable, Droppable, TableDragProvider, useTableDrag, type DragPayload } from "./table-drag";
import { useGame } from "@/game/store";
import { MAX_BOARD, MAX_HAND, defOf } from "@/game/minions";
import { upgradeCostNow, canUseHeroPower } from "@/game/engine";
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
      className={cn("desk-end", hot && "is-rope")}
      disabled={ended}
      onClick={onEnd}
    >
      <Flag className="size-3.5" />
      {ended ? "等待" : "结束"}
      {endsAt ? <span className="end-clock tabular">{left}s</span> : null}
    </button>
  );
}

function BobPortrait({ gold }: { gold: number }) {
  const { drag } = useTableDrag();
  const selling = Boolean(drag && (drag.from === "board" || drag.from === "hand"));
  return (
    <Droppable id="sell" className={cn("desk-portrait is-bob", selling && "is-armed")}>
      <img src="/art/TB_BaconShopBob.jpg" alt="鲍勃" draggable={false} />
      <span className="desk-gold tabular">
        <Coins className="size-3" />
        {gold}
      </span>
      {selling && <span className="desk-tip">卖掉 +1</span>}
    </Droppable>
  );
}

function YouPortrait({
  art,
  name,
  hp,
  armor,
}: {
  art: string;
  name: string;
  hp: number;
  armor: number;
}) {
  const { drag } = useTableDrag();
  const buying = drag?.from === "shop";
  return (
    <Droppable id="buy" className={cn("desk-portrait is-you", buying && "is-armed")}>
      <img src={heroArt(art)} alt={name} draggable={false} />
      <span className="desk-hp tabular">
        <Heart className="size-3" />
        {hp}
        {armor > 0 && (
          <>
            <Shield className="size-3" />
            {armor}
          </>
        )}
      </span>
      {buying && <span className="desk-tip">买进手牌</span>}
    </Droppable>
  );
}

export function TavernScreen() {
  const you = useGame((s) => s.players.find((p) => p.id === s.youId));
  const players = useGame((s) => s.players);
  const selectedHand = useGame((s) => s.selectedHand);
  const buy = useGame((s) => s.buy);
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
  const usePower = useGame((s) => s.usePower);
  const [handOpen, setHandOpen] = useState(false);

  if (!you) return null;
  const frozen = you.shop.some((m) => m.frozen);
  const scout = players.find((p) => p.id === scoutId);
  const costUp = upgradeCostNow(you);
  const hero = HERO_BY_ID[you.heroId];
  const power = hero?.power;
  const canCast = phase === "tavern" && canUseHeroPower(you).ok;

  const onDrop = (payload: DragPayload, drop: string) => {
    if (drop === "sell") {
      if (payload.from === "hand" || payload.from === "board") sell(payload.uid);
      return;
    }
    if (drop === "buy") {
      if (payload.from === "shop") {
        buy(payload.uid);
        setHandOpen(true);
      }
      return;
    }
    if (drop.startsWith("board:")) {
      const index = Number(drop.slice(6));
      if (Number.isNaN(index)) return;
      if (payload.from === "hand") playHand(payload.uid, index);
      else if (payload.from === "board") move(payload.uid, index);
    }
  };

  const preview = (m: { uid: string; defId: string; atk: number; hp: number }) => {
    const d = defOf(m.defId);
    return { uid: m.uid, name: d.name, art: d.art, atk: m.atk, hp: m.hp };
  };

  return (
    <TableDragProvider onDrop={onDrop}>
      <div className="table-shell tavern-shell">
        <LobbyStrip />
        <div className="table-main">
        <div className="table-top">
          <Hud compact />
        </div>

        <div className="tavern-desk">
          <div className="bob-row">
            <button
              type="button"
              className="desk-glyph"
              disabled={endedTurn || you.tavernTier >= 6 || you.gold < costUp}
              onClick={upgrade}
              title={you.tavernTier >= 6 ? "酒馆满级" : `升级到 ${you.tavernTier + 1}`}
            >
              <ArrowUpCircle className="size-4" />
              <span>{you.tavernTier >= 6 ? "T6" : costUp}</span>
            </button>
            <BobPortrait gold={you.gold} />
            <button
              type="button"
              className="desk-glyph"
              disabled={endedTurn || you.gold < 1}
              onClick={refresh}
              title="刷新 1金"
            >
              <RefreshCw className="size-4" />
              <span>1</span>
            </button>
            <button
              type="button"
              className={cn("desk-glyph", frozen && "is-frozen")}
              disabled={endedTurn}
              onClick={freezeAll}
              title={frozen ? "解冻" : "冻结商店"}
            >
              <Snowflake className="size-4" />
            </button>
          </div>

          <section className="table-row shop-row">
            <div className="row-cards">
              {you.shop.length === 0 && <p className="empty-row">刷新</p>}
              {you.shop.map((m) => {
                const p = preview(m);
                return (
                  <Draggable key={m.uid} from="shop" uid={m.uid} name={p.name} art={p.art} atk={p.atk} hp={p.hp}>
                    <MinionCard inst={m} size="md" compact onInspect={() => inspectMinion(m)} />
                  </Draggable>
                );
              })}
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
                      <Draggable from="board" {...preview(m)}>
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

          <div className="you-row">
            {power && (
              <button
                type="button"
                className={cn("desk-glyph hero-power-desk", you.powerUsed && "is-used")}
                disabled={!canCast}
                onClick={usePower}
                title={you.powerUsed ? "本回合已使用" : power.text}
              >
                <Sparkles className="size-4" />
                <span>{you.powerUsed ? "已用" : power.cost}</span>
              </button>
            )}
            <YouPortrait art={hero?.art ?? "HERO_08"} name={you.name} hp={you.hp} armor={you.armor} />
          </div>
        </div>

          <EndTurnButton ended={endedTurn} onEnd={endTurn} />

          <div className={cn("hand-dock", handOpen && "is-open")}>
            <button
              type="button"
              className="hand-toggle"
              onClick={() => setHandOpen((v) => !v)}
              aria-expanded={handOpen}
            >
              手牌 {you.hand.length}/{MAX_HAND}
            </button>
            {handOpen && (
              <div className="hand-tray">
                {you.hand.length === 0 && <p className="empty-row">把商店拖到英雄上购买</p>}
                {you.hand.map((m) => {
                  const p = preview(m);
                  return (
                    <Draggable key={m.uid} from="hand" uid={m.uid} name={p.name} art={p.art} atk={p.atk} hp={p.hp}>
                      <MinionCard
                        inst={m}
                        size="sm"
                        compact
                        selected={selectedHand === m.uid}
                        onInspect={() => inspectMinion(m)}
                        onClick={() => selectHand(selectedHand === m.uid ? null : m.uid)}
                      />
                    </Draggable>
                  );
                })}
              </div>
            )}
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
