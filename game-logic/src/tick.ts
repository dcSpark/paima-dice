import type Prando from 'paima-sdk/paima-prando';
import type {
  ApplyPointsTickEvent,
  RollTickEvent,
  RoundEndTickEvent,
  TurnEndTickEvent,
} from '@dice/utils';
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
  const rollEvents: RollTickEvent[] = diceRolls.dice.map((dice, i) => {
    const isLast = i === diceRolls.dice.length - 1;
    return {
      kind: TickEventKind.roll,
      diceRolls: dice,
      rollAgain: !isLast || move.roll_again,
    };
  });

  // We then call `applyEvents` to mutate the `matchState` based off of the event.
  for (const event of rollEvents) {
    applyEvent(matchState, event);
    events.push(event);
  }

  const turnEnds = !rollEvents[rollEvents.length - 1].rollAgain;
  const roundEnds = turnEnds && matchState.turn === 2; // TODO: last player in turn order

  const applyPointsEvents: ApplyPointsTickEvent[] = (() => {
    if (!roundEnds) return [];

    let player1 = 0;
    let player2 = 0;

    // replace going over with -1 score, simplifies logic
    const score1 = matchState.player1Score > 21 ? -1 : matchState.player1Score;
    const score2 = matchState.player2Score > 21 ? -1 : matchState.player2Score;

    const someoneScored21 = [score1, score2].some(score => score === 21);
    // each player scoring 21 in the round gets 2 points.
    if (someoneScored21) {
      if (score1 === 21) player1 += 2;
      if (score2 === 21) player2 += 2;
    } else {
      // if more than one player have the same score, then no point is given to any player.
      // the player closest to 21 gets 1 point.
      if (score1 > score2) player1 += 1;
      if (score2 > score1) player2 += 1;
    }

    return [
      {
        kind: TickEventKind.applyPoints,
        player1,
        player2,
      },
    ];
  })();
  for (const event of applyPointsEvents) {
    applyEvent(matchState, event);
    events.push(event);
  }

  const turnEndEvents: TurnEndTickEvent[] = turnEnds ? [{ kind: TickEventKind.turnEnd }] : [];
  for (const event of turnEndEvents) {
    applyEvent(matchState, event);
    events.push(event);
  }

  const roundEndEvents: RoundEndTickEvent[] = roundEnds ? [{ kind: TickEventKind.roundEnd }] : [];
  for (const event of roundEndEvents) {
    applyEvent(matchState, event);
    events.push(event);
  }

  // We return the tick event which gets emitted by the round executor. This is explicitly
  // for the frontend to know what happened during the current tick.
  return events;
}

// Apply events to match state for the roundExecutor.
export function applyEvent(matchState: MatchState, event: TickEvent): void {
  if (event.kind === TickEventKind.roll) {
    const addedScore = event.diceRolls.reduce((acc, next) => acc + next, 0);
    matchState[matchState.turn === 1 ? 'player1Score' : 'player2Score'] += addedScore;
    return;
  }

  if (event.kind === TickEventKind.applyPoints) {
    matchState.player1Points += event.player1;
    matchState.player2Points += event.player2;
  }

  if (event.kind === TickEventKind.turnEnd) {
    matchState.turn = matchState.turn === 1 ? 2 : 1;
    return;
  }

  if (event.kind === TickEventKind.roundEnd) {
    // reset scores
    matchState.player1Score = 0;
    matchState.player2Score = 0;
  }
}
