import React, { createContext, useContext, useEffect, useState } from "react";
import MainController from "./MainController";
import { AppContext } from "./main";
import { UseStateResponse } from "./utils";
import { WalletAddress } from "paima-sdk/paima-utils";
import * as Paima from "@dice/middleware";
import ConnectingModal from "./ConnectingModal";
import { PaimaNotice } from "./components/PaimaNotice";

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
      if (connectedWallet == null) return;

      const newNfts = await mainController.fetchNfts(connectedWallet);
      setNfts(newNfts);
      if (newNfts?.length > 0) {
        // only set a single NFT for this game
        setSelectedNft(newNfts[0]);
      } else {
        setSelectedNft(undefined);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [mainController, connectedWallet]);

  useEffect(() => {
    // poll connection to wallet
    const interval = setInterval(async () => {
      const connectResult = await Paima.default.userWalletLogin("metamask");
      const newWallet = connectResult.success
        ? connectResult.result.walletAddress
        : undefined;
      setConnectedWallet(newWallet);
    }, 2000);
    return () => clearInterval(interval);
  }, [connectedWallet, mainController]);

  // if a user disconnects, we will suspend the pages the previously connected wallet
  // instead of setting connected wallet back to undefined
  const [lastConnectedWallet, setLastConnectedWallet] = useState<
    undefined | WalletAddress
  >();
  useEffect(() => {
    if (connectedWallet == null) return;

    setLastConnectedWallet(connectedWallet);
  }, [connectedWallet]);

  const value = React.useMemo<GlobalState>(
    () => ({
      connectedWallet: lastConnectedWallet,
      nfts,
      selectedNftState: [selectedNft, setSelectedNft],
    }),
    [lastConnectedWallet, nfts, selectedNft, setSelectedNft]
  );

  return (
    <GlobalStateContext.Provider value={value}>
      <ConnectingModal open={connectedWallet == null} />
      {children}
      <PaimaNotice />
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
