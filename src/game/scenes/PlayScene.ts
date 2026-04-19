import { Graphics, Container, Sprite, Text, TextStyle, Texture } from "pixi.js";
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

  private cards = Array.from({ length: 22 }, () => new TarotCardView());
  private prevCardIndex:number|undefined|null = 0;
  private currentCardIndex:number|undefined|null = 1;
  private nextCardIndex:number|undefined|null = 2;

  private readonly cardNextButton = createTriangleButton("right");
  private readonly cardBackButton = createTriangleButton("left");

  private currentCardId: string | null = null;
  private currentReversed = false;

  private deck = shuffleCards(tarotCards);
  private deckIndex = 0;

  private width = 0;
  private height = 0;
  private isAnimating = false;
  private game: GameApp;
  private swipeStartX: number | null = null;
  private swipeStartY: number | null = null;
  private swipeLastX: number | null = null;
  private swipeLastAt = 0;
  private swipeVelocityX = 0;
  private swipePointerId: number | null = null;
  private swipeMoved = false;
  private dragProgress = 0;
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
  constructor(params:{readonly game: GameApp, isShuffleCards: boolean}) {
    this.game = params.game;
    const isShuffleCards = params.isShuffleCards;
    this.bg.tint = 0x111827;
    this.bg.eventMode = "static";
    if(isShuffleCards) {
      this.deck = shuffleCards(tarotCards);
    } else {
      this.deck = sortCards(tarotCards);
    }

    this.bindSwipeTarget(this.bg);
    for (const card of tarotCards) {
      const cardView = this.cards[card.index];
      if (!cardView) continue;
      this.bindSwipeTarget(cardView.container);
      cardView.onTap(async () => {
        if (performance.now() < this.suppressTapUntil) return;
        await this.game.showArcanaDialog(card.id);
      });
    }

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


    await this.refreshVisibleCards();
    this.refreshCardButtons();

    this.hideLoading();
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
    this.titleText.y = height * 0.80;

            const layouts = this.getCardLayouts();

    this.keywordsBg.x = width * 0.5;
    this.keywordsBg.y = height * 0.84;

    this.elementMark.x = layouts.current.x - layouts.current.width/2 + 20;
    this.elementMark.y = this.keywordsBg.y -10;//layouts.current.y + layouts.current.height/2 + 20;

    this.uprightText.anchor.set(0.5, 0);
    this.uprightText.x = width * 0.5;
    this.uprightText.y = height * 0.84;
    this.reversedText.anchor.set(0.5, 0);
    this.reversedText.x = width * 0.5;
    this.reversedText.y = height * 0.84 + 16;

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

  private getCardView(index: number | undefined | null) {
    if (index == null) return null;
    return this.cards[index] ?? null;
  }

  private getPrevCardView() {
    return this.getCardView(this.prevCardIndex);
  }

  private getCurrentCardView() {
    return this.getCardView(this.currentCardIndex);
  }

  private getNextCardView() {
    return this.getCardView(this.nextCardIndex);
  }

  private bindSwipeTarget(target: Container) {
    target.on("pointerdown", (event) => {
      if (this.isAnimating) return;
      this.swipePointerId = event.pointerId;
      this.swipeStartX = event.global.x;
      this.swipeStartY = event.global.y;
      this.swipeLastX = event.global.x;
      this.swipeLastAt = performance.now();
      this.swipeVelocityX = 0;
      this.swipeMoved = false;
      this.dragProgress = 0;
    });

    target.on("pointermove", (event) => {
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

      if (!this.swipeMoved) return;
      if (Math.abs(dx) <= Math.abs(dy) * 1.1) return;

      const layouts = this.getCardLayouts();
      const denominator = Math.max(layouts.current.width * 0.68, 1);
      const rawProgress = dx / denominator;
      this.dragProgress = Math.max(-1.25, Math.min(1.25, rawProgress));
      this.renderSwipeProgress(this.dragProgress);
    });

    const handleEnd = async (event: { pointerId: number; global: { x: number; y: number } }) => {
      if (this.swipePointerId !== event.pointerId) return;
      if (this.swipeStartX == null || this.swipeStartY == null) {
        this.resetSwipeState();
        return;
      }

      const dx = event.global.x - this.swipeStartX;
      const dy = event.global.y - this.swipeStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const velocityX = this.swipeVelocityX;

      if (this.swipeMoved) {
        this.suppressTapUntil = performance.now() + 220;
      }

      if (this.isAnimating) {
        this.resetSwipeState();
        return;
      }
      if (!this.swipeMoved || absDx <= absDy * 1.2) {
        await this.animateDragRelease(0);
        this.resetSwipeState();
        return;
      }

      const canGoNext = dx < 0 && this.deckIndex < this.deck.length - 1;
      const canGoBack = dx > 0 && this.deckIndex > 0;
      if (!canGoNext && !canGoBack) {
        await this.animateDragRelease(0);
        this.resetSwipeState();
        return;
      }

      const flingScore = absDx + Math.abs(velocityX) * 180;
      const skipCount = flingScore > 360 ? 2 : absDx > 48 ? 1 : 0;
      const direction: "next" | "back" | null =
        dx < 0 ? (canGoNext ? "next" : null) : canGoBack ? "back" : null;

      if (!direction || skipCount === 0) {
        await this.animateDragRelease(0);
        this.resetSwipeState();
        return;
      }

      await this.finishSwipe(direction, skipCount);
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
    this.swipeLastX = null;
    this.swipeLastAt = 0;
    this.swipeVelocityX = 0;
    this.swipePointerId = null;
    this.swipeMoved = false;
    this.dragProgress = 0;
  }

  private async refreshVisibleCards() {

    {
    const current = this.getCard(0);
    const next = this.getCard(1);
    const next2 = this.getCard(2);

    if(current && current.index != null && current.index != undefined) {
      void this.cards[current.index].setFrontTexture(current.url);
    }

    if(next && next.index != null && next.index != undefined) {
      void this.cards[next.index].setFrontTexture(next.url);
    }

    if(next2 && next2.index != null && next2.index != undefined) {
      void this.cards[next2.index].setFrontTexture(next2.url);
    }
  }
    const prev = this.getCard(-1);
    const current = this.getCard(0);
    const next = this.getCard(1);

    this.prevCardIndex = prev?.index ?? null;
    this.currentCardIndex = current?.index ?? null;
    this.nextCardIndex = next?.index ?? null;

    const prevCardView = this.getPrevCardView();
    const currentCardView = this.getCurrentCardView();
    const nextCardView = this.getNextCardView();

    for (const cardView of this.cards) {
      cardView.container.visible = false;
      cardView.container.alpha = 0;
    }

    if (prev && prevCardView) {
      prevCardView.setReversed(prev.reversed);
      prevCardView.showFront();
      prevCardView.container.visible = true;
      prevCardView.container.alpha = 0.35;
    } else if (prevCardView) {
      prevCardView.container.visible = false;
    }

    if (current && currentCardView) {
      this.currentCardId = current.id;
      this.currentReversed = current.reversed;

      currentCardView.setReversed(current.reversed);
      currentCardView.showFront();
      currentCardView.container.visible = true;
      currentCardView.container.alpha = 1;
    } else if (currentCardView) {
      currentCardView.container.visible = false;
    }

    if (next && nextCardView) {
      nextCardView.setReversed(next.reversed);
      nextCardView.showFront();
      nextCardView.container.visible = true;
      nextCardView.container.alpha = 0.35;
    } else if (nextCardView) {
      nextCardView.container.visible = false;
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
    const currentCardView = this.getCurrentCardView();
    if (!currentCardView) return;
    const position = currentCardView.getPosition();
    const size = currentCardView.getSize();

    this.cardBackButton.x =
      position.x - size.width / 2 - gap - this.cardBackButton.width / 2;
    this.cardNextButton.x =
      position.x + size.width / 2 + gap + this.cardNextButton.width / 2;

    this.cardBackButton.y = position.y;
    this.cardNextButton.y = position.y;
  }

  private layoutCards() {
    if (!this.width || !this.height) return;
    console.log(">> layoutCard", this.nextCardIndex, this.currentCardIndex, this.prevCardIndex);

    const layouts = this.getCardLayouts();
    const prevCardView = this.getPrevCardView();
    const currentCardView = this.getCurrentCardView();
    const nextCardView = this.getNextCardView();

    if (prevCardView) {
      prevCardView.setSize(layouts.prev.width, layouts.prev.height);
      prevCardView.setPosition(layouts.prev.x, layouts.prev.y);
      prevCardView.container.alpha = layouts.prev.alpha;
    }

    if (currentCardView) {
      currentCardView.setSize(layouts.current.width, layouts.current.height);
      currentCardView.setPosition(layouts.current.x, layouts.current.y);
      currentCardView.container.alpha = layouts.current.alpha;
    }

    if (nextCardView) {
      nextCardView.setSize(layouts.next.width, layouts.next.height);
      nextCardView.setPosition(layouts.next.x, layouts.next.y);
      nextCardView.container.alpha = layouts.next.alpha;
    }

    this.layoutCardButton();
    this.loadingText.x = layouts.current.x
    this.loadingText.y = layouts.current.y
  }

  private renderSwipeProgress(progress: number) {
    const prevCardView = this.getPrevCardView();
    const currentCardView = this.getCurrentCardView();
    const nextCardView = this.getNextCardView();
    if (!currentCardView) return;

    const layouts = this.getCardLayouts();
    const amount = Math.min(Math.abs(progress), 1);

    if (progress < 0) {
      if (prevCardView) {
        this.applyAnimatedLayout(prevCardView, layouts.prev, layouts.offLeft, amount);
        prevCardView.container.zIndex = 500;
      }
      this.applyAnimatedLayout(currentCardView, layouts.current, layouts.prev, amount);
      if (nextCardView) {
        this.applyAnimatedLayout(nextCardView, layouts.next, layouts.current, amount);
        nextCardView.container.zIndex = 1000;
      }
      currentCardView.container.zIndex = 700;
    } else if (progress > 0) {
      if (prevCardView) {
        this.applyAnimatedLayout(prevCardView, layouts.prev, layouts.current, amount);
        prevCardView.container.zIndex = 1000;
      }
      this.applyAnimatedLayout(currentCardView, layouts.current, layouts.next, amount);
      if (nextCardView) {
        this.applyAnimatedLayout(nextCardView, layouts.next, layouts.offRight, amount);
        nextCardView.container.zIndex = 500;
      }
      currentCardView.container.zIndex = 700;
    } else {
      this.layoutCards();
      return;
    }

    this.cardNextButton.zIndex = 3000;
    this.cardBackButton.zIndex = 3000;
    this.titleText.zIndex = 4500;
    this.uprightText.zIndex = 4500;
    this.reversedText.zIndex = 4500;
  }

  private async animateDragRelease(target: number) {
    const start = this.dragProgress;
    const delta = target - start;
    if (Math.abs(delta) < 0.001) {
      this.dragProgress = target;
      this.renderSwipeProgress(target);
      return;
    }

    const duration = Math.max(120, 220 * Math.min(Math.abs(delta), 1));
    await new Promise<void>((resolve) => {
      const startedAt = performance.now();
      const tick = () => {
        const raw = Math.min((performance.now() - startedAt) / duration, 1);
        const eased = this.easeOutCubic(raw);
        this.dragProgress = start + delta * eased;
        this.renderSwipeProgress(this.dragProgress);

        if (raw < 1) {
          requestAnimationFrame(tick);
        } else {
          this.dragProgress = target;
          resolve();
        }
      };

      requestAnimationFrame(tick);
    });
  }

  private async finishSwipe(direction: "next" | "back", skipCount: number) {
    const target = direction === "next" ? -1 : 1;
    await this.animateDragRelease(target);
    this.dragProgress = 0;

    if (direction === "next" && this.deckIndex < this.deck.length - 1) {
      this.deckIndex++;
    } else if (direction === "back" && this.deckIndex > 0) {
      this.deckIndex--;
    }

    await this.refreshVisibleCards();
    this.refreshCardButtons();

    console.log(skipCount);
    //const extraSteps = Math.min(
    //  skipCount - 1,
    //  direction === "next"
    //    ? this.deck.length - 1 - this.deckIndex
    //    : this.deckIndex,
    //);

    //for (let i = 0; i < extraSteps; i++) {
    //  await this.slideTo(direction);
    //}
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
    const duration = 60;

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
      const prevCardView = this.getPrevCardView();
      const currentCardView = this.getCurrentCardView();
      const nextCardView = this.getNextCardView();

      if (prevCardView) this.applyAnimatedLayout(prevCardView, from.prev, to.prev, t);
      if (currentCardView) this.applyAnimatedLayout(currentCardView, from.current, to.current, t);
      if (nextCardView) this.applyAnimatedLayout(nextCardView, from.next, to.next, t);

      if (currentCardView) currentCardView.container.zIndex = 500;
      if (prevCardView) prevCardView.container.zIndex = 500;
      if (nextCardView) nextCardView.container.zIndex = 1000;
      this.cardNextButton.zIndex = 3000;
      this.cardBackButton.zIndex = 3000;
      if (raw < 1) {
        requestAnimationFrame(tick);
      } else {
        if (currentCardView) currentCardView.container.zIndex = 1000;
        if (prevCardView) prevCardView.container.zIndex = 500;
        if (nextCardView) nextCardView.container.zIndex = 500;
        resolve();
      }
        //this.keywordsBg.zIndex = 4500
        this.titleText.zIndex = 4500
        this.uprightText.zIndex = 4500
        this.reversedText.zIndex = 4500
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

    drawElementMark({elementMark: this.elementMark, element: text.element});
 
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
      })
      this.uprightText.style = new TextStyle({
        fill: 0xffffff,
        fontSize: 10,
      })
    }
    if (this.game.getLanguage() === "ja") {
      this.titleText.text = text.titleJa;
      this.uprightText.text = "" +
        text.upright.keywordsJa.map((v) => `#${v}`).join("  ");
      this.reversedText.text = "" +
        text.revered.keywordsJa.map((v) => `#${v}`).join("  ")
      //text.keywordsJa.map((v) => `#${v}`).join("  ");
    } else {
      this.titleText.text = text.titleEn;
      this.uprightText.text = "" +
        text.upright.keywordsEn.map((v) => `#${v}`).join("  ");
      this.reversedText.text = "" +
        text.revered.keywordsEn.map((v) => `#${v}`).join("  ")
    }

    this.refreshKeywordsBg();
  }

  private refreshKeywordsBg() {
    const layout = this.getCardLayouts();
    const paddingX = 16;
    const paddingY = 10;
    const radius = 14;

    const w1 = this.uprightText.width + paddingX * 2;
    const h1 = this.uprightText.height + paddingY * 2 * 3;
    const w2 = this.reversedText.width + paddingX * 2;
    const h2 = this.reversedText.height + paddingY * 2 * 3;
    const w = Math.max(w1, w2, layout.current.width); 
    const h = Math.max(h1, h2); 
    this.keywordsBg.clear();
    this.keywordsBg.roundRect(-w / 2, -h / 2, w, h, radius);
    this.keywordsBg.fill({ color: 0x000000, alpha: 0.45 });
  }
}
