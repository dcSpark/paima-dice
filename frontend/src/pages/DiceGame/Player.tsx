import React, { Ref, useEffect } from "react";
import "./DiceGame.scss";
import { Box, Typography } from "@mui/material";
import Button from "@src/components/Button";
import { Dice, DiceRef } from "./Dice";

export type PlayerProps = {
  diceRef: Ref<DiceRef>;
  isThisPlayerYou: boolean;
  score: number;
  points: number;
  isThisPlayersTurn: boolean;
  onRoll: undefined | (() => void);
  onPass: undefined | (() => void);
};

export default function Player({
  diceRef,
  isThisPlayerYou,
  score,
  points,
  isThisPlayersTurn,
  onRoll,
  onPass,
}: PlayerProps): React.ReactElement {
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
      <Typography
        variant="caption"
        sx={{
          fontSize: "1.25rem",
          lineHeight: "1.75rem",
        }}
      >
        Score: {score}
      </Typography>
      <Dice
        ref={diceRef}
        disableIndividual
        faceColor="#A51C3E"
        dotColor="#FFEEEE"
      />
      {isThisPlayerYou && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Button disabled={onRoll == null} onClick={onRoll}>
            roll
          </Button>
          <Button disabled={onPass == null} onClick={onPass}>
            pass
          </Button>
        </Box>
      )}
    </Box>
  );
}
