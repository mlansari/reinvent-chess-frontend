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

  test("a chessboard created with custom fen can have something other than a rook in a1", () => {
    const board = new ChessBoard("8/8/8/8/8/8/8/p7 w - - 0 1")

    expect(board.boardRepresentation[0]).toBe(PieceColor.Black | PieceType.Pawn)
  })

  test("a chessboard created with custom fen can have an arbitrary number of pieces", () => {
    const board = new ChessBoard(
      "pppppppp/pppp4/4pppp/6pp/pp6/7p/p7/8 w - - 0 1"
    )
    const locations = board.getPieceLocations(PieceColor.Black, PieceType.Pawn)

    expect(locations.length).toBe(22)
  })

  test("ChessBoard.mapAlgbraicNotationToIndex maps a1 correctly", () => {
    const index = ChessBoard.mapAlgebraicNotationToIndex("a1")

    expect(index).toBe(0)
  })

  test("ChessBoard.mapAlgebraicNotationToIndex maps h8 correctly", () => {
    const index = ChessBoard.mapAlgebraicNotationToIndex("h8")

    expect(index).toBe(63)
  })

  test("ChessBoard.mapAlgebraicNotationToIndex maps h1 correctly", () => {
    const index = ChessBoard.mapAlgebraicNotationToIndex("h1")

    expect(index).toBe(7)
  })

  test("ChessBoard.mapAlgebraicNotationToIndex maps a8 correctly", () => {
    const index = ChessBoard.mapAlgebraicNotationToIndex("a8")

    expect(index).toBe(56)
  })
})
