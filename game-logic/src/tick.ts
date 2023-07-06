import type Prando from 'paima-sdk/paima-prando';
import type { MatchState, MatchEnvironment, TickEvent } from '@dice/utils';
import type { IGetCachedMovesResult } from '@dice/db';
import { genDiceRolls } from '.';

// Executes a round executor tick and generates a tick event as a result
export function processTick(
  matchEnvironment: MatchEnvironment,
  matchState: MatchState,
  moves: IGetCachedMovesResult[],
  currentTick: number,
  randomnessGenerator: Prando
): TickEvent[] | null {
  // Every tick we intend to process a single move.
  const move = moves[currentTick - 1];

  // Round ends (by returning null) if no more moves in round or game is finished.
  // This is nearly identical to writing a recursive function, where you want to check
  // the base/halt case before running the rest of the logic.
  if (!move) return null;

  // If a move does exist, we continue processing the tick by generating the event.
  // Required for frontend visualization and applying match state updates.
  const event: TickEvent = {
    user: move.wallet,
    dice: genDiceRolls(randomnessGenerator),
    isPoint: move.is_point,
  };

  // We then call `applyEvents` to mutate the `matchState` based off of the event.
  applyEvents(matchEnvironment, matchState, event);

  // We return the tick event which gets emitted by the round executor. This is explicitly
  // for the frontend to know what happened during the current tick.
  return [event];
}

// Apply events to match state for the roundExecutor.
function applyEvents(
  matchEnvironment: MatchEnvironment,
  matchState: MatchState,
  event: TickEvent
): void {
  if (event.isPoint) {
    if (event.user === matchEnvironment.user1.wallet) {
      matchState.player1Points = matchState.player1Points + 1;
    }
    if (event.user === matchEnvironment.user2.wallet) {
      matchState.player2Points = matchState.player2Points + 1;
    }
  }
  return;
}
