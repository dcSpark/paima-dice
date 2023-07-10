import type { SubmittedMovesInput } from '../types.js';
import type {
  IGetLobbyByIdResult,
  IGetRoundDataResult,
  INewRoundParams,
  INewMatchMoveParams,
  IExecutedRoundParams,
  IUpdateLatestMatchStateParams,
} from '@dice/db';
import {
  newMatchMove,
  newRound,
  updateLatestMatchState,
  newFinalState,
  executedRound,
} from '@dice/db';
import type {
  ConciseResult,
  ExpandedResult,
  MatchResult,
  MatchEnvironment,
  MatchState,
} from '@dice/utils';
import { scheduleZombieRound, deleteZombieRound } from './zombie.js';
import type { INewFinalStateParams } from '@dice/db/src/insert.queries.js';
import type { SQLUpdate } from 'paima-sdk/paima-db';

// This function inserts a new empty round in the database.
// We also schedule a future zombie round execution.
export function persistNewRound(
  lobbyId: string,
  currentRound: number,
  roundLength: number,
  blockHeight: number
): SQLUpdate[] {
  // Creation of the next round
  const nrParams: INewRoundParams = {
    lobby_id: lobbyId,
    round_within_match: currentRound + 1,
    starting_block_height: blockHeight,
    execution_block_height: null,
  };
  const newRoundTuple: SQLUpdate = [newRound, nrParams];

  // Scheduling of the zombie round execution in the future
  const zombie_block_height = blockHeight + roundLength;
  const zombieRoundUpdate: SQLUpdate = scheduleZombieRound(lobbyId, zombie_block_height);

  return [newRoundTuple /* , zombieRoundUpdate TODO */];
}

// Persist moves sent by player to an active match
export function persistMoveSubmission(
  inputData: SubmittedMovesInput,
  lobby: IGetLobbyByIdResult
): SQLUpdate {
  const mmParams: INewMatchMoveParams = {
    new_move: {
      lobby_id: inputData.lobbyID,
      nft_id: inputData.nftId,
      round: lobby.current_round,
      is_point: inputData.isPoint,
    },
  };
  return [newMatchMove, mmParams];
}
// Persist an executed round (and delete scheduled zombie round input)
export function persistExecutedRound(
  roundData: IGetRoundDataResult,
  lobby: IGetLobbyByIdResult,
  blockHeight: number
): SQLUpdate[] {
  // We close the round by updating it with the execution blockHeight
  const exParams: IExecutedRoundParams = {
    lobby_id: lobby.lobby_id,
    round: lobby.current_round,
    execution_block_height: blockHeight,
  };
  const executedRoundTuple: SQLUpdate = [executedRound, exParams];

  // TODO: zombie rounds are disabled ATM
  // We remove the scheduled zombie round input
  // if (lobby.round_length) {
  //   const block_height = roundData.starting_block_height + lobby.round_length;
  //   return [executedRoundTuple, deleteZombieRound(lobby.lobby_id, block_height)];
  // }
  return [executedRoundTuple];
}

// TODO: allow for more than 2 players
const expandResult = (result: ConciseResult): ExpandedResult => {
  if (result === 'w') return 'win';
  if (result === 'l') return 'loss';
  return 'tie';
};

// Persist match results in the final states table
export function persistMatchResults(
  lobbyId: string,
  results: MatchResult,
  matchEnvironment: MatchEnvironment,
  newState: MatchState
): SQLUpdate {
  const params: INewFinalStateParams = {
    final_state: {
      lobby_id: lobbyId,
      // TODO: support multiple players
      player_one_iswhite: matchEnvironment.user1.color === 'w',
      player_one_nft_id: matchEnvironment.user1.nftId,
      player_one_result: expandResult(results[0]),
      player_one_elapsed_time: 0, // Example TODO: for the developer to implement themselves
      player_two_nft_id: matchEnvironment.user2.nftId,
      player_two_result: expandResult(results[1]),
      player_two_elapsed_time: 0, // Example TODO
    },
  };
  return [newFinalState, params];
}

// Update Lobby state with the updated state
export function persistUpdateMatchState(lobbyId: string, newMatchState: MatchState): SQLUpdate {
  const params: IUpdateLatestMatchStateParams = {
    lobby_id: lobbyId,
    // TODO: support multiple players
    player_one_points: newMatchState.player1Points,
    player_two_points: newMatchState.player2Points,
  };
  return [updateLatestMatchState, params];
}
