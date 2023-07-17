import type {
  IGetLobbyByIdResult,
  IGetMovesByLobbyResult,
  IGetUserStatsResult,
  IGetNewLobbiesByUserAndBlockHeightResult,
} from '@dice/db';

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
  points: number[];
};
export type TurnEndTickEvent = {
  kind: TickEventKind.turnEnd;
};
export type RoundEndTickEvent = {
  kind: TickEventKind.roundEnd;
};

export type TickEvent = RollTickEvent | ApplyPointsTickEvent | TurnEndTickEvent | RoundEndTickEvent;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MatchEnvironment {}

export interface MatchState {
  players: LobbyPlayer[];
  turn: number; // whose turn is it
}

export type MatchMove = boolean;

export type LobbyStatus = 'open' | 'active' | 'finished' | 'closed';

// TODO: allow for more than 2 players
export type ConciseResult = 'w' | 't' | 'l';
export type ExpandedResult = 'win' | 'tie' | 'loss';

export type MatchResult = ConciseResult[];

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
  lobby: LobbyState;
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

export type LobbyPlayer = {
  nftId: number;
  turn: undefined | number;
  points: number;
  score: number;
};

export interface LobbyState extends IGetLobbyByIdResult {
  round_seed: string;
  players: LobbyPlayer[];
}
