import "./App.css";
import { useState } from "react";
import { GameCanvas } from "./game/GameCanvas";
import type { Lang } from "./game/i18n/messages";

export default function App() {
  const [language, setLanguage] = useState<Lang>("ja");

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white">
      <GameCanvas language={language} />

      <div className="pointer-events-none absolute inset-0">
        <div className="flex items-start justify-between p-4">

          <div className="pointer-events-auto flex gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur">
            <button
              className={`rounded-xl px-3 py-2 text-sm ${
                language === "ja"
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-slate-200 hover:bg-white/20"
              }`}
              onClick={() => setLanguage("ja")}
            >
              日本語
            </button>
            <button
              className={`rounded-xl px-3 py-2 text-sm ${
                language === "en"
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-slate-200 hover:bg-white/20"
              }`}
              onClick={() => setLanguage("en")}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}