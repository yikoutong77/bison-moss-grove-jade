import { createGame } from "./game.js";

const g = createGame();
const app = document.getElementById("app");

function cardHTML(m, extra = "") {
  const d = g.defOf(m);
  const kws = (m.kw || []).slice(0, 2).map((k) => g.KW[k]).filter(Boolean);
  const hue = d.hue || 30;
  return `<button type="button" class="card ${m.golden ? "gold" : ""} ${m.frozen ? "frozen" : ""} ${(m.kw || []).includes("taunt") ? "taunt" : ""} ${extra}" data-uid="${m.uid}">
    <div class="portrait" style="background:linear-gradient(160deg,hsl(${hue} 45% 28%),hsl(${hue} 50% 14%))">${d.name.slice(0, 1)}</div>
    <span class="kw">${d.t}★</span>
    <div class="nm">${d.name}${m.golden ? "·金" : ""}</div>
    <span class="orb a">${m.atk}</span>
    <span class="orb h">${m.hp}</span>
    <footer>${g.TRIBE[d.tribe] || ""}${kws.length ? " · " + kws.join(" ") : ""}</footer>
  </button>`;
}

function hud(p) {
  const h = g.HEROES.find((x) => x.id === p.heroId);
  return `<header class="hud">
    <div>
      <div class="hero-name">${p.name}</div>
      <div class="hint">第 ${g.state.turn} 回合</div>
    </div>
    <button class="chip" ${g.state.phase !== "tavern" || p.powerUsed ? "disabled" : ""} data-act="power" title="${h.text}">
      ${h.power}<br/><span class="hint">${p.powerUsed ? "已使用" : h.cost + " 金"}</span>
    </button>
    <span class="chip">♥ ${p.hp}</span>
    ${p.armor ? `<span class="chip">甲 ${p.armor}</span>` : ""}
    <span class="chip">金 ${p.gold}</span>
    <span class="chip">酒馆 ${p.tavern}</span>
    ${p.streak ? `<span class="chip">${p.streak > 0 ? p.streak + "连胜" : -p.streak + "连败"}</span>` : ""}
  </header>`;
}

function lobby() {
  const living = g.state.players.filter((p) => p.alive).sort((a, b) => b.hp - a.hp);
  return `<div class="lobby">${g.state.players.map((p) => {
    const rank = p.alive ? living.findIndex((x) => x.id === p.id) + 1 : p.place || 8;
    return `<div class="lp ${p.id === "you" ? "you" : ""} ${p.alive ? "" : "dead"}">
      <b>${rank}</b>
      <div><div>${p.name}</div><div class="hint">${p.alive ? p.hp + (p.armor ? "+" + p.armor : "") : "出局"} · T${p.tavern} · ${p.board.length}随从</div></div>
    </div>`;
  }).join("")}</div>`;
}

function tavernView() {
  const p = g.you();
  const cost = g.buyCost(p);
  const up = g.upNow(p);
  const frozen = p.shop.some((m) => m.frozen);
  return `<div class="shell">
    ${hud(p)}
    ${lobby()}
    <section class="section">
      <h2>鲍勃的酒馆 <span class="hint">点击买入到手牌 · ${cost} 金</span></h2>
      <div class="panel row" id="shop">
        ${p.shop.map((m) => cardHTML(m, g.state.selShop === m.uid ? "sel" : "")).join("") || `<div class="hand-empty">酒馆空了，刷新一下</div>`}
      </div>
    </section>
    <section class="section">
      <h2>手牌 <span class="hint">${p.hand.length}/${g.MAX_HAND} · 点选手牌再点战场空位上场</span></h2>
      <div class="panel row" id="hand">
        ${p.hand.map((m) => cardHTML(m, g.state.selHand === m.uid ? "sel" : "")).join("") || `<div class="hand-empty">购买的随从会先进入这里</div>`}
      </div>
    </section>
    <section class="section">
      <h2>战场 <span class="hint">${p.board.length}/${g.MAX_BOARD} · 从左到右出手</span></h2>
      <div class="panel row" id="board">
        ${Array.from({ length: g.MAX_BOARD }, (_, i) => {
          const m = p.board[i];
          return m
            ? `<div class="slot filled" data-slot="${i}">${cardHTML(m, g.state.selBoard === m.uid ? "sel" : "")}</div>`
            : `<div class="slot ${g.state.selHand ? "drop" : ""}" data-slot="${i}">${i + 1}</div>`;
        }).join("")}
      </div>
      ${g.state.selHand || g.state.selBoard ? `<div style="margin-top:8px;text-align:right"><button class="btn" data-act="sell">出售选中（+1 金）</button></div>` : ""}
    </section>
    <nav class="bar">
      <button class="btn" data-act="refresh" ${p.gold < 1 ? "disabled" : ""}>刷新 · 1</button>
      <button class="btn" data-act="freeze">${frozen ? "解冻" : "冻结"}</button>
      <button class="btn gold" data-act="upgrade" ${p.tavern >= 6 || p.gold < up ? "disabled" : ""}>${p.tavern >= 6 ? "满级" : "升级 · " + up}</button>
      <button class="btn primary" data-act="end">结束回合</button>
    </nav>
    ${g.state.toast ? `<div class="toast">${g.state.toast}</div>` : ""}
  </div>`;
}

