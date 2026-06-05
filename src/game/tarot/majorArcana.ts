import { Lang } from "../i18n/messages";

export type TarotElement = "fire" | "water" | "air" | "earth" | "special";
export type TarotElementItem = { type: TarotElement, weight: number };
type TarotMeaning = {
  keywordsJa: string[];
  keywordsEn: string[];
};

type TarotCard = {
  id: number;
  uid: string;
  element: TarotElement;
  elements: TarotElementItem[];
  titleJa: string;
  titleEn: string;
  upright: TarotMeaning;
  reversed: TarotMeaning;
};

type TarotRelationType =
  | "sameElement"
  | "oppositeElement"
  | "complements"
  | "similarTheme"
  | "tension";

type TarotRelation = {
  to: string;
  type: TarotRelationType;
  labelJa: string,
  labelEn: string,
};

type TarotRelations = Record<string, TarotRelation[]>;

const elementRelations: Record<
  TarotElement,
  { strongAgainst: TarotElement[]; weakAgainst: TarotElement[]; friendly: TarotElement[] }
> = {
  fire: {
    strongAgainst: ["air"],
    weakAgainst: ["water"],
    friendly: ["fire", "special"],
  },
  water: {
    strongAgainst: ["fire"],
    weakAgainst: ["earth"],
    friendly: ["water", "special"],
  },
  air: {
    strongAgainst: ["earth"],
    weakAgainst: ["fire"],
    friendly: ["air", "special"],
  },
  earth: {
    strongAgainst: ["water"],
    weakAgainst: ["air"],
    friendly: ["earth", "special"],
  },
  special: {
    strongAgainst: [],
    weakAgainst: [],
    friendly: ["fire", "water", "air", "earth", "special"],
  },
};

