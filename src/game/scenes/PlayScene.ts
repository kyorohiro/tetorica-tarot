import { Container, Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import type { Scene } from "../core/Scene";
import type { GameApp } from "../GameApp";
import { TarotCardView } from "./TarotCardView";

import { majorArcanaCards } from "../tarot/majorArcana";
import { shuffleCards, sortCards, tarotCards } from "./tarotCards";
import { createTriangleButton } from "./triangleButton";
import { drawElementMark } from "./TarotElementView";

type CardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  alpha: number;
};

export class PlayScene implements Scene {
  container = new Container();

  private readonly bg = new Sprite(Texture.WHITE);
  private readonly cards = Array.from({ length: 22 }, () => new TarotCardView());
  private readonly requestedCardIndexes = new Set<number>();
  private readonly loadedCardIndexes = new Set<number>();

  private readonly cardNextButton = createTriangleButton("right");
  private readonly cardBackButton = createTriangleButton("left");

  private currentCardId: string | null = null;
  private currentReversed = false;

  private deck = shuffleCards(tarotCards);
  private deckIndex = 0;
  private scrollPosition = 0;
  private targetScrollPosition = 0;
  private animationFrame: number | null = null;
  private momentumVelocity = 0;

  private width = 0;
  private height = 0;
  private isAnimating = false;
  private readonly game: GameApp;

  private isDragging = false;
  private swipeStartX: number | null = null;
  private swipeStartY: number | null = null;
  private swipeStartScrollPosition = 0;
  private swipeLastX: number | null = null;
  private swipeLastAt = 0;
  private swipeVelocityX = 0;
  private swipePointerId: number | null = null;
  private swipeMoved = false;
  private swipeTapCancelled = false;
  private suppressTapUntil = 0;

  private readonly keywordsBg = new Graphics();
  private readonly elementMark = new Graphics();

  private readonly titleText = new Text({
    text: "",
    style: new TextStyle({
      fill: 0xffffff,
      fontSize: 18,
      fontWeight: "bold",
    }),
  });

  private readonly uprightText = new Text({
    text: "",
    style: new TextStyle({
      fill: 0xffffff,
      fontSize: 12,
      fontWeight: "bold",
    }),
  });

  private readonly reversedText = new Text({
    text: "",
    style: new TextStyle({
      fill: 0x94a3b8,
      fontSize: 11,
    }),
  });

  private readonly loadingText = new Text({
    text: "",
    style: new TextStyle({
      fill: 0xffffff,
      fontSize: 20,
      fontWeight: "bold",
    }),
  });

  constructor(params: { readonly game: GameApp; isShuffleCards: boolean }) {
    this.game = params.game;
    this.bg.tint = 0x111827;
    this.bg.eventMode = "static";
    this.deck = params.isShuffleCards ? shuffleCards(tarotCards) : sortCards(tarotCards);
    this.scrollPosition = this.deckIndex;
    this.targetScrollPosition = this.deckIndex;

    this.bindSwipeTarget(this.bg);
    for (const card of tarotCards) {
      const cardView = this.cards[card.index];
      if (!cardView) continue;
      this.bindSwipeTarget(cardView.container);
      cardView.onTap(async () => {
        if (this.swipePointerId !== null) return;
        if (performance.now() < this.suppressTapUntil) return;
        await this.game.showArcanaDialog(card.id);
      });
    }

    this.cardNextButton.on("pointertap", async () => {
      if (this.isAnimating) return;
      await this.slideTo("next");
    });

    this.cardBackButton.on("pointertap", async () => {
      if (this.isAnimating) return;
      await this.slideTo("back");
    });

    this.container.addChild(
      this.bg,
      ...this.cards.map((card) => card.container),
      this.keywordsBg,
      this.titleText,
      this.elementMark,
      this.uprightText,
      this.reversedText,
      this.cardNextButton,
      this.cardBackButton,
      this.loadingText,
    );

    this.titleText.resolution = window.devicePixelRatio || 2;
    this.uprightText.resolution = window.devicePixelRatio || 2;
    this.reversedText.resolution = window.devicePixelRatio || 2;
  }

