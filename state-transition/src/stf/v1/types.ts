import type { ConciseResult } from '@dice/utils';
import type { WalletAddress } from 'paima-sdk/paima-utils';

export type ParsedSubmittedInput =
  | CreatedLobbyInput
  | JoinedLobbyInput
  | ClosedLobbyInput
  | SubmittedMovesInput
  | PracticeMovesInput
  | ScheduledDataInput
  | InvalidInput;

export interface InvalidInput {
  input: 'invalidString';
}

export interface NftMintInput {
  input: 'nftMint';
  tokenId: string;
  // contract address
  address: WalletAddress;
}

export interface CreatedLobbyInput {
  input: 'createdLobby';
  numOfRounds: number;
  roundLength: number;
  playTimePerPlayer: number;
  isHidden: boolean;
  isPractice: boolean;
  playerOneIsWhite: boolean;
}

export interface JoinedLobbyInput {
  input: 'joinedLobby';
  lobbyID: string;
}

export interface ClosedLobbyInput {
  input: 'closedLobby';
  lobbyID: string;
}

export interface SubmittedMovesInput {
  input: 'submittedMoves';
  lobbyID: string;
  roundNumber: number;
  isPoint: boolean;
}

export interface PracticeMovesInput {
  input: 'practiceMoves';
  lobbyID: string;
  roundNumber: number;
}

export interface ScheduledDataInput {
  input: 'scheduledData';
}

export interface ZombieRound extends ScheduledDataInput {
  effect: 'zombie';
  lobbyID: string;
}

export interface UserStats extends ScheduledDataInput {
  effect: 'stats';
  user: WalletAddress;
  result: ConciseResult;
}

export function isZombieRound(input: ScheduledDataInput): input is ZombieRound {
  return (input as ZombieRound).effect === 'zombie';
}

export function isUserStats(input: ScheduledDataInput): input is UserStats {
  return (input as UserStats).effect === 'stats';
}
