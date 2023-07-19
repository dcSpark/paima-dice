import type { SubmittedMovesInput } from '../types.js';
import type {
  IGetLobbyByIdResult,
  IGetRoundDataResult,
  INewRoundParams,
  INewMatchMoveParams,
  IExecutedRoundParams,
  IUpdateLobbyPlayerParams,
} from '@dice/db';
import { newMatchMove, newRound, executedRound, updateLobbyPlayer } from '@dice/db';
import type { ConciseResult, ExpandedResult, MatchState } from '@dice/utils';
import { scheduleZombieRound } from './zombie.js';
import type { SQLUpdate } from 'paima-sdk/paima-db';
import { updateLobbyTurn, updateLobbyCurrentRound } from '@dice/db/src/update.queries.js';
import type {
  IUpdateLobbyCurrentRoundParams,
  IUpdateLobbyTurnParams,
} from '@dice/db/src/update.queries.js';

export function persistInitialMatchState(
  lobbyId: string,
  roundLength: number,
  blockHeight: number
): SQLUpdate[] {
  const newRoundTuples = persistNewRound(lobbyId, 0, roundLength, blockHeight);
  return newRoundTuples;
}

// This function inserts a new empty round in the database.
// We also schedule a future zombie round execution.
export function persistNewRound(
  lobbyId: string,
  roundWithinMatch: number,
  roundLength: number,
  blockHeight: number
): SQLUpdate[] {
  // Creation of the next round
  const nrParams: INewRoundParams = {
    lobby_id: lobbyId,
    round_within_match: roundWithinMatch,
    starting_block_height: blockHeight,
    execution_block_height: null,
  };
  const newRoundTuple: SQLUpdate[] = [[newRound, nrParams]];

  const updateCurrentRoundParams: IUpdateLobbyCurrentRoundParams = {
    lobby_id: lobbyId,
    current_round: roundWithinMatch,
  };
  const updateCurrentRoundTuple: SQLUpdate[] = [
    [updateLobbyCurrentRound, updateCurrentRoundParams],
  ];

  // Scheduling of the zombie round execution in the future
  const zombie_block_height = blockHeight + roundLength;
  const zombieRoundUpdate: SQLUpdate = scheduleZombieRound(lobbyId, zombie_block_height);

  return [...newRoundTuple, ...updateCurrentRoundTuple /* , zombieRoundUpdate TODO */];
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
      roll_again: inputData.rollAgain,
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

const expandResult = (result: ConciseResult): ExpandedResult => {
  if (result === 'w') return 'win';
  if (result === 'l') return 'loss';
  return 'tie';
};

// Persist match results in the final states table
export function persistMatchResults(): SQLUpdate[] {
  // TODO
  return [];
}

// Update Lobby state with the updated state
export function persistUpdateMatchState(lobbyId: string, newMatchState: MatchState): SQLUpdate[] {
  if (newMatchState.players.length !== 2)
    throw new Error(`persistUpdateMatchState: missing players`);

  const playerParams: IUpdateLobbyPlayerParams[] = newMatchState.players.map(player => ({
    lobby_id: lobbyId,
    nft_id: player.nftId,
    points: player.points,
    score: player.score,
    turn: player.turn,
  }));
  const playerUpdates: SQLUpdate[] = playerParams.map(param => [updateLobbyPlayer, param]);

  const lobbyParams: IUpdateLobbyTurnParams = {
    lobby_id: lobbyId,
    turn: newMatchState.turn,
  };
  const lobbyUpdates: SQLUpdate[] = [[updateLobbyTurn, lobbyParams]];

  return [...playerUpdates, ...lobbyUpdates];
}
