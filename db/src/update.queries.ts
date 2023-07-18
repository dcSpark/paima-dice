/** Types generated for queries found in "src/queries/update.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type lobby_status = 'active' | 'closed' | 'finished' | 'open';

/** 'StartMatch' parameters type */
export interface IStartMatchParams {
  lobby_id: string;
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
  max_players: number;
  num_of_rounds: number;
  play_time_per_player: number;
  practice: boolean;
  round_length: number;
  turn: number;
}

/** 'StartMatch' query type */
export interface IStartMatchQuery {
  params: IStartMatchParams;
  result: IStartMatchResult;
}

const startMatchIR: any = {"usedParamSet":{"lobby_id":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":63,"b":72}]}],"statement":"UPDATE lobbies\nSET\n  lobby_state = 'active'\nWHERE\n  lobby_id = :lobby_id!\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobbies
 * SET
 *   lobby_state = 'active'
 * WHERE
 *   lobby_id = :lobby_id!
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

const closeLobbyIR: any = {"usedParamSet":{"lobby_id":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":74}]}],"statement":"UPDATE lobbies\nSET \n  lobby_state = 'closed'\nWHERE \n  lobby_id = :lobby_id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobbies
 * SET 
 *   lobby_state = 'closed'
 * WHERE 
 *   lobby_id = :lobby_id!
 * ```
 */
export const closeLobby = new PreparedQuery<ICloseLobbyParams,ICloseLobbyResult>(closeLobbyIR);


/** 'UpdateLobby' parameters type */
export interface IUpdateLobbyParams {
  lobby_id: string;
  turn: number | null | void;
}

/** 'UpdateLobby' return type */
export type IUpdateLobbyResult = void;

/** 'UpdateLobby' query type */
export interface IUpdateLobbyQuery {
  params: IUpdateLobbyParams;
  result: IUpdateLobbyResult;
}

const updateLobbyIR: any = {"usedParamSet":{"turn":true,"lobby_id":true},"params":[{"name":"turn","required":false,"transform":{"type":"scalar"},"locs":[{"a":29,"b":33}]},{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":55,"b":64}]}],"statement":"UPDATE lobbies\nSET \n  turn = :turn\nWHERE \n  lobby_id = :lobby_id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobbies
 * SET 
 *   turn = :turn
 * WHERE 
 *   lobby_id = :lobby_id!
 * ```
 */
export const updateLobby = new PreparedQuery<IUpdateLobbyParams,IUpdateLobbyResult>(updateLobbyIR);


/** 'UpdateLobbyPlayer' parameters type */
export interface IUpdateLobbyPlayerParams {
  lobby_id: string;
  nft_id: number;
  points: number | null | void;
  score: number | null | void;
  turn: number | null | void;
}

/** 'UpdateLobbyPlayer' return type */
export type IUpdateLobbyPlayerResult = void;

/** 'UpdateLobbyPlayer' query type */
export interface IUpdateLobbyPlayerQuery {
  params: IUpdateLobbyPlayerParams;
  result: IUpdateLobbyPlayerResult;
}

const updateLobbyPlayerIR: any = {"usedParamSet":{"points":true,"score":true,"turn":true,"lobby_id":true,"nft_id":true},"params":[{"name":"points","required":false,"transform":{"type":"scalar"},"locs":[{"a":35,"b":41}]},{"name":"score","required":false,"transform":{"type":"scalar"},"locs":[{"a":54,"b":59}]},{"name":"turn","required":false,"transform":{"type":"scalar"},"locs":[{"a":71,"b":75}]},{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":97,"b":106}]},{"name":"nft_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":121,"b":128}]}],"statement":"UPDATE lobby_player\nSET\n  points = :points,\n  score = :score,\n  turn = :turn\nWHERE \n  lobby_id = :lobby_id! AND nft_id = :nft_id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobby_player
 * SET
 *   points = :points,
 *   score = :score,
 *   turn = :turn
 * WHERE 
 *   lobby_id = :lobby_id! AND nft_id = :nft_id!
 * ```
 */
export const updateLobbyPlayer = new PreparedQuery<IUpdateLobbyPlayerParams,IUpdateLobbyPlayerResult>(updateLobbyPlayerIR);


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


