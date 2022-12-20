import {
  PieceType,
  PieceColor,
  fenPieceMapping,
  fenSkipMapping,
  defaultBoardFen,
  fenCastlingMapping,
  algebraicNotationToIndexMapping,
} from "../constants"
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
  // whitePawnBoard: number[]
  // whiteKnightBoard: number[]
  // whiteBishopBoard: number[]
  // whiteRookBoard: number[]
  // whiteQueenBoard: number[]
  // whiteKingBoard: number[]

  // blackPawnBoard: number[]
  // blackKnightBoard: number[]
  // blackBishopBoard: number[]
  // blackRookBoard: number[]
  // blackQueenBoard: number[]
  // blackKingBoard: number[]

  boardRepresentation: number[]
  currentTurn: PieceColor
  castlingAvailability: number
  enPassantTargetSquareIndex: number
  halfmoveClockValue: number
  currentMove: number

  /**
   * Sets up the board state for chess game using FEN
   *
   * @param {string} positionFen The Forsyth-Edwards Notation for the starting board state
   */
  constructor(positionFen: string = defaultBoardFen) {
    this.boardRepresentation = Array(64)

    // Split FEN string into fields
    const fields: string[] = positionFen.split(" ")

    // Parse board state field
    let rankIndex = 7
    let fileIndex = 0
    fields[0].split("/").map((rank: string) => {
      const rankArray = [...rank]
      rankArray.forEach((character: string) => {
        const boardIndex = rankIndex * 8 + fileIndex
        if (character in fenPieceMapping) {
          this.boardRepresentation[boardIndex] = fenPieceMapping[character]
          fileIndex++
        } else {
          fileIndex += fenSkipMapping[character]
        }
      })
      rankIndex--
      fileIndex = 0
    })

    // Parse active color state field
    this.currentTurn = fields[1] == "w" ? PieceColor.White : PieceColor.Black

    // Parse Castling availability field
    this.castlingAvailability = 0
    const fenAvailability = [...fields[2]]
    fenAvailability.forEach((character: string) => {
      this.castlingAvailability =
        this.castlingAvailability | fenCastlingMapping[character]
    })

    // Parse en passant target square field
    if (fields[3] == "-") {
      this.enPassantTargetSquareIndex = -1
    } else {
      this.enPassantTargetSquareIndex = ChessBoard.mapAlgebraicNotationToIndex(
        fields[3]
      )
    }

    // Parse halfmove clock field
    this.halfmoveClockValue = Number(fields[4])

    // Parse fullmove field
    this.currentMove = Number(fields[5])
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

  public static mapAlgebraicNotationToIndex(notation: string): number {
    const characters = [...notation]
    return (
      (Number(characters[1]) - 1) * 8 +
      algebraicNotationToIndexMapping[characters[0]]
    )
  }
}

export default ChessBoard
