import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { GameApp, SceneKey } from "./GameApp";
import type { Lang } from "./i18n/messages";

type Props = {
  language: Lang;
  currentScene?: SceneKey;
  setCurrentScene: (v: SceneKey) => void;
};

export type GameCanvasHandle = {
  orderCards: ()=>Promise<void>
  shuffleCards: ()=>Promise<void>
}

export const GameCanvas = forwardRef<GameCanvasHandle, Props>(function ({ language, currentScene, setCurrentScene }: Props, ref) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<GameApp | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    const game = new GameApp(host, language, currentScene, setCurrentScene);
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
    console.log("> useEffect language", language);
    gameRef.current?.setLanguage(language);
  }, [language]);

  useEffect(() => {
    console.log("> useEffect currentScene", currentScene);
    if (currentScene == "title") {
      gameRef.current?.showTitleScene();
    } else if (currentScene == "play") {
      gameRef.current?.showPlayScene({forceUpdate:true, isShuffleCards: true});
    }
  }, [currentScene]);

  //
  useImperativeHandle(
    ref,
    () => ({
      orderCards: async () =>{
        if(gameRef.current) {
          gameRef.current.showPlayScene({
            forceUpdate: true,
            isShuffleCards: false,
          });
        }
      },
      shuffleCards: async () =>{
        if(gameRef.current) {
          gameRef.current.showPlayScene({
            forceUpdate: true,
            isShuffleCards: true,
          });
        }
      },
    }),
    []
  );
  return <div ref={hostRef} className="h-full w-full" />;
});