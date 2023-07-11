import React, { useState, useEffect, useContext } from "react";
import MainController, { Page } from "@src/MainController";
import LandingPage from "./Landing";
import MainMenu from "./MainMenu";
import OpenLobbies from "./OpenLobbies";
import MyGames from "./MyGames";
import CreateLobby from "./CreateLobby";
import { Box, CircularProgress } from "@mui/material";
import { Routes, Route, useNavigate } from "react-router-dom";
import { LobbyState } from "@dice/utils";
import "./PageCoordinator.scss";
import { AppContext } from "@src/main";
import { Lobby } from "./DiceGame/Lobby";
import { useGlobalStateContext } from "@src/GlobalStateContext";
import { PaimaNotice } from "@src/components/PaimaNotice";

const PageCoordinator: React.FC = () => {
  const mainController: MainController = useContext(AppContext);
  const {
    selectedNftState: [selectedNft],
  } = useGlobalStateContext();
  const navigate = useNavigate();

  const [lobby, setLobby] = useState<LobbyState>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const page = mainController.initialState();
    navigate(page);
  }, []);

  useEffect(() => {
    mainController.callback = (
      newPage: Page | null,
      isLoading: boolean,
      extraData: LobbyState | null
    ) => {
      // Update the local state and show a message to the user
      setLoading(isLoading);
      if (newPage === Page.Game) {
        setLobby(extraData);
      }
      if (newPage) {
        navigate(newPage);
      }
    };
  }, []);

  return (
    <div className="dice-app">
      {loading && (
        <div className="overlay">
          <CircularProgress sx={{ ml: 2 }} />
        </div>
      )}
      <Routes>
        <Route path={Page.MainMenu} element={<MainMenu />} />
        <Route path={Page.OpenLobbies} element={<OpenLobbies />} />
        <Route path={Page.MyGames} element={<MyGames />} />
        <Route
          path={Page.Game}
          element={
            <Lobby initialLobbyState={lobby} selectedNft={selectedNft} />
          }
        />
        <Route path={Page.CreateLobby} element={<CreateLobby />} />
        <Route path={Page.Landing} element={<LandingPage />} />
        <Route element={<div>There was something wrong...</div>} />
      </Routes>
      <Box sx={{ marginTop: 3 }} />
      <PaimaNotice />
    </div>
  );
};

export default PageCoordinator;
