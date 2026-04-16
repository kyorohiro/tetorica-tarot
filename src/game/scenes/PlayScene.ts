import { Container, Sprite, Texture, Assets } from "pixi.js";
import type { Scene } from "../core/Scene";
import type { GameApp } from "../GameApp";
import { makeButton } from "../ui/makeButton";

import foolCardUrl from "../../assets/00-TheFool.jpg";
import backCardUrl from "../../assets/CardBacks.jpg";

export class PlayScene implements Scene {
  container = new Container();

  private readonly bg = new Sprite(Texture.WHITE);

  private readonly cardRoot = new Container();
  private readonly frontCard = new Sprite();
  private readonly backCard = new Sprite();

  private readonly backButton = makeButton(
    "",
    () => {
      this.game.playClick();
      this.game.showTitleScene();
    },
    180,
    52,
  );

  private width = 0;
  private height = 0;

  private isFront = true;
  private isFlipping = false;

  constructor(private readonly game: GameApp) {
    this.bg.tint = 0x111827;

    this.frontCard.anchor.set(0.5);
    this.backCard.anchor.set(0.5);

    this.cardRoot.eventMode = "static";
    this.cardRoot.cursor = "pointer";
    this.cardRoot.on("pointertap", () => {
      this.flipCard();
    });

    this.cardRoot.addChild(this.backCard, this.frontCard);

    this.refreshText();

    this.container.addChild(this.bg, this.cardRoot, this.backButton);
  }

  private refreshText() {
    this.backButton.setLabel(this.game.t("backToTitle"));
  }

  async mount() {
    this.frontCard.texture = await Assets.load(foolCardUrl);
    this.backCard.texture = await Assets.load(backCardUrl);

    this.isFront = true;
    this.updateFaceVisibility();
    this.layoutCard();
  }

  unmount() {
    this.container.destroy({ children: true });
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.bg.width = width;
    this.bg.height = height;

    this.backButton.x = 110;
    this.backButton.y = 42;

    this.layoutCard();
  }

  private layoutCard() {
    if (!this.width || !this.height) return;

    const cardWidth = Math.min(320, this.width * 0.28);
    const cardHeight = cardWidth * 1.7;

    this.frontCard.width = cardWidth;
    this.frontCard.height = cardHeight;

    this.backCard.width = cardWidth;
    this.backCard.height = cardHeight;

    this.cardRoot.position.set(this.width * 0.5, this.height * 0.55);
  }

  private updateFaceVisibility() {
    this.frontCard.visible = this.isFront;
    this.backCard.visible = !this.isFront;
  }

  private flipCard() {
    if (this.isFlipping) return;

    this.isFlipping = true;
    this.game.playClick();

    const duration = 360;
    const start = performance.now();
    let swapped = false;

    const tick = () => {
      const now = performance.now();
      const t = Math.min((now - start) / duration, 1);

      const sx = Math.abs(1 - t * 2);

      // 0に近すぎるとチラつきやすいので少し余裕を持たせる
      this.cardRoot.scale.x = Math.max(sx, 0.02);
      this.cardRoot.scale.y = 1 + 0.04 * Math.sin(t * Math.PI);
      this.cardRoot.rotation = 0.02 * Math.sin(t * Math.PI);

      if (!swapped && t >= 0.5) {
        this.isFront = !this.isFront;
        this.updateFaceVisibility();
        swapped = true;
      }

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        this.cardRoot.scale.set(1, 1);
        this.cardRoot.rotation = 0;
        this.isFlipping = false;
      }
    };

    requestAnimationFrame(tick);
  }
}