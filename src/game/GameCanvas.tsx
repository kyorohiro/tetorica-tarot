import { useEffect, useRef } from "react";
import { GameApp } from "./GameApp";
import type { Lang } from "./i18n/messages";

type Props = {
  language: Lang;
};

export function GameCanvas({ language }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<GameApp | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    const game = new GameApp(host, language);
    gameRef.current = game;

    void game.init().then(() => {
      if (disposed) {
        game.destroy();
      }
    });

    return () => {
      disposed = true;
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    gameRef.current?.setLanguage(language);
  }, [language]);

  return <div ref={hostRef} className="h-full w-full" />;
}