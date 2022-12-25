import ChessBoard from "../../src/components/board"
import { PieceColor, PieceType, OFF_BOARD } from "../../src/constants"

describe("ChessBoard", () => {
  // Tests for board creation
  test("creating a chessboard creates an representative array of length 120", () => {
    const board = new ChessBoard()

    expect(board.boardRepresentation.length).toBe(120)
  })

  test("a created chessboard to have an off board value at the first value by default", () => {
    const board = new ChessBoard()

    expect(board.boardRepresentation[0]).toBe(OFF_BOARD)
  })

  test("expect a created chessboard to have a white rook at the a1 square by default", () => {
    const board = new ChessBoard()

    expect(board.boardRepresentation[21]).toBe(
      PieceColor.White | PieceType.Rook
    )
  })

  test("a created chessboard should have eight white pawns", () => {
    const board = new ChessBoard()
    const locations = board.getPieceLocations(PieceColor.White, PieceType.Pawn)

    expect(locations.length).toBe(8)
  })

  test("a chessboard created with custom fen can have something other than a rook in a1", () => {
    const board = new ChessBoard("8/8/8/8/8/8/8/p7 w - - 0 1")

    expect(board.boardRepresentation[21]).toBe(PieceColor.Black | PieceType.Pawn)
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

    expect(index).toBe(21)
  })

  test("ChessBoard.mapAlgebraicNotationToIndex maps h8 correctly", () => {
    const index = ChessBoard.mapAlgebraicNotationToIndex("h8")

    expect(index).toBe(98)
  })

  test("ChessBoard.mapAlgebraicNotationToIndex maps h1 correctly", () => {
    const index = ChessBoard.mapAlgebraicNotationToIndex("h1")

    expect(index).toBe(28)
  })

  test("ChessBoard.mapAlgebraicNotationToIndex maps a8 correctly", () => {
    const index = ChessBoard.mapAlgebraicNotationToIndex("a8")

    expect(index).toBe(91)
  })

  test("ChessBoard.mapIndexToAlgebraicNotation maps index 21 correctly", () => {
    const notation = ChessBoard.mapIndexToAlgebraicNotation(21)

    expect(notation).toBe("a1")
  })

  test("ChessBoard.mapIndexToAlgebraicNotation maps index 98 correctly", () => {
    const notation = ChessBoard.mapIndexToAlgebraicNotation(98)

    expect(notation).toBe("h8")
  })

  test("ChessBoard.mapIndexToAlgebraicNotation maps index 27 correctly", () => {
    const notation = ChessBoard.mapIndexToAlgebraicNotation(27)

    expect(notation).toBe("g1")
  })

  test("ChessBoard.mapIndexToAlgebraicNotation throws error for out of bounds index correctly", () => {
    expect(() => ChessBoard.mapIndexToAlgebraicNotation(20)).toThrow("index 20 is out of bounds for translation to algebraic notation")
  })

  test("ChessBoard.mapIndexToAlgebraicNotation throws error for too small index correctly", () => {
    expect(() => ChessBoard.mapIndexToAlgebraicNotation(-2)).toThrow("index -2 is out of bounds for translation to algebraic notation")
  })
})
