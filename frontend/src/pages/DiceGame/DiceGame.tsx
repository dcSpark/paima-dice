import React, { Ref, useEffect, useMemo, useRef, useState } from "react";
import "./DiceGame.scss";
import { Box, Typography } from "@mui/material";
import type { MatchState, TickEvent, LobbyState } from "@dice/utils";
import { genDiceRolls, isPoint } from "@dice/game-logic";
import * as Paima from "@dice/middleware";
import { DiceLogic, DiceService } from "./GameLogic";
import { ReactDiceRef } from "react-dice-complete";
import Prando from "paima-sdk/paima-prando";
import { RoundExecutor } from "paima-sdk/paima-executors";
import Player from "./Player";

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
  const diceRef = useRef<{
    1: undefined | ReactDiceRef;
    2: undefined | ReactDiceRef;
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
  const [displayedState, setDisplayedState] = useState<MatchState>({
    player1Points: lobbyState.player_one_points,
    player2Points: lobbyState.player_two_points,
  });
  const roundExecutor = useRef<
    undefined | RoundExecutor<MatchState, TickEvent>
  >();
  const [isTickDisplaying, setIsTickDisplaying] = useState(false);

  const isThisPlayerPlayerOne = useMemo(() => {
    return diceLogic.isThisPlayerWhite(lobbyState);
  }, [diceLogic, lobbyState]);
  const isPlayersTurn = useMemo(() => {
    return diceLogic.isThisPlayersTurn(lobbyState, displayedRound);
  }, [diceLogic, lobbyState, displayedRound]);
  async function handleMove(): Promise<void> {
    const dice = genDiceRolls(new Prando(lobbyState.round_seed));
    const playerRolling = isThisPlayerPlayerOne ? 1 : 2;
    diceRef.current[playerRolling]?.rollAll(dice);
    const moveResult = await DiceService.submitMove(
      selectedNft,
      lobbyState.lobby_id,
      lobbyState.current_round,
      isPoint(dice)
    );
    console.log("Move result: ", moveResult);

    await refetchLobbyState();
  }

  useEffect(() => {
    // initiate animation display
    if (isTickDisplaying || roundExecutor.current == null) return;

    const tickEvents = roundExecutor.current.tick();
    if (tickEvents == null) {
      // end of round
      setDisplayedRound(displayedRound + 1);
      setDisplayedState(roundExecutor.current.endState());
      roundExecutor.current = undefined;
      return;
    }

    if (tickEvents.length > 1) {
      // TODO: support this
      throw new Error(`Unsupported multiple tick events per tick`);
    }

    const [tickEvent] = tickEvents;
    setIsTickDisplaying(true);
    const playerRolling = tickEvent.nftId === lobbyState.lobby_creator ? 1 : 2;
    diceRef.current[playerRolling]?.rollAll(tickEvent.dice);
  }, [isTickDisplaying, roundExecutor.current]);
  function rollDone() {
    setIsTickDisplaying(false);
  }

  const [isFetchingRound, setIsFetchingRound] = useState(false);
  useEffect(() => {
    // fetch new round data
    if (
      // we're up-to-date
      displayedRound >= lobbyState.current_round ||
      // we already fetched a round
      roundExecutor.current != null ||
      // we're currently fetching
      isFetchingRound
    )
      return;

    setIsFetchingRound(true);
    Paima.default
      .getRoundExecutor(lobbyState.lobby_id, displayedRound, displayedState)
      .then((newRoundExecutor) => {
        if (newRoundExecutor.success) {
          if (diceLogic.isThisPlayersTurn(lobbyState, displayedRound)) {
            // skip replay (it already happened interactively), show final state
            setDisplayedState(newRoundExecutor.result.endState());
            setDisplayedRound(displayedRound + 1);
          } else {
            roundExecutor.current = newRoundExecutor.result;
          }
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
    displayedRound !== lobbyState.current_round || !isPlayersTurn;

  const players: Array<{
    isThisPlayerYou: boolean;
    points: number;
    isThisPlayersTurn: boolean;
    diceRef: Ref<ReactDiceRef>;
  }> = [
    {
      isThisPlayerYou: isThisPlayerPlayerOne,
      points: displayedState.player1Points,
      isThisPlayersTurn: isThisPlayerPlayerOne === isPlayersTurn,
      diceRef: (el) => {
        diceRef.current[1] = el;
      },
    },
    {
      isThisPlayerYou: !isThisPlayerPlayerOne,
      points: displayedState.player2Points,
      isThisPlayersTurn: isThisPlayerPlayerOne !== isPlayersTurn,
      diceRef: (el) => {
        diceRef.current[2] = el;
      },
    },
  ];

  if (lobbyState == null) return <></>;

  return (
    <>
      <Typography
        variant="caption"
        sx={{
          fontSize: "1.5rem",
          lineHeight: "2rem",
        }}
      >
        Round: {displayedRound}
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
            points={player.points}
            isThisPlayersTurn={player.isThisPlayersTurn}
            diceRef={player.diceRef}
            rollDone={rollDone}
            handleMove={handleMove}
          />
        ))}
      </Box>
    </>
  );
};

export default DiceGame;
