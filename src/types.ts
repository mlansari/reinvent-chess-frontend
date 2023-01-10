import { Graphics, Texture } from "pixi.js"
import { Piece } from "./components/piece"
import { Colors } from "./constants"

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

export interface PieceContainer {
  pawns: Piece[]
  knights: Piece[]
  bishops: Piece[]
  rooks: Piece[]
  queens: Piece[]
  king: Piece
}

export interface CellState {
  piece: Piece
  color: Colors
  image: Graphics
}
