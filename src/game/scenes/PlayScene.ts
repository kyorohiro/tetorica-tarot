import { Graphics, Container, Sprite, Text, TextStyle, Texture, Assets } from "pixi.js";
import type { Scene } from "../core/Scene";
import type { GameApp } from "../GameApp";
import { TarotCardView } from "./TarotCardView";

import backCardUrl from "../../assets/CardBacks.jpg";
import { majorArcanaCards } from "../tarot/majorArcana";
import { shuffleCards, tarotCards } from "./tarotCards";
import { createTriangleButton } from "./triangleButton";

type CardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  alpha: number;
};

export class PlayScene implements Scene {
  container = new Container();

  private textureCache = new Map<string, Texture>();
  private readonly bg = new Sprite(Texture.WHITE);

  private readonly prevCard = new TarotCardView();
  private readonly currentCard = new TarotCardView();
  private readonly nextCard = new TarotCardView();

  private readonly cardNextButton = createTriangleButton("right");
  private readonly cardBackButton = createTriangleButton("left");

  private currentCardId: string | null = null;
  private currentReversed = false;

  private deck = shuffleCards(tarotCards);
  private deckIndex = 0;

  private width = 0;
  private height = 0;
  private isAnimating = false;

  private readonly keywordsBg = new Graphics();

  private readonly titleText = new Text({
    text: "",
    style: new TextStyle({
      fill: 0xffffff,
      fontSize: 18,
      fontWeight: "bold",
    }),
  });

  private readonly keywordsText = new Text({
    text: "",
    style: new TextStyle({
      fill: 0xe5e7eb,
      fontSize: 11,
    }),
  });

  constructor(private readonly game: GameApp) {
    this.bg.tint = 0x111827;

    this.currentCard.onTap(async () => {
      if (this.isAnimating) return;

      if (this.currentCard.showingFront) {
        await this.currentCard.flip();
        return;
      }

      await this.refreshVisibleCards();
      this.refreshCardButtons();
    });

    this.cardNextButton.on("pointertap", async () => {
      if (this.isAnimating) return;
      if (this.deckIndex < this.deck.length - 1) {
        await this.slideTo("next");
      }
    });

    this.cardBackButton.on("pointertap", async () => {
      if (this.isAnimating) return;
      if (this.deckIndex > 0) {
        await this.slideTo("back");
      }
    });

    this.container.addChild(
      this.bg,
      this.prevCard.container,
      this.nextCard.container,
      this.currentCard.container,
      this.keywordsBg,
      this.titleText,
      this.keywordsText,
      this.cardNextButton,
      this.cardBackButton,
    );

    this.titleText.resolution = window.devicePixelRatio || 2;
    this.keywordsText.resolution = window.devicePixelRatio || 2;
  }

  async mount() {
    await this.preloadTextures();
    await this.refreshVisibleCards();
    this.refreshCardButtons();
  }

  unmount() {
    // Scene再利用前提なら destroy しない
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.bg.width = width;
    this.bg.height = height;

    this.layoutCards();

    this.titleText.anchor.set(0.5, 0);
    this.titleText.x = width * 0.5;
    this.titleText.y = height * 0.78;

    this.keywordsBg.x = width * 0.5;
    this.keywordsBg.y = height * 0.84;

    this.keywordsText.anchor.set(0.5, 0);
    this.keywordsText.x = width * 0.5;
    this.keywordsText.y = height * 0.84;
  }

  private async preloadTextures() {
    const urls = Array.from(
      new Set([
        backCardUrl,
        ...tarotCards.map((card) => card.url),
      ]),
    );

    for (const url of urls) {
      const texture = await Assets.load(url);
      this.textureCache.set(url, texture);
    }
  }
  private getTexture(url: string) {
    const texture = this.textureCache.get(url);
    if (!texture) {
      throw new Error(`Texture not loaded: ${url}`);
    }
    return texture;
  }
  private setButtonEnabled(button: Container, enabled: boolean) {
    button.visible = true;
    button.alpha = enabled ? 1 : 0.05;
    button.eventMode = enabled ? "static" : "none";
    button.cursor = enabled ? "pointer" : "default";
  }

