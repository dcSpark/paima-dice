import type Prando from 'paima-sdk/paima-prando';
import { type MatchState, type MatchEnvironment, type TickEvent, TickEventKind } from '@dice/utils';
import type { IGetCachedMovesResult } from '@dice/db';
import { genDiceRolls, getPlayerScore } from '.';

// Executes a round executor tick and generates a tick event as a result
export function processTick(
  matchEnvironment: MatchEnvironment,
  matchState: MatchState,
  moves: IGetCachedMovesResult[],
  currentTick: number,
  randomnessGenerator: Prando
): TickEvent[] | null {
  const startingStateCache = { ...matchState };
  const events = [];
  // Every tick we intend to process a single move.
  const move = moves[currentTick - 1];

  // Round ends (by returning null) if no more moves in round or game is finished.
  // This is nearly identical to writing a recursive function, where you want to check
  // the base/halt case before running the rest of the logic.
  if (!move) return null;

  // If a move does exist, we continue processing the tick by generating the event.
  // Required for frontend visualization and applying match state updates.
  const score = getPlayerScore(matchState);
  const diceRolls = genDiceRolls(score, randomnessGenerator);
  const diceEvents: TickEvent[] = diceRolls.dice.map((dice, i) => {
    const isLast = i === diceRolls.dice.length - 1;
    return {
      kind: TickEventKind.roll,
      diceRolls: dice,
      rollAgain: !isLast || move.roll_again,
    };
  });

  // We then call `applyEvents` to mutate the `matchState` based off of the event.
  for (const event of diceEvents) {
    applyEvent(matchState, event);
    events.push(event);
  }

  // End round if a turn ended (TODO: add turn end event and delete cache)
  // and 1st player in the turn order goes next
  const roundEndEvents: TickEvent[] =
    startingStateCache.turn !== 1 && matchState.turn === 1
      ? [{ kind: TickEventKind.roundEnd }]
      : [];
  // We then call `applyEvents` to mutate the `matchState` based off of the event.
  for (const event of roundEndEvents) {
    applyEvent(matchState, event);
    events.push(event);
  }

  // We return the tick event which gets emitted by the round executor. This is explicitly
  // for the frontend to know what happened during the current tick.
  return diceEvents;
}

// Apply events to match state for the roundExecutor.
export function applyEvent(matchState: MatchState, event: TickEvent): void {
  if (event.kind === TickEventKind.roll) {
    // apply score
    const addedScore = event.diceRolls.reduce((acc, next) => acc + next, 0);
    matchState[matchState.turn === 1 ? 'player1Score' : 'player2Score'] += addedScore;

    // end turn
    if (event.rollAgain) return;
    matchState.turn = matchState.turn === 1 ? 2 : 1;
    return;
  }
  if (event.kind === TickEventKind.roundEnd) {
    // end round, assign points
    if (matchState.turn !== 1) return;

    // replace going over with -1 score, simplifies logic
    if (matchState.player1Score > 21) matchState.player1Score = -1;
    if (matchState.player2Score > 21) matchState.player2Score = -1;

    // each player scoring 21 in the round gets 2 points.
    const someoneScored21 = [matchState.player1Score, matchState.player2Score].some(
      score => score === 21
    );
    if (someoneScored21) {
      if (matchState.player1Score === 21) matchState.player1Points += 2;
      if (matchState.player2Score === 21) matchState.player2Points += 2;
    } else {
      // if more than one player have the same score, then no point is given to any player.
      // the player closest to 21 gets 1 point.
      if (matchState.player1Score > matchState.player2Score) matchState.player1Points += 1;
      if (matchState.player2Score > matchState.player1Score) matchState.player2Points += 1;
    }

    // reset scores
    matchState.player1Score = 0;
    matchState.player2Score = 0;
  }
}
