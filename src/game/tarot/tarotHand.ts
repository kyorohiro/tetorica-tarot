import {
  majorArcanaSpecialRelations,
  type TarotCard,
  type TarotElement,
} from "./majorArcana";
import { tarotHandSpecialList } from "./tarotHandSpecial";

export type TarotPlayedCard = {
  card: TarotCard;

  /**
   * 正逆位置を利用する場合のために保持。
   * 現在の役判定ではまだ使用していない。
   */
  reversed?: boolean;
};

export type TarotHandCategory =
  | "number"
  | "element"
  | "relation"
  | "orientation"
  | "composite";

export type TarotHandResult = {
  id: string;
  category: TarotHandCategory;
  score: number;

  labelJa: string;
  labelEn: string;

  descriptionJa: string;
  descriptionEn: string;

  matchedCards: TarotPlayedCard[];

  /**
   * Relation系で成立した個別関係の表示に使用できる。
   */
  relationLabelsJa?: string[];
  relationLabelsEn?: string[];
};

export type TarotHandDefinition = {
  calc: (
    cards: readonly TarotPlayedCard[],
  ) => TarotHandResult | null;
};

export type TarotHandEvaluation = {
  score: number;
  hands: TarotHandResult[];
};

type NormalTarotElement = Exclude<TarotElement, "special">;

type SpecialRelationType =
  | "complements"
  | "similarTheme"
  | "tension";

type RelationMatch = {
  cards: [TarotPlayedCard, TarotPlayedCard];
  labelJa: string;
  labelEn: string;
  type: SpecialRelationType;
};

const NORMAL_ELEMENTS: readonly NormalTarotElement[] = [
  "fire",
  "water",
  "air",
  "earth",
];

function isNormalElement(
  element: TarotElement,
): element is NormalTarotElement {
  return element !== "special";
}

/**
 * 同じ主属性を持つカードを探す。
 */
function findSameElementCards(
  cards: readonly TarotPlayedCard[],
  count: number,
): TarotPlayedCard[] | null {
  const groups = new Map<
    NormalTarotElement,
    TarotPlayedCard[]
  >();

  for (const playedCard of cards) {
    const element = playedCard.card.element;

    if (!isNormalElement(element)) {
      continue;
    }

    const group = groups.get(element) ?? [];
    group.push(playedCard);
    groups.set(element, group);
  }

  for (const group of groups.values()) {
    if (group.length >= count) {
      return group.slice(0, count);
    }
  }

  return null;
}

/**
 * 指定された長さの連番を探す。
 */
function findStraight(
  cards: readonly TarotPlayedCard[],
  length: number,
): TarotPlayedCard[] | null {
  if (cards.length < length) {
    return null;
  }

  const sortedCards = [...cards].sort(
    (a, b) => a.card.id - b.card.id,
  );

  for (
    let startIndex = 0;
    startIndex <= sortedCards.length - length;
    startIndex += 1
  ) {
    const candidate = sortedCards.slice(
      startIndex,
      startIndex + length,
    );

    const isStraight = candidate.every(
      (playedCard, index) => {
        if (index === 0) {
          return true;
        }

        return (
          playedCard.card.id ===
          candidate[index - 1].card.id + 1
        );
      },
    );

    if (isStraight) {
      return candidate;
    }
  }

  return null;
}

/**
 * 2枚のカード間に指定されたRelationがあるか調べる。
 *
 * majorArcanaSpecialRelationsには両方向の定義が多いが、
 * 片方向しか定義されていない場合にも対応する。
 */
function findRelationBetweenCards(
  first: TarotPlayedCard,
  second: TarotPlayedCard,
  types?: readonly SpecialRelationType[],
): RelationMatch | null {
  const firstRelations =
    majorArcanaSpecialRelations[first.card.uid] ?? [];

  const firstToSecond = firstRelations.find(
    (relation) =>
      relation.to === second.card.uid &&
      (!types ||
        types.includes(
          relation.type as SpecialRelationType,
        )),
  );

  if (firstToSecond) {
    return {
      cards: [first, second],
      type: firstToSecond.type as SpecialRelationType,
      labelJa: firstToSecond.labelJa,
      labelEn: firstToSecond.labelEn,
    };
  }

  const secondRelations =
    majorArcanaSpecialRelations[second.card.uid] ?? [];

  const secondToFirst = secondRelations.find(
    (relation) =>
      relation.to === first.card.uid &&
      (!types ||
        types.includes(
          relation.type as SpecialRelationType,
        )),
  );

  if (secondToFirst) {
    return {
      cards: [first, second],
      type: secondToFirst.type as SpecialRelationType,
      labelJa: secondToFirst.labelJa,
      labelEn: secondToFirst.labelEn,
    };
  }

  return null;
}

