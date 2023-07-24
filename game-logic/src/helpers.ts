import type Prando from 'paima-sdk/paima-prando';
import type {
  CardId,
  Deck,
  Hand,
  HandCard,
  SerializedCard,
  SerializedDeck,
  SerializedHand,
  SerializedHandCard,
} from './types';
import { DECK_SIZE } from './constants';

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
  if (deck === '') return [];
  return deck.split(deckCardDelimiter).map(deserializeCard);
}

export function genBotDeck(): Deck {
  return Array.from(Array(DECK_SIZE).keys()).map(() => {
    // TODO: select from existing cards
    return Math.floor(Math.random() * 3);
  });
}

const handCardDelimiter = deckCardDelimiter;
const handCardPropDelimiter = '-';

export function serializeHandCard(card: HandCard): SerializedHandCard {
  return [card.cardId?.toString() ?? '', card.draw.toString()].join(handCardPropDelimiter);
}

export function serializeHand(hand: Hand): SerializedHand {
  return hand.map(serializeHandCard).join(handCardDelimiter);
}

export function deserializeHandCard(card: SerializedHandCard): HandCard {
  const [rawCardId, rawDraw] = card.split(handCardPropDelimiter);
  return {
    cardId: rawCardId === '' ? undefined : Number.parseInt(rawCardId),
    draw: Number.parseInt(rawDraw),
  };
}

export function deserializeHand(hand: SerializedHand): Hand {
  if (hand === '') return [];
  return hand.split(handCardDelimiter).map(deserializeHandCard);
}
