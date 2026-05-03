import { Application } from "pixi.js";
//import { sound } from "@pixi/sound";
import { SceneManager } from "./core/SceneManager";
import { TitleScene } from "./scenes/TitleScene";
import { PlayScene } from "./scenes/PlayScene";
import { type Lang, type MessageKey, t } from "./i18n/messages";
import { UseArcanaDialogReturn } from "../comps/useArcanaDialog";

export type SceneKey = "title" | "play";

export class GameApp {
  private readonly app = new Application();
  public getApp() {
    return this.app;
  }

  private sceneManager: SceneManager | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private currentScene: SceneKey | undefined;
  private language: Lang;

  private initialized = false;
  private destroyed = false;
  private destroyRequested = false;
  private playScene: PlayScene | undefined;
  private onChangeCurrentScene: (v: SceneKey) => void;
  private arcanaDialog: UseArcanaDialogReturn;

  constructor(
    private readonly root: HTMLElement,
    language: Lang,
    currentScene: SceneKey | undefined,
    onChangeCurrentScene: (v: SceneKey) => void,
    arcanaDialog: UseArcanaDialogReturn,
  ) {
    this.language = language;
    this.currentScene = currentScene;
    this.onChangeCurrentScene = onChangeCurrentScene;
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

    this.showTitleScene({ forceUpdate: false });
  }

  private setupResize() {
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.initialized || this.destroyed) return;
      this.sceneManager?.resize(this.app.screen.width, this.app.screen.height);
    });
    this.resizeObserver.observe(this.root);
  }

  public setCurrentScene(v: SceneKey) {
    console.log("> setCurrentScene");
    this.currentScene = v;
    this.onChangeCurrentScene(v);
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
    console.log("> setLanguage", language);
    this.language = language;
    if (!this.initialized || this.destroyed) return;

    if (this.currentScene === "title") {
      this.showTitleScene({ forceUpdate: true });
    } else {
      this.showPlayScene({});
    }
  }

  async showArcanaDialog(cardId: string) {
    await this.arcanaDialog.showArcanaDialog(cardId, this.language);
  }

  showTitleScene(props: {
    forceUpdate?: boolean | undefined;
  }) {
    console.log("> showTitleScene", this.currentScene);
    if (!this.initialized || this.destroyed || !this.sceneManager) return;

    //this.currentScene = "title";
    if (props.forceUpdate || this.currentScene != "title") {
      this.setCurrentScene("title");
      this.sceneManager.change(
        new TitleScene(this),
        this.app.screen.width,
        this.app.screen.height,
      );
    }
  }

  showPlayScene(props: {
    forceUpdate?: boolean | undefined;
    isShuffleCards?: boolean | undefined;
    cards?: string[] | undefined;
  }) {
    console.log("> showPlayScene ", props, this.language);
    if (!this.initialized || this.destroyed || !this.sceneManager) return;

    if (props.forceUpdate || this.currentScene != "play") {
      console.log(">> ", props.forceUpdate, this.currentScene);
      //this.currentScene = "play";
      this.setCurrentScene("play");
      if (props.forceUpdate || !this.playScene) {
        console.log("> showPlayScene new");
        this.playScene = new PlayScene({
          game: this,
          isShuffleCards: props.isShuffleCards ?? false,
          cards: props.cards
        });
      }
      console.log(">>ch ", this.playScene.getDeck()[0]);
      this.sceneManager.change(
        this.playScene,
        this.app.screen.width,
        this.app.screen.height,
      );
    } else if (this.currentScene == "play" && this.playScene) {
      //
      console.log(">>ch ", this.playScene.getDeck()[0]);
      this.sceneManager.change(
        this.playScene,
        this.app.screen.width,
        this.app.screen.height,
      );
    }
  }

  async getCurrentCards(): Promise<string[]> {
    return (this.playScene?.getDeck() ?? []).map((c) => {
      return `${c.index}${c.reversed ? "r" : ""}`;
    });
  }
  async setCurrentCards(cards: string[]) {
    
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
