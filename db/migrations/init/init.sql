-- Generic paima engine table, that can't be modified
CREATE TABLE block_heights ( 
  block_height INTEGER PRIMARY KEY,
  seed TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false
);

-- Extend the schema to fit your needs
CREATE TYPE lobby_status AS ENUM ('open', 'active', 'finished', 'closed');
CREATE TABLE lobbies (
  lobby_id TEXT PRIMARY KEY,
  max_players INTEGER NOT NULL,
  num_of_rounds INTEGER NOT NULL,
  round_length INTEGER NOT NULL,
  play_time_per_player INTEGER NOT NULL,
  current_round INTEGER NOT NULL DEFAULT 0,
  initial_random_seed TEXT NOT NULL,
  turn INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  creation_block_height INTEGER NOT NULL,
  hidden BOOLEAN NOT NULL DEFAULT false,
  practice BOOLEAN NOT NULL DEFAULT false,
  lobby_creator INTEGER NOT NULL,
  lobby_state lobby_status NOT NULL
);

CREATE TABLE rounds(
  id SERIAL PRIMARY KEY,
  lobby_id TEXT NOT NULL references lobbies(lobby_id),
  round_within_match INTEGER NOT NULL,
  starting_block_height INTEGER NOT NULL references block_heights(block_height),
  execution_block_Height INTEGER references block_heights(block_height)
);

CREATE TYPE match_result AS ENUM ('win', 'tie', 'loss');

CREATE TABLE match_moves (
   id SERIAL PRIMARY KEY,
   lobby_id TEXT NOT NULL references lobbies(lobby_id),
   nft_id INTEGER NOT NULL,
   round INTEGER NOT NULL,
   roll_again BOOLEAN NOT NULL
);

CREATE TABLE global_user_state (
  nft_id INTEGER NOT NULL PRIMARY KEY,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  ties INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE lobby_player (
  id SERIAL PRIMARY KEY,
  lobby_id TEXT NOT NULL references lobbies(lobby_id),
  -- TODO: should ref global_user_state, but bot does not have an entry
  nft_id INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  turn INTEGER
);
