/* @name getPaginatedOpenLobbies */
SELECT *
FROM lobbies
WHERE lobbies.lobby_state = 'open' AND lobbies.hidden IS FALSE AND lobbies.lobby_creator != :nft_id
ORDER BY created_at DESC
LIMIT :count
OFFSET :page;

/* @name searchPaginatedOpenLobbies */
SELECT *
FROM lobbies
WHERE lobbies.lobby_state = 'open' AND lobbies.hidden IS FALSE AND lobbies.lobby_creator != :nft_id AND lobbies.lobby_id LIKE :searchQuery
ORDER BY created_at DESC
LIMIT :count
OFFSET :page;

/* @name getOpenLobbyById */
SELECT *
FROM lobbies
WHERE lobbies.lobby_state = 'open' AND lobbies.lobby_id = :searchQuery AND lobbies.lobby_creator != :nft_id;

/* @name getLobbyPlayers */
SELECT *
FROM lobby_player
WHERE lobby_player.lobby_id = :lobby_id!;

/* @name getRandomLobby */
SELECT *
FROM lobbies
WHERE random() < 0.1
AND lobbies.lobby_state = 'open' AND lobbies.hidden is FALSE
LIMIT 1;

/* @name getRandomActiveLobby */
SELECT * FROM lobbies
WHERE random() < 0.1
AND lobbies.lobby_state = 'active'
LIMIT 1;

/* @name getUserLobbies */
SELECT lobbies.*
FROM lobbies JOIN lobby_player
  ON lobbies.lobby_id = lobby_player.lobby_id
WHERE lobbies.lobby_state != 'finished'
AND lobbies.lobby_state != 'closed'
AND lobby_player.nft_id = :nft_id!
ORDER BY created_at DESC;

/* @name getPaginatedUserLobbies */
SELECT lobbies.*
FROM lobbies JOIN lobby_player
  ON lobbies.lobby_id = lobby_player.lobby_id
WHERE 
  lobbies.lobby_state != 'finished' AND
  lobbies.lobby_state != 'closed' AND
  lobby_player.nft_id = :nft_id!
GROUP BY lobbies.lobby_id
ORDER BY created_at DESC
LIMIT :count
OFFSET :page;

/* @name getAllPaginatedUserLobbies */
SELECT lobbies.*
FROM 
  lobbies JOIN lobby_player
    ON lobbies.lobby_id = lobby_player.lobby_id
WHERE lobby_player.nft_id = :nft_id!
GROUP BY lobbies.lobby_id
ORDER BY 
  lobby_state = 'active' DESC,
  lobby_state = 'open' DESC,
  lobby_state = 'finished' DESC,
  created_at DESC
LIMIT :count
OFFSET :page;

/* @name getActiveLobbies */
SELECT * FROM lobbies
WHERE lobbies.lobby_state = 'active';

/* @name getLobbyById */
SELECT * FROM lobbies
WHERE lobby_id = :lobby_id;

/* @name getUserStats */
SELECT * FROM global_user_state
WHERE nft_id = :nft_id;

/* @name getBothUserStats */
SELECT global_user_state.nft_id, wins, losses, ties
FROM global_user_state
WHERE global_user_state.nft_id = :nft_id_1
OR global_user_state.nft_id = :nft_id_2;

/* @name getRoundMoves */
SELECT * FROM match_moves
WHERE lobby_id = :lobby_id!
AND   round = :round!;

/* @name getCachedMoves */
SELECT
match_moves.id,
match_moves.lobby_id,
match_moves.nft_id,
match_moves.roll_again,
match_moves.round
FROM match_moves
INNER JOIN rounds
ON match_moves.lobby_id = rounds.lobby_id
AND match_moves.round = rounds.round_within_match
WHERE rounds.execution_block_height IS NULL
AND match_moves.lobby_id = :lobby_id;

/* @name getMovesByLobby */
SELECT *
FROM match_moves
WHERE match_moves.lobby_id = :lobby_id;


/* @name getNewLobbiesByUserAndBlockHeight */
SELECT lobby_id FROM lobbies
WHERE lobby_creator = :nft_id
AND creation_block_height = :block_height;

/* @name getRoundData */
SELECT * FROM rounds
WHERE lobby_id = :lobby_id!
AND round_within_match = :round_number;

/* @name getMatchSeeds */
SELECT * FROM rounds
INNER JOIN block_heights
ON block_heights.block_height = rounds.execution_block_height
WHERE rounds.lobby_id = :lobby_id
ORDER BY rounds.round_within_match ASC;

/* @name getFinalState */
SELECT * FROM final_match_state
WHERE lobby_id = :lobby_id;
