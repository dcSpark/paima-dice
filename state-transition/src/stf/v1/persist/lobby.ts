import type { CreatedLobbyInput, JoinedLobbyInput } from '../types.js';
import type { IGetLobbyByIdResult, IStartMatchParams, ICloseLobbyParams } from '@dice/db';
import { createLobby, startMatch, closeLobby, ICreateLobbyParams } from '@dice/db';
import Prando from 'paima-sdk/paima-prando';
import type { LobbyStatus } from '@dice/utils';
import { PRACTICE_BOT_NFT_ID } from '@dice/utils';
import { blankStats } from './stats';
import { persistNewRound } from './match.js';
import type { SQLUpdate } from 'paima-sdk/paima-db';

// Persist creation of a lobby
export function persistLobbyCreation(
  nftId: number,
  blockHeight: number,
  inputData: CreatedLobbyInput,
  seed: string
): SQLUpdate[] {
  const lobby_id = new Prando(seed).nextString(12);
  const params = {
    lobby_id: lobby_id,
    num_of_rounds: inputData.numOfRounds,
    round_length: inputData.roundLength,
    play_time_per_player: inputData.playTimePerPlayer,
    current_round: 0,
    initial_random_seed: seed,
    created_at: new Date(),
    creation_block_height: blockHeight,
    hidden: inputData.isHidden,
    practice: inputData.isPractice,
    lobby_creator: nftId,
    // TODO: support multiple players
    player_one_iswhite: inputData.playerOneIsWhite,
    player_two: null,
    lobby_state: 'open' as LobbyStatus,
  } satisfies ICreateLobbyParams;

  console.log(`Created lobby ${lobby_id}`);
  // create the lobby according to the input data.
  const createLobbyTuple: SQLUpdate = [createLobby, params];
  // create user metadata if non existent
  const blankStatsTuple: SQLUpdate = blankStats(nftId);
  // In case of a practice lobby join with a predetermined opponent right away
  const practiceLobbyUpdates = inputData.isPractice
    ? persistLobbyJoin(
        blockHeight,
        { input: 'joinedLobby', nftId: PRACTICE_BOT_NFT_ID, lobbyID: lobby_id },
        params
      )
    : [];
  return [createLobbyTuple, blankStatsTuple, ...practiceLobbyUpdates];
}

// Persist joining a lobby
export function persistLobbyJoin(
  blockHeight: number,
  inputData: JoinedLobbyInput,
  lobby: ICreateLobbyParams
): SQLUpdate[] {
  // First we validate if the lobby is actually open for users to join, before applying.
  // If not, just output an empty list of updates (meaning no state transition is applied)
  if (
    // TODO: support multiple players
    !lobby.player_two &&
    lobby.lobby_state === 'open' &&
    lobby.lobby_creator !== inputData.nftId
  ) {
    // Save user metadata, like in the lobby creation flow,
    // then convert lobby into active and create empty round and user states
    const updateLobbyTuple = persistActivateLobby(inputData.nftId, lobby, blockHeight);
    const blankStatsTuple: SQLUpdate = blankStats(inputData.nftId);
    return [...updateLobbyTuple, blankStatsTuple];
  } else return [];
}

// Convert lobby state from `open` to `close`, meaning no one will be able to join the lobby.
export function persistCloseLobby(lobby: IGetLobbyByIdResult): SQLUpdate | null {
  // TODO: support multiple players
  if (lobby.player_two != null || lobby.lobby_state !== 'open') {
    console.log('DISCARD: lobby is full or not open');
    return null;
  }

  const params: ICloseLobbyParams = {
    lobby_id: lobby.lobby_id,
  };
  return [closeLobby, params];
}

// Convert lobby from `open` to `active`, meaning the match has now started.
function persistActivateLobby(
  joiningNftId: number,
  lobby: ICreateLobbyParams,
  blockHeight: number
): SQLUpdate[] {
  // First update lobby row, marking its state as now 'active', and saving the joining player's wallet address
  const smParams: IStartMatchParams = {
    lobby_id: lobby.lobby_id,
    // TODO: support multiple players
    player_two: joiningNftId,
  };
  const newMatchTuple: SQLUpdate = [startMatch, smParams];
  // We insert the round and first two empty user states in their tables at this stage, so the round executor has empty states to iterate from.
  const roundAndStates = persistInitialMatchState(lobby, blockHeight);
  return [newMatchTuple, ...roundAndStates];
}

// Create initial match state, used when a player joins a lobby to init the match.
function persistInitialMatchState(lobby: ICreateLobbyParams, blockHeight: number): SQLUpdate[] {
  const newRoundTuples = persistNewRound(lobby.lobby_id, 0, lobby.round_length, blockHeight);
  return newRoundTuples;
}
