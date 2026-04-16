import { Container, Sprite, Graphics, Text, Texture } from "pixi.js";


type PixiButton = Container & {
  setLabel: (next: string) => void;
  buttonWidth: number;
  buttonHeight: number;
};

export function makeButton(
  label: string,
  onClick: () => void,
  width = 220,
  height = 64,
): PixiButton {
  const root = new Container() as PixiButton;

  const bg = new Graphics();
  const radius = 18;

  const drawBg = (hover: boolean) => {
    bg.clear();

    bg.roundRect(-width / 2, -height / 2, width, height, radius);
    bg.fill({
      color: hover ? 0x475569 : 0x334155, // 少し青みのあるグレー
      alpha: hover ? 0.72 : 0.6,
    });

    bg.roundRect(-width / 2, -height / 2, width, height, radius);
    bg.stroke({
      color: 0xffffff,
      alpha: 0.8,
      width: 2,
    });
  };

  drawBg(false);

  bg.eventMode = "static";
  bg.cursor = "pointer";

  const text = new Text({
    text: label,
    style: {
      fill: 0xffffff,
      fontSize: 24,
      fontWeight: "700",
    },
  });
  text.anchor.set(0.5);

  bg.on("pointertap", () => onClick());
  bg.on("pointerover", () => {
    drawBg(true);
  });
  bg.on("pointerout", () => {
    drawBg(false);
  });

  root.addChild(bg, text);

  root.setLabel = (next: string) => {
    text.text = next;
  };
  root.buttonWidth = width;
  root.buttonHeight = height;

  return root;
}