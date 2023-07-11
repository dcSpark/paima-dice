import { RoundKind } from '@dice/utils';
import type { MatchEnvironment, MatchState, UserLobby, DiceRolls } from '@dice/utils';
import type { ConciseResult, MatchResult } from '@dice/utils';
import type { IGetBlockHeightResult } from 'paima-sdk/paima-db';
import Prando from 'paima-sdk/paima-prando';

/**
 * This function is mostly just a reminder that we seed Prando
 * from block_heights rows (same as stf, but we also need to do it on frontend).
 */
export function buildPrando(block: IGetBlockHeightResult): Prando {
  return new Prando(block.seed);
}

export function genDieRoll(randomnessGenerator: Prando): number {
  return randomnessGenerator.nextInt(1, 6);
}

export function genInitialDiceRolls(randomnessGenerator: Prando): {
  dice: [number, number][];
  finalScore: number;
} {
  const result: {
    dice: [number, number][];
    finalScore: number;
  } = {
    dice: [],
    finalScore: 0,
  };
  while (result.finalScore < 16) {
    const dice: [number, number] = [
      genDieRoll(randomnessGenerator),
      genDieRoll(randomnessGenerator),
    ];
    const sum = dice.reduce((acc, next) => acc + next, 0);
    result.dice.push(dice);
    result.finalScore += sum;
  }

  return result;
}

export function genDiceRolls(startingScore: number, randomnessGenerator: Prando): DiceRolls {
  if (startingScore < 16)
    return {
      roundKind: RoundKind.initial,
      ...genInitialDiceRolls(randomnessGenerator),
    };

  const extraDie = genDieRoll(randomnessGenerator);
  return {
    roundKind: RoundKind.extra,
    die: extraDie,
    finalScore: startingScore + extraDie,
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

  const score = getPlayerScore(matchState);
  if (score < 16) return genInitialDiceRolls(randomnessGenerator).finalScore <= 21;

  return score + genDieRoll(randomnessGenerator) <= 21;
}

export function isPlayersTurn(nftId: number, lobby: UserLobby) {
  // Note: match starts at round 1, because we use persistNewRound to start it
  const isWhiteTurn = lobby.current_round % 2 === 1;
  const isCreator = lobby.lobby_creator === nftId;
  const isWhite = isCreator === lobby.player_one_iswhite;
  return isWhite === isWhiteTurn;
}

export function matchResults(
  matchState: MatchState,
  matchEnvironment: MatchEnvironment
): MatchResult {
  // TODO: allow for more than 2 players

  // We compute the winner
  const user1won = matchState.player1Points > matchState.player2Points;
  const user2won = matchState.player2Points > matchState.player1Points;
  // Assign the winner to a variable called winner. If no one won, winner is null
  const winner = user1won
    ? matchEnvironment.user1.nftId
    : user2won
    ? matchEnvironment.user2.nftId
    : null;

  console.log(`${winner} won match.`);

  const results: [ConciseResult, ConciseResult] = !winner
    ? ['t', 't']
    : winner === matchEnvironment.user1.nftId
    ? ['w', 'l']
    : ['l', 'w'];

  return results;
}

export function buildCurrentMatchState(lobby: UserLobby): MatchState {
  return {
    player1Points: lobby.player_one_points,
    player2Points: lobby.player_two_points,
    player1Score: lobby.player_one_score,
    player2Score: lobby.player_two_score,
    turn: lobby.turn,
  };
}

export function getPlayerScore(matchState: MatchState): number {
  return matchState.turn === 1 ? matchState.player1Score : matchState.player2Score;
}
