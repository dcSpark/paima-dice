import type { Pool } from 'pg';
import Prando from 'paima-sdk/paima-prando';
import { SCHEDULED_DATA_ADDRESS, type WalletAddress } from 'paima-sdk/paima-utils';
import type {
  IGetLobbyByIdResult,
  IGetLobbyPlayersResult,
  IGetRoundDataResult,
  IGetRoundMovesResult,
} from '@dice/db';
import {
  getCachedMoves,
  getLobbyById,
  getRoundData,
  getUserStats,
  endMatch,
  getLobbyPlayers,
} from '@dice/db';
import type { ConciseResult, MatchState } from '@dice/utils';
import { initRoundExecutor, matchResults, buildCurrentMatchState } from '@dice/game-logic';
import {
  persistUpdateMatchState,
  persistCloseLobby,
  persistLobbyCreation,
  persistLobbyJoin,
  persistMoveSubmission,
  persistStatsUpdate,
  scheduleStatsUpdate,
  persistNewRound,
  persistExecutedRound,
  persistMatchResults,
  schedulePracticeMove,
  blankStats,
  persistActivateLobby,
} from './persist';
import { isValidMove } from '@dice/game-logic';
import type {
  ClosedLobbyInput,
  CreatedLobbyInput,
  JoinedLobbyInput,
  NftMintInput,
  PracticeMovesInput,
  ScheduledDataInput,
  SubmittedMovesInput,
} from './types.js';
import { isUserStats, isZombieRound } from './types.js';
import { NFT_NAME, PRACTICE_BOT_NFT_ID } from '@dice/utils';
import { getBlockHeight, type SQLUpdate } from 'paima-sdk/paima-db';
import { PracticeAI } from './persist/practice-ai';
import { getOwnedNfts } from 'paima-sdk/paima-utils-backend';

// Create initial player entry after nft mint
export const mintNft = async (input: NftMintInput): Promise<SQLUpdate[]> => {
  try {
    return [blankStats(Number.parseInt(input.tokenId))];
  } catch (e) {
    console.log(`DISCARD: error in nft mint ${e}`);
    return [];
  }
};

// State transition when a create lobby input is processed
export const createdLobby = async (
  player: WalletAddress,
  blockHeight: number,
  input: CreatedLobbyInput,
  dbConn: Pool
): Promise<SQLUpdate[]> => {
  const [block] = await getBlockHeight.run({ block_height: blockHeight }, dbConn);
  if (!(await checkUserOwns(player, input.creatorNftId, dbConn))) {
    console.log('DISCARD: user does not own specified nft');
    return [];
  }
  return persistLobbyCreation(input.creatorNftId, blockHeight, input, block.seed);
};

// State transition when a join lobby input is processed
export const joinedLobby = async (
  player: WalletAddress,
  blockHeight: number,
  input: JoinedLobbyInput,
  dbConn: Pool
): Promise<SQLUpdate[]> => {
  const [lobby] = await getLobbyById.run({ lobby_id: input.lobbyID }, dbConn);
  if (lobby == null) {
    console.log('DISCARD: lobby does not exist');
    return [];
  }

  const players = await getLobbyPlayers.run({ lobby_id: input.lobbyID }, dbConn);
  if (lobby.lobby_state !== 'open' || players.length >= lobby.max_players) {
    console.log('DISCARD: lobby does not accept more players');
    return [];
  }

  if (!(await checkUserOwns(player, input.nftId, dbConn))) {
    console.log('DISCARD: user does not own specified nft');
    return [];
  }

  const joinUpdates = persistLobbyJoin({
    lobby_id: input.lobbyID,
    nft_id: input.nftId,
    // TODO: index turn from 0
    // TODO: set turns at match start
    turn: players.length + 1,
  });
  const isFull = players.length + 1 >= lobby.max_players;

  const closeLobbyUpdates: SQLUpdate[] = isFull
    ? persistCloseLobby({ lobby_id: input.lobbyID })
    : [];

  // Automatically activate a lobby when it fills up.
  // Note: this could be replaced by some input from creator.
  const activateLobbyUpdates: SQLUpdate[] = isFull
    ? persistActivateLobby(input.lobbyID, lobby.round_length, blockHeight)
    : [];

  return [...joinUpdates, ...closeLobbyUpdates, ...activateLobbyUpdates];
};

