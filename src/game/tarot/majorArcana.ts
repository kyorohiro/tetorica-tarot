type TarotCardText = {
  titleJa: string;
  titleEn: string;
  keywordsJa: string[];
  keywordsEn: string[];
};

const majorArcanaCards: Record<string, TarotCardText> = {
  "00-TheFool": {
    titleJa: "愚者",
    titleEn: "The Fool",
    keywordsJa: ["始まり", "衝動", "可能性"],
    keywordsEn: ["Beginning", "Impulse", "Potential"],
  },
  "01-TheMagician": {
    titleJa: "魔術師",
    titleEn: "The Magician",
    keywordsJa: ["技術", "意志", "創造"],
    keywordsEn: ["Skill", "Will", "Creation"],
  },
  "02-TheHighPriestess": {
    titleJa: "女教皇",
    titleEn: "The High Priestess",
    keywordsJa: ["直感", "秘密", "静けさ"],
    keywordsEn: ["Intuition", "Secrets", "Stillness"],
  },
  "03-TheEmpress": {
    titleJa: "女帝",
    titleEn: "The Empress",
    keywordsJa: ["豊かさ", "育成", "受容"],
    keywordsEn: ["Abundance", "Nurture", "Acceptance"],
  },
  "04-TheEmperor": {
    titleJa: "皇帝",
    titleEn: "The Emperor",
    keywordsJa: ["支配", "秩序", "権威"],
    keywordsEn: ["Authority", "Order", "Control"],
  },
  "05-TheHierophant": {
    titleJa: "法王",
    titleEn: "The Hierophant",
    keywordsJa: ["教え", "伝統", "規範"],
    keywordsEn: ["Teaching", "Tradition", "Rules"],
  },
  "06-TheLovers": {
    titleJa: "恋人",
    titleEn: "The Lovers",
    keywordsJa: ["選択", "結びつき", "調和"],
    keywordsEn: ["Choice", "Bond", "Harmony"],
  },
  "07-TheChariot": {
    titleJa: "戦車",
    titleEn: "The Chariot",
    keywordsJa: ["前進", "勝利", "突破"],
    keywordsEn: ["Advance", "Victory", "Breakthrough"],
  },
  "08-Strength": {
    titleJa: "力",
    titleEn: "Strength",
    keywordsJa: ["忍耐", "制御", "勇気"],
    keywordsEn: ["Patience", "Control", "Courage"],
  },
  "09-TheHermit": {
    titleJa: "隠者",
    titleEn: "The Hermit",
    keywordsJa: ["探求", "孤独", "内省"],
    keywordsEn: ["Search", "Solitude", "Reflection"],
  },
  "10-WheelOfFortune": {
    titleJa: "運命の輪",
    titleEn: "Wheel of Fortune",
    keywordsJa: ["転機", "循環", "運命"],
    keywordsEn: ["Turning Point", "Cycle", "Fate"],
  },
  "11-Justice": {
    titleJa: "正義",
    titleEn: "Justice",
    keywordsJa: ["均衡", "判断", "責任"],
    keywordsEn: ["Balance", "Judgment", "Responsibility"],
  },
  "12-TheHangedMan": {
    titleJa: "吊るされた男",
    titleEn: "The Hanged Man",
    keywordsJa: ["停止", "視点転換", "受容"],
    keywordsEn: ["Pause", "New Perspective", "Acceptance"],
  },
  "13-Death": {
    titleJa: "死神",
    titleEn: "Death",
    keywordsJa: ["終わり", "変化", "再出発"],
    keywordsEn: ["Ending", "Transformation", "Restart"],
  },
  "14-Temperance": {
    titleJa: "節制",
    titleEn: "Temperance",
    keywordsJa: ["調和", "調整", "中庸"],
    keywordsEn: ["Harmony", "Adjustment", "Moderation"],
  },
  "15-TheDevil": {
    titleJa: "悪魔",
    titleEn: "The Devil",
    keywordsJa: ["執着", "欲望", "束縛"],
    keywordsEn: ["Obsession", "Desire", "Bondage"],
  },
  "16-TheTower": {
    titleJa: "塔",
    titleEn: "The Tower",
    keywordsJa: ["崩壊", "衝撃", "破綻"],
    keywordsEn: ["Collapse", "Shock", "Breakdown"],
  },
  "17-TheStar": {
    titleJa: "星",
    titleEn: "The Star",
    keywordsJa: ["希望", "癒し", "導き"],
    keywordsEn: ["Hope", "Healing", "Guidance"],
  },
  "18-TheMoon": {
    titleJa: "月",
    titleEn: "The Moon",
    keywordsJa: ["不安", "幻", "曖昧さ"],
    keywordsEn: ["Anxiety", "Illusion", "Ambiguity"],
  },
  "19-TheSun": {
    titleJa: "太陽",
    titleEn: "The Sun",
    keywordsJa: ["成功", "喜び", "明快さ"],
    keywordsEn: ["Success", "Joy", "Clarity"],
  },
  "20-Judgement": {
    titleJa: "審判",
    titleEn: "Judgement",
    keywordsJa: ["覚醒", "再生", "決断"],
    keywordsEn: ["Awakening", "Rebirth", "Decision"],
  },
  "21-TheWorld": {
    titleJa: "世界",
    titleEn: "The World",
    keywordsJa: ["完成", "到達", "統合"],
    keywordsEn: ["Completion", "Achievement", "Integration"],
  },
};

export {
    majorArcanaCards,
}

export type {
    TarotCardText
}