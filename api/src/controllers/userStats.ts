import { Body, Controller, Get, Path, Post, Query, Route, SuccessResponse } from 'tsoa';
import { requirePool, getUserStats } from '@dice/db';
import type { UserStats } from '@dice/utils';

interface Response {
  stats: UserStats;
}

@Route('user_stats')
export class UserStatsController extends Controller {
  @Get()
  public async get(@Query() wallet: string): Promise<Response> {
    const pool = requirePool();
    wallet = wallet.toLowerCase();
    const [stats] = await getUserStats.run({ wallet }, pool);
    return { stats };
  }
}
