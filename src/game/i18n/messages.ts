export type Lang = "ja" | "en";

const ja = {
  gameTitle: "Tetorica Tarot",
  subtitle: "A creative support tool",
  start: "スタート",
  backToTitle: "タイトルへ",
  score: "スコア",
  hitOrb: "丸をクリック",
};

const en = {
  gameTitle: "Tetorica Tarot",
  subtitle: "A creative support tool",
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