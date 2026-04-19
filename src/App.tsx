import "./App.css";
import { useRef, useState } from "react";
import { GameCanvas, GameCanvasHandle } from "./game/GameCanvas";
import type { Lang } from "./game/i18n/messages";
import { SceneKey } from "./game/GameApp";
import { ArrowLeft, RefreshCw, ListOrdered } from "lucide-react";
import { useArcanaDialog, UseArcanaDialogReturn } from "./comps/useArcanaDialog";
import { isTauri } from "./natives/native";
import { isPwaDistributionLocation, PWA_URL } from "./natives/pwa";

export default function App() {
  const [language, setLanguage] = useState<Lang>("en");
  const [currentScene, setCurrentScene] = useState<SceneKey>();
  const gameCanvas = useRef<GameCanvasHandle>(null);
  const arcanaDialog: UseArcanaDialogReturn = useArcanaDialog();

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
              onClick={() => setCurrentScene("title")}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        {currentScene === "play" && (
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

        {currentScene === "play" && (
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
        {!isTauri() && !isPwaDistributionLocation() && currentScene === "title" && (
          <div className="absolute left-0 bottom-0 p-4">
            <div className="pointer-events-auto flex gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur">
              <button
                className="rounded-xl px-3 py-2 text-sm bg-white/10 text-slate-200 hover:bg-white/20"
                onClick={() => {
                  window.open(PWA_URL, "_blank", "noopener,noreferrer");
                }}
              >
                <div className="h-5 w-auto">Open PWA PAGE</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}