/**
 * 手札内にあるRelationを重複なしで取得する。
 *
 * A → B と B → A が両方定義されていても、
 * 1つの関係として扱う。
 */
function findAllRelations(
  cards: readonly TarotPlayedCard[],
  types?: readonly SpecialRelationType[],
): RelationMatch[] {
  const matches: RelationMatch[] = [];

  for (
    let firstIndex = 0;
    firstIndex < cards.length;
    firstIndex += 1
  ) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < cards.length;
      secondIndex += 1
    ) {
      const relation = findRelationBetweenCards(
        cards[firstIndex],
        cards[secondIndex],
        types,
      );

      if (relation) {
        matches.push(relation);
      }
    }
  }

  return matches;
}

function findFirstRelation(
  cards: readonly TarotPlayedCard[],
  type: SpecialRelationType,
): RelationMatch | null {
  return findAllRelations(cards, [type])[0] ?? null;
}

/**
 * Relationによって接続されたカード群を探す。
 *
 * 3枚以上が一つの連結グループになっていれば
 * relationChain成立とする。
 */
function findRelationChain(
  cards: readonly TarotPlayedCard[],
): TarotPlayedCard[] | null {
  const relations = findAllRelations(cards);

  if (relations.length < 2) {
    return null;
  }

  const adjacency = new Map<string, Set<string>>();

  for (const relation of relations) {
    const [first, second] = relation.cards;

    const firstConnections =
      adjacency.get(first.card.uid) ?? new Set<string>();

    const secondConnections =
      adjacency.get(second.card.uid) ?? new Set<string>();

    firstConnections.add(second.card.uid);
    secondConnections.add(first.card.uid);

    adjacency.set(first.card.uid, firstConnections);
    adjacency.set(second.card.uid, secondConnections);
  }

  const visited = new Set<string>();

  for (const playedCard of cards) {
    if (visited.has(playedCard.card.uid)) {
      continue;
    }

    const componentIds = new Set<string>();
    const queue = [playedCard.card.uid];

    while (queue.length > 0) {
      const currentUid = queue.shift();

      if (!currentUid || componentIds.has(currentUid)) {
        continue;
      }

      componentIds.add(currentUid);
      visited.add(currentUid);

      const connections = adjacency.get(currentUid);

      if (!connections) {
        continue;
      }

      for (const connectedUid of connections) {
        if (!componentIds.has(connectedUid)) {
          queue.push(connectedUid);
        }
      }
    }

    if (componentIds.size >= 3) {
      return cards.filter(({ card }) =>
        componentIds.has(card.uid),
      );
    }
  }

  return null;
}

/**
 * Element Pair
 */
const elementPair: TarotHandDefinition = {
  calc(cards) {
    const matchedCards = findSameElementCards(cards, 2);

    if (!matchedCards) {
      return null;
    }

    return {
      id: "elementPair",
      category: "element",
      score: 20,

      labelJa: "属性の対",
      labelEn: "Element Pair",

      descriptionJa:
        "同じ主属性を持つカードが2枚あります。",
      descriptionEn:
        "Two cards share the same primary element.",

      matchedCards,
    };
  },
};

/**
 * Element Three
 */
const elementThree: TarotHandDefinition = {
  calc(cards) {
    const matchedCards = findSameElementCards(cards, 3);

    if (!matchedCards) {
      return null;
    }

    return {
      id: "elementThree",
      category: "element",
      score: 60,

      labelJa: "属性の三位",
      labelEn: "Element Three",

      descriptionJa:
        "同じ主属性を持つカードが3枚あります。",
      descriptionEn:
        "Three cards share the same primary element.",

      matchedCards,
    };
  },
};

/**
 * Element Four
 */
