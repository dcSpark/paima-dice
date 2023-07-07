import React, { createContext, useContext, useEffect, useState } from "react";
import MainController from "./MainController";
import { AppContext } from "./main";
import { UseStateResponse } from "./utils";

type NftContextType = {
  nfts?: number[];
  selectedNftState: UseStateResponse<undefined | number>;
};

export const NftContext = createContext<NftContextType>(null as NftContextType);

export function NftProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const mainController: MainController = useContext(AppContext);
  const [nfts, setNfts] = useState<undefined | number[]>();
  const [selectedNft, setSelectedNft] = useState<undefined | number>();

  useEffect(() => {
    const interval = setInterval(async () => {
      const newNfts = await mainController.fetchNfts();
      if (newNfts == null) return;
      setNfts(newNfts);
    }, 5000);
    return () => clearInterval(interval);
  }, [mainController]);

  const value = React.useMemo<NftContextType>(
    () => ({
      nfts,
      selectedNftState: [selectedNft, setSelectedNft],
    }),
    [nfts, selectedNft, setSelectedNft]
  );
  return <NftContext.Provider value={value}>{children}</NftContext.Provider>;
}

export const useNftContext = (): NftContextType => {
  const context = React.useContext(NftContext);
  if (context == null) {
    throw new Error("useNftContext must be used within an NftProvider");
  }
  return context;
};
