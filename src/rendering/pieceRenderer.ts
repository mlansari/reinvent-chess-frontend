import { Container, Texture, Sprite } from "pixi.js"

class PieceRenderer {
  dirtyPieces: Sprite[]

  /**
   * This texture handles creating a sprite for a texture and drawing to board, and returns the wrapper
   *
   * @param tex
   * @param boardContainer
   */
  public static renderPieceTexture(tex: Texture, boardContainer: Container) {}

  public static swapState() {}
}

class Piece {
  texture: Texture
  name: string
}
