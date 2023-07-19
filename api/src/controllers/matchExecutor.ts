import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import { requirePool, getLobbyById, getMatchSeeds, getLobbyPlayers } from '@dice/db';
import { isLobbyActive, type LobbyPlayer, type MatchExecutorData } from '@dice/utils';
import { psqlInt } from '../validation';
import { isLeft } from 'fp-ts/lib/Either';
import { getMatchMoves } from '@dice/db/src/select.queries';

type Response = MatchExecutorData | null;

@Route('match_executor')
export class MatchExecutorController extends Controller {
  @Get()
  public async get(@Query() lobbyID: string, @Query() matchWithinLobby: number): Promise<Response> {
    const valMatch = psqlInt.decode(matchWithinLobby);
    if (isLeft(valMatch)) {
      throw new ValidateError({ round: { message: 'invalid number' } }, '');
    }

    const pool = requirePool();
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    const rawPlayers = await getLobbyPlayers.run({ lobby_id: lobbyID }, pool);
    if (!lobby || !isLobbyActive(lobby)) {
      return null;
    }
    const players: LobbyPlayer[] = rawPlayers.map(raw => ({
      nftId: raw.nft_id,
      points: raw.points,
      score: raw.score,
      turn: raw.turn ?? undefined,
    }));

    const matchSeeds = await getMatchSeeds.run(
      { lobby_id: lobbyID, match_within_lobby: matchWithinLobby },
      pool
    );
    const seeds = matchSeeds.map((seed, i) => ({
      seed: i === 0 ? lobby.initial_random_seed : matchSeeds[i - 1].seed,
      block_height: seed.block_height,
      round: seed.round_within_match,
    }));

    const moves = await getMatchMoves.run(
      { lobby_id: lobbyID, match_within_lobby: matchWithinLobby },
      pool
    );

    return {
      lobby: { ...lobby, round_seed: lobby.initial_random_seed, players },
      seeds,
      moves,
    };
  }
}
