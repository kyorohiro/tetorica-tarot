import {
  Assets,
  Container,
  Graphics,
  Matrix,
  Sprite,
  Text,
  TextStyle,
  Texture,
} from "pixi.js";

type CardLoadState = "idle" | "loading" | "ready" | "error";

export class TarotCardView {
  readonly container = new Container();

  private readonly frontCard = new Sprite();
  private readonly backCard = new Sprite();
  private readonly loadingLayer = new Container();
  private readonly loadingBg = new Graphics();
  private readonly loadingSpinner = new Graphics();
  private readonly loadingText = new Text({
    text: "Loading...",
    style: new TextStyle({
      fill: 0xffffff,
      fontSize: 14,
      fontWeight: "bold",
    }),
  });
  private readonly errorLayer = new Container();
  private readonly errorBg = new Graphics();
  private readonly errorText = new Text({
    text: "Failed to load image",
    style: new TextStyle({
      fill: 0xffe4e6,
      fontSize: 12,
      fontWeight: "bold",
      align: "center",
    }),
  });

  private isFront = true;
  private isFlipping = false;
  private baseRotation = 0;
  private loadState: CardLoadState = "idle";
  private loadRequestId = 0;
  private loadingAnimationFrame: number | null = null;

  private cardCenterX = 0;
  private cardCenterY = 0;
  private cardWidth = 0;
  private cardHeight = 0;

  constructor() {
    this.frontCard.anchor.set(0.5);
    this.backCard.anchor.set(0.5);
    this.loadingText.anchor.set(0.5);
    this.errorText.anchor.set(0.5);

    this.loadingLayer.addChild(
      this.loadingBg,
      this.loadingSpinner,
      this.loadingText,
    );
    this.errorLayer.addChild(this.errorBg, this.errorText);

    this.container.eventMode = "static";
    this.container.cursor = "pointer";

    this.container.addChild(
      this.backCard,
      this.frontCard,
      this.loadingLayer,
      this.errorLayer,
    );

    this.setPlaceholder();
  }

  setTexturesFromTexture(frontTexture: Texture, backTexture: Texture) {
    this.frontCard.texture = frontTexture;
    this.backCard.texture = backTexture;
    this.loadState = "ready";
    this.refreshOverlays();
  }
  async setTextures(frontUrl: string, backUrl: string) {
    const [frontTexture, backTexture] = await Promise.all([
      Assets.load(frontUrl),
      Assets.load(backUrl),
    ]);

    this.frontCard.texture = frontTexture;
    this.backCard.texture = backTexture;
    this.loadState = "ready";
    this.refreshOverlays();
  }

  async setFrontTexture(frontUrl: string) {
    const frontTexture = await Assets.load(frontUrl);
    this.frontCard.texture = frontTexture;
    this.loadState = "ready";
    this.refreshOverlays();
  }

  setBackTexture(backTexture: Texture) {
    this.backCard.texture = backTexture;
    this.refreshOverlays();
  }

  async loadImage(frontUrl: string) {
    const requestId = ++this.loadRequestId;
    this.loadState = "loading";
    this.refreshOverlays();

    try {
      const frontTexture = await Assets.load(frontUrl);
      if (requestId !== this.loadRequestId) return;

      this.frontCard.texture = frontTexture;
      this.loadState = "ready";
      this.refreshOverlays();
    } catch (error) {
      if (requestId !== this.loadRequestId) return;

      console.error("Failed to load tarot image:", frontUrl, error);
      this.loadState = "error";
      this.refreshOverlays();
    }
  }

  disposeImage() {
    this.loadRequestId++;
    this.frontCard.texture = Texture.EMPTY;
    this.loadState = "idle";
    this.refreshOverlays();
  }

  setPlaceholder() {
    this.loadRequestId++;
    this.frontCard.texture = Texture.EMPTY;
    this.backCard.texture = Texture.EMPTY;
    this.loadState = "idle";
    this.refreshOverlays();
  }

  setReversed(reversed: boolean) {
    this.baseRotation = reversed ? Math.PI : 0;
    this.applyCardMatrix(0);
  }

  setSize(width: number, height: number) {
    this.cardWidth = width;
    this.cardHeight = height;
    this.frontCard.width = width;
    this.frontCard.height = height;
    this.backCard.width = width;
    this.backCard.height = height;
    this.layoutOverlay();
  }

