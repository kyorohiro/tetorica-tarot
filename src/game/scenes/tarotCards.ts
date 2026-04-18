import { majorArcanaCards } from "../tarot/majorArcana";

export type TarotCard = {
  path: string;
  url: string;
  id: string;
  reversed: boolean,
};

type MajorArcanaKey = keyof typeof majorArcanaCards;


const tarotCards: TarotCard[] = Object.entries(majorArcanaCards).map(
  ([id, _]) => ({
    id: id as MajorArcanaKey,
    path: id,
    url: `./assets/${id}.jpg`,
    reversed: Math.random() < 0.45
  })
);
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