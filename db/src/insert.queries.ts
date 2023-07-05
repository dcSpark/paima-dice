/** Types generated for queries found in "src/queries/insert.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type lobby_status = 'active' | 'closed' | 'finished' | 'open';

export type match_result = 'loss' | 'tie' | 'win';

/** 'CreateLobby' parameters type */
export interface ICreateLobbyParams {
  created_at: Date;
  creation_block_height: number;
  current_round: number | null | void;
  hidden: boolean;
  initial_random_seed: string;
  lobby_creator: string;
  lobby_id: string;
  lobby_state: lobby_status;
  num_of_rounds: number;
  play_time_per_player: number;
  player_one_iswhite: boolean;
  player_two: string | null | void;
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

const createLobbyIR: any = {"usedParamSet":{"lobby_id":true,"num_of_rounds":true,"round_length":true,"play_time_per_player":true,"current_round":true,"initial_random_seed":true,"creation_block_height":true,"created_at":true,"hidden":true,"practice":true,"lobby_creator":true,"player_one_iswhite":true,"lobby_state":true,"player_two":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":282,"b":291}]},{"name":"num_of_rounds","required":true,"transform":{"type":"scalar"},"locs":[{"a":295,"b":309}]},{"name":"round_length","required":true,"transform":{"type":"scalar"},"locs":[{"a":313,"b":326}]},{"name":"play_time_per_player","required":true,"transform":{"type":"scalar"},"locs":[{"a":330,"b":351}]},{"name":"current_round","required":false,"transform":{"type":"scalar"},"locs":[{"a":355,"b":368}]},{"name":"initial_random_seed","required":true,"transform":{"type":"scalar"},"locs":[{"a":372,"b":392}]},{"name":"creation_block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":396,"b":418}]},{"name":"created_at","required":true,"transform":{"type":"scalar"},"locs":[{"a":422,"b":433}]},{"name":"hidden","required":true,"transform":{"type":"scalar"},"locs":[{"a":437,"b":444}]},{"name":"practice","required":true,"transform":{"type":"scalar"},"locs":[{"a":448,"b":457}]},{"name":"lobby_creator","required":true,"transform":{"type":"scalar"},"locs":[{"a":461,"b":475}]},{"name":"player_one_iswhite","required":true,"transform":{"type":"scalar"},"locs":[{"a":479,"b":498}]},{"name":"lobby_state","required":true,"transform":{"type":"scalar"},"locs":[{"a":502,"b":514}]},{"name":"player_two","required":false,"transform":{"type":"scalar"},"locs":[{"a":518,"b":528}]}],"statement":"INSERT INTO lobbies(\n   lobby_id,\n   num_of_rounds,\n   round_length,\n   play_time_per_player,\n   current_round,\n   initial_random_seed,\n   creation_block_height,\n   created_at,\n   hidden,\n   practice,\n   lobby_creator,\n   player_one_iswhite,\n   lobby_state,\n   player_two)\nVALUES(\n :lobby_id!,\n :num_of_rounds!,\n :round_length!,\n :play_time_per_player!,\n :current_round,\n :initial_random_seed!,\n :creation_block_height!,\n :created_at!,\n :hidden!,\n :practice!,\n :lobby_creator!,\n :player_one_iswhite!,\n :lobby_state!,\n :player_two\n)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO lobbies(
 *    lobby_id,
 *    num_of_rounds,
 *    round_length,
 *    play_time_per_player,
 *    current_round,
 *    initial_random_seed,
 *    creation_block_height,
 *    created_at,
 *    hidden,
 *    practice,
 *    lobby_creator,
 *    player_one_iswhite,
 *    lobby_state,
 *    player_two)
 * VALUES(
 *  :lobby_id!,
 *  :num_of_rounds!,
 *  :round_length!,
 *  :play_time_per_player!,
 *  :current_round,
 *  :initial_random_seed!,
 *  :creation_block_height!,
 *  :created_at!,
 *  :hidden!,
 *  :practice!,
 *  :lobby_creator!,
 *  :player_one_iswhite!,
 *  :lobby_state!,
 *  :player_two
 * )
 * ```
 */
export const createLobby = new PreparedQuery<ICreateLobbyParams,ICreateLobbyResult>(createLobbyIR);


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

const newRoundIR: any = {"usedParamSet":{"lobby_id":true,"round_within_match":true,"starting_block_height":true,"execution_block_height":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":113}]},{"name":"round_within_match","required":true,"transform":{"type":"scalar"},"locs":[{"a":116,"b":135}]},{"name":"starting_block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":138,"b":160}]},{"name":"execution_block_height","required":false,"transform":{"type":"scalar"},"locs":[{"a":163,"b":185}]}],"statement":"INSERT INTO rounds(lobby_id, round_within_match, starting_block_height, execution_block_height)\nVALUES (:lobby_id!, :round_within_match!, :starting_block_height!, :execution_block_height)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO rounds(lobby_id, round_within_match, starting_block_height, execution_block_height)
 * VALUES (:lobby_id!, :round_within_match!, :starting_block_height!, :execution_block_height)
 * RETURNING *
 * ```
 */
export const newRound = new PreparedQuery<INewRoundParams,INewRoundResult>(newRoundIR);


/** 'NewMatchMove' parameters type */
export interface INewMatchMoveParams {
  new_move: {
    lobby_id: string,
    wallet: string,
    round: number,
    is_point: boolean
  };
}

/** 'NewMatchMove' return type */
export type INewMatchMoveResult = void;

/** 'NewMatchMove' query type */
export interface INewMatchMoveQuery {
  params: INewMatchMoveParams;
  result: INewMatchMoveResult;
}

const newMatchMoveIR: any = {"usedParamSet":{"new_move":true},"params":[{"name":"new_move","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"lobby_id","required":true},{"name":"wallet","required":true},{"name":"round","required":true},{"name":"is_point","required":true}]},"locs":[{"a":66,"b":74}]}],"statement":"INSERT INTO match_moves(lobby_id, wallet, round, is_point)\nVALUES :new_move"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO match_moves(lobby_id, wallet, round, is_point)
 * VALUES :new_move
 * ```
 */
export const newMatchMove = new PreparedQuery<INewMatchMoveParams,INewMatchMoveResult>(newMatchMoveIR);


/** 'NewFinalState' parameters type */
export interface INewFinalStateParams {
  final_state: {
    lobby_id: string,
    player_one_iswhite: boolean,
    player_one_wallet: string,
    player_one_result: match_result,
    player_one_elapsed_time: number,
    player_two_wallet: string,
    player_two_result: match_result,
    player_two_elapsed_time: number,
    positions: string
  };
}

/** 'NewFinalState' return type */
export type INewFinalStateResult = void;

/** 'NewFinalState' query type */
export interface INewFinalStateQuery {
  params: INewFinalStateParams;
  result: INewFinalStateResult;
}

const newFinalStateIR: any = {"usedParamSet":{"final_state":true},"params":[{"name":"final_state","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"lobby_id","required":true},{"name":"player_one_iswhite","required":true},{"name":"player_one_wallet","required":true},{"name":"player_one_result","required":true},{"name":"player_one_elapsed_time","required":true},{"name":"player_two_wallet","required":true},{"name":"player_two_result","required":true},{"name":"player_two_elapsed_time","required":true},{"name":"positions","required":true}]},"locs":[{"a":204,"b":215}]}],"statement":"INSERT INTO final_match_state(lobby_id, player_one_iswhite, player_one_wallet, player_one_result, player_one_elapsed_time, player_two_wallet, player_two_result, player_two_elapsed_time, positions)\nVALUES :final_state"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO final_match_state(lobby_id, player_one_iswhite, player_one_wallet, player_one_result, player_one_elapsed_time, player_two_wallet, player_two_result, player_two_elapsed_time, positions)
 * VALUES :final_state
 * ```
 */
export const newFinalState = new PreparedQuery<INewFinalStateParams,INewFinalStateResult>(newFinalStateIR);


/** 'NewStats' parameters type */
export interface INewStatsParams {
  stats: {
    wallet: string,
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

const newStatsIR: any = {"usedParamSet":{"stats":true},"params":[{"name":"stats","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"wallet","required":true},{"name":"wins","required":true},{"name":"losses","required":true},{"name":"ties","required":true}]},"locs":[{"a":37,"b":42}]}],"statement":"INSERT INTO global_user_state\nVALUES :stats\nON CONFLICT (wallet)\nDO NOTHING"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO global_user_state
 * VALUES :stats
 * ON CONFLICT (wallet)
 * DO NOTHING
 * ```
 */
export const newStats = new PreparedQuery<INewStatsParams,INewStatsResult>(newStatsIR);


/** 'UpdateStats' parameters type */
export interface IUpdateStatsParams {
  stats: {
    wallet: string,
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

const updateStatsIR: any = {"usedParamSet":{"stats":true},"params":[{"name":"stats","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"wallet","required":true},{"name":"wins","required":true},{"name":"losses","required":true},{"name":"ties","required":true}]},"locs":[{"a":37,"b":42}]}],"statement":"INSERT INTO global_user_state\nVALUES :stats\nON CONFLICT (wallet)\nDO UPDATE SET\nwins = EXCLUDED.wins,\nlosses = EXCLUDED.losses,\nties = EXCLUDED.ties"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO global_user_state
 * VALUES :stats
 * ON CONFLICT (wallet)
 * DO UPDATE SET
 * wins = EXCLUDED.wins,
 * losses = EXCLUDED.losses,
 * ties = EXCLUDED.ties
 * ```
 */
export const updateStats = new PreparedQuery<IUpdateStatsParams,IUpdateStatsResult>(updateStatsIR);


