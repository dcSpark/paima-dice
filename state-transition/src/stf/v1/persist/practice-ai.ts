import type { MatchState, MoveKind } from '@dice/game-logic';
import { MOVE_KIND, getTurnPlayer } from '@dice/game-logic';
import { PRACTICE_BOT_NFT_ID } from '@dice/utils';
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
  public getNextMove(): MoveKind {
    const me = getTurnPlayer(this.matchState);
    if (me.nftId !== PRACTICE_BOT_NFT_ID)
      throw new Error(`getNextMove: bot move for non-bot player`);
    // Note: matchState is at the end of last round, i.e. without current round's post-tx events.
    // That means this way the bot will draw until it has 5 cards
    return me.currentHand.length < 4 ? MOVE_KIND.drawCard : MOVE_KIND.endTurn;
  }
}
