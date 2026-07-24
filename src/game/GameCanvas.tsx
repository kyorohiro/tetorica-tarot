import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { GameApp, SceneKey } from "./GameApp";
import type { Lang } from "./i18n/messages";
import { UseArcanaDialogReturn } from "../comps/useArcanaDialog";

type Props = {
  language: Lang;
  currentScene?: SceneKey;
  setCurrentScene: (v: SceneKey) => void;
  arcanaDialog: UseArcanaDialogReturn;
};

export type GameCanvasHandle = {
  orderCards: () => Promise<void>
  shuffleCards: () => Promise<void>
  getCurrentCards: () => Promise<string[]>
  setCurrentCards: (cards: string[]) => Promise<void>
}

export const GameCanvas = forwardRef<GameCanvasHandle, Props>(function ({ language, currentScene, setCurrentScene, arcanaDialog }: Props, ref) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<GameApp | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    const game = new GameApp(host, language, currentScene, (v) => {
      console.log("> onChangeCurrentScene v:", v)
      setCurrentScene(v)
    }, arcanaDialog);
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
    console.log("> useEffect language", language, currentScene);
    gameRef.current?.setLanguage(language);
  }, [language]);

  useEffect(() => {
    console.log("> useEffect currentScene", currentScene);
    if (currentScene == "title") {
      gameRef.current?.showTitleScene({
        forceUpdate: false
      });
    } else if (currentScene == "play") {
      gameRef.current?.showPlayScene({ forceUpdate: false });
    }
  }, [currentScene]);

  //
  useImperativeHandle(
    ref,
    () => ({
      orderCards: async () => {
        if (gameRef.current) {
          gameRef.current.showPlayScene({
            forceUpdate: true,
            isShuffleCards: false,
          });
        }
      },
      shuffleCards: async () => {
        if (gameRef.current) {
          gameRef.current.showPlayScene({
            forceUpdate: true,
            isShuffleCards: true,
          });
        }
      },
      getCurrentCards: async () => {
        if (gameRef.current) {
          return gameRef.current.getCurrentCards();
        } else {
          return [];
        }
      },
      setCurrentCards: async (cards: string[]) => {
        if (gameRef.current) {
          gameRef.current.showPlayScene({
            forceUpdate: true,
            isShuffleCards: false,
            cards: cards
          });
        }
      }
    }),
    []
  );
  return <div ref={hostRef} className="h-full w-full" />;
});
