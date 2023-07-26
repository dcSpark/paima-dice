import type { MatchState, LobbyPlayer, ConciseResult, MatchResult, Move } from './types';
import type Prando from 'paima-sdk/paima-prando';

export function canRollAgain(dice: [number, number]): boolean {
  return dice[0] + dice[1] >= 7; // TODO: update to blackjack dice logic
}

export function isValidMove(
  _randomnessGenerator: Prando,
  _matchState: MatchState,
  _move: Move
): boolean {
  return true;
}

export function matchResults(matchState: MatchState): MatchResult {
  // We compute the winner
  const maxPoints = matchState.players.reduce((acc, next) => Math.max(acc, next.points), 0);
  const maxPlayers = matchState.players.filter(player => player.points === maxPoints);
  const results: ConciseResult[] = matchState.players.map(player => {
    if (player.points < maxPoints) return 'l';
    if (maxPlayers.length > 1) return 't';
    return 'w';
  });

  return results;
}

export function cloneMatchState(template: MatchState): MatchState {
  return {
    ...template,
    players: template.players.map(template => {
      return {
        ...template,
        // note: immutable, no need to clone
        startingCommitments: template.startingCommitments,
        currentDeck: [...template.currentDeck],
        currentHand: template.currentHand.map(template => ({
          ...template,
        })),
      };
    }),
  };
}

export function getPlayerScore(matchState: MatchState): number {
  const turnPlayer = getTurnPlayer(matchState);
  return turnPlayer.score;
}

export function getTurnPlayer(matchState: MatchState): LobbyPlayer {
  const turnPlayer = matchState.players.find(player => player.turn === matchState.turn);
  if (turnPlayer == null) throw new Error(`getTurnPlayer: missing player for turn`);
  return turnPlayer;
}

export function getNonTurnPlayer(matchState: MatchState): LobbyPlayer {
  const nonTurnPlayer = matchState.players.find(player => player.turn !== matchState.turn);
  if (nonTurnPlayer == null) throw new Error(`getTurnPlayer: missing player for turn`);
  return nonTurnPlayer;
}
