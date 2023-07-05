import type { IGetLobbyByIdResult } from '@dice/db';
import { genDiceRolls, isPoint } from '@dice/game-logic';

//
// PracticeAI generates a move based on the current game state and prando.
//
export class PracticeAI {
  lobby: IGetLobbyByIdResult;

  constructor(lobby: IGetLobbyByIdResult) {
    this.lobby = lobby;
  }

  // AI to generate next move
  //
  // Return next move
  // Return null to not send next move.
  public getNextMove(): boolean {
    const dice = genDiceRolls(this.lobby.current_random_seed);
    const point = isPoint(dice);
    return point;
  }
}
