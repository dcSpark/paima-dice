import { LobbyState, Move, MoveKind } from "@dice/game-logic";
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
    lobbyState: LobbyState,
    move: Move
  ): Promise<OldResult> {
    const result = await Paima.default.submitMoves(
      nftId,
      lobbyState.lobby_id,
      lobbyState.current_match,
      lobbyState.current_round,
      move
    );
    console.log("Submit move result: ", result);
    return result;
  }
}
