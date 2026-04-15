import { Container, Sprite, Text, Texture } from "pixi.js";
import type { Scene } from "../core/Scene";
import type { GameApp } from "../GameApp";
import { makeButton } from "../ui/makeButton";

export class PlayScene implements Scene {
  container = new Container();

  private readonly bg = new Sprite(Texture.WHITE);
  private readonly orb = new Sprite(Texture.WHITE);

  private readonly scoreLabel = new Text({
    text: "",
    style: {
      fill: 0xffffff,
      fontSize: 28,
      fontWeight: "700",
    },
  });

  private readonly hintLabel = new Text({
    text: "",
    style: {
      fill: 0xcbd5e1,
      fontSize: 18,
    },
  });

  private readonly backButton = makeButton("", () => {
    this.game.playClick();
    this.game.showTitleScene();
  }, 180, 52);

  private score = 0;
  private width = 0;
  private height = 0;

  constructor(private readonly game: GameApp) {
    this.bg.tint = 0x111827;

    this.orb.width = 96;
    this.orb.height = 96;
    this.orb.anchor.set(0.5);
    this.orb.tint = 0xf472b6;
    this.orb.alpha = 0.95;
    this.orb.eventMode = "static";
    this.orb.cursor = "pointer";

    this.scoreLabel.anchor.set(0.5, 0);
    this.hintLabel.anchor.set(0.5, 0);

    this.orb.on("pointertap", () => {
      this.score += 1;
      this.game.playClick();
      this.refreshText();
      this.moveOrbRandomly();
    });

    this.refreshText();

    this.container.addChild(
      this.bg,
      this.scoreLabel,
      this.hintLabel,
      this.orb,
      this.backButton,
    );
  }

  private refreshText() {
    this.scoreLabel.text = `${this.game.t("score")}: ${this.score}`;
    this.hintLabel.text = this.game.t("hitOrb");
    this.backButton.setLabel(this.game.t("backToTitle"));
  }

  private moveOrbRandomly() {
    const margin = 80;
    const x = margin + Math.random() * Math.max(1, this.width - margin * 2);
    const y =
      180 + Math.random() * Math.max(1, this.height - 180 - margin * 2);

    this.orb.x = x;
    this.orb.y = y;
  }

  mount() {
    this.moveOrbRandomly();
  }

  unmount() {
    this.container.destroy({ children: true });
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.bg.width = width;
    this.bg.height = height;

    this.scoreLabel.x = width / 2;
    this.scoreLabel.y = 36;

    this.hintLabel.x = width / 2;
    this.hintLabel.y = 76;

    this.backButton.x = 110;
    this.backButton.y = 42;
  }
}