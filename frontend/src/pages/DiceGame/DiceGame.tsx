import React, { Ref, useEffect, useMemo, useRef, useState } from "react";
import "./DiceGame.scss";
import { Box, Typography } from "@mui/material";
import {
  type MatchState,
  type TickEvent,
  type LobbyStateQuery,
  TickEventKind,
} from "@dice/utils";
import {
  applyEvent,
  buildCurrentMatchState,
  genDieRoll,
  genInitialDiceRolls,
  getPlayerScore,
} from "@dice/game-logic";
import * as Paima from "@dice/middleware";
import { DiceLogic, DiceService } from "./GameLogic";
import Prando from "paima-sdk/paima-prando";
import { RoundExecutor } from "paima-sdk/paima-executors";
import Player from "./Player";
import { DiceRef } from "./Dice";

interface DiceGameProps {
  lobbyState: LobbyStateQuery;
  refetchLobbyState: () => Promise<void>;
  selectedNft: number;
}

const DiceGame: React.FC<DiceGameProps> = ({
  lobbyState,
  refetchLobbyState,
  selectedNft,
}) => {
  const diceRefs = useRef<{
    1: undefined | DiceRef;
    2: undefined | DiceRef;
  }>({ 1: undefined, 2: undefined });
  const diceLogic = useMemo(() => {
    return new DiceLogic(selectedNft);
  }, [selectedNft]);

  const [caption, setCaption] = useState<undefined | string>();

  // round being currently shown
  // interactive if this player's round,
  // passive replay if other player's round
  const [displayedRound, setDisplayedRound] = useState<number>(
    lobbyState.current_round
  );
  // end state of last round (latest finished round)
  const [displayedState, setDisplayedState] = useState<MatchState>(() =>
    buildCurrentMatchState(lobbyState)
  );
  // cache of state that was fetched, but still needs to be displayed
  // the actual round executor is stateful so we store all it's end results instead
  const [roundExecutor, setRoundExecutor] = useState<
    | undefined
    | {
        tickEvents: TickEvent[];
        endState: MatchState;
      }
  >();
  const [isTickDisplaying, setIsTickDisplaying] = useState(false);

  const isThisPlayerPlayerOne = useMemo(() => {
    return diceLogic.isThisPlayerPlayerOne(lobbyState);
  }, [diceLogic, lobbyState]);

  const isPlayersTurn = useMemo(() => {
    return diceLogic.isThisPlayersTurn(lobbyState, displayedState.turn);
  }, [diceLogic, lobbyState, displayedRound]);

  // "forced moves", user has to roll until he gets score 16
  const [initialRollQueue, setInitialRollQueue] = React.useState<
    [number, number][]
  >([]);

  async function submit(rollAgain: boolean) {
    const moveResult = await DiceService.submitMove(
      selectedNft,
      lobbyState.lobby_id,
      lobbyState.current_round,
      rollAgain
    );
    console.log("Move result:", moveResult);
    await refetchLobbyState();
  }
  async function handleRoll(): Promise<void> {
    const startingScore = getPlayerScore(displayedState);
    const diceRef = diceRefs.current[isThisPlayerPlayerOne ? 1 : 2];

    async function playInitialRollFromQueue(queue: [number, number][]) {
      setIsTickDisplaying(true);
      const [playedInitialRoll, ...restInitialRolls] = queue;
      setInitialRollQueue(restInitialRolls);
      await diceRef?.roll(playedInitialRoll);
      setDisplayedState((oldDisplayedState) => {
        const newDisplayedState = { ...oldDisplayedState };
        applyEvent(newDisplayedState, {
          kind: TickEventKind.roll,
          diceRolls: playedInitialRoll,
          // won't be used, just mock value
          rollAgain: true,
        });
        return newDisplayedState;
      });
      setIsTickDisplaying(false);
    }

    // create initial roll queue and roll first
    if (startingScore === 0 && initialRollQueue.length === 0) {
      const newInitialRolls = genInitialDiceRolls(
        new Prando(lobbyState.round_seed)
      ).dice;
      playInitialRollFromQueue(newInitialRolls);
      return;
    }

    // initial roll from existing queue
    if (startingScore < 16 && initialRollQueue.length > 0) {
      playInitialRollFromQueue(initialRollQueue);
      return;
    }

    // real move: submit
    submit(true);
  }

  // User submitted "roll again", we are expecting an extra roll to be shown.
  // This requires a different animation. Basically, we want to show the first roll tick event
  // of the next round, before the next round is complete, and also apply its state changes.
  const isExtraRoll = useMemo(
    () =>
      lobbyState.current_round === displayedRound + 1 &&
      diceLogic.isThisPlayersTurn(lobbyState, displayedState.turn) &&
      diceLogic.isThisPlayersTurn(lobbyState, lobbyState.turn),
    [lobbyState, displayedRound]
  );

  useEffect(() => {
    // after user submits an extra roll, we have to wait for the lobby to update
    // and then automatically display the roll
    if (isTickDisplaying || !isExtraRoll) return;

    void (async () => {
      setIsTickDisplaying(true);
      const diceRef = diceRefs.current[isThisPlayerPlayerOne ? 1 : 2];
      const dieRoll = genDieRoll(new Prando(lobbyState.round_seed));
      await diceRef.roll([dieRoll]);
      setDisplayedState((oldDisplayedState) => {
        const newDisplayedState = { ...oldDisplayedState };
        applyEvent(newDisplayedState, {
          kind: TickEventKind.roll,
          diceRolls: [dieRoll],
          // won't be used, just mock value
          rollAgain: true,
        });
        return newDisplayedState;
      });
      setDisplayedRound(displayedRound + 1);
      // This is a special case, where we didn't use round executor to show replay,
      // but it still got fetched. We have to unset it to allow fetching next round.
      setRoundExecutor(undefined);
      setIsTickDisplaying(false);
    })();
  }, [isTickDisplaying, isPlayersTurn, displayedRound, lobbyState, diceRefs]);

  async function handlePass(): Promise<void> {
    submit(false);
  }

  useEffect(() => {
    // past turn animation (mostly opponents' turns)

    if (
      isTickDisplaying ||
      roundExecutor == null ||
      // see comment before definition of this
      isExtraRoll
    )
      return;

    void (async () => {
      setIsTickDisplaying(true);

      const tickEvents = roundExecutor.tickEvents;
      const endState = roundExecutor.endState;

      for (const tickEvent of tickEvents) {
        // skip replay of this player's actions that already happened interactively
        if (isPlayersTurn && tickEvent.kind === TickEventKind.roll) continue;

        if (tickEvent.kind === TickEventKind.roll) {
          const playerRolling = displayedState.turn === 1 ? 1 : 2;
          await diceRefs.current[playerRolling].roll(tickEvent.diceRolls);
        }
        setDisplayedState((oldDisplayedState) => {
          const newDisplayedState = { ...oldDisplayedState };
          applyEvent(newDisplayedState, tickEvent);
          return newDisplayedState;
        });

        if (tickEvent.kind === TickEventKind.roll)
          await new Promise((resolve) => setTimeout(resolve, 2000));

        if (tickEvent.kind === TickEventKind.applyPoints) {
          setCaption(
            (() => {
              const [thisPlayer, opponent] = isThisPlayerPlayerOne
                ? [tickEvent.player1, tickEvent.player2]
                : [tickEvent.player2, tickEvent.player1];

              if (thisPlayer === 2) return "21! You get 2 points";
              if (thisPlayer === 1) return "You win! You get a point";
              if (opponent === 1) return "You lose! Opponent gets a point";
              if (opponent === 2) return "You lose! Opponent gets 2 points";
              return "It's a tie";
            })()
          );
          await new Promise((resolve) => setTimeout(resolve, 3000));
          setCaption(undefined);
        }
      }

      setDisplayedRound(displayedRound + 1);
      setDisplayedState(endState);

      setIsTickDisplaying(false);
      setRoundExecutor(undefined);
    })();
  }, [isTickDisplaying, roundExecutor]);

  const [isFetchingRound, setIsFetchingRound] = useState(false);
  const [fetchedEndState, setFetchedEndState] = useState<MatchState>(
    buildCurrentMatchState(lobbyState)
  );
  const [nextFetchedRound, setFetchedRound] = useState(
    lobbyState.current_round
  );
  useEffect(() => {
    // fetch new round data
    if (
      // we're up-to-date
      nextFetchedRound >= lobbyState.current_round ||
      // we already fetched a round
      roundExecutor != null ||
      // we're currently fetching
      isFetchingRound
    )
      return;

    setIsFetchingRound(true);
    Paima.default
      .getRoundExecutor(lobbyState.lobby_id, nextFetchedRound, fetchedEndState)
      .then((newRoundExecutor) => {
        if (newRoundExecutor.success) {
          const newRoundExecutorResults = {
            tickEvents: newRoundExecutor.result.processAllTicks(),
            endState: newRoundExecutor.result.endState(),
          };

          setRoundExecutor(newRoundExecutorResults);
          setFetchedRound(nextFetchedRound + 1);
          setFetchedEndState(newRoundExecutorResults.endState);
          setIsFetchingRound(false);
        } else {
          console.error(
            `Failed to fetch round executor: ${
              newRoundExecutor.success === false &&
              newRoundExecutor.errorMessage
            }`
          );
          // delay refetch of fail
          setTimeout(() => {
            setIsFetchingRound(false);
          }, 1000);
        }
      });
  }, [isFetchingRound, displayedRound, lobbyState.current_round]);

  const disableInteraction =
    displayedRound !== lobbyState.current_round ||
    !isPlayersTurn ||
    isTickDisplaying;
  const playerScore = getPlayerScore(displayedState);
  const canRoll = !disableInteraction && playerScore <= 21;
  const canPass = !disableInteraction && playerScore >= 16;

  const players: Array<{
    isThisPlayerYou: boolean;
    score: number;
    points: number;
    isThisPlayersTurn: boolean;
    diceRef: Ref<DiceRef>;
  }> = [
    {
      isThisPlayerYou: isThisPlayerPlayerOne,
      score: displayedState.player1Score,
      points: displayedState.player1Points,
      isThisPlayersTurn: isThisPlayerPlayerOne === isPlayersTurn,
      diceRef: (el) => {
        diceRefs.current[1] = el;
      },
    },
    {
      isThisPlayerYou: !isThisPlayerPlayerOne,
      score: displayedState.player2Score,
      points: displayedState.player2Points,
      isThisPlayersTurn: isThisPlayerPlayerOne !== isPlayersTurn,
      diceRef: (el) => {
        diceRefs.current[2] = el;
      },
    },
  ];

  if (lobbyState == null) return <></>;

  return (
    <>
      <Typography
        variant="caption"
        sx={{ fontSize: "1.25rem", lineHeight: "1.75rem" }}
      >
        {caption ?? (isPlayersTurn ? "Your turn" : "Opponent's turn")}
      </Typography>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          gap: 5,
        }}
      >
        {players.map((player, i) => (
          <Player
            key={i}
            isThisPlayerYou={player.isThisPlayerYou}
            score={player.score}
            points={player.points}
            isThisPlayersTurn={player.isThisPlayersTurn}
            diceRef={player.diceRef}
            onRoll={canRoll ? handleRoll : undefined}
            onPass={canPass ? handlePass : undefined}
          />
        ))}
      </Box>
    </>
  );
};

export default DiceGame;
