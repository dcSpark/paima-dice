import type { IGetLobbyPlayersResult } from '@dice/db';
import { RoundKind, deserializeDeck, deserializeHand } from '@dice/utils';
import type {
  MatchState,
  DiceRolls,
  LobbyPlayer,
  LobbyWithStateProps,
  CardDraw,
  Deck,
} from '@dice/utils';
import type { ConciseResult, MatchResult } from '@dice/utils';
import type { IGetBlockHeightResult } from 'paima-sdk/paima-db';
import Prando from 'paima-sdk/paima-prando';
import { genCardDraw } from './cards-logic';

/**
 * This function is mostly just a reminder that we seed Prando
 * from block_heights rows (same as stf, but we also need to do it on frontend).
 */
export function buildPrando(block: IGetBlockHeightResult): Prando {
  return new Prando(block.seed);
}

export function genDieRoll(
  currentDraw: number,
  currentDeck: Deck,
  randomnessGenerator: Prando
): CardDraw {
  const card = genCardDraw(currentDraw, currentDeck, randomnessGenerator);
  return {
    ...card,
    die: randomnessGenerator.nextInt(1, 6),
  };
}

export function genInitialDiceRolls(
  currentDraw: number,
  currentDeck: Deck,
  randomnessGenerator: Prando
): {
  dice: [CardDraw, CardDraw][];
  finalScore: number;
} {
  const result: {
    dice: [CardDraw, CardDraw][];
    finalScore: number;
  } = {
    dice: [],
    finalScore: 0,
  };
  let currentDraw_ = currentDraw;
  let currentDeck_ = currentDeck;
  while (result.finalScore < 16) {
    const draw1 = genDieRoll(currentDraw_, currentDeck_, randomnessGenerator);
    const draw2 = genDieRoll(currentDraw_ + 1, draw1.newDeck, randomnessGenerator);

    currentDraw_ += 2;
    currentDeck_ = draw2.newDeck;

    const dice: [CardDraw, CardDraw] = [draw1, draw2];
    const sum = dice.reduce((acc, next) => acc + next.die, 0);
    result.dice.push(dice);
    result.finalScore += sum;
  }

  return result;
}

export function genDiceRolls(
  startingScore: number,
  currentDraw: number,
  currentDeck: Deck,
  randomnessGenerator: Prando
): DiceRolls {
  if (startingScore < 16)
    return {
      roundKind: RoundKind.initial,
      ...genInitialDiceRolls(currentDraw, currentDeck, randomnessGenerator),
    };

  const extraDie = genDieRoll(currentDraw, currentDeck, randomnessGenerator);
  return {
    roundKind: RoundKind.extra,
    dice: [[extraDie]],
    finalScore: startingScore + extraDie.die,
  };
}

export function canRollAgain(dice: [number, number]): boolean {
  return dice[0] + dice[1] >= 7; // TODO: update to blackjack dice logic
}

export function isValidMove(
  randomnessGenerator: Prando,
  matchState: MatchState,
  rollAgain: boolean
): boolean {
  if (!rollAgain) return true;

  const player = getTurnPlayer(matchState);
  if (player.score < 16)
    return (
      genInitialDiceRolls(player.currentDraw, player.currentDeck, randomnessGenerator).finalScore <=
      21
    );

  return (
    player.score + genDieRoll(player.currentDraw, player.currentDeck, randomnessGenerator).die <= 21
  );
}

export function matchResults(matchState: MatchState): MatchResult {
  // We compute the winner
  const maxPoints = matchState.players.reduce((acc, next) => Math.max(acc, next.points), 0);
  const maxPlayers = matchState.players.filter(player => player.points === maxPoints);
  const results: ConciseResult[] = matchState.players.map(player => {
    if (player.points < maxPoints) return 'l';
    if (maxPlayers.length > 1) return 't';
    return 'w';
  });

  return results;
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
    result: undefined,
  };
}

export function cloneMatchState(template: MatchState): MatchState {
  return {
    ...template,
    players: template.players.map(template => ({
      ...template,
      startingDeck: [...template.startingDeck],
      currentDeck: [...template.currentDeck],
      currentHand: template.currentHand.map(template => ({
        ...template,
      })),
    })),
  };
}

export function getPlayerScore(matchState: MatchState): number {
  const turnPlayer = getTurnPlayer(matchState);
  return turnPlayer.score;
}

export function getTurnPlayer(matchState: MatchState): LobbyPlayer {
  const turnPlayer = matchState.players.find(player => player.turn === matchState.turn);
  if (turnPlayer == null) throw new Error(`getTurnPlayer: missing player for turn`);
  return turnPlayer;
}
