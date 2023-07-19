import type { CreatedLobbyInput } from '../types.js';
import type { IStartMatchParams, ICloseLobbyParams } from '@dice/db';
import { createLobby, startMatch, closeLobby, ICreateLobbyParams } from '@dice/db';
import Prando from 'paima-sdk/paima-prando';
import type { LobbyStatus } from '@dice/utils';
import { PRACTICE_BOT_NFT_ID } from '@dice/utils';
import { persistInitialMatchState } from './match.js';
import type { SQLUpdate } from 'paima-sdk/paima-db';
import type { IJoinPlayerToLobbyParams } from '@dice/db/src/insert.queries.js';
import { joinPlayerToLobby } from '@dice/db/src/insert.queries.js';

// Persist creation of a lobby
export function persistLobbyCreation(
  nftId: number,
  blockHeight: number,
  inputData: CreatedLobbyInput,
  seed: string
): SQLUpdate[] {
  const lobby_id = new Prando(seed).nextString(12);
  let playersInLobby = 0;

  // create the lobby
  const lobbyParams = {
    lobby_id: lobby_id,
    // note: can be adjusted, but we don't have frontend for more
    max_players: 2,
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
    lobby_state: 'open' as LobbyStatus,
  } satisfies ICreateLobbyParams;
  const createLobbyTuple: SQLUpdate = [createLobby, lobbyParams];

  // join creator to lobby
  const joinParams: IJoinPlayerToLobbyParams = {
    lobby_id,
    nft_id: nftId,
    // TODO: set turns at match start
    turn: playersInLobby,
  };
  const joinCreatorTuple: SQLUpdate = [joinPlayerToLobby, joinParams];
  playersInLobby++;

  const numBots = inputData.isPractice ? lobbyParams.max_players - playersInLobby : 0;
  const joinBots: SQLUpdate[] = Array(numBots)
    .fill(null)
    .flatMap(() => {
      // TODO: set turns at match start
      const turn = playersInLobby;
      playersInLobby++;
      return persistLobbyJoin({
        lobby_id,
        nft_id: PRACTICE_BOT_NFT_ID,
        turn,
      });
    });

  const closeLobbyUpdates: SQLUpdate[] =
    playersInLobby < lobbyParams.max_players ? [] : persistCloseLobby({ lobby_id });

  // Automatically activate a lobby when it fills up.
  // Note: This could be replaced by some input from creator.
  const activateLobbyUpdates: SQLUpdate[] =
    playersInLobby < lobbyParams.max_players
      ? []
      : persistActivateLobby(lobby_id, lobbyParams.round_length, blockHeight);

  console.log(
    `Created lobby ${lobby_id}`,
    joinBots.length,
    closeLobbyUpdates.length,
    activateLobbyUpdates.length
  );
  return [
    createLobbyTuple,
    joinCreatorTuple,
    ...joinBots,
    ...closeLobbyUpdates,
    ...activateLobbyUpdates,
  ];
}

export function persistLobbyJoin(params: IJoinPlayerToLobbyParams): SQLUpdate[] {
  return [[joinPlayerToLobby, params]];
}

export function persistCloseLobby(params: ICloseLobbyParams): SQLUpdate[] {
  return [[closeLobby, params]];
}

// TODO: change to "start match"
export function persistActivateLobby(
  lobbyId: string,
  roundLength: number,
  blockHeight: number
): SQLUpdate[] {
  // Set lobby state to active
  const startMatchParams: IStartMatchParams = {
    lobby_id: lobbyId,
  };
  const newMatchTuple: SQLUpdate = [startMatch, startMatchParams];

  // Set initial match state
  const initialMatchStateUpdates = persistInitialMatchState(lobbyId, roundLength, blockHeight);

  return [newMatchTuple, ...initialMatchStateUpdates];
}
