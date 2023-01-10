import { FederatedMouseEvent, Sprite, Texture } from "pixi.js"
import { PieceColor, PieceType } from "../constants"
import ChessBoard from "./board"

export class Piece extends Sprite {
  public pieceColor: PieceColor
  public pieceType: PieceType

  public board: ChessBoard = null

  constructor(texture: Texture, color: PieceColor, type: PieceType) {
    super(texture)

    this.pieceColor = color
    this.pieceType = type

    this.anchor.set(0.5, 0.5)

    this.on("mousedown", function (event: FederatedMouseEvent) {
      this.emit("piecedown", event)
    })
  }
}
