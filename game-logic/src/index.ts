import type { RoundExecutor } from 'paima-sdk/paima-executors';
import { roundExecutor } from 'paima-sdk/paima-executors';
import type Prando from 'paima-sdk/paima-prando';
import type { MatchState, MatchEnvironment, TickEvent } from '@dice/utils';
import { processTick } from './tick';
import type { IGetLobbyByIdResult, IGetCachedMovesResult } from '@dice/db';
import { WHITE, BLACK } from 'chess.js';

export * from './tick';
export * from './chess-logic';
export * from './dice-logic';

// We initialize the round executor object using lobby data + submitted moves + randomness generator.
// This function extracts the match environment and match state from the lobby.
// and the chess `processTick` function
export function initRoundExecutor(
  lobby: IGetLobbyByIdResult,
  matchState: MatchState,
  moves: IGetCachedMovesResult[],
  randomnessGenerator: Prando
): RoundExecutor<MatchState, TickEvent> {
  return roundExecutor.initialize(
    extractMatchEnvironment(lobby),
    buildMatchState(matchState),
    moves,
    randomnessGenerator,
    processTick
  );
}

// From a lobby, extract a match environment which will be used by the round executor.
// A match environment is a piece of immutable data about the match which is
// relevant to the round executor, but which can not be updated.
export function extractMatchEnvironment(lobby: IGetLobbyByIdResult): MatchEnvironment {
  return {
    // TODO: support multiple players
    user1: {
      nftId: lobby.lobby_creator,
      color: lobby.player_one_iswhite ? WHITE : BLACK,
    },
    user2: {
      nftId: lobby.player_two!,
      color: lobby.player_one_iswhite !== true ? WHITE : BLACK,
    },
  };
}

// From a given round, construct the match state which will be used by the round executor.
// A match state is comprised of mutable data which the round executor will
// update, and in the end return a final new match state upon completion.
export const buildMatchState = (matchState: MatchState): MatchState => ({
  ...matchState,
});
