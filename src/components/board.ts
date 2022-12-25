import {
  PieceType,
  PieceColor,
  fenPieceMapping,
  fenSkipMapping,
  defaultBoardFen,
  fenCastlingMapping,
  algebraicNotationToIndexMapping,
  indexToAlgebraicLetterMapping,
  OFF_BOARD,
} from "../constants"
import { PieceLocation } from "../types"

/**
 * @class ChessBoard
 *
 * A logical representation of the chess board state.  Used to perform logic such as piece moves
 * and captures, and is responsible for evaluating the legality of attempted moves
 *
 * Has a simple board state representation exported to maintain board history in a separate class
 */
class ChessBoard {
  ranksBoard: number[]
  filesBoard: number[]

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
    this.boardRepresentation = Array(120).fill(OFF_BOARD)
    this.ranksBoard = Array(120).fill(OFF_BOARD)
    this.filesBoard = Array(120) .fill(OFF_BOARD)

    // Initialize ranks and files boards
    for (let rank = 0; rank < 8; ++ rank) {
      for (let file = 0; file < 8; ++ file) {
        const squareIndex = ChessBoard.getIndexFromRankAndFile(rank, file)
        this.ranksBoard[squareIndex] = rank
        this.filesBoard[squareIndex] = file
      }
    }

    // Split FEN string into fields
    const fields: string[] = positionFen.split(" ")

    // Parse board state field
    let fileIndex = 0
    let rankIndex = 7
    fields[0].split("/").map((rank: string) => {
      const rankArray = [...rank]
      rankArray.forEach((character: string) => {
        const boardIndex = ChessBoard.getIndexFromRankAndFile(rankIndex, fileIndex)
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
          rank: this.ranksBoard[i],
          file: this.filesBoard[i]
        })
      }
    }

    return locations
  }

  public static mapAlgebraicNotationToIndex(notation: string): number {
    const characters = [...notation]
    return (
      (Number(characters[1]) + 1) * 10 +
      (algebraicNotationToIndexMapping[characters[0]])
    )
  }

  public static mapIndexToAlgebraicNotation(index: number): string {
    const file = indexToAlgebraicLetterMapping[index % 10]
    const rank = Math.floor(index / 10) - 1

    if (file == "X" || rank < 1 || rank > 8) {
      throw new Error(`index ${index} is out of bounds for translation to algebraic notation`)
    }

    return `${file}${rank}`
  }

  public static getIndexFromRankAndFile(rank: number, file: number): number {
    return 21 + file + (10 * rank)
  }

  /**
   * Debugging function used to output any "board"-like representers which are of dimensions 10x12
   * 
   * @param {number[]} boardRepresentation The representation to output to console
   * @memberof ChessBoard 
   */
  private outputBoardRepresentation(boardRepresentation: number[]) {
    for (let i = 0; i < 12; i++) {
      let outputString = ""
      for (let j = 0; j < 10; j++) {
        outputString += boardRepresentation[(i * 10) + j] + " "
      }
      console.log(outputString)
    }
  }
}

export default ChessBoard
