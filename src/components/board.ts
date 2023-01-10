import { Container, Graphics, Text, Texture } from "pixi.js"
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
  Colors,
  CellSize,
} from "../constants"
import { PieceLocation, PieceRegistry, CellState, PieceContainer } from "../types"
import { Piece } from "./piece"

/**
 * @class ChessBoard
 *
 * A logical representation of the chess board state.  Used to perform logic such as piece moves
 * and captures, and is responsible for evaluating the legality of attempted moves
 *
 * Has a simple board state representation exported to maintain board history in a separate class
 */
export class ChessBoard extends Container {
  // Utility ranks and files boards for easy calcuation
  ranksBoard: number[]
  filesBoard: number[]

  // Board state information
  boardRepresentation: number[]
  currentTurn: PieceColor
  castlingAvailability: number
  enPassantTargetSquareIndex: number
  halfmoveClockValue: number
  currentMove: number

  // Rendering state
  isFlipped: boolean = false
  pieceRegistry: PieceRegistry
  cellState: CellState[]
  fileLetters: Text[] = []
  rankNumbers: Text[] = []
  blackPieces: PieceContainer = null
  whitePieces: PieceContainer = null

  /**
   * Sets up the board state for chess game using FEN, and handles owning and rendering pieces
   *
   * @param {string} positionFen The Forsyth-Edwards Notation for the starting board state
   */
  constructor(positionFen: string = defaultBoardFen) {
    super()

    this.boardRepresentation = Array(120).fill(OFF_BOARD)
    this.ranksBoard = Array(120).fill(OFF_BOARD)
    this.filesBoard = Array(120).fill(OFF_BOARD)

    // Initialize ranks and files boards
    for (let rank = 0; rank < 8; ++rank) {
      for (let file = 0; file < 8; ++file) {
        const squareIndex = ChessBoard.getIndexFromRankAndFile(rank, file)
        this.ranksBoard[squareIndex] = rank
        this.filesBoard[squareIndex] = file
      }
    }

    this.setBoardStateFromFen(positionFen)
    this.outputBoardRepresentation(this.boardRepresentation)

    // Set up visual representation of board itself
    this.generateBoardCells()
    this.generateBoardLetters()
    this.generateBoardNumbers()
  }

