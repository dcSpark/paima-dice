import React, { createContext, useContext, useEffect, useState } from "react";
import MainController from "./MainController";
import { AppContext } from "./main";
import { UseStateResponse } from "./utils";
import { WalletAddress } from "paima-sdk/paima-utils";
import * as Paima from "@dice/middleware";

type GlobalState = {
  connectedWallet?: WalletAddress;
  nfts?: number[];
  selectedNftState: UseStateResponse<undefined | number>;
};

export const GlobalStateContext = createContext<GlobalState>(
  null as GlobalState
);

export function GlobalStateProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const mainController: MainController = useContext(AppContext);
  const [connectedWallet, setConnectedWallet] = useState<
    undefined | WalletAddress
  >();
  const [nfts, setNfts] = useState<undefined | number[]>();
  const [selectedNft, setSelectedNft] = useState<undefined | number>();

  useEffect(() => {
    // poll owned nfts
    const interval = setInterval(async () => {
      const newNfts = await mainController.fetchNfts();
      if (newNfts == null) return;
      setNfts(newNfts);
    }, 5000);
    return () => clearInterval(interval);
  }, [mainController]);

  useEffect(() => {
    // poll connection to wallet
    if (connectedWallet != null) return;
    const interval = setInterval(async () => {
      const newWallet = await Paima.default.userWalletLogin("metamask");
      if (!newWallet.success) return;
      setConnectedWallet(newWallet.result.walletAddress);
    }, 2000);
    return () => clearInterval(interval);
  }, [connectedWallet, mainController]);

  const value = React.useMemo<GlobalState>(
    () => ({
      connectedWallet,
      nfts,
      selectedNftState: [selectedNft, setSelectedNft],
    }),
    [connectedWallet, nfts, selectedNft, setSelectedNft]
  );
  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
}

export const useGlobalStateContext = (): GlobalState => {
  const context = React.useContext(GlobalStateContext);
  if (context == null) {
    throw new Error(
      "useGlobalStateContext must be used within an GlobalStateProvider"
    );
  }
  return context;
};
