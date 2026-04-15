export type Lang = "ja" | "en";

const ja = {
  gameTitle: "はじめての Pixi ゲーム",
  subtitle: "Tauri / React / Tailwind / PixiJS",
  start: "スタート",
  backToTitle: "タイトルへ",
  score: "スコア",
  hitOrb: "丸をクリック",
};

const en = {
  gameTitle: "My First Pixi Game",
  subtitle: "Tauri / React / Tailwind / PixiJS",
  start: "Start",
  backToTitle: "Back to Title",
  score: "Score",
  hitOrb: "Click the orb",
};

export type MessageKey = keyof typeof ja;

const messages: Record<Lang, Record<MessageKey, string>> = {
  ja,
  en,
};

export function t(lang: Lang, key: MessageKey): string {
  return messages[lang][key];
}