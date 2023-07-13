import { LobbyState } from "@dice/utils";
import * as Paima from "@dice/middleware";
import { OldResult } from "paima-sdk/paima-mw-core";

export class DiceService {
  // Get Lobby State
  static async getLobbyState(lobbyId: string): Promise<LobbyState | null> {
    const result = await Paima.default.getLobbyState(lobbyId);

    if (result.success === false) {
      console.error(result.errorMessage);
      return null;
    }

    console.log("Lobby state: ", result.lobby);
    return result.lobby;
  }

  // Submit Moves
  static async submitMove(
    nftId: number,
    lobbyId: string,
    roundNumber: number,
    move: boolean
  ): Promise<OldResult> {
    const result = await Paima.default.submitMoves(
      nftId,
      lobbyId,
      roundNumber,
      move
    );
    console.log("Submit move result: ", result);
    return result;
  }
}

export class DiceLogic {
  nftId: number;

  constructor(nftId: number) {
    this.nftId = nftId;
  }

  async handleMove(lobbyState: LobbyState, move: boolean): Promise<void> {
    if (lobbyState == null) {
      throw new Error("Lobby state is null");
    }

    if (!this.isThisPlayersTurn(lobbyState, lobbyState.current_round)) {
      console.log("It's the other player's turn");
      return;
    }

    const moveResult = await DiceService.submitMove(
      this.nftId,
      lobbyState.lobby_id,
      lobbyState.current_round,
      move
    );
    console.log("Move result: ", moveResult);
    if (moveResult.success === false) {
      console.log("Move failed");
      return;
    }
  }

  // TODO: support multiple players
  isThisPlayersTurn(lobbyState: LobbyState, turn?: number): boolean {
    // Note: match starts at round 1, because we use persistNewRound to start it
    const isPlayerOnesTurn = (turn ?? lobbyState.turn) === 1;
    const isThisPlayerPlayerOne = this.isThisPlayerPlayerOne(lobbyState);
    return isPlayerOnesTurn === isThisPlayerPlayerOne;
  }

  // TODO: support multiple players
  isThisPlayerPlayerOne(lobbyState: LobbyState): boolean {
    const isCreator = lobbyState.lobby_creator === this.nftId ? true : false;
    const isCreatorWhite = lobbyState.player_one_iswhite;
    return isCreator === isCreatorWhite;
  }
}
