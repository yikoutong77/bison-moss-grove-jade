const TRIBE = {
  beast: "野兽", murloc: "鱼人", mech: "机械", demon: "恶魔",
  dragon: "龙", pirate: "海盗", neutral: "中立",
};
const KW = { taunt: "嘲讽", divineShield: "圣盾", poisonous: "剧毒", reborn: "复生", cleave: "顺劈" };
const SHOP_SIZE = [0, 3, 4, 4, 5, 5, 6];
const UPGRADE = [0, 5, 7, 8, 9, 10];
const COPIES = [0, 16, 15, 13, 11, 9, 7];
const MAX_BOARD = 7;
const MAX_HAND = 10;
const BUY = 3;
const START_HP = 30;

const MINIONS = [
  { id: "alleycat", name: "巷道猫", t: 1, tribe: "beast", atk: 1, hp: 1, kw: [], bc: "summon", token: "tabbycat", text: "战吼：召唤 1/1 虎斑猫到战场。", hue: 32 },
  { id: "rockpool", name: "岩池猎手", t: 1, tribe: "murloc", atk: 2, hp: 3, kw: [], bc: "buffTribe", tribe: "murloc", ba: 1, bh: 1, text: "战吼：一个友方鱼人 +1/+1。", hue: 160 },
  { id: "annoyotron", name: "吵吵机器人", t: 1, tribe: "mech", atk: 1, hp: 2, kw: ["taunt", "divineShield"], text: "嘲讽。圣盾。", hue: 200 },
  { id: "scallywag", name: "海盗无赖", t: 1, tribe: "pirate", atk: 2, hp: 1, kw: [], dr: "summonAtk", token: "pirate_pal", text: "亡语：召唤 1/1 海盗并立刻攻击。", hue: 25 },
  { id: "selfless", name: "无私的英雄", t: 1, tribe: "neutral", atk: 2, hp: 1, kw: [], dr: "shield", text: "亡语：随机友方获得圣盾。", hue: 45 },
  { id: "spawn", name: "恩佐斯子嗣", t: 2, tribe: "neutral", atk: 2, hp: 2, kw: [], dr: "buffAll", ba: 1, bh: 1, text: "亡语：全体友方 +1/+1。", hue: 280 },
  { id: "golem", name: "麦田傀儡", t: 2, tribe: "mech", atk: 2, hp: 3, kw: [], dr: "summon", token: "golem2", text: "亡语：召唤 2/1 损坏傀儡。", hue: 210 },
  { id: "tidehunter", name: "猎潮者", t: 2, tribe: "murloc", atk: 2, hp: 1, kw: [], bc: "summon", token: "murloc_scout", text: "战吼：召唤 1/1 鱼人斥候。", hue: 170 },
  { id: "direwolf", name: "恐狼先锋", t: 2, tribe: "beast", atk: 2, hp: 2, kw: [], auraAdj: 1, text: "开战时相邻随从 +1 攻。", hue: 20 },
  { id: "hydra", name: "洞穴多头蛇", t: 3, tribe: "beast", atk: 2, hp: 4, kw: ["cleave"], text: "顺劈。", hue: 140 },
  { id: "replicating", name: "量产恐吓机", t: 3, tribe: "mech", atk: 3, hp: 1, kw: [], dr: "summonN", token: "microbot", n: 3, text: "亡语：召唤三个 1/1 微型机器人。", hue: 190 },
  { id: "southsea", name: "南海船长", t: 3, tribe: "pirate", atk: 3, hp: 3, kw: [], bc: "buffOthers", tribe: "pirate", ba: 1, bh: 1, text: "战吼：其他海盗 +1/+1。", hue: 18 },
  { id: "warden", name: "青铜守卫", t: 3, tribe: "dragon", atk: 2, hp: 1, kw: ["divineShield", "reborn"], text: "圣盾。复生。", hue: 50 },
  { id: "egg", name: "机械蛋", t: 4, tribe: "mech", atk: 0, hp: 5, kw: [], dr: "summon", token: "robosaur", text: "亡语：召唤 8/8 机械暴龙。", hue: 195 },
  { id: "highmane", name: "草原狮", t: 4, tribe: "beast", atk: 6, hp: 5, kw: [], dr: "summonN", token: "hyena", n: 2, text: "亡语：召唤两只 2/2 土狼。", hue: 35 },
  { id: "argus", name: "阿古斯防御者", t: 4, tribe: "neutral", atk: 2, hp: 3, kw: [], bc: "adjTaunt", ba: 1, bh: 1, text: "战吼：相邻获得嘲讽和 +1/+1。", hue: 120 },
  { id: "voidlord", name: "虚空领主", t: 5, tribe: "demon", atk: 3, hp: 9, kw: ["taunt"], dr: "summonN", token: "voidwalker", n: 3, text: "嘲讽。亡语：三个 1/3 嘲讽虚空行者。", hue: 265 },
  { id: "maexxna", name: "迈克斯纳", t: 5, tribe: "beast", atk: 2, hp: 8, kw: ["poisonous"], text: "剧毒。", hue: 300 },
  { id: "goldrinn", name: "戈德林", t: 5, tribe: "beast", atk: 4, hp: 4, kw: [], dr: "buffTribe", tribe: "beast", ba: 5, bh: 5, text: "亡语：野兽 +5/+5。", hue: 28 },
  { id: "malganis", name: "玛尔加尼斯", t: 6, tribe: "demon", atk: 9, hp: 7, kw: [], auraTribe: ["demon", 2, 2], text: "其他恶魔 +2/+2。", hue: 272 },
  { id: "ragnaros", name: "拉格纳罗斯", t: 6, tribe: "neutral", atk: 8, hp: 8, kw: [], socDmg: 8, text: "开战时随机敌方 8 点伤害。", hue: 12 },
  { id: "sneeds", name: "斯尼德挖掘机", t: 6, tribe: "mech", atk: 5, hp: 7, kw: [], dr: "randomHigh", text: "亡语：召唤一个随机 4 星以上随从。", hue: 22 },
];

