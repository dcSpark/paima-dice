import React, { useContext, useState } from "react";
import {
  Box,
  CircularProgress,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import MainController, { Page } from "@src/MainController";
import { useNavigate } from "react-router-dom";
import Button from "@src/components/Button";
import Wrapper from "@src/components/Wrapper";
import Logo from "@src/components/Logo";
import { buyNft } from "@src/services/contract";
import * as Paima from "@dice/middleware";
import { useGlobalStateContext } from "@src/GlobalStateContext";
import { LoadingButton } from "@mui/lab";
import { Dice, DiceRef } from "./DiceGame/Dice";
import { AppContext } from "@src/main";

const NoNFTMenu = () => {
  const { connectedWallet, nfts } = useGlobalStateContext();
  const [isBuying, setIsBuying] = React.useState<boolean>(false);

  if (!connectedWallet || nfts == null)
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <CircularProgress />
      </Box>
    );
  return (
    <>
      <LoadingButton
        loading={isBuying}
        sx={(theme) => ({
          "&.Mui-disabled": {
            backgroundColor: theme.palette.menuButton.dark,
          },
          backgroundColor: theme.palette.menuButton.main,
        })}
        onClick={async () => {
          try {
            setIsBuying(true);
            await buyNft(connectedWallet);
          } finally {
            setIsBuying(false);
          }
        }}
        variant="contained"
      >
        Create account (NFT)
      </LoadingButton>
      {/* <Select
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
      </Select> */}
    </>
  );
};

const HasNFTMenu = () => {
  const mainController: MainController = useContext(AppContext);
  const {
    selectedNftState: [selectedNft],
  } = useGlobalStateContext();
  const navigate = useNavigate();

  return (
    <>
      <Button
        sx={(theme) => ({ backgroundColor: theme.palette.menuButton.main })}
        // onClick={() => navigate(Page.CreateLobby)}
        onClick={async () => {
          // Creating a lobby is temporarily here, because none of the options are implemented properly
          // so it makes no sense to have a separate page to create a lobby.
          // Note: the number values are not going to be used, hidden lobbies aren't implemented
          // and AI doesn't work on oasis chain because it scheduled inputs don't work there.
          await mainController.createLobby(
            selectedNft,
            10,
            100,
            100,
            false,
            false
          );
        }}
      >
        Create
      </Button>
      <Button
        sx={(theme) => ({ backgroundColor: theme.palette.menuButton.main })}
        onClick={() => navigate(Page.OpenLobbies)}
      >
        Lobbies
      </Button>
      <Button
        sx={(theme) => ({ backgroundColor: theme.palette.menuButton.main })}
        onClick={() => navigate(Page.MyGames)}
      >
        My Games
      </Button>
    </>
  );
};

const MainMenu = () => {
  const {
    connectedWallet,
    selectedNftState: [selectedNft],
  } = useGlobalStateContext();

  if (connectedWallet == null) return <></>;

  return (
    <>
      <Logo height={160} mainMenu />
      <Box paddingTop="96px" />
      <Wrapper small>
        <Box marginTop="48px" />
        <Box
          sx={{
            display: "flex",
            flexFlow: "column",
            gap: "24px",
          }}
        >
          {selectedNft != null ? <HasNFTMenu /> : <NoNFTMenu />}
        </Box>
      </Wrapper>
    </>
  );
};

export default MainMenu;