const elementsTag = {
  "fire": {
    keywordsJa: ["行動", "情熱", "衝動"],
    keywordsEn: ["Action", "Passion", "Impulse"],
  },
  "water": {
    keywordsJa: ["感情", "共感", "受容"], //["感情", "愛", "共感"]
    keywordsEn: ["Emotion", "Empathy", "Acceptance"],
  },
  "air": {
    keywordsJa: ["思考", "判断", "言葉"],
    keywordsEn: ["Thought", "Judgment", "Words"],
  },
  "earth": {
    keywordsJa: ["現実", "身体", "成果"], //["現実", "お金", "身体", "成果"]
    keywordsEn: ["Reality", "Body", "Outcome"],
  }
}
const majorArcanaCards: Record<string, TarotCard> = {
  "00-TheFool": {
    id: 0,
    uid: "00-TheFool",
    titleJa: "愚者",
    titleEn: "The Fool",
    element: "air",
    elements: [{ type: "air", weight: 1.0 }, { type: "fire", weight: 0.6 }],
    upright: {
      keywordsJa: ["始まり", "衝動", "可能性"],
      keywordsEn: ["Beginning", "Impulse", "Potential"],
    },
    reversed: {
      keywordsJa: ["無計画", "軽率", "空回り"],
      keywordsEn: ["Recklessness", "Carelessness", "Misstep"],
    },
  },

  "01-TheMagician": {
    id: 1,
    uid: "01-TheMagician",
    titleJa: "魔術師",
    titleEn: "The Magician",
    element: "special",
    elements: [{ type: "air", weight: 1.0 }, { type: "fire", weight: 0.6 }, { type: "earth", weight: 0.2 }, { type: "water", weight: 0.2 }],
    upright: {
      keywordsJa: ["技術", "意志", "創造"],
      keywordsEn: ["Skill", "Will", "Creation"],
    },
    reversed: {
      keywordsJa: ["詐術", "迷い", "力不足"],
      keywordsEn: ["Trickery", "Doubt", "Lack of Power"],
    },
  },

  "02-TheHighPriestess": {
    id: 2,
    uid: "02-TheHighPriestess",
    titleJa: "女教皇",
    titleEn: "The High Priestess",
    element: "water",
    elements: [{ type: "water", weight: 1.0 }],
    upright: {
      keywordsJa: ["直感", "秘密", "静けさ"],
      keywordsEn: ["Intuition", "Secrets", "Stillness"],
    },
    reversed: {
      keywordsJa: ["閉鎖性", "疑念", "見誤り"],
      keywordsEn: ["Closedness", "Doubt", "Misreading"],
    },
  },

  "03-TheEmpress": {
    id: 3,
    uid: "03-TheEmpress",
    titleJa: "女帝",
    titleEn: "The Empress",
    element: "earth",
    elements: [{ type: "earth", weight: 1.0 }, { type: "water", weight: 0.6 }],
    upright: {
      keywordsJa: ["豊かさ", "育成", "受容"],
      keywordsEn: ["Abundance", "Nurture", "Acceptance"],
    },
    reversed: {
      keywordsJa: ["甘やかし", "停滞", "依存"],
      keywordsEn: ["Overindulgence", "Stagnation", "Dependence"],
    },
  },

  "04-TheEmperor": {
    id: 4,
    uid: "04-TheEmperor",
    titleJa: "皇帝",
    titleEn: "The Emperor",
    element: "earth",
    elements: [{ type: "earth", weight: 1.0 }, { type: "fire", weight: 0.8 }],
    upright: {
      keywordsJa: ["支配", "秩序", "権威"],
      keywordsEn: ["Authority", "Order", "Control"],
    },
    reversed: {
      keywordsJa: ["独裁", "硬直", "支配過剰"],
      keywordsEn: ["Tyranny", "Rigidity", "Overcontrol"],
    },
  },

  "05-TheHierophant": {
    id: 5,
    uid: "05-TheHierophant",
    titleJa: "法王",
    titleEn: "The Hierophant",
    element: "earth",
    elements: [{ type: "earth", weight: 1.0 }, { type: "air", weight: 0.5 }],
    upright: {
      keywordsJa: ["教え", "伝統", "規範"],
      keywordsEn: ["Teaching", "Tradition", "Rules"],
    },
    reversed: {
      keywordsJa: ["形骸化", "反発", "盲信"],
      keywordsEn: ["Empty Formality", "Rebellion", "Blind Faith"],
    },
  },

  "06-TheLovers": {
    id: 6,
    uid: "06-TheLovers",
    titleJa: "恋人",
    titleEn: "The Lovers",
    element: "water",
    elements: [{ type: "water", weight: 1.0 }, { type: "air", weight: 0.7 }],
    upright: {
      keywordsJa: ["選択", "結びつき", "調和"],
      keywordsEn: ["Choice", "Bond", "Harmony"],
    },
    reversed: {
      keywordsJa: ["不一致", "迷い", "断絶"],
      keywordsEn: ["Disharmony", "Indecision", "Separation"],
    },
  },

  "07-TheChariot": {
    id: 7,
    uid: "07-TheChariot",
    titleJa: "戦車",
    titleEn: "The Chariot",
    element: "fire",
    elements: [{ type: "fire", weight: 1.0 }, { type: "earth", weight: 0.6 }, { type: "water", weight: 0.2 }],
    upright: {
      keywordsJa: ["前進", "勝利", "突破"],
      keywordsEn: ["Advance", "Victory", "Breakthrough"],
    },
    reversed: {
      keywordsJa: ["暴走", "空回り", "敗北"],
      keywordsEn: ["Runaway", "Wasted Effort", "Defeat"],
    },
  },

  "08-Strength": {
    id: 8,
    uid: "08-Strength",
    titleJa: "力",
    titleEn: "Strength",
    element: "fire",
    elements: [{ type: "fire", weight: 1.0 }, { type: "water", weight: 0.6 }],
    upright: {
      keywordsJa: ["忍耐", "制御", "勇気"],
      keywordsEn: ["Patience", "Control", "Courage"],
    },
    reversed: {
      keywordsJa: ["無力感", "動揺", "抑えきれなさ"],
      keywordsEn: ["Powerlessness", "Agitation", "Lack of Control"],
    },
  },

  "09-TheHermit": {
    id: 9,
    uid: "09-TheHermit",
    titleJa: "隠者",
    titleEn: "The Hermit",
    element: "earth",
    elements: [{ type: "earth", weight: 1.0 }, { type: "air", weight: 0.6 }],
    upright: {
      keywordsJa: ["探求", "孤独", "内省"],
      keywordsEn: ["Search", "Solitude", "Reflection"],
    },
    reversed: {
      keywordsJa: ["孤立", "閉じこもり", "停滞"],
      keywordsEn: ["Isolation", "Withdrawal", "Stagnation"],
    },
  },

  "10-WheelOfFortune": {
    id: 10,
    uid: "10-WheelOfFortune",
    titleJa: "運命の輪",
    titleEn: "Wheel of Fortune",
    element: "special",
    elements: [{ type: "fire", weight: 0.8 }, { type: "air", weight: 0.8 }],
    upright: {
      keywordsJa: ["転機", "循環", "運命"],
      keywordsEn: ["Turning Point", "Cycle", "Fate"],
    },
    reversed: {
      keywordsJa: ["停滞", "不運", "歯車の狂い"],
      keywordsEn: ["Stagnation", "Bad Luck", "Disruption"],
    },
  },

  "11-Justice": {
    id: 11,
    uid: "11-Justice",
    titleJa: "正義",
    titleEn: "Justice",
    element: "air",
    elements: [{ type: "air", weight: 1.0 }, { type: "earth", weight: 0.6 }],
    upright: {
      keywordsJa: ["均衡", "判断", "責任"],
      keywordsEn: ["Balance", "Judgment", "Responsibility"],
    },
    reversed: {
      keywordsJa: ["不公平", "偏見", "誤審"],
      keywordsEn: ["Unfairness", "Bias", "Misjudgment"],
    },
  },

  "12-TheHangedMan": {
    id: 12,
    uid: "12-TheHangedMan",
    titleJa: "吊るされた男",
    titleEn: "The Hanged Man",
    element: "water",
    elements: [{ type: "water", weight: 1.0 }, { type: "air", weight: 0.5 }],
    upright: {
      keywordsJa: ["停止", "視点転換", "受容"],
      keywordsEn: ["Pause", "New Perspective", "Acceptance"],
    },
    reversed: {
      keywordsJa: ["無駄な停滞", "抵抗", "行き詰まり"],
      keywordsEn: ["Pointless Delay", "Resistance", "Deadlock"],
    },
  },

  "13-Death": {
    id: 13,
    uid: "13-Death",
    titleJa: "死神",
    titleEn: "Death",
    element: "water",
    elements: [{ type: "water", weight: 1.0 }, { type: "earth", weight: 0.7 }],
    upright: {
      keywordsJa: ["終わり", "変化", "再出発"],
      keywordsEn: ["Ending", "Transformation", "Restart"],
    },
    reversed: {
      keywordsJa: ["執着", "変化拒否", "惰性"],
      keywordsEn: ["Attachment", "Resistance to Change", "Inertia"],
    },
  },

  "14-Temperance": {
    id: 14,
    uid: "14-Temperance",
    titleJa: "節制",
    titleEn: "Temperance",
    element: "water",
    elements: [{ type: "water", weight: 1.0 }, { type: "air", weight: 0.6 }],
    upright: {
      keywordsJa: ["調和", "調整", "中庸"],
      keywordsEn: ["Harmony", "Adjustment", "Moderation"],
    },
    reversed: {
      keywordsJa: ["不均衡", "過剰", "混乱"],
      keywordsEn: ["Imbalance", "Excess", "Disorder"],
    },
  },

  "15-TheDevil": {
    id: 15,
    uid: "15-TheDevil",
    titleJa: "悪魔",
    titleEn: "The Devil",
    element: "earth",
    elements: [{ type: "earth", weight: 1.0 }, { type: "fire", weight: 0.6 }],
    upright: {
      keywordsJa: ["執着", "欲望", "束縛"],
      keywordsEn: ["Obsession", "Desire", "Bondage"],
    },
    reversed: {
      keywordsJa: ["解放", "依存からの脱出", "執着の緩和"],
      keywordsEn: ["Release", "Breaking Dependency", "Loosening Attachment"],
    },
  },

  "16-TheTower": {
    id: 16,
    uid: "16-TheTower",
    titleJa: "塔",
    titleEn: "The Tower",
    element: "fire",
    elements: [{ type: "fire", weight: 1.0 }, { type: "air", weight: 0.7 }],
    upright: {
      keywordsJa: ["崩壊", "衝撃", "破綻"],
      keywordsEn: ["Collapse", "Shock", "Breakdown"],
    },
    reversed: {
      keywordsJa: ["回避", "余震", "内側からの崩れ"],
      keywordsEn: ["Avoidance", "Aftershock", "Inner Collapse"],
    },
  },

  "17-TheStar": {
    id: 17,
    uid: "17-TheStar",
    titleJa: "星",
    titleEn: "The Star",
    element: "air",
    elements: [{ type: "water", weight: 1.0 }],
    upright: {
      keywordsJa: ["希望", "癒し", "導き"],
      keywordsEn: ["Hope", "Healing", "Guidance"],
    },
    reversed: {
      keywordsJa: ["失望", "迷い", "希望の欠如"],
      keywordsEn: ["Disappointment", "Confusion", "Lack of Hope"],
    },
  },

  "18-TheMoon": {
    id: 18,
    uid: "18-TheMoon",
    titleJa: "月",
    titleEn: "The Moon",
    element: "water",
    elements: [{ type: "water", weight: 1.0 }, { type: "air", weight: 0.5 }],
    upright: {
      keywordsJa: ["不安", "幻", "曖昧さ"],
      keywordsEn: ["Anxiety", "Illusion", "Ambiguity"],
    },
    reversed: {
      keywordsJa: ["真相の露見", "霧が晴れる", "誤解の解消"],
      keywordsEn: ["Truth Revealed", "Clarity Returning", "Misunderstanding Resolved"],
    },
  },

  "19-TheSun": {
    id: 19,
    uid: "19-TheSun",
    titleJa: "太陽",
    titleEn: "The Sun",
    element: "fire",
    elements: [{ type: "fire", weight: 1.0 }],
    upright: {
      keywordsJa: ["成功", "喜び", "明快さ"],
      keywordsEn: ["Success", "Joy", "Clarity"],
    },
    reversed: {
      keywordsJa: ["慢心", "空元気", "陰り"],
      keywordsEn: ["Overconfidence", "Forced Cheer", "Clouded Light"],
    },
  },

  "20-Judgement": {
    id: 20,
    uid: "20-Judgement",
    titleJa: "審判",
    titleEn: "Judgement",
    element: "fire",
    elements: [{ type: "fire", weight: 1.0 }, { type: "air", weight: 0.6 }],
    upright: {
      keywordsJa: ["覚醒", "再生", "決断"],
      keywordsEn: ["Awakening", "Rebirth", "Decision"],
    },
    reversed: {
      keywordsJa: ["優柔不断", "後悔", "呼びかけへの無反応"],
      keywordsEn: ["Indecision", "Regret", "Ignoring the Call"],
    },
  },

  "21-TheWorld": {
    id: 21,
    uid: "21-TheWorld",
    titleJa: "世界",
    titleEn: "The World",
    element: "earth",
    elements: [{ type: "earth", weight: 1.0 }, { type: "water", weight: 0.6 }],
    upright: {
      keywordsJa: ["完成", "到達", "統合"],
      keywordsEn: ["Completion", "Achievement", "Integration"],
    },
    reversed: {
      keywordsJa: ["未完成", "足踏み", "閉じない循環"],
      keywordsEn: ["Incompletion", "Stagnation", "Unclosed Cycle"],
    },
  },
};



