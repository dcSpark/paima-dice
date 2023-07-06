import React, { useEffect, useMemo, useRef, useState } from "react";
import "./DiceGame.scss";
import { Typography } from "@mui/material";
import type { MatchState, TickEvent, LobbyState } from "@dice/utils";
import { genDiceRolls, isPoint } from "@dice/game-logic";
import * as Paima from "@dice/middleware";
import Navbar from "@src/components/Navbar";
import Wrapper from "@src/components/Wrapper";
import Button from "@src/components/Button";
import { DiceLogic, DiceService } from "./GameLogic";
import ReactDice, { ReactDiceRef } from "react-dice-complete";
import Prando from "paima-sdk/paima-prando";
import { RoundExecutor } from "paima-sdk/paima-executors";

interface DiceGameProps {
  lobby: LobbyState;
  address: string;
}

const DiceGame: React.FC<DiceGameProps> = ({ lobby: initLobby, address }) => {
  const diceRef = useRef<ReactDiceRef>(null);
  const diceLogic = useMemo(() => {
    return new DiceLogic(address);
  }, [address]);

  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const [lobbyState, setLobbyState] = useState<LobbyState>(initLobby);
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
  async function handleMove(): Promise<void> {
    setWaitingConfirmation(true);
    const dice = genDiceRolls(new Prando(lobbyState.round_seed));
    diceRef.current?.rollAll(dice);
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
    diceRef.current?.rollAll(tickEvent.dice);
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

  const isPlayersTurn = useMemo(() => {
    return diceLogic.isThisPlayersTurn(lobbyState, displayedRound);
  }, [address, lobbyState]);
  const disableInteraction =
    displayedRound !== lobbyState.current_round || !isPlayersTurn;

  return (
    <>
      <Navbar />
      <Wrapper small blurred={false}>
        <Typography variant="h1">Chess Board {lobbyState.lobby_id}</Typography>
        {lobbyState && (
          <div className="game">
            <div className="game-score">
              <p className="game-info">Round: {displayedRound}</p>
              <p className="game-info">
                {isPlayersTurn ? "your turn" : "opponent's turn"}
              </p>
            </div>
            <div className="game-score">
              <p className="game-info">You: {displayedState.player1Points}</p>
              <p className="game-info">
                Opponent: {displayedState.player2Points}
              </p>
            </div>
          </div>
        )}
        <ReactDice numDice={2} ref={diceRef} rollDone={rollDone} />
        <Button disabled={disableInteraction} onClick={handleMove}>
          move
        </Button>
      </Wrapper>
    </>
  );
};

export default DiceGame;
