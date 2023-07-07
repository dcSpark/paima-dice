import React, { useContext, useEffect, useState } from "react";
import { Box, MenuItem, Select, Typography } from "@mui/material";
import MainController, { Page } from "@src/MainController";
import { useNavigate } from "react-router-dom";
import Button from "@src/components/Button";
import Wrapper from "@src/components/Wrapper";
import Logo from "@src/components/Logo";
import { AppContext } from "@src/main";
import { buyNft } from "@src/services/contract";
import * as Paima from "@dice/middleware";
import { useGlobalStateContext } from "@src/GlobalStateContext";

const MainMenu = () => {
  const navigate = useNavigate();
  const {
    connectedWallet,
    nfts,
    selectedNftState: [selectedNft, setSelectedNft],
  } = useGlobalStateContext();

  return (
    <>
      <Logo height={160} mainMenu />
      <Box paddingTop="96px" />
      <Wrapper small>
        <Typography variant="h1" marginTop="96px">
          Running on Paima Engine
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexFlow: "column",
            gap: "24px",
          }}
        >
          <Button
            disabled={selectedNft == null}
            sx={(theme) => ({ backgroundColor: theme.palette.menuButton.main })}
            onClick={() => navigate(Page.CreateLobby)}
          >
            Create
          </Button>
          <Button
            disabled={selectedNft == null}
            sx={(theme) => ({ backgroundColor: theme.palette.menuButton.main })}
            onClick={() => navigate(Page.OpenLobbies)}
          >
            Lobbies
          </Button>
          <Button
            disabled={selectedNft == null}
            sx={(theme) => ({ backgroundColor: theme.palette.menuButton.main })}
            onClick={() => navigate(Page.MyGames)}
          >
            My Games
          </Button>
          {connectedWallet && (
            <>
              <Button onClick={() => buyNft(connectedWallet)}>Buy NFT</Button>
              <Select
                value={selectedNft ?? ""}
                onChange={(event) => {
                  const newValue = event.target.value;
                  if (typeof newValue !== "number") return;
                  setSelectedNft(newValue);
                }}
              >
                {nfts?.map((nft) => (
                  <MenuItem key={nft} value={nft}>
                    {nft}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        </Box>
      </Wrapper>
    </>
  );
};

export default MainMenu;
