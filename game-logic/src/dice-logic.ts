import seedrandom from 'seedrandom';
import type { MatchEnvironment, MatchState } from './types';
import type { ConciseResult, MatchResult } from '@dice/utils';

export function genDiceRolls(seed: number): [number, number] {
  const rng = seedrandom(seed.toString());
  return [genDiceRoll(rng), genDiceRoll(rng)];
}

function genDiceRoll(rng: seedrandom.PRNG) {
  return Math.floor(rng() * 6) + 1;
}

export function isPoint(dice: [number, number]): boolean {
  return dice[0] + dice[1] >= 7; // TODO
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