  getSize() {
    return {
      width: this.frontCard.width,
      heigth: this.frontCard.height
    }
  }
  setPosition(x: number, y: number) {
    this.cardCenterX = x;
    this.cardCenterY = y;
    this.applyCardMatrix(0);
  }
  getPosition() {
    return { x: this.cardCenterX, y: this.cardCenterY }
  }

  showFront() {
    this.isFront = true;
    this.updateFaceVisibility();
    this.applyCardMatrix(0);
  }

  showBack() {
    this.isFront = false;
    this.updateFaceVisibility();
    this.applyCardMatrix(0);
  }

  get showingFront() {
    return this.isFront;
  }

  update(now = performance.now()) {
    if (this.loadState !== "loading") return;

    const t = now / 1000;
    this.loadingSpinner.rotation = t * 3;
    this.loadingLayer.alpha = 0.8 + Math.sin(t * 5) * 0.1;
  }

  onTap(handler: () => void | Promise<void>) {
    this.container.removeAllListeners("pointertap");
    this.container.on("pointertap", () => {
      void handler();
    });
  }

  async flip() {
    if (this.isFlipping) return;

    this.isFlipping = true;

    const duration = 360;
    const start = performance.now();
    const nextIsFront = !this.isFront;
    let swapped = false;

    await new Promise<void>((resolve) => {
      const tick = () => {
        const now = performance.now();
        const t = Math.min((now - start) / duration, 1);

        this.applyCardMatrix(t);

        if (!swapped && t >= 0.5) {
          this.isFront = nextIsFront;
          this.updateFaceVisibility();
          swapped = true;
        }

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          this.applyCardMatrix(0);
          this.isFlipping = false;
          resolve();
        }
      };

      requestAnimationFrame(tick);
    });
  }

  private updateFaceVisibility() {
    this.frontCard.visible = this.loadState === "ready" && this.isFront;
    this.backCard.visible = this.loadState === "ready" && !this.isFront;
  }

  private refreshOverlays() {
    this.updateFaceVisibility();
    this.loadingLayer.visible = this.loadState === "loading";
    this.errorLayer.visible = this.loadState === "error";

    if (this.loadState === "loading") {
      this.ensureLoadingAnimation();
    } else {
      this.stopLoadingAnimation();
      this.loadingLayer.alpha = 1;
    }
  }

  private ensureLoadingAnimation() {
    if (this.loadingAnimationFrame !== null) return;

    const tick = () => {
      if (this.loadState !== "loading") {
        this.loadingAnimationFrame = null;
        return;
      }

      this.update();
      this.loadingAnimationFrame = requestAnimationFrame(tick);
    };

    this.loadingAnimationFrame = requestAnimationFrame(tick);
  }

  private stopLoadingAnimation() {
    if (this.loadingAnimationFrame === null) return;
    cancelAnimationFrame(this.loadingAnimationFrame);
    this.loadingAnimationFrame = null;
  }

  private layoutOverlay() {
    if (!this.cardWidth || !this.cardHeight) return;

    const radius = Math.min(this.cardWidth, this.cardHeight) * 0.08;
    const spinnerRadius = Math.min(this.cardWidth, this.cardHeight) * 0.08;

    this.loadingBg.clear();
    this.loadingBg.roundRect(
      -this.cardWidth / 2,
      -this.cardHeight / 2,
      this.cardWidth,
      this.cardHeight,
      radius,
    );
    this.loadingBg.fill({ color: 0x0f172a, alpha: 0.95 });

    this.loadingSpinner.clear();
    this.loadingSpinner.circle(0, 0, spinnerRadius);
    this.loadingSpinner.stroke({ color: 0xffffff, width: 3, alpha: 0.18 });
    this.loadingSpinner.arc(0, 0, spinnerRadius, 0, Math.PI * 1.4);
    this.loadingSpinner.stroke({ color: 0xffffff, width: 3 });
    this.loadingSpinner.y = -12;
    this.loadingText.y = 20;

    this.errorBg.clear();
    this.errorBg.roundRect(
      -this.cardWidth / 2,
      -this.cardHeight / 2,
      this.cardWidth,
      this.cardHeight,
      radius,
    );
    this.errorBg.fill({ color: 0x3f0f0f, alpha: 0.96 });
    this.errorText.y = 0;
    this.errorText.style.wordWrap = true;
    this.errorText.style.wordWrapWidth = this.cardWidth * 0.8;
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

    this.container.setFromMatrix(matrix);
  }
}