  /**
   * Utility function to set the board state from a passed in fen string
   *
   * @param {string} fenString
   */
  private setBoardStateFromFen(fenString: string): void {
    // Split FEN string into fields
    const fields: string[] = fenString.split(" ")

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
      this.castlingAvailability = this.castlingAvailability | fenCastlingMapping[character]
    })

    // Parse en passant target square field
    if (fields[3] == "-") {
      this.enPassantTargetSquareIndex = -1
    } else {
      this.enPassantTargetSquareIndex = ChessBoard.mapAlgebraicNotationToIndex(fields[3])
    }

    // Parse halfmove clock field
    this.halfmoveClockValue = Number(fields[4])

    // Parse fullmove field
    this.currentMove = Number(fields[5])
  }

  /**
   * Utility method used to generate the clean and empty cell reps for the board
   */
  private generateBoardCells(): void {
    this.cellState = new Array(64)

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const index = rank * 8 + file
        const color = (rank + file) % 2 == (this.isFlipped ? 0 : 1) ? Colors.LightSquare : Colors.DarkSquare

        this.cellState[index] = {
          color,
          piece: null,
          image: new Graphics(),
        }

        const x = file * CellSize
        const y = rank * CellSize

        this.cellState[index].image.beginFill(color).drawRect(0, 0, CellSize, CellSize).endFill()
        this.cellState[index].image.x = x
        this.cellState[index].image.y = y

        this.addChild(this.cellState[index].image)
      }
    }
  }

  private generateBoardLetters(): void {
    this.fileLetters = []

    let letter = "a"
    for (let i = 0; i < 8; i++) {
      this.fileLetters.push(
        new Text(letter, {
          fill: Colors.Text,
          fontSize: 20,
        })
      )

      const letterText = this.fileLetters[this.fileLetters.length - 1]

      letterText.x = i * CellSize + (CellSize - letterText.width - 2)
      letterText.y = 0
      this.addChild(letterText)

      letter = String.fromCharCode(letter.charCodeAt(0) + 1)
    }
  }

  private generateBoardNumbers(): void {
    this.rankNumbers = []

    for (let i = 8; i > 0; i--) {
      const number = this.isFlipped ? i : 9 - i
      this.rankNumbers.push(
        new Text(`${number}`, {
          fill: Colors.Text,
          fontSize: 20,
        })
      )

      let numberText = this.rankNumbers[this.rankNumbers.length - 1]

      numberText.x = 0
      numberText.y = i * CellSize - numberText.height - 2
      this.addChild(numberText)
    }
  }

  /**
   * Uses the existing board setup in the boardRepresentation array to construct the pieces in cells
   *
   * @param {PieceRegistry} pieceRegistry The sprite registry to use for piece representations
   */
  public setPiecesUp(pieceRegistry: PieceRegistry): void {
    this.pieceRegistry = pieceRegistry
    this.whitePieces = {
      pawns: [],
      knights: [],
      bishops: [],
      rooks: [],
      queens: [],
      king: null,
    }
    this.blackPieces = {
      pawns: [],
      knights: [],
      bishops: [],
      rooks: [],
      queens: [],
      king: null,
    }

    const trimmedBoard = this.trimBoardToLegalSquares(this.boardRepresentation)

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const index = rank * 8 + file
        if (trimmedBoard[index] !== 32) {
          const pieceColor = trimmedBoard[index] & 0b11000
          const pieceType = trimmedBoard[index] & 0b00111

          console.log(`piece of color ${PieceColor[pieceColor]} and type ${PieceType[pieceType]}`)

          const piece = this.handleCreatePiece(pieceColor, pieceType)

          piece.x = 64 + 128 * file
          piece.y = 64 + 128 * rank
          this.addChild(piece)
          this.cellState[index].piece = piece
        }
      }
    }
  }

  private handleCreatePiece(pieceColor: PieceColor, pieceType: PieceType): Piece {
    const spriteName = `${PieceColor[pieceColor].toLowerCase()}${PieceType[pieceType]}`
    const sprite = this.pieceRegistry[spriteName]
    let piece = null

    if (pieceColor == PieceColor.White) {
      switch (pieceType) {
        case PieceType.Pawn:
          this.whitePieces.pawns.push(new Piece(sprite, pieceColor, pieceType))
          piece = this.whitePieces.pawns[this.whitePieces.pawns.length - 1]
          break
        case PieceType.Knight:
          this.whitePieces.knights.push(new Piece(sprite, pieceColor, pieceType))
          piece = this.whitePieces.knights[this.whitePieces.knights.length - 1]
          break
        case PieceType.Bishop:
          this.whitePieces.bishops.push(new Piece(sprite, pieceColor, pieceType))
          piece = this.whitePieces.bishops[this.whitePieces.bishops.length - 1]
          break
        case PieceType.Rook:
          this.whitePieces.rooks.push(new Piece(sprite, pieceColor, pieceType))
          piece = this.whitePieces.rooks[this.whitePieces.rooks.length - 1]
          break
        case PieceType.Queen:
          this.whitePieces.queens.push(new Piece(sprite, pieceColor, pieceType))
          piece = this.whitePieces.queens[this.whitePieces.queens.length - 1]
          break
        case PieceType.King:
          this.whitePieces.king = new Piece(sprite, pieceColor, pieceType)
          piece = this.whitePieces.king
          break
      }
    } else if (pieceColor == PieceColor.Black) {
      switch (pieceType) {
        case PieceType.Pawn:
          this.blackPieces.pawns.push(new Piece(sprite, pieceColor, pieceType))
          piece = this.blackPieces.pawns[this.blackPieces.pawns.length - 1]
          break
        case PieceType.Knight:
          this.blackPieces.knights.push(new Piece(sprite, pieceColor, pieceType))
          piece = this.blackPieces.knights[this.blackPieces.knights.length - 1]
          break
        case PieceType.Bishop:
          this.blackPieces.bishops.push(new Piece(sprite, pieceColor, pieceType))
          piece = this.blackPieces.bishops[this.blackPieces.bishops.length - 1]
          break
        case PieceType.Rook:
          this.blackPieces.rooks.push(new Piece(sprite, pieceColor, pieceType))
          piece = this.blackPieces.rooks[this.blackPieces.rooks.length - 1]
          break
        case PieceType.Queen:
          this.blackPieces.queens.push(new Piece(sprite, pieceColor, pieceType))
          piece = this.blackPieces.queens[this.blackPieces.queens.length - 1]
          break
        case PieceType.King:
          this.blackPieces.king = new Piece(sprite, pieceColor, pieceType)
          piece = this.blackPieces.king
          break
      }
    }

    piece.board = this

    return piece
  }

  // ---------------------- Utilities ---------------------------------------------------
  /**
   * Utility method to trim 120 square board to 64 squares for rendering
   *
   * @param {number[]} inputRep The board representation being trimmed
   * @returns {number[]}
   */
  private trimBoardToLegalSquares(inputRep: number[]): number[] {
    const outputRep = []
    for (let i = 2; i < 10; i++) {
      for (let j = 1; j < 9; j++) {
        outputRep.push(inputRep[i * 10 + j])
      }
    }

    return outputRep
  }

  // ------------------ External Interactions -------------------------------------------
  public toggleFlipped(): void {
    this.isFlipped = !this.isFlipped
  }

  // ---------------- Old Functionality -------------------------------------------------

  public getPieceLocations(color: PieceColor, type: PieceType): PieceLocation[] {
    const locations: PieceLocation[] = []
    for (let i = 0; i < this.boardRepresentation.length; i++) {
      if (this.boardRepresentation[i] == color + type) {
        locations.push({
          rank: this.ranksBoard[i],
          file: this.filesBoard[i],
        })
      }
    }

    return locations
  }

  public static mapAlgebraicNotationToIndex(notation: string): number {
    const characters = [...notation]
    return (Number(characters[1]) + 1) * 10 + algebraicNotationToIndexMapping[characters[0]]
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
    return 21 + file + 10 * rank
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
        outputString += boardRepresentation[i * 10 + j] + " "
      }
      console.log(outputString)
    }
  }
}

export default ChessBoard
