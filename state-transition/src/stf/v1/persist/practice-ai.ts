import { genDiceRolls } from '@dice/game-logic';
import type { MatchState } from '@dice/utils';
import type Prando from 'paima-sdk/paima-prando';

//
// PracticeAI generates a move based on the current game state and prando.
//
export class PracticeAI {
  randomnessGenerator: Prando;
  matchState: MatchState;

  constructor(matchState: MatchState, randomnessGenerator: Prando) {
    this.randomnessGenerator = randomnessGenerator;
    this.matchState = matchState;
  }

  // AI to generate next move
  //
  // Return next move
  // Return null to not send next move.
  public getNextMove(): boolean {
    const score =
      this.matchState.turn === 1 ? this.matchState.player1Score : this.matchState.player2Score;
    const diceRolls = genDiceRolls(score, this.randomnessGenerator);
    return diceRolls.finalScore < 19;
  }
}
