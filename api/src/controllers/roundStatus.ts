import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import { requirePool, getLobbyById, getRoundData, getRoundMoves } from '@dice/db';
import { isLeft } from 'fp-ts/Either';
import { psqlNum } from '../validation.js';
import type { RoundStatusData } from '@dice/utils';

type Response = RoundStatusData | Error;

interface Error {
  error: 'round not found' | 'lobby not found';
}

@Route('round_status')
export class RoundStatusController extends Controller {
  @Get()
  public async get(@Query() lobbyID: string, @Query() round: number): Promise<Response> {
    const pool = requirePool();
    const valRound = psqlNum.decode(round);
    if (isLeft(valRound)) {
      throw new ValidateError({ round: { message: 'invalid number' } }, '');
    } else {
      const [roundData] = await getRoundData.run({ lobby_id: lobbyID, round_number: round }, pool);
      const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
      if (!lobby || !roundData) return { error: 'lobby not found' };
      else {
        const moves = await getRoundMoves.run({ lobby_id: lobbyID, round: round }, pool);
        const uniqueIds = Array.from(new Set(moves.map(m => m.nft_id)));
        return {
          executed: !!roundData.execution_block_height,
          usersWhoSubmittedMoves: uniqueIds,
          roundStarted: roundData.starting_block_height,
          roundLength: lobby.round_length,
        };
      }
    }
  }
}
