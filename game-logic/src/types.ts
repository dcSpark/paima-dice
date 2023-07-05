import type { Color } from 'chess.js';

export interface TickEvent {
  user: string;
  isPoint: boolean;
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
  randomSeed: number;
}

export type MatchMove = boolean;
