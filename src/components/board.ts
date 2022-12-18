import { PieceType, PieceColor } from "../constants"
import { PieceLocation } from "../types"

/**
 * @class ChessBoard
 *
 * A logical representation of the chess board state.  Used to perform logic such as piece movs
 * and captures, and is responsible for evaluating the legality of attempted moves
 *
 * Has a simple board state representation exported to maintain board history in a separate class
 */
class ChessBoard {
  whitePawnBoard: number[]
  whiteKnightBoard: number[]
  whiteBishopBoard: number[]
  whiteRookBoard: number[]
  whiteQueenBoard: number[]
  whiteKingBoard: number[]

  blackPawnBoard: number[]
  blackKnightBoard: number[]
  blackBishopBoard: number[]
  blackRookBoard: number[]
  blackQueenBoard: number[]
  blackKingBoard: number[]

  boardRepresentation: number[]

  /**
   * Sets up the default board state for chess
   */
  constructor() {
    this.boardRepresentation = new Array(64)

    // TODO: load default board state from file, to support fisher random
    this.boardRepresentation[0] = PieceColor.White | PieceType.Rook
    this.boardRepresentation[1] = PieceColor.White | PieceType.Knight
    this.boardRepresentation[2] = PieceColor.White | PieceType.Bishop
    this.boardRepresentation[3] = PieceColor.White | PieceType.Queen
    this.boardRepresentation[4] = PieceColor.White | PieceType.King
    this.boardRepresentation[5] = PieceColor.White | PieceType.Bishop
    this.boardRepresentation[6] = PieceColor.White | PieceType.Knight
    this.boardRepresentation[7] = PieceColor.White | PieceType.Rook

    this.boardRepresentation[8] = PieceColor.White | PieceType.Pawn
    this.boardRepresentation[9] = PieceColor.White | PieceType.Pawn
    this.boardRepresentation[10] = PieceColor.White | PieceType.Pawn
    this.boardRepresentation[11] = PieceColor.White | PieceType.Pawn
    this.boardRepresentation[12] = PieceColor.White | PieceType.Pawn
    this.boardRepresentation[13] = PieceColor.White | PieceType.Pawn
    this.boardRepresentation[14] = PieceColor.White | PieceType.Pawn
    this.boardRepresentation[15] = PieceColor.White | PieceType.Pawn

    this.boardRepresentation[48] = PieceColor.Black | PieceType.Pawn
    this.boardRepresentation[49] = PieceColor.Black | PieceType.Pawn
    this.boardRepresentation[50] = PieceColor.Black | PieceType.Pawn
    this.boardRepresentation[51] = PieceColor.Black | PieceType.Pawn
    this.boardRepresentation[52] = PieceColor.Black | PieceType.Pawn
    this.boardRepresentation[53] = PieceColor.Black | PieceType.Pawn
    this.boardRepresentation[54] = PieceColor.Black | PieceType.Pawn
    this.boardRepresentation[55] = PieceColor.Black | PieceType.Pawn

    this.boardRepresentation[56] = PieceColor.Black | PieceType.Rook
    this.boardRepresentation[57] = PieceColor.Black | PieceType.Knight
    this.boardRepresentation[58] = PieceColor.Black | PieceType.Bishop
    this.boardRepresentation[59] = PieceColor.Black | PieceType.Queen
    this.boardRepresentation[60] = PieceColor.Black | PieceType.King
    this.boardRepresentation[61] = PieceColor.Black | PieceType.Bishop
    this.boardRepresentation[62] = PieceColor.Black | PieceType.Knight
    this.boardRepresentation[63] = PieceColor.Black | PieceType.Rook
  }

  public getPieceLocations(
    color: PieceColor,
    type: PieceType
  ): PieceLocation[] {
    const locations: PieceLocation[] = []
    for (let i = 0; i < this.boardRepresentation.length; i++) {
      if (this.boardRepresentation[i] == color + type) {
        locations.push({
          rank: i % 8,
          file: 7 - Math.floor(i / 8), // Remove the 7 minus in order to flip the board
        })
      }
    }
    return locations
  }
}

export default ChessBoard
