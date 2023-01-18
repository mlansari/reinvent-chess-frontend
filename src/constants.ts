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

export const PIECE_COLOR_MASK = 0b11000
export const PIECE_TYPE_MASK = 0b00111

export const MovementOffsets: Record<string, number[]> = {
  2: [-21, -19, -12, -8, 8, 12, 19, 21], // PieceType.Knight
  3: [-11, -9, 9, 11], // PieceType.Bishop
  4: [-10, -1, 1, 10], // PieceType.Rook
  5: [-11, -10, -9, -1, 1, 9, 10, 11], // PieceType.Queen
  6: [-11, -10, -9, -1, 1, 9, 10, 11], // PieceType.King
}

export const SlidingMovement = {
  1: false, // PieceType.Pawn
  2: false, // PieceType.Knight
  3: true, // PieceType.Bishop
  4: true, // PieceType.Rook
  5: true, // PieceType.Queen
  6: false, // PieceType.King
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

// ------------------------- FEN-Related Constants

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

export const defaultBoardFen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

export enum CastlingAvailability {
  K = 1,
  Q = 2,
  k = 4,
  q = 8,
}

export const CastlingMasks = {
  K: 0b0001,
  Q: 0b0010,
  k: 0b0100,
  q: 0b1000,
}

export const CastlingIndices = {
  K: [96, 97],
  Q: [92, 93, 94],
  k: [26, 27],
  q: [22, 23, 24],
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
  9: "X",
}

// ---------------------- Rendering Constants ---------------------------------
export enum Colors {
  LightSquare = 0xe3c16f,
  DarkSquare = 0xb88b4a,

  LightHighlight = 0x95ebf0,
  DarkHighlight = 0x95ccf0,

  Selected = 0x9662f6,

  Attacked = 0xed3761,
  Checked = 0x69021a,

  Text = 0x000000,
}

export const CellSize = 128

export const BoardToMailboxIndexMap = [
  21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 51, 52, 53, 54, 55,
  56, 57, 58, 61, 62, 63, 64, 65, 66, 67, 68, 71, 72, 73, 74, 75, 76, 77, 78, 81, 82, 83, 84, 85, 86, 87, 88, 91, 92,
  93, 94, 95, 96, 97, 98,
]

export const MailboxToBoardIndexMap = [
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, -1, -1, 8,
  9, 10, 11, 12, 13, 14, 15, -1, -1, 16, 17, 18, 19, 20, 21, 22, 23, -1, -1, 24, 25, 26, 27, 28, 29, 30, 31, -1, -1, 32,
  33, 34, 35, 36, 37, 38, 39, -1, -1, 40, 41, 42, 43, 44, 45, 46, 47, -1, -1, 48, 49, 50, 51, 52, 53, 54, 55, -1, -1,
  56, 57, 58, 59, 60, 61, 62, 63, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
]
