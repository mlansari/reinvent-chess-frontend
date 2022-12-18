import ChessBoard from "../../src/components/board"
import { PieceColor, PieceType } from "../../src/constants"

describe("ChessBoard", () => {
  // Tests for board creation
  test("creating a chessboard creates an representative array of length 64", () => {
    const board = new ChessBoard()

    expect(board.boardRepresentation.length).toBe(64)
  })

  test("a created chessboard to have a white rook at the first value by default", () => {
    const board = new ChessBoard()

    expect(board.boardRepresentation[0]).toBe(PieceColor.White | PieceType.Rook)
  })

  test("expect a created chessboard to have a black rook at the last value by default", () => {
    const board = new ChessBoard()

    expect(board.boardRepresentation[63]).toBe(
      PieceColor.Black | PieceType.Rook
    )
  })

  test("a created chessboard should have eight white pawns", () => {
    const board = new ChessBoard()
    const locations = board.getPieceLocations(PieceColor.White, PieceType.Pawn)

    expect(locations.length).toBe(8)
  })
})
