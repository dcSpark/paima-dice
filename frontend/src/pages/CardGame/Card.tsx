import React, { Ref } from "react";
import { Box, Typography } from "@mui/material";
import { CardId } from "@dice/utils";

export const cardHeight = "160px";
export const cardWidth = "100px";

export default function Card({
  cardId,
}: {
  cardId: undefined | CardId;
}): React.ReactElement {
  return (
    <Box
      sx={{
        flex: "none",
        width: cardWidth,
        height: cardHeight,
        background: "#BBB",
        borderRadius: "8px",
        border: "1px solid #222",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        sx={{
          color: "black",
          fontSize: "2rem",
          lineHeight: "2.5rem",
        }}
      >
        {cardId}
      </Typography>
    </Box>
  );
}