const TOKENS = {
  tabbycat: { id: "tabbycat", name: "虎斑猫", t: 1, tribe: "beast", atk: 1, hp: 1, kw: [], token: true, hue: 30 },
  pirate_pal: { id: "pirate_pal", name: "海盗水手", t: 1, tribe: "pirate", atk: 1, hp: 1, kw: [], token: true, hue: 24 },
  golem2: { id: "golem2", name: "损坏傀儡", t: 1, tribe: "mech", atk: 2, hp: 1, kw: [], token: true, hue: 205 },
  murloc_scout: { id: "murloc_scout", name: "鱼人斥候", t: 1, tribe: "murloc", atk: 1, hp: 1, kw: [], token: true, hue: 165 },
  microbot: { id: "microbot", name: "微型机器人", t: 1, tribe: "mech", atk: 1, hp: 1, kw: [], token: true, hue: 188 },
  robosaur: { id: "robosaur", name: "机械暴龙", t: 1, tribe: "mech", atk: 8, hp: 8, kw: [], token: true, hue: 200 },
  hyena: { id: "hyena", name: "土狼", t: 1, tribe: "beast", atk: 2, hp: 2, kw: [], token: true, hue: 33 },
  voidwalker: { id: "voidwalker", name: "虚空行者", t: 1, tribe: "demon", atk: 1, hp: 3, kw: ["taunt"], token: true, hue: 260 },
};

const ALL = [...MINIONS, ...Object.values(TOKENS)];
const BY_ID = Object.fromEntries(ALL.map((m) => [m.id, m]));
const BY_TIER = [ [], [], [], [], [], [], [] ];
for (const m of MINIONS) BY_TIER[m.t].push(m);

const HEROES = [
  { id: "jaina", name: "吉安娜", power: "冰霜新货", cost: 1, text: "花费 1 金刷新并冻结酒馆。", armor: 0, kind: "refreshFreeze" },
  { id: "rexxar", name: "雷克萨", power: "召唤宠物", cost: 1, text: "花费 1 金，把手牌加入一只 1/1 虎斑猫。", armor: 0, kind: "tokenHand" },
  { id: "valeera", name: "瓦莉拉", power: "便宜货", cost: 0, text: "下次购买只要 2 金。", armor: 0, kind: "cheapBuy" },
  { id: "uther", name: "乌瑟尔", power: "神圣护盾", cost: 2, text: "随机友方战场随从获得圣盾。起始 5 护甲。", armor: 5, kind: "shield" },
  { id: "guldan", name: "古尔丹", power: "生命分流", cost: 0, text: "失去 2 命，获得 2 金。", armor: 0, kind: "lifeGold" },
  { id: "malfurion", name: "玛法里奥", power: "自然之力", cost: 1, text: "随机战场随从 +2/+1。", armor: 0, kind: "buff" },
  { id: "thrall", name: "萨尔", power: "风暴降价", cost: 1, text: "本回合升级费用 -3。", armor: 0, kind: "cheapUp" },
  { id: "garrosh", name: "加尔鲁什", power: "钢铁甲胄", cost: 2, text: "获得 3 护甲。起始 8 护甲。", armor: 8, kind: "armor" },
];