  private refreshCardButtons() {
    const canGoBack = this.deckIndex > 0;
    const canGoNext = this.deckIndex < this.deck.length - 1;

    this.setButtonEnabled(this.cardBackButton, canGoBack);
    this.setButtonEnabled(this.cardNextButton, canGoNext);
  }

  private getCard(offset = 0) {
    return this.deck[this.deckIndex + offset];
  }

  private async refreshVisibleCards() {
    const prev = this.getCard(-1);
    const current = this.getCard(0);
    const next = this.getCard(1);


    const backTexture = this.getTexture(backCardUrl);

    if (prev) {
      this.prevCard.setTexturesFromTexture(
        this.getTexture(prev.url),
        backTexture,
      );
    }
    if (prev) {
      await this.prevCard.setTextures(prev.url, backCardUrl);
      this.prevCard.setReversed(prev.reversed);
      this.prevCard.showFront();
      this.prevCard.container.visible = true;
      this.prevCard.container.alpha = 0.35;
    } else {
      this.prevCard.container.visible = false;
    }

    if (current) {
      this.currentCardId = current.id;
      this.currentReversed = current.reversed;

      await this.currentCard.setTextures(current.url, backCardUrl);
      this.currentCard.setReversed(current.reversed);
      this.currentCard.showFront();
      this.currentCard.container.visible = true;
      this.currentCard.container.alpha = 1;
    } else {
      this.currentCard.container.visible = false;
    }

    if (next) {
      await this.nextCard.setTextures(next.url, backCardUrl);
      this.nextCard.setReversed(next.reversed);
      this.nextCard.showFront();
      this.nextCard.container.visible = true;
      this.nextCard.container.alpha = 0.35;
    } else {
      this.nextCard.container.visible = false;
    }

    this.refreshCardText();
    this.layoutCards();
  }

  private getCardLayouts() {
    let centerWidth: number;
    let centerHeight: number;

    if (this.width * 1.7 > this.height) {
      centerHeight = this.height * 0.62;
      centerWidth = centerHeight / 1.7;
    } else {
      centerWidth = this.width * 0.46;
      centerHeight = centerWidth * 1.7;
    }

    const sideScale = 0.72;
    const sideWidth = centerWidth * sideScale;
    const sideHeight = centerHeight * sideScale;

    const centerX = this.width * 0.5;
    const centerY = this.height * 0.48;

    const gap = centerWidth * 0.68;

    return {
      prev: {
        x: centerX - gap,
        y: centerY,
        width: sideWidth,
        height: sideHeight,
        alpha: 0.35,
      },
      current: {
        x: centerX,
        y: centerY,
        width: centerWidth,
        height: centerHeight,
        alpha: 1,
      },
      next: {
        x: centerX + gap,
        y: centerY,
        width: sideWidth,
        height: sideHeight,
        alpha: 0.35,
      },
      offLeft: {
        x: centerX - gap * 1.55,
        y: centerY,
        width: sideWidth * 0.92,
        height: sideHeight * 0.92,
        alpha: 0,
      },
      offRight: {
        x: centerX + gap * 1.55,
        y: centerY,
        width: sideWidth * 0.92,
        height: sideHeight * 0.92,
        alpha: 0,
      },
    };
  }

  private layoutCardButton() {
    const gap = 20;
    const position = this.currentCard.getPosition();
    const size = this.currentCard.getSize();

    this.cardBackButton.x =
      position.x - size.width / 2 - gap - this.cardBackButton.width / 2;
    this.cardNextButton.x =
      position.x + size.width / 2 + gap + this.cardNextButton.width / 2;

    this.cardBackButton.y = position.y;
    this.cardNextButton.y = position.y;
  }

  private layoutCards() {
    if (!this.width || !this.height) return;

    const layouts = this.getCardLayouts();

    this.prevCard.setSize(layouts.prev.width, layouts.prev.height);
    this.prevCard.setPosition(layouts.prev.x, layouts.prev.y);
    this.prevCard.container.alpha = layouts.prev.alpha;

    this.currentCard.setSize(layouts.current.width, layouts.current.height);
    this.currentCard.setPosition(layouts.current.x, layouts.current.y);
    this.currentCard.container.alpha = layouts.current.alpha;

    this.nextCard.setSize(layouts.next.width, layouts.next.height);
    this.nextCard.setPosition(layouts.next.x, layouts.next.y);
    this.nextCard.container.alpha = layouts.next.alpha;

    this.layoutCardButton();
  }

