import { Controller, Get, Query, Route } from 'tsoa';
import { getLobbyById, getLobbyPlayers, getRoundData, requirePool } from '@dice/db';
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
    const [[lobby], rawPlayers] = await Promise.all([
      getLobbyById.run({ lobby_id: lobbyID }, pool),
      getLobbyPlayers.run({ lobby_id: lobbyID }, pool),
    ]);
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
}