let uidN = 1;
const uid = () => "m" + uidN++;
const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
const shuffle = (arr, rng) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeInst(id, golden = false) {
  const d = BY_ID[id];
  return {
    uid: uid(),
    defId: id,
    atk: golden ? d.atk * 2 : d.atk,
    hp: golden ? d.hp * 2 : d.hp,
    maxHp: golden ? d.hp * 2 : d.hp,
    golden,
    kw: [...d.kw],
    frozen: false,
  };
}

function defOf(m) { return BY_ID[m.defId]; }
function val(m) {
  const d = defOf(m);
  return d.t * 10 + m.atk * 2 + m.hp + (m.golden ? 18 : 0);
}

function createPool() {
  const p = {};
  for (const m of MINIONS) p[m.id] = COPIES[m.t];
  return p;
}
function take(pool, id) {
  if ((pool[id] || 0) <= 0) return false;
  pool[id]--;
  return true;
}
function giveBack(pool, m) {
  const d = defOf(m);
  if (d.token) return;
  pool[m.defId] = (pool[m.defId] || 0) + (m.golden ? 3 : 1);
}

function goldFor(turn) { return Math.min(10, turn + 2); }

function makePlayer(id, hero, name, human) {
  return {
    id, name, heroId: hero.id, hp: START_HP, armor: hero.armor,
    tavern: 1, gold: goldFor(1), upCost: UPGRADE[1],
    board: [], hand: [], shop: [],
    frozenAll: false, human, alive: true, place: null,
    triples: 0, streak: 0, powerUsed: false, buyDisc: 0, upDisc: 0,
  };
}

function buyCost(p) { return Math.max(0, BUY - (p.buyDisc || 0)); }
function upNow(p) { return p.tavern >= 6 ? 0 : Math.max(0, p.upCost - (p.upDisc || 0)); }

function rollShop(p, pool, rng, keepFrozen) {
  const size = SHOP_SIZE[p.tavern];
  const kept = keepFrozen ? p.shop.filter((m) => m.frozen) : [];
  if (!keepFrozen) {
    for (const m of p.shop) if (!m.frozen) giveBack(pool, m);
  } else {
    for (const m of p.shop) if (!m.frozen) giveBack(pool, m);
  }
  const need = Math.max(0, size - kept.length);
  const bag = [];
  for (let t = 1; t <= p.tavern; t++) {
    for (const d of BY_TIER[t]) {
      for (let i = 0; i < (pool[d.id] || 0); i++) bag.push(d.id);
    }
  }
  const next = kept.map((m) => ({ ...m, frozen: true }));
  const shuffled = shuffle(bag, rng);
  for (let i = 0; i < need && i < shuffled.length; i++) {
    const id = shuffled[i];
    if (take(pool, id)) next.push(makeInst(id));
  }
  p.shop = next;
}

function startTurn(p, turn, pool, rng) {
  p.gold = goldFor(turn);
  if (p.tavern < 6) p.upCost = Math.max(0, p.upCost - (turn === 1 ? 0 : 1));
  p.powerUsed = false;
  p.buyDisc = 0;
  p.upDisc = 0;
  rollShop(p, pool, rng, true);
  p.shop.forEach((m) => { if (!m.frozen) m.frozen = false; });
  // unfreeze after showing? Keep frozen minions frozen until player unfreezes
}

function tryTriple(p) {
  const all = [...p.hand, ...p.board];
  const groups = {};
  for (const m of all) {
    if (m.golden) continue;
    groups[m.defId] = groups[m.defId] || [];
    groups[m.defId].push(m);
  }
  for (const [id, list] of Object.entries(groups)) {
    if (list.length < 3) continue;
    const three = list.slice(0, 3);
    const ids = new Set(three.map((m) => m.uid));
    p.hand = p.hand.filter((m) => !ids.has(m.uid));
    p.board = p.board.filter((m) => !ids.has(m.uid));
    const g = makeInst(id, true);
    g.atk = three.reduce((s, m) => s + m.atk, 0);
    g.hp = three.reduce((s, m) => s + m.hp, 0);
    g.maxHp = g.hp;
    const extra = new Set();
    for (const m of three) m.kw.forEach((k) => extra.add(k));
    g.kw = [...extra];
    p.hand.push(g);
    p.triples++;
    return { fused: g, tier: defOf(three[0]).t };
  }
  return null;
}

function buyToHand(p, shopUid, pool, rng) {
  const cost = buyCost(p);
  if (p.gold < cost || p.hand.length >= MAX_HAND) return { ok: false, why: p.hand.length >= MAX_HAND ? "手牌已满" : "金币不足" };
  const i = p.shop.findIndex((m) => m.uid === shopUid);
  if (i < 0) return { ok: false, why: "找不到随从" };
  const m = { ...p.shop[i], frozen: false };
  p.shop.splice(i, 1);
  p.gold -= cost;
  p.buyDisc = 0;
  p.hand.push(m);
  const triple = tryTriple(p);
  return { ok: true, triple };
}

