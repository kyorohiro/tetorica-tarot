import {
  Application,
  BlurFilter,
  Container,
  Graphics,
  NoiseFilter,
  RenderTexture,
  Sprite,
} from "pixi.js";

type FogParticle = {
  sprite: Sprite;
  baseY: number;
  speedX: number;
  swaySpeed: number;
  swayAmount: number;
  phase: number;
};

export class FogLayer {
  public readonly container = new Container();

  private readonly particles: FogParticle[] = [];
  private fogTexture: RenderTexture | null = null;

  constructor(
    private readonly app: Application,
    private readonly count = 6,
  ) {
    this.container.filters = [
      new BlurFilter({ strength: 10 }),
      new NoiseFilter({ noise: 0.05 }),
    ];
  }

  init(width: number, height: number) {
    this.destroyTexture();
    this.fogTexture = this.createFogTexture(512, 192);

    this.container.removeChildren();
    this.particles.length = 0;

    for (let i = 0; i < this.count; i++) {
      const sprite = new Sprite(this.fogTexture);
      sprite.anchor.set(0.5);
      sprite.alpha = 0.12 + Math.random() * 0.12;

      const scale = 0.9 + Math.random() * 1.8;
      sprite.scale.set(scale, 0.7 + Math.random() * 0.5);

      const p: FogParticle = {
        sprite,
        baseY: height * (0.2 + Math.random() * 0.6),
        speedX: 0.08 + Math.random() * 0.18,
        swaySpeed: 0.0006 + Math.random() * 0.0015,
        swayAmount: 8 + Math.random() * 20,
        phase: Math.random() * Math.PI * 2,
      };

      sprite.x = Math.random() * width;
      sprite.y = p.baseY;

      this.particles.push(p);
      this.container.addChild(sprite);
    }
  }

  resize(width: number, height: number) {
    for (const p of this.particles) {
      p.baseY = Math.min(p.baseY, height - 40);
      if (p.sprite.x > width + 200) {
        p.sprite.x = -200;
      }
    }
  }

  update(deltaMS: number, width: number, height: number) {
    const t = performance.now();

    for (const p of this.particles) {
      p.sprite.x += p.speedX * deltaMS;
      p.sprite.y = p.baseY + Math.sin(t * p.swaySpeed + p.phase) * p.swayAmount;

      if (p.sprite.x > width + p.sprite.width * 0.5) {
        p.sprite.x = -p.sprite.width * 0.5;
        p.baseY = height * (0.2 + Math.random() * 0.6);
      }
    }
  }

  destroy() {
    this.container.removeChildren();
    this.particles.length = 0;
    this.destroyTexture();
  }

  private destroyTexture() {
    if (this.fogTexture) {
      this.fogTexture.destroy(true);
      this.fogTexture = null;
    }
  }

  private createFogTexture(width: number, height: number): RenderTexture {
    const g = new Graphics();

    // 大きい白い塊を何個か重ねて、霧っぽい形を作る
    for (let i = 0; i < 7; i++) {
      const rx = width * (0.15 + Math.random() * 0.7);
      const ry = height * (0.2 + Math.random() * 0.6);
      const rw = 90 + Math.random() * 170;
      const rh = 35 + Math.random() * 70;

      g.ellipse(rx, ry, rw, rh);
      g.fill({ color: 0xffffff, alpha: 0.16 + Math.random() * 0.08 });
    }

    const rt = RenderTexture.create({ width, height });
    this.app.renderer.render({
      container: g,
      target: rt,
      clear: true,
    });
    g.destroy();

    return rt;
  }
}