const elementFour: TarotHandDefinition = {
  calc(cards) {
    const matchedCards = findSameElementCards(cards, 4);

    if (!matchedCards) {
      return null;
    }

    return {
      id: "elementFour",
      category: "element",
      score: 140,

      labelJa: "属性の四位",
      labelEn: "Element Four",

      descriptionJa:
        "同じ主属性を持つカードが4枚あります。",
      descriptionEn:
        "Four cards share the same primary element.",

      matchedCards,
    };
  },
};

/**
 * Element Flush
 */
const elementFlush: TarotHandDefinition = {
  calc(cards) {
    if (cards.length !== 5) {
      return null;
    }

    const firstElement = cards[0]?.card.element;

    if (
      !firstElement ||
      !isNormalElement(firstElement)
    ) {
      return null;
    }

    const matched = cards.every(
      ({ card }) => card.element === firstElement,
    );

    if (!matched) {
      return null;
    }

    return {
      id: "elementFlush",
      category: "element",
      score: 300,

      labelJa: "元素統一",
      labelEn: "Element Flush",

      descriptionJa:
        "5枚すべてが同じ主属性です。",
      descriptionEn:
        "All five cards share the same primary element.",

      matchedCards: [...cards],
    };
  },
};

/**
 * Four Elements
 */
const fourElements: TarotHandDefinition = {
  calc(cards) {
    const matchedCards: TarotPlayedCard[] = [];

    for (const element of NORMAL_ELEMENTS) {
      const matchedCard = cards.find(
        ({ card }) => card.element === element,
      );

      if (!matchedCard) {
        return null;
      }

      matchedCards.push(matchedCard);
    }

    return {
      id: "fourElements",
      category: "element",
      score: 180,

      labelJa: "四元素",
      labelEn: "Four Elements",

      descriptionJa:
        "火・水・風・地の四元素が揃っています。",
      descriptionEn:
        "Fire, Water, Air, and Earth are all present.",

      matchedCards,
    };
  },
};

/**
 * Three-Card Path
 */
const straightThree: TarotHandDefinition = {
  calc(cards) {
    const matchedCards = findStraight(cards, 3);

    if (!matchedCards) {
      return null;
    }

    return {
      id: "straightThree",
      category: "number",
      score: 40,

      labelJa: "三つの道",
      labelEn: "Three-Card Path",

      descriptionJa:
        "3枚の大アルカナが番号順に並んでいます。",
      descriptionEn:
        "Three Major Arcana cards form a sequence.",

      matchedCards,
    };
  },
};

/**
 * Four-Card Path
 */
const straightFour: TarotHandDefinition = {
  calc(cards) {
    const matchedCards = findStraight(cards, 4);

    if (!matchedCards) {
      return null;
    }

    return {
      id: "straightFour",
      category: "number",
      score: 100,

      labelJa: "四つの道",
      labelEn: "Four-Card Path",

      descriptionJa:
        "4枚の大アルカナが番号順に並んでいます。",
      descriptionEn:
        "Four Major Arcana cards form a sequence.",

      matchedCards,
    };
  },
};

/**
 * Path of Fate
 */
const straightFive: TarotHandDefinition = {
  calc(cards) {
    const matchedCards = findStraight(cards, 5);

    if (!matchedCards) {
      return null;
    }

    return {
      id: "straightFive",
      category: "number",
      score: 240,

      labelJa: "運命の道",
      labelEn: "Path of Fate",

      descriptionJa:
        "5枚の大アルカナが番号順に並んでいます。",
      descriptionEn:
        "Five Major Arcana cards form a sequence.",

      matchedCards,
    };
  },
};

/**
 * Complement
 */
const complementPair: TarotHandDefinition = {
  calc(cards) {
    const relation = findFirstRelation(
      cards,
      "complements",
    );

    if (!relation) {
      return null;
    }

    return {
      id: "complementPair",
      category: "relation",
      score: 80,

      labelJa: "相補",
      labelEn: "Complement",

      descriptionJa:
        "互いを補完する2枚が揃っています。",
      descriptionEn:
        "Two complementary cards are present.",

      matchedCards: [...relation.cards],
      relationLabelsJa: [relation.labelJa],
      relationLabelsEn: [relation.labelEn],
    };
  },
};

/**
 * Resonance
 */
