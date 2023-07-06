import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool } from '@dice/db';
import { NFT_NAME } from '@dice/utils';
import { getOwnedNfts } from 'paima-sdk/paima-utils-backend';

@Route('nfts')
export class LobbyNFTController extends Controller {
  @Get('wallet')
  public async getWalletNFTs(@Query() wallet: string): Promise<number[]> {
    const pool = requirePool();
    const ownedNftIds = await getOwnedNfts(pool, NFT_NAME, wallet);
    return ownedNftIds.map(id => Number(id));
  }
}
