import React from "react";
import { useDialog } from "./useDialog";
import {
    cssColorFromElement,
    elementLabelEn,
    elementLabelJa,
    getTagFromElements,
    majorArcanaCards,
    TarotElement,
    TarotElementItem,
} from "../game/tarot/majorArcana";
import { majorArcanaSpecialRelations } from "../game/tarot/majorArcana";
import { Lang } from "../game/i18n/messages";
import { LoadingImage } from "./LoadingImageProps";
import { assetUrl } from "../lib/assetUrl";

type MajorArcanaKey = keyof typeof majorArcanaCards;
const radarElements: TarotElement[] = ["fire", "air", "earth", "water"];

function relationTypeLabelJa(type: string) {
    switch (type) {
        case "complements":
            return "補完";
        case "tension":
            return "緊張";
        case "similarTheme":
            return "類似";
        default:
            return type;
    }
}

function relationTypeLabelEn(type: string) {
    switch (type) {
        case "complements":
            return "Complements";
        case "tension":
            return "Tension";
        case "similarTheme":
            return "Similar Theme";
        default:
            return type;
    }
}

function elementLabel(element: TarotElement, lang: Lang) {
    return lang === "ja" ? elementLabelJa(element) : elementLabelEn(element);
}

function getElementWeight(elements: TarotElementItem[], target: TarotElement) {
    return elements.find((item) => item.type === target)?.weight ?? 0;
}

function radarPoint(cx: number, cy: number, radius: number, weight: number, element: TarotElement) {
    const distance = radius * Math.max(0, Math.min(weight, 1));

    switch (element) {
        case "fire":
            return `${cx},${cy - distance}`;
        case "air":
            return `${cx + distance},${cy}`;
        case "earth":
            return `${cx},${cy + distance}`;
        case "water":
            return `${cx - distance},${cy}`;
        default:
            return `${cx},${cy}`;
    }
}

