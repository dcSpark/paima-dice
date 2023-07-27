import { Controller, Get, Query, Route } from 'tsoa';
import { getOwnedNft, requirePool } from '@dice/db';
import { NFT_NAME } from '@dice/utils';

interface Response {
  nft: undefined | number;
}

@Route('nfts')
export class LobbyNFTController extends Controller {
  @Get('wallet')
  public async getWalletNFT(@Query() wallet: string): Promise<Response> {
    const pool = requirePool();
    const result = await getOwnedNft(pool, NFT_NAME, wallet);
    return { nft: result };
  }
}