const similarThemePair: TarotHandDefinition = {
  calc(cards) {
    const relation = findFirstRelation(
      cards,
      "similarTheme",
    );

    if (!relation) {
      return null;
    }

    return {
      id: "similarThemePair",
      category: "relation",
      score: 30,

      labelJa: "共鳴",
      labelEn: "Resonance",

      descriptionJa:
        "似た意味を持つ2枚が揃っています。",
      descriptionEn:
        "Two cards with similar themes are present.",

      matchedCards: [...relation.cards],
      relationLabelsJa: [relation.labelJa],
      relationLabelsEn: [relation.labelEn],
    };
  },
};

/**
 * Tension
 */
const tensionPair: TarotHandDefinition = {
  calc(cards) {
    const relation = findFirstRelation(
      cards,
      "tension",
    );

    if (!relation) {
      return null;
    }

    return {
      id: "tensionPair",
      category: "relation",
      score: 50,

      labelJa: "緊張",
      labelEn: "Tension",

      descriptionJa:
        "対立する意味を持つ2枚が揃っています。",
      descriptionEn:
        "Two cards with opposing themes are present.",

      matchedCards: [...relation.cards],
      relationLabelsJa: [relation.labelJa],
      relationLabelsEn: [relation.labelEn],
    };
  },
};

/**
 * Fate Chain
 */
const relationChain: TarotHandDefinition = {
  calc(cards) {
    const matchedCards = findRelationChain(cards);

    if (!matchedCards) {
      return null;
    }

    const relations = findAllRelations(matchedCards);

    return {
      id: "relationChain",
      category: "relation",
      score: 160,

      labelJa: "運命の連鎖",
      labelEn: "Fate Chain",

      descriptionJa:
        "3枚以上のカードが意味の関係で連なっています。",
      descriptionEn:
        "Three or more cards form a chain of meanings.",

      matchedCards,
      relationLabelsJa: relations.map(
        ({ labelJa }) => labelJa,
      ),
      relationLabelsEn: relations.map(
        ({ labelEn }) => labelEn,
      ),
    };
  },
};

/**
 * Grand Narrative
 *
 * 以下の条件で成立とする。
 *
 * - 手札内に3つ以上のRelationがある
 * - Relationに関係するカードが4枚以上ある
 *
 * 条件はゲームバランスに応じて変更可能。
 */
const grandRelation: TarotHandDefinition = {
  calc(cards) {
    const relations = findAllRelations(cards);

    if (relations.length < 3) {
      return null;
    }

    const relatedCardUids = new Set<string>();

    for (const relation of relations) {
      relatedCardUids.add(relation.cards[0].card.uid);
      relatedCardUids.add(relation.cards[1].card.uid);
    }

    if (relatedCardUids.size < 4) {
      return null;
    }

    const matchedCards = cards.filter(({ card }) =>
      relatedCardUids.has(card.uid),
    );

    return {
      id: "grandRelation",
      category: "composite",
      score: 320,

      labelJa: "大いなる物語",
      labelEn: "Grand Narrative",

      descriptionJa:
        "手札の中に複数の意味関係が成立しています。",
      descriptionEn:
        "Multiple semantic relations exist within the hand.",

      matchedCards,
      relationLabelsJa: relations.map(
        ({ labelJa }) => labelJa,
      ),
      relationLabelsEn: relations.map(
        ({ labelEn }) => labelEn,
      ),
    };
  },
};

/**
 * 役の評価順。
 *
 * 現在は弱い役から強い役の順に並べている。
 */
export const tarotHandList: readonly TarotHandDefinition[] = [
    elementPair,
    similarThemePair,
    straightThree,
    tensionPair,
    elementThree,
    complementPair,
    straightFour,
    elementFour,
    relationChain,
    fourElements,
    straightFive,
    elementFlush,
    grandRelation,
  ...tarotHandSpecialList,
];

/**
 * 手札に成立しているすべての役を評価する。
 *
 * evaluateTarotHand.tsを別に作らず、
 * このファイルから直接exportできる。
 */
export function evaluateTarotHand(
  cards: readonly TarotPlayedCard[],
): TarotHandEvaluation {
  const hands = tarotHandList
    .map(({ calc }) => calc(cards))
    .filter(
      (result): result is TarotHandResult =>
        result !== null,
    );

  return {
    score: hands.reduce(
      (total, hand) => total + hand.score,
      0,
    ),
    hands,
  };
}