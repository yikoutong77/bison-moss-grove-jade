import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as CircleHelp, a as Swords, c as RotateCcw, d as Layers, f as Heart, g as Coins, h as Crown, l as RefreshCw, m as FastForward, n as VolumeX, o as Sparkles, p as Flag, r as Volume2, s as Snowflake, t as X, u as Play, v as CircleArrowUp, y as BookOpen } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CMNheBd9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function createRng(seed) {
	let a = seed >>> 0;
	const next = () => {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
	return {
		next,
		int: (max) => Math.floor(next() * max),
		pick: (arr) => arr[Math.floor(next() * arr.length)],
		chance: (p) => next() < p
	};
}
function shuffle(arr, rng) {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = rng.int(i + 1);
		const tmp = a[i];
		a[i] = a[j];
		a[j] = tmp;
	}
	return a;
}
function uid(prefix = "m") {
	return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}
var TRIBE_LABEL = {
	beast: "野兽",
	murloc: "鱼人",
	mech: "机械",
	demon: "恶魔",
	dragon: "龙",
	pirate: "海盗",
	neutral: "中立"
};
var KEYWORD_LABEL = {
	taunt: "嘲讽",
	divineShield: "圣盾",
	windfury: "风怒",
	poisonous: "剧毒",
	reborn: "复生",
	cleave: "顺劈"
};
var MINIONS = [
	{
		id: "alleycat",
		name: "巷道猫",
		art: "CFM_315",
		tier: 1,
		tribe: "beast",
		atk: 1,
		hp: 1,
		keywords: [],
		effects: [{
			kind: "battlecry_summon",
			tokenId: "tabbycat"
		}],
		text: "战吼：召唤一只 1/1 的虎斑猫。"
	},
	{
		id: "rockpool",
		name: "岩池猎手",
		art: "UNG_073",
		tier: 1,
		tribe: "murloc",
		atk: 2,
		hp: 3,
		keywords: [],
		effects: [{
			kind: "battlecry_buff_tribe",
			tribe: "murloc",
			atk: 1,
			hp: 1
		}],
		text: "战吼：使一个友方鱼人获得 +1/+1。"
	},
	{
		id: "annoyotron",
		name: "吵吵机器人",
		art: "GVG_085",
		tier: 1,
		tribe: "mech",
		atk: 1,
		hp: 2,
		keywords: ["taunt", "divineShield"],
		effects: [],
		text: "嘲讽。圣盾。"
	},
	{
		id: "micromachine",
		name: "微型机甲",
		art: "GVG_103",
		tier: 1,
		tribe: "mech",
		atk: 1,
		hp: 2,
		keywords: [],
		effects: [{
			kind: "end_turn_buff_self",
			atk: 1,
			hp: 0
		}],
		text: "在你的回合结束时，获得 +1 攻击力。"
	},
	{
		id: "scallywag",
		name: "海盗无赖",
		art: "BGS_061",
		tier: 1,
		tribe: "pirate",
		atk: 2,
		hp: 1,
		keywords: [],
		effects: [{
			kind: "deathrattle_summon_attack",
			tokenId: "pirate_pal"
		}],
		text: "亡语：召唤一个 1/1 的海盗并使其立即发起攻击。"
	},
	{
		id: "wrathweaver",
		name: "愤怒编织者",
		art: "BGS_004",
		tier: 1,
		tribe: "neutral",
		atk: 1,
		hp: 3,
		keywords: [],
		effects: [{
			kind: "battlecry_buff_tribe",
			tribe: "demon",
			atk: 2,
			hp: 1
		}],
		text: "战吼：使一个友方恶魔获得 +2/+1。"
	},
	{
		id: "spawn_nzoth",
		name: "恩佐斯的子嗣",
		art: "OG_256",
		tier: 2,
		tribe: "neutral",
		atk: 2,
		hp: 2,
		keywords: [],
		effects: [{
			kind: "deathrattle_buff_all",
			atk: 1,
			hp: 1
		}],
		text: "亡语：使你的所有随从获得 +1/+1。"
	},
	{
		id: "kaboombot",
		name: "爆破机器人",
		art: "BOT_606",
		tier: 2,
		tribe: "mech",
		atk: 2,
		hp: 2,
		keywords: [],
		effects: [{
			kind: "deathrattle_damage_random",
			damage: 4
		}],
		text: "亡语：对一个随机敌方随从造成 4 点伤害。"
	},
	{
		id: "harvestgolem",
		name: "麦田傀儡",
		art: "EX1_556",
		tier: 2,
		tribe: "mech",
		atk: 2,
		hp: 3,
		keywords: [],
		effects: [{
			kind: "deathrattle_summon",
			tokenId: "damaged_golem",
			count: 1
		}],
		text: "亡语：召唤一个 2/1 的损坏的傀儡。"
	},
	{
		id: "unstableghoul",
		name: "蹒跚的食尸鬼",
		art: "FP1_024",
		tier: 2,
		tribe: "neutral",
		atk: 1,
		hp: 3,
		keywords: ["taunt"],
		effects: [{
			kind: "deathrattle_damage_all",
			damage: 1
		}],
		text: "嘲讽。亡语：对所有随从造成 1 点伤害。"
	},
	{
		id: "tidehunter",
		name: "鱼人猎潮者",
		art: "EX1_506",
		tier: 2,
		tribe: "murloc",
		atk: 2,
		hp: 1,
		keywords: [],
		effects: [{
			kind: "battlecry_summon",
			tokenId: "murloc_scout"
		}],
		text: "战吼：召唤一个 1/1 的鱼人斥候。"
	},
	{
		id: "direwolf",
		name: "恐狼先锋",
		art: "EX1_162",
		tier: 2,
		tribe: "beast",
		atk: 2,
		hp: 2,
		keywords: [],
		effects: [{
			kind: "start_combat_aura_adjacent",
			atk: 1
		}],
		text: "相邻的随从获得 +1 攻击力。"
	},
	{
		id: "cavehydra",
		name: "洞穴多头蛇",
		art: "LOOT_078",
		tier: 3,
		tribe: "beast",
		atk: 2,
		hp: 4,
		keywords: ["cleave"],
		effects: [],
		text: "同时对攻击目标相邻的随从造成伤害。"
	},
	{
		id: "replicating",
		name: "量产型恐吓机",
		art: "BOT_312",
		tier: 3,
		tribe: "mech",
		atk: 3,
		hp: 1,
		keywords: [],
		effects: [{
			kind: "deathrattle_summon",
			tokenId: "microbot",
			count: 3
		}],
		text: "亡语：召唤三个 1/1 的微型机器人。"
	},
	{
		id: "cobalt",
		name: "深蓝刃鳞龙人",
		art: "DRG_079",
		tier: 3,
		tribe: "dragon",
		atk: 5,
		hp: 5,
		keywords: [],
		effects: [{
			kind: "end_turn_buff_random",
			atk: 3,
			hp: 0
		}],
		text: "在你的回合结束时，使一个随机友方随从获得 +3 攻击力。"
	},
	{
		id: "southsea",
		name: "南海船长",
		art: "NEW1_027",
		tier: 3,
		tribe: "pirate",
		atk: 3,
		hp: 3,
		keywords: [],
		effects: [{
			kind: "battlecry_buff_others",
			tribe: "pirate",
			atk: 1,
			hp: 1
		}],
		text: "战吼：使你的其他海盗获得 +1/+1。"
	},
	{
		id: "grandmother",
		name: "慈祥的祖母",
		art: "KAR_005",
		tier: 3,
		tribe: "beast",
		atk: 1,
		hp: 1,
		keywords: [],
		effects: [{
			kind: "deathrattle_summon",
			tokenId: "bigbadwolf",
			count: 1
		}],
		text: "亡语：召唤一只 3/2 的大灰狼。"
	},
	{
		id: "bronzewarden",
		name: "青铜守卫",
		art: "BGS_034",
		tier: 3,
		tribe: "dragon",
		atk: 2,
		hp: 1,
		keywords: ["divineShield", "reborn"],
		effects: [],
		text: "圣盾。复生。"
	},
	{
		id: "mechanoegg",
		name: "机械蛋",
		art: "BOT_537",
		tier: 4,
		tribe: "mech",
		atk: 0,
		hp: 5,
		keywords: [],
		effects: [{
			kind: "deathrattle_summon",
			tokenId: "robosaur",
			count: 1
		}],
		text: "亡语：召唤一个 8/8 的机械暴龙。"
	},
	{
		id: "highmane",
		name: "长鬃草原狮",
		art: "EX1_534",
		tier: 4,
		tribe: "beast",
		atk: 6,
		hp: 5,
		keywords: [],
		effects: [{
			kind: "deathrattle_summon",
			tokenId: "hyena",
			count: 2
		}],
		text: "亡语：召唤两只 2/2 的土狼。"
	},
	{
		id: "argus",
		name: "阿古斯防御者",
		art: "EX1_093",
		tier: 4,
		tribe: "neutral",
		atk: 2,
		hp: 3,
		keywords: [],
		effects: [{
			kind: "battlecry_buff_adjacent",
			atk: 1,
			hp: 1,
			taunt: true
		}],
		text: "战吼：使相邻的随从获得嘲讽和 +1/+1。"
	},
	{
		id: "foereaper",
		name: "死神 4000 型",
		art: "GVG_016",
		tier: 4,
		tribe: "mech",
		atk: 6,
		hp: 9,
		keywords: ["cleave"],
		effects: [],
		text: "同时对攻击目标相邻的随从造成伤害。"
	},
	{
		id: "infestedwolf",
		name: "寄生恶狼",
		art: "OG_216",
		tier: 4,
		tribe: "beast",
		atk: 3,
		hp: 3,
		keywords: [],
		effects: [{
			kind: "deathrattle_summon",
			tokenId: "spider",
			count: 2
		}],
		text: "亡语：召唤两只 1/1 的蜘蛛。"
	},
	{
		id: "lightfang",
		name: "光牙执行者",
		art: "BGS_009",
		tier: 4,
		tribe: "neutral",
		atk: 2,
		hp: 2,
		keywords: [],
		effects: [{
			kind: "end_turn_buff_random",
			atk: 2,
			hp: 2
		}],
		text: "在你的回合结束时，使一个随机友方随从获得 +2/+2。"
	},
	{
		id: "voidlord",
		name: "虚空领主",
		art: "LOOT_368",
		tier: 5,
		tribe: "demon",
		atk: 3,
		hp: 9,
		keywords: ["taunt"],
		effects: [{
			kind: "deathrattle_summon",
			tokenId: "voidwalker",
			count: 3
		}],
		text: "嘲讽。亡语：召唤三个 1/3 并具有嘲讽的虚空行者。"
	},
	{
		id: "baron",
		name: "瑞文戴尔男爵",
		art: "FP1_031",
		tier: 5,
		tribe: "neutral",
		atk: 1,
		hp: 7,
		keywords: [],
		effects: [{ kind: "baron" }],
		text: "你的亡语会触发两次。"
	},
	{
		id: "brann",
		name: "布莱恩·铜须",
		art: "LOE_077",
		tier: 5,
		tribe: "neutral",
		atk: 2,
		hp: 4,
		keywords: [],
		effects: [{ kind: "brann" }],
		text: "你的战吼会触发两次。"
	},
	{
		id: "maexxna",
		name: "迈克斯纳",
		art: "FP1_010",
		tier: 5,
		tribe: "beast",
		atk: 2,
		hp: 8,
		keywords: ["poisonous"],
		effects: [],
		text: "剧毒。"
	},
	{
		id: "siegebreaker",
		name: "攻城恶魔",
		art: "EX1_185",
		tier: 5,
		tribe: "demon",
		atk: 6,
		hp: 8,
		keywords: ["taunt"],
		effects: [{
			kind: "start_combat_aura_tribe",
			tribe: "demon",
			atk: 1,
			hp: 0
		}],
		text: "嘲讽。你的其他恶魔获得 +1 攻击力。"
	},
	{
		id: "goldrinn",
		name: "戈德林",
		art: "BGS_018",
		tier: 5,
		tribe: "beast",
		atk: 4,
		hp: 4,
		keywords: [],
		effects: [{
			kind: "deathrattle_buff_all",
			atk: 5,
			hp: 5,
			tribe: "beast"
		}],
		text: "亡语：使你的野兽获得 +5/+5。"
	},
	{
		id: "malganis",
		name: "玛尔加尼斯",
		art: "GVG_021",
		tier: 6,
		tribe: "demon",
		atk: 9,
		hp: 7,
		keywords: [],
		effects: [{
			kind: "start_combat_aura_tribe",
			tribe: "demon",
			atk: 2,
			hp: 2
		}],
		text: "你的其他恶魔获得 +2/+2。"
	},
	{
		id: "sneeds",
		name: "斯尼德的挖掘机",
		art: "GVG_114",
		tier: 6,
		tribe: "mech",
		atk: 5,
		hp: 7,
		keywords: [],
		effects: [{ kind: "deathrattle_summon_random_high" }],
		text: "亡语：召唤一个随机的高级随从。"
	},
	{
		id: "megasaur",
		name: "温顺的巨化兽",
		art: "UNG_089",
		tier: 6,
		tribe: "beast",
		atk: 5,
		hp: 4,
		keywords: [],
		effects: [{
			kind: "battlecry_adapt_beasts",
			atk: 2,
			hp: 2
		}],
		text: "战吼：使你的野兽获得 +2/+2 和圣盾。"
	},
	{
		id: "ragnaros",
		name: "拉格纳罗斯",
		art: "EX1_298",
		tier: 6,
		tribe: "neutral",
		atk: 8,
		hp: 8,
		keywords: [],
		effects: [{
			kind: "start_combat_damage_random",
			damage: 8
		}],
		text: "战斗开始时，对一个随机敌方随从造成 8 点伤害。"
	},
	{
		id: "illidan",
		name: "伊利丹·怒风",
		art: "EX1_614",
		tier: 6,
		tribe: "demon",
		atk: 7,
		hp: 5,
		keywords: [],
		effects: [{
			kind: "on_friendly_summon_token",
			tokenId: "azzinoth"
		}],
		text: "在你召唤一个随从后，召唤一个 2/1 的埃辛诺斯之焰。"
	},
	{
		id: "mamabear",
		name: "熊妈妈",
		art: "BGS_021",
		tier: 6,
		tribe: "beast",
		atk: 4,
		hp: 4,
		keywords: [],
		effects: [{
			kind: "on_summon_buff",
			tribe: "beast",
			atk: 5,
			hp: 5
		}],
		text: "每当你召唤一个野兽，使其获得 +5/+5。"
	},
	{
		id: "nadina",
		name: "纳迪娜",
		art: "BGS_040",
		tier: 6,
		tribe: "dragon",
		atk: 7,
		hp: 4,
		keywords: [],
		effects: [{
			kind: "deathrattle_divine_shield_tribe",
			tribe: "dragon"
		}],
		text: "亡语：使你的龙获得圣盾。"
	},
	{
		id: "impmama",
		name: "小鬼妈妈",
		art: "BGS_044",
		tier: 6,
		tribe: "demon",
		atk: 6,
		hp: 10,
		keywords: [],
		effects: [{ kind: "on_damaged_summon_random_demon" }],
		text: "每当本随从受到伤害，召唤一个随机恶魔。"
	},
	{
		id: "eliza",
		name: "艾丽莎提督",
		art: "BGS_081",
		tier: 6,
		tribe: "pirate",
		atk: 6,
		hp: 7,
		keywords: [],
		effects: [{
			kind: "after_attack_buff_tribe",
			tribe: "pirate",
			atk: 1,
			hp: 1
		}],
		text: "在一个友方海盗攻击后，使你的海盗获得 +1/+1。"
	},
	{
		id: "tabbycat",
		name: "虎斑猫",
		art: "CFM_315t",
		tier: 1,
		tribe: "beast",
		atk: 1,
		hp: 1,
		keywords: [],
		effects: [],
		text: "",
		token: true
	},
	{
		id: "pirate_pal",
		name: "海盗水手",
		art: "CS2_146",
		tier: 1,
		tribe: "pirate",
		atk: 1,
		hp: 1,
		keywords: [],
		effects: [],
		text: "",
		token: true
	},
	{
		id: "damaged_golem",
		name: "损坏的傀儡",
		art: "skele21",
		tier: 1,
		tribe: "mech",
		atk: 2,
		hp: 1,
		keywords: [],
		effects: [],
		text: "",
		token: true
	},
	{
		id: "murloc_scout",
		name: "鱼人斥候",
		art: "EX1_506a",
		tier: 1,
		tribe: "murloc",
		atk: 1,
		hp: 1,
		keywords: [],
		effects: [],
		text: "",
		token: true
	},
	{
		id: "microbot",
		name: "微型机器人",
		art: "BOT_312t",
		tier: 1,
		tribe: "mech",
		atk: 1,
		hp: 1,
		keywords: [],
		effects: [],
		text: "",
		token: true
	},
	{
		id: "bigbadwolf",
		name: "大灰狼",
		art: "KAR_005a",
		tier: 1,
		tribe: "beast",
		atk: 3,
		hp: 2,
		keywords: [],
		effects: [],
		text: "",
		token: true
	},
	{
		id: "robosaur",
		name: "机械暴龙",
		art: "BOT_537t",
		tier: 1,
		tribe: "mech",
		atk: 8,
		hp: 8,
		keywords: [],
		effects: [],
		text: "",
		token: true
	},
	{
		id: "hyena",
		name: "土狼",
		art: "EX1_534t",
		tier: 1,
		tribe: "beast",
		atk: 2,
		hp: 2,
		keywords: [],
		effects: [],
		text: "",
		token: true
	},
	{
		id: "spider",
		name: "幽灵蜘蛛",
		art: "FP1_002t",
		tier: 1,
		tribe: "beast",
		atk: 1,
		hp: 1,
		keywords: [],
		effects: [],
		text: "",
		token: true
	},
	{
		id: "voidwalker",
		name: "虚空行者",
		art: "CS2_065",
		tier: 1,
		tribe: "demon",
		atk: 1,
		hp: 3,
		keywords: ["taunt"],
		effects: [],
		text: "嘲讽。",
		token: true
	},
	{
		id: "azzinoth",
		name: "埃辛诺斯之焰",
		art: "EX1_614t",
		tier: 1,
		tribe: "demon",
		atk: 2,
		hp: 1,
		keywords: [],
		effects: [],
		text: "",
		token: true
	}
];
var MINION_BY_ID = Object.fromEntries(MINIONS.map((m) => [m.id, m]));
var COLLECTIBLE = MINIONS.filter((m) => !m.token);
var BY_TIER = {
	1: COLLECTIBLE.filter((m) => m.tier === 1),
	2: COLLECTIBLE.filter((m) => m.tier === 2),
	3: COLLECTIBLE.filter((m) => m.tier === 3),
	4: COLLECTIBLE.filter((m) => m.tier === 4),
	5: COLLECTIBLE.filter((m) => m.tier === 5),
	6: COLLECTIBLE.filter((m) => m.tier === 6)
};
var COPIES_PER_TIER = [
	0,
	16,
	15,
	13,
	11,
	9,
	7
];
var SHOP_SIZE = [
	0,
	3,
	4,
	4,
	5,
	5,
	6
];
var UPGRADE_BASE = [
	0,
	5,
	7,
	8,
	9,
	10
];
function defOf(id) {
	const d = MINION_BY_ID[id];
	if (!d) throw new Error(`Unknown minion ${id}`);
	return d;
}
function makeInst(defId, golden = false) {
	const d = defOf(defId);
	const atk = golden ? d.atk * 2 : d.atk;
	const hp = golden ? d.hp * 2 : d.hp;
	return {
		uid: uid("m"),
		defId,
		atk,
		hp,
		maxHp: hp,
		golden,
		keywords: [...d.keywords]
	};
}
function scaleN(n, golden) {
	return golden ? n * 2 : n;
}
function artUrl(art) {
	return `/art/${art}.jpg`;
}
function minionValue(m) {
	const d = defOf(m.defId);
	let v = d.tier * 10 + m.atk * 2 + m.hp;
	if (m.keywords.includes("taunt")) v += 3;
	if (m.keywords.includes("divineShield")) v += 5;
	if (m.keywords.includes("poisonous")) v += 8;
	if (m.keywords.includes("reborn")) v += 6;
	if (m.keywords.includes("cleave")) v += 6;
	if (m.golden) v += 18;
	if (d.effects.length) v += d.effects.length * 4;
	return v;
}
var MAX_STEPS = 90;
var DUR = {
	announce: 380,
	attack: 520,
	damage: 180,
	buff: 160,
	summon: 280,
	death: 280,
	reborn: 320,
	end: 500
};
function hasKw(kws, k) {
	return kws.includes(k);
}
function toCombatMinion(m, owner) {
	const d = defOf(m.defId);
	return {
		uid: uid("c"),
		defId: m.defId,
		name: d.name,
		art: d.art,
		tribe: d.tribe,
		atk: m.atk,
		hp: m.hp,
		maxHp: m.maxHp,
		golden: m.golden,
		taunt: hasKw(m.keywords, "taunt"),
		divineShield: hasKw(m.keywords, "divineShield"),
		windfury: hasKw(m.keywords, "windfury"),
		poisonous: hasKw(m.keywords, "poisonous"),
		reborn: hasKw(m.keywords, "reborn"),
		cleave: hasKw(m.keywords, "cleave"),
		effects: d.effects.map((e) => ({ ...e })),
		owner,
		dead: false
	};
}
function living(board) {
	return board.filter((m) => !m.dead && m.hp > 0);
}
function simulateCombat(playerBoard, enemyBoard, playerTier, enemyTier, rng) {
	const playerStart = playerBoard.map((m) => toCombatMinion(m, "player"));
	const enemyStart = enemyBoard.map((m) => toCombatMinion(m, "enemy"));
	const sim = new CombatSim(playerStart.map((m) => ({
		...m,
		effects: m.effects.map((e) => ({ ...e }))
	})), enemyStart.map((m) => ({
		...m,
		effects: m.effects.map((e) => ({ ...e }))
	})), rng);
	sim.startOfCombat();
	const pCount = living(sim.player).length;
	const eCount = living(sim.enemy).length;
	let attacker = pCount > eCount ? "player" : eCount > pCount ? "enemy" : rng.chance(.5) ? "player" : "enemy";
	sim.log({
		type: "announce",
		at: 0,
		text: attacker === "player" ? "你先手攻击" : "对手先手攻击"
	});
	const nextIdx = {
		player: 0,
		enemy: 0
	};
	let steps = 0;
	while (living(sim.player).length && living(sim.enemy).length && steps < MAX_STEPS) {
		steps++;
		const board = sim.board(attacker);
		const start = nextIdx[attacker];
		const atkMinion = sim.nextAttacker(board, start);
		if (!atkMinion) {
			attacker = attacker === "player" ? "enemy" : "player";
			continue;
		}
		const attacks = atkMinion.windfury ? 2 : 1;
		for (let a = 0; a < attacks; a++) {
			if (atkMinion.dead || atkMinion.hp <= 0) break;
			if (!living(sim.board(sim.opp(attacker))).length) break;
			sim.performAttack(atkMinion);
		}
		const idx = sim.board(attacker).findIndex((m) => m.uid === atkMinion.uid);
		nextIdx[attacker] = idx === -1 ? start : idx + 1;
		attacker = attacker === "player" ? "enemy" : "player";
	}
	const pLeft = living(sim.player);
	const eLeft = living(sim.enemy);
	let winner = "tie";
	let damage = 0;
	if (pLeft.length && !eLeft.length) {
		winner = "player";
		damage = enemyTier + eLeft.length + pLeft.reduce((s, m) => s + defOf(m.defId).tier, 0);
		damage = playerTier + pLeft.reduce((s, m) => s + Math.max(1, defOf(m.defId).tier), 0);
	} else if (eLeft.length && !pLeft.length) {
		winner = "enemy";
		damage = enemyTier + eLeft.reduce((s, m) => s + Math.max(1, defOf(m.defId).tier), 0);
	}
	sim.log({
		type: "end",
		at: 0,
		winner,
		damage,
		playerLeft: pLeft.length,
		enemyLeft: eLeft.length
	});
	return {
		events: sim.events,
		winner,
		damage,
		playerFinal: sim.player.filter((m) => !m.dead),
		enemyFinal: sim.enemy.filter((m) => !m.dead),
		opponentId: "",
		playerStart,
		enemyStart,
		ghost: false
	};
}
var CombatSim = class {
	player;
	enemy;
	events = [];
	time = 0;
	rng;
	summonDepth = 0;
	constructor(player, enemy, rng) {
		this.player = player;
		this.enemy = enemy;
		this.rng = rng;
	}
	log(e) {
		const ev = {
			...e,
			at: this.time
		};
		this.events.push(ev);
		this.time += DUR[e.type] ?? 200;
	}
	board(side) {
		return side === "player" ? this.player : this.enemy;
	}
	setBoard(side, b) {
		if (side === "player") this.player = b;
		else this.enemy = b;
	}
	opp(side) {
		return side === "player" ? "enemy" : "player";
	}
	nextAttacker(board, start) {
		const live = living(board);
		if (!live.length) return null;
		const n = board.length;
		for (let i = 0; i < n; i++) {
			const m = board[(start + i) % n];
			if (m && !m.dead && m.hp > 0 && m.atk > 0) return m;
		}
		for (const m of live) if (m.atk > 0) return m;
		return live[0] ?? null;
	}
	validTargets(side) {
		const foes = living(this.board(this.opp(side)));
		const taunts = foes.filter((m) => m.taunt);
		return taunts.length ? taunts : foes;
	}
	startOfCombat() {
		for (const side of ["player", "enemy"]) {
			const board = living(this.board(side));
			for (let i = 0; i < board.length; i++) {
				const m = board[i];
				for (const fx of m.effects) {
					if (fx.kind === "start_combat_aura_adjacent") {
						const full = living(this.board(side));
						const idx = full.findIndex((x) => x.uid === m.uid);
						for (const n of [idx - 1, idx + 1]) {
							const t = full[n];
							if (t) this.buff(t, scaleN(fx.atk, m.golden), 0);
						}
					}
					if (fx.kind === "start_combat_aura_tribe") for (const t of living(this.board(side))) {
						if (t.uid === m.uid) continue;
						if (t.tribe === fx.tribe) this.buff(t, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden));
					}
				}
			}
		}
		for (const side of ["player", "enemy"]) {
			for (const m of living(this.board(side))) for (const fx of m.effects) if (fx.kind === "start_combat_damage_random") {
				const foes = living(this.board(this.opp(side)));
				if (foes.length) {
					const t = this.rng.pick(foes);
					this.dealDamage(m, t, scaleN(fx.damage, m.golden), false);
				}
			}
			this.collectDeaths();
		}
	}
	performAttack(attacker) {
		const targets = this.validTargets(attacker.owner);
		if (!targets.length) return;
		const target = this.rng.pick(targets);
		this.log({
			type: "attack",
			at: 0,
			attackerUid: attacker.uid,
			targetUid: target.uid
		});
		const foes = living(this.board(this.opp(attacker.owner)));
		const tIdx = foes.findIndex((m) => m.uid === target.uid);
		const cleaveTargets = [target];
		if (attacker.cleave) {
			if (tIdx > 0 && foes[tIdx - 1]) cleaveTargets.push(foes[tIdx - 1]);
			if (tIdx < foes.length - 1 && foes[tIdx + 1]) cleaveTargets.push(foes[tIdx + 1]);
		}
		for (const t of cleaveTargets) this.dealDamage(attacker, t, attacker.atk, attacker.poisonous);
		if (!target.dead && target.hp > 0 && target.atk > 0) this.dealDamage(target, attacker, target.atk, target.poisonous);
		this.collectDeaths();
		if (!attacker.dead && attacker.hp > 0) {
			for (const fx of attacker.effects) if (fx.kind === "after_attack_buff_tribe") {
				for (const ally of living(this.board(attacker.owner))) if (ally.tribe === fx.tribe) this.buff(ally, scaleN(fx.atk, attacker.golden), scaleN(fx.hp, attacker.golden));
			}
		}
	}
	dealDamage(source, target, amount, poisonous) {
		if (amount <= 0 || target.dead) return;
		if (target.divineShield) {
			target.divineShield = false;
			this.log({
				type: "damage",
				at: 0,
				uid: target.uid,
				amount: 0,
				shieldPop: true,
				hpAfter: target.hp
			});
			return;
		}
		target.hp -= amount;
		if (poisonous) target.hp = 0;
		this.log({
			type: "damage",
			at: 0,
			uid: target.uid,
			amount,
			shieldPop: false,
			hpAfter: Math.max(0, target.hp)
		});
		if (target.hp > 0) {
			for (const fx of target.effects) if (fx.kind === "on_damaged_summon_random_demon") {
				const demons = COLLECTIBLE.filter((d) => d.tribe === "demon" && d.tier <= 5);
				const pick = this.rng.pick(demons);
				this.summonToken(target.owner, pick.id, false, this.insertIndex(target), false);
			}
		}
	}
	buff(t, atk, hp) {
		t.atk += atk;
		t.hp += hp;
		t.maxHp += hp;
		this.log({
			type: "buff",
			at: 0,
			uid: t.uid,
			atk,
			hp
		});
	}
	insertIndex(deadOrRef) {
		const board = this.board(deadOrRef.owner);
		const i = board.findIndex((m) => m.uid === deadOrRef.uid);
		return i === -1 ? board.length : i + 1;
	}
	baronCount(side) {
		let n = 0;
		for (const m of living(this.board(side))) if (m.effects.some((e) => e.kind === "baron")) n += m.golden ? 2 : 1;
		return n;
	}
	collectDeaths() {
		const dying = [];
		for (const side of ["player", "enemy"]) for (const m of this.board(side)) if (!m.dead && m.hp <= 0) dying.push(m);
		for (const m of dying) {
			if (m.dead) continue;
			m.dead = true;
			this.log({
				type: "death",
				at: 0,
				uid: m.uid
			});
			const times = 1 + this.baronCount(m.owner);
			for (let i = 0; i < times; i++) this.runDeathrattles(m);
			if (m.reborn) {
				m.dead = false;
				m.hp = 1;
				m.maxHp = 1;
				m.reborn = false;
				m.divineShield = hasKw(defOf(m.defId).keywords, "divineShield") && m.golden;
				this.log({
					type: "reborn",
					at: 0,
					uid: m.uid,
					hp: 1
				});
			}
		}
		for (const side of ["player", "enemy"]) this.setBoard(side, this.board(side).filter((m) => !m.dead));
	}
	runDeathrattles(m) {
		const side = m.owner;
		const insertAt = this.insertIndex(m);
		for (const fx of m.effects) switch (fx.kind) {
			case "deathrattle_summon": {
				const count = scaleN(fx.count, m.golden);
				for (let i = 0; i < count; i++) this.summonToken(side, fx.tokenId, m.golden, insertAt + i, true);
				break;
			}
			case "deathrattle_summon_attack": {
				const summoned = this.summonToken(side, fx.tokenId, m.golden, insertAt, true);
				if (summoned) this.performAttack(summoned);
				break;
			}
			case "deathrattle_buff_all":
				for (const t of living(this.board(side))) {
					if (fx.tribe && t.tribe !== fx.tribe) continue;
					this.buff(t, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden));
				}
				break;
			case "deathrattle_damage_random": {
				const foes = living(this.board(this.opp(side)));
				if (foes.length) this.dealDamage(m, this.rng.pick(foes), scaleN(fx.damage, m.golden), false);
				break;
			}
			case "deathrattle_damage_all": {
				const all = [...living(this.player), ...living(this.enemy)];
				for (const t of all) this.dealDamage(m, t, scaleN(fx.damage, m.golden), false);
				break;
			}
			case "deathrattle_divine_shield_tribe":
				for (const t of living(this.board(side))) if (t.tribe === fx.tribe) t.divineShield = true;
				break;
			case "deathrattle_summon_random_high": {
				const pool = COLLECTIBLE.filter((d) => d.tier >= 4);
				const pick = this.rng.pick(pool);
				this.summonToken(side, pick.id, false, insertAt, true);
				break;
			}
		}
		this.collectDeaths();
	}
	summonToken(side, defId, golden, index, triggerSummon) {
		const board = this.board(side);
		if (living(board).length >= 7) return null;
		const d = MINION_BY_ID[defId];
		if (!d) return null;
		const cm = toCombatMinion({
			uid: uid("c"),
			defId,
			atk: golden ? d.atk * 2 : d.atk,
			hp: golden ? d.hp * 2 : d.hp,
			maxHp: golden ? d.hp * 2 : d.hp,
			golden,
			keywords: [...d.keywords]
		}, side);
		const insert = Math.max(0, Math.min(index, board.length));
		board.splice(insert, 0, cm);
		this.log({
			type: "summon",
			at: 0,
			owner: side,
			minion: { ...cm },
			index: insert
		});
		if (triggerSummon && this.summonDepth < 4) {
			this.summonDepth++;
			this.onSummoned(cm);
			this.summonDepth--;
		}
		return cm;
	}
	onSummoned(newbie) {
		const board = living(this.board(newbie.owner));
		for (const m of board) {
			if (m.uid === newbie.uid) continue;
			for (const fx of m.effects) {
				if (fx.kind === "on_summon_buff" && newbie.tribe === fx.tribe) this.buff(newbie, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden));
				if (fx.kind === "on_friendly_summon_token" && newbie.defId !== fx.tokenId) this.summonToken(newbie.owner, fx.tokenId, m.golden, this.insertIndex(newbie), false);
			}
		}
	}
};
function applyBattlecry(board, played, playIndex, rng, extraTimes) {
	const d = defOf(played.defId);
	const times = 1 + extraTimes;
	let next = board;
	for (let t = 0; t < times; t++) for (const fx of d.effects) next = runBattlecry(next, played, playIndex, fx, rng);
	return next;
}
function runBattlecry(board, played, playIndex, fx, rng) {
	const g = played.golden;
	switch (fx.kind) {
		case "battlecry_summon": {
			if (board.length >= 7) return board;
			const token = makeBoardToken(fx.tokenId, g);
			const copy = board.slice();
			copy.splice(Math.min(playIndex + 1, copy.length), 0, token);
			return applyOnSummonBuffs(copy, token).slice(0, 7);
		}
		case "battlecry_buff_tribe": {
			const cands = board.filter((m) => m.uid !== played.uid && defOf(m.defId).tribe === fx.tribe);
			if (!cands.length) {
				if (defOf(played.defId).tribe === fx.tribe) return board.map((m) => m.uid === played.uid ? buffInst(m, scaleN(fx.atk, g), scaleN(fx.hp, g)) : m);
				return board;
			}
			const t = rng.pick(cands);
			return board.map((m) => m.uid === t.uid ? buffInst(m, scaleN(fx.atk, g), scaleN(fx.hp, g)) : m);
		}
		case "battlecry_buff_others": return board.map((m) => {
			if (m.uid === played.uid) return m;
			if (fx.tribe && defOf(m.defId).tribe !== fx.tribe) return m;
			return buffInst(m, scaleN(fx.atk, g), scaleN(fx.hp, g));
		});
		case "battlecry_buff_adjacent": return board.map((m, i) => {
			if (Math.abs(i - playIndex) === 1) {
				let n = buffInst(m, scaleN(fx.atk, g), scaleN(fx.hp, g));
				if (fx.taunt && !n.keywords.includes("taunt")) n = {
					...n,
					keywords: [...n.keywords, "taunt"]
				};
				return n;
			}
			return m;
		});
		case "battlecry_adapt_beasts": return board.map((m) => {
			if (defOf(m.defId).tribe !== "beast") return m;
			let n = buffInst(m, scaleN(fx.atk, g), scaleN(fx.hp, g));
			if (!n.keywords.includes("divineShield")) n = {
				...n,
				keywords: [...n.keywords, "divineShield"]
			};
			return n;
		});
		default: return board;
	}
}
function makeBoardToken(defId, golden) {
	const d = defOf(defId);
	const atk = golden ? d.atk * 2 : d.atk;
	const hp = golden ? d.hp * 2 : d.hp;
	return {
		uid: uid("m"),
		defId,
		atk,
		hp,
		maxHp: hp,
		golden,
		keywords: [...d.keywords]
	};
}
function buffInst(m, atk, hp) {
	return {
		...m,
		atk: m.atk + atk,
		hp: m.hp + hp,
		maxHp: m.maxHp + hp
	};
}
function applyOnSummonBuffs(board, newbie) {
	let extraAtk = 0;
	let extraHp = 0;
	const dNew = defOf(newbie.defId);
	for (const m of board) {
		if (m.uid === newbie.uid) continue;
		const d = defOf(m.defId);
		for (const fx of d.effects) if (fx.kind === "on_summon_buff" && dNew.tribe === fx.tribe) {
			extraAtk += scaleN(fx.atk, m.golden);
			extraHp += scaleN(fx.hp, m.golden);
		}
	}
	if (!extraAtk && !extraHp) return board;
	return board.map((m) => m.uid === newbie.uid ? buffInst(m, extraAtk, extraHp) : m);
}
function applyEndOfTurn(board, rng) {
	let next = board.map((m) => ({
		...m,
		keywords: [...m.keywords]
	}));
	for (const m of board) {
		const d = defOf(m.defId);
		for (const fx of d.effects) {
			if (fx.kind === "end_turn_buff_self") next = next.map((x) => x.uid === m.uid ? buffInst(x, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden)) : x);
			if (fx.kind === "end_turn_buff_random") {
				const others = next.filter((x) => x.uid !== m.uid);
				const t = others.length ? rng.pick(others) : next.find((x) => x.uid === m.uid);
				if (t) next = next.map((x) => x.uid === t.uid ? buffInst(x, scaleN(fx.atk, m.golden), scaleN(fx.hp, m.golden)) : x);
			}
		}
	}
	return next;
}
function brannExtra(board) {
	let n = 0;
	for (const m of board) if (defOf(m.defId).effects.some((e) => e.kind === "brann")) n += m.golden ? 2 : 1;
	return n;
}
function discoverPool(tier) {
	return (BY_TIER[Math.min(6, Math.max(1, tier))] ?? []).map((d) => ({
		uid: uid("d"),
		defId: d.id,
		atk: d.atk,
		hp: d.hp,
		maxHp: d.hp,
		golden: false,
		keywords: [...d.keywords]
	}));
}
var HEROES = [
	{
		id: "jaina",
		name: "吉安娜",
		title: "肯瑞托的总法师",
		art: "HERO_08"
	},
	{
		id: "rexxar",
		name: "雷克萨",
		title: "兽人猎手",
		art: "HERO_05"
	},
	{
		id: "valeera",
		name: "瓦莉拉",
		title: "暗影收割者",
		art: "HERO_03"
	},
	{
		id: "uther",
		name: "乌瑟尔",
		title: "圣光的勇士",
		art: "HERO_04"
	},
	{
		id: "guldan",
		name: "古尔丹",
		title: "毁灭之手",
		art: "HERO_07"
	},
	{
		id: "malfurion",
		name: "玛法里奥",
		title: "塞纳里奥",
		art: "HERO_06"
	},
	{
		id: "thrall",
		name: "萨尔",
		title: "大地之环",
		art: "HERO_02"
	},
	{
		id: "garrosh",
		name: "加尔鲁什",
		title: "战歌酋长",
		art: "HERO_01"
	}
];
var HERO_BY_ID = Object.fromEntries(HEROES.map((h) => [h.id, h]));
function heroArt(art) {
	return `/art/${art}.jpg`;
}
function createPool() {
	const pool = {};
	for (const m of COLLECTIBLE) pool[m.id] = COPIES_PER_TIER[m.tier] ?? 10;
	return pool;
}
function takeFromPool(pool, id) {
	if ((pool[id] ?? 0) <= 0) return false;
	pool[id] = (pool[id] ?? 0) - 1;
	return true;
}
function returnToPool(pool, m) {
	if (m.golden) return;
	if (defOf(m.defId).token) return;
	pool[m.defId] = (pool[m.defId] ?? 0) + 1;
}
function goldForTurn(turn) {
	return Math.min(10, turn + 2);
}
function makePlayer(id, heroId, name, isHuman) {
	return {
		id,
		name,
		heroId,
		hp: 30,
		tavernTier: 1,
		gold: goldForTurn(1),
		upgradeCost: UPGRADE_BASE[1] ?? 5,
		board: [],
		shop: [],
		frozen: false,
		isHuman,
		alive: true,
		placement: null,
		triples: 0
	};
}
function initLobby(humanHeroId, rng) {
	const humanHero = HEROES.find((h) => h.id === humanHeroId) ?? HEROES[0];
	const rest = shuffle(HEROES.filter((h) => h.id !== humanHero.id), rng);
	const players = [makePlayer("you", humanHero.id, humanHero.name, true)];
	for (let i = 0; i < 7; i++) {
		const h = rest[i];
		players.push(makePlayer(`ai-${i}`, h.id, h.name, false));
	}
	return players;
}
function rollShop(player, pool, rng) {
	const size = SHOP_SIZE[player.tavernTier] ?? 3;
	const kept = player.frozen ? player.shop.filter((m) => m.frozen) : [];
	const need = Math.max(0, size - kept.length);
	const available = [];
	for (let t = 1; t <= player.tavernTier; t++) for (const d of BY_TIER[t] ?? []) {
		const copies = pool[d.id] ?? 0;
		for (let i = 0; i < copies; i++) available.push(d.id);
	}
	const picked = [];
	const bag = shuffle(available, rng);
	for (const id of bag) {
		if (picked.length >= need) break;
		if (takeFromPool(pool, id)) picked.push(makeInst(id, false));
	}
	return [...kept.map((m) => ({
		...m,
		frozen: false
	})), ...picked];
}
function refreshShop(player, pool, rng) {
	if (player.gold < 1) return player;
	for (const m of player.shop) if (!m.frozen) returnToPool(pool, m);
	const next = {
		...player,
		gold: player.gold - 1,
		frozen: false
	};
	next.shop = rollShop({
		...next,
		frozen: false,
		shop: player.shop.filter((m) => m.frozen)
	}, pool, rng);
	return next;
}
function freezeShop(player) {
	const anyUnfrozen = player.shop.some((m) => !m.frozen);
	return {
		...player,
		frozen: anyUnfrozen,
		shop: player.shop.map((m) => ({
			...m,
			frozen: anyUnfrozen
		}))
	};
}
function freezeOne(player, uid) {
	return {
		...player,
		shop: player.shop.map((m) => m.uid === uid ? {
			...m,
			frozen: !m.frozen
		} : m),
		frozen: player.shop.some((m) => m.uid === uid ? !m.frozen : m.frozen)
	};
}
function upgradeTavern(player) {
	if (player.tavernTier >= 6) return player;
	if (player.gold < player.upgradeCost) return player;
	const tier = player.tavernTier + 1;
	return {
		...player,
		gold: player.gold - player.upgradeCost,
		tavernTier: tier,
		upgradeCost: UPGRADE_BASE[tier] ?? 0
	};
}
function startTurn(player, turn, pool, rng) {
	const gold = goldForTurn(turn);
	const upgradeCost = player.tavernTier >= 6 ? 0 : Math.max(0, player.upgradeCost - (turn === 1 ? 0 : 1));
	let next = {
		...player,
		gold,
		upgradeCost
	};
	const kept = next.frozen ? next.shop.filter((m) => m.frozen) : [];
	if (!next.frozen) for (const m of next.shop) returnToPool(pool, m);
	else for (const m of next.shop) if (!m.frozen) returnToPool(pool, m);
	next = {
		...next,
		shop: kept,
		frozen: kept.length > 0
	};
	next.shop = rollShop(next, pool, rng);
	return next;
}
function buyMinion(player, shopUid, rng) {
	if (player.gold < 3) return { player };
	if (player.board.length >= 7) return { player };
	const shopMinion = player.shop.find((m) => m.uid === shopUid);
	if (!shopMinion) return { player };
	let board = [...player.board, {
		...shopMinion,
		frozen: false
	}];
	board = applyOnSummonBuffs(board, shopMinion);
	const extra = brannExtra(player.board);
	board = applyBattlecry(board, shopMinion, board.length - 1, rng, extra);
	const shop = player.shop.filter((m) => m.uid !== shopUid);
	return tryTriple({
		...player,
		gold: player.gold - 3,
		board,
		shop
	});
}
function tryTriple(player) {
	const counts = /* @__PURE__ */ new Map();
	for (const m of player.board) {
		if (m.golden) continue;
		if (defOf(m.defId).token) continue;
		const arr = counts.get(m.defId) ?? [];
		arr.push(m);
		counts.set(m.defId, arr);
	}
	for (const m of player.shop) {
		if (m.golden) continue;
		if (defOf(m.defId).token) continue;
		const arr = counts.get(m.defId) ?? [];
		arr.push(m);
		counts.set(m.defId, arr);
	}
	for (const [defId, copies] of counts) {
		if (copies.length < 3) continue;
		const used = copies.slice(0, 3);
		const usedUids = new Set(used.map((m) => m.uid));
		const d = defOf(defId);
		const extraAtk = used.reduce((s, m) => s + (m.atk - d.atk), 0);
		const extraHp = used.reduce((s, m) => s + (m.hp - d.hp), 0);
		const golden = makeInst(defId, true);
		golden.atk += extraAtk;
		golden.hp += extraHp;
		golden.maxHp = golden.hp;
		const kw = /* @__PURE__ */ new Set();
		for (const m of used) for (const k of m.keywords) kw.add(k);
		golden.keywords = [...kw];
		let board = player.board.filter((m) => !usedUids.has(m.uid));
		const shop = player.shop.filter((m) => !usedUids.has(m.uid));
		if (board.length < 7) board = [...board, golden];
		else shop.push(golden);
		return {
			player: {
				...player,
				board,
				shop,
				triples: player.triples + 1
			},
			triple: {
				golden,
				sourceTier: d.tier
			}
		};
	}
	return { player };
}
function sellMinion(player, boardUid, pool) {
	const m = player.board.find((x) => x.uid === boardUid);
	if (!m) return player;
	returnToPool(pool, m);
	return {
		...player,
		gold: Math.min(10, player.gold + 1),
		board: player.board.filter((x) => x.uid !== boardUid)
	};
}
function moveMinion(player, fromUid, toIndex) {
	const from = player.board.findIndex((m) => m.uid === fromUid);
	if (from < 0) return player;
	const board = player.board.slice();
	const [item] = board.splice(from, 1);
	if (!item) return player;
	const idx = Math.max(0, Math.min(toIndex, board.length));
	board.splice(idx, 0, item);
	return {
		...player,
		board
	};
}
function addDiscovered(player, defId, rng) {
	if (player.board.length >= 7) {
		if (player.shop.length < (SHOP_SIZE[player.tavernTier] ?? 6)) return {
			...player,
			shop: [...player.shop, makeInst(defId, false)]
		};
		return player;
	}
	const inst = makeInst(defId, false);
	let board = [...player.board, inst];
	board = applyOnSummonBuffs(board, inst);
	board = applyBattlecry(board, inst, board.length - 1, rng, brannExtra(player.board));
	return tryTriple({
		...player,
		board
	}).player;
}
function pickDiscoverOptions(tier, rng) {
	return shuffle(discoverPool(Math.min(6, tier + 1)), rng).slice(0, 3);
}
function pairPlayers(aliveIds, rng, lastGhost) {
	const ids = shuffle(aliveIds, rng);
	const pairs = [];
	if (ids.length % 2 === 1) {
		const leftover = ids.pop();
		const ghost = lastGhost && lastGhost !== leftover ? lastGhost : ids[0] ?? leftover;
		pairs.push({
			a: leftover,
			b: ghost,
			ghost: true
		});
	}
	for (let i = 0; i < ids.length; i += 2) pairs.push({
		a: ids[i],
		b: ids[i + 1]
	});
	return pairs;
}
function finishTurnBoards(player, rng) {
	return {
		...player,
		board: applyEndOfTurn(player.board, rng)
	};
}
function wantsTriple(p, defId) {
	return p.board.filter((m) => m.defId === defId && !m.golden).length >= 2;
}
function aiPlayTurn(player, pool, rng) {
	let p = player;
	let guard = 24;
	while (guard-- > 0) {
		const shopBuyable = p.shop.map((m) => ({
			m,
			v: minionValue(m) + (wantsTriple(p, m.defId) ? 40 : 0)
		})).sort((a, b) => b.v - a.v);
		const canBuy = p.gold >= 3 && shopBuyable.length > 0;
		const best = shopBuyable[0];
		if (p.tavernTier < 6 && p.gold >= p.upgradeCost && (p.board.length >= Math.min(4, p.tavernTier + 1) || p.upgradeCost <= 4) && (p.gold - p.upgradeCost >= 3 || p.board.length >= 3) && rng.chance(p.tavernTier <= 2 ? .7 : .55)) {
			p = upgradeTavern(p);
			continue;
		}
		if (canBuy && best) {
			if (p.board.length < 7) {
				const res = buyMinion(p, best.m.uid, rng);
				if (res.player !== p) {
					p = res.player;
					continue;
				}
			} else {
				const worst = [...p.board].sort((a, b) => minionValue(a) - minionValue(b))[0];
				if (worst && minionValue(best.m) > minionValue(worst) + 6) {
					p = sellMinion(p, worst.uid, pool);
					continue;
				}
			}
		}
		if (p.gold >= 1 + (p.board.length < 7 ? 3 : 0) && p.gold >= 1) {
			if (p.shop.reduce((s, m) => s + minionValue(m), 0) / Math.max(1, p.shop.length) < 12 + p.tavernTier * 4 || p.board.length < 3) {
				const before = p.shop.map((m) => m.uid).join();
				p = refreshShop(p, pool, rng);
				if (p.shop.map((m) => m.uid).join() !== before) continue;
			}
		}
		if (p.tavernTier < 6 && p.gold >= p.upgradeCost) {
			p = upgradeTavern(p);
			continue;
		}
		break;
	}
	if (p.gold <= 1 && p.shop.some((m) => minionValue(m) >= 18 + p.tavernTier * 2)) p = freezeShop(p);
	const board = [...p.board].sort((a, b) => {
		const ta = a.keywords.includes("taunt") ? 1 : 0;
		const tb = b.keywords.includes("taunt") ? 1 : 0;
		if (ta !== tb) return tb - ta;
		return b.atk - a.atk || defOf(b.defId).tier - defOf(a.defId).tier;
	});
	p = {
		...p,
		board
	};
	return p;
}
var ctx = null;
var master = null;
var muted = false;
function unlockAudio() {
	if (!ctx) {
		ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
		master = ctx.createGain();
		master.gain.value = .22;
		master.connect(ctx.destination);
	}
	if (ctx.state === "suspended") ctx.resume();
}
function setMuted(v) {
	muted = v;
	if (master && ctx) master.gain.setTargetAtTime(v ? 0 : .22, ctx.currentTime, .02);
}
function beep(tones) {
	if (!ctx || !master || muted) return;
	const now = ctx.currentTime;
	for (const tn of tones) {
		const osc = ctx.createOscillator();
		const g = ctx.createGain();
		osc.type = tn.type ?? "square";
		osc.frequency.setValueAtTime(tn.f, now + tn.t);
		g.gain.setValueAtTime(1e-4, now + tn.t);
		g.gain.exponentialRampToValueAtTime(tn.g ?? .4, now + tn.t + .012);
		g.gain.exponentialRampToValueAtTime(1e-4, now + tn.t + tn.d);
		osc.connect(g);
		g.connect(master);
		osc.start(now + tn.t);
		osc.stop(now + tn.t + tn.d + .02);
	}
}
function noise(dur, gain = .2) {
	if (!ctx || !master || muted) return;
	const n = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
	const data = n.getChannelData(0);
	for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
	const src = ctx.createBufferSource();
	src.buffer = n;
	const g = ctx.createGain();
	g.gain.value = gain;
	src.connect(g);
	g.connect(master);
	src.start();
}
var sfx = {
	click: () => beep([{
		f: 620,
		t: 0,
		d: .04,
		type: "triangle",
		g: .18
	}]),
	coin: () => beep([{
		f: 880,
		t: 0,
		d: .07,
		type: "triangle",
		g: .28
	}, {
		f: 1320,
		t: .05,
		d: .08,
		type: "triangle",
		g: .22
	}]),
	buy: () => beep([{
		f: 392,
		t: 0,
		d: .08,
		type: "square",
		g: .2
	}, {
		f: 523,
		t: .07,
		d: .1,
		type: "square",
		g: .2
	}]),
	sell: () => beep([{
		f: 240,
		t: 0,
		d: .1,
		type: "sawtooth",
		g: .12
	}]),
	refresh: () => beep([
		{
			f: 480,
			t: 0,
			d: .05,
			type: "triangle"
		},
		{
			f: 560,
			t: .05,
			d: .05,
			type: "triangle"
		},
		{
			f: 640,
			t: .1,
			d: .08,
			type: "triangle"
		}
	]),
	upgrade: () => beep([
		{
			f: 330,
			t: 0,
			d: .1,
			type: "square",
			g: .22
		},
		{
			f: 415,
			t: .1,
			d: .1,
			type: "square",
			g: .22
		},
		{
			f: 523,
			t: .2,
			d: .16,
			type: "square",
			g: .24
		}
	]),
	freeze: () => beep([{
		f: 1100,
		t: 0,
		d: .12,
		type: "sine",
		g: .16
	}]),
	hit: () => {
		noise(.08, .18);
		beep([{
			f: 140,
			t: 0,
			d: .09,
			type: "sawtooth",
			g: .3
		}]);
	},
	death: () => beep([{
		f: 90,
		t: 0,
		d: .22,
		type: "sawtooth",
		g: .28
	}]),
	win: () => beep([
		{
			f: 523,
			t: 0,
			d: .12,
			type: "triangle",
			g: .24
		},
		{
			f: 659,
			t: .12,
			d: .12,
			type: "triangle",
			g: .24
		},
		{
			f: 784,
			t: .24,
			d: .22,
			type: "triangle",
			g: .28
		}
	]),
	lose: () => beep([{
		f: 330,
		t: 0,
		d: .14,
		type: "triangle",
		g: .2
	}, {
		f: 247,
		t: .14,
		d: .2,
		type: "triangle",
		g: .2
	}]),
	triple: () => beep([
		{
			f: 698,
			t: 0,
			d: .1,
			type: "square",
			g: .22
		},
		{
			f: 880,
			t: .1,
			d: .1,
			type: "square",
			g: .22
		},
		{
			f: 1046,
			t: .2,
			d: .18,
			type: "square",
			g: .26
		}
	])
};
var rng = createRng(Date.now());
var pool = createPool();
function withYou(players, youId, fn) {
	return players.map((p) => p.id === youId ? fn(p) : p);
}
var useGame = create((set, get) => ({
	phase: "menu",
	turn: 1,
	players: [],
	youId: "you",
	selectedShop: null,
	selectedBoard: null,
	combat: null,
	combatCursor: 0,
	combatEvents: [],
	discover: [],
	toast: null,
	muted: false,
	speed: 1,
	nextPlace: 8,
	lastOpponent: null,
	help: false,
	seed: 0,
	you: () => get().players.find((p) => p.id === get().youId),
	startSelect: () => {
		unlockAudio();
		sfx.click();
		set({ phase: "hero-select" });
	},
	pickHero: (heroId) => {
		unlockAudio();
		sfx.buy();
		const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
		rng = createRng(seed);
		pool = createPool();
		const players = initLobby(heroId, rng);
		const turn = 1;
		set({
			phase: "tavern",
			turn,
			players: players.map((p) => startTurn(p, turn, pool, rng)).map((p) => p.isHuman ? p : aiPlayTurn(p, pool, rng)),
			youId: "you",
			selectedShop: null,
			selectedBoard: null,
			combat: null,
			discover: [],
			nextPlace: 8,
			lastOpponent: null,
			seed,
			toast: `${HERO_BY_ID[heroId]?.name ?? "英雄"} 进入酒馆`
		});
	},
	selectShop: (uid) => set({
		selectedShop: uid,
		selectedBoard: null
	}),
	selectBoard: (uid) => set({
		selectedBoard: uid,
		selectedShop: null
	}),
	setToast: (t) => set({ toast: t }),
	setHelp: (v) => set({ help: v }),
	setSpeed: (s) => set({ speed: s }),
	setCombatCursor: (n) => set({ combatCursor: n }),
	setMuted: (v) => {
		set({ muted: v });
		setMuted(v);
	},
	buy: (uid) => {
		const { players, youId, phase } = get();
		if (phase !== "tavern") return;
		const you = players.find((p) => p.id === youId);
		if (!you) return;
		const res = buyMinion(you, uid, rng);
		if (res.player === you) {
			if (you.gold < 3) set({ toast: "金币不足" });
			else if (you.board.length >= 7) set({ toast: "战场已满，先卖掉一只随从" });
			return;
		}
		sfx.buy();
		if (res.triple) {
			sfx.triple();
			const opts = pickDiscoverOptions(res.triple.sourceTier, rng);
			set({
				players: withYou(players, youId, () => res.player),
				selectedShop: null,
				phase: "discover",
				discover: opts,
				toast: `${res.triple.golden.golden ? "金色合成！" : "三连！"}`
			});
			return;
		}
		set({
			players: withYou(players, youId, () => res.player),
			selectedShop: null
		});
	},
	sell: (uid) => {
		const { players, youId, phase } = get();
		if (phase !== "tavern") return;
		if (!players.find((p) => p.id === youId)) return;
		sfx.sell();
		set({
			players: withYou(players, youId, (p) => sellMinion(p, uid, pool)),
			selectedBoard: null
		});
	},
	refresh: () => {
		const { players, youId, phase } = get();
		if (phase !== "tavern") return;
		const you = players.find((p) => p.id === youId);
		if (!you || you.gold < 1) {
			set({ toast: "金币不足" });
			return;
		}
		sfx.refresh();
		set({
			players: withYou(players, youId, (p) => refreshShop(p, pool, rng)),
			selectedShop: null
		});
	},
	freezeAll: () => {
		const { phase } = get();
		if (phase !== "tavern") return;
		sfx.freeze();
		set({ players: withYou(get().players, get().youId, freezeShop) });
	},
	freezeSlot: (uid) => {
		if (get().phase !== "tavern") return;
		sfx.freeze();
		set({ players: withYou(get().players, get().youId, (p) => freezeOne(p, uid)) });
	},
	upgrade: () => {
		const { players, youId, phase } = get();
		if (phase !== "tavern") return;
		const you = players.find((p) => p.id === youId);
		if (!you) return;
		if (you.tavernTier >= 6) {
			set({ toast: "酒馆已满级" });
			return;
		}
		if (you.gold < you.upgradeCost) {
			set({ toast: "金币不足，无法升级" });
			return;
		}
		sfx.upgrade();
		set({
			players: withYou(players, youId, upgradeTavern),
			toast: `酒馆升至 ${you.tavernTier + 1} 级`
		});
	},
	move: (uid, index) => {
		if (get().phase !== "tavern") return;
		set({
			players: withYou(get().players, get().youId, (p) => moveMinion(p, uid, index)),
			selectedBoard: null
		});
	},
	pickDiscover: (defId) => {
		const { players, youId } = get();
		sfx.coin();
		set({
			players: withYou(players, youId, (p) => addDiscovered(p, defId, rng)),
			phase: "tavern",
			discover: []
		});
	},
	endTurn: () => {
		const st = get();
		if (st.phase !== "tavern") return;
		sfx.click();
		let players = st.players.map((p) => p.alive ? finishTurnBoards(p, rng) : p);
		const pairs = pairPlayers(players.filter((p) => p.alive).map((p) => p.id), rng, st.lastOpponent ?? void 0);
		const youPair = pairs.find((x) => x.a === st.youId || x.b === st.youId);
		if (!youPair) {
			set({
				phase: "gameover",
				players
			});
			return;
		}
		const oppId = youPair.a === st.youId ? youPair.b : youPair.a;
		const you = players.find((p) => p.id === st.youId);
		const opp = players.find((p) => p.id === oppId);
		const result = simulateCombat(you.board, opp.board, you.tavernTier, opp.tavernTier, rng);
		result.opponentId = oppId;
		result.ghost = Boolean(youPair.ghost);
		let nextPlace = st.nextPlace;
		for (const pair of pairs) {
			if (pair.a === st.youId || pair.b === st.youId) continue;
			const a = players.find((p) => p.id === pair.a);
			const b = players.find((p) => p.id === pair.b);
			if (!a || !b) continue;
			const r = simulateCombat(a.board, b.board, a.tavernTier, b.tavernTier, rng);
			if (r.winner === "player") {
				const hp = b.hp - r.damage;
				players = players.map((p) => p.id === b.id ? hp <= 0 ? {
					...p,
					hp: 0,
					alive: false,
					placement: nextPlace--
				} : {
					...p,
					hp
				} : p);
			} else if (r.winner === "enemy") {
				const hp = a.hp - r.damage;
				players = players.map((p) => p.id === a.id ? hp <= 0 ? {
					...p,
					hp: 0,
					alive: false,
					placement: nextPlace--
				} : {
					...p,
					hp
				} : p);
			}
		}
		set({
			phase: "combat",
			players,
			combat: result,
			combatEvents: result.events,
			combatCursor: 0,
			lastOpponent: oppId,
			nextPlace,
			selectedShop: null,
			selectedBoard: null
		});
	},
	skipCombat: () => {
		const { combat, phase } = get();
		if (phase !== "combat" || !combat) return;
		set({
			combatCursor: combat.events.length - 1,
			phase: "result"
		});
	},
	continueFromResult: () => {
		const st = get();
		const combat = st.combat;
		if (!combat) return;
		let players = st.players;
		let nextPlace = st.nextPlace;
		const you = players.find((p) => p.id === st.youId);
		const opp = players.find((p) => p.id === combat.opponentId);
		if (combat.winner === "enemy") {
			sfx.lose();
			const hp = you.hp - combat.damage;
			players = players.map((p) => p.id === you.id ? hp <= 0 ? {
				...p,
				hp: 0,
				alive: false,
				placement: nextPlace--
			} : {
				...p,
				hp
			} : p);
		} else if (combat.winner === "player" && opp && opp.alive && !combat.ghost) {
			sfx.win();
			const hp = opp.hp - combat.damage;
			players = players.map((p) => p.id === opp.id ? hp <= 0 ? {
				...p,
				hp: 0,
				alive: false,
				placement: nextPlace--
			} : {
				...p,
				hp
			} : p);
		} else if (combat.winner === "tie") sfx.click();
		else if (combat.winner === "player") sfx.win();
		const living = players.filter((p) => p.alive);
		if (!players.find((p) => p.id === st.youId).alive || living.length <= 1) {
			if (living.length === 1) players = players.map((p) => p.id === living[0].id && p.placement == null ? {
				...p,
				placement: 1
			} : p);
			set({
				phase: "gameover",
				players,
				nextPlace,
				combat: null
			});
			return;
		}
		const turn = st.turn + 1;
		players = players.map((p) => p.alive ? startTurn(p, turn, pool, rng) : p);
		players = players.map((p) => p.alive && !p.isHuman ? aiPlayTurn(p, pool, rng) : p);
		set({
			phase: "tavern",
			turn,
			players,
			nextPlace,
			combat: null,
			combatEvents: [],
			combatCursor: 0,
			toast: `第 ${turn} 回合`
		});
	}
}));
function StartScreen() {
	const startSelect = useGame((s) => s.startSelect);
	const setHelp = useGame((s) => s.setHelp);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "tavern-shell relative flex min-h-dvh flex-col items-center justify-center px-5 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-b from-bg-deep/40 via-transparent to-bg-deep/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 flex max-w-lg flex-col items-center text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium tracking-[0.28em] text-gold-2",
					children: "八人混战 · 自动对战"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-3 text-5xl font-bold tracking-tight text-fg sm:text-6xl",
					children: "酒馆战棋"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-md text-pretty text-muted",
					children: "招募随从、三连升金、升级酒馆。回合结束后战场将自动交锋，最后活下来的英雄加冕为王。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex w-full max-w-xs flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "action-btn primary h-12 text-base",
						onClick: startSelect,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "开始对局"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "action-btn h-12",
						onClick: () => setHelp(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4" }), "玩法说明"]
					})]
				})
			]
		})]
	});
}
function HeroSelect() {
	const pickHero = useGame((s) => s.pickHero);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "tavern-shell min-h-dvh px-4 py-8 sm:px-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-sm tracking-[0.2em] text-gold-2",
					children: "选择英雄"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display mt-2 text-center text-3xl font-bold",
					children: "谁来坐镇你的酒馆"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-2 max-w-md text-center text-sm text-muted",
					children: "第一版英雄仅决定形象与名号，技能将在后续赛季加入。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4",
					children: HEROES.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => pickHero(h.id),
						className: "group overflow-hidden rounded-xl border border-border bg-surface text-left shadow-panel transition-transform duration-150 ease-out hover:-translate-y-1 active:scale-[0.96]",
						style: { animation: `pop-in 400ms ease backwards ${i * 40}ms` },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "aspect-[4/5] overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: heroArt(h.art),
								alt: h.name,
								className: "h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-base font-semibold",
								children: h.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted",
								children: h.title
							})]
						})]
					}, h.id))
				})
			]
		})
	});
}
function Hud() {
	const turn = useGame((s) => s.turn);
	const you = useGame((s) => s.players.find((p) => p.id === s.youId));
	const muted = useGame((s) => s.muted);
	const setMuted = useGame((s) => s.setMuted);
	const setHelp = useGame((s) => s.setHelp);
	if (!you) return null;
	const hero = HERO_BY_ID[you.heroId];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex flex-wrap items-center gap-2 border-b border-border bg-bg-deep/70 px-3 py-2 backdrop-blur-sm sm:px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: hero ? heroArt(hero.art) : "",
				alt: "",
				className: "size-10 rounded-full border border-gold object-cover object-top"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-display text-sm font-semibold leading-tight",
				children: you.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[0.7rem] text-muted",
				children: [
					"第 ",
					turn,
					" 回合"
				]
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ml-auto flex flex-wrap items-center gap-1.5 sm:gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hud-chip",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4 text-hp" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular font-semibold",
						children: you.hp
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hud-chip",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular font-semibold",
						children: you.gold
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hud-chip",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-4 text-gold-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular font-semibold",
						children: ["酒馆 ", you.tavernTier]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "hud-chip",
					onClick: () => setMuted(!muted),
					"aria-label": muted ? "打开声音" : "静音",
					children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "hud-chip",
					onClick: () => setHelp(true),
					"aria-label": "帮助",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden sm:inline-flex",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-0" })
				})
			]
		})]
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function LobbyStrip() {
	const players = useGame((s) => s.players);
	const youId = useGame((s) => s.youId);
	const last = useGame((s) => s.lastOpponent);
	const ranked = [...players].sort((a, b) => {
		if (a.alive !== b.alive) return a.alive ? -1 : 1;
		return b.hp - a.hp;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		className: "flex gap-2 overflow-x-auto px-3 py-2 sm:flex-col sm:overflow-visible sm:px-2",
		children: ranked.map((p) => {
			const hero = HERO_BY_ID[p.heroId];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex min-w-28 items-center gap-2 rounded-lg border border-border bg-surface/80 px-2 py-1.5", !p.alive && "opacity-40", p.id === youId && "border-gold", p.id === last && "ring-1 ring-accent/70"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: hero ? heroArt(hero.art) : "",
					alt: "",
					className: "size-8 shrink-0 rounded-full object-cover object-top"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate text-xs font-semibold",
						children: p.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 text-[0.65rem] text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular text-hp",
								children: p.alive ? p.hp : "出局"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["T", p.tavernTier] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [p.board.length, " 随从"] })
						]
					})]
				})]
			}, p.id);
		})
	});
}
function isCombat(m) {
	return "name" in m && "art" in m;
}
function MinionCard({ inst, size = "md", selected, attacking, hit, dead, dim, lunge = "up", onClick, onFreeze, showFreeze }) {
	const d = defOf(inst.defId);
	const name = isCombat(inst) ? inst.name : d.name;
	const art = isCombat(inst) ? inst.art : d.art;
	const golden = inst.golden;
	const frozen = "frozen" in inst && inst.frozen;
	const taunt = isCombat(inst) ? inst.taunt : inst.keywords.includes("taunt");
	const shield = isCombat(inst) ? inst.divineShield : inst.keywords.includes("divineShield");
	const kws = isCombat(inst) ? [
		inst.taunt && "taunt",
		inst.divineShield && "divineShield",
		inst.poisonous && "poisonous",
		inst.reborn && "reborn",
		inst.cleave && "cleave",
		inst.windfury && "windfury"
	].filter(Boolean) : inst.keywords;
	const w = size === "lg" ? "w-[5.5rem] sm:w-[6.8rem] lg:w-[7.2rem]" : size === "sm" ? "w-[4.4rem] sm:w-[5.2rem]" : "w-[5.1rem] sm:w-[6.1rem]";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		style: { ["--lunge"]: lunge === "up" ? "-22px" : "22px" },
		className: cn("minion-card shrink-0 text-left", w, golden && "is-golden", selected && "is-selected", frozen && "is-frozen", taunt && "is-taunt", attacking && "is-attacking", hit && "is-hit", dead && "is-dead", dim && "opacity-50"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[3/4] overflow-hidden bg-surface-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: artUrl(art),
					alt: name,
					className: "h-full w-full object-cover object-top",
					draggable: false,
					onError: (e) => {
						e.currentTarget.style.display = "none";
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-bg-deep to-transparent" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute left-1 top-1 rounded-sm bg-bg-deep/70 px-1 py-0.5 text-[0.6rem] font-semibold text-gold-2",
					children: d.tier
				}),
				golden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
					className: "absolute left-1 bottom-8 size-3.5 text-gold-2",
					strokeWidth: 2
				}),
				shield && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-1 top-5 size-2.5 rounded-full border border-gold-2 bg-shield/80" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-7 px-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate text-center text-[0.68rem] font-semibold leading-tight text-fg drop-shadow",
						children: name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 flex flex-wrap justify-center gap-0.5",
						children: kws.slice(0, 3).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "kw-chip",
							children: KEYWORD_LABEL[k]
						}, k))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "stat-orb atk",
					children: inst.atk
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "stat-orb hp",
					children: inst.hp
				}),
				showFreeze && onFreeze && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					role: "button",
					tabIndex: 0,
					onClick: (e) => {
						e.stopPropagation();
						onFreeze();
					},
					onKeyDown: (e) => {
						if (e.key === "Enter") onFreeze();
					},
					className: cn("absolute right-1 top-1 grid size-7 place-items-center rounded-full border border-border bg-surface/85", frozen && "text-ice border-ice"),
					"aria-label": "冻结",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "size-3.5" })
				})
			]
		}), size === "lg" && d.text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "line-clamp-2 bg-surface px-1.5 py-1 text-[0.62rem] leading-snug text-muted",
			children: d.text
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "truncate bg-surface px-1 py-0.5 text-center text-[0.58rem] text-faint",
			children: TRIBE_LABEL[d.tribe]
		})]
	});
}
function TavernScreen() {
	const you = useGame((s) => s.players.find((p) => p.id === s.youId));
	const selectedShop = useGame((s) => s.selectedShop);
	const selectedBoard = useGame((s) => s.selectedBoard);
	const buy = useGame((s) => s.buy);
	const sell = useGame((s) => s.sell);
	const refresh = useGame((s) => s.refresh);
	const freezeAll = useGame((s) => s.freezeAll);
	const freezeSlot = useGame((s) => s.freezeSlot);
	const upgrade = useGame((s) => s.upgrade);
	const endTurn = useGame((s) => s.endTurn);
	const selectShop = useGame((s) => s.selectShop);
	const selectBoard = useGame((s) => s.selectBoard);
	const move = useGame((s) => s.move);
	const toast = useGame((s) => s.toast);
	const phase = useGame((s) => s.phase);
	const discover = useGame((s) => s.discover);
	const pickDiscover = useGame((s) => s.pickDiscover);
	if (!you) return null;
	const frozen = you.shop.some((m) => m.frozen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "tavern-shell flex min-h-dvh flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col sm:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-b border-border sm:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LobbyStrip, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-1 flex-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "px-3 pt-3 sm:px-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-baseline justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-lg font-semibold",
										children: "鲍勃的酒馆"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted",
										children: [
											"点击随从购买 · ",
											3,
											" 金币"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "panel flex gap-2 overflow-x-auto rounded-xl p-3",
									children: [you.shop.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "py-8 text-sm text-muted",
										children: "酒馆空空如也，试着刷新一下。"
									}), you.shop.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinionCard, {
										inst: m,
										size: "lg",
										selected: selectedShop === m.uid,
										showFreeze: true,
										onFreeze: () => freezeSlot(m.uid),
										onClick: () => {
											if (you.gold >= 3 && you.board.length < 7) buy(m.uid);
											else selectShop(m.uid);
										}
									}, m.uid))]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "flex-1 px-3 py-3 sm:px-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-2 flex items-baseline justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "font-display text-lg font-semibold",
											children: "你的战场"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted",
											children: [
												you.board.length,
												"/",
												7,
												" · 先手顺序从左到右"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "panel flex min-h-32 items-end gap-2 overflow-x-auto rounded-xl p-3",
										children: Array.from({ length: 7 }).map((_, i) => {
											const m = you.board[i];
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "slot grid place-items-center",
												onDragOver: (e) => e.preventDefault(),
												onDrop: (e) => {
													const uid = e.dataTransfer.getData("uid");
													if (uid) move(uid, i);
												},
												children: m ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													draggable: true,
													onDragStart: (e) => e.dataTransfer.setData("uid", m.uid),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinionCard, {
														inst: m,
														size: "md",
														selected: selectedBoard === m.uid,
														onClick: () => {
															if (selectedBoard && selectedBoard !== m.uid) {
																if (you.board.findIndex((x) => x.uid === selectedBoard) >= 0) move(selectedBoard, i);
															} else selectBoard(selectedBoard === m.uid ? null : m.uid);
														}
													})
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[0.65rem] text-faint",
													children: i + 1
												})
											}, m?.uid ?? `slot-${i}`);
										})
									}),
									selectedBoard && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 flex justify-end",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "action-btn",
											onClick: () => sell(selectedBoard),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4 text-gold" }), "出售（+1 金币）"]
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
								className: "sticky bottom-0 grid grid-cols-2 gap-2 border-t border-border bg-bg-deep/90 p-3 sm:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "action-btn",
										disabled: you.gold < 1,
										onClick: refresh,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "刷新 · 1"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: cn("action-btn", frozen && "text-ice"),
										onClick: freezeAll,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "size-4" }), frozen ? "解冻" : "冻结"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "action-btn gold",
										disabled: you.tavernTier >= 6 || you.gold < you.upgradeCost,
										onClick: upgrade,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowUp, { className: "size-4" }), you.tavernTier >= 6 ? "满级" : `升级 · ${you.upgradeCost}`]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "action-btn primary",
										onClick: endTurn,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" }), "结束回合"]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden border-l border-border sm:block sm:w-52",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LobbyStrip, {})
					})
				]
			}),
			toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm shadow-panel",
				children: toast
			}),
			phase === "discover" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-30 grid place-items-center bg-bg-deep/70 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel w-full max-w-xl rounded-2xl p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-center text-xl font-semibold",
							children: "三连发现"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-center text-sm text-muted",
							children: "从更高一级的随从中挑选一只加入战场。"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 flex flex-wrap justify-center gap-3",
							children: discover.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinionCard, {
								inst: m,
								size: "lg",
								onClick: () => pickDiscover(m.defId)
							}, m.uid))
						})
					]
				})
			})
		]
	});
}
function cloneBoard(b) {
	return b.map((m) => ({
		...m,
		effects: m.effects.map((e) => ({ ...e }))
	}));
}
function CombatScreen() {
	const combat = useGame((s) => s.combat);
	const events = useGame((s) => s.combatEvents);
	const phase = useGame((s) => s.phase);
	const speed = useGame((s) => s.speed);
	const setSpeed = useGame((s) => s.setSpeed);
	const skipCombat = useGame((s) => s.skipCombat);
	const continueFromResult = useGame((s) => s.continueFromResult);
	const players = useGame((s) => s.players);
	const youId = useGame((s) => s.youId);
	const [pBoard, setPBoard] = (0, import_react.useState)([]);
	const [eBoard, setEBoard] = (0, import_react.useState)([]);
	const [attacking, setAttacking] = (0, import_react.useState)(null);
	const [hit, setHit] = (0, import_react.useState)(null);
	const [banner, setBanner] = (0, import_react.useState)("战斗开始");
	const [floats, setFloats] = (0, import_react.useState)([]);
	const idxRef = (0, import_react.useRef)(0);
	const boardsRef = (0, import_react.useRef)({
		p: [],
		e: []
	});
	const you = players.find((p) => p.id === youId);
	const opp = players.find((p) => p.id === combat?.opponentId);
	const youHero = you ? HERO_BY_ID[you.heroId] : void 0;
	const oppHero = opp ? HERO_BY_ID[opp.heroId] : void 0;
	const startKey = combat ? combat.playerStart.map((m) => m.uid).join() : "";
	(0, import_react.useEffect)(() => {
		if (!combat) return;
		const p = cloneBoard(combat.playerStart);
		const e = cloneBoard(combat.enemyStart);
		setPBoard(p);
		setEBoard(e);
		boardsRef.current = {
			p,
			e
		};
		idxRef.current = 0;
		setBanner("战斗开始");
		setAttacking(null);
		setHit(null);
	}, [startKey, combat]);
	const applyEvent = (ev) => {
		const patch = (uid, fn, side) => {
			const run = (arr) => {
				const next = [];
				for (const m of arr) if (m.uid !== uid) next.push(m);
				else {
					const n = fn(m);
					if (n) next.push(n);
				}
				return next;
			};
			if (side !== "e") {
				const p = run(boardsRef.current.p);
				boardsRef.current.p = p;
				setPBoard(p);
			}
			if (side !== "p") {
				const e = run(boardsRef.current.e);
				boardsRef.current.e = e;
				setEBoard(e);
			}
		};
		switch (ev.type) {
			case "announce":
				setBanner(ev.text);
				break;
			case "attack":
				setAttacking(ev.attackerUid);
				setHit(ev.targetUid);
				sfx.hit();
				break;
			case "damage":
				patch(ev.uid, (m) => ({
					...m,
					hp: ev.hpAfter,
					divineShield: ev.shieldPop ? false : m.divineShield
				}));
				setFloats((f) => [...f, {
					id: `${ev.uid}-${ev.at}`,
					uid: ev.uid,
					text: ev.shieldPop ? "圣盾" : `-${ev.amount}`
				}]);
				break;
			case "buff":
				patch(ev.uid, (m) => ({
					...m,
					atk: m.atk + ev.atk,
					hp: m.hp + ev.hp,
					maxHp: m.maxHp + ev.hp
				}));
				break;
			case "summon": {
				const board = ev.owner === "player" ? boardsRef.current.p.slice() : boardsRef.current.e.slice();
				board.splice(Math.min(ev.index, board.length), 0, { ...ev.minion });
				if (ev.owner === "player") {
					boardsRef.current.p = board;
					setPBoard(board);
				} else {
					boardsRef.current.e = board;
					setEBoard(board);
				}
				break;
			}
			case "death":
				sfx.death();
				patch(ev.uid, (m) => ({
					...m,
					dead: true,
					hp: 0
				}));
				window.setTimeout(() => {
					if ([...boardsRef.current.p, ...boardsRef.current.e].find((m) => m.uid === ev.uid && m.dead)) patch(ev.uid, () => null);
				}, 320);
				break;
			case "reborn":
				patch(ev.uid, (m) => ({
					...m,
					hp: ev.hp,
					maxHp: ev.hp,
					reborn: false,
					dead: false
				}));
				break;
			case "end":
				setAttacking(null);
				setHit(null);
				if (ev.winner === "player") setBanner(ev.damage ? `胜利 · 造成 ${ev.damage} 点伤害` : "胜利");
				else if (ev.winner === "enemy") setBanner(`战败 · 受到 ${ev.damage} 点伤害`);
				else setBanner("平局");
		}
	};
	(0, import_react.useEffect)(() => {
		if (phase !== "combat" || !events.length) return;
		let raf = 0;
		let last = performance.now();
		let acc = 0;
		const tick = (now) => {
			const dt = Math.min(.1, (now - last) / 1e3);
			last = now;
			acc += dt * speed;
			const interval = .32;
			while (acc >= interval) {
				acc -= interval;
				const i = idxRef.current;
				const ev = events[i];
				if (!ev) {
					useGame.getState().skipCombat();
					return;
				}
				applyEvent(ev);
				idxRef.current = i + 1;
				if (ev.type === "end") {
					useGame.getState().skipCombat();
					return;
				}
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [
		phase,
		events,
		speed,
		startKey
	]);
	const floatByUid = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		for (const f of floats) m.set(f.uid, f.text);
		return m;
	}, [floats]);
	if (!combat || !you) return null;
	const renderRow = (board, side) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-28 flex-wrap items-end justify-center gap-1.5 sm:gap-2",
		children: [board.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinionCard, {
				inst: m,
				size: "sm",
				attacking: attacking === m.uid,
				hit: hit === m.uid,
				lunge: side === "player" ? "up" : "down"
			}), floatByUid.get(m.uid) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 animate-[floatnum_700ms_ease_forwards] text-sm font-bold text-hp-fg",
				children: floatByUid.get(m.uid)
			})]
		}, m.uid)), board.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-6 text-sm text-muted",
			children: "战场空空"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "tavern-shell flex min-h-dvh flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col gap-3 px-3 py-3 sm:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [oppHero && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: heroArt(oppHero.art),
								alt: "",
								className: "size-10 rounded-full object-cover object-top"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display font-semibold",
								children: opp?.name ?? "对手"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted",
								children: [
									"生命 ",
									opp?.hp,
									" · 酒馆 ",
									opp?.tavernTier
								]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [[
								1,
								2,
								4
							].map((sp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: cn("action-btn px-3", speed === sp && "primary"),
								onClick: () => setSpeed(sp),
								children: [sp, "x"]
							}, sp)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "action-btn",
								onClick: skipCombat,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastForward, { className: "size-4" }), "跳过"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel rounded-xl p-3 sm:p-5",
						children: [
							renderRow(eBoard, "enemy"),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "my-3 flex items-center justify-center gap-2 text-gold-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-sm sm:text-base",
									children: banner
								})]
							}),
							renderRow(pBoard, "player")
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-auto flex items-center justify-between",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [youHero && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: heroArt(youHero.art),
								alt: "",
								className: "size-10 rounded-full object-cover object-top"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display font-semibold",
								children: you.name
							})]
						})
					})
				]
			}),
			phase === "result" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-20 grid place-items-center bg-bg-deep/50 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel w-full max-w-md rounded-2xl p-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-2xl font-bold",
							children: combat.winner === "player" ? "胜利" : combat.winner === "enemy" ? "战败" : "势均力敌"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted",
							children: combat.winner === "tie" ? "双方同归于尽，无人受伤。" : combat.winner === "player" ? `对手将受到 ${combat.damage} 点伤害。` : `你受到 ${combat.damage} 点伤害。`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "action-btn primary mt-5 w-full",
							onClick: continueFromResult,
							children: "回到酒馆"
						})
					]
				})
			})
		]
	});
}
function GameOverScreen() {
	const players = useGame((s) => s.players);
	const youId = useGame((s) => s.youId);
	const startSelect = useGame((s) => s.startSelect);
	const you = players.find((p) => p.id === youId);
	const ranked = [...players].sort((a, b) => {
		const pa = a.placement ?? 99;
		const pb = b.placement ?? 99;
		if (pa !== pb) return pa - pb;
		return b.hp - a.hp;
	});
	const place = you?.placement ?? ranked.findIndex((p) => p.id === youId) + 1;
	const title = place === 1 ? "冠军" : `第 ${place} 名`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "tavern-shell flex min-h-dvh flex-col items-center px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel w-full max-w-lg rounded-2xl p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: cn("size-10", place === 1 ? "text-gold" : "text-muted") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display mt-3 text-3xl font-bold",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: place === 1 ? "整座酒馆都为你干杯。" : "再来一局，下一次坐上首席。"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-6 space-y-2",
					children: ranked.map((p, i) => {
						const hero = HERO_BY_ID[p.heroId];
						const rank = p.placement ?? i + 1;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: cn("flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2", p.id === youId && "border-gold"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular w-6 text-center font-semibold text-gold-2",
									children: rank
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: hero ? heroArt(hero.art) : "",
									alt: "",
									className: "size-9 rounded-full object-cover object-top"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate font-medium",
										children: p.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted",
										children: [
											"酒馆 ",
											p.tavernTier,
											" · 三连 ",
											p.triples
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular text-sm text-hp",
									children: p.hp
								})
							]
						}, p.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "action-btn primary mt-6 w-full",
					onClick: startSelect,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "再来一局"]
				})
			]
		})
	});
}
function HelpOverlay() {
	const help = useGame((s) => s.help);
	const setHelp = useGame((s) => s.setHelp);
	if (!help) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 grid place-items-center bg-bg-deep/70 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel relative max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "absolute right-3 top-3 grid size-10 place-items-center rounded-full border border-border",
					onClick: () => setHelp(false),
					"aria-label": "关闭",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-2xl font-bold",
					children: "玩法说明"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-3 text-sm leading-relaxed text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "每回合获得金币（上限 10）。在酒馆购买随从、刷新、冻结、升级酒馆，然后结束回合进入自动战斗。" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "购买花费 3 金币，刷新 1 金币，出售返还 1 金币。升级酒馆可解锁更高等级的随从。" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "收集三只相同随从会合成金色随从：基础属性翻倍，并发现一只更高等级的随从。" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "战斗时双方从左到右轮流攻击。嘲讽优先被打，圣盾抵消一次伤害，亡语与战吼会在对应时机触发。" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "失败方扣除「对方酒馆等级 + 剩余随从星级」的生命。最后活着的玩家获胜。" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "action-btn primary mt-6 w-full",
					onClick: () => setHelp(false),
					children: "知道了"
				})
			]
		})
	});
}
function GameApp() {
	const phase = useGame((s) => s.phase);
	const toast = useGame((s) => s.toast);
	const setToast = useGame((s) => s.setToast);
	(0, import_react.useEffect)(() => {
		const unlock = () => unlockAudio();
		window.addEventListener("pointerdown", unlock, { once: true });
		const vis = () => {
			if (document.visibilityState === "visible") unlockAudio();
		};
		document.addEventListener("visibilitychange", vis);
		return () => {
			window.removeEventListener("pointerdown", unlock);
			document.removeEventListener("visibilitychange", vis);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!toast) return;
		const t = window.setTimeout(() => setToast(null), 1800);
		return () => window.clearTimeout(t);
	}, [toast, setToast]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			phase === "menu" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartScreen, {}),
			phase === "hero-select" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroSelect, {}),
			(phase === "tavern" || phase === "discover") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TavernScreen, {}),
			(phase === "combat" || phase === "result") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CombatScreen, {}),
			phase === "gameover" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameOverScreen, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpOverlay, {})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { Home as component };
