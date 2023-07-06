import type {
  IGetLobbyByIdResult,
  IGetMovesByLobbyResult,
  IGetUserStatsResult,
  IGetNewLobbiesByUserAndBlockHeightResult,
  IGetPaginatedUserLobbiesResult,
} from '@dice/db';
import type { WalletAddress } from 'paima-sdk/paima-utils';
import type { Color } from 'chess.js';

export interface TickEvent {
  user: string;
  isPoint: boolean;
  dice: [number, number];
}

export interface MatchEnvironment {
  user1: PlayerInfo;
  user2: PlayerInfo;
}

export interface PlayerInfo {
  wallet: string;
  color: Color;
}

export interface MatchState {
  player1Points: number;
  player2Points: number;
}

export type MatchMove = boolean;

export type LobbyStatus = 'open' | 'active' | 'finished' | 'closed';
export type ConciseResult = 'w' | 't' | 'l';
export type ExpandedResult = 'win' | 'tie' | 'loss';
export type MatchResult = [ConciseResult, ConciseResult];

export interface MatchWinnerResponse {
  match_status?: LobbyStatus;
  winner_address?: string;
}

export interface RoundExecutorBackendData {
  lobby: IGetLobbyByIdResult;
  moves: IGetMovesByLobbyResult[];
  seed: string;
}

export interface RoundExecutorData extends RoundExecutorBackendData {
  matchState: MatchState;
}

interface ExecutorDataSeed {
  seed: string;
  block_height: number;
  round: number;
}

export interface MatchExecutorData {
  lobby: IGetLobbyByIdResult;
  moves: IGetMovesByLobbyResult[];
  seeds: ExecutorDataSeed[];
}

export interface BaseRoundStatus {
  executed: boolean;
  usersWhoSubmittedMoves: WalletAddress[];
}

export interface RoundStatusData extends BaseRoundStatus {
  roundStarted: number; // blockheight
  roundLength: number;
}

export type UserStats = IGetUserStatsResult;

export type NewLobby = IGetNewLobbiesByUserAndBlockHeightResult;

export interface LobbyState extends LobbyStateQuery {
  round_ends_in_blocks: number;
  round_ends_in_secs: number;
}

export interface LobbyStateQuery extends IGetLobbyByIdResult {
  round_start_height: number;
  round_seed: string;
}

export interface UserLobby extends IGetPaginatedUserLobbiesResult {
  myTurn?: boolean;
}
