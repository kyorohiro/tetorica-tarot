import { Container, Sprite, Texture, Assets } from "pixi.js";
import type { Scene } from "../core/Scene";
import type { GameApp } from "../GameApp";
import { makeButton } from "../ui/makeButton";
import { Matrix } from "pixi.js";

import backCardUrl from "../../assets/CardBacks.jpg";

const cardModules = import.meta.glob("../../assets/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const frontCardUrls = Object.entries(cardModules)
  .filter(([path]) => {
    return !path.endsWith("/CardBacks.jpg") && !path.endsWith("/00-TheFool copy.jpg");
  })
  .map(([, url]) => url);

export class PlayScene implements Scene {
  container = new Container();

  private readonly bg = new Sprite(Texture.WHITE);
  private readonly cardRoot = new Container();
  private readonly frontCard = new Sprite();
  private readonly backCard = new Sprite();
  private baseRotation = 0;

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

  private frontTexture: Texture | null = null;
  private backTexture: Texture | null = null;
  private isFront = true;
  private isFlipping = false;

  //
  private cardCenterX = 0;
  private cardCenterY = 0;

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

  private applyCardMatrix(progress: number) {
    const sx = Math.max(Math.abs(1 - progress * 2), 0.02);
    const sy = 1 + 0.04 * Math.sin(progress * Math.PI);
    const bend = Math.sin(progress * Math.PI);
    const angle = this.baseRotation + 0.01 * bend;
    const skewY = 0.12 * bend;

    const scaleMatrix = new Matrix().scale(sx, sy);
    const rotateMatrix = new Matrix().rotate(angle);
    const skewMatrix = new Matrix(1, Math.tan(skewY), 0, 1, 0, 0);
    const translateMatrix = new Matrix().translate(
      this.cardCenterX,
      this.cardCenterY,
    );

    const matrix = new Matrix();
    matrix.append(translateMatrix);
    matrix.append(rotateMatrix);
    matrix.append(scaleMatrix);
    matrix.append(skewMatrix);

    this.cardRoot.setFromMatrix(matrix);
  }

  private refreshText() {
    this.backButton.setLabel(this.game.t("backToTitle"));
  }


  private async setRandomCard() {
    const randomFrontUrl =
      frontCardUrls[Math.floor(Math.random() * frontCardUrls.length)];

    this.frontTexture = await Assets.load(randomFrontUrl);
    if (this.frontTexture) {
      this.frontCard.texture = this.frontTexture;
    }

    this.baseRotation = Math.random() < 0.5 ? 0 : Math.PI;
    this.isFront = true;
    this.updateFaceVisibility();
    this.applyCardMatrix(0);
  }
  async mount() {
    this.setRandomCard();
    this.backTexture = await Assets.load(backCardUrl);

    this.isFront = true;
    this.updateFaceVisibility();

    if (this.backTexture) this.backCard.texture = this.backTexture;

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

    this.cardCenterX = this.width * 0.5;
    this.cardCenterY = this.height * 0.55;

    this.applyCardMatrix(0);
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

      this.applyCardMatrix(t);

      if (!swapped && t >= 0.5) {
        this.isFront = !this.isFront;
        this.updateFaceVisibility();
        swapped = true;
      }

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        this.applyCardMatrix(0);
        this.isFlipping = false;
      }
    };

    requestAnimationFrame(tick);
  }
}