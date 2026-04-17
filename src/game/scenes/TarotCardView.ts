import { Assets, Container, Matrix, Sprite } from "pixi.js";

export class TarotCardView {
  readonly container = new Container();

  private readonly frontCard = new Sprite();
  private readonly backCard = new Sprite();

  //private frontTexture: Texture | null = null;
  //private backTexture: Texture | null = null;

  private isFront = true;
  private isFlipping = false;
  private baseRotation = 0;

  private cardCenterX = 0;
  private cardCenterY = 0;

  constructor() {
    this.frontCard.anchor.set(0.5);
    this.backCard.anchor.set(0.5);

    this.container.eventMode = "static";
    this.container.cursor = "pointer";

    this.container.addChild(this.backCard, this.frontCard);
  }

  async setTextures(frontUrl: string, backUrl: string) {
    const [frontTexture, backTexture] = await Promise.all([
      Assets.load(frontUrl),
      Assets.load(backUrl),
    ]);

    //this.frontTexture = frontTexture;
    //this.backTexture = backTexture;

    this.frontCard.texture = frontTexture;
    this.backCard.texture = backTexture;

    this.updateFaceVisibility();
  }

  async setFrontTexture(frontUrl: string) {
    const frontTexture = await Assets.load(frontUrl);
    //this.frontTexture = frontTexture;
    this.frontCard.texture = frontTexture;
  }

  setReversed(reversed: boolean) {
    this.baseRotation = reversed ? Math.PI : 0;
    this.applyCardMatrix(0);
  }

  setSize(width: number, height: number) {
    this.frontCard.width = width;
    this.frontCard.height = height;
    this.backCard.width = width;
    this.backCard.height = height;
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
    return {x: this.cardCenterX, y:this.cardCenterY}
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
    this.frontCard.visible = this.isFront;
    this.backCard.visible = !this.isFront;
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