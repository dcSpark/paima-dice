import React, { Ref, useEffect, useMemo, useRef, useState } from "react";
import "./DiceGame.scss";
import { Typography } from "@mui/material";
import type { LobbyState } from "@dice/utils";
import Navbar from "@src/components/Navbar";
import Wrapper from "@src/components/Wrapper";
import { DiceService } from "./GameLogic";
import DiceGame from "./DiceGame";

export function Lobby({
  initialLobbyState,
  selectedNft,
}: {
  initialLobbyState: LobbyState;
  selectedNft: number;
}): React.ReactElement {
  const [lobbyState, setLobbyState] = useState<LobbyState>(initialLobbyState);

  useEffect(() => {
    const fetchLobbyData = async () => {
      const newLobbyState = await DiceService.getLobbyState(
        initialLobbyState.lobby_id
      );
      if (newLobbyState == null) return;
      setLobbyState(newLobbyState);
    };

    // Fetch data every 5 seconds
    const intervalIdLobby = setInterval(fetchLobbyData, 5 * 1000);

    // Clean up the interval when component unmounts
    return () => {
      clearInterval(intervalIdLobby);
    };
  }, [lobbyState]);

  if (lobbyState == null) return <></>;

  return (
    <>
      <Navbar />
      <Wrapper small blurred={false}>
        <Typography variant="h1">Lobby {lobbyState.lobby_id}</Typography>
        {lobbyState.lobby_state === "active" && (
          <DiceGame
            lobbyState={lobbyState}
            selectedNft={selectedNft}
            refetchLobbyState={async () => {
              const response = await DiceService.getLobbyState(
                initialLobbyState.lobby_id
              );
              if (response == null) return;
              setLobbyState(response);
            }}
          />
        )}
      </Wrapper>
    </>
  );
}
