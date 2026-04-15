import type { Container } from "pixi.js";
import type { Scene } from "./Scene";

export class SceneManager {
  private currentScene: Scene | null = null;

  constructor(private readonly stage: Container) {}

  change(scene: Scene, width: number, height: number) {
    if (this.currentScene) {
      this.stage.removeChild(this.currentScene.container);
      this.currentScene.unmount();
    }

    this.currentScene = scene;
    this.stage.addChild(scene.container);
    scene.mount();
    scene.resize(width, height);
  }

  resize(width: number, height: number) {
    this.currentScene?.resize(width, height);
  }

  destroy() {
    if (!this.currentScene) return;
    this.stage.removeChild(this.currentScene.container);
    this.currentScene.unmount();
    this.currentScene = null;
  }
}