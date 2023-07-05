import type { IGetLobbyByIdResult } from '@dice/db';
import { genDiceRolls, genRandomSeed, isPoint } from '@dice/game-logic';
import type Prando from 'paima-sdk/paima-prando';

//
// PracticeAI generates a move based on the current game state and prando.
//
export class PracticeAI {
  lobby: IGetLobbyByIdResult;
  randomnessGenerator: Prando;

  constructor(lobby: IGetLobbyByIdResult, randomnessGenerator: Prando) {
    this.randomnessGenerator = randomnessGenerator;
    this.lobby = lobby;
  }

  // AI to generate next move
  //
  // Return next move
  // Return null to not send next move.
  public getNextMove(): boolean | null {
    const dice = genDiceRolls(genRandomSeed(this.randomnessGenerator));
    const point = isPoint(dice);
    return point;
  }
}
