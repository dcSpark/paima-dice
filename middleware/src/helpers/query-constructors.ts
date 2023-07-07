import type { WalletAddress } from 'paima-sdk/paima-utils';
import type { QueryOptions } from 'paima-sdk/paima-mw-core';
import { buildBackendQuery } from 'paima-sdk/paima-mw-core';

export function backendQueryLobbyState(lobbyID: string): string {
  const endpoint = 'lobby_state';
  const options = {
    lobbyID,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQuerySearchLobby(
  nftId: number,
  searchQuery: string,
  page: number,
  count?: number
): string {
  const endpoint = 'search_open_lobbies';
  const options: QueryOptions = { nftId, searchQuery, page };
  if (count !== undefined) {
    options.count = count;
  }

  return buildBackendQuery(endpoint, options);
}

export function backendQueryUserLobbiesBlockheight(nftId: number, blockHeight: number): string {
  const endpoint = 'user_lobbies_blockheight';
  const options = {
    nftId,
    blockHeight,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryRoundStatus(lobbyID: string, round: number): string {
  const endpoint = 'round_status';
  const options = {
    lobbyID,
    round,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryUserStats(nftId: number): string {
  const endpoint = 'user_stats';
  const options = {
    nftId,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryUserLobbies(nftId: number, count?: number, page?: number): string {
  const endpoint = 'user_lobbies';
  const optsStart: QueryOptions = {};
  if (typeof count !== 'undefined') {
    optsStart.count = count;
  }
  if (typeof page !== 'undefined') {
    optsStart.page = page;
  }
  const options = {
    nftId,
    ...optsStart,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryOpenLobbies(nftId: number, count?: number, page?: number): string {
  const endpoint = 'open_lobbies';
  const options: QueryOptions = { nftId };
  if (typeof count !== 'undefined') {
    options.count = count;
  }
  if (typeof page !== 'undefined') {
    options.page = page;
  }
  return buildBackendQuery(endpoint, options);
}

export function backendQueryRoundExecutor(lobbyID: string, round: number): string {
  const endpoint = 'round_executor';
  const options = {
    lobbyID,
    round,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryMatchExecutor(lobbyID: string): string {
  const endpoint = 'match_executor';
  const options = {
    lobbyID,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryMatchWinner(lobbyID: string): string {
  const endpoint = 'match_winner';
  const options = {
    lobbyID,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryNftsForWallet(wallet: WalletAddress): string {
  const endpoint = 'nfts/wallet';
  const options = {
    wallet,
  };
  return buildBackendQuery(endpoint, options);
}
