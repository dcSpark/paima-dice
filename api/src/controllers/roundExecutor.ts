import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import { requirePool, getLobbyById, getRoundData, getRoundMoves } from '@dice/db';
import { isLeft } from 'fp-ts/Either';
import { psqlInt } from '../validation.js';
import type { RoundExecutorBackendData } from '@dice/utils';
import { getBlockHeight } from 'paima-sdk/paima-db';

type Response = RoundExecutorBackendData | Error;

interface Error {
  error: 'lobby not found' | 'bad round number' | 'round not found';
}

@Route('round_executor')
export class RoundExecutorController extends Controller {
  @Get()
  public async get(@Query() lobbyID: string, @Query() round: number): Promise<Response> {
    const valRound = psqlInt.decode(round);
    if (isLeft(valRound)) {
      throw new ValidateError({ round: { message: 'invalid number' } }, '');
    }

    const pool = requirePool();
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    if (!lobby) {
      return { error: 'lobby not found' };
    }

    const [last_round_data] =
      round === 0
        ? [undefined]
        : await getRoundData.run({ lobby_id: lobbyID, round_number: round - 1 }, pool);

    const [last_block_height] =
      last_round_data == null
        ? [undefined]
        : await getBlockHeight.run({ block_height: last_round_data.execution_block_height }, pool);
    const seed = last_block_height?.seed ?? lobby.initial_random_seed;

    const moves = await getRoundMoves.run({ lobby_id: lobbyID, round: round }, pool);
    return {
      lobby,
      moves,
      seed,
    };
  }
}
