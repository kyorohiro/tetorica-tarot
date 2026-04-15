import type { Container } from "pixi.js";

export interface Scene {
  container: Container;
  mount(): void;
  unmount(): void;
  resize(width: number, height: number): void;
}