import "./App.css";
import { useRef, useState } from "react";
import { GameCanvas, GameCanvasHandle } from "./game/GameCanvas";
import type { Lang } from "./game/i18n/messages";
import { SceneKey } from "./game/GameApp";
import { ArrowLeft, Import, ListOrdered, RefreshCw, Save } from "lucide-react";
import { useArcanaDialog, UseArcanaDialogReturn } from "./comps/useArcanaDialog";
import { isTauri } from "./natives/native";
import { isPwaDistributionLocation, PWA_URL } from "./natives/pwa";
import { majorArcanaCards } from "./game/tarot/majorArcana";
import {
  evaluateTarotHand,
  type TarotPlayedCard,
} from "./game/tarot/tarotHand";
import { useDialog } from "./comps/useDialog";
import { useReadHandsDialog } from "./comps/useReadHandsDialog";

type PlayMode = "full-deck" | "five-card" | null;

export default function App() {
  const [language, setLanguage] = useState<Lang>("en");
  const [currentScene, setCurrentScene] = useState<SceneKey>();
  const [playMode, setPlayMode] = useState<PlayMode>(null);
  const [playedCards, setPlayedCards] = useState<TarotPlayedCard[]>([]);
  const gameCanvas = useRef<GameCanvasHandle>(null);
  const arcanaDialog: UseArcanaDialogReturn = useArcanaDialog();
  const readHandsDialog = useReadHandsDialog();
  const dialog = useDialog();
  const isJa = language === "ja";

  const handleShuffleCards = async () => {
    const cards = Object.values(majorArcanaCards);
    const shuffledCards = [...cards];

    for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffledCards[index], shuffledCards[randomIndex]] = [
        shuffledCards[randomIndex],
        shuffledCards[index],
      ];
    }

    const nextPlayedCards: TarotPlayedCard[] = shuffledCards
      .slice(0, 5)
      .map((card) => ({
        card,
        reversed: false,
      }));

    setPlayedCards(nextPlayedCards);
    await gameCanvas.current?.setCurrentCards(
      nextPlayedCards.map(({ card }) => `${card.id}`),
    );
  };

  const handleReadHands = async () => {
    if (playedCards.length !== 5) {
      return;
    }

    await readHandsDialog.showReadHandsDialog(
      evaluateTarotHand(playedCards),
      language,
    );
  };

  const handleShuffleFullDeck = async () => {
    setPlayMode("full-deck");
    setPlayedCards([]);
    setCurrentScene("play");
    await gameCanvas.current?.shuffleCards();
  };

  const handleDealFiveCardHand = async () => {
    setPlayMode("five-card");
    setCurrentScene("play");
    await handleShuffleCards();
  };

  const handleBackToTitle = () => {
    setPlayMode(null);
    setPlayedCards([]);
    setCurrentScene("title");
  };

  const mapStoredCardsToPlayedCards = (cards: string[]) => {
    return cards
      .map((value): TarotPlayedCard | null => {
        const trimmed = value.trim();
        const numericId = Number.parseInt(trimmed.replace("r", ""), 10);
        const card = Object.values(majorArcanaCards).find(
          (candidate) => candidate.id === numericId,
        );

        if (!card) {
          return null;
        }

        return {
          card,
          reversed: false,
        };
      })
      .filter((card): card is TarotPlayedCard => card !== null);
  };

  const handleExportCards = async () => {
    const cards = await gameCanvas.current?.getCurrentCards();
    if (!cards) return;

    const jsonString = JSON.stringify(cards, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tetorica-tarot-cards-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportCards = async () => {
    const fileSet = await dialog.showFileDialog({
      title: "Import Cards JSON",
      accept: ".json",
    });
    if (!fileSet || fileSet.files.length === 0) return;

    const file = fileSet.files[0];
    const text = await file.text();

    try {
      const cards = JSON.parse(text) as string[];
      await gameCanvas.current?.setCurrentCards(cards);

      if (cards.length === 5) {
        setPlayMode("five-card");
        setPlayedCards(mapStoredCardsToPlayedCards(cards));
      } else {
        setPlayMode("full-deck");
        setPlayedCards([]);
      }

      setCurrentScene("play");
    } catch (error) {
      console.error("Failed to parse JSON", error);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white">
      <GameCanvas
        ref={gameCanvas}
        language={language}
        currentScene={currentScene}
        setCurrentScene={setCurrentScene}
        arcanaDialog={arcanaDialog}
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="flex items-start justify-end p-4">
          <div className="pointer-events-auto flex gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur">
            <button
              className={`rounded-xl px-3 py-2 text-sm ${language === "ja"
                ? "bg-blue-500 text-white"
                : "bg-white/10 text-slate-200 hover:bg-white/20"
                }`}
              onClick={() => setLanguage("ja")}
            >
              日本語
            </button>
            <button
              className={`rounded-xl px-3 py-2 text-sm ${language === "en"
                ? "bg-blue-500 text-white"
                : "bg-white/10 text-slate-200 hover:bg-white/20"
                }`}
              onClick={() => setLanguage("en")}
            >
              English
            </button>
          </div>
        </div>

        <div className="absolute top-1 left-0 flex items-start justify-start p-4">
          <div className="pointer-events-auto flex gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur">
            <button
              className={`rounded-xl px-3 py-2 text-sm bg-white/10 text-slate-200 hover:bg-white/20 ${currentScene === "title" ? "hidden" : ""
                }`}
              onClick={handleBackToTitle}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        {currentScene === "title" && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 p-4">
            <div className="pointer-events-auto flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur">
              <button
                className="rounded-xl px-5 py-3 text-sm bg-white/10 text-slate-200 hover:bg-white/20"
                onClick={() => {
                  void handleShuffleFullDeck();
                }}
              >
                {isJa ? "全体をシャッフル" : "Shuffle Full Deck"}
              </button>
              <button
                className="rounded-xl px-5 py-3 text-sm bg-white/10 text-slate-200 hover:bg-white/20"
                onClick={() => {
                  void handleDealFiveCardHand();
                }}
              >
                {isJa ? "5枚の手札を配る" : "Deal 5-Card Hand"}
              </button>
            </div>
          </div>
        )}

        {currentScene === "play" && playMode === "full-deck" && (
          <div className="absolute right-0 bottom-0 p-4">
            <div className="pointer-events-auto flex gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur">
              <button
                className="rounded-xl px-3 py-2 text-sm bg-white/10 text-slate-200 hover:bg-white/20"
                onClick={() => {
                  gameCanvas.current?.orderCards();
                }}
              >
                <ListOrdered className="h-5 w-5" />
              </button>
              <button
                className="rounded-xl px-3 py-2 text-sm bg-white/10 text-slate-200 hover:bg-white/20"
                onClick={() => {
                  gameCanvas.current?.shuffleCards();
                }}
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {
          //
          //
          //
        }
        <div className="absolute left-0 bottom-0 p-4 flex flex-row">
          {currentScene === "title" && (<>
            {!isTauri() && !isPwaDistributionLocation() && currentScene === "title" && (
              <div className="pointer-events-auto flex flex-row gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur">
                <button
                  className="rounded-xl px-3 py-2 text-sm bg-white/10 text-slate-200 hover:bg-white/20"
                  onClick={() => {
                    window.open(PWA_URL, "_blank", "noopener,noreferrer");
                  }}
                >
                  <div className="h-5 w-auto">Open PWA PAGE</div>
                </button>
              </div>
            )}
          </>)}
          {currentScene === "play" && (playMode === "full-deck" || playMode === "five-card") && (
            <>
              <div className="pointer-events-auto ml-4 flex gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur">
                <button
                  className="rounded-xl px-3 py-2 text-sm bg-white/10 text-slate-200 hover:bg-white/20"
                  onClick={() => {
                    void handleExportCards();
                  }}
                >
                  <Save className="h-5 w-5" />
                </button>
              </div>
              <div className="pointer-events-auto ml-2 flex gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur">
                <button
                  className="rounded-xl px-3 py-2 text-sm bg-white/10 text-slate-200 hover:bg-white/20"
                  onClick={() => {
                    void handleImportCards();
                  }}
                >
                  <Import className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
        {currentScene === "play" && playMode === "five-card" && (
          <div className="absolute right-0 bottom-0 p-4">
            <div className="pointer-events-auto flex gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur">
              <button
                className={`rounded-xl px-3 py-2 text-sm ${
                  playedCards.length !== 5
                    ? "cursor-not-allowed bg-white/5 text-slate-500"
                    : "bg-white/10 text-slate-200 hover:bg-white/20"
                }`}
                onClick={() => {
                  void handleReadHands();
                }}
                disabled={playedCards.length !== 5}
              >
                Read Hands
              </button>
              <button
                className="rounded-xl px-3 py-2 text-sm bg-white/10 text-slate-200 hover:bg-white/20"
                onClick={() => {
                  void handleShuffleCards();
                }}
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