function playFromHand(p, handUid, slot) {
  const i = p.hand.findIndex((m) => m.uid === handUid);
  if (i < 0) return { ok: false, why: "手牌里没有这只" };
  if (p.board.length >= MAX_BOARD) return { ok: false, why: "战场已满" };
  const m = p.hand[i];
  p.hand.splice(i, 1);
  const idx = Math.max(0, Math.min(slot ?? p.board.length, p.board.length));
  p.board.splice(idx, 0, m);
  applyBattlecry(p, m, idx);
  tryTriple(p);
  return { ok: true };
}

function applyBattlecry(p, played, idx) {
  const d = defOf(played);
  const g = played.golden ? 2 : 1;
  if (d.bc === "summon" && p.board.length < MAX_BOARD) {
    const tok = makeInst(d.token, played.golden);
    p.board.splice(Math.min(idx + 1, p.board.length), 0, tok);
  }
  if (d.bc === "buffTribe") {
    const cands = p.board.filter((m) => m.uid !== played.uid && defOf(m).tribe === d.tribe);
    const t = cands[0] || (defOf(played).tribe === d.tribe ? played : null);
    if (t) { t.atk += d.ba * g; t.hp += d.bh * g; t.maxHp += d.bh * g; }
  }
  if (d.bc === "buffOthers") {
    for (const m of p.board) {
      if (m.uid === played.uid) continue;
      if (d.tribe && defOf(m).tribe !== d.tribe) continue;
      m.atk += d.ba * g; m.hp += d.bh * g; m.maxHp += d.bh * g;
    }
  }
  if (d.bc === "adjTaunt") {
    for (let i = 0; i < p.board.length; i++) {
      if (Math.abs(i - idx) !== 1) continue;
      const m = p.board[i];
      m.atk += d.ba * g; m.hp += d.bh * g; m.maxHp += d.bh * g;
      if (!m.kw.includes("taunt")) m.kw.push("taunt");
    }
  }
}

function sell(p, uidStr, from, pool) {
  const arr = from === "hand" ? p.hand : p.board;
  const i = arr.findIndex((m) => m.uid === uidStr);
  if (i < 0) return false;
  const m = arr.splice(i, 1)[0];
  giveBack(pool, m);
  p.gold = Math.min(10, p.gold + 1);
  return true;
}

function refresh(p, pool, rng) {
  if (p.gold < 1) return false;
  p.gold--;
  rollShop(p, pool, rng, true);
  return true;
}

function upgrade(p) {
  const c = upNow(p);
  if (p.tavern >= 6 || p.gold < c) return false;
  p.gold -= c;
  p.tavern++;
  p.upCost = UPGRADE[p.tavern] || 0;
  p.upDisc = 0;
  return true;
}

function usePower(p, pool, rng) {
  const h = HEROES.find((x) => x.id === p.heroId);
  if (!h || p.powerUsed || p.gold < h.cost) return { ok: false, msg: p.powerUsed ? "本回合已使用" : "金币不足" };
  if ((h.kind === "buff" || h.kind === "shield") && !p.board.length) return { ok: false, msg: "战场上没有随从" };
  if (h.kind === "lifeGold" && p.hp <= 2) return { ok: false, msg: "生命过低" };
  if (h.kind === "tokenHand" && p.hand.length >= MAX_HAND) return { ok: false, msg: "手牌已满" };
  p.gold -= h.cost;
  p.powerUsed = true;
  if (h.kind === "refreshFreeze") {
    rollShop(p, pool, rng, false);
    p.shop.forEach((m) => { m.frozen = true; });
    return { ok: true, msg: "酒馆已刷新并冻结" };
  }
  if (h.kind === "tokenHand") {
    p.hand.push(makeInst("tabbycat"));
    return { ok: true, msg: "虎斑猫加入手牌" };
  }
  if (h.kind === "cheapBuy") { p.buyDisc = 1; return { ok: true, msg: "下次购买 2 金" }; }
  if (h.kind === "shield") {
    const t = pick(p.board, rng);
    if (!t.kw.includes("divineShield")) t.kw.push("divineShield");
    return { ok: true, msg: `${defOf(t).name} 获得圣盾` };
  }
  if (h.kind === "lifeGold") {
    p.hp -= 2;
    p.gold = Math.min(10, p.gold + 2);
    return { ok: true, msg: "以血换金 +2" };
  }
  if (h.kind === "buff") {
    const t = pick(p.board, rng);
    t.atk += 2; t.hp += 1; t.maxHp += 1;
    return { ok: true, msg: `${defOf(t).name} +2/+1` };
  }
  if (h.kind === "cheapUp") { p.upDisc = 3; return { ok: true, msg: "升级减 3 金" }; }
  if (h.kind === "armor") { p.armor += 3; return { ok: true, msg: "获得 3 护甲" }; }
  return { ok: false, msg: "无法使用" };
}