const majorArcanaSpecialRelations: TarotRelations = {
  "00-TheFool": [
    { to: "21-TheWorld", type: "complements", labelJa: "始まり ↔ 完成", labelEn: "Beginning ↔ Completion" },
    { to: "04-TheEmperor", type: "tension", labelJa: "自由 ↔ 秩序", labelEn: "Freedom ↔ Order" },
    { to: "01-TheMagician", type: "similarTheme", labelJa: "可能性 ↔ 意志の発動", labelEn: "Potential ↔ Activation of Will" },
  ],

  "01-TheMagician": [
    { to: "02-TheHighPriestess", type: "complements", labelJa: "外なる技 ↔ 内なる知", labelEn: "Outer Skill ↔ Inner Knowledge" },
    { to: "00-TheFool", type: "similarTheme", labelJa: "意志の発動 ↔ 可能性", labelEn: "Activation of Will ↔ Potential" },
    { to: "10-WheelOfFortune", type: "similarTheme", labelJa: "意志 ↔ 運命の転換", labelEn: "Will ↔ Turning of Fate" },
  ],

  "02-TheHighPriestess": [
    { to: "01-TheMagician", type: "complements", labelJa: "内なる知 ↔ 外なる技", labelEn: "Inner Knowledge ↔ Outer Skill" },
    { to: "18-TheMoon", type: "similarTheme", labelJa: "直感 ↔ 神秘", labelEn: "Intuition ↔ Mystery" },
    { to: "03-TheEmpress", type: "tension", labelJa: "静けさ ↔ 生命力", labelEn: "Stillness ↔ Vitality" },
  ],

  "03-TheEmpress": [
    { to: "04-TheEmperor", type: "complements", labelJa: "育成 ↔ 統治", labelEn: "Nurture ↔ Rule" },
    { to: "02-TheHighPriestess", type: "tension", labelJa: "生命力 ↔ 静けさ", labelEn: "Vitality ↔ Stillness" },
  ],

  "04-TheEmperor": [
    { to: "03-TheEmpress", type: "complements", labelJa: "統治 ↔ 育成", labelEn: "Rule ↔ Nurture" },
    { to: "00-TheFool", type: "tension", labelJa: "秩序 ↔ 自由", labelEn: "Order ↔ Freedom" },
    { to: "16-TheTower", type: "tension", labelJa: "秩序ある構造 ↔ 構造の崩壊", labelEn: "Ordered Structure ↔ Collapse of Structure" },
  ],

  "05-TheHierophant": [
    { to: "15-TheDevil", type: "tension", labelJa: "規範 ↔ 欲望", labelEn: "Doctrine ↔ Desire" },
    { to: "20-Judgement", type: "similarTheme", labelJa: "教え ↔ 呼び覚まし", labelEn: "Teaching ↔ Awakening Call" },
  ],

  "06-TheLovers": [
    { to: "11-Justice", type: "similarTheme", labelJa: "選択 ↔ 判断", labelEn: "Choice ↔ Judgment" },
    { to: "15-TheDevil", type: "tension", labelJa: "愛 ↔ 執着", labelEn: "Love ↔ Attachment" },
  ],

  "07-TheChariot": [
    { to: "12-TheHangedMan", type: "tension", labelJa: "前進 ↔ 停止", labelEn: "Advance ↔ Pause" },
    { to: "08-Strength", type: "similarTheme", labelJa: "突破 ↔ 制御された力", labelEn: "Breakthrough ↔ Disciplined Strength" },
  ],

  "08-Strength": [
    { to: "07-TheChariot", type: "similarTheme", labelJa: "制御された力 ↔ 突破", labelEn: "Disciplined Strength ↔ Breakthrough" },
    { to: "15-TheDevil", type: "tension", labelJa: "自制 ↔ 欲望への屈服", labelEn: "Self-Mastery ↔ Surrender to Desire" },
  ],

  "09-TheHermit": [
    { to: "17-TheStar", type: "similarTheme", labelJa: "探求 ↔ 導き", labelEn: "Search ↔ Guidance" },
    { to: "19-TheSun", type: "tension", labelJa: "孤独 ↔ 開放", labelEn: "Solitude ↔ Openness" },
  ],

  "10-WheelOfFortune": [
    { to: "21-TheWorld", type: "similarTheme", labelJa: "循環 ↔ 完成", labelEn: "Cycle ↔ Completion" },
    { to: "01-TheMagician", type: "similarTheme", labelJa: "運命の転換 ↔ 意志", labelEn: "Turning of Fate ↔ Will" },
  ],

  "11-Justice": [
    { to: "06-TheLovers", type: "similarTheme", labelJa: "判断 ↔ 選択", labelEn: "Judgment ↔ Choice" },
    { to: "20-Judgement", type: "similarTheme", labelJa: "審理 ↔ 最終的な裁き", labelEn: "Evaluation ↔ Final Judgment" },
  ],

  "12-TheHangedMan": [
    { to: "07-TheChariot", type: "tension", labelJa: "停止 ↔ 前進", labelEn: "Pause ↔ Advance" },
    { to: "13-Death", type: "similarTheme", labelJa: "手放し ↔ 終焉による変化", labelEn: "Letting Go ↔ Change Through Ending" },
  ],

  "13-Death": [
    { to: "14-Temperance", type: "complements", labelJa: "終わり ↔ 再調整", labelEn: "Ending ↔ Rebalancing" },
    { to: "21-TheWorld", type: "similarTheme", labelJa: "変容 ↔ 統合", labelEn: "Transformation ↔ Integration" },
    { to: "12-TheHangedMan", type: "similarTheme", labelJa: "終焉による変化 ↔ 手放し", labelEn: "Change Through Ending ↔ Letting Go" },
  ],

  "14-Temperance": [
    { to: "13-Death", type: "complements", labelJa: "再調整 ↔ 終わり", labelEn: "Rebalancing ↔ Ending" },
    { to: "16-TheTower", type: "tension", labelJa: "調和 ↔ 破綻", labelEn: "Harmony ↔ Breakdown" },
  ],

  "15-TheDevil": [
    { to: "05-TheHierophant", type: "tension", labelJa: "欲望 ↔ 規範", labelEn: "Desire ↔ Doctrine" },
    { to: "06-TheLovers", type: "tension", labelJa: "執着 ↔ 愛", labelEn: "Attachment ↔ Love" },
    { to: "08-Strength", type: "tension", labelJa: "欲望への屈服 ↔ 自制", labelEn: "Surrender to Desire ↔ Self-Mastery" },
  ],

  "16-TheTower": [
    { to: "17-TheStar", type: "complements", labelJa: "崩壊 ↔ 希望", labelEn: "Collapse ↔ Hope" },
    { to: "04-TheEmperor", type: "tension", labelJa: "構造の崩壊 ↔ 秩序ある構造", labelEn: "Collapse of Structure ↔ Ordered Structure" },
    { to: "14-Temperance", type: "tension", labelJa: "破綻 ↔ 調和", labelEn: "Breakdown ↔ Harmony" },
  ],

  "17-TheStar": [
    { to: "16-TheTower", type: "complements", labelJa: "希望 ↔ 崩壊", labelEn: "Hope ↔ Collapse" },
    { to: "18-TheMoon", type: "tension", labelJa: "希望 ↔ 不安", labelEn: "Hope ↔ Anxiety" },
    { to: "19-TheSun", type: "similarTheme", labelJa: "希望 ↔ 喜び", labelEn: "Hope ↔ Joy" },
    { to: "09-TheHermit", type: "similarTheme", labelJa: "導き ↔ 探求", labelEn: "Guidance ↔ Search" },
  ],

  "18-TheMoon": [
    { to: "19-TheSun", type: "tension", labelJa: "幻 ↔ 明晰", labelEn: "Illusion ↔ Clarity" },
    { to: "02-TheHighPriestess", type: "similarTheme", labelJa: "神秘 ↔ 直感", labelEn: "Mystery ↔ Intuition" },
    { to: "17-TheStar", type: "tension", labelJa: "不安 ↔ 希望", labelEn: "Anxiety ↔ Hope" },
  ],

  "19-TheSun": [
    { to: "18-TheMoon", type: "tension", labelJa: "明晰 ↔ 幻", labelEn: "Clarity ↔ Illusion" },
    { to: "17-TheStar", type: "similarTheme", labelJa: "喜び ↔ 希望", labelEn: "Joy ↔ Hope" },
    { to: "09-TheHermit", type: "tension", labelJa: "開放 ↔ 孤独", labelEn: "Openness ↔ Solitude" },
  ],

  "20-Judgement": [
    { to: "05-TheHierophant", type: "similarTheme", labelJa: "呼び覚まし ↔ 教え", labelEn: "Awakening Call ↔ Teaching" },
    { to: "11-Justice", type: "similarTheme", labelJa: "最終的な裁き ↔ 審理", labelEn: "Final Judgment ↔ Evaluation" },
    { to: "21-TheWorld", type: "complements", labelJa: "再生 ↔ 完成", labelEn: "Rebirth ↔ Completion" },
  ],

  "21-TheWorld": [
    { to: "00-TheFool", type: "complements", labelJa: "完成 ↔ 始まり", labelEn: "Completion ↔ Beginning" },
    { to: "20-Judgement", type: "complements", labelJa: "完成 ↔ 再生", labelEn: "Completion ↔ Rebirth" },
    { to: "10-WheelOfFortune", type: "similarTheme", labelJa: "完成 ↔ 循環", labelEn: "Completion ↔ Cycle" },
    { to: "13-Death", type: "similarTheme", labelJa: "統合 ↔ 変容", labelEn: "Integration ↔ Transformation" },
  ],
};


