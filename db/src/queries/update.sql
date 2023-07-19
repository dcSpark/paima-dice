/* @name startMatch */
UPDATE lobbies
SET
  lobby_state = 'active'
WHERE
  lobby_id = :lobby_id!
RETURNING *;

/* @name closeLobby */
UPDATE lobbies
SET 
  lobby_state = 'closed'
WHERE 
  lobby_id = :lobby_id!;

/* @name updateLobbyTurn */
UPDATE lobbies
SET 
  turn = :turn
WHERE 
  lobby_id = :lobby_id!;

/* @name updateLobbyCurrentRound */
UPDATE lobbies
SET 
  current_round = :current_round
WHERE 
  lobby_id = :lobby_id!;

/* @name updateLobbyPlayer */
UPDATE lobby_player
SET
  points = :points,
  score = :score,
  turn = :turn
WHERE 
  lobby_id = :lobby_id! AND nft_id = :nft_id!;

/* @name endMatch */
UPDATE lobbies
SET  lobby_state = 'finished'
WHERE lobby_id = :lobby_id!;

/* @name executedRound */
UPDATE rounds
SET execution_block_height = :execution_block_height!
WHERE rounds.lobby_id = :lobby_id!
AND rounds.round_within_match = :round!;

/* @name addWin */
UPDATE global_user_state
SET
wins = wins + 1
WHERE nft_id = :nft_id;
/* @name addLoss */
UPDATE global_user_state
SET
losses = losses + 1
WHERE nft_id = :nft_id;
/* @name addTie */
UPDATE global_user_state
SET
ties = ties + 1
WHERE nft_id = :nft_id;