function toCombat(m, owner) {
  const d = defOf(m);
  return {
    uid: m.uid, defId: m.defId, name: d.name, tribe: d.tribe, hue: d.hue,
    atk: m.atk, hp: m.hp, maxHp: m.maxHp, golden: m.golden,
    taunt: m.kw.includes("taunt"),
    divineShield: m.kw.includes("divineShield"),
    poisonous: m.kw.includes("poisonous"),
    reborn: m.kw.includes("reborn"),
    cleave: m.kw.includes("cleave"),
    owner, dead: false,
  };
}

function living(b) { return b.filter((m) => !m.dead && m.hp > 0); }

function simulateCombat(pb, eb, pTier, eTier, rng) {
  const player = pb.map((m) => toCombat(m, "p"));
  const enemy = eb.map((m) => toCombat(m, "e"));
  const events = [];
  const log = (e) => events.push(e);
  const board = (s) => (s === "p" ? player : enemy);
  const opp = (s) => (s === "p" ? "e" : "p");

  const aura = () => {
    for (const side of ["p", "e"]) {
      for (const m of living(board(side))) {
        const d = defOf(m);
        if (d.auraAdj) {
          const arr = living(board(side));
          const i = arr.findIndex((x) => x.uid === m.uid);
          for (const n of [arr[i - 1], arr[i + 1]]) if (n) n.atk += d.auraAdj * (m.golden ? 2 : 1);
        }
        if (d.auraTribe) {
          const [tr, a, h] = d.auraTribe;
          for (const t of living(board(side))) {
            if (t.uid === m.uid || t.tribe !== tr) continue;
            t.atk += a * (m.golden ? 2 : 1);
            t.hp += h * (m.golden ? 2 : 1);
          }
        }
      }
    }
    for (const side of ["p", "e"]) {
      for (const m of living(board(side))) {
        const d = defOf(m);
        if (d.socDmg) {
          const foes = living(board(opp(side)));
          if (foes.length) deal(m, pick(foes, rng), d.socDmg * (m.golden ? 2 : 1), false);
        }
      }
      collect();
    }
  };

  function deal(src, tgt, amt, poison) {
    if (amt <= 0 || tgt.dead) return;
    if (tgt.divineShield) {
      tgt.divineShield = false;
      log({ type: "dmg", uid: tgt.uid, n: 0, shield: true, hp: tgt.hp });
      return;
    }
    tgt.hp -= amt;
    if (poison) tgt.hp = 0;
    log({ type: "dmg", uid: tgt.uid, n: amt, shield: false, hp: Math.max(0, tgt.hp) });
  }

  function summon(side, id, golden, index) {
    const arr = board(side);
    if (living(arr).length >= 7) return null;
    const cm = toCombat(makeInst(id, golden), side);
    arr.splice(Math.max(0, Math.min(index, arr.length)), 0, cm);
    log({ type: "summon", owner: side, minion: { ...cm }, index });
    return cm;
  }

  function runDR(m) {
    const d = defOf(m);
    const g = m.golden ? 2 : 1;
    const side = m.owner;
    const insert = board(side).findIndex((x) => x.uid === m.uid) + 1;
    if (d.dr === "summon") summon(side, d.token, m.golden, insert);
    if (d.dr === "summonN") {
      for (let i = 0; i < (d.n || 1) * g; i++) summon(side, d.token, false, insert + i);
    }
    if (d.dr === "summonAtk") {
      const s = summon(side, d.token, m.golden, insert);
      if (s) swing(s);
    }
    if (d.dr === "buffAll") {
      for (const t of living(board(side))) { t.atk += d.ba * g; t.hp += d.bh * g; }
    }
    if (d.dr === "buffTribe") {
      for (const t of living(board(side))) {
        if (t.tribe === d.tribe) { t.atk += d.ba * g; t.hp += d.bh * g; }
      }
    }
    if (d.dr === "shield") {
      const al = living(board(side)).filter((x) => x.uid !== m.uid);
      if (al.length) pick(al, rng).divineShield = true;
    }
    if (d.dr === "randomHigh") {
      const pool = MINIONS.filter((x) => x.t >= 4);
      summon(side, pick(pool, rng).id, false, insert);
    }
  }

  function collect() {
    const dying = [];
    for (const side of ["p", "e"]) {
      for (const m of board(side)) if (!m.dead && m.hp <= 0) dying.push(m);
    }
    if (!dying.length) return;
    for (const m of dying) {
      if (m.dead) continue;
      m.dead = true;
      log({ type: "death", uid: m.uid });
      runDR(m);
      if (m.reborn) {
        m.dead = false; m.hp = 1; m.reborn = false;
        m.divineShield = BY_ID[m.defId].kw.includes("divineShield");
        log({ type: "reborn", uid: m.uid });
      }
    }
    player.splice(0, player.length, ...player.filter((m) => !m.dead));
    enemy.splice(0, enemy.length, ...enemy.filter((m) => !m.dead));
    if (player.some((m) => !m.dead && m.hp <= 0) || enemy.some((m) => !m.dead && m.hp <= 0)) collect();
  }

  function swing(atk) {
    const foes = living(board(opp(atk.owner)));
    if (!foes.length) return;
    const taunts = foes.filter((m) => m.taunt);
    const opts = taunts.length ? taunts : foes;
    const tgt = pick(opts, rng);
    log({ type: "atk", a: atk.uid, t: tgt.uid });
    const list = living(board(opp(atk.owner)));
    const ti = list.findIndex((m) => m.uid === tgt.uid);
    const hits = [tgt];
    if (atk.cleave) {
      if (list[ti - 1]) hits.push(list[ti - 1]);
      if (list[ti + 1]) hits.push(list[ti + 1]);
    }
    const backAtk = tgt.atk;
    const backP = tgt.poisonous;
    for (const h of hits) deal(atk, h, atk.atk, atk.poisonous);
    if (backAtk > 0) deal(tgt, atk, backAtk, backP);
    collect();
  }

  aura();
  const pC = living(player).length, eC = living(enemy).length;
  let side = pC > eC ? "p" : eC > pC ? "e" : rng() < 0.5 ? "p" : "e";
  log({ type: "say", text: side === "p" ? "你先手攻击" : "对手先手攻击" });
  const nextI = { p: 0, e: 0 };
  let steps = 0;
  while (living(player).length && living(enemy).length && steps++ < 200) {
    const arr = board(side);
    const n = arr.length;
    let atk = null;
    for (let i = 0; i < n; i++) {
      const m = arr[(nextI[side] + i) % n];
      if (m && !m.dead && m.hp > 0 && m.atk > 0) { atk = m; break; }
    }
    if (!atk) {
      const o = opp(side);
      if (!living(board(o)).some((m) => m.atk > 0)) break;
      side = o;
      continue;
    }
    const before = arr.findIndex((m) => m.uid === atk.uid);
    swing(atk);
    const after = board(side).findIndex((m) => m.uid === atk.uid);
    nextI[side] = after === -1 ? Math.max(0, before) : after + 1;
    side = opp(side);
  }

  const pL = living(player), eL = living(enemy);
  let winner = "tie", dmg = 0, parts = [];
  if (pL.length && !eL.length) {
    winner = "p";
    parts = pL.map((m) => ({ name: m.name, t: BY_ID[m.defId].t }));
    dmg = pTier + parts.reduce((s, x) => s + x.t, 0);
  } else if (eL.length && !pL.length) {
    winner = "e";
    parts = eL.map((m) => ({ name: m.name, t: BY_ID[m.defId].t }));
    dmg = eTier + parts.reduce((s, x) => s + x.t, 0);
  }
  log({ type: "end", winner, dmg });
  return { events, winner, dmg, parts, playerStart: pb.map((m) => toCombat(m, "p")), enemyStart: eb.map((m) => toCombat(m, "e")), playerFinal: pL, enemyFinal: eL };
}