function colorFromElement(element: string) {
  switch (element) {
    case "fire":
      return 0xff8888;
    case "water":
      return 0x8888ff;
    case "air":
      return 0xc9d8ff;
    case "earth":
      return 0x66aa44;
    case "special":
      return 0xFFD700;
    default:
      return element;
  }
}

function cssColorFromElement(element: string) {
  switch (element) {
    case "fire":
      return "#ff8888";
    case "water":
      return "#8888ff";
    case "air":
      return "#c9d8ff";
    case "earth":
      return "#66aa44";
    case "special":
      return "#ffd700";
    default:
      return "#64748b";
  }
}
function elementLabelJa(element: string) {
  switch (element) {
    case "fire":
      return "火";
    case "water":
      return "水";
    case "air":
      return "風";
    case "earth":
      return "地";
    case "special":
      return "特別";
    default:
      return element;
  }
}

function elementLabelEn(element: string) {
  switch (element) {
    case "fire":
      return "Fire";
    case "water":
      return "Water";
    case "air":
      return "Air";
    case "earth":
      return "Earth";
    case "special":
      return "Special";
    default:
      return element;
  }
}

function getTagFromElements(elements: TarotElement[], lang: Lang) {
  let tags: { element: TarotElement, keyword: string }[] = [];
  for (var i = 0; i < elements.length; i++) {
    if (elements[i] == "air") {
      if (lang == "ja") {
        tags = [...tags, ...elementsTag.air.keywordsJa.map((k) => {
          return {
            element: elements[i], //
            keyword: k //
          }
        })];
      } else {
        tags = [...tags, ...elementsTag.air.keywordsEn.map((k) => {
          return {
            element: elements[i], //
            keyword: k //
          }
        })];
      }
    }
    else if (elements[i] == "water") {
      if (lang == "ja") {
        tags = [...tags, ...elementsTag.water.keywordsJa.map((k) => {
          return {
            element: elements[i], //
            keyword: k //
          }
        })];
      } else {
        tags = [...tags, ...elementsTag.water.keywordsEn.map((k) => {
          return {
            element: elements[i], //
            keyword: k //
          }
        })];
      }
    }
    else if (elements[i] == "earth") {
      if (lang == "ja") {
        tags = [...tags, ...elementsTag.earth.keywordsJa.map((k) => {
          return {
            element: elements[i], //
            keyword: k //
          }
        })];
      } else {
        tags = [...tags, ...elementsTag.earth.keywordsEn.map((k) => {
          return {
            element: elements[i], //
            keyword: k //
          }
        })];
      }
    }
    else if (elements[i] == "fire") {
      if (lang == "ja") {
        tags = [...tags, ...elementsTag.fire.keywordsJa.map((k) => {
          return {
            element: elements[i], //
            keyword: k //
          }
        })];
      } else {
        tags = [...tags, ...elementsTag.fire.keywordsEn.map((k) => {
          return {
            element: elements[i], //
            keyword: k //
          }
        })];
      }
    }

  }
  return tags;
}

export { majorArcanaCards, majorArcanaSpecialRelations, elementRelations, elementLabelEn, elementLabelJa, colorFromElement, cssColorFromElement, elementsTag, getTagFromElements };
export type { TarotCard, TarotMeaning };