import type Prando from 'paima-sdk/paima-prando';
import type { CardId, Deck, SerializedCard, SerializedDeck } from './types';
import { DECK_SIZE } from '.';

/**
 * Generate Fisher-Yates shuffle of range 0 to size.
 */
export function genPermutation(size: number, randomnessGenerator: Prando): number[] {
  const result = Array.from(Array(size).keys());

  for (const i of Array.from(Array(size).keys())) {
    const currentIndex = size - 1 - i;
    const resultIndex = randomnessGenerator.nextInt(0, i);

    [result[currentIndex], result[resultIndex]] = [result[resultIndex], result[currentIndex]];
  }
  return result;
}

/* TODO: can't find the restricted characters at the moment. I'm sure '+' is ok, but it looks stupid. */
const deckCardDelimiter = '+';

export function serializeCard(card: CardId): SerializedCard {
  return card.toString();
}

export function serializeDeck(deck: Deck): SerializedDeck {
  return deck.map(serializeCard).join(deckCardDelimiter);
}

export function deserializeCard(card: SerializedCard): CardId {
  return Number.parseInt(card);
}

export function deserializeDeck(deck: SerializedDeck): Deck {
  return deck.split(deckCardDelimiter).map(deserializeCard);
}

export function genBotDeck(): Deck {
  return Array.from(Array(DECK_SIZE).keys()).map(() => {
    // TODO: select from existing cards
    return Math.floor(Math.random() * 3);
  });
}
