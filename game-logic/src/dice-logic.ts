import type { MatchEnvironment, MatchState } from './types';
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

export function genDiceRolls(randomnessGenerator: Prando): [number, number] {
  return [randomnessGenerator.nextInt(1, 6), randomnessGenerator.nextInt(1, 6)];
}

export function isPoint(dice: [number, number]): boolean {
  return dice[0] + dice[1] >= 7; // TODO
}

export function isValidMove(randomnessGenerator: Prando, point: boolean): boolean {
  const dice = genDiceRolls(randomnessGenerator);
  return isPoint(dice) === point;
}

export function matchResults(
  matchState: MatchState,
  matchEnvironment: MatchEnvironment
): MatchResult {
  // We compute the winner
  const user1won = matchState.player1Points > matchState.player2Points;
  const user2won = matchState.player2Points > matchState.player1Points;
  // Assign the winner to a variable called winner. If no one won, winner is null
  const winner = user1won
    ? matchEnvironment.user1.wallet
    : user2won
    ? matchEnvironment.user2.wallet
    : null;

  console.log(`${winner} won match.`);

  const results: [ConciseResult, ConciseResult] = !winner
    ? ['t', 't']
    : winner === matchEnvironment.user1.wallet
    ? ['w', 'l']
    : ['l', 'w'];

  return results;
}
