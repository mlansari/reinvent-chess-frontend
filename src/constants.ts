export enum PieceType {
  None = 0,
  Pawn = 1,
  Knight = 2,
  Bishop = 3,
  Rook = 4,
  Queen = 5,
  King = 6,
}

export enum PieceColor {
  White = 8,
  Black = 16,
}

export const OFF_BOARD = 32

export const fenPieceMapping = {
  p: PieceColor.Black | PieceType.Pawn,
  n: PieceColor.Black | PieceType.Knight,
  b: PieceColor.Black | PieceType.Bishop,
  r: PieceColor.Black | PieceType.Rook,
  q: PieceColor.Black | PieceType.Queen,
  k: PieceColor.Black | PieceType.King,

  P: PieceColor.White | PieceType.Pawn,
  N: PieceColor.White | PieceType.Knight,
  B: PieceColor.White | PieceType.Bishop,
  R: PieceColor.White | PieceType.Rook,
  Q: PieceColor.White | PieceType.Queen,
  K: PieceColor.White | PieceType.King,
}

export const fenSkipMapping = {
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
}

export const defaultBoardFen: string =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

export enum CastlingAvailability {
  K = 1,
  Q = 2,
  k = 4,
  q = 8,
}

export const fenCastlingMapping = {
  "-": 0,
  K: CastlingAvailability.K,
  Q: CastlingAvailability.Q,
  k: CastlingAvailability.k,
  q: CastlingAvailability.q,
}

export const algebraicNotationToIndexMapping = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
}

export const indexToAlgebraicLetterMapping = {
  0: "X",
  1: "a",
  2: "b",
  3: "c",
  4: "d",
  5: "e",
  6: "f",
  7: "g",
  8: "h",
  9: "X"
}
