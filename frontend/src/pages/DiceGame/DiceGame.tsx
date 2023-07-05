import React, { useEffect, useMemo, useRef, useState } from "react";
import "./DiceGame.scss";
import { Typography } from "@mui/material";
import { LobbyState } from "@dice/utils";
import { MatchState, TickEvent, genDiceRolls, isPoint } from "@dice/game-logic";
import * as Paima from "@dice/middleware";
import Navbar from "@src/components/Navbar";
import Wrapper from "@src/components/Wrapper";
import Button from "@src/components/Button";
import { DiceLogic, DiceService } from "./GameLogic";
import ReactDice, { ReactDiceRef } from "react-dice-complete";
import Prando from "paima-sdk/paima-prando";

interface DiceGameProps {
  lobby: LobbyState;
  address: string;
}

const DiceGame: React.FC<DiceGameProps> = ({ lobby: initLobby, address }) => {
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const [lobbyState, setLobbyState] = useState<LobbyState>(initLobby);
  const [playingRound, setPlayingRound] = useState<number>(
    initLobby.current_round
  );
  const [tickEvents, setTickEvents] = useState<TickEvent[]>([]);
  const [tickPlaying, setTickPlaying] = useState(false);
  const [isFetchingRound, setIsFetchingRound] = useState(false);

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

  useEffect(() => {
    // fetch new round data
    if (
      isFetchingRound ||
      playingRound >= lobbyState.current_round ||
      tickEvents.length !== 0
    )
      return;

    setIsFetchingRound(true);
    Paima.default
      .getRoundExecutor(lobbyState.lobby_id, playingRound)
      .then((roundExecutor) => {
        if (roundExecutor.success) {
          const tickEvents = roundExecutor.result.processAllTicks();
          setTickEvents(tickEvents);
        }
        setIsFetchingRound(false);
      });
  }, [
    setIsFetchingRound,
    isFetchingRound,
    playingRound,
    lobbyState.current_round,
    tickEvents.length,
  ]);

  useEffect(() => {
    // initiate tick
    if (tickPlaying || tickEvents.length === 0) return;

    const [tickEvent] = tickEvents;
    setTickPlaying(true);
    reactDice.current?.rollAll(tickEvent.dice);
  }, [tickPlaying, tickEvents.length]);

  function rollDone() {
    if (tickPlaying)
      setTimeout(() => {
        const remainingTickEvents = tickEvents.slice(1);
        if (remainingTickEvents.length === 0) setPlayingRound(playingRound + 1);
        setTickEvents(remainingTickEvents);
        setTickPlaying(false);
      }, 500);
  }

  async function handleMove(): Promise<void> {
    setWaitingConfirmation(true);
    const dice = genDiceRolls(new Prando(lobbyState.round_seed));
    reactDice.current?.rollAll(dice);
    const moveResult = await DiceService.submitMove(
      lobbyState.lobby_id,
      lobbyState.current_round,
      isPoint(dice)
    );
    console.log("Move result: ", moveResult);

    const response = await DiceService.getLobbyState(initLobby.lobby_id);
    if (response == null) return;
    setLobbyState(response);
    setPlayingRound(playingRound + 1);
    setWaitingConfirmation(false);
  }

  const reactDice = useRef<ReactDiceRef>(null);

  const isPlayersTurn = useMemo(() => {
    const diceLogic = new DiceLogic(address);
    return diceLogic.isThisPlayersTurn(lobbyState, playingRound);
  }, [address, lobbyState]);

  const disableInteraction =
    playingRound !== lobbyState.current_round || !isPlayersTurn;

  return (
    <>
      <Navbar />
      <Wrapper small blurred={false}>
        <Typography variant="h1">Chess Board {lobbyState.lobby_id}</Typography>
        {lobbyState && (
          <div className="game">
            <div className="game-score">
              <p className="game-info">Round: {playingRound}</p>
              <p className="game-info">
                {isPlayersTurn ? "your turn" : "opponent's turn"}
              </p>
            </div>
            <div className="game-score">
              <p className="game-info">You: {lobbyState.player_one_points}</p>
              <p className="game-info">
                Opponent: {lobbyState.player_two_points}
              </p>
            </div>
          </div>
        )}
        <ReactDice numDice={2} ref={reactDice} rollDone={rollDone} />
        <Button disabled={disableInteraction} onClick={handleMove}>
          move
        </Button>
      </Wrapper>
    </>
  );
};

export default DiceGame;
