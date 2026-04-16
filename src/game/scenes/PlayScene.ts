import { Graphics, Container, Sprite, Text, TextStyle, Texture } from "pixi.js";
import type { Scene } from "../core/Scene";
import type { GameApp } from "../GameApp";
import { makeButton } from "../ui/makeButton";
import { TarotCardView } from "./TarotCardView";

import backCardUrl from "../../assets/CardBacks.jpg";
import { majorArcanaCards } from "../tarot/majorArcana";

const cardModules = import.meta.glob("../../assets/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const frontCards = Object.entries(cardModules)
  .filter(([path]) => {
    return (
      !path.endsWith("/CardBacks.jpg") &&
      !path.endsWith("/00-TheFool copy.jpg")
    );
  })
  .map(([path, url]) => {
    const id = path.split("/").pop()?.replace(".jpg", "") ?? "Unknown";
    return {
      path,
      url,
      id,
    };
  });

export class PlayScene implements Scene {
  container = new Container();

  private readonly bg = new Sprite(Texture.WHITE);
  private readonly card = new TarotCardView();
  private currentCardId: string | null = null;
  private currentReversed = false;

  private readonly backButton = makeButton(
    "",
    () => {
      //this.game.playClick();
      this.game.showTitleScene();
    },
    180,
    52,
  );

  private width = 0;
  private height = 0;

  private readonly keywordsBg = new Graphics();

  private readonly titleText = new Text({
    text: "",
    style: new TextStyle({
      fill: 0xffffff,
      fontSize: 24,
      fontWeight: "bold",
    }),
  });

  private readonly keywordsText = new Text({
    text: "",
    style: new TextStyle({
      fill: 0xe5e7eb,
      fontSize: 18,
    }),
  });

  constructor(private readonly game: GameApp) {
    console.log("> constructor");
    this.bg.tint = 0x111827;

    this.card.onTap(async () => {
      //this.game.playClick();

      if (this.card.showingFront) {
        await this.card.flip();
        return;
      }

      //const next = this.pickRandomCard();
      //const reversed = Math.random() < 0.5;
      //
      //this.currentCardId = next.id;
      //this.currentReversed = reversed;
      //this.refreshCardText();
      //
      //await this.card.setFrontTexture(next.url);
      //this.card.setReversed(reversed);
      //this.card.showBack();
      await this.card.flip();
    });

    this.refreshText();

    //this.container.addChild(this.bg, this.card.container, this.backButton);
    this.container.addChild(
      this.bg,
      this.card.container,
      this.keywordsBg,
      this.titleText,
      this.keywordsText,
      this.backButton,
    );
  }

  private refreshText() {
    this.backButton.setLabel(this.game.t("backToTitle"));
  }


  private pickRandomCard() {
    return frontCards[Math.floor(Math.random() * frontCards.length)];
  }

  async mount() {
    console.log("> mount");
    if (this.currentCardId == undefined || this.currentCardId == null) {
      const first = this.pickRandomCard();

      this.currentCardId = first.id;
      this.currentReversed = Math.random() < 0.5;

      await this.card.setTextures(first.url, backCardUrl);
    }
    this.card.setReversed(this.currentReversed);
    this.card.showFront();

    this.layoutCard();
    this.refreshCardText();
  }

  unmount() {
    //this.container.destroy({ children: true });
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.bg.width = width;
    this.bg.height = height;

    this.backButton.x = 110;
    this.backButton.y = 42;

    this.layoutCard();

    this.titleText.anchor.set(0.5, 0);
    this.keywordsText.anchor.set(0.5, 0);

    this.titleText.x = width * 0.5;
    this.titleText.y = height * 0.83;

    this.keywordsText.x = width * 0.5;
    this.keywordsText.y = height * 0.88;
    //
    //
    this.keywordsBg.x = width * 0.5;
    this.keywordsBg.y = height * 0.88;

    this.keywordsText.anchor.set(0.5);
    this.keywordsText.x = width * 0.5;
    this.keywordsText.y = height * 0.88;
  }


  private layoutCard() {
    if (!this.width || !this.height) return;

    let cardWidth;
    let cardHeight;
    if (this.width * 1.7 > this.height) {
      cardHeight = this.height * 0.7;
      cardWidth = cardHeight / 1.7
    } else {
      cardWidth = this.width * 0.7;
      cardHeight = cardWidth * 1.7;
    }
    this.card.setSize(cardWidth, cardHeight);
    this.card.setPosition(this.width * 0.5, this.height * 0.55);
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
      return;
    }

    //this.keywordsText.text = text.keywordsJa.join(" / ");
    if (this.game.getLanguage() == "ja") {
      this.titleText.text = `${text.titleJa}`;
      this.keywordsText.text = text.keywordsJa.map((v) => `#${v}`).join("  ");
    } else {
      this.titleText.text = `${text.titleEn}`;
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