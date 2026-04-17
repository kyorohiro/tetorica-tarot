export type TarotCard = {
  path: string;
  url: string;
  id: string;
  reversed: boolean,
};

const cardModules = import.meta.glob("../../assets/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const tarotCards: TarotCard[] = Object.entries(cardModules)
  .filter(([path]) => !path.endsWith("/CardBacks.jpg"))
  .map(([path, url]) => {
    const id = path.split("/").pop()?.replace(".jpg", "") ?? "Unknown";
    return {
      path,
      url,
      id,
      reversed: Math.random() < 0.45
    };
  });

function sortCards(cards: TarotCard[]): TarotCard[] {
  return [...cards].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true })
  );
}

function shuffleCards(cards: TarotCard[]): TarotCard[] {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export { tarotCards, sortCards, shuffleCards };