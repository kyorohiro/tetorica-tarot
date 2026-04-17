import type { Application, Container, TickerCallback } from "pixi.js";
import type { Scene } from "./Scene";
import { FogLayer } from "./FogLayer";

async function fade(container: Container, from: number, to: number, durationMs: number) {
  const start = performance.now();
  container.alpha = from;

  return new Promise<void>((resolve) => {
    const tick = () => {
      const now = performance.now();
      const t = Math.min((now - start) / durationMs, 1);
      container.alpha = from + (to - from) * t;

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        container.alpha = to;
        resolve();
      }
    };

    requestAnimationFrame(tick);
  });
}

export class SceneManager {
  private currentScene: Scene | null = null;
  private isChanging = false;

  private fogLayer: FogLayer | null = null;
  private fogTicker?: TickerCallback<any>;
  private onResize?: () => void;

  constructor(
    private readonly app: Application,
    private readonly stage: Container
  ) {}

  async change(scene: Scene, width: number, height: number) {
    if (this.isChanging) return;
    this.isChanging = true;

    try {
      this.ensureFogLayer();

      if (this.currentScene) {
        await fade(this.currentScene.container, 1, 0, 200);
        this.stage.removeChild(this.currentScene.container);
        this.currentScene.unmount();
      }

      this.currentScene = scene;
      scene.container.alpha = 0;
      this.stage.addChild(scene.container);
      scene.mount();
      scene.resize(width, height);

      await fade(scene.container, 0, 1, 200);
    } finally {
      this.isChanging = false;
    }
  }

  resize(width: number, height: number) {
    this.currentScene?.resize(width, height);
    this.fogLayer?.resize(width, height);
  }

  destroy() {
    if (this.currentScene) {
      this.stage.removeChild(this.currentScene.container);
      this.currentScene.unmount();
      this.currentScene = null;
    }

    if (this.fogTicker) {
      this.app.ticker.remove(this.fogTicker);
      this.fogTicker = undefined;
    }

    if (this.onResize) {
      window.removeEventListener("resize", this.onResize);
      this.onResize = undefined;
    }

    if (this.fogLayer) {
      this.stage.removeChild(this.fogLayer.container);
      this.fogLayer.destroy();
      this.fogLayer = null;
    }
  }

  private ensureFogLayer() {
    if (this.fogLayer) return;

    this.fogLayer = new FogLayer(this.app, 7);
    this.fogLayer.init(this.app.screen.width, this.app.screen.height);

    // scene の上に乗せたいなら後で addChild。
    // 背景にしたいなら addChildAt(..., 0) などにする
    this.stage.addChild(this.fogLayer.container);

    this.fogTicker = (ticker) => {
      this.fogLayer?.update(
        ticker.deltaMS,
        this.app.screen.width,
        this.app.screen.height
      );
    };
    this.app.ticker.add(this.fogTicker);

    this.onResize = () => {
      this.fogLayer?.resize(this.app.screen.width, this.app.screen.height);
    };
    window.addEventListener("resize", this.onResize);
  }
}