  async mount() {
    this.showLoading("Loading cards...");
    this.ensureVisibleTextures();
    this.renderScene();
    this.refreshCardButtons();
    this.hideLoading();
  }

  unmount() {
    this.stopAnimation();
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.bg.width = width;
    this.bg.height = height;

    this.renderScene();
  }

  private showLoading(message: string) {
    this.loadingText.text = message;
    this.loadingText.anchor.set(0.5);
    this.loadingText.x = Math.round(this.width * 0.5);
    this.loadingText.y = Math.round(this.height * 0.5);
    this.loadingText.visible = true;
  }

  private hideLoading() {
    this.loadingText.visible = false;
  }

  private bindSwipeTarget(target: Container) {
    target.on("pointerdown", (event) => {
      this.isDragging = true;
      this.stopAnimation();
      this.swipePointerId = event.pointerId;
      this.swipeStartX = event.global.x;
      this.swipeStartY = event.global.y;
      this.swipeStartScrollPosition = this.scrollPosition;
      this.swipeLastX = event.global.x;
      this.swipeLastAt = performance.now();
      this.swipeVelocityX = 0;
      this.swipeMoved = false;
      this.swipeTapCancelled = false;
    });

    target.on("pointermove", (event) => {
      if(!this.isDragging) {
        return;
      }
      if (this.swipePointerId !== event.pointerId) return;
      if (this.swipeStartX == null || this.swipeStartY == null) return;

      const dx = event.global.x - this.swipeStartX;
      const dy = event.global.y - this.swipeStartY;
      const now = performance.now();
      if (this.swipeLastX != null && this.swipeLastAt > 0) {
        const dt = Math.max(now - this.swipeLastAt, 1);
        this.swipeVelocityX = (event.global.x - this.swipeLastX) / dt;
      }
      this.swipeLastX = event.global.x;
      this.swipeLastAt = now;

      if (Math.abs(dx) > 12 || Math.abs(dy) > 12) {
        this.swipeMoved = true;
      }
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        this.swipeTapCancelled = true;
      }

      if (!this.swipeMoved) return;
      if (Math.abs(dx) <= Math.abs(dy) * 1.1) return;

      const spacing = this.getCardLayouts().current.width * 0.68;
      const nextScroll = this.swipeStartScrollPosition - dx / Math.max(spacing, 1);
      this.scrollPosition = this.clampScrollPosition(nextScroll);
      this.targetScrollPosition = this.scrollPosition;
      this.ensureVisibleTextures();
      this.renderScene();
    });

    const handleEnd = async (event: { pointerId: number; global: { x: number; y: number } }) => {
      this.isDragging = false;
      if (this.swipePointerId !== event.pointerId) return;
      if (this.swipeStartX == null || this.swipeStartY == null) {
        this.resetSwipeState();
        return;
      }

      if (this.swipeTapCancelled || this.swipeMoved) {
        this.suppressTapUntil = performance.now() + 360;
      }

      if (!this.swipeMoved) {
        await this.animateToScrollPosition(Math.round(this.scrollPosition));
        this.resetSwipeState();
        return;
      }

      const spacing = this.getCardLayouts().current.width * 0.68;
      const scrollVelocity = (-this.swipeVelocityX / Math.max(spacing, 1)) * 1.15;
      await this.startMomentum(scrollVelocity);
      this.resetSwipeState();
      
    };