// State transition when a close lobby input is processed
export const closedLobby = async (
  player: WalletAddress,
  input: ClosedLobbyInput,
  dbConn: Pool
): Promise<SQLUpdate[]> => {
  const [lobby] = await getLobbyById.run({ lobby_id: input.lobbyID }, dbConn);
  if (lobby == null) {
    console.log('DISCARD: lobby does not exist');
    return [];
  }

  if (!(await checkUserOwns(player, lobby.lobby_creator, dbConn))) {
    console.log('DISCARD: user does not own creator nft');
    return [];
  }

  const closeUpdates = persistCloseLobby(lobby);

  return closeUpdates;
};

// State transition when a submit moves input is processed
export const submittedMoves = async (
  player: WalletAddress,
  blockHeight: number,
  input: SubmittedMovesInput,
  dbConn: Pool
): Promise<SQLUpdate[]> => {
  // Perform DB read queries to get needed data
  const [lobby] = await getLobbyById.run({ lobby_id: input.lobbyID }, dbConn);
  if (!lobby) {
    console.log('DISCARD: lobby does not exist');
    return [];
  }
  const players = await getLobbyPlayers.run({ lobby_id: input.lobbyID }, dbConn);
  if (players.length !== 2) {
    // TODO: allow for more than 2 players
    console.log(`DISCARD: wrong number of players ${players.length}`);
    return [];
  }

  if (player !== SCHEDULED_DATA_ADDRESS && !(await checkUserOwns(player, input.nftId, dbConn))) {
    console.log('DISCARD: user does not own specified nft');
    return [];
  }

  const [round] = await getRoundData.run(
    { lobby_id: lobby.lobby_id, round_number: input.roundNumber },
    dbConn
  );
  const prandoSeed = await fetchPrandoSeed(lobby, dbConn);
  if (prandoSeed == null) {
    console.log('DISCARD: cannot fetch prando seed');
    return [];
  }

  // If the submitted moves are usable/all validation passes, continue
  if (!validateSubmittedMoves(lobby, players, round, input, new Prando(prandoSeed))) {
    console.log('DISCARD: invalid move');
    return [];
  }

  // Generate update to persist the moves
  const persistMoveTuple = persistMoveSubmission(input, lobby);
  // We generated an SQL update for persisting the moves.
  // Now we capture the params (the moves typed as we need) and pass it to the round executor.
  const newMove: IGetRoundMovesResult = persistMoveTuple[1].new_move;
  // Execute the round and collect persist SQL updates
  const { sqlUpdates: roundExecutionTuples, newMatchState } = executeRound(
    blockHeight,
    lobby,
    players,
    [newMove],
    round,
    new Prando(prandoSeed)
  );

  // If a bot goes next, schedule a bot move
  const botMoves = (() => {
    const newTurnPlayer = players.find(player => player.turn === newMatchState.turn);
    const newTurnNftId = newTurnPlayer?.nft_id;
    if (newTurnNftId !== PRACTICE_BOT_NFT_ID) return [];

    const practiceMoveSchedule = schedulePracticeMove(
      lobby.lobby_id,
      lobby.current_round + 1,
      blockHeight + 1
    );
    return [practiceMoveSchedule];
  })();

  console.log('New match state: ', newMatchState);
  return [persistMoveTuple, ...roundExecutionTuples, ...botMoves];
};