function ArcanaElementRadar({ elements, lang, isSpecial }: { elements: TarotElementItem[]; lang: Lang; isSpecial: boolean }) {
    const size = 168;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 54;
    const levels = [0.25, 0.5, 0.75, 1];
    const polygonPoints = radarElements
        .map((element) => radarPoint(cx, cy, radius, getElementWeight(elements, element), element))
        .join(" ");

    return (
        <div className="relative mx-auto w-[168px] shrink-0">
            <svg viewBox={`0 0 ${size} ${size}`} className="h-[168px] w-[168px] overflow-visible">
                {levels.map((level) => {
                    const points = radarElements
                        .map((element) => radarPoint(cx, cy, radius, level, element))
                        .join(" ");
                    return (
                        <polygon
                            key={level}
                            points={points}
                            fill="none"
                            stroke="rgba(148, 163, 184, 0.22)"
                            strokeWidth="1"
                        />
                    );
                })}

                {radarElements.map((element) => {
                    const end = radarPoint(cx, cy, radius, 1, element).split(",").map(Number);
                    return (
                        <line
                            key={element}
                            x1={cx}
                            y1={cy}
                            x2={end[0]}
                            y2={end[1]}
                            stroke="rgba(148, 163, 184, 0.28)"
                            strokeWidth="1"
                        />
                    );
                })}

                {isSpecial ? (
                    <circle
                        cx={cx}
                        cy={cy}
                        r="15"
                        fill="rgba(255, 215, 0, 0.12)"
                        stroke="#ffd700"
                        strokeWidth="1.5"
                    />
                ) : null}

                <polygon
                    points={polygonPoints}
                    fill="rgba(148, 163, 184, 0.12)"
                    stroke={isSpecial ? "#ffd700" : "#e2e8f0"}
                    strokeWidth="2"
                />

                {radarElements.map((element) => {
                    const end = radarPoint(cx, cy, radius + 12, 1, element).split(",").map(Number);
                    return (
                        <circle
                            key={`${element}-node`}
                            cx={end[0]}
                            cy={end[1]}
                            r="3"
                            fill={cssColorFromElement(element)}
                        />
                    );
                })}
            </svg>

            <div className="pointer-events-none absolute inset-0 text-[10px] font-medium tracking-[0.18em] text-slate-300">
                <div className="absolute left-1/2 top-1 -translate-x-1/2">{elementLabel("fire", lang)}</div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2">{elementLabel("air", lang)}</div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2">{elementLabel("earth", lang)}</div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2">{elementLabel("water", lang)}</div>
                {isSpecial ? (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] text-amber-300">
                        {lang === "ja" ? "特別" : "Special"}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export function useArcanaDialog() {
    const { showDialog } = useDialog();

    const showArcanaDialog = React.useCallback(
        async (cardId: MajorArcanaKey, lang: Lang) => {
            const isJa = lang === "ja";
            const safeCardId = cardId as MajorArcanaKey;
            const card = majorArcanaCards[safeCardId];

            if (!card) {
                console.warn("Unknown arcana card id:", cardId);
                return null;
            }

            const relations = majorArcanaSpecialRelations[safeCardId] ?? [];

            return await showDialog<void>(({ close }) => (
                <div className={"w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-xl"}>
                    <div className="relative border-b border-slate-700 px-5 py-4" >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-xs text-slate-400">
                                    {String(card.id).padStart(2, "0")} / {card.element}
                                </div>
                                <h2 className="text-xl font-semibold">{isJa ? card.titleJa : card.titleEn}</h2>
                            </div>
                            <button
                                type="button"
                                onClick={close}
                                style={{ backgroundColor: `${cssColorFromElement(card.element)}`, color: "#666666" }}
                                className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
                            >
                                {isJa ? "閉じる" : "Close"}
                            </button>
                        </div>
                    </div>

                    <div className="relative space-y-5 px-5 py-4 max-h-[80vh] overflow-y-auto overflow-x-hidden">
                        <div className="absolute top-0 h-2 w-[70%]" style={{ backgroundColor: `${cssColorFromElement(card.element)}` }} ></div>

                        <div style={{ width: 300 / 5, height: 527 / 5 }}>
                            <LoadingImage src={assetUrl(`assets/${card.uid}.jpg`)} />
                        </div>
                        <section>
                            <h3 className="mb-2 text-sm font-semibold text-slate-200">
                                {isJa ? "属性" : "Elements"}
                            </h3>
                            <div className="rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                                    <ArcanaElementRadar
                                        elements={card.elements}
                                        lang={lang}
                                        isSpecial={card.element === "special"}
                                    />
                                    <div className="flex-1 space-y-3">
                                        {card.elements.map((keyword) => (
                                            <div key={`meter-${lang}-${keyword.type}`} className="space-y-1">
                                                <div className="flex items-center justify-between gap-3 text-xs">
                                                    <span
                                                        className="font-medium tracking-[0.18em]"
                                                        style={{ color: cssColorFromElement(keyword.type) }}
                                                    >
                                                        {elementLabel(keyword.type, lang)}
                                                    </span>
                                                    <span className="text-slate-400">{Math.round(keyword.weight * 100)}%</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${Math.max(8, Math.min(keyword.weight * 100, 100))}%`,
                                                            backgroundColor: cssColorFromElement(keyword.type),
                                                            opacity: 0.88,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {card.element === "special" ? (
                                            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                                                {isJa ? "特別属性: 4元素を横断するカード" : "Special: a card that bridges all four elements"}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {card.elements.map((keyword) => (
                                    <span
                                        key={`el-${lang}-${keyword.type}`}
                                        className="rounded-full border border-emerald-700 bg-emerald-950/40 px-2.5 py-1 text-xs text-emerald-200"
                                        style={{
                                            color: cssColorFromElement(keyword.type),
                                            borderColor: cssColorFromElement(keyword.type),
                                            opacity: Math.max(0.45, keyword.weight),
                                        }}
                                    >
                                        {elementLabel(keyword.type, lang)}
                                    </span>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {
                                    getTagFromElements(card.elements.map((v) => v.type), lang).map((keyword) => (
                                        <span
                                            key={`eltag-${lang}-${keyword.keyword}`}
                                            className="rounded-full border border-gray-100 border-0.5 px-0.5 py-0.5 my-1 text-xs text-mist-200"
                                            style={{
                                                color: cssColorFromElement(keyword.element),
                                                borderColor: cssColorFromElement(keyword.element),
                                            }}
                                        >
                                            {keyword.keyword}
                                        </span>
                                    ))
                                }
                            </div>
                        </section>
                        <section>
                            <h3 className="mb-2 text-sm font-semibold text-slate-200">
                                {isJa ? "正位置" : "Upright"}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(isJa ? card.upright.keywordsJa : card.upright.keywordsEn).map((keyword) => (
                                    <span
                                        key={`up-${lang}-${keyword}`}
                                        className="rounded-full border border-emerald-700 bg-emerald-950/40 px-2.5 py-1 text-xs text-emerald-200"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="mb-2 text-sm font-semibold text-slate-200">
                                {isJa ? "逆位置" : "Reversed"}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(isJa ? card.reversed.keywordsJa : card.reversed.keywordsEn).map((keyword) => (
                                    <span
                                        key={`rev-${lang}-${keyword}`}
                                        className="rounded-full border border-rose-700 bg-rose-950/40 px-2.5 py-1 text-xs text-rose-200"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>

                        </section>

                        <section>
                            <h3 className="mb-3 text-sm font-semibold text-slate-200">
                                {isJa ? "関係性" : "Relations"}
                            </h3>

                            {relations.length === 0 ? (
                                <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-400">
                                    {isJa ? "関係性データはまだありません" : "No relation data yet"}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {relations.map((rel) => {
                                        const toCard = majorArcanaCards[rel.to];
                                        return (
                                            <div
                                                key={`${safeCardId}-${rel.to}-${rel.type}`}
                                                className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 cursor-pointer overflow-hidden"
                                                onClick={() => {
                                                    showArcanaDialog(toCard.uid, lang);
                                                }}
                                            >
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <div
                                                        className="shrink-0"
                                                        style={{ width: 300 / 10, height: 527 / 10 }}
                                                    >
                                                        <LoadingImage src={assetUrl(`assets/${toCard.uid}.jpg`)} />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="text-sm font-medium text-slate-100 break-words">
                                                                {isJa ? toCard.titleJa : toCard.titleEn}
                                                            </div>

                                                            <div className="shrink-0 text-right text-xs text-amber-300">
                                                                {isJa ? relationTypeLabelJa(rel.type) : relationTypeLabelEn(rel.type)}
                                                            </div>
                                                        </div>

                                                        <div className="mt-2 text-sm text-slate-200 break-words">
                                                            {isJa ? rel.labelJa : rel.labelEn}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            ));
        },
        [showDialog]
    );

    return {
        showArcanaDialog,
    };
}


export type UseArcanaDialogReturn = ReturnType<typeof useArcanaDialog>;
