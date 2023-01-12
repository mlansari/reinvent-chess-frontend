import { Container, FederatedMouseEvent, Graphics, Point, Text } from "pixi.js"
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
  PIECE_COLOR_MASK,
  PIECE_TYPE_MASK,
  MailboxToBoardIndexMap,
} from "../constants"
import { PieceLocation, PieceRegistry, CellState, PieceContainer } from "../types"
import { Piece } from "./piece"

/**
 * @class ChessBoard
 *
 * A logical representation of the chess board state.  Used to perform logic such as piece moves
 * and captures, and is responsible for evaluating the legality of attempted moves
 *
 * Also handles the rendering of board state
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
  selectedCell: CellState

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
    // Clear proper board locations to empty
    MailboxToBoardIndexMap.forEach((value: number, index: number) => {
      if (value !== -1) this.boardRepresentation[index] = 0
    })

    // Split FEN string into fields
    const fields: string[] = fenString.split(" ")

    // Parse board state field
    let fileIndex = 0
    let rankIndex = 0
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
      rankIndex++
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
        const color = (rank + file) % 2 == (this.isFlipped ? 1 : 0) ? Colors.LightSquare : Colors.DarkSquare

        this.cellState[index] = {
          color,
          piece: null,
          image: new Graphics(),
          isSelected: false,
          isHighlighted: false,
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

  /**
   * Redraw the board cells with any special modified colors needed to indicate game state (or debug state)
   *
   */
  private redrawBoardCells(): void {
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const cell = this.cellState[rank * 8 + file]
        let color

        if (cell.isHighlighted) {
          if (cell.color == Colors.LightSquare) {
            color = Colors.LightHighlight
          } else {
            color = Colors.DarkHighlight
          }
        } else if (cell.isSelected) {
          color = Colors.Selected
        } else {
          color = cell.color
        }

        cell.image.clear().beginFill(color).drawRect(0, 0, CellSize, CellSize).endFill()
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
        if (trimmedBoard[index] !== 32 && trimmedBoard[index] !== 0) {
          const pieceColor = trimmedBoard[index] & PIECE_COLOR_MASK
          const pieceType = trimmedBoard[index] & PIECE_TYPE_MASK

          const piece = this.handleCreatePiece(pieceColor, pieceType)

          piece.on("pointerdown", this.onPieceClick, this)
          piece.x = 64 + 128 * file
          piece.y = 64 + 128 * rank
          piece.rank = rank
          piece.file = file
          this.addChild(piece)
          this.cellState[index].piece = piece
        }
      }
    }

    this.setActivePieces(this.currentTurn)
  }

  /**
   * Creates a piece based on a piece color and piece type
   *
   * @param {PieceColor} pieceColor Color of the piece being created
   * @param {PieceType} pieceType Type of the piece being created
   * @returns {Piece} The created piece
   */
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

  /**
   * Enables the interactivity of the pieces that are moveable in the current turn
   *
   * @param {PieceColor} color The color of the pieces to enable
   */
  private setActivePieces(color: PieceColor): void {
    let whiteValue = color == PieceColor.White

    this.whitePieces.pawns.forEach((piece: Piece) => (piece.interactive = whiteValue))
    this.whitePieces.knights.forEach((piece: Piece) => (piece.interactive = whiteValue))
    this.whitePieces.bishops.forEach((piece: Piece) => (piece.interactive = whiteValue))
    this.whitePieces.rooks.forEach((piece: Piece) => (piece.interactive = whiteValue))
    this.whitePieces.queens.forEach((piece: Piece) => (piece.interactive = whiteValue))
    this.whitePieces.king.interactive = whiteValue

    this.blackPieces.pawns.forEach((piece: Piece) => (piece.interactive = !whiteValue))
    this.blackPieces.knights.forEach((piece: Piece) => (piece.interactive = !whiteValue))
    this.blackPieces.bishops.forEach((piece: Piece) => (piece.interactive = !whiteValue))
    this.blackPieces.rooks.forEach((piece: Piece) => (piece.interactive = !whiteValue))
    this.blackPieces.queens.forEach((piece: Piece) => (piece.interactive = !whiteValue))
    this.blackPieces.king.interactive = !whiteValue
  }

  /**
   * Moves board state to the next turn, and handles all checks associated with that
   */
  private advanceCurrentTurn(resetHalfMove: boolean = false): void {
    const nextTurn = this.currentTurn == PieceColor.White ? PieceColor.Black : PieceColor.White
    this.setActivePieces(nextTurn)

    this.setAllCellsInactive() // DEBUG

    if (nextTurn == PieceColor.White) {
      this.currentMove += 1
    }

    if (!resetHalfMove) {
      this.halfmoveClockValue += 1
    } else {
      this.halfmoveClockValue = 0
    }
    this.currentTurn = nextTurn
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

  private setAllEmptyCellsActive(): void {
    this.cellState
      .filter((cell: CellState) => cell.piece == null)
      .forEach((cell: CellState) => {
        cell.image.interactive = true
        cell.image.on("pointerdown", this.onCellClick, this)
      })
  }

  private setAllCellsInactive(): void {
    this.cellState.forEach((cell: CellState) => {
      cell.image.interactive = false
      cell.image.off("pointerdown", this.onCellClick, this)
    })
  }

  /**
   * Utility function to set cells active by a list of indices in mailbox board representation
   *
   * @param {number[]} indices The indices of the cells to activate
   */
  private setCellsActiveByIndices(indices: number[]): void {
    indices
      .filter((index: number) => MailboxToBoardIndexMap[index] != -1)
      .forEach((index: number) => {
        const cell = this.cellState[MailboxToBoardIndexMap[index]]
        cell.image.interactive = true
        cell.image.on("pointerdown", this.onCellClick, this)
      })
  }

  /**
   * Takes indices in the mailbox representation of the board and higlights them in the matching cells
   *
   * @param highlightIndices
   */
  private setCellsHighlightedAtIndices(highlightIndices: number[]): void {
    highlightIndices
      .filter((index: number) => MailboxToBoardIndexMap[index] != -1)
      .forEach((index: number) => (this.cellState[MailboxToBoardIndexMap[index]].isHighlighted = true))

    this.redrawBoardCells()
  }

  private clearAllHighlightedCells(): void {
    this.cellState.forEach((cell: CellState) => (cell.isHighlighted = false))
  }

  /**
   * Utility method to handle moving a piece from one cell to another, updating both 120 cell board representation and 64 rendered cells
   *
   * @param {Piece} piece The piece being moved
   * @param {number} rank The rank to move the piece to
   * @param {number} file The file to move the piece to
   */
  private movePieceTo(piece: Piece, rank: number, file: number): void {
    piece.rank = rank
    piece.file = file

    piece.x = CellSize / 2 + CellSize * file
    piece.y = CellSize / 2 + CellSize * rank

    this.cellState[rank * 8 + file].piece = piece

    this.boardRepresentation[ChessBoard.getIndexFromRankAndFile(rank, file)] = piece.pieceColor | piece.pieceType
  }

  // ------------------ External Interactions -------------------------------------------
  public toggleFlipped(): void {
    this.isFlipped = !this.isFlipped
  }

  // ------------------ Event Interactions ----------------------------------------------
  private onCellClick(event: FederatedMouseEvent) {
    console.log(
      `Selected cell has piece of color ${PieceColor[this.selectedCell.piece.pieceColor]}, type ${
        PieceType[this.selectedCell.piece.pieceType]
      }`
    )

    let { x: clickX, y: clickY } = this.toLocal(event.global)
    // NOTE THAT FILES CORRESPOND TO X COORDINATES AND RANKS TO Y
    let file = Math.floor(clickX / CellSize)
    let rank = Math.floor(clickY / CellSize)

    const piece = this.selectedCell.piece
    const startPoint = new Point(piece.file, piece.rank)

    this.movePieceTo(piece, rank, file)

    this.cellState[startPoint.y * 8 + startPoint.x].piece = null
    this.cellState[startPoint.y * 8 + startPoint.x].isSelected = false
    this.boardRepresentation[ChessBoard.getIndexFromRankAndFile(startPoint.y, startPoint.x)] = 0

    this.setAllCellsInactive() // DEBUG
    this.clearAllHighlightedCells()

    console.log(`you clicked on (${rank}, ${file})`)

    this.redrawBoardCells()
    this.advanceCurrentTurn()
  }

  private onPieceClick(event: FederatedMouseEvent) {
    let piece = event.target as Piece
    this.setChildIndex(piece, this.children.length - 1)

    if (this.selectedCell) {
      this.clearAllHighlightedCells()
      this.selectedCell.isSelected = false
    }

    const cellIndex = piece.rank * 8 + piece.file
    this.selectedCell = this.cellState[cellIndex]
    this.cellState[cellIndex].isSelected = true

    const moves = piece.getLegalMoves()
    console.log(`legal moves are ${moves.quiet}, legal captures are ${moves.captures}`)
    this.setCellsHighlightedAtIndices(moves.quiet)
    this.setCellsHighlightedAtIndices(moves.captures)
    this.setCellsActiveByIndices(moves.quiet)

    this.redrawBoardCells()
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
