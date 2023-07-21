import React, { Ref, useState } from "react";
import { Box, ButtonBase, Modal, Typography } from "@mui/material";
import { CardId } from "@dice/utils";

export const cardHeight = "160px";
export const cardWidth = "100px";

export type CardProps = {
  cardId: undefined | CardId;
  overlap?: boolean;
};

function StaticCard({
  cardId,
  overlap,
  scale,
  onClick,
  transparent,
}: CardProps & {
  scale: number;
  onClick?: () => void;
  transparent?: boolean;
}): React.ReactElement {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        flex: "none",
        width: `calc(${scale} * ${cardWidth})`,
        height: `calc(${scale} * ${cardHeight})`,
        background: "#BBB",
        borderRadius: "8px",
        border: "1px solid #222",
        position: "relative",
        "&:not(:first-child)": overlap
          ? {
              marginLeft: "-60px",
            }
          : {},
        ...(transparent ? { opacity: 0 } : ""),
      }}
    >
      <Typography
        sx={{
          color: "black",
          fontSize: "2rem",
          lineHeight: "2.5rem",
          position: "absolute",
          top: "10%",
          left: "10%",
        }}
      >
        {cardId}
      </Typography>
    </ButtonBase>
  );
}

export default function Card({
  cardId,
  overlap,
}: CardProps): React.ReactElement {
  const [closeup, setCloseup] = useState(false);

  return (
    <>
      <StaticCard
        cardId={cardId}
        overlap={overlap}
        scale={1}
        onClick={
          // do not close up on with face-down cards
          cardId == null
            ? undefined
            : () => {
                setCloseup(true);
              }
        }
        transparent={closeup}
      />
      <Modal open={closeup} onClose={() => setCloseup(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <StaticCard
            cardId={cardId}
            scale={2}
            onClick={() => {
              // TODO: play card
            }}
          />
        </Box>
      </Modal>
    </>
  );
}
