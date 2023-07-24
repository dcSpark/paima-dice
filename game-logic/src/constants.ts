export const DECK_SIZE = 10;

// Values must match move_kind in db. No need for a type check, it will cause errors somewhere.
export const MOVE_KIND = {
  endTurn: 'end',
  drawCard: 'draw',
} as const;

export const TICK_EVENT_KIND = {
  tx: 'tx',
  postTx: 'postTx',
  applyPoints: 'applyPoints',
  turnEnd: 'turnEnd',
  roundEnd: 'roundEnd',
  matchEnd: 'matchEnd',
} as const;
