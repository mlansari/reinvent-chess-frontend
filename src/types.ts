import { Texture } from "pixi.js"

export interface PieceRegistry {
  whitePawn: Texture
  whiteKnight: Texture
  whiteBishop: Texture
  whiteRook: Texture
  whiteQueen: Texture
  whiteKing: Texture

  blackPawn: Texture
  blackKnight: Texture
  blackBishop: Texture
  blackRook: Texture
  blackQueen: Texture
  blackKing: Texture
}

export interface PieceLocation {
  rank: number
  file: number
}