    target.on("pointerup", (event) => {
      void handleEnd(event);
    });
    target.on("pointerupoutside", (event) => {
      void handleEnd(event);
    });
    target.on("pointercancel", () => {
      this.resetSwipeState();
    });
  }

  private resetSwipeState() {
    this.swipeStartX = null;
    this.swipeStartY = null;
    this.swipeStartScrollPosition = this.scrollPosition;
    this.swipeLastX = null;
    this.swipeLastAt = 0;
    this.swipeVelocityX = 0;
    this.swipePointerId = null;
    this.swipeMoved = false;
    this.swipeTapCancelled = false;
  }

  private async slideTo(direction: "next" | "back") {
    const delta = direction === "next" ? 1 : -1;
    const target = this.clampScrollPosition(Math.round(this.scrollPosition) + delta);
    await this.animateToScrollPosition(target);
  }

  private async animateToScrollPosition(target: number) {
    this.stopAnimation();
    const start = this.scrollPosition;
    const delta = target - start;
    if (Math.abs(delta) < 0.001) {
      this.scrollPosition = target;
      this.targetScrollPosition = target;
      this.deckIndex = Math.round(target);
      this.ensureVisibleTextures();
      this.renderScene();
      this.refreshCardButtons();
      return;
    }

    this.isAnimating = true;
    this.momentumVelocity = 0;
    this.targetScrollPosition = target;
    const duration = Math.max(140, 220 * Math.min(Math.abs(delta), 1.8));

    await new Promise<void>((resolve) => {
      const startedAt = performance.now();
      const tick = () => {
        const raw = Math.min((performance.now() - startedAt) / duration, 1);
        const eased = this.easeOutCubic(raw);
        this.scrollPosition = start + delta * eased;
        this.ensureVisibleTextures();
        this.renderScene();

        if (raw < 1) {
          this.animationFrame = requestAnimationFrame(tick);
        } else {
          this.animationFrame = null;
          this.scrollPosition = target;
          this.deckIndex = Math.round(target);
          this.isAnimating = false;
          this.ensureVisibleTextures();
          this.renderScene();
          this.refreshCardButtons();
          resolve();
        }
      };

      this.animationFrame = requestAnimationFrame(tick);
    });
  }

  private stopAnimation() {
    if (this.animationFrame == null) return;
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
    this.isAnimating = false;
    this.momentumVelocity = 0;
  }

  private async startMomentum(initialVelocity: number) {
    this.stopAnimation();
    this.isAnimating = true;
    this.momentumVelocity = initialVelocity;
    this.targetScrollPosition = this.scrollPosition;

    await new Promise<void>((resolve) => {
      let lastAt = performance.now();

      const tick = () => {
        const now = performance.now();
        const dt = Math.max(now - lastAt, 1);
        lastAt = now;

        this.scrollPosition = this.clampScrollPosition(
          this.scrollPosition + this.momentumVelocity * dt,
        );

        const friction = Math.pow(0.92, dt / 16.67);
        this.momentumVelocity *= friction;

        const atStart = this.scrollPosition <= 0.0001;
        const atEnd = this.scrollPosition >= this.deck.length - 1 - 0.0001;
        if (atStart || atEnd) {
          this.momentumVelocity = 0;
        }

        this.ensureVisibleTextures();
        this.renderScene();
        this.refreshCardButtons();

        if (Math.abs(this.momentumVelocity) < 0.002) {
          this.animationFrame = null;
          this.isAnimating = false;
          void this.animateToScrollPosition(Math.round(this.scrollPosition)).then(resolve);
          return;
        }

        this.animationFrame = requestAnimationFrame(tick);
      };

      this.animationFrame = requestAnimationFrame(tick);
    });
  }

  private refreshCardButtons() {
    const rounded = Math.round(this.targetScrollPosition);
    const canGoBack = rounded > 0;
    const canGoNext = rounded < this.deck.length - 1;

    this.setButtonEnabled(this.cardBackButton, canGoBack);
    this.setButtonEnabled(this.cardNextButton, canGoNext);
  }

  private setButtonEnabled(button: Container, enabled: boolean) {
    button.visible = true;
    button.alpha = enabled ? 1 : 0.05;
    button.eventMode = enabled ? "static" : "none";
    button.cursor = enabled ? "pointer" : "default";
  }

  private clampScrollPosition(position: number) {
    return Math.max(0, Math.min(this.deck.length - 1, position));
  }

  private ensureVisibleTextures() {
    const center = Math.round(this.scrollPosition);
    for (let offset = -1; offset <= 2; offset++) {
      const card = this.deck[center + offset];
      if (!card) continue;
      if (this.loadedCardIndexes.has(card.index) || this.requestedCardIndexes.has(card.index)) {
        continue;
      }

      const cardView = this.cards[card.index];
      if (!cardView) continue;

      this.requestedCardIndexes.add(card.index);
      void cardView.setFrontTexture(card.url).then(() => {
        this.requestedCardIndexes.delete(card.index);
        this.loadedCardIndexes.add(card.index);
      }).catch(() => {
        this.requestedCardIndexes.delete(card.index);
      });
    }
  }

  private renderScene() {
    if (!this.width || !this.height) return;

    for (const cardView of this.cards) {
      cardView.container.visible = false;
      cardView.container.alpha = 0;
    }

    for (let position = 0; position < this.deck.length; position++) {
      const card = this.deck[position];
      const cardView = this.cards[card.index];
      if (!cardView) continue;

      const delta = position - this.scrollPosition;
      const layout = this.getLayoutForDelta(delta);
      if (!layout) continue;

      cardView.setReversed(card.reversed);
      cardView.showFront();
      cardView.setSize(layout.width, layout.height);
      cardView.setPosition(layout.x, layout.y);
      cardView.container.alpha = layout.alpha;
      cardView.container.visible = layout.alpha > 0.01;
      cardView.container.zIndex = Math.round(1000 - Math.abs(delta) * 100);
      this.cardBackButton.zIndex = 4000;
      this.cardNextButton.zIndex = 4000;
    }

    const roundedIndex = Math.round(this.scrollPosition);
    const current = this.deck[roundedIndex];
    this.currentCardId = current?.id ?? null;
    this.currentReversed = current?.reversed ?? false;
    this.refreshCardText();
    this.layoutOverlay();
  }

  private getLayoutForDelta(delta: number) {
    const layouts = this.getCardLayouts();
    const farLeft = {
      x: layouts.offLeft.x - layouts.current.width * 0.12,
      y: layouts.offLeft.y,
      width: layouts.offLeft.width,
      height: layouts.offLeft.height,
      alpha: 0,
    };
    //const farRight = {
    //  x: layouts.offRight.x + layouts.current.width * 0.12,
    //  y: layouts.offRight.y,
    //  width: layouts.offRight.width,
    //  height: layouts.offRight.height,
    //  alpha: 0,
    //};
    //console.log(farRight);

    if (delta <= -2 || delta >= 2) return null;
    if (delta < -1) return this.interpolateLayout(farLeft, layouts.offLeft, delta + 2);
    if (delta < 0) return this.interpolateLayout(layouts.prev, layouts.current, delta + 1);
    if (delta < 1) return this.interpolateLayout(layouts.current, layouts.next, delta);
    return this.interpolateLayout(layouts.next, layouts.offRight, delta - 1);
  }

  private interpolateLayout(from: CardLayout, to: CardLayout, t: number): CardLayout {
    return {
      x: this.lerp(from.x, to.x, t),
      y: this.lerp(from.y, to.y, t),
      width: this.lerp(from.width, to.width, t),
      height: this.lerp(from.height, to.height, t),
      alpha: this.lerp(from.alpha, to.alpha, t),
    };
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

  private layoutOverlay() {
    const layouts = this.getCardLayouts();
    const currentLayout = layouts.current;

    this.titleText.anchor.set(0.5, 0);
    this.titleText.x = this.width * 0.5;
    this.titleText.y = this.height * 0.8;

    this.keywordsBg.x = this.width * 0.5;
    this.keywordsBg.y = this.height * 0.84;

    this.elementMark.x = currentLayout.x - currentLayout.width / 2 + 20;
    this.elementMark.y = this.keywordsBg.y - 10;

    this.uprightText.anchor.set(0.5, 0);
    this.uprightText.x = this.width * 0.5;
    this.uprightText.y = this.height * 0.84;

    this.reversedText.anchor.set(0.5, 0);
    this.reversedText.x = this.width * 0.5;
    this.reversedText.y = this.height * 0.84 + 16;

    this.layoutCardButton(currentLayout);
    this.loadingText.x = currentLayout.x;
    this.loadingText.y = currentLayout.y;
  }

  private layoutCardButton(currentLayout: CardLayout) {
    const gap = 20;
    this.cardBackButton.x =
      currentLayout.x - currentLayout.width / 2 - gap - this.cardBackButton.width / 2;
    this.cardNextButton.x =
      currentLayout.x + currentLayout.width / 2 + gap + this.cardNextButton.width / 2;
    this.cardBackButton.y = currentLayout.y;
    this.cardNextButton.y = currentLayout.y;
  }

  private getCurrentCardText() {
    if (!this.currentCardId) return null;

    const cardText = majorArcanaCards[this.currentCardId];
    if (!cardText) return null;

    const meaning = this.currentReversed ? cardText.reversed : cardText.upright;

    return {
      titleJa: cardText.titleJa,
      titleEn: cardText.titleEn,
      keywordsJa: meaning.keywordsJa,
      keywordsEn: meaning.keywordsEn,
      revered: cardText.reversed,
      upright: cardText.upright,
      element: cardText.element,
    };
  }

  private refreshCardText() {
    const text = this.getCurrentCardText();
    if (!text) {
      this.titleText.text = "";
      this.uprightText.text = "";
      this.reversedText.text = "";
      this.keywordsBg.clear();
      return;
    }

    drawElementMark({ elementMark: this.elementMark, element: text.element });

    if (!this.currentReversed) {
      this.uprightText.style = new TextStyle({
        fill: 0xffffff,
        fontSize: 12,
        fontWeight: "bold",
      });
      this.reversedText.style = new TextStyle({
        fill: 0xffffff,
        fontSize: 10,
      });
    } else {
      this.reversedText.style = new TextStyle({
        fill: 0xffffff,
        fontSize: 12,
        fontWeight: "bold",
      });
      this.uprightText.style = new TextStyle({
        fill: 0xffffff,
        fontSize: 10,
      });
    }

    if (this.game.getLanguage() === "ja") {
      this.titleText.text = text.titleJa;
      this.uprightText.text = text.upright.keywordsJa.map((v) => `#${v}`).join("  ");
      this.reversedText.text = text.revered.keywordsJa.map((v) => `#${v}`).join("  ");
    } else {
      this.titleText.text = text.titleEn;
      this.uprightText.text = text.upright.keywordsEn.map((v) => `#${v}`).join("  ");
      this.reversedText.text = text.revered.keywordsEn.map((v) => `#${v}`).join("  ");
    }

    this.refreshKeywordsBg();
  }

  private refreshKeywordsBg() {
    const layouts = this.getCardLayouts();
    const paddingX = 16;
    const paddingY = 10;
    const radius = 14;

    const w1 = this.uprightText.width + paddingX * 2;
    const h1 = this.uprightText.height + paddingY * 2 * 3;
    const w2 = this.reversedText.width + paddingX * 2;
    const h2 = this.reversedText.height + paddingY * 2 * 3;
    const w = Math.max(w1, w2, layouts.current.width);
    const h = Math.max(h1, h2);

    this.keywordsBg.clear();
    this.keywordsBg.roundRect(-w / 2, -h / 2, w, h, radius);
    this.keywordsBg.fill({ color: 0x000000, alpha: 0.45 });
  }

  private lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  private easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }
}