  private lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  private easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  private applyAnimatedLayout(
    card: TarotCardView,
    from: CardLayout,
    to: CardLayout,
    t: number,
  ) {
    const x = this.lerp(from.x, to.x, t);
    const y = this.lerp(from.y, to.y, t);
    const width = this.lerp(from.width, to.width, t);
    const height = this.lerp(from.height, to.height, t);
    const alpha = this.lerp(from.alpha, to.alpha, t);

    card.setSize(width, height);
    card.setPosition(x, y);
    card.container.alpha = alpha;
    card.container.visible = alpha > 0.01;
  }

  private async slideTo(direction: "next" | "back") {
    if (!this.width || !this.height) return;
    if (this.isAnimating) return;

    this.isAnimating = true;

    const layouts = this.getCardLayouts();
    const duration = 220;

    const from = {
      prev: layouts.prev,
      current: layouts.current,
      next: layouts.next,
    };

    const to =
      direction === "next"
        ? {
          prev: layouts.offLeft,
          current: layouts.prev,
          next: layouts.current,
        }
        : {
          prev: layouts.current,
          current: layouts.next,
          next: layouts.offRight,
        };

    await new Promise<void>((resolve) => {
      const start = performance.now();

      const tick = () => {
        const raw = Math.min((performance.now() - start) / duration, 1);
        const t = this.easeOutCubic(raw);

        this.applyAnimatedLayout(this.prevCard, from.prev, to.prev, t);
        this.applyAnimatedLayout(this.currentCard, from.current, to.current, t);
        this.applyAnimatedLayout(this.nextCard, from.next, to.next, t);

        this.currentCard.container.zIndex = 500;
        this.prevCard.container.zIndex = 500;
        this.nextCard.container.zIndex = 1000;
        this.cardNextButton.zIndex = 3000;
        this.cardBackButton.zIndex = 3000;
        if (raw < 1) {
          requestAnimationFrame(tick);
        } else {
          this.currentCard.container.zIndex = 1000;
          this.prevCard.container.zIndex = 500;
          this.nextCard.container.zIndex = 500;
          resolve();
        }
        this.keywordsBg.zIndex = 4500
        this.titleText.zIndex = 4500
        this.keywordsText.zIndex = 4500
      };

      requestAnimationFrame(tick);
    });

    if (direction === "next" && this.deckIndex < this.deck.length - 1) {
      this.deckIndex++;
    } else if (direction === "back" && this.deckIndex > 0) {
      this.deckIndex--;
    }

    await this.refreshVisibleCards();
    this.refreshCardButtons();
    this.isAnimating = false;
  }

  private getCurrentCardText() {
    if (!this.currentCardId) return null;

    const cardText = majorArcanaCards[this.currentCardId];
    if (!cardText) return null;

    const meaning = this.currentReversed
      ? cardText.reversed
      : cardText.upright;

    return {
      titleJa: cardText.titleJa,
      titleEn: cardText.titleEn,
      keywordsJa: meaning.keywordsJa,
      keywordsEn: meaning.keywordsEn,
    };
  }

  private refreshCardText() {
    const text = this.getCurrentCardText();
    if (!text) {
      this.titleText.text = "";
      this.keywordsText.text = "";
      this.keywordsBg.clear();
      return;
    }

    if (this.game.getLanguage() === "ja") {
      this.titleText.text = text.titleJa;
      this.keywordsText.text = text.keywordsJa.map((v) => `#${v}`).join("  ");
    } else {
      this.titleText.text = text.titleEn;
      this.keywordsText.text = text.keywordsEn.map((v) => `#${v}`).join("  ");
    }

    this.refreshKeywordsBg();
  }

  private refreshKeywordsBg() {
    const paddingX = 16;
    const paddingY = 10;
    const radius = 14;

    const w = this.keywordsText.width + paddingX * 2;
    const h = this.keywordsText.height + paddingY * 2 * 3;

    this.keywordsBg.clear();
    this.keywordsBg.roundRect(-w / 2, -h / 2, w, h, radius);
    this.keywordsBg.fill({ color: 0x000000, alpha: 0.45 });
  }
}