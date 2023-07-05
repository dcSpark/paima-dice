import type { UserLobby } from '@dice/utils';
import { Chess } from 'chess.js';
import type { WalletAddress } from 'paima-sdk/paima-utils';
import { genDiceRolls, isPoint } from './dice-logic';

export function detectWin(chess: Chess): boolean {
  return chess.isCheckmate();
}

export function gameOverFromChess(chess: Chess): boolean {
  return chess.isGameOver();
}

export function gameOver(fenBoard: string): boolean {
  const chess = new Chess();
  chess.load(fenBoard);
  return gameOverFromChess(chess);
}

export function detectDraw(chess: Chess): boolean {
  return chess.isDraw();
}

export function didPlayerWin(playerColor: string, fen: string): boolean {
  const chess = new Chess();
  chess.load(fen);

  if (chess.isCheckmate() && chess.turn() !== playerColor) {
    return true;
  } else {
    return false;
  }
}

export function isPlayersTurn(player: WalletAddress, lobby: UserLobby) {
  const isWhiteTurn = lobby.current_round % 2 === 1;
  const isCreator = lobby.lobby_creator === player;
  const isWhite = isCreator === lobby.player_one_iswhite;
  return isWhite === isWhiteTurn;
}

// Updates the fenBoard string by applying a new move
export function updateBoard(fenBoard: string, move: string): string {
  const chess = new Chess();
  chess.load(fenBoard);
  chess.move(move);
  return chess.fen();
}

export function isValidMove(randomSeed: number, point: boolean): boolean {
  const dice = genDiceRolls(randomSeed);
  return isPoint(dice) === point;
}
