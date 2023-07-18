/** Types generated for queries found in "src/queries/insert.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type lobby_status = 'active' | 'closed' | 'finished' | 'open';

/** 'CreateLobby' parameters type */
export interface ICreateLobbyParams {
  created_at: Date;
  creation_block_height: number;
  current_round: number | null | void;
  hidden: boolean;
  initial_random_seed: string;
  lobby_creator: number;
  lobby_id: string;
  lobby_state: lobby_status;
  num_of_rounds: number;
  play_time_per_player: number;
  practice: boolean;
  round_length: number;
}

/** 'CreateLobby' return type */
export type ICreateLobbyResult = void;

/** 'CreateLobby' query type */
export interface ICreateLobbyQuery {
  params: ICreateLobbyParams;
  result: ICreateLobbyResult;
}

const createLobbyIR: any = {"usedParamSet":{"lobby_id":true,"num_of_rounds":true,"round_length":true,"play_time_per_player":true,"current_round":true,"initial_random_seed":true,"creation_block_height":true,"created_at":true,"hidden":true,"practice":true,"lobby_creator":true,"lobby_state":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":234,"b":243}]},{"name":"num_of_rounds","required":true,"transform":{"type":"scalar"},"locs":[{"a":248,"b":262}]},{"name":"round_length","required":true,"transform":{"type":"scalar"},"locs":[{"a":267,"b":280}]},{"name":"play_time_per_player","required":true,"transform":{"type":"scalar"},"locs":[{"a":285,"b":306}]},{"name":"current_round","required":false,"transform":{"type":"scalar"},"locs":[{"a":311,"b":324}]},{"name":"initial_random_seed","required":true,"transform":{"type":"scalar"},"locs":[{"a":329,"b":349}]},{"name":"creation_block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":354,"b":376}]},{"name":"created_at","required":true,"transform":{"type":"scalar"},"locs":[{"a":381,"b":392}]},{"name":"hidden","required":true,"transform":{"type":"scalar"},"locs":[{"a":397,"b":404}]},{"name":"practice","required":true,"transform":{"type":"scalar"},"locs":[{"a":409,"b":418}]},{"name":"lobby_creator","required":true,"transform":{"type":"scalar"},"locs":[{"a":423,"b":437}]},{"name":"lobby_state","required":true,"transform":{"type":"scalar"},"locs":[{"a":442,"b":454}]}],"statement":"INSERT INTO lobbies(\n  lobby_id,\n  num_of_rounds,\n  round_length,\n  play_time_per_player,\n  current_round,\n  initial_random_seed,\n  creation_block_height,\n  created_at,\n  hidden,\n  practice,\n  lobby_creator,\n  lobby_state\n)\nVALUES(\n  :lobby_id!,\n  :num_of_rounds!,\n  :round_length!,\n  :play_time_per_player!,\n  :current_round,\n  :initial_random_seed!,\n  :creation_block_height!,\n  :created_at!,\n  :hidden!,\n  :practice!,\n  :lobby_creator!,\n  :lobby_state!\n)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO lobbies(
 *   lobby_id,
 *   num_of_rounds,
 *   round_length,
 *   play_time_per_player,
 *   current_round,
 *   initial_random_seed,
 *   creation_block_height,
 *   created_at,
 *   hidden,
 *   practice,
 *   lobby_creator,
 *   lobby_state
 * )
 * VALUES(
 *   :lobby_id!,
 *   :num_of_rounds!,
 *   :round_length!,
 *   :play_time_per_player!,
 *   :current_round,
 *   :initial_random_seed!,
 *   :creation_block_height!,
 *   :created_at!,
 *   :hidden!,
 *   :practice!,
 *   :lobby_creator!,
 *   :lobby_state!
 * )
 * ```
 */
export const createLobby = new PreparedQuery<ICreateLobbyParams,ICreateLobbyResult>(createLobbyIR);


/** 'JoinPlayerToLobby' parameters type */
export interface IJoinPlayerToLobbyParams {
  lobby_id: string;
  nft_id: number;
  turn: number;
}

/** 'JoinPlayerToLobby' return type */
export type IJoinPlayerToLobbyResult = void;

/** 'JoinPlayerToLobby' query type */
export interface IJoinPlayerToLobbyQuery {
  params: IJoinPlayerToLobbyParams;
  result: IJoinPlayerToLobbyResult;
}

const joinPlayerToLobbyIR: any = {"usedParamSet":{"lobby_id":true,"nft_id":true,"turn":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":67,"b":76}]},{"name":"nft_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":88}]},{"name":"turn","required":true,"transform":{"type":"scalar"},"locs":[{"a":147,"b":152}]}],"statement":"INSERT INTO lobby_player(\n  lobby_id,\n  nft_id,\n  turn\n)\nVALUES(\n  :lobby_id!,\n  :nft_id!,\n                                                     \n  :turn!\n)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO lobby_player(
 *   lobby_id,
 *   nft_id,
 *   turn
 * )
 * VALUES(
 *   :lobby_id!,
 *   :nft_id!,
 *                                                      
 *   :turn!
 * )
 * ```
 */
export const joinPlayerToLobby = new PreparedQuery<IJoinPlayerToLobbyParams,IJoinPlayerToLobbyResult>(joinPlayerToLobbyIR);


/** 'NewRound' parameters type */
export interface INewRoundParams {
  execution_block_height: number | null | void;
  lobby_id: string;
  round_within_match: number;
  starting_block_height: number;
}

/** 'NewRound' return type */
export interface INewRoundResult {
  execution_block_height: number | null;
  id: number;
  lobby_id: string;
  round_within_match: number;
  starting_block_height: number;
}

/** 'NewRound' query type */
export interface INewRoundQuery {
  params: INewRoundParams;
  result: INewRoundResult;
}

const newRoundIR: any = {"usedParamSet":{"lobby_id":true,"round_within_match":true,"starting_block_height":true,"execution_block_height":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":117,"b":126}]},{"name":"round_within_match","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":150}]},{"name":"starting_block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":155,"b":177}]},{"name":"execution_block_height","required":false,"transform":{"type":"scalar"},"locs":[{"a":182,"b":204}]}],"statement":"INSERT INTO rounds(\n  lobby_id,\n  round_within_match,\n  starting_block_height,\n  execution_block_height\n)\nVALUES (\n  :lobby_id!,\n  :round_within_match!,\n  :starting_block_height!,\n  :execution_block_height\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO rounds(
 *   lobby_id,
 *   round_within_match,
 *   starting_block_height,
 *   execution_block_height
 * )
 * VALUES (
 *   :lobby_id!,
 *   :round_within_match!,
 *   :starting_block_height!,
 *   :execution_block_height
 * )
 * RETURNING *
 * ```
 */
export const newRound = new PreparedQuery<INewRoundParams,INewRoundResult>(newRoundIR);


/** 'NewMatchMove' parameters type */
export interface INewMatchMoveParams {
  new_move: {
    lobby_id: string,
    nft_id: number,
    round: number,
    roll_again: boolean
  };
}

/** 'NewMatchMove' return type */
export type INewMatchMoveResult = void;

/** 'NewMatchMove' query type */
export interface INewMatchMoveQuery {
  params: INewMatchMoveParams;
  result: INewMatchMoveResult;
}

const newMatchMoveIR: any = {"usedParamSet":{"new_move":true},"params":[{"name":"new_move","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"lobby_id","required":true},{"name":"nft_id","required":true},{"name":"round","required":true},{"name":"roll_again","required":true}]},"locs":[{"a":68,"b":76}]}],"statement":"INSERT INTO match_moves(lobby_id, nft_id, round, roll_again)\nVALUES :new_move"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO match_moves(lobby_id, nft_id, round, roll_again)
 * VALUES :new_move
 * ```
 */
export const newMatchMove = new PreparedQuery<INewMatchMoveParams,INewMatchMoveResult>(newMatchMoveIR);


/** 'NewStats' parameters type */
export interface INewStatsParams {
  stats: {
    nft_id: number,
    wins: number,
    losses: number,
    ties: number
  };
}

/** 'NewStats' return type */
export type INewStatsResult = void;

/** 'NewStats' query type */
export interface INewStatsQuery {
  params: INewStatsParams;
  result: INewStatsResult;
}

const newStatsIR: any = {"usedParamSet":{"stats":true},"params":[{"name":"stats","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"nft_id","required":true},{"name":"wins","required":true},{"name":"losses","required":true},{"name":"ties","required":true}]},"locs":[{"a":37,"b":42}]}],"statement":"INSERT INTO global_user_state\nVALUES :stats\nON CONFLICT (nft_id)\nDO NOTHING"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO global_user_state
 * VALUES :stats
 * ON CONFLICT (nft_id)
 * DO NOTHING
 * ```
 */
export const newStats = new PreparedQuery<INewStatsParams,INewStatsResult>(newStatsIR);


/** 'UpdateStats' parameters type */
export interface IUpdateStatsParams {
  stats: {
    nft_id: number,
    wins: number,
    losses: number,
    ties: number
  };
}

/** 'UpdateStats' return type */
export type IUpdateStatsResult = void;

/** 'UpdateStats' query type */
export interface IUpdateStatsQuery {
  params: IUpdateStatsParams;
  result: IUpdateStatsResult;
}

const updateStatsIR: any = {"usedParamSet":{"stats":true},"params":[{"name":"stats","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"nft_id","required":true},{"name":"wins","required":true},{"name":"losses","required":true},{"name":"ties","required":true}]},"locs":[{"a":37,"b":42}]}],"statement":"INSERT INTO global_user_state\nVALUES :stats\nON CONFLICT (nft_id)\nDO UPDATE SET\nwins = EXCLUDED.wins,\nlosses = EXCLUDED.losses,\nties = EXCLUDED.ties"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO global_user_state
 * VALUES :stats
 * ON CONFLICT (nft_id)
 * DO UPDATE SET
 * wins = EXCLUDED.wins,
 * losses = EXCLUDED.losses,
 * ties = EXCLUDED.ties
 * ```
 */
export const updateStats = new PreparedQuery<IUpdateStatsParams,IUpdateStatsResult>(updateStatsIR);


