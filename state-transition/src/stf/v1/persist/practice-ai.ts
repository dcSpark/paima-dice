import { genDiceRolls, isPoint } from '@dice/game-logic';
import type Prando from 'paima-sdk/paima-prando';

//
// PracticeAI generates a move based on the current game state and prando.
//
export class PracticeAI {
  randomnessGenerator: Prando;

  constructor(randomnessGenerator: Prando) {
    this.randomnessGenerator = randomnessGenerator;
  }

  // AI to generate next move
  //
  // Return next move
  // Return null to not send next move.
  public getNextMove(): boolean {
    const dice = genDiceRolls(this.randomnessGenerator);
    const point = isPoint(dice);
    return point;
  }
}
