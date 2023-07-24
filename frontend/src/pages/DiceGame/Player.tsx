import React from "react";
import "./DiceGame.scss";
import { Box, Typography } from "@mui/material";
import Button from "@src/components/Button";
import Card from "../CardGame/Card";
import Deck from "../CardGame/Deck";
import { LobbyPlayer } from "@dice/game-logic";

export type PlayerProps = {
  lobbyPlayer: LobbyPlayer;
  isThisPlayer?: boolean;
  turn: number;
  onDraw?: () => void;
  onEndTurn?: () => void;
  onPlayCard?: (handPosition: number) => void;
};

export default function Player({
  lobbyPlayer,
  isThisPlayer,
  turn,
  onDraw,
  onEndTurn,
  onPlayCard,
}: PlayerProps): React.ReactElement {
  const isMyTurn = lobbyPlayer.turn === turn;

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        gap: 2,
      }}
    >
      <Box
        sx={{
          flex: "none",
          width: "180px",
          padding: 2,
          background: isMyTurn
            ? "rgba(219, 109, 104, 0.5)"
            : "rgba(119, 109, 104, 0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: "1rem",
            lineHeight: "1.5rem",
          }}
        >
          {isThisPlayer ? "You" : "Opponent"}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: "1.25rem",
            lineHeight: "1.75rem",
          }}
        >
          Points: {lobbyPlayer.points}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: "1.25rem",
            lineHeight: "1.75rem",
          }}
        >
          Score: {lobbyPlayer.score}
        </Typography>
        {isThisPlayer && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
            }}
          >
            <Button disabled={onDraw == null} onClick={onDraw}>
              draw
            </Button>
            <Button disabled={onEndTurn == null} onClick={onEndTurn}>
              end turn
            </Button>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          flex: 1,
          padding: 2,
          background: isMyTurn
            ? "rgba(219, 109, 104, 0.5)"
            : "rgba(119, 109, 104, 0.5)",
          display: "flex",
          overflow: "auto",
          minWidth: 0,
        }}
      >
        {lobbyPlayer.currentHand
          .filter((card) => card.cardId != null)
          .map((card, i) => (
            <Card
              key={card.draw}
              cardId={card.cardId}
              overlap
              onPlay={() => onPlayCard(i)}
            />
          ))}
      </Box>
      <Deck size={lobbyPlayer.currentDeck.length} />
    </Box>
  );
}
