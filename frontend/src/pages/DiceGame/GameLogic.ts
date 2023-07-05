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
    lobbyId: string,
    roundNumber: number,
    move: boolean
  ): Promise<OldResult> {
    const result = await Paima.default.submitMoves(lobbyId, roundNumber, move);
    console.log("Submit move result: ", result);
    return result;
  }
}

export class DiceLogic {
  userAddress: string;

  constructor(userAddress: string) {
    this.userAddress = userAddress;
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

  isThisPlayersTurn(lobbyState: LobbyState, round: number): boolean {
    const isWhiteTurn = round % 2 === 1;
    const isPlayerWhite = this.isThisPlayerWhite(lobbyState);
    return isWhiteTurn === isPlayerWhite;
  }

  isThisPlayerWhite(lobbyState: LobbyState): boolean {
    const isCreator =
      lobbyState.lobby_creator === this.userAddress ? true : false;
    const isCreatorWhite = lobbyState.player_one_iswhite;
    return isCreator === isCreatorWhite;
  }
}
