import { Controller, Get, Query, Route } from 'tsoa';
import {
  requirePool,
  getLobbyById,
  getMatchSeeds,
  getMovesByLobby,
  getLobbyPlayers,
} from '@dice/db';
import type { LobbyPlayer, MatchExecutorData } from '@dice/utils';

type Response = MatchExecutorData | null;

@Route('match_executor')
export class MatchExecutorController extends Controller {
  @Get()
  public async get(@Query() lobbyID: string): Promise<Response> {
    const pool = requirePool();
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    const rawPlayers = await getLobbyPlayers.run({ lobby_id: lobbyID }, pool);
    if (!lobby) {
      return null;
    }
    const players: LobbyPlayer[] = rawPlayers.map(raw => ({
      nftId: raw.nft_id,
      points: raw.points,
      score: raw.score,
      turn: raw.turn ?? undefined,
    }));

    // sorted
    const rounds = await getMatchSeeds.run({ lobby_id: lobbyID }, pool);
    const seeds = rounds.map((round, i) => ({
      seed: i === 0 ? lobby.initial_random_seed : rounds[i - 1].seed,
      block_height: round.block_height,
      round: round.round_within_match,
    }));
    const moves = await getMovesByLobby.run({ lobby_id: lobbyID }, pool);
    return { lobby: { ...lobby, round_seed: lobby.initial_random_seed, players }, seeds, moves };
  }
}
