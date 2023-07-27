import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import { requirePool } from '@dice/db';
import { isLeft } from 'fp-ts/Either';
import { psqlInt } from '../validation.js';
import type { IGetOwnedPacksResult } from '@dice/db/src/select.queries.js';
import { getOwnedPacks } from '@dice/db/src/select.queries.js';

interface Response {
  packs: IGetOwnedPacksResult[];
}

@Route('user')
export class UserController extends Controller {
  @Get('packs')
  public async get(@Query() nftId: number): Promise<Response> {
    const dbConn = requirePool();
    const valNftId = psqlInt.decode(nftId);
    if (isLeft(valNftId)) {
      throw new ValidateError({ round: { message: 'invalid nft id' } }, '');
    }
    const packs = await getOwnedPacks.run({ owner_nft_id: nftId }, dbConn);

    return { packs };
  }
}
