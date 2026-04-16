import { Application } from "pixi.js";
import { sound } from "@pixi/sound";
import { SceneManager } from "./core/SceneManager";
import { TitleScene } from "./scenes/TitleScene";
import { PlayScene } from "./scenes/PlayScene";
import { t, type Lang, type MessageKey } from "./i18n/messages";

type SceneKey = "title" | "play";

export class GameApp {
  private readonly app = new Application();

  private sceneManager: SceneManager | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private currentScene: SceneKey = "title";
  private language: Lang;

  private initialized = false;
  private destroyed = false;
  private destroyRequested = false;

  constructor(
    private readonly root: HTMLElement,
    language: Lang,
  ) {
    this.language = language;
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

  getLanguage() : Lang{
    return this.language;
  }

  setLanguage(language: Lang) {
    this.language = language;
    if (!this.initialized || this.destroyed) return;

    if (this.currentScene === "title") {
      this.showTitleScene();
    } else {
      this.showPlayScene();
    }
  }

  showTitleScene() {
    if (!this.initialized || this.destroyed || !this.sceneManager) return;

    this.currentScene = "title";
    this.sceneManager.change(
      new TitleScene(this),
      this.app.screen.width,
      this.app.screen.height,
    );
  }

  showPlayScene() {
    if (!this.initialized || this.destroyed || !this.sceneManager) return;

    this.currentScene = "play";
    this.sceneManager.change(
      new PlayScene(this),
      this.app.screen.width,
      this.app.screen.height,
    );
  }

  playClick() {
    try {
      sound.play("click", { volume: 0.15 });
    } catch {
      //
    }
  }

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