import type { MatchExecutor, RoundExecutor } from 'paima-sdk/paima-executors';
import { matchExecutor } from 'paima-sdk/paima-executors';
import Prando from 'paima-sdk/paima-prando';

import type { MatchState, TickEvent } from '@dice/game-logic';
import { extractMatchEnvironment, initRoundExecutor, processTick } from '@dice/game-logic';
import type { MatchExecutorData, RoundExecutorData } from '@dice/utils';

export function buildRoundExecutor(data: RoundExecutorData): RoundExecutor<MatchState, TickEvent> {
  const seed = data.seed;
  console.log(seed, 'seed used for the round executor at the middleware');
  const randomnessGenerator = new Prando(seed);
  const matchState: MatchState = {
    player1Points: data.lobby.player_one_points,
    player2Points: data.lobby.player_two_points,
  };
  return initRoundExecutor(data.lobby, matchState, data.moves, randomnessGenerator);
}

export function buildMatchExecutor({
  lobby,
  moves,
  seeds,
}: MatchExecutorData): MatchExecutor<MatchState, TickEvent> {
  console.log(seeds, 'seeds used for the match executor at the middleware');

  const initialState: MatchState = {
    player1Points: 0,
    player2Points: 0,
  };
  return matchExecutor.initialize(
    extractMatchEnvironment(lobby),
    lobby.num_of_rounds,
    initialState,
    seeds,
    moves,
    processTick
  );
}
