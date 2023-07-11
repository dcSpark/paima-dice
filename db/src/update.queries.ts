/** Types generated for queries found in "src/queries/update.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type lobby_status = 'active' | 'closed' | 'finished' | 'open';

/** 'StartMatch' parameters type */
export interface IStartMatchParams {
  lobby_id: string;
  player_two: number;
}

/** 'StartMatch' return type */
export interface IStartMatchResult {
  created_at: Date;
  creation_block_height: number;
  current_round: number;
  hidden: boolean;
  initial_random_seed: string;
  lobby_creator: number;
  lobby_id: string;
  lobby_state: lobby_status;
  num_of_rounds: number;
  play_time_per_player: number;
  player_one_iswhite: boolean;
  player_one_points: number;
  player_one_score: number;
  player_two: number | null;
  player_two_points: number;
  player_two_score: number;
  practice: boolean;
  round_length: number;
  turn: number;
}

/** 'StartMatch' query type */
export interface IStartMatchQuery {
  params: IStartMatchParams;
  result: IStartMatchResult;
}

const startMatchIR: any = {"usedParamSet":{"player_two":true,"lobby_id":true},"params":[{"name":"player_two","required":true,"transform":{"type":"scalar"},"locs":[{"a":58,"b":69}]},{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":88,"b":97}]}],"statement":"UPDATE lobbies\nSET  \nlobby_state = 'active',\nplayer_two = :player_two!\nWHERE lobby_id = :lobby_id!\nAND player_two IS NULL\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobbies
 * SET  
 * lobby_state = 'active',
 * player_two = :player_two!
 * WHERE lobby_id = :lobby_id!
 * AND player_two IS NULL
 * RETURNING *
 * ```
 */
export const startMatch = new PreparedQuery<IStartMatchParams,IStartMatchResult>(startMatchIR);


/** 'CloseLobby' parameters type */
export interface ICloseLobbyParams {
  lobby_id: string;
}

/** 'CloseLobby' return type */
export type ICloseLobbyResult = void;

/** 'CloseLobby' query type */
export interface ICloseLobbyQuery {
  params: ICloseLobbyParams;
  result: ICloseLobbyResult;
}

const closeLobbyIR: any = {"usedParamSet":{"lobby_id":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":61,"b":70}]}],"statement":"UPDATE lobbies\nSET  \nlobby_state = 'closed'\nWHERE lobby_id = :lobby_id!\nAND player_two IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobbies
 * SET  
 * lobby_state = 'closed'
 * WHERE lobby_id = :lobby_id!
 * AND player_two IS NULL
 * ```
 */
export const closeLobby = new PreparedQuery<ICloseLobbyParams,ICloseLobbyResult>(closeLobbyIR);


/** 'UpdateRound' parameters type */
export interface IUpdateRoundParams {
  lobby_id: string;
  round: number;
}

/** 'UpdateRound' return type */
export type IUpdateRoundResult = void;

/** 'UpdateRound' query type */
export interface IUpdateRoundQuery {
  params: IUpdateRoundParams;
  result: IUpdateRoundResult;
}

const updateRoundIR: any = {"usedParamSet":{"round":true,"lobby_id":true},"params":[{"name":"round","required":true,"transform":{"type":"scalar"},"locs":[{"a":35,"b":41}]},{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":60,"b":69}]}],"statement":"UPDATE lobbies\nSET current_round = :round!\nWHERE lobby_id = :lobby_id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobbies
 * SET current_round = :round!
 * WHERE lobby_id = :lobby_id!
 * ```
 */
export const updateRound = new PreparedQuery<IUpdateRoundParams,IUpdateRoundResult>(updateRoundIR);


/** 'UpdateLatestMatchState' parameters type */
export interface IUpdateLatestMatchStateParams {
  lobby_id: string;
  player_one_points: number;
  player_one_score: number;
  player_two_points: number;
  player_two_score: number;
  turn: number;
}

/** 'UpdateLatestMatchState' return type */
export type IUpdateLatestMatchStateResult = void;

/** 'UpdateLatestMatchState' query type */
export interface IUpdateLatestMatchStateQuery {
  params: IUpdateLatestMatchStateParams;
  result: IUpdateLatestMatchStateResult;
}

const updateLatestMatchStateIR: any = {"usedParamSet":{"player_one_points":true,"player_two_points":true,"player_one_score":true,"player_two_score":true,"turn":true,"lobby_id":true},"params":[{"name":"player_one_points","required":true,"transform":{"type":"scalar"},"locs":[{"a":41,"b":59}]},{"name":"player_two_points","required":true,"transform":{"type":"scalar"},"locs":[{"a":84,"b":102}]},{"name":"player_one_score","required":true,"transform":{"type":"scalar"},"locs":[{"a":126,"b":143}]},{"name":"player_two_score","required":true,"transform":{"type":"scalar"},"locs":[{"a":167,"b":184}]},{"name":"turn","required":true,"transform":{"type":"scalar"},"locs":[{"a":196,"b":201}]},{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":220,"b":229}]}],"statement":"UPDATE lobbies\nSET\n  player_one_points = :player_one_points!,\n  player_two_points = :player_two_points!,\n  player_one_score = :player_one_score!,\n  player_two_score = :player_two_score!,\n  turn = :turn!\nWHERE lobby_id = :lobby_id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobbies
 * SET
 *   player_one_points = :player_one_points!,
 *   player_two_points = :player_two_points!,
 *   player_one_score = :player_one_score!,
 *   player_two_score = :player_two_score!,
 *   turn = :turn!
 * WHERE lobby_id = :lobby_id!
 * ```
 */
export const updateLatestMatchState = new PreparedQuery<IUpdateLatestMatchStateParams,IUpdateLatestMatchStateResult>(updateLatestMatchStateIR);


/** 'EndMatch' parameters type */
export interface IEndMatchParams {
  lobby_id: string;
}

/** 'EndMatch' return type */
export type IEndMatchResult = void;

/** 'EndMatch' query type */
export interface IEndMatchQuery {
  params: IEndMatchParams;
  result: IEndMatchResult;
}

const endMatchIR: any = {"usedParamSet":{"lobby_id":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":62,"b":71}]}],"statement":"UPDATE lobbies\nSET  lobby_state = 'finished'\nWHERE lobby_id = :lobby_id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobbies
 * SET  lobby_state = 'finished'
 * WHERE lobby_id = :lobby_id!
 * ```
 */
export const endMatch = new PreparedQuery<IEndMatchParams,IEndMatchResult>(endMatchIR);


/** 'ExecutedRound' parameters type */
export interface IExecutedRoundParams {
  execution_block_height: number;
  lobby_id: string;
  round: number;
}

/** 'ExecutedRound' return type */
export type IExecutedRoundResult = void;

/** 'ExecutedRound' query type */
export interface IExecutedRoundQuery {
  params: IExecutedRoundParams;
  result: IExecutedRoundResult;
}

const executedRoundIR: any = {"usedParamSet":{"execution_block_height":true,"lobby_id":true,"round":true},"params":[{"name":"execution_block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":43,"b":66}]},{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":92,"b":101}]},{"name":"round","required":true,"transform":{"type":"scalar"},"locs":[{"a":135,"b":141}]}],"statement":"UPDATE rounds\nSET execution_block_height = :execution_block_height!\nWHERE rounds.lobby_id = :lobby_id!\nAND rounds.round_within_match = :round!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE rounds
 * SET execution_block_height = :execution_block_height!
 * WHERE rounds.lobby_id = :lobby_id!
 * AND rounds.round_within_match = :round!
 * ```
 */
export const executedRound = new PreparedQuery<IExecutedRoundParams,IExecutedRoundResult>(executedRoundIR);


/** 'AddWin' parameters type */
export interface IAddWinParams {
  nft_id: number | null | void;
}

/** 'AddWin' return type */
export type IAddWinResult = void;

/** 'AddWin' query type */
export interface IAddWinQuery {
  params: IAddWinParams;
  result: IAddWinResult;
}

const addWinIR: any = {"usedParamSet":{"nft_id":true},"params":[{"name":"nft_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":60,"b":66}]}],"statement":"UPDATE global_user_state\nSET\nwins = wins + 1\nWHERE nft_id = :nft_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE global_user_state
 * SET
 * wins = wins + 1
 * WHERE nft_id = :nft_id
 * ```
 */
export const addWin = new PreparedQuery<IAddWinParams,IAddWinResult>(addWinIR);


/** 'AddLoss' parameters type */
export interface IAddLossParams {
  nft_id: number | null | void;
}

/** 'AddLoss' return type */
export type IAddLossResult = void;

/** 'AddLoss' query type */
export interface IAddLossQuery {
  params: IAddLossParams;
  result: IAddLossResult;
}

const addLossIR: any = {"usedParamSet":{"nft_id":true},"params":[{"name":"nft_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":64,"b":70}]}],"statement":"UPDATE global_user_state\nSET\nlosses = losses + 1\nWHERE nft_id = :nft_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE global_user_state
 * SET
 * losses = losses + 1
 * WHERE nft_id = :nft_id
 * ```
 */
export const addLoss = new PreparedQuery<IAddLossParams,IAddLossResult>(addLossIR);


/** 'AddTie' parameters type */
export interface IAddTieParams {
  nft_id: number | null | void;
}

/** 'AddTie' return type */
export type IAddTieResult = void;

/** 'AddTie' query type */
export interface IAddTieQuery {
  params: IAddTieParams;
  result: IAddTieResult;
}

const addTieIR: any = {"usedParamSet":{"nft_id":true},"params":[{"name":"nft_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":60,"b":66}]}],"statement":"UPDATE global_user_state\nSET\nties = ties + 1\nWHERE nft_id = :nft_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE global_user_state
 * SET
 * ties = ties + 1
 * WHERE nft_id = :nft_id
 * ```
 */
export const addTie = new PreparedQuery<IAddTieParams,IAddTieResult>(addTieIR);


