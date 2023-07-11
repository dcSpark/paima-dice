import type {
  IGetLobbyByIdResult,
  IGetMovesByLobbyResult,
  IGetUserStatsResult,
  IGetNewLobbiesByUserAndBlockHeightResult,
  IGetPaginatedUserLobbiesResult,
} from '@dice/db';
import type { Color } from 'chess.js';

export enum RoundKind {
  initial,
  extra,
}
export type DiceRolls = {
  finalScore: number;
} & (
  | {
      roundKind: RoundKind.initial;
      dice: [number, number][];
    }
  | {
      roundKind: RoundKind.extra;
      dice: [[number]];
    }
);

export enum TickEventKind {
  roll,
  applyPoints,
  turnEnd,
  roundEnd,
}

export type RollTickEvent = {
  kind: TickEventKind.roll;
  diceRolls: [number] | [number, number];
  rollAgain: boolean;
};
export type ApplyPointsTickEvent = {
  kind: TickEventKind.applyPoints;
  player1: number;
  player2: number;
};
export type TurnEndTickEvent = {
  kind: TickEventKind.turnEnd;
};
export type RoundEndTickEvent = {
  kind: TickEventKind.roundEnd;
};

export type TickEvent = RollTickEvent | ApplyPointsTickEvent | TurnEndTickEvent | RoundEndTickEvent;

export interface MatchEnvironment {
  // TODO: allow for more than 2 players
  user1: PlayerInfo;
  user2: PlayerInfo;
}

export interface PlayerInfo {
  nftId: number;
  color: Color;
}

export interface MatchState {
  player1Points: number;
  player2Points: number;
  player1Score: number;
  player2Score: number;
  turn: number; // whose turn is it
}

export type MatchMove = boolean;

export type LobbyStatus = 'open' | 'active' | 'finished' | 'closed';

// TODO: allow for more than 2 players
export type ConciseResult = 'w' | 't' | 'l';
export type ExpandedResult = 'win' | 'tie' | 'loss';

export type MatchResult = [ConciseResult, ConciseResult];

export interface MatchWinnerResponse {
  match_status?: LobbyStatus;
  winner_nft_id?: undefined | number;
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
  usersWhoSubmittedMoves: number[];
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
