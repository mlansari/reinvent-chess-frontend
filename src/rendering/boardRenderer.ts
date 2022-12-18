import { Sprite, Container, Texture } from "pixi.js"
import { PieceLocation, PieceRegistry } from "../types"
import ChessBoard from "../components/board"
import { PieceColor, PieceType } from "../constants"

class BoardRenderer {
  piecesInitialized: boolean

  boardContainer: Container
  lightSquareTexture: Texture
  darkSquareTexture: Texture
  pieceRegistry: PieceRegistry

  /**
   * Creates a new board renderer, initializes the fixed background board
   * Built in default 1024 x 1024 coordinate space
   *
   * @param scaleFactor: {number} The scale factor to scale the board by
   * @param lightSquare {PIXI.Texture} The light square texture
   * @param darkSquare {PIXI.Texture} The dark square texture
   * @param pieceRegistry {PieceRegistry} Registry of textures to use for piece type
   */
  constructor(
    scaleFactor: number,
    lightSquare: Texture,
    darkSquare: Texture,
    pieceRegistry: PieceRegistry
  ) {
    this.boardContainer = new Container()

    this.pieceRegistry = pieceRegistry
    this.piecesInitialized = false

    this.lightSquareTexture = lightSquare
    this.darkSquareTexture = darkSquare

    for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
        const isLightSquare = (file + rank) % 2 == 0

        const squareSprite = isLightSquare
          ? new Sprite(this.lightSquareTexture)
          : new Sprite(this.darkSquareTexture)

        this.boardContainer.addChild(squareSprite)

        squareSprite.x = 128 * rank
        squareSprite.y = 128 * file
      }
    }

    this.boardContainer.scale.set(scaleFactor)
  }

  getBoardContainer(): Container {
    return this.boardContainer
  }

  renderBoardState(boardState: ChessBoard) {
    const spriteList: Sprite[] = [
      // White Pieces
      ...this.renderSpriteByType(
        boardState.getPieceLocations(PieceColor.White, PieceType.Pawn),
        this.pieceRegistry.whitePawn
      ),
      ...this.renderSpriteByType(
        boardState.getPieceLocations(PieceColor.White, PieceType.Knight),
        this.pieceRegistry.whiteKnight
      ),
      ...this.renderSpriteByType(
        boardState.getPieceLocations(PieceColor.White, PieceType.Bishop),
        this.pieceRegistry.whiteBishop
      ),
      ...this.renderSpriteByType(
        boardState.getPieceLocations(PieceColor.White, PieceType.Rook),
        this.pieceRegistry.whiteRook
      ),
      ...this.renderSpriteByType(
        boardState.getPieceLocations(PieceColor.White, PieceType.Queen),
        this.pieceRegistry.whiteQueen
      ),
      ...this.renderSpriteByType(
        boardState.getPieceLocations(PieceColor.White, PieceType.King),
        this.pieceRegistry.whiteKing
      ),

      // Black Pieces
      ...this.renderSpriteByType(
        boardState.getPieceLocations(PieceColor.Black, PieceType.Pawn),
        this.pieceRegistry.blackPawn
      ),
      ...this.renderSpriteByType(
        boardState.getPieceLocations(PieceColor.Black, PieceType.Knight),
        this.pieceRegistry.blackKnight
      ),
      ...this.renderSpriteByType(
        boardState.getPieceLocations(PieceColor.Black, PieceType.Bishop),
        this.pieceRegistry.blackBishop
      ),
      ...this.renderSpriteByType(
        boardState.getPieceLocations(PieceColor.Black, PieceType.Rook),
        this.pieceRegistry.blackRook
      ),
      ...this.renderSpriteByType(
        boardState.getPieceLocations(PieceColor.Black, PieceType.Queen),
        this.pieceRegistry.blackQueen
      ),
      ...this.renderSpriteByType(
        boardState.getPieceLocations(PieceColor.Black, PieceType.King),
        this.pieceRegistry.blackKing
      ),
    ]

    // Iterate through all pieces and add to render container
    spriteList.map((piece: Sprite) => this.boardContainer.addChild(piece))
  }

  private renderSpriteByType(locList: PieceLocation[], tex: Texture): Sprite[] {
    const pieceList = []
    locList.map((location: PieceLocation) => {
      const pieceSprite = new Sprite(tex)
      pieceSprite.anchor.set(0.5)
      pieceSprite.x = 64 + 128 * location.rank
      pieceSprite.y = 64 + 128 * location.file

      pieceList.push(pieceSprite)
    })

    return pieceList
  }
}

export default BoardRenderer
