import { Container, Sprite, Text, Texture } from "pixi.js";

export type PixiButton = Container & {
  setLabel: (text: string) => void;
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

  const bg = new Sprite(Texture.WHITE);
  bg.width = width;
  bg.height = height;
  bg.anchor.set(0.5);
  bg.tint = 0x2563eb;
  bg.alpha = 0.95;
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
    bg.tint = 0x3b82f6;
  });
  bg.on("pointerout", () => {
    bg.tint = 0x2563eb;
  });

  root.addChild(bg, text);
  root.setLabel = (next: string) => {
    text.text = next;
  };
  root.buttonWidth = width;
  root.buttonHeight = height;

  return root;
}