function applyHeroDmg(p, dmg) {
  let a = p.armor, h = p.hp, x = dmg;
  const soak = Math.min(a, x);
  a -= soak; x -= soak; h -= x;
  p.armor = a; p.hp = h;
  if (p.hp <= 0) { p.hp = 0; p.alive = false; }
}

function pairIds(ids, rng, last) {
  let list = shuffle(ids, rng);
  if (last && list.length >= 2 && list[0] === last) list.push(list.shift());
  const pairs = [];
  if (list.length % 2 === 1) {
    const leftover = list.pop();
    const ghost = list.find((id) => id !== leftover) || leftover;
    pairs.push({ a: leftover, b: ghost, ghost: true });
  }
  for (let i = 0; i < list.length; i += 2) pairs.push({ a: list[i], b: list[i + 1] });
  return pairs;
}

function aiTurn(p, pool, rng) {
  let guard = 22;
  while (guard-- > 0) {
    const h = HEROES.find((x) => x.id === p.heroId);
    if (h && !p.powerUsed && p.gold >= h.cost) {
      if (h.kind === "lifeGold" && p.hp > 12 && p.gold <= 6) { usePower(p, pool, rng); continue; }
      if (h.kind === "tokenHand" && p.hand.length < 6) { usePower(p, pool, rng); continue; }
      if (h.kind === "cheapBuy" && p.shop.length) { usePower(p, pool, rng); continue; }
    }
    const scored = p.shop.map((m) => ({ m, v: val(m) })).sort((a, b) => b.v - a.v);
    const best = scored[0];
    const uc = upNow(p);
    if (p.tavern < 6 && p.gold >= uc && (p.board.length + p.hand.length >= 3 || uc <= 4) && rng() < 0.45) {
      upgrade(p); continue;
    }
    if (best && p.gold >= buyCost(p) && p.hand.length < MAX_HAND) {
      if (p.board.length + p.hand.length >= MAX_BOARD + 3) {
        const worst = [...p.hand, ...p.board].sort((a, b) => val(a) - val(b))[0];
        if (worst && val(best.m) > val(worst) + 8) {
          sell(p, worst.uid, p.hand.includes(worst) ? "hand" : "board", pool);
          continue;
        }
      }
      const r = buyToHand(p, best.m.uid, pool, rng);
      if (r.ok) continue;
    }
    if (p.gold >= 1 && (p.hand.length < 4 || (best && val(best.m) < 16))) {
      const before = p.shop.map((m) => m.uid).join();
      refresh(p, pool, rng);
      if (p.shop.map((m) => m.uid).join() !== before) continue;
    }
    if (p.tavern < 6 && p.gold >= upNow(p)) { upgrade(p); continue; }
    break;
  }
  while (p.hand.length && p.board.length < MAX_BOARD) {
    playFromHand(p, p.hand[0].uid, p.board.length);
  }
  p.board.sort((a, b) => (b.atk === 0) - (a.atk === 0) || b.atk - a.atk);
}

