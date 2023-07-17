/* 
  @name createLobby 
*/
INSERT INTO lobbies(
  lobby_id,
  num_of_rounds,
  round_length,
  play_time_per_player,
  current_round,
  initial_random_seed,
  creation_block_height,
  created_at,
  hidden,
  practice,
  lobby_creator,
  lobby_state
)
VALUES(
  :lobby_id!,
  :num_of_rounds!,
  :round_length!,
  :play_time_per_player!,
  :current_round,
  :initial_random_seed!,
  :creation_block_height!,
  :created_at!,
  :hidden!,
  :practice!,
  :lobby_creator!,
  :lobby_state!
);

/* @name joinPlayerToLobby */
INSERT INTO lobby_player(
  lobby_id,
  nft_id,
  turn
)
VALUES(
  :lobby_id!,
  :nft_id!,
  /* TODO: decide turn order when starting a match */
  :turn!
);

/* 
  @name newRound
*/
INSERT INTO rounds(
  lobby_id,
  round_within_match,
  starting_block_height,
  execution_block_height
)
VALUES (
  :lobby_id!,
  :round_within_match!,
  :starting_block_height!,
  :execution_block_height
)
RETURNING *;

/* 
  @name newMatchMove
  @param new_move -> (lobby_id!, nft_id!, round!, roll_again!)
*/
INSERT INTO match_moves(lobby_id, nft_id, round, roll_again)
VALUES :new_move;

/* 
  @name newFinalState
  @param final_state -> (
    lobby_id!,
    player_one_iswhite!,
    player_one_nft_id!,
    player_one_result!,
    player_one_elapsed_time!,
    player_two_nft_id!,
    player_two_result!,
    player_two_elapsed_time!
  )
*/
INSERT INTO final_match_state(
  lobby_id,
  player_one_iswhite,
  player_one_nft_id,
  player_one_result,
  player_one_elapsed_time,
  player_two_nft_id,
  player_two_result,
  player_two_elapsed_time
)
VALUES :final_state;

/* @name newStats
  @param stats -> (nft_id!, wins!, losses!, ties!)
*/
INSERT INTO global_user_state
VALUES :stats
ON CONFLICT (nft_id)
DO NOTHING;

/* 
  @name updateStats
  @param stats -> (nft_id!, wins!, losses!, ties!)
*/
INSERT INTO global_user_state
VALUES :stats
ON CONFLICT (nft_id)
DO UPDATE SET
wins = EXCLUDED.wins,
losses = EXCLUDED.losses,
ties = EXCLUDED.ties;