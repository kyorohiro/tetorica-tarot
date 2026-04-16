import { Container, Sprite, Texture } from "pixi.js";
import type { Scene } from "../core/Scene";
import type { GameApp } from "../GameApp";
import { makeButton } from "../ui/makeButton";
import { TarotCardView } from "./TarotCardView";

import backCardUrl from "../../assets/CardBacks.jpg";

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
  .map(([path, url]) => ({
    path,
    url,
    name: path.split("/").pop()?.replace(".jpg", "") ?? "Unknown",
  }));

export class PlayScene implements Scene {
  container = new Container();

  private readonly bg = new Sprite(Texture.WHITE);
  private readonly card = new TarotCardView();

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

  constructor(private readonly game: GameApp) {
    this.bg.tint = 0x111827;

    this.card.onTap(async () => {
      this.game.playClick();

      // 表 → 裏
      if (this.card.showingFront) {
        await this.card.flip();
        return;
      }

      // 裏 → 次カードを仕込んで表へ
      const next = this.pickRandomCard();
      await this.card.setFrontTexture(next.url);
      this.card.setReversed(Math.random() < 0.5);
      this.card.showBack();
      await this.card.flip();
    });

    this.refreshText();

    this.container.addChild(this.bg, this.card.container, this.backButton);
  }

  private refreshText() {
    this.backButton.setLabel(this.game.t("backToTitle"));
  }

  private pickRandomCard() {
    return frontCards[Math.floor(Math.random() * frontCards.length)];
  }

  async mount() {
    const first = this.pickRandomCard();

    await this.card.setTextures(first.url, backCardUrl);
    this.card.setReversed(Math.random() < 0.5);
    this.card.showFront();

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

    let cardWidth; 
    let cardHeight;
    if(this.width*1.7 > this.height) {
      cardHeight = this.height * 0.7;
      cardWidth = cardHeight/1.7
    } else {
      cardWidth = this.width * 0.7; 
      cardHeight = cardWidth * 1.7;
    }
    this.card.setSize(cardWidth, cardHeight);
    this.card.setPosition(this.width * 0.5, this.height * 0.55);
  }
}