export function createGame() {
  let rng = mulberry32(Date.now() >>> 0);
  let pool = createPool();
  const state = {
    phase: "menu",
    turn: 1,
    players: [],
    youId: "you",
    selShop: null,
    selHand: null,
    selBoard: null,
    toast: null,
    combat: null,
    cursor: 0,
    playing: false,
    lastOpp: null,
    nextPlace: 8,
    choices: [],
  };

  const you = () => state.players.find((p) => p.id === state.youId);

  function toast(t) {
    state.toast = t;
    setTimeout(() => { if (state.toast === t) state.toast = null; render(); }, 1600);
  }

  function startSelect() {
    rng = mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
    state.choices = shuffle(HEROES, rng).slice(0, 4);
    state.phase = "hero";
    render();
  }

  function pickHero(hid) {
    pool = createPool();
    const hero = HEROES.find((h) => h.id === hid);
    const rest = shuffle(HEROES.filter((h) => h.id !== hid), rng);
    const ps = [makePlayer("you", hero, hero.name, true)];
    for (let i = 0; i < 7; i++) {
      const h = rest[i];
      ps.push(makePlayer("ai" + i, h, h.name, false));
    }
    state.players = ps;
    state.turn = 1;
    state.nextPlace = 8;
    state.lastOpp = null;
    for (const p of state.players) startTurn(p, 1, pool, rng);
    for (const p of state.players) if (!p.human) aiTurn(p, pool, rng);
    state.phase = "tavern";
    toast(`${hero.name} 进入酒馆`);
    render();
  }

  function endTurn() {
    const me = you();
    if (!me || state.phase !== "tavern") return;
    const alive = state.players.filter((p) => p.alive);
    const pairs = pairIds(alive.map((p) => p.id), rng, state.lastOpp);
    const mine = pairs.find((x) => !x.ghost && (x.a === me.id || x.b === me.id)) ||
      pairs.find((x) => x.a === me.id || x.b === me.id);
    if (!mine) { state.phase = "over"; render(); return; }
    const oppId = mine.a === me.id ? mine.b : mine.a;
    const opp = state.players.find((p) => p.id === oppId);
    const result = simulateCombat(me.board, opp.board, me.tavern, opp.tavern, rng);
    result.oppId = oppId;
    result.ghost = !!mine.ghost;
    result.oppName = opp.name;

    for (const pair of pairs) {
      if (pair.a === me.id || pair.b === me.id) continue;
      const a = state.players.find((p) => p.id === pair.a);
      const b = state.players.find((p) => p.id === pair.b);
      const r = simulateCombat(a.board, b.board, a.tavern, b.tavern, rng);
      if (r.winner === "e") applyHeroDmg(a, r.dmg);
      else if (r.winner === "p" && !pair.ghost) applyHeroDmg(b, r.dmg);
    }

    state.combat = result;
    state.cursor = 0;
    state.lastOpp = oppId;
    state.phase = "combat";
    state.playing = true;
    render();
    playCombat();
  }

  function playCombat() {
    const c = state.combat;
    if (!c || state.phase !== "combat") return;
    const step = () => {
      if (!state.playing || state.phase !== "combat") return;
      if (state.cursor >= c.events.length) {
        finishCombat();
        return;
      }
      state.cursor++;
      render();
      const ev = c.events[state.cursor - 1];
      const wait = ev?.type === "atk" ? 420 : ev?.type === "end" ? 900 : 280;
      setTimeout(step, wait);
    };
    setTimeout(step, 350);
  }

  function finishCombat() {
    const c = state.combat;
    if (!c) return;
    const me = you();
    const opp = state.players.find((p) => p.id === c.oppId);
    if (c.winner === "e") applyHeroDmg(me, c.dmg);
    else if (c.winner === "p" && opp && opp.alive && !c.ghost) applyHeroDmg(opp, c.dmg);
    if (me.hp <= 0) me.alive = false;
    const livingP = state.players.filter((p) => p.alive);
    if (!me.alive || livingP.length <= 1) {
      if (livingP.length === 1) livingP[0].place = 1;
      state.phase = "over";
      state.playing = false;
      render();
      return;
    }
    state.turn++;
    for (const p of state.players) if (p.alive) startTurn(p, state.turn, pool, rng);
    for (const p of state.players) if (p.alive && !p.human) aiTurn(p, pool, rng);
    state.phase = "tavern";
    state.combat = null;
    state.playing = false;
    state.selHand = null;
    state.selShop = null;
    toast(`第 ${state.turn} 回合`);
    render();
  }

  let render = () => {};
  function setRender(fn) { render = fn; }

  return {
    state, you, toast, startSelect, pickHero, endTurn, finishCombat, setRender,
    buy(uidStr) {
      const p = you();
      const r = buyToHand(p, uidStr, pool, rng);
      if (!r.ok) toast(r.why);
      else if (r.triple) toast("三连！金色随从已加入手牌，并发现更高随从。");
      if (r.triple) {
        const opts = BY_TIER[Math.min(6, r.triple.tier + 1)] || BY_TIER[6];
        const d = pick(opts, rng);
        if (p.hand.length < MAX_HAND) p.hand.push(makeInst(d.id));
      }
      state.selShop = null;
      render();
    },
    play(uidStr, slot) {
      const r = playFromHand(you(), uidStr, slot);
      if (!r.ok) toast(r.why);
      state.selHand = null;
      render();
    },
    sellSel() {
      const p = you();
      if (state.selHand) sell(p, state.selHand, "hand", pool);
      else if (state.selBoard) sell(p, state.selBoard, "board", pool);
      state.selHand = null;
      state.selBoard = null;
      render();
    },
    refresh() { if (!refresh(you(), pool, rng)) toast("金币不足"); render(); },
    freeze() {
      const p = you();
      const any = p.shop.some((m) => !m.frozen);
      p.shop.forEach((m) => { m.frozen = any; });
      render();
    },
    freezeOne(uidStr) {
      const m = you().shop.find((x) => x.uid === uidStr);
      if (m) m.frozen = !m.frozen;
      render();
    },
    upgrade() { if (!upgrade(you())) toast("无法升级"); else toast("酒馆升级"); render(); },
    power() {
      const r = usePower(you(), pool, rng);
      toast(r.msg);
      render();
    },
    selectShop(id) { state.selShop = id; state.selHand = null; state.selBoard = null; render(); },
    selectHand(id) { state.selHand = state.selHand === id ? null : id; state.selShop = null; state.selBoard = null; render(); },
    selectBoard(id) { state.selBoard = state.selBoard === id ? null : id; state.selHand = null; state.selShop = null; render(); },
    moveBoard(fromUid, toIndex) {
      const p = you();
      const i = p.board.findIndex((m) => m.uid === fromUid);
      if (i < 0) return;
      const [m] = p.board.splice(i, 1);
      p.board.splice(Math.min(toIndex, p.board.length), 0, m);
      render();
    },
    HEROES, TRIBE, KW, defOf, buyCost, upNow, MAX_BOARD, MAX_HAND, BY_ID,
  };
}
