import { FederatedMouseEvent, Sprite, Texture } from "pixi.js"
import {
  CastlingIndices,
  CastlingMasks,
  MovementOffsets,
  OFF_BOARD,
  PieceColor,
  PieceType,
  PIECE_COLOR_MASK,
  SlidingMovement,
} from "../constants"
import { MoveOptions } from "../types"
import ChessBoard from "./board"

export class Piece extends Sprite {
  public pieceColor: PieceColor
  public pieceType: PieceType
  public rank: number
  public file: number

  public board: ChessBoard = null

  constructor(texture: Texture, color: PieceColor, type: PieceType) {
    super(texture)

    this.pieceColor = color
    this.pieceType = type

    this.anchor.set(0.5, 0.5)
  }

  /**
   *
   * @returns {number[]} A list of the indices of legal moves
   */
  public getLegalMoves(): MoveOptions {
    let legalMoves: MoveOptions = {
      quiet: [],
      captures: [],
    }

    switch (this.pieceType) {
      case PieceType.Pawn:
        legalMoves = this.generateLegalMovesAsPawn()
        break
      case PieceType.Knight:
      case PieceType.Bishop:
      case PieceType.Rook:
      case PieceType.Queen:
      case PieceType.King:
        legalMoves = this.generateLegalMovesAsPiece()
        break
    }

    return legalMoves
  }

  private generateLegalMovesAsPawn(): MoveOptions {
    const currentPieceIndex = ChessBoard.getIndexFromRankAndFile(this.rank, this.file)

    // Determine movement direction based on the color of the pawn, determine if still on starting rank
    let movementOffset = 0
    let onStartingRank = false
    let captureOffsets = [9, 11]
    if (this.pieceColor == PieceColor.White) {
      movementOffset = -10
      captureOffsets = captureOffsets.map((offset: number) => -offset)
      if (this.board.ranksBoard[currentPieceIndex] == 6) {
        onStartingRank = true
      }
    } else {
      movementOffset = 10
      if (this.board.ranksBoard[currentPieceIndex] == 1) {
        onStartingRank = true
      }
    }

    const legalMoves = []
    const legalCaptures = []

    // Assess double move first if possible
    if (
      onStartingRank &&
      this.board.boardRepresentation[currentPieceIndex + movementOffset] == 0 &&
      this.board.boardRepresentation[currentPieceIndex + 2 * movementOffset] == 0
    ) {
      legalMoves.push(currentPieceIndex + 2 * movementOffset)
    }

    // Assess single move
    if (this.board.boardRepresentation[currentPieceIndex + movementOffset] == 0) {
      legalMoves.push(currentPieceIndex + movementOffset)
    }

    // Assess captures
    for (let offset of captureOffsets) {
      const cellValue = this.board.boardRepresentation[currentPieceIndex + offset]
      if (cellValue != 0 && (cellValue & PIECE_COLOR_MASK) != this.pieceColor) {
        legalCaptures.push(currentPieceIndex + offset)
      } else if (currentPieceIndex + offset == this.board.enPassantTargetSquareIndex) {
        // Handle en passant
        legalCaptures.push(currentPieceIndex + offset)
      }
    }

    return {
      quiet: legalMoves,
      captures: legalCaptures,
    }
  }

  /**
   * This method handles generating a list of legal moves that this piece can take
   *
   * @returns {MoveOptions} List of indices this piece can be moved to, and can attack
   */
  private generateLegalMovesAsPiece(): MoveOptions {
    const currentPieceIndex = ChessBoard.getIndexFromRankAndFile(this.rank, this.file)
    console.log(`current piece index is ${currentPieceIndex}`)

    const offsets = MovementOffsets[this.pieceType]
    const isSliding = SlidingMovement[this.pieceType]

    const legalMoves = []
    const legalCaptures = []

    for (let offset of offsets) {
      for (let cellIndex = currentPieceIndex; ; ) {
        cellIndex += offset
        const squareVal = this.board.boardRepresentation[cellIndex]

        if (squareVal == OFF_BOARD) break
        if (squareVal != 0 && (squareVal & PIECE_COLOR_MASK) != this.pieceColor) {
          legalCaptures.push(cellIndex)
          break
        } else if (squareVal != 0 && (squareVal & PIECE_COLOR_MASK) == this.pieceColor) {
          break
        }
        // Otherwise, it's an empty move, simple case
        legalMoves.push(cellIndex)

        if (!isSliding) break
      }
    }

    // Assess castling state, we handle castling as a king move
    if (this.pieceType == PieceType.King && this.board.castlingAvailability > 0) {
      // White checks
      if (
        this.pieceColor == PieceColor.White &&
        (this.board.castlingAvailability & CastlingMasks.Q) > 0 &&
        this.areCellsEmpty(CastlingIndices.Q)
      ) {
        legalMoves.push(93)
      }
      if (
        this.pieceColor == PieceColor.White &&
        (this.board.castlingAvailability & CastlingMasks.K) > 0 &&
        this.areCellsEmpty(CastlingIndices.K)
      ) {
        legalMoves.push(97)
      }

      // Black checks
      if (
        this.pieceColor == PieceColor.Black &&
        (this.board.castlingAvailability & CastlingMasks.q) > 0 &&
        this.areCellsEmpty(CastlingIndices.q)
      ) {
        legalMoves.push(23)
      }
      if (
        this.pieceColor == PieceColor.Black &&
        (this.board.castlingAvailability & CastlingMasks.k) > 0 &&
        this.areCellsEmpty(CastlingIndices.k)
      ) {
        legalMoves.push(27)
      }
    }

    return {
      quiet: legalMoves,
      captures: legalCaptures,
    }
  }

  /**
   * Utility method to check if all cells in an input array are empty
   *
   * @param {number[]} cellIndices the indices to check if all are empty
   * @returns {boolean} true if empty, false otherwise
   */
  private areCellsEmpty(cellIndices: number[]): boolean {
    return (
      cellIndices
        .map((square: number) => this.board.boardRepresentation[square])
        .reduce((prevSum: number, cellValue: number) => prevSum + cellValue) == 0
    )
  }
}
