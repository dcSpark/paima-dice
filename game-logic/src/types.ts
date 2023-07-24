import type { ValuesType } from 'utility-types';
import type { MOVE_KIND, TICK_EVENT_KIND } from './constants';

import type {
  IGetLobbyByIdResult,
  IGetUserStatsResult,
  IGetNewLobbiesByUserAndBlockHeightResult,
} from '@dice/db';
import type { IGetMatchMovesResult } from '@dice/db/build/select.queries';
import type { PropertiesNonNullable } from '@dice/utils';

export enum RoundKind {
  initial,
  extra,
}

export type CardDraw = {
  cardNumber: number;
  card: HandCard; // deck can be empty
  newDeck: Deck;
};

export type TickEventKind = ValuesType<typeof TICK_EVENT_KIND>;

export type TxTickEvent = {
  kind: typeof TICK_EVENT_KIND.tx;
  move: Move;
};
export type PostTxTickEvent = {
  kind: typeof TICK_EVENT_KIND.postTx;
  draw: CardDraw;
};
export type PlayCardTickEvent = {
  kind: typeof TICK_EVENT_KIND.playCard;
  handPosition: number;
  newHand: Hand;
};
export type ApplyPointsTickEvent = {
  kind: typeof TICK_EVENT_KIND.applyPoints;
  points: number[];
};
export type TurnEndTickEvent = {
  kind: typeof TICK_EVENT_KIND.turnEnd;
};
export type RoundEndTickEvent = {
  kind: typeof TICK_EVENT_KIND.roundEnd;
};
export type MatchEndTickEvent = {
  kind: typeof TICK_EVENT_KIND.matchEnd;
  result: MatchResult;
};

export type TickEvent =
  | TxTickEvent
  | PostTxTickEvent
  | PlayCardTickEvent
  | ApplyPointsTickEvent
  | TurnEndTickEvent
  | RoundEndTickEvent
  | MatchEndTickEvent;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MatchEnvironment {
  practice: boolean;
  numberOfRounds: number;
}

export interface MatchState {
  players: LobbyPlayer[];
  // Round that is displayed to users (consists of everyone taking a turn).
  // Not to be confused with round everywhere else (1 move + 1 random seed).
  properRound: number;
  turn: number; // whose turn is it
  result: undefined | MatchResult;
  // Move that required a tx submission. It it was for new randomness,
  // we'll want to provide new randomness in postTx event (e.g. decide to draw a card).
  txEventMove: undefined | Move;
}

export type LobbyStatus = 'open' | 'active' | 'finished' | 'closed';

export type ConciseResult = 'w' | 't' | 'l';
export type ExpandedResult = 'win' | 'tie' | 'loss';

export type MatchResult = ConciseResult[];

export interface MatchWinnerResponse {
  match_status?: LobbyStatus;
  winner_nft_id?: undefined | number;
}

export interface RoundExecutorBackendData {
  lobby: IGetLobbyByIdResult;
  moves: IGetMatchMovesResult[];
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
  moves: IGetMatchMovesResult[];
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
  startingDeck: Deck;
  currentDeck: Deck;
  currentHand: Hand;
  currentDraw: number;
  turn: undefined | number;
  points: number;
  score: number;
};

type LobbyStateProps = 'current_match' | 'current_round' | 'current_turn' | 'current_proper_round';
export type LobbyWithStateProps = Omit<IGetLobbyByIdResult, LobbyStateProps> &
  PropertiesNonNullable<Pick<IGetLobbyByIdResult, LobbyStateProps>>;

export interface LobbyState extends LobbyWithStateProps {
  roundSeed: string;
  players: LobbyPlayer[];
  txEventMove: undefined | Move;
}

export type CardId = number;
export type Deck = CardId[];
export type SerializedCard = string;
export type SerializedDeck = string;

export type HandCard = {
  cardId: undefined | CardId;
  // the position in all cards drawn this match by this player
  draw: number;
};
export type Hand = HandCard[];
export type SerializedHandCard = string;
export type SerializedHand = string;

export type MoveKind = ValuesType<typeof MOVE_KIND>;
export type Move =
  | {
      kind: typeof MOVE_KIND.drawCard;
    }
  | {
      kind: typeof MOVE_KIND.endTurn;
    }
  | {
      kind: typeof MOVE_KIND.playCard;
      handPosition: number;
    };
export type SerializedMove = string;