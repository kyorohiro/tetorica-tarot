import React from "react";
import { useDialog } from "./useDialog";
import { cssColorFromElement, getTagFromElements, majorArcanaCards } from "../game/tarot/majorArcana";
import { majorArcanaSpecialRelations } from "../game/tarot/majorArcana";
import { Lang } from "../game/i18n/messages";
import { LoadingImage } from "./LoadingImageProps";

type MajorArcanaKey = keyof typeof majorArcanaCards;

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
                            <LoadingImage src={`./assets/${card.uid}.jpg`} />
                        </div>
                        <section>
                            <h3 className="mb-2 text-sm font-semibold text-slate-200">
                                {isJa ? "属性" : "Elements"}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {card.elements.map((keyword) => (
                                    <span
                                        key={`el-${lang}-${keyword.type}`}
                                        className="rounded-full border border-emerald-700 bg-emerald-950/40 px-2.5 py-1 text-xs text-emerald-200"
                                        style={{
                                            color: cssColorFromElement(keyword.type),
                                            borderColor: cssColorFromElement(keyword.type),
                                        }}
                                    >
                                        {keyword.type}
                                    </span>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {
                                    getTagFromElements(card.elements.map((v) => v.type), lang).map((keyword) => (
                                        <span
                                            key={`eltag-${lang}-${keyword}`}
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
                                                        <LoadingImage src={`./assets/${toCard.uid}.jpg`} />
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