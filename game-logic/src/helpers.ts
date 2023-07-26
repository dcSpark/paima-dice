import type Prando from 'paima-sdk/paima-prando';
import type {
  BoardCard,
  HandCard,
  LocalCard,
  Move,
  SerializedBoardCard,
  SerializedHandCard,
  SerializedLocalCard,
  SerializedMove,
} from './types';
import { DECK_LENGTH, MOVE_KIND } from './constants';

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

export function initialCurrentDeck(): number[] {
  return Array.from(Array(DECK_LENGTH).keys());
}

export function genBotDeck(): number[] {
  return initialCurrentDeck().map(() => {
    // TODO: select from existing cards
    return Math.floor(Math.random() * 3);
  });
}

/**
 * Structs in db throw errors when compiling, we have to serialize them.
 * Note: arrays are ok.
 */
const dbStructPropDelimiter = '+';

export function serializeHandCard(card: HandCard): SerializedHandCard {
  return [card.index.toString(), card.draw.toString()].join(dbStructPropDelimiter);
}

export function deserializeHandCard(card: SerializedHandCard): HandCard {
  const props = card.split(dbStructPropDelimiter);
  return {
    index: Number.parseInt(props[0]),
    draw: Number.parseInt(props[1]),
  };
}

export function serializeBoardCard(card: BoardCard): SerializedBoardCard {
  return [card.index.toString(), card.cardId.toString()].join(dbStructPropDelimiter);
}

export function deserializeBoardCard(card: SerializedBoardCard): BoardCard {
  const props = card.split(dbStructPropDelimiter);
  return {
    index: Number.parseInt(props[0]),
    cardId: Number.parseInt(props[1]),
  };
}

export function serializeLocalCard(card: LocalCard): SerializedLocalCard {
  return [card.cardId.toString(), card.salt].join(dbStructPropDelimiter);
}

export function deserializeLocalCard(card: SerializedLocalCard): LocalCard {
  const props = card.split(dbStructPropDelimiter);
  return {
    cardId: Number.parseInt(props[0]),
    salt: props[1],
  };
}

export function serializeMove(move: Move): SerializedMove {
  const props: String[] = [move.kind];

  if (move.kind === MOVE_KIND.playCard) {
    props.push(move.handPosition.toString());
    props.push(move.cardIndex.toString());
    props.push(move.cardId.toString());
    props.push(move.salt);
  }

  return props.join(dbStructPropDelimiter);
}

export function deserializeMove(move: SerializedMove): Move {
  const parts = move.split(dbStructPropDelimiter);

  if (parts[0] === MOVE_KIND.playCard) {
    return {
      kind: parts[0],
      handPosition: Number.parseInt(parts[1]),
      cardIndex: Number.parseInt(parts[2]),
      cardId: Number.parseInt(parts[3]),
      salt: parts[4],
    };
  }

  if (parts[0] === MOVE_KIND.endTurn || parts[0] === MOVE_KIND.drawCard) {
    return {
      kind: parts[0],
    };
  }

  throw new Error(`deserializeMove: unknown kind`);
}
