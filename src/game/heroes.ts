import type { HeroDef } from "./types";

export const HEROES: HeroDef[] = [
  {
    id: "jaina",
    name: "吉安娜",
    title: "肯瑞托的总法师",
    art: "HERO_08",
    armor: 0,
    power: {
      name: "冰霜新货",
      cost: 1,
      kind: "refresh_freeze",
      text: "花费 1 金币刷新酒馆，并将所有随从冻结。",
    },
  },
  {
    id: "rexxar",
    name: "雷克萨",
    title: "兽人猎手",
    art: "HERO_05",
    armor: 0,
    power: {
      name: "召唤宠物",
      cost: 1,
      kind: "summon_token",
      text: "花费 1 金币，将一只 1/1 的虎斑猫加入手牌。",
    },
  },
  {
    id: "valeera",
    name: "瓦莉拉",
    title: "暗影收割者",
    art: "HERO_03",
    armor: 0,
    power: {
      name: "便宜货",
      cost: 0,
      kind: "cheap_buy",
      text: "本回合你的下一次购买只需 2 金币。",
    },
  },
  {
    id: "uther",
    name: "乌瑟尔",
    title: "圣光的勇士",
    art: "HERO_04",
    armor: 5,
    power: {
      name: "神圣护盾",
      cost: 2,
      kind: "random_shield",
      text: "花费 2 金币，使一个随机友方随从获得圣盾。起始 5 点护甲。",
    },
  },
  {
    id: "guldan",
    name: "古尔丹",
    title: "毁灭之手",
    art: "HERO_07",
    armor: 0,
    power: {
      name: "生命分流",
      cost: 0,
      kind: "life_for_gold",
      text: "受到 2 点伤害，获得 2 金币。生命不高于 2 时无法使用。",
    },
  },
  {
    id: "malfurion",
    name: "玛法里奥",
    title: "塞纳里奥",
    art: "HERO_06",
    armor: 0,
    power: {
      name: "自然之力",
      cost: 1,
      kind: "buff_random",
      text: "花费 1 金币，使一个随机友方随从获得 +2/+1。",
    },
  },
  {
    id: "thrall",
    name: "萨尔",
    title: "大地之环",
    art: "HERO_02",
    armor: 0,
    power: {
      name: "风暴降价",
      cost: 1,
      kind: "cheap_upgrade",
      text: "花费 1 金币。本回合升级酒馆的费用降低 3 点。",
    },
  },
  {
    id: "garrosh",
    name: "加尔鲁什",
    title: "战歌酋长",
    art: "HERO_01",
    armor: 8,
    power: {
      name: "钢铁甲胄",
      cost: 2,
      kind: "gain_armor",
      text: "花费 2 金币，获得 3 点护甲。起始 8 点护甲。",
    },
  },
  {
    id: "anduin",
    name: "安度因",
    title: "暴风城的圣光",
    art: "HERO_09",
    armor: 5,
    power: {
      name: "治疗术",
      cost: 1,
      kind: "heal_random",
      text: "花费 1 金币，使一个随机友方随从获得 +3 生命。起始 5 点护甲。",
    },
  },
];

export const HERO_BY_ID: Record<string, HeroDef> = Object.fromEntries(
  HEROES.map((h) => [h.id, h]),
);

export function heroArt(art: string): string {
  return `/art/${art}.jpg`;
}
