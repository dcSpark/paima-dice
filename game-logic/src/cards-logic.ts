import type { CardId, Deck } from '@dice/utils';
import Prando from 'paima-sdk/paima-prando';

export function genCardDraw(
  currentDraw: number,
  currentDeck: Deck,
  randomnessGenerator: Prando
): {
  cardNumber: number;
  card: CardId;
  newDeck: Deck;
} {
  const seed = `${randomnessGenerator.seed}|drawCard|${currentDraw}`;
  const prando = new Prando(seed);
  const cardNumber = prando.nextInt(0, currentDeck.length - 1);
  return {
    cardNumber,
    card: currentDeck[cardNumber],
    newDeck: [...currentDeck.slice(0, cardNumber), ...currentDeck.slice(cardNumber + 1)],
  };
}