// State transition when a practice moves input is processed
export const practiceMoves = async (
  player: WalletAddress,
  blockHeight: number,
  input: PracticeMovesInput,
  dbConn: Pool
): Promise<SQLUpdate[]> => {
  // Perform DB read queries to get needed data
  const [lobby] = await getLobbyById.run({ lobby_id: input.lobbyID }, dbConn);
  if (!lobby) return [];
  const players = await getLobbyPlayers.run({ lobby_id: input.lobbyID }, dbConn);

  // note: do not try to give this Prando to submittedMoves, it has to create it again
  const prandoSeed = await fetchPrandoSeed(lobby, dbConn);
  if (prandoSeed == null) return [];

  const practiceAI = new PracticeAI(buildCurrentMatchState(lobby, players), new Prando(prandoSeed));
  const practiceMove = practiceAI.getNextMove();
  const regularInput: SubmittedMovesInput = {
    ...input,
    input: 'submittedMoves',
    nftId: PRACTICE_BOT_NFT_ID,
    rollAgain: practiceMove,
  };

  return submittedMoves(player, blockHeight, regularInput, dbConn);
};

// Validate submitted moves in relation to player/lobby/round state
function validateSubmittedMoves(
  lobby: IGetLobbyByIdResult,
  players: IGetLobbyPlayersResult[],
  round: IGetRoundDataResult,
  input: SubmittedMovesInput,
  randomnessGenerator: Prando
): boolean {
  // If lobby not active or existing
  if (!lobby || lobby.lobby_state !== 'active') {
    console.log('INVALID MOVE: lobby not active');
    return false;
  }

  // Player is supposed to play this turn
  const turnPlayer = players.find(player => player.turn === lobby.turn);
  const turnNft = turnPlayer?.nft_id;
  if (input.nftId !== turnNft) {
    console.log('INVALID MOVE: not players turn');
    return false;
  }

  // Verify fetched round exists
  if (!round) {
    console.log('INVALID MOVE: round does not exist');
    return false;
  }

  // If moves submitted don't target the current round
  if (input.roundNumber !== lobby.current_round) {
    console.log('INVALID MOVE: incorrect round');
    return false;
  }

  // If a move is sent that is invalid
  if (!isValidMove(randomnessGenerator, buildCurrentMatchState(lobby, players), input.rollAgain)) {
    console.log('INVALID MOVE: invalid move');
    return false;
  }

  return true;
}

// State transition when scheduled data is processed
export const scheduledData = async (
  blockHeight: number,
  input: ScheduledDataInput,
  dbConn: Pool,
  randomnessGenerator: Prando
): Promise<SQLUpdate[]> => {
  // This executes 'zombie rounds', rounds which have reached the specified timeout time per round.
  if (isZombieRound(input)) {
    return zombieRound(blockHeight, input.lobbyID, dbConn, randomnessGenerator);
  }
  // Update the users stats
  if (isUserStats(input)) {
    return updateStats(input.nftId, input.result, dbConn);
  }
  return [];
};

// State transition when a zombie round input is processed
export const zombieRound = async (
  blockHeight: number,
  lobbyId: string,
  dbConn: Pool,
  randomnessGenerator: Prando
): Promise<SQLUpdate[]> => {
  const [lobby] = await getLobbyById.run({ lobby_id: lobbyId }, dbConn);
  if (!lobby) return [];
  const players = await getLobbyPlayers.run({ lobby_id: lobbyId }, dbConn);
  const [round] = await getRoundData.run(
    { lobby_id: lobby.lobby_id, round_number: lobby.current_round },
    dbConn
  );
  const cachedMoves = await getCachedMoves.run({ lobby_id: lobbyId }, dbConn);

  console.log(`Executing zombie round (#${lobby.current_round}) for lobby ${lobby.lobby_id}`);

  // We call the execute round function passing the unexecuted moves from the database, if any.
  // In practice for blackjack dice, there will be no cached moves as only one player goes per turn
  // and the round is instantly executed. As such this will simply proceed to the next round.
  return executeRound(blockHeight, lobby, players, cachedMoves, round, randomnessGenerator)
    .sqlUpdates;
};

// State transition when an update stats input is processed
export const updateStats = async (
  nftId: number,
  result: ConciseResult,
  dbConn: Pool
): Promise<SQLUpdate[]> => {
  const [stats] = await getUserStats.run({ nft_id: nftId }, dbConn);
  // Verify coherency that the user has existing stats which can be updated
  if (stats) {
    const query = persistStatsUpdate(nftId, result, stats);
    console.log(query[1], `Updating stats of ${nftId}`);
    return [query];
  }
  return [];
};

