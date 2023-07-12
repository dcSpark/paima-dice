import {
  MatchState,
  TickEvent,
  LobbyState,
  LobbyStateQuery,
  UserLobby,
} from "@dice/utils";
import * as Paima from "@dice/middleware";
import { MatchExecutor } from "paima-sdk/paima-executors";

// The MainController is a React component that will be used to control the state of the application
// It will be used to check if the user has metamask installed and if they are connected to the correct network
// Other settings also will be controlled here

// create string enum called AppState
export enum Page {
  Landing = "/login",
  MainMenu = "/",
  CreateLobby = "/create_lobby",
  OpenLobbies = "/open_lobbies",
  Game = "/game",
  MyGames = "/my_games",
}

// This is a class that will be used to control the state of the application
// the benefit of this is that it is very easy to test its logic unlike a react component
class MainController {
  userAddress: string | null = null;

  callback: (
    page: Page | null,
    isLoading: boolean,
    extraData: LobbyState
  ) => void;

  private checkCallback() {
    if (this.callback == null) {
      throw new Error("Callback is not set");
    }
  }

  private async enforceWalletConnected() {
    this.checkCallback();
    if (!this.isWalletConnected()) {
      this.callback(Page.Landing, false, null);
    }
    if (!this.userAddress) {
      await this.silentConnectWallet();
    }
  }

  private isWalletConnected = (): boolean => {
    return typeof window.ethereum !== "undefined" ? true : false;
  };

  async silentConnectWallet() {
    const response = await Paima.default.userWalletLogin("metamask");

    if (response.success === true) {
      this.userAddress = response.result.walletAddress;
    }
  }

  async connectWallet() {
    this.callback(Page.Landing, true, null);
    const response = await Paima.default.userWalletLogin("metamask");
    console.log("connect wallet response: ", response);
    if (response.success === true) {
      this.userAddress = response.result.walletAddress;
      this.callback(Page.MainMenu, false, null);
    } else {
      this.callback(Page.Landing, false, null);
    }
  }

  async fetchNfts(address: string): Promise<undefined | number[]> {
    const response = await Paima.default.getNftsForWallet(address);
    console.log("fetch nfts response: ", response);
    if (!response.success) return;
    return response.result;
  }

  async loadLobbyState(lobbyId: string): Promise<LobbyState> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.getLobbyState(lobbyId);
    console.log("get lobby state response: ", response);
    this.callback(null, false, null);
    if (!response.success) {
      throw new Error("Could not get lobby state");
    }
    return response.lobby;
  }

  async searchLobby(
    nftId: number,
    query: string,
    page: number
  ): Promise<LobbyStateQuery[]> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.getLobbySearch(nftId, query, page, 1);
    console.log("search lobby response: ", response);
    this.callback(null, false, null);
    if (!response.success) {
      throw new Error("Could not search lobby");
    }
    return response.lobbies;
  }

  async createLobby(
    creatorNftId: number,
    numOfRounds: number,
    roundLength: number,
    timePerPlayer: number,
    isHidden = false,
    isPractice = false,
    isWhite = true
  ): Promise<void> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    console.log(
      "create lobby: ",
      numOfRounds,
      roundLength,
      timePerPlayer,
      isHidden,
      isPractice,
      isWhite
    );
    const response = await Paima.default.createLobby(
      creatorNftId,
      numOfRounds,
      roundLength,
      timePerPlayer,
      isHidden,
      isPractice,
      isWhite
    );
    console.log("create lobby response: ", response);
    if (!response.success) {
      this.callback(null, false, null);
      throw new Error("Could not create lobby");
    }
    const lobbyState = await this.loadLobbyState(response.lobbyID);
    this.callback(Page.Game, false, lobbyState);
  }

  async joinLobby(nftId: number, lobbyId: string): Promise<void> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.joinLobby(nftId, lobbyId);
    if (!response.success) {
      this.callback(null, false, null);
      throw new Error("Could not join lobby");
    }
    const resp = await Paima.default.getLobbyState(lobbyId);
    console.log("move to joined lobby response: ", response);
    if (!resp.success) {
      this.callback(null, false, null);
      throw new Error("Could not download lobby state from join lobby");
    }
    this.callback(Page.Game, false, resp.lobby);
  }

  async moveToJoinedLobby(lobbyId: string): Promise<void> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.getLobbyState(lobbyId);
    console.log("move to joined lobby response: ", response);
    if (!response.success) {
      this.callback(null, false, null);
      throw new Error("Could not join lobby");
    }
    this.callback(Page.Game, false, response.lobby);
  }

  async closeLobby(nftId: number, lobbyId: string): Promise<void> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.closeLobby(nftId, lobbyId);
    console.log("close lobby response: ", response);
    if (!response.success) {
      this.callback(null, false, null);
      throw new Error("Could not close lobby");
    }
    this.callback(Page.MainMenu, false, null);
  }

  async getOpenLobbies(
    nftId: number,
    page = 0,
    limit = 100
  ): Promise<LobbyStateQuery[]> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.getOpenLobbies(nftId, page, limit);
    console.log("get open lobbies response: ", response);
    this.callback(null, false, null);
    if (!response.success) {
      throw new Error("Could not get open lobbies");
    }
    return response.lobbies.filter((lobby) => lobby.lobby_state === "open");
  }

  async getMyGames(nftId: number, page = 0, limit = 100): Promise<UserLobby[]> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.getUserLobbiesMatches(
      nftId,
      page,
      limit
    );
    console.log("get my games response: ", response);
    this.callback(null, false, null);
    if (!response.success) {
      throw new Error("Could not get open lobbies");
    }
    return response.lobbies;
  }

  async getMatchExecutor(
    lobbyId: string
  ): Promise<MatchExecutor<MatchState, TickEvent>> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.getMatchExecutor(lobbyId);
    console.log("get match executor: ", response);
    this.callback(null, false, null);
    if (!response.success) {
      throw new Error("Could not get match executor");
    }
    return response.result;
  }

  initialState(): Page {
    this.silentConnectWallet();
    return this.isWalletConnected() ? Page.MainMenu : Page.Landing;
  }
}

export default MainController;