function combatView() {
  const p = g.you();
  const c = g.state.combat;
  const evs = c.events.slice(0, g.state.cursor);
  const pBoard = replaySide(c.playerStart, evs, "p");
  const eBoard = replaySide(c.enemyStart, evs, "e");
  const last = evs[evs.length - 1];
  let banner = last?.type === "say" ? last.text : last?.type === "end"
    ? (last.winner === "p" ? `胜利 · 造成 ${last.dmg} 伤害` : last.winner === "e" ? `战败 · 受到 ${last.dmg} 伤害` : "平局")
    : "自动开战";
  const atk = last?.type === "atk" ? last.a : null;
  const hit = last?.type === "atk" ? last.t : last?.type === "dmg" ? last.uid : null;
  const opp = g.state.players.find((x) => x.id === c.oppId);
  return `<div class="shell">
    ${hud(p)}
    <div class="section">
      <div class="hint">${opp?.name || "对手"}${c.ghost ? " · 残影" : ""} · 生命 ${opp?.hp} · 酒馆 ${opp?.tavern}</div>
      <div class="panel">
        <div class="row">${eBoard.map((m) => wrapCombat(m, atk, hit)).join("") || `<div class="hand-empty">空</div>`}</div>
        <div class="banner">${banner}</div>
        <div class="row">${pBoard.map((m) => wrapCombat(m, atk, hit)).join("") || `<div class="hand-empty">空</div>`}</div>
      </div>
      <p class="hint" style="text-align:center;margin-top:10px">战斗自动播放，结束后回到酒馆</p>
    </div>
  </div>`;
}

function wrapCombat(m, atk, hit) {
  const extra = `${m.dead ? "dead" : ""} ${atk === m.uid ? "atk-anim" : ""} ${hit === m.uid ? "hit-anim" : ""}`;
  const dmg = m._float ? `<span class="float">-${m._float}</span>` : "";
  return `<div style="position:relative">${cardHTML(m, extra)}${dmg}</div>`;
}

function replaySide(start, evs, owner) {
  const board = start.map((m) => ({ ...m }));
  const byUid = () => {
    const map = new Map();
    board.forEach((m) => map.set(m.uid, m));
    return map;
  };
  for (const ev of evs) {
    if (ev.type === "dmg") {
      const m = board.find((x) => x.uid === ev.uid);
      if (m) { m.hp = ev.hp; if (ev.shield) m.divineShield = false; if (!ev.shield) m._float = ev.n; }
    }
    if (ev.type === "death") {
      const m = board.find((x) => x.uid === ev.uid);
      if (m) m.dead = true;
    }
    if (ev.type === "reborn") {
      const m = board.find((x) => x.uid === ev.uid);
      if (m) { m.dead = false; m.hp = 1; }
    }
    if (ev.type === "summon" && ev.owner === (owner === "p" ? "p" : "e")) {
      board.splice(Math.min(ev.index, board.length), 0, { ...ev.minion });
    }
  }
  return board.filter((m) => !m.dead);
}

function menuView() {
  return `<div class="shell start">
    <p class="hint">八人混战 · 自动对战</p>
    <h1>酒馆战棋</h1>
    <p class="hint" style="max-width:420px">买到的随从先入手牌，再摆上战场。结束回合后自动开战、自动结算，然后回到酒馆。</p>
    <button class="btn primary" style="margin-top:20px;min-width:220px" data-act="start">开始对局</button>
  </div>`;
}

function heroView() {
  return `<div class="shell start">
    <p class="hint">本局英雄</p>
    <h1 style="font-size:32px">四选一</h1>
    <div class="heroes">${g.state.choices.map((h) => `
      <button class="hero-pick" data-hero="${h.id}">
        <div class="hero-name">${h.name}</div>
        <div style="color:var(--gold-2);font-size:12px">${h.power} · ${h.cost}金</div>
        <p class="hint">${h.text}</p>
      </button>`).join("")}</div>
  </div>`;
}

function overView() {
  const ranked = [...g.state.players].sort((a, b) => (a.place ?? 99) - (b.place ?? 99) || b.hp - a.hp);
  const you = g.you();
  const place = you.place || ranked.findIndex((p) => p.id === "you") + 1;
  return `<div class="shell start">
    <div class="panel modal">
      <h1>${place === 1 ? "冠军" : "第 " + place + " 名"}</h1>
      <ol style="text-align:left">${ranked.map((p, i) => `<li style="margin:6px 0">${p.place || i + 1}. ${p.name} · ${p.alive ? p.hp + " 命" : "出局"}</li>`).join("")}</ol>
      <button class="btn primary" data-act="start">再来一局</button>
    </div>
  </div>`;
}

function render() {
  const ph = g.state.phase;
  if (ph === "menu") app.innerHTML = menuView();
  else if (ph === "hero") app.innerHTML = heroView();
  else if (ph === "tavern") app.innerHTML = tavernView();
  else if (ph === "combat") app.innerHTML = combatView();
  else if (ph === "over") app.innerHTML = overView();
  bind();
}

function bind() {
  app.onclick = (e) => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    const hero = e.target.closest("[data-hero]")?.dataset.hero;
    const card = e.target.closest(".card");
    const slot = e.target.closest("[data-slot]");
    if (act === "start") g.startSelect();
    else if (act === "end") g.endTurn();
    else if (act === "refresh") g.refresh();
    else if (act === "freeze") g.freeze();
    else if (act === "upgrade") g.upgrade();
    else if (act === "power") g.power();
    else if (act === "sell") g.sellSel();
    else if (hero) g.pickHero(hero);
    else if (slot && g.state.selHand) g.play(g.state.selHand, Number(slot.dataset.slot));
    else if (card) {
      const uid = card.dataset.uid;
      if (card.closest("#shop")) {
        const p = g.you();
        if (p.gold >= g.buyCost(p) && p.hand.length < g.MAX_HAND) g.buy(uid);
        else g.selectShop(uid);
      } else if (card.closest("#hand")) g.selectHand(uid);
      else if (card.closest("#board")) g.selectBoard(uid);
    }
  };
}

g.setRender(render);
render();
