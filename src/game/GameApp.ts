import { Application } from "pixi.js";
//import { sound } from "@pixi/sound";
import { SceneManager } from "./core/SceneManager";
import { TitleScene } from "./scenes/TitleScene";
import { PlayScene } from "./scenes/PlayScene";
import { t, type Lang, type MessageKey } from "./i18n/messages";
import { UseArcanaDialogReturn } from "../comps/useArcanaDialog";

export type SceneKey = "title" | "play";

export class GameApp {
  private readonly app = new Application();

  private sceneManager: SceneManager | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private currentScene: SceneKey|undefined;
  private language: Lang;

  private initialized = false;
  private destroyed = false;
  private destroyRequested = false;
  private playScene: PlayScene | undefined;
  private setCurrentScene: (v: SceneKey) => void;
  private arcanaDialog: UseArcanaDialogReturn;

  constructor(
    private readonly root: HTMLElement,
    language: Lang,
    currentScene: SceneKey| undefined,
    setCurrentScene: (v: SceneKey) => void,
    arcanaDialog: UseArcanaDialogReturn,
  ) {
    this.language = language;
    this.currentScene = currentScene;
    this.setCurrentScene = setCurrentScene;
    this.arcanaDialog = arcanaDialog;
  }

  async init() {
    if (this.destroyed || this.destroyRequested) return;
    if (this.initialized) return;

    await this.app.init({
      background: "#020617",
      antialias: true,
      resizeTo: this.root,
    });

    if (this.destroyRequested || this.destroyed) {
      this.safeDestroyPixi();
      return;
    }

    this.initialized = true;
    this.root.appendChild(this.app.canvas);
    this.sceneManager = new SceneManager(this.app, this.app.stage);

    this.setupResize();
    //this.setupSound();

    this.showTitleScene();
  }

  private setupResize() {
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.initialized || this.destroyed) return;
      this.sceneManager?.resize(this.app.screen.width, this.app.screen.height);
    });
    this.resizeObserver.observe(this.root);
  }

  //private setupSound() {
  //  try {
  //    if (!sound.exists("click")) {
  //      sound.add("click", "/sounds/click.mp3");
  //    }
  //  } catch (error) {
  //    console.warn("optional sound load failed", error);
  //  }
  //}

  t(key: MessageKey) {
    return t(this.language, key);
  }

  getLanguage(): Lang {
    return this.language;
  }

  setLanguage(language: Lang) {
    this.language = language;
    if (!this.initialized || this.destroyed) return;

    if (this.currentScene === "title") {
      this.showTitleScene();
    } else {
      this.showPlayScene({
        
      });
    }
  }

  async showArcanaDialog(cardId:string)  {
    await this.arcanaDialog.showArcanaDialog(cardId, this.language)
  }

  showTitleScene() {
    console.log("> showTitleScene", this.currentScene )
    if (!this.initialized || this.destroyed || !this.sceneManager) return;

    //this.currentScene = "title";
    if (this.currentScene != "title") {
      this.setCurrentScene("title");
      this.sceneManager.change(
        new TitleScene(this),
        this.app.screen.width,
        this.app.screen.height,
      );
    }
  }

  showPlayScene(props:{
    forceUpdate?:boolean|undefined
    isShuffleCards?: boolean | undefined
  }) {
    if (!this.initialized || this.destroyed || !this.sceneManager) return;

    if (props.forceUpdate || this.currentScene != "play") {
      //this.currentScene = "play";
      this.setCurrentScene("play");
      if (props.forceUpdate || !this.playScene) {
        this.playScene = new PlayScene({game:this, isShuffleCards: props.isShuffleCards ?? false})
      }
      this.sceneManager.change(
        this.playScene,
        this.app.screen.width,
        this.app.screen.height,
      );
    }
  }

  //playClick() {
  //  try {
  //    sound.play("click", { volume: 0.15 });
  //  } catch {
  //    //
  //  }
  //}

  destroy() {
    if (this.destroyed) return;

    this.destroyRequested = true;

    if (!this.initialized) {
      return;
    }

    this.safeDestroyPixi();
  }

  private safeDestroyPixi() {
    if (this.destroyed) return;
    this.destroyed = true;

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    this.sceneManager?.destroy();
    this.sceneManager = null;

    try {
      this.app.canvas.remove();
    } catch {
      //
    }

    try {
      this.app.destroy(true);
    } catch {
      //
    }
  }
}