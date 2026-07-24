import type {
    TarotHandDefinition,
    TarotPlayedCard,
} from "./tarotHand";

type CandidateTarotHandDefinition = {
    id: string;
    score: number;
    labelJa: string;
    labelEn: string;
    descriptionJa: string;
    descriptionEn: string;
    candidateUids: readonly string[];
    minimumCount: number;
};

/**
 * 指定されたカードUIDのうち、必要枚数以上が含まれているか判定する。
 */
function findCandidateCards(
    cards: readonly TarotPlayedCard[],
    candidateUids: readonly string[],
    minimumCount: number,
): TarotPlayedCard[] | null {
    const candidateUidSet = new Set(candidateUids);

    const matchedCards = cards.filter(({ card }) =>
        candidateUidSet.has(card.uid),
    );

    return matchedCards.length >= minimumCount
        ? matchedCards
        : null;
}

/**
 * カード候補と必要枚数から、物語役を生成する。
 */
function createCandidateTarotHand(
    definition: CandidateTarotHandDefinition,
): TarotHandDefinition {
    return {
        calc(cards) {
            const matchedCards = findCandidateCards(
                cards,
                definition.candidateUids,
                definition.minimumCount,
            );

            if (!matchedCards) {
                return null;
            }

            return {
                id: definition.id,
                category: "composite",
                score: definition.score,
                labelJa: definition.labelJa,
                labelEn: definition.labelEn,
                descriptionJa: definition.descriptionJa,
                descriptionEn: definition.descriptionEn,
                matchedCards,
            };
        },
    };
}

