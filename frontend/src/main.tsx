import React, { createContext } from "react";
import { createRoot } from "react-dom/client";
import PageCoordinator from "./pages/PageCoordinator";
import MainController from "./MainController";
import { BrowserRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import { NftProvider } from "./NftContext";

console.log("[ERWT]: Renderer execution started");
export const AppContext = createContext(null);

const mainController = new MainController();
// Application to Render
const app = (
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <AppContext.Provider value={mainController}>
        <NftProvider>
          <PageCoordinator />
        </NftProvider>
      </AppContext.Provider>
    </BrowserRouter>
  </ThemeProvider>
);

// Render application in DOM
createRoot(document.getElementById("app")).render(app);
