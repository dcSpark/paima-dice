import React, { Ref, useEffect, useMemo, useRef, useState } from "react";
import "./DiceGame.scss";
import { Box, Typography } from "@mui/material";
import type { MatchState, TickEvent, LobbyState } from "@dice/utils";
import { genDiceRolls, isPoint } from "@dice/game-logic";
import * as Paima from "@dice/middleware";
import Navbar from "@src/components/Navbar";
import Wrapper from "@src/components/Wrapper";
import { DiceLogic, DiceService } from "./GameLogic";
import { ReactDiceRef } from "react-dice-complete";
import Prando from "paima-sdk/paima-prando";
import { RoundExecutor } from "paima-sdk/paima-executors";
import Player from "./Player";

interface DiceGameProps {
  lobby: LobbyState;
  address: string;
}

const DiceGame: React.FC<DiceGameProps> = ({ lobby: initLobby, address }) => {
  const diceRef = useRef<{
    1: undefined | ReactDiceRef;
    2: undefined | ReactDiceRef;
  }>({ 1: undefined, 2: undefined });
  const diceLogic = useMemo(() => {
    return new DiceLogic(address);
  }, [address]);

  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const [lobbyState, setLobbyState] = useState<LobbyState>(initLobby);

  // round being currently shown
  // interactive if this player's round,
  // passive replay if other player's round
  const [displayedRound, setDisplayedRound] = useState<number>(
    initLobby.current_round
  );
  // end state of last round (latest finished round)
  const [displayedState, setDisplayedState] = useState<MatchState>({
    player1Points: initLobby.player_one_points,
    player2Points: initLobby.player_two_points,
  });
  const roundExecutor = useRef<
    undefined | RoundExecutor<MatchState, TickEvent>
  >();
  const [isTickDisplaying, setIsTickDisplaying] = useState(false);

  useEffect(() => {
    const fetchLobbyData = async () => {
      if (waitingConfirmation) return;
      const lobbyState = await DiceService.getLobbyState(initLobby.lobby_id);
      if (lobbyState == null) return;
      setLobbyState(lobbyState);
    };

    // Fetch data every 5 seconds
    const intervalIdLobby = setInterval(fetchLobbyData, 5 * 1000);

    // Clean up the interval when component unmounts
    return () => {
      clearInterval(intervalIdLobby);
    };
  }, [lobbyState]);
  const isThisPlayerPlayerOne = useMemo(() => {
    return diceLogic.isThisPlayerWhite(lobbyState);
  }, [diceLogic, lobbyState]);
  const isPlayersTurn = useMemo(() => {
    return diceLogic.isThisPlayersTurn(lobbyState, displayedRound);
  }, [diceLogic, lobbyState, displayedRound]);
  async function handleMove(): Promise<void> {
    setWaitingConfirmation(true);
    const dice = genDiceRolls(new Prando(lobbyState.round_seed));
    const playerRolling = isThisPlayerPlayerOne ? 1 : 2;
    diceRef.current[playerRolling]?.rollAll(dice);
    const moveResult = await DiceService.submitMove(
      lobbyState.lobby_id,
      lobbyState.current_round,
      isPoint(dice)
    );
    console.log("Move result: ", moveResult);

    const response = await DiceService.getLobbyState(initLobby.lobby_id);
    if (response == null) return;
    setLobbyState(response);
    setWaitingConfirmation(false);
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
    const playerRolling = tickEvent.user === lobbyState.lobby_creator ? 1 : 2;
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
      <Navbar />
      <Wrapper small blurred={false}>
        <Typography variant="h1">Lobby {lobbyState.lobby_id}</Typography>
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
      </Wrapper>
    </>
  );
};

export default DiceGame;
