import { Container, Sprite, Text, Texture } from "pixi.js";
import type { Scene } from "../core/Scene";
import type { GameApp } from "../GameApp";
import { makeButton } from "../ui/makeButton";

import { Sun } from "./TitleSun";

export class TitleScene implements Scene {
  container = new Container();

  private readonly bg = new Sprite(Texture.WHITE);
  private readonly sun = new Sun();

  private readonly title = new Text({
    text: "",
    style: {
      fill: 0xffffee,
      fontSize: 42,
      fontWeight: "700",
      stroke: {
        color: 0x333300,
        width: 2,
      },
    },
  });

  private readonly subtitle = new Text({
    text: "",
    style: {
      fill: 0x78a8bf,//0xcbd5e1,
      fontSize: 18,
    },
  });

  private readonly startButton = makeButton("", () => {
    //this.game.playClick();

    //this.game.showPlayScene({ forceUpdate: true, isShuffleCards: true });
    this.game.setCurrentScene("play");
  });

  constructor(private readonly game: GameApp) {
    this.bg.tint = 0xf5d95a;//0xe5c94a;//0xf5d95a;//0x0f172a;
    this.bg.anchor.set(0);
    this.title.anchor.set(0.5);
    this.subtitle.anchor.set(0.5);

    //
    const w = this.game.getApp().screen.width;
    const h = this.game.getApp().screen.height;

    this.bg.x = 0;
    this.bg.y = 0;
    this.bg.width = w;
    this.bg.height = h;
    //
    this.refreshText();

    this.container.addChild(
      this.bg,
      this.sun,
      this.title,
      this.subtitle,
      this.startButton,
    );
    //this.sun.load();
    //this.sun.startAnimation();
  }

  private refreshText() {
    this.title.text = this.game.t("gameTitle");
    this.subtitle.text = this.game.t("subtitle");
    this.startButton.setLabel(this.game.t("start"));
  }

  mount() { }

  unmount() {
    this.container.destroy({ children: true });
  }

  resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;

    this.title.x = width / 2;
    this.title.y = height * 0.32;

    this.subtitle.x = width / 2;
    this.subtitle.y = height * 0.42;

    this.startButton.x = width / 2;
    this.startButton.y = height * 0.58;
  }
}