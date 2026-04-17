import { Graphics } from "pixi.js";

function createTriangleButton(direction: "left" | "right", size = 24, color = 0xffffff) {
  const g = new Graphics();

  // 透明な当たり判定
  g.beginFill(0xffffff, 0.001);
  g.drawRect(-16, -16, size + 32, size + 32);
  g.endFill();

  // 三角形
  g.beginFill(color);
  if (direction === "right") {
    g.moveTo(0, 0);
    g.lineTo(size, size / 2);
    g.lineTo(0, size);
  } else {
    g.moveTo(size, 0);
    g.lineTo(0, size / 2);
    g.lineTo(size, size);
  }
  g.closePath();
  g.endFill();

  g.eventMode = "static";
  g.cursor = "pointer";

  return g;
}

export {
    createTriangleButton
}