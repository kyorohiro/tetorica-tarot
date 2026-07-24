import React from "react";
import { useDialog } from "./useDialog";
import type { Lang } from "../game/i18n/messages";
import type { TarotHandEvaluation } from "../game/tarot/tarotHand";

function HandResultDialog({
    evaluation,
    lang,
    onClose,
}: {
    evaluation: TarotHandEvaluation;
    lang: Lang;
    onClose: () => void;
}) {
    const isJa = lang === "ja";

    return (
        <div className="flex w-[min(96vw,960px)] max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-xl">
            <div className="border-b border-slate-700 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            {isJa ? "役の判定結果" : "Hand Results"}
                        </h2>
                        <div className="mt-1 text-sm text-slate-300">
                            {isJa ? "合計スコア" : "Total Score"}: {evaluation.score}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
                    >
                        {isJa ? "閉じる" : "Close"}
                    </button>
                </div>
            </div>

            <div className="space-y-4 overflow-y-auto px-5 py-4">
                {evaluation.hands.length === 0 ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-300">
                        {isJa ? "成立した役はありません。" : "No hands were found."}
                    </div>
                ) : (
                    evaluation.hands.map((hand) => (
                        <section
                            key={`${hand.id}-${hand.score}-${hand.matchedCards.map(({ card }) => card.uid).join("-")}`}
                            className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="text-base font-semibold text-slate-100">
                                    {isJa ? hand.labelJa : hand.labelEn}
                                </h3>
                                <div className="shrink-0 text-xs text-amber-300">
                                    score: {hand.score}
                                </div>
                            </div>

                            <p className="mt-2 text-sm text-slate-300">
                                {isJa ? hand.descriptionJa : hand.descriptionEn}
                            </p>

                            <div className="mt-3">
                                <div className="mb-2 text-xs font-medium tracking-[0.18em] text-slate-400">
                                    {isJa ? "使用カード" : "Cards Used"}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {hand.matchedCards.map(({ card }) => (
                                        <span
                                            key={`${hand.id}-${card.uid}`}
                                            className="rounded-full border border-slate-600 bg-slate-900/70 px-2.5 py-1 text-xs text-slate-200"
                                        >
                                            {isJa ? card.titleJa : card.titleEn}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
}

export function useReadHandsDialog() {
    const { showDialog } = useDialog();

    const showReadHandsDialog = React.useCallback(
        async (evaluation: TarotHandEvaluation, lang: Lang) => {
            return await showDialog<void>(({ close }) => (
                <HandResultDialog evaluation={evaluation} lang={lang} onClose={close} />
            ));
        },
        [showDialog],
    );

    return {
        showReadHandsDialog,
    };
}

export type UseReadHandsDialogReturn = ReturnType<typeof useReadHandsDialog>;
