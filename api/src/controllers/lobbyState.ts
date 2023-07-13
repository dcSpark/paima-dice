import { Controller, Get, Query, Route } from 'tsoa';
import { getLobbyById, getRoundData, requirePool } from '@dice/db';
import type { LobbyPlayer, LobbyState } from '@dice/utils';
import { getBlockHeight } from 'paima-sdk/paima-db';

interface Response {
  lobby: LobbyState | null;
}

@Route('lobby_state')
export class LobbyStatecontroller extends Controller {
  @Get()
  public async get(@Query() lobbyID: string): Promise<Response> {
    const pool = requirePool();
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    if (!lobby) return { lobby: null };
    else {
      // null if this is first round
      const [last_round_data] = await getRoundData.run(
        { lobby_id: lobbyID, round_number: lobby.current_round - 1 },
        pool
      );

      const [last_block_height] =
        last_round_data == null
          ? [undefined]
          : await getBlockHeight.run(
              { block_height: last_round_data.execution_block_height },
              pool
            );
      const round_seed = last_block_height?.seed ?? lobby.initial_random_seed;

      const players: LobbyPlayer[] = [
        {
          nftId: lobby.lobby_creator,
          turn: lobby.player_one_iswhite ? 1 : 2,
          points: lobby.player_one_points,
          score: lobby.player_one_score,
        },
      ];
      if (lobby.player_two != null)
        players.push({
          nftId: lobby.player_two,
          turn: lobby.player_one_iswhite ? 2 : 1,
          points: lobby.player_two_points,
          score: lobby.player_two_score,
        });

      return {
        lobby: {
          ...lobby,
          round_seed,
          players,
        },
      };
    }
  }
}
