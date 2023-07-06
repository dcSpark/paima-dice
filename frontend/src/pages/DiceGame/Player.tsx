import React, { Ref } from "react";
import "./DiceGame.scss";
import { Box, Typography } from "@mui/material";
import Button from "@src/components/Button";
import ReactDice, { ReactDiceRef } from "react-dice-complete";

export default function Player({
  isThisPlayerYou,
  points,
  isThisPlayersTurn,
  diceRef,
  rollDone,
  handleMove,
}: {
  isThisPlayerYou: boolean;
  points: number;
  isThisPlayersTurn: boolean;
  diceRef: Ref<ReactDiceRef>;
  rollDone: () => void;
  handleMove: () => void;
}): React.ReactElement {
  return (
    <Box
      sx={{
        padding: 2,
        background: isThisPlayersTurn
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
        {isThisPlayerYou ? "You" : "Opponent"}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontSize: "1.25rem",
          lineHeight: "1.75rem",
        }}
      >
        Points: {points}
      </Typography>
      <ReactDice
        disableIndividual
        numDice={2}
        ref={diceRef}
        rollDone={rollDone}
      />
      {isThisPlayerYou && (
        <Button disabled={!isThisPlayersTurn} onClick={handleMove}>
          move
        </Button>
      )}
    </Box>
  );
}
