import type { CardDraw, Deck } from '@dice/utils';
import Prando from 'paima-sdk/paima-prando';

export function genCardDraw(
  currentDraw: number,
  currentDeck: Deck,
  randomnessGenerator: Prando
): Omit<CardDraw, 'die'> {
  const seed = `${randomnessGenerator.seed}|drawCard|${currentDraw}`;
  const prando = new Prando(seed);
  const cardNumber = prando.nextInt(0, currentDeck.length - 1);
  return {
    cardNumber,
    card: { cardId: currentDeck[cardNumber], draw: currentDraw },
    newDeck: [...currentDeck.slice(0, cardNumber), ...currentDeck.slice(cardNumber + 1)],
  };
}