// Runs the round executor and produces the necessary SQL updates as a result
export function executeRound(
  blockHeight: number,
  lobby: IGetLobbyByIdResult,
  players: IGetLobbyPlayersResult[],
  moves: IGetRoundMovesResult[],
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
): { sqlUpdates: SQLUpdate[]; newMatchState: MatchState } {
  // We initialize the round executor object and run it/get the new match state via `.endState()`
  const executor = initRoundExecutor(
    lobby,
    buildCurrentMatchState(lobby, players),
    moves,
    randomnessGenerator
  );
  const newMatchState = executor.endState();

  // We generate updates to the lobby to apply the new match state
  const lobbyUpdate = persistUpdateMatchState(lobby.lobby_id, newMatchState);

  // We generate updates for the executed round
  const executedRoundUpdate = persistExecutedRound(roundData, lobby, blockHeight);

  // Finalize match if game is over or we have reached the final round
  let roundResultUpdate: SQLUpdate[];
  if (isFinalRound(lobby)) {
    console.log(lobby.lobby_id, 'match ended, finalizing');
    roundResultUpdate = finalizeMatch(blockHeight, lobby, newMatchState);
  }
  // Else create a new round
  else {
    roundResultUpdate = persistNewRound(
      lobby.lobby_id,
      lobby.current_round,
      lobby.round_length,
      blockHeight
    );
  }

  return {
    sqlUpdates: [...lobbyUpdate, ...executedRoundUpdate, ...roundResultUpdate],
    newMatchState,
  };
}

// Finalizes the match and updates user statistics according to final score of the match
function finalizeMatch(
  blockHeight: number,
  lobby: IGetLobbyByIdResult,
  newState: MatchState
): SQLUpdate[] {
  // Create update which sets lobby state to 'finished'
  const endMatchTuple: SQLUpdate = [endMatch, { lobby_id: lobby.lobby_id }];

  // If practice lobby, then no extra results/stats need to be updated
  if (lobby.practice) {
    console.log(`Practice match ended, ignoring results`);
    return [endMatchTuple];
  }

  // Save the final results in the final states table
  const results = matchResults(newState);
  const resultsUpdates = persistMatchResults();

  // Create the new scheduled data for updating user stats.
  // Stats are updated with scheduled data to support parallelism safely.
  // TODO: support multiple players
  const statsUpdates = newState.players.map((player, i) =>
    scheduleStatsUpdate(player.nftId, results[i], blockHeight + 1)
  );
  return [endMatchTuple, ...resultsUpdates, ...statsUpdates];
}

// Check if lobby is in final round
function isFinalRound(lobby: IGetLobbyByIdResult): boolean {
  // TODO: end of round disabled - needs to be properly implemented
  // if (lobby.num_of_rounds && lobby.current_round >= lobby.num_of_rounds) return true;
  return false;
}

/**
 * We have to seed our own Prando, because we need to use randomness from
 * last round in the execution of current round.
 * Player throws dice, and then decides moves, i.e. dice throw has to be
 * decided before he decides and submits his moves.
 */
async function fetchPrandoSeed(
  lobby: IGetLobbyByIdResult,
  dbConn: Pool
): Promise<undefined | string> {
  // Note: match starts at round 1, because we use persistNewRound to start it
  if (lobby.current_round === 1) {
    return lobby.initial_random_seed;
  }

  const [lastRound] = await getRoundData.run(
    { lobby_id: lobby.lobby_id, round_number: lobby.current_round - 1 },
    dbConn
  );
  if (lastRound == null) return;
  const [lastRoundBlock] = await getBlockHeight.run(
    { block_height: lastRound.execution_block_height },
    dbConn
  );
  if (lastRoundBlock == null) return;
  return lastRoundBlock.seed;
}

async function checkUserOwns(user: WalletAddress, nftId: number, dbConn: Pool): Promise<boolean> {
  const walletNfts = await getOwnedNfts(dbConn, NFT_NAME, user);
  return walletNfts.some(ownedNftId => Number(ownedNftId) === nftId);
}
