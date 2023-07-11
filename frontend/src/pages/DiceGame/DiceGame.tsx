import React, { Ref, useEffect, useMemo, useRef, useState } from "react";
import "./DiceGame.scss";
import { Box, Typography } from "@mui/material";
import { type MatchState, type TickEvent, type LobbyState } from "@dice/utils";
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
  lobbyState: LobbyState;
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

  useEffect(() => {
    // after user submits an extra roll, we have to wait for the lobby to update
    // and then automatically display the roll
    if (isTickDisplaying) return;

    const nextTurnStillPlayers =
      lobbyState.current_round === displayedRound + 1 &&
      diceLogic.isThisPlayersTurn(lobbyState, displayedState.turn) &&
      diceLogic.isThisPlayersTurn(lobbyState, lobbyState.turn);
    if (!nextTurnStillPlayers) return;

    void (async () => {
      setIsTickDisplaying(true);
      const diceRef = diceRefs.current[isThisPlayerPlayerOne ? 1 : 2];
      const dieRoll = genDieRoll(new Prando(lobbyState.round_seed));
      await diceRef.roll([dieRoll]);
      setDisplayedState((oldDisplayedState) => {
        const newDisplayedState = { ...oldDisplayedState };
        applyEvent(newDisplayedState, {
          diceRolls: [dieRoll],
          // won't be used, just mock value
          rollAgain: true,
        });
        return newDisplayedState;
      });
      setDisplayedRound(displayedRound + 1);
      setIsTickDisplaying(false);
    })();
  }, [isTickDisplaying, isPlayersTurn, displayedRound, lobbyState, diceRefs]);

  async function handlePass(): Promise<void> {
    submit(false);
  }

  useEffect(() => {
    // opponent's turn animation
    if (isTickDisplaying || roundExecutor == null) return;

    void (async () => {
      setIsTickDisplaying(true);

      const tickEvents = roundExecutor.tickEvents;
      const endState = roundExecutor.endState;

      for (const tickEvent of tickEvents) {
        const playerRolling = displayedState.turn === 1 ? 1 : 2;
        await diceRefs.current[playerRolling].roll(tickEvent.diceRolls);
        setDisplayedState((oldDisplayedState) => {
          const newDisplayedState = { ...oldDisplayedState };
          applyEvent(newDisplayedState, tickEvent);
          return newDisplayedState;
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
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
          if (diceLogic.isThisPlayersTurn(lobbyState, fetchedEndState.turn)) {
            // skip replay for this player's round (it already happened interactively)

            // TODO: this is terrible, need to find a way to clean it up
            // last end state it was this players turn and next it's not -> player passed
            // "extra roll" is in another useEffect
            if (
              !diceLogic.isThisPlayersTurn(
                lobbyState,
                newRoundExecutorResults.endState.turn
              )
            ) {
              setDisplayedState(newRoundExecutor.result.endState());
              setDisplayedRound(displayedRound + 1);
            }
          } else {
            setRoundExecutor(newRoundExecutorResults);
          }

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
