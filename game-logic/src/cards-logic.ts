import type { IGetLobbyPlayersResult } from '@dice/db';
import type {
  CardDraw,
  Deck,
  LobbyPlayer,
  LobbyWithStateProps,
  MatchState,
  PostTxTickEvent,
} from './types';
import Prando from 'paima-sdk/paima-prando';
import { deserializeDeck, deserializeHand, deserializeMove } from './helpers';
import { MOVE_KIND, TICK_EVENT_KIND } from './constants';
import { getTurnPlayer } from './dice-logic';

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

export function buildCurrentMatchState(
  lobby: LobbyWithStateProps,
  rawPlayers: IGetLobbyPlayersResult[]
): MatchState {
  const players: LobbyPlayer[] = rawPlayers.map(player => {
    if (player.turn == null) throw new Error(`buildCurrentMatchState: player's turn is null`);

    return {
      nftId: player.nft_id,
      startingDeck: deserializeDeck(player.starting_deck),
      currentDeck: deserializeDeck(player.current_deck),
      currentHand: deserializeHand(player.current_hand),
      currentDraw: player.current_draw,
      turn: player.turn,
      points: player.points,
      score: player.score,
    };
  });

  return {
    players,
    properRound: lobby.current_proper_round,
    turn: lobby.current_turn,
    txEventMove:
      lobby.current_tx_event_move == null
        ? undefined
        : deserializeMove(lobby.current_tx_event_move),
    result: undefined,
  };
}

export function genPostTxEvents(
  matchState: MatchState,
  randomnessGenerator: Prando
): PostTxTickEvent[] {
  const player = getTurnPlayer(matchState);
  const currentDraw = player.currentDraw;
  const currentDeck = player.currentDeck;
  if (matchState.txEventMove?.kind === MOVE_KIND.drawCard) {
    return [
      {
        kind: TICK_EVENT_KIND.postTx,
        draw: genCardDraw(currentDraw, currentDeck, randomnessGenerator),
      },
    ];
  }

  return [];
}
