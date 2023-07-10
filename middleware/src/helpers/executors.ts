import type { MatchExecutor, RoundExecutor } from 'paima-sdk/paima-executors';
import { matchExecutor } from 'paima-sdk/paima-executors';
import Prando from 'paima-sdk/paima-prando';

import { extractMatchEnvironment, initRoundExecutor, processTick } from '@dice/game-logic';
import type { MatchExecutorData, RoundExecutorData, MatchState, TickEvent } from '@dice/utils';

export function buildRoundExecutor(data: RoundExecutorData): RoundExecutor<MatchState, TickEvent> {
  const seed = data.seed;
  const randomnessGenerator = new Prando(seed);
  return initRoundExecutor(data.lobby, data.matchState, data.moves, randomnessGenerator);
}

export function buildMatchExecutor({
  lobby,
  moves,
  seeds,
}: MatchExecutorData): MatchExecutor<MatchState, TickEvent> {
  console.log(seeds, 'seeds used for the match executor at the middleware');

  const initialState: MatchState = {
    // TODO: support multiple players
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
