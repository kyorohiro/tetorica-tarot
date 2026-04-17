
export type TarotElement = "fire" | "water" | "air" | "earth" | "special";

type TarotMeaning = {
  keywordsJa: string[];
  keywordsEn: string[];
};

type TarotCard = {
  element: TarotElement;
  titleJa: string;
  titleEn: string;
  upright: TarotMeaning;
  reversed: TarotMeaning;
};

const majorArcanaCards: Record<string, TarotCard> = {
  "00-TheFool": {
    titleJa: "愚者",
    titleEn: "The Fool",
    element: "air",
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
    titleJa: "魔術師",
    titleEn: "The Magician",
    element: "special",
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
    titleJa: "女教皇",
    titleEn: "The High Priestess",
    element: "water",
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
    titleJa: "女帝",
    titleEn: "The Empress",
    element: "earth",
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
    titleJa: "皇帝",
    titleEn: "The Emperor",
    element: "fire",
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
    titleJa: "法王",
    titleEn: "The Hierophant",
    element: "earth",
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
    titleJa: "恋人",
    titleEn: "The Lovers",
    element: "air",
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
    titleJa: "戦車",
    titleEn: "The Chariot",
    element: "water",
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
    titleJa: "力",
    titleEn: "Strength",
    element: "fire",
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
    titleJa: "隠者",
    titleEn: "The Hermit",
    element: "earth",
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
    titleJa: "運命の輪",
    titleEn: "Wheel of Fortune",
    element: "special",
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
    titleJa: "正義",
    titleEn: "Justice",
    element: "air",
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
    titleJa: "吊るされた男",
    titleEn: "The Hanged Man",
    element: "water",
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
    titleJa: "死神",
    titleEn: "Death",
    element: "water",
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
    titleJa: "節制",
    titleEn: "Temperance",
    element: "fire",
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
    titleJa: "悪魔",
    titleEn: "The Devil",
    element: "earth",
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
    titleJa: "塔",
    titleEn: "The Tower",
    element: "fire",
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
    titleJa: "星",
    titleEn: "The Star",
    element: "air",
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
    titleJa: "月",
    titleEn: "The Moon",
    element: "water",
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
    titleJa: "太陽",
    titleEn: "The Sun",
    element: "fire",
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
    titleJa: "審判",
    titleEn: "Judgement",
    element: "fire",
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
    titleJa: "世界",
    titleEn: "The World",
    element: "earth",
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

export { majorArcanaCards };
export type { TarotCard, TarotMeaning };