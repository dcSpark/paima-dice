import { Controller, Get, Query, Route } from 'tsoa';
import { getLobbyById, getLobbyPlayers, requirePool } from '@dice/db';
import { isLobbyActive, type LobbyPlayer, type LobbyState } from '@dice/utils';
import { getBlockHeight } from 'paima-sdk/paima-db';
import { getRound } from '@dice/db/src/select.queries';

interface Response {
  // TODO: returns null if inactive, inactive lobby can be useful too
  lobby: LobbyState | null;
}

@Route('lobby_state')
export class LobbyStatecontroller extends Controller {
  @Get()
  public async get(@Query() lobbyID: string): Promise<Response> {
    const pool = requirePool();
    const [[lobby], rawPlayers] = await Promise.all([
      getLobbyById.run({ lobby_id: lobbyID }, pool),
      getLobbyPlayers.run({ lobby_id: lobbyID }, pool),
    ]);
    if (!lobby) return { lobby: null };

    // TODO: returns null if inactive, inactive lobby can be useful too
    if (!isLobbyActive(lobby)) return { lobby: null };

    // null if this is first round
    const [last_round_data] = await getRound.run(
      {
        lobby_id: lobbyID,
        match_within_lobby: lobby.current_match,
        round_within_match: lobby.current_round - 1,
      },
      pool
    );

    const [last_block_height] =
      last_round_data == null
        ? [undefined]
        : await getBlockHeight.run({ block_height: last_round_data.execution_block_height }, pool);
    const round_seed = last_block_height?.seed ?? lobby.initial_random_seed;

    const players: LobbyPlayer[] = rawPlayers.map(raw => ({
      nftId: raw.nft_id,
      points: raw.points,
      score: raw.score,
      turn: raw.turn ?? undefined,
    }));

    return {
      lobby: {
        ...lobby,
        round_seed,
        players,
      },
    };
  }
}
