import type { SubmittedMovesInput } from '../types.js';
import type { INewRoundParams, IExecutedRoundParams, IUpdateLobbyPlayerParams } from '@dice/db';
import { newRound, executedRound, updateLobbyPlayer } from '@dice/db';
import type { ActiveLobby, ConciseResult, ExpandedResult, MatchState } from '@dice/utils';
import { scheduleZombieRound } from './zombie.js';
import type { SQLUpdate } from 'paima-sdk/paima-db';
import {
  updateLobbyCurrentMatch,
  updateLobbyCurrentRound,
  updateLobbyCurrentTurn,
  updateLobbyState,
} from '@dice/db/src/update.queries.js';
import type {
  IUpdateLobbyCurrentMatchParams,
  IUpdateLobbyCurrentRoundParams,
  IUpdateLobbyCurrentTurnParams,
  IUpdateLobbyStateParams,
} from '@dice/db/src/update.queries.js';
import type { INewMatchParams, INewMoveParams } from '@dice/db/src/insert.queries.js';
import { newMatch, newMove } from '@dice/db/src/insert.queries.js';
import type { IGetRoundResult } from '@dice/db/src/select.queries.js';

export function persistStartMatch(
  lobbyId: string,
  current_match: null | number,
  roundLength: number,
  blockHeight: number
): SQLUpdate[] {
  const matchWithinLobby = current_match == null ? 0 : current_match + 1;
  const newMatchParams: INewMatchParams = {
    lobby_id: lobbyId,
    match_within_lobby: matchWithinLobby,
    starting_block_height: blockHeight,
  };
  const newMatchUpdates: SQLUpdate[] = [[newMatch, newMatchParams]];

  const initialMatchStateUpdates = persistInitialMatchState(
    lobbyId,
    matchWithinLobby,
    roundLength,
    blockHeight
  );
  return [...newMatchUpdates, ...initialMatchStateUpdates];
}

export function persistInitialMatchState(
  lobbyId: string,
  matchWithinLobby: number,
  roundLength: number,
  blockHeight: number
): SQLUpdate[] {
  const lobbyStateParams: IUpdateLobbyStateParams = {
    lobby_id: lobbyId,
    lobby_state: 'active',
  };
  const lobbyStateUpdates: SQLUpdate[] = [[updateLobbyState, lobbyStateParams]];

  const lobbyCurrentMatchParams: IUpdateLobbyCurrentMatchParams = {
    lobby_id: lobbyId,
    current_match: matchWithinLobby,
  };
  const lobbyCurrentMatchUpdates: SQLUpdate[] = [
    [updateLobbyCurrentMatch, lobbyCurrentMatchParams],
  ];

  // TODO: use persistUpdateMatchState (and reset everything else)
  const lobbyCurrentTurnParams: IUpdateLobbyCurrentTurnParams = {
    lobby_id: lobbyId,
    current_turn: 0,
  };
  const lobbyCurrentTurnUpdates: SQLUpdate[] = [[updateLobbyCurrentTurn, lobbyCurrentTurnParams]];

  const newRoundUpdates = persistNewRound(lobbyId, matchWithinLobby, 0, roundLength, blockHeight);

  // TODO: set initial seed
  // TODO: gen turn order for players
  // TODO: reset players

  return [
    ...lobbyStateUpdates,
    ...lobbyCurrentMatchUpdates,
    ...lobbyCurrentTurnUpdates,
    ...newRoundUpdates,
  ];
}

// This function inserts a new empty round in the database.
// We also schedule a future zombie round execution.
export function persistNewRound(
  lobbyId: string,
  matchWithinLobby: number,
  roundWithinMatch: number,
  roundLength: number,
  blockHeight: number
): SQLUpdate[] {
  // Creation of the next round
  const nrParams: INewRoundParams = {
    lobby_id: lobbyId,
    match_within_lobby: matchWithinLobby,
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
  lobby: ActiveLobby
): { sqlUpdates: SQLUpdate[]; newMove: INewMoveParams } {
  const newMoveParams: INewMoveParams = {
    lobby_id: inputData.lobbyID,
    match_within_lobby: lobby.current_match,
    round_within_match: lobby.current_round,
    // TODO: currently round === move
    move_within_round: 0,
    nft_id: inputData.nftId,
    roll_again: inputData.rollAgain,
  };
  const newMoveUpdates: SQLUpdate[] = [[newMove, newMoveParams]];

  return {
    sqlUpdates: [...newMoveUpdates],
    newMove: newMoveParams,
  };
}
// Persist an executed round (and delete scheduled zombie round input)
export function persistExecutedRound(
  round: IGetRoundResult,
  lobby: ActiveLobby,
  blockHeight: number
): SQLUpdate[] {
  // We close the round by updating it with the execution blockHeight
  const exParams: IExecutedRoundParams = {
    lobby_id: lobby.lobby_id,
    match_within_lobby: lobby.current_match,
    round_within_match: lobby.current_round,
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

  const lobbyParams: IUpdateLobbyCurrentTurnParams = {
    lobby_id: lobbyId,
    current_turn: newMatchState.turn,
  };
  const lobbyUpdates: SQLUpdate[] = [[updateLobbyCurrentTurn, lobbyParams]];

  return [...playerUpdates, ...lobbyUpdates];
}
