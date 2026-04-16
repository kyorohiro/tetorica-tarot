import { Container, Graphics } from "pixi.js";


export class FireOverlay {
  public readonly container = new Container();

  private readonly dark = new Graphics();
  private readonly glow1 = new Graphics();
  private readonly glow2 = new Graphics();

  private elapsed = 0;
  private progress = 0; // 0..1

  constructor() {
    this.container.addChild(this.dark);
    this.container.addChild(this.glow1);
    this.container.addChild(this.glow2);
    this.container.visible = false;
  }

  start() {
    this.elapsed = 0;
    this.progress = 0;
    this.container.visible = true;
  }

  stop() {
    this.container.visible = false;
  }

  update(deltaMS: number, width: number, height: number) {
    if (!this.container.visible) return;

    this.elapsed += deltaMS;
    this.progress = Math.min(this.progress + deltaMS / 1200, 1);

    this.redraw(width, height);
  }

  private redraw(width: number, height: number) {
    //
    const yBase = height * (1 - this.progress);
    const wave = (x: number, scale: number, speed: number, amp: number) =>
      Math.sin(x * scale + this.elapsed * speed) * amp;

    this.dark.clear();
    this.dark.rect(0, 0, width, yBase);
    this.dark.fill({ color: 0x000000, alpha: 0.65 });

    this.glow1.clear();
    this.glow1.moveTo(0, yBase);

    for (let x = 0; x <= width; x += 16) {
      const y = yBase + wave(x, 0.015, 0.01, 18) + wave(x, 0.05, 0.02, 8);
      this.glow1.lineTo(x, y);
    }

    this.glow1.lineTo(width, height);
    this.glow1.lineTo(0, height);
    this.glow1.closePath();
    this.glow1.fill({ color: 0xff5a1f, alpha: 0.9 });

    this.glow2.clear();
    this.glow2.moveTo(0, yBase + 10);

    for (let x = 0; x <= width; x += 16) {
      const y =
        yBase +
        12 +
        wave(x, 0.02, 0.016, 12) +
        wave(x, 0.08, 0.03, 5);
      this.glow2.lineTo(x, y);
    }

    this.glow2.lineTo(width, height);
    this.glow2.lineTo(0, height);
    this.glow2.closePath();
    this.glow2.fill({ color: 0xffd36b, alpha: 0.75 });
  }
}