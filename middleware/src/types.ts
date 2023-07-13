import type { Hash } from 'paima-sdk/paima-utils';

import type {
  BaseRoundStatus,
  LobbyStateQuery,
  LobbyStatus,
  NewLobby,
  UserLobby,
  UserStats,
} from '@dice/utils';

export interface RoundEnd {
  blocks: number;
  seconds: number;
}

export interface CreateLobbySuccessfulResponse {
  success: true;
  lobbyID: Hash;
  lobbyStatus: LobbyStatus;
}

export interface NewLobbies {
  success: true;
  lobbies: NewLobby[];
}

export interface PackedLobbyState {
  success: true;
  lobby: LobbyStateQuery;
}

export interface RoundExecutionState extends BaseRoundStatus {
  roundEndsInBlocks: number;
  roundEndsInSeconds: number;
}

export interface PackedRoundExecutionState {
  success: true;
  round: RoundExecutionState;
}

export interface LobbyStates {
  success: true;
  lobbies: LobbyStateQuery[];
}

export interface PackedUserLobbies {
  success: true;
  lobbies: UserLobby[];
}

export interface PackedUserStats {
  success: true;
  stats: UserStats;
}
