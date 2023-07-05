import React, { useEffect, useRef, useState } from "react";
import "./DiceGame.scss";
import { Typography } from "@mui/material";
import { LobbyState } from "@dice/utils";
import { genDiceRolls, isPoint } from "@dice/game-logic";

import Navbar from "@src/components/Navbar";
import Wrapper from "@src/components/Wrapper";
import Button from "@src/components/Button";
import { DiceService } from "./GameLogic";
import ReactDice, { ReactDiceRef } from "react-dice-complete";

interface DiceGameProps {
  lobby: LobbyState;
  address: string;
}

const DiceGame: React.FC<DiceGameProps> = ({ lobby: initLobby, address }) => {
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
    const dice = genDiceRolls(lobbyState.current_random_seed);
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
    setWaitingConfirmation(false);
  }

  const reactDice = useRef<ReactDiceRef>(null);

  const rollDone = (totalValue: number, values: number[]) => {};

  return (
    <>
      <Navbar />
      <Wrapper small blurred={false}>
        <Typography variant="h1">Chess Board {lobbyState.lobby_id}</Typography>
        {lobbyState && (
          <div className="game">
            <p className="game-info">
              Round: {JSON.stringify(lobbyState.current_round)}
            </p>
            <div className="game-score">
              <p className="game-info">You: {lobbyState.player_one_points}</p>
              <p className="game-info">
                Opponent: {lobbyState.player_two_points}
              </p>
            </div>
          </div>
        )}
        <ReactDice numDice={2} ref={reactDice} rollDone={rollDone} />
        <Button onClick={handleMove}>move</Button>
      </Wrapper>
    </>
  );
};

export default DiceGame;