const candidateSpecialHandDefinitions:
    readonly CandidateTarotHandDefinition[] = [
        // ---------------------------------------------------------------------
        // 既存の物語役
        // ---------------------------------------------------------------------

        {
            id: "catastrophe",
            score: 260,
            labelJa: "破局",
            labelEn: "Catastrophe",
            descriptionJa:
                "終焉・執着・崩壊・不安が重なり、大きな破局を示しています。",
            descriptionEn:
                "Ending, obsession, collapse, and anxiety converge into catastrophe.",
            candidateUids: [
                "13-Death",
                "15-TheDevil",
                "16-TheTower",
                "18-TheMoon",
            ],
            minimumCount: 3,
        },
        {
            id: "salvation",
            score: 280,
            labelJa: "救済",
            labelEn: "Salvation",
            descriptionJa:
                "希望・成功・再生・完成が結びつき、救済への道が開かれています。",
            descriptionEn:
                "Hope, success, rebirth, and completion open a path to salvation.",
            candidateUids: [
                "17-TheStar",
                "19-TheSun",
                "20-Judgement",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "rebirth",
            score: 300,
            labelJa: "再生",
            labelEn: "Rebirth",
            descriptionJa:
                "終わりと崩壊を越え、新しい存在として再び立ち上がります。",
            descriptionEn:
                "After ending and collapse, a new existence rises again.",
            candidateUids: [
                "13-Death",
                "16-TheTower",
                "20-Judgement",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "temptation",
            score: 220,
            labelJa: "誘惑",
            labelEn: "Temptation",
            descriptionJa:
                "選択が欲望と幻に揺さぶられ、誘惑に囚われています。",
            descriptionEn:
                "Choice is shaken by desire and illusion, creating temptation.",
            candidateUids: [
                "06-TheLovers",
                "15-TheDevil",
                "18-TheMoon",
            ],
            minimumCount: 3,
        },
        {
            id: "awakening",
            score: 270,
            labelJa: "覚醒",
            labelEn: "Awakening",
            descriptionJa:
                "直感と内省を経て、真実への覚醒が訪れています。",
            descriptionEn:
                "Intuition and reflection lead to an awakening to the truth.",
            candidateUids: [
                "02-TheHighPriestess",
                "09-TheHermit",
                "19-TheSun",
                "20-Judgement",
            ],
            minimumCount: 3,
        },
        {
            id: "sacrifice",
            score: 240,
            labelJa: "犠牲",
            labelEn: "Sacrifice",
            descriptionJa:
                "忍耐と手放しを受け入れ、何かを得るために何かを差し出します。",
            descriptionEn:
                "Patience and release require something to be given up.",
            candidateUids: [
                "08-Strength",
                "12-TheHangedMan",
                "13-Death",
                "14-Temperance",
            ],
            minimumCount: 3,
        },
        {
            id: "heroesJourney",
            score: 360,
            labelJa: "英雄の旅",
            labelEn: "Hero's Journey",
            descriptionJa:
                "旅立ちから試練、克服、完成へと至る英雄の物語です。",
            descriptionEn:
                "A heroic story unfolds from departure through trial and completion.",
            candidateUids: [
                "00-TheFool",
                "01-TheMagician",
                "07-TheChariot",
                "08-Strength",
                "21-TheWorld",
            ],
            minimumCount: 4,
        },

        // ---------------------------------------------------------------------
        // 始まり・創造
        // ---------------------------------------------------------------------

        {
            id: "newBeginning",
            score: 220,
            labelJa: "新たな始まり",
            labelEn: "New Beginning",
            descriptionJa:
                "過去を離れ、新しい可能性へ踏み出します。",
            descriptionEn:
                "The past is left behind as a new possibility begins.",
            candidateUids: [
                "00-TheFool",
                "01-TheMagician",
                "10-WheelOfFortune",
                "20-Judgement",
            ],
            minimumCount: 3,
        },
        {
            id: "creation",
            score: 240,
            labelJa: "創造",
            labelEn: "Creation",
            descriptionJa:
                "意志と豊かさが結びつき、新しいものが生まれます。",
            descriptionEn:
                "Will and abundance combine to create something new.",
            candidateUids: [
                "01-TheMagician",
                "03-TheEmpress",
                "19-TheSun",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "manifestation",
            score: 250,
            labelJa: "顕現",
            labelEn: "Manifestation",
            descriptionJa:
                "意志が現実の形となって現れます。",
            descriptionEn:
                "Will takes form and manifests in reality.",
            candidateUids: [
                "01-TheMagician",
                "04-TheEmperor",
                "07-TheChariot",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "firstStep",
            score: 210,
            labelJa: "第一歩",
            labelEn: "First Step",
            descriptionJa:
                "可能性が意志となり、最初の行動へ移ります。",
            descriptionEn:
                "Potential becomes will and takes its first action.",
            candidateUids: [
                "00-TheFool",
                "01-TheMagician",
                "07-TheChariot",
            ],
            minimumCount: 3,
        },
        {
            id: "infinitePotential",
            score: 260,
            labelJa: "無限の可能性",
            labelEn: "Infinite Potential",
            descriptionJa:
                "始まりの中に、希望と完成へ至る可能性が宿っています。",
            descriptionEn:
                "The beginning contains the potential for hope and completion.",
            candidateUids: [
                "00-TheFool",
                "01-TheMagician",
                "17-TheStar",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "birth",
            score: 240,
            labelJa: "誕生",
            labelEn: "Birth",
            descriptionJa:
                "生命と可能性が、新しい世界へ生まれ出ます。",
            descriptionEn:
                "Life and possibility are born into a new world.",
            candidateUids: [
                "00-TheFool",
                "03-TheEmpress",
                "19-TheSun",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },

        // ---------------------------------------------------------------------
        // 愛・関係
        // ---------------------------------------------------------------------

        {
            id: "trueLove",
            score: 250,
            labelJa: "真実の愛",
            labelEn: "True Love",
            descriptionJa:
                "受容と調和に支えられた、明るい愛情です。",
            descriptionEn:
                "A bright love supported by acceptance and harmony.",
            candidateUids: [
                "03-TheEmpress",
                "06-TheLovers",
                "14-Temperance",
                "19-TheSun",
            ],
            minimumCount: 3,
        },
        {
            id: "forbiddenLove",
            score: 250,
            labelJa: "禁断の恋",
            labelEn: "Forbidden Love",
            descriptionJa:
                "愛情と欲望が、規範や社会的な裁きと衝突しています。",
            descriptionEn:
                "Love and desire collide with doctrine and social judgment.",
            candidateUids: [
                "05-TheHierophant",
                "06-TheLovers",
                "11-Justice",
                "15-TheDevil",
            ],
            minimumCount: 3,
        },
        {
            id: "sacredUnion",
            score: 270,
            labelJa: "聖なる結合",
            labelEn: "Sacred Union",
            descriptionJa:
                "直感・受容・愛が一つに統合されます。",
            descriptionEn:
                "Intuition, acceptance, and love unite into a whole.",
            candidateUids: [
                "02-TheHighPriestess",
                "03-TheEmpress",
                "06-TheLovers",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "soulmate",
            score: 270,
            labelJa: "魂の伴侶",
            labelEn: "Soulmate",
            descriptionJa:
                "運命によって結ばれた二つの魂を示します。",
            descriptionEn:
                "Two souls are joined by fate.",
            candidateUids: [
                "06-TheLovers",
                "10-WheelOfFortune",
                "17-TheStar",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "toxicLove",
            score: 250,
            labelJa: "毒された愛",
            labelEn: "Toxic Love",
            descriptionJa:
                "愛情が執着と不安に飲み込まれています。",
            descriptionEn:
                "Love is consumed by attachment and anxiety.",
            candidateUids: [
                "06-TheLovers",
                "15-TheDevil",
                "16-TheTower",
                "18-TheMoon",
            ],
            minimumCount: 3,
        },
        {
            id: "separation",
            score: 230,
            labelJa: "別離",
            labelEn: "Separation",
            descriptionJa:
                "結びつきが停止し、終わりへ向かいます。",
            descriptionEn:
                "A bond comes to a halt and moves toward an ending.",
            candidateUids: [
                "06-TheLovers",
                "12-TheHangedMan",
                "13-Death",
                "16-TheTower",
            ],
            minimumCount: 3,
        },
        {
            id: "reconciliation",
            score: 270,
            labelJa: "和解",
            labelEn: "Reconciliation",
            descriptionJa:
                "失われた調和が回復し、関係が再び結ばれます。",
            descriptionEn:
                "Lost harmony is restored and the bond is renewed.",
            candidateUids: [
                "06-TheLovers",
                "14-Temperance",
                "20-Judgement",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "marriage",
            score: 260,
            labelJa: "結婚",
            labelEn: "Marriage",
            descriptionJa:
                "愛情が社会的な結びつきとして形になります。",
            descriptionEn:
                "Love takes form as a recognized social union.",
            candidateUids: [
                "03-TheEmpress",
                "04-TheEmperor",
                "05-TheHierophant",
                "06-TheLovers",
            ],
            minimumCount: 3,
        },
        {
            id: "family",
            score: 270,
            labelJa: "家族",
            labelEn: "Family",
            descriptionJa:
                "育成・秩序・喜びが一つの家庭を形作ります。",
            descriptionEn:
                "Nurture, order, and joy form a family.",
            candidateUids: [
                "03-TheEmpress",
                "04-TheEmperor",
                "19-TheSun",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },

        // ---------------------------------------------------------------------
        // 権力・社会
        // ---------------------------------------------------------------------

        {
            id: "coronation",
            score: 280,
            labelJa: "戴冠",
            labelEn: "Coronation",
            descriptionJa:
                "秩序と公正が認められ、成功と完成へ至ります。",
            descriptionEn:
                "Order and justice are recognized, leading to success.",
            candidateUids: [
                "04-TheEmperor",
                "11-Justice",
                "19-TheSun",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "authority",
            score: 220,
            labelJa: "権威",
            labelEn: "Authority",
            descriptionJa:
                "統治・伝統・公正による権威が成立します。",
            descriptionEn:
                "Authority emerges through rule, tradition, and justice.",
            candidateUids: [
                "04-TheEmperor",
                "05-TheHierophant",
                "11-Justice",
            ],
            minimumCount: 3,
        },
        {
            id: "tyranny",
            score: 240,
            labelJa: "暴政",
            labelEn: "Tyranny",
            descriptionJa:
                "秩序が欲望と支配に侵され、崩壊へ向かいます。",
            descriptionEn:
                "Order is corrupted by desire and domination.",
            candidateUids: [
                "04-TheEmperor",
                "15-TheDevil",
                "16-TheTower",
            ],
            minimumCount: 3,
        },
        {
            id: "rebellion",
            score: 260,
            labelJa: "反逆",
            labelEn: "Rebellion",
            descriptionJa:
                "束縛を破り、古い秩序に対して立ち上がります。",
            descriptionEn:
                "Bondage is broken as the old order is challenged.",
            candidateUids: [
                "00-TheFool",
                "15-TheDevil",
                "16-TheTower",
                "20-Judgement",
            ],
            minimumCount: 3,
        },
        {
            id: "revolution",
            score: 270,
            labelJa: "革命",
            labelEn: "Revolution",
            descriptionJa:
                "既存の秩序が崩れ、新しい運命の流れが始まります。",
            descriptionEn:
                "The existing order collapses and a new fate begins.",
            candidateUids: [
                "00-TheFool",
                "10-WheelOfFortune",
                "16-TheTower",
                "20-Judgement",
            ],
            minimumCount: 3,
        },
        {
            id: "socialOrder",
            score: 260,
            labelJa: "社会秩序",
            labelEn: "Social Order",
            descriptionJa:
                "権威・伝統・法が社会を一つにまとめます。",
            descriptionEn:
                "Authority, tradition, and law organize society.",
            candidateUids: [
                "04-TheEmperor",
                "05-TheHierophant",
                "11-Justice",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "downfallOfPower",
            score: 250,
            labelJa: "権力の失墜",
            labelEn: "Downfall of Power",
            descriptionJa:
                "強固だった権力が、運命の転換によって崩れます。",
            descriptionEn:
                "Established power collapses through a turn of fate.",
            candidateUids: [
                "04-TheEmperor",
                "10-WheelOfFortune",
                "16-TheTower",
            ],
            minimumCount: 3,
        },
        {
            id: "succession",
            score: 280,
            labelJa: "継承",
            labelEn: "Succession",
            descriptionJa:
                "古い権力が終わり、新しい存在へ受け継がれます。",
            descriptionEn:
                "Old authority ends and passes into a new form.",
            candidateUids: [
                "04-TheEmperor",
                "13-Death",
                "20-Judgement",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },

        // ---------------------------------------------------------------------
        // 精神・探求
        // ---------------------------------------------------------------------

        {
            id: "divineGuidance",
            score: 230,
            labelJa: "天啓",
            labelEn: "Divine Guidance",
            descriptionJa:
                "直感・教え・探求・希望が、進むべき道を示します。",
            descriptionEn:
                "Intuition, teaching, search, and hope reveal the way.",
            candidateUids: [
                "02-TheHighPriestess",
                "05-TheHierophant",
                "09-TheHermit",
                "17-TheStar",
            ],
            minimumCount: 3,
        },
        {
            id: "enlightenment",
            score: 280,
            labelJa: "悟り",
            labelEn: "Enlightenment",
            descriptionJa:
                "内省の果てに、明晰さと全体性へ到達します。",
            descriptionEn:
                "Reflection leads to clarity and wholeness.",
            candidateUids: [
                "02-TheHighPriestess",
                "09-TheHermit",
                "19-TheSun",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "spiritualJourney",
            score: 270,
            labelJa: "精神の旅",
            labelEn: "Spiritual Journey",
            descriptionJa:
                "無垢な旅立ちが、内面の探求と統合へ進みます。",
            descriptionEn:
                "An innocent departure becomes an inner journey toward unity.",
            candidateUids: [
                "00-TheFool",
                "02-TheHighPriestess",
                "09-TheHermit",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "innerWisdom",
            score: 240,
            labelJa: "内なる知恵",
            labelEn: "Inner Wisdom",
            descriptionJa:
                "静けさと忍耐から、内なる知恵が生まれます。",
            descriptionEn:
                "Inner wisdom emerges from stillness and patience.",
            candidateUids: [
                "02-TheHighPriestess",
                "08-Strength",
                "09-TheHermit",
                "14-Temperance",
            ],
            minimumCount: 3,
        },
        {
            id: "meditation",
            score: 230,
            labelJa: "瞑想",
            labelEn: "Meditation",
            descriptionJa:
                "停止と静けさの中で、心が調整されます。",
            descriptionEn:
                "The mind is balanced through pause and stillness.",
            candidateUids: [
                "02-TheHighPriestess",
                "09-TheHermit",
                "12-TheHangedMan",
                "14-Temperance",
            ],
            minimumCount: 3,
        },
        {
            id: "prophecy",
            score: 260,
            labelJa: "予言",
            labelEn: "Prophecy",
            descriptionJa:
                "直感が運命の流れと未来の兆しを捉えます。",
            descriptionEn:
                "Intuition perceives fate and signs of what is to come.",
            candidateUids: [
                "02-TheHighPriestess",
                "10-WheelOfFortune",
                "18-TheMoon",
                "20-Judgement",
            ],
            minimumCount: 3,
        },
        {
            id: "revelation",
            score: 270,
            labelJa: "啓示",
            labelEn: "Revelation",
            descriptionJa:
                "隠されていた真実が、衝撃とともに明らかになります。",
            descriptionEn:
                "A hidden truth is revealed through sudden upheaval.",
            candidateUids: [
                "02-TheHighPriestess",
                "16-TheTower",
                "19-TheSun",
                "20-Judgement",
            ],
            minimumCount: 3,
        },
        {
            id: "mysticism",
            score: 240,
            labelJa: "神秘",
            labelEn: "Mysticism",
            descriptionJa:
                "直感・孤独・幻・希望が神秘の領域を開きます。",
            descriptionEn:
                "Intuition, solitude, illusion, and hope open the mystical realm.",
            candidateUids: [
                "02-TheHighPriestess",
                "09-TheHermit",
                "17-TheStar",
                "18-TheMoon",
            ],
            minimumCount: 3,
        },
        {
            id: "darkNight",
            score: 260,
            labelJa: "魂の暗夜",
            labelEn: "Dark Night of the Soul",
            descriptionJa:
                "孤独と不安の中で、古い自己が崩れようとしています。",
            descriptionEn:
                "Within solitude and anxiety, the former self collapses.",
            candidateUids: [
                "09-TheHermit",
                "15-TheDevil",
                "16-TheTower",
                "18-TheMoon",
            ],
            minimumCount: 3,
        },

        // ---------------------------------------------------------------------
        // 変化・再生
        // ---------------------------------------------------------------------

        {
            id: "transformation",
            score: 270,
            labelJa: "変容",
            labelEn: "Transformation",
            descriptionJa:
                "停止と終わりを経て、新しい全体へ変化します。",
            descriptionEn:
                "Pause and ending lead to a transformed whole.",
            candidateUids: [
                "12-TheHangedMan",
                "13-Death",
                "14-Temperance",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "alchemy",
            score: 300,
            labelJa: "錬金術",
            labelEn: "Alchemy",
            descriptionJa:
                "意志によって変容と調整を行い、新しい完成形を生み出します。",
            descriptionEn:
                "Will transforms and recombines existence into a new whole.",
            candidateUids: [
                "01-TheMagician",
                "13-Death",
                "14-Temperance",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "renewal",
            score: 280,
            labelJa: "更新",
            labelEn: "Renewal",
            descriptionJa:
                "終わりの後に希望が戻り、新しい周期が始まります。",
            descriptionEn:
                "Hope returns after an ending and begins a new cycle.",
            candidateUids: [
                "13-Death",
                "17-TheStar",
                "20-Judgement",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "healing",
            score: 250,
            labelJa: "癒やし",
            labelEn: "Healing",
            descriptionJa:
                "受容・忍耐・調整・希望が傷を癒やします。",
            descriptionEn:
                "Acceptance, patience, balance, and hope bring healing.",
            candidateUids: [
                "03-TheEmpress",
                "08-Strength",
                "14-Temperance",
                "17-TheStar",
            ],
            minimumCount: 3,
        },
        {
            id: "resurrection",
            score: 310,
            labelJa: "復活",
            labelEn: "Resurrection",
            descriptionJa:
                "死と崩壊を越えて、光の中へ再び立ち上がります。",
            descriptionEn:
                "Death and collapse are overcome through a return to light.",
            candidateUids: [
                "13-Death",
                "16-TheTower",
                "19-TheSun",
                "20-Judgement",
            ],
            minimumCount: 3,
        },
        {
            id: "phoenix",
            score: 380,
            labelJa: "不死鳥",
            labelEn: "Phoenix",
            descriptionJa:
                "完全な崩壊と死を越え、光の中に復活します。",
            descriptionEn:
                "Complete destruction and death give way to rebirth in light.",
            candidateUids: [
                "13-Death",
                "16-TheTower",
                "19-TheSun",
                "20-Judgement",
            ],
            minimumCount: 4,
        },
        {
            id: "release",
            score: 260,
            labelJa: "解放",
            labelEn: "Release",
            descriptionJa:
                "執着を手放し、古い状態を終えて自由になります。",
            descriptionEn:
                "Attachment is released and an old state comes to an end.",
            candidateUids: [
                "12-TheHangedMan",
                "13-Death",
                "15-TheDevil",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "transition",
            score: 250,
            labelJa: "移行",
            labelEn: "Transition",
            descriptionJa:
                "運命の変化を受け入れ、次の状態へ移ります。",
            descriptionEn:
                "A turn of fate is accepted as life moves into a new state.",
            candidateUids: [
                "10-WheelOfFortune",
                "12-TheHangedMan",
                "13-Death",
                "14-Temperance",
            ],
            minimumCount: 3,
        },

        // ---------------------------------------------------------------------
        // 危機・崩壊
        // ---------------------------------------------------------------------

        {
            id: "disaster",
            score: 260,
            labelJa: "災厄",
            labelEn: "Disaster",
            descriptionJa:
                "運命の歯車が狂い、欲望・崩壊・不安が噴き出します。",
            descriptionEn:
                "Fate turns toward desire, collapse, and anxiety.",
            candidateUids: [
                "10-WheelOfFortune",
                "15-TheDevil",
                "16-TheTower",
                "18-TheMoon",
            ],
            minimumCount: 3,
        },
        {
            id: "downfall",
            score: 270,
            labelJa: "転落",
            labelEn: "Downfall",
            descriptionJa:
                "権力が欲望に侵され、運命の転換によって崩れます。",
            descriptionEn:
                "Power is corrupted by desire and brought down by fate.",
            candidateUids: [
                "04-TheEmperor",
                "10-WheelOfFortune",
                "15-TheDevil",
                "16-TheTower",
            ],
            minimumCount: 3,
        },
        {
            id: "collapse",
            score: 230,
            labelJa: "崩壊",
            labelEn: "Collapse",
            descriptionJa:
                "強固だった構造が終わりを迎え、崩れ落ちます。",
            descriptionEn:
                "A once-stable structure reaches its end and collapses.",
            candidateUids: [
                "04-TheEmperor",
                "13-Death",
                "16-TheTower",
            ],
            minimumCount: 3,
        },
        {
            id: "crisis",
            score: 240,
            labelJa: "危機",
            labelEn: "Crisis",
            descriptionJa:
                "前進する力が、突然の変化と不安に阻まれます。",
            descriptionEn:
                "Forward motion is obstructed by upheaval and uncertainty.",
            candidateUids: [
                "07-TheChariot",
                "10-WheelOfFortune",
                "16-TheTower",
                "18-TheMoon",
            ],
            minimumCount: 3,
        },
        {
            id: "ruin",
            score: 370,
            labelJa: "破滅",
            labelEn: "Ruin",
            descriptionJa:
                "執着・崩壊・不安・終焉がすべて揃っています。",
            descriptionEn:
                "Attachment, collapse, anxiety, and ending are all present.",
            candidateUids: [
                "13-Death",
                "15-TheDevil",
                "16-TheTower",
                "18-TheMoon",
            ],
            minimumCount: 4,
        },
        {
            id: "apocalypse",
            score: 390,
            labelJa: "黙示録",
            labelEn: "Apocalypse",
            descriptionJa:
                "死と崩壊の後、世界を変える審判が訪れます。",
            descriptionEn:
                "After death and collapse, judgment transforms the world.",
            candidateUids: [
                "13-Death",
                "16-TheTower",
                "18-TheMoon",
                "20-Judgement",
            ],
            minimumCount: 4,
        },
        {
            id: "tragedy",
            score: 280,
            labelJa: "悲劇",
            labelEn: "Tragedy",
            descriptionJa:
                "愛が終わりと崩壊、不安に巻き込まれます。",
            descriptionEn:
                "Love is caught in ending, collapse, and anxiety.",
            candidateUids: [
                "06-TheLovers",
                "13-Death",
                "16-TheTower",
                "18-TheMoon",
            ],
            minimumCount: 3,
        },
        {
            id: "aftermath",
            score: 270,
            labelJa: "災厄の後",
            labelEn: "Aftermath",
            descriptionJa:
                "崩壊の跡に希望が現れ、再生と完成へ向かいます。",
            descriptionEn:
                "Hope emerges after collapse and moves toward renewal.",
            candidateUids: [
                "16-TheTower",
                "17-TheStar",
                "20-Judgement",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },

        // ---------------------------------------------------------------------
        // 欲望・影
        // ---------------------------------------------------------------------

        {
            id: "shadowSelf",
            score: 250,
            labelJa: "影の自己",
            labelEn: "Shadow Self",
            descriptionJa:
                "内面に隠された欲望と不安が姿を現します。",
            descriptionEn:
                "Hidden desire and anxiety emerge from within.",
            candidateUids: [
                "02-TheHighPriestess",
                "09-TheHermit",
                "15-TheDevil",
                "18-TheMoon",
            ],
            minimumCount: 3,
        },
        {
            id: "addiction",
            score: 240,
            labelJa: "依存",
            labelEn: "Addiction",
            descriptionJa:
                "愛や欲望に囚われ、動けない状態に陥ります。",
            descriptionEn:
                "Attachment to love or desire creates a state of paralysis.",
            candidateUids: [
                "06-TheLovers",
                "12-TheHangedMan",
                "15-TheDevil",
                "18-TheMoon",
            ],
            minimumCount: 3,
        },
        {
            id: "corruption",
            score: 260,
            labelJa: "堕落",
            labelEn: "Corruption",
            descriptionJa:
                "技術と権力が欲望に利用され、崩壊へ向かいます。",
            descriptionEn:
                "Skill and authority are corrupted by desire.",
            candidateUids: [
                "01-TheMagician",
                "04-TheEmperor",
                "15-TheDevil",
                "16-TheTower",
            ],
            minimumCount: 3,
        },
        {
            id: "illusion",
            score: 240,
            labelJa: "幻惑",
            labelEn: "Illusion",
            descriptionJa:
                "知識と技術が欲望と幻によって歪められます。",
            descriptionEn:
                "Knowledge and skill are distorted by desire and illusion.",
            candidateUids: [
                "01-TheMagician",
                "02-TheHighPriestess",
                "15-TheDevil",
                "18-TheMoon",
            ],
            minimumCount: 3,
        },
        {
            id: "deception",
            score: 250,
            labelJa: "欺瞞",
            labelEn: "Deception",
            descriptionJa:
                "巧みな言葉が真実を覆い、判断を曇らせます。",
            descriptionEn:
                "Clever manipulation obscures truth and judgment.",
            candidateUids: [
                "01-TheMagician",
                "11-Justice",
                "15-TheDevil",
                "18-TheMoon",
            ],
            minimumCount: 3,
        },
        {
            id: "forbiddenKnowledge",
            score: 270,
            labelJa: "禁断の知識",
            labelEn: "Forbidden Knowledge",
            descriptionJa:
                "隠された知識が、欲望と危険な幻に結びつきます。",
            descriptionEn:
                "Hidden knowledge becomes tied to desire and dangerous illusion.",
            candidateUids: [
                "01-TheMagician",
                "02-TheHighPriestess",
                "15-TheDevil",
                "18-TheMoon",
            ],
            minimumCount: 3,
        },
        {
            id: "falseParadise",
            score: 290,
            labelJa: "偽りの楽園",
            labelEn: "False Paradise",
            descriptionJa:
                "幸福と完成の背後に、欲望や幻が潜んでいます。",
            descriptionEn:
                "Desire and illusion hide behind happiness and completion.",
            candidateUids: [
                "15-TheDevil",
                "18-TheMoon",
                "19-TheSun",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },

        // ---------------------------------------------------------------------
        // 試練・成長
        // ---------------------------------------------------------------------

        {
            id: "trial",
            score: 230,
            labelJa: "試練",
            labelEn: "Trial",
            descriptionJa:
                "前進を阻む困難に直面し、忍耐と決断を試されています。",
            descriptionEn:
                "Obstacles test the will to advance and endure.",
            candidateUids: [
                "07-TheChariot",
                "08-Strength",
                "12-TheHangedMan",
                "16-TheTower",
            ],
            minimumCount: 3,
        },
        {
            id: "ordeal",
            score: 250,
            labelJa: "苦難",
            labelEn: "Ordeal",
            descriptionJa:
                "忍耐を強いる停止・終焉・崩壊が訪れます。",
            descriptionEn:
                "Pause, ending, and collapse demand endurance.",
            candidateUids: [
                "08-Strength",
                "12-TheHangedMan",
                "13-Death",
                "16-TheTower",
            ],
            minimumCount: 3,
        },
        {
            id: "endurance",
            score: 230,
            labelJa: "忍耐",
            labelEn: "Endurance",
            descriptionJa:
                "孤独や停止の中でも、自分を保ち続けます。",
            descriptionEn:
                "The self remains steady through solitude and delay.",
            candidateUids: [
                "08-Strength",
                "09-TheHermit",
                "12-TheHangedMan",
                "14-Temperance",
            ],
            minimumCount: 3,
        },
        {
            id: "victory",
            score: 240,
            labelJa: "勝利",
            labelEn: "Victory",
            descriptionJa:
                "勇気と前進が、明るい成功へ結びつきます。",
            descriptionEn:
                "Courage and advance lead to visible success.",
            candidateUids: [
                "07-TheChariot",
                "08-Strength",
                "19-TheSun",
            ],
            minimumCount: 3,
        },
        {
            id: "mastery",
            score: 280,
            labelJa: "熟達",
            labelEn: "Mastery",
            descriptionJa:
                "技術・自制・調整が完全な成果へ結びつきます。",
            descriptionEn:
                "Skill, self-control, and balance produce mastery.",
            candidateUids: [
                "01-TheMagician",
                "08-Strength",
                "14-Temperance",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "breakthrough",
            score: 260,
            labelJa: "突破",
            labelEn: "Breakthrough",
            descriptionJa:
                "意志と前進が壁を壊し、光の中へ進みます。",
            descriptionEn:
                "Will and momentum break through obstacles into clarity.",
            candidateUids: [
                "01-TheMagician",
                "07-TheChariot",
                "16-TheTower",
                "19-TheSun",
            ],
            minimumCount: 3,
        },

        // ---------------------------------------------------------------------
        // 運命・時間
        // ---------------------------------------------------------------------

        {
            id: "destiny",
            score: 280,
            labelJa: "宿命",
            labelEn: "Destiny",
            descriptionJa:
                "運命・因果・審判が、一つの完成へ収束します。",
            descriptionEn:
                "Fate, consequence, and judgment converge into completion.",
            candidateUids: [
                "10-WheelOfFortune",
                "11-Justice",
                "20-Judgement",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "karmicCycle",
            score: 370,
            labelJa: "因果の輪",
            labelEn: "Karmic Cycle",
            descriptionJa:
                "運命と責任、審判と完成が一つの周期を作ります。",
            descriptionEn:
                "Fate, responsibility, judgment, and completion form a cycle.",
            candidateUids: [
                "10-WheelOfFortune",
                "11-Justice",
                "20-Judgement",
                "21-TheWorld",
            ],
            minimumCount: 4,
        },
        {
            id: "return",
            score: 270,
            labelJa: "回帰",
            labelEn: "Return",
            descriptionJa:
                "旅立った者が運命を巡り、新しい自分として戻ります。",
            descriptionEn:
                "The traveler passes through fate and returns transformed.",
            candidateUids: [
                "00-TheFool",
                "10-WheelOfFortune",
                "20-Judgement",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "eternalCycle",
            score: 260,
            labelJa: "永遠の循環",
            labelEn: "Eternal Cycle",
            descriptionJa:
                "終わりと完成が、再び新しい周期を始めます。",
            descriptionEn:
                "Ending and completion begin another cycle.",
            candidateUids: [
                "10-WheelOfFortune",
                "13-Death",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "crossroads",
            score: 220,
            labelJa: "岐路",
            labelEn: "Crossroads",
            descriptionJa:
                "愛・運命・判断が交わる重大な選択です。",
            descriptionEn:
                "Love, fate, and judgment meet at a decisive choice.",
            candidateUids: [
                "06-TheLovers",
                "10-WheelOfFortune",
                "11-Justice",
            ],
            minimumCount: 3,
        },
        {
            id: "turningPoint",
            score: 230,
            labelJa: "転機",
            labelEn: "Turning Point",
            descriptionJa:
                "前進の途中で、避けられない大きな変化が訪れます。",
            descriptionEn:
                "An unavoidable change arrives during forward movement.",
            candidateUids: [
                "07-TheChariot",
                "10-WheelOfFortune",
                "16-TheTower",
            ],
            minimumCount: 3,
        },

        // ---------------------------------------------------------------------
        // 調和・完成
        // ---------------------------------------------------------------------

        {
            id: "harmony",
            score: 250,
            labelJa: "調和",
            labelEn: "Harmony",
            descriptionJa:
                "愛・公正・調整が一つの完成した関係を作ります。",
            descriptionEn:
                "Love, justice, and balance form a complete harmony.",
            candidateUids: [
                "06-TheLovers",
                "11-Justice",
                "14-Temperance",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "balance",
            score: 220,
            labelJa: "均衡",
            labelEn: "Balance",
            descriptionJa:
                "直感・判断・調整が釣り合っています。",
            descriptionEn:
                "Intuition, judgment, and moderation are balanced.",
            candidateUids: [
                "02-TheHighPriestess",
                "11-Justice",
                "14-Temperance",
            ],
            minimumCount: 3,
        },
        {
            id: "integration",
            score: 280,
            labelJa: "統合",
            labelEn: "Integration",
            descriptionJa:
                "異なる力が調整され、新しい全体へ統合されます。",
            descriptionEn:
                "Different forces are balanced and integrated into a whole.",
            candidateUids: [
                "01-TheMagician",
                "14-Temperance",
                "20-Judgement",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "fulfillment",
            score: 280,
            labelJa: "成就",
            labelEn: "Fulfillment",
            descriptionJa:
                "豊かさ・成功・再生が完成へ結びつきます。",
            descriptionEn:
                "Abundance, success, and rebirth lead to fulfillment.",
            candidateUids: [
                "03-TheEmpress",
                "19-TheSun",
                "20-Judgement",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "paradise",
            score: 280,
            labelJa: "楽園",
            labelEn: "Paradise",
            descriptionJa:
                "豊かさ・愛・喜びが満ちた完成した世界です。",
            descriptionEn:
                "Abundance, love, and joy form a complete paradise.",
            candidateUids: [
                "03-TheEmpress",
                "06-TheLovers",
                "19-TheSun",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "blessing",
            score: 270,
            labelJa: "祝福",
            labelEn: "Blessing",
            descriptionJa:
                "豊かさと希望、喜びが未来を祝福します。",
            descriptionEn:
                "Abundance, hope, and joy bless what lies ahead.",
            candidateUids: [
                "03-TheEmpress",
                "17-TheStar",
                "19-TheSun",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "happyEnding",
            score: 290,
            labelJa: "幸福な結末",
            labelEn: "Happy Ending",
            descriptionJa:
                "愛と希望が喜びに結びつき、物語が完成します。",
            descriptionEn:
                "Love and hope become joy as the story reaches completion.",
            candidateUids: [
                "06-TheLovers",
                "17-TheStar",
                "19-TheSun",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "greatCompletion",
            score: 300,
            labelJa: "大完成",
            labelEn: "Great Completion",
            descriptionJa:
                "成功・再生・統合が揃い、一つの大きな物語が完結します。",
            descriptionEn:
                "Success, rebirth, and integration complete a great story.",
            candidateUids: [
                "19-TheSun",
                "20-Judgement",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },

        // ---------------------------------------------------------------------
        // 知識・判断
        // ---------------------------------------------------------------------

        {
            id: "wisdom",
            score: 240,
            labelJa: "叡智",
            labelEn: "Wisdom",
            descriptionJa:
                "直感・教え・探求・判断が深い知恵を作ります。",
            descriptionEn:
                "Intuition, teaching, reflection, and judgment form wisdom.",
            candidateUids: [
                "02-TheHighPriestess",
                "05-TheHierophant",
                "09-TheHermit",
                "11-Justice",
            ],
            minimumCount: 3,
        },
        {
            id: "decision",
            score: 230,
            labelJa: "決断",
            labelEn: "Decision",
            descriptionJa:
                "選択が意志と判断によって、明確な決断になります。",
            descriptionEn:
                "Choice becomes a clear decision through will and judgment.",
            candidateUids: [
                "06-TheLovers",
                "07-TheChariot",
                "11-Justice",
                "20-Judgement",
            ],
            minimumCount: 3,
        },
        {
            id: "truth",
            score: 270,
            labelJa: "真実",
            labelEn: "Truth",
            descriptionJa:
                "隠されたものが明らかになり、正しい判断へ導かれます。",
            descriptionEn:
                "What was hidden becomes clear and leads to right judgment.",
            candidateUids: [
                "02-TheHighPriestess",
                "11-Justice",
                "19-TheSun",
                "20-Judgement",
            ],
            minimumCount: 3,
        },
        {
            id: "hiddenTruth",
            score: 250,
            labelJa: "隠された真実",
            labelEn: "Hidden Truth",
            descriptionJa:
                "孤独な探求によって、幻の奥にある真実が見つかります。",
            descriptionEn:
                "Solitary inquiry discovers the truth hidden behind illusion.",
            candidateUids: [
                "02-TheHighPriestess",
                "09-TheHermit",
                "18-TheMoon",
                "19-TheSun",
            ],
            minimumCount: 3,
        },
        {
            id: "moralChoice",
            score: 250,
            labelJa: "道徳的選択",
            labelEn: "Moral Choice",
            descriptionJa:
                "愛と規範の間で、責任ある判断が求められます。",
            descriptionEn:
                "A responsible judgment is required between love and doctrine.",
            candidateUids: [
                "05-TheHierophant",
                "06-TheLovers",
                "11-Justice",
                "20-Judgement",
            ],
            minimumCount: 3,
        },

        // ---------------------------------------------------------------------
        // 豊かさ・現実
        // ---------------------------------------------------------------------

        {
            id: "abundance",
            score: 260,
            labelJa: "豊穣",
            labelEn: "Abundance",
            descriptionJa:
                "育成・秩序・喜びが豊かな現実を作ります。",
            descriptionEn:
                "Nurture, order, and joy create abundant reality.",
            candidateUids: [
                "03-TheEmpress",
                "04-TheEmperor",
                "19-TheSun",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "prosperity",
            score: 270,
            labelJa: "繁栄",
            labelEn: "Prosperity",
            descriptionJa:
                "豊かさが運命の追い風を受け、成功へ成長します。",
            descriptionEn:
                "Abundance grows into success through favorable fate.",
            candidateUids: [
                "03-TheEmpress",
                "10-WheelOfFortune",
                "19-TheSun",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "empire",
            score: 280,
            labelJa: "帝国",
            labelEn: "Empire",
            descriptionJa:
                "育成・統治・前進が大きな世界を築きます。",
            descriptionEn:
                "Nurture, rule, and advance build a great domain.",
            candidateUids: [
                "03-TheEmpress",
                "04-TheEmperor",
                "07-TheChariot",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "achievement",
            score: 260,
            labelJa: "達成",
            labelEn: "Achievement",
            descriptionJa:
                "技術と行動が成功し、目標へ到達します。",
            descriptionEn:
                "Skill and action lead to success and achievement.",
            candidateUids: [
                "01-TheMagician",
                "07-TheChariot",
                "19-TheSun",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
        {
            id: "legacy",
            score: 280,
            labelJa: "遺産",
            labelEn: "Legacy",
            descriptionJa:
                "権威と教えが受け継がれ、後世に残ります。",
            descriptionEn:
                "Authority and teaching are inherited and preserved.",
            candidateUids: [
                "04-TheEmperor",
                "05-TheHierophant",
                "20-Judgement",
                "21-TheWorld",
            ],
            minimumCount: 3,
        },
    ];

/**
 * 愚者を起点とする5枚以上の連番。
 *
 * 0, 1, 2, 3, 4...
 */
const foolsJourney: TarotHandDefinition = {
    calc(cards) {
        const sortedCards = [...cards].sort(
            (a, b) => a.card.id - b.card.id,
        );

        const foolIndex = sortedCards.findIndex(
            ({ card }) => card.uid === "00-TheFool",
        );

        if (foolIndex < 0) {
            return null;
        }

        const journeyCards: TarotPlayedCard[] = [
            sortedCards[foolIndex],
        ];

        let expectedId = 1;

        for (
            let index = foolIndex + 1;
            index < sortedCards.length;
            index += 1
        ) {
            const playedCard = sortedCards[index];

            if (playedCard.card.id !== expectedId) {
                break;
            }

            journeyCards.push(playedCard);
            expectedId += 1;
        }

        if (journeyCards.length < 5) {
            return null;
        }

        return {
            id: "foolsJourney",
            category: "composite",
            score: 420,
            labelJa: "愚者の旅",
            labelEn: "Fool's Journey",
            descriptionJa:
                "愚者を起点として、大アルカナの物語が連続して展開しています。",
            descriptionEn:
                "Beginning with the Fool, the Major Arcana unfold as a continuous journey.",
            matchedCards: journeyCards,
        };
    },
};

const candidateSpecialHands =
    candidateSpecialHandDefinitions.map(
        createCandidateTarotHand,
    );

export const tarotHandSpecialList:
    readonly TarotHandDefinition[] = [
        ...candidateSpecialHands,
        foolsJourney,
    ];