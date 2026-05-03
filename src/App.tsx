import "./App.css";
import { useRef, useState } from "react";
import { GameCanvas, GameCanvasHandle } from "./game/GameCanvas";
import type { Lang } from "./game/i18n/messages";
import { SceneKey } from "./game/GameApp";
import { ArrowLeft, RefreshCw, ListOrdered, Import, Save } from "lucide-react";
import { useArcanaDialog, UseArcanaDialogReturn } from "./comps/useArcanaDialog";
import { isTauri } from "./natives/native";
import { isPwaDistributionLocation, PWA_URL } from "./natives/pwa";
import { useDialog } from "./comps/useDialog";

export default function App() {
  const [language, setLanguage] = useState<Lang>("en");
  const [currentScene, setCurrentScene] = useState<SceneKey>();
  const gameCanvas = useRef<GameCanvasHandle>(null);
  const arcanaDialog: UseArcanaDialogReturn = useArcanaDialog();
  const dialog = useDialog();

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
          {currentScene === "play" && (<>
            {
              //
            }
            <div className="pointer-events-auto flex gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur">
              <button
                className="rounded-xl px-3 py-2 text-sm bg-white/10 text-slate-200 hover:bg-white/20"
                onClick={async () => {
                  const cards = await gameCanvas.current?.getCurrentCards();
                  if (!cards) return;

                  // JSON文字列に変換
                  const jsonString = JSON.stringify(cards, null, 2);
                  // Blobオブジェクトを作成 (MIMEタイプを指定)
                  const blob = new Blob([jsonString], { type: "application/json" });
                  // ダウンロード用のURLを作成
                  const url = URL.createObjectURL(blob);

                  // 一時的なリンク要素を作成してクリック
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `tetorica-tarot-cards-${new Date().toISOString()}.json`; // 保存時のファイル名
                  document.body.appendChild(link); // iOS Safari等で必要な場合があるため追加
                  link.click();

                  // 後片付け
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
              >
                <Save className="h-5 w-5" />
              </button>
            </div>
            <div className="pointer-events-auto flex gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur">
              <button
                className="rounded-xl px-3 py-2 text-sm bg-white/10 text-slate-200 hover:bg-white/20"
                onClick={async () => {
                  //
                  //
                  const fileSet = await dialog.showFileDialog({
                    title: "Import Cards JSON",
                    accept: ".json",
                    //
                  });
                  if(!fileSet  ||  fileSet.files.length === 0) return;
                  const file = fileSet.files[0];
                  const text = await file.text();
                  try {
                    const cards = JSON.parse(text) as string[];
                    await gameCanvas.current?.setCurrentCards(cards);
                  } catch(e) {
                    console.error("Failed to parse JSON", e);
                  }

                }}>
                    <Import className="h-5 w-5" />
              </button>
          </div>
        </>)}


      </div>
    </div>
    </div >
  );
}