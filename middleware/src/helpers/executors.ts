import type { MatchExecutor, RoundExecutor } from 'paima-sdk/paima-executors';
import { matchExecutor } from 'paima-sdk/paima-executors';
import Prando from 'paima-sdk/paima-prando';

import { extractMatchEnvironment, initRoundExecutor, processTick } from '@dice/game-logic';
import type { MatchExecutorData, RoundExecutorData, MatchState, TickEvent } from '@dice/utils';

export function buildRoundExecutor(data: RoundExecutorData): RoundExecutor<MatchState, TickEvent> {
  const seed = data.seed;
  const randomnessGenerator = new Prando(seed);
  console.log('HELLO BUILD', JSON.stringify(data), data);
  return initRoundExecutor(data.lobby, data.matchState, data.moves, randomnessGenerator);
}

export function buildMatchExecutor({
  lobby,
  moves,
  seeds,
}: MatchExecutorData): MatchExecutor<MatchState, TickEvent> {
  console.log(seeds, 'seeds used for the match executor at the middleware');

  if (lobby.player_two == null) throw new Error(`buildMatchExecutor: missing player 2`);
  const initialState: MatchState = {
    // TODO: support multiple players
    players: [
      {
        nftId: lobby.lobby_creator,
        turn: lobby.player_one_iswhite ? 1 : 2,
        points: 0,
        score: 0,
      },
      {
        nftId: lobby.player_two,
        turn: lobby.player_one_iswhite ? 2 : 1,
        points: 0,
        score: 0,
      },
    ],
    turn: 1,
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
