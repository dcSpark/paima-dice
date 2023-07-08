import React, { useContext, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import MainController, { Page } from "@src/MainController";
import { useNavigate } from "react-router-dom";
import Button from "@src/components/Button";
import Wrapper from "@src/components/Wrapper";
import Logo from "@src/components/Logo";
import { AppContext } from "@src/main";
import { buyNft } from "@src/services/contract";
import * as Paima from "@dice/middleware";

const MainMenu = () => {
  const navigate = useNavigate();
  const mainController: MainController = useContext(AppContext);

  const [nfts, setNfts] = useState<number[]>();
  useEffect(() => {
    if (mainController.userAddress == null) return;
    const fetchNfts = async () => {
      const newNfts = await Paima.default.getNftsForWallet(
        mainController.userAddress
      );
      if (!newNfts.success) return;
      setNfts(newNfts.result);
    };
    const interval = setInterval(fetchNfts, 5 * 1000);
    return () => clearInterval(interval);
  }, [mainController.userAddress]);

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
          <Button sx={theme => ({ backgroundColor: theme.palette.menuButton.main })} onClick={() => navigate(Page.CreateLobby)}>Create</Button>
          <Button sx={theme => ({ backgroundColor: theme.palette.menuButton.main })} onClick={() => navigate(Page.OpenLobbies)}>Lobbies</Button>
          <Button sx={theme => ({ backgroundColor: theme.palette.menuButton.main })} onClick={() => navigate(Page.MyGames)}>My Games</Button>
          {mainController.userAddress && (
            <>
              <Button onClick={() => buyNft(mainController.userAddress)}>
                Buy NFT
              </Button>
              <Typography>NFTS: [{nfts.join(",")}]</Typography>
            </>
          )}
        </Box>
      </Wrapper>
    </>
  );
};

export default MainMenu;
