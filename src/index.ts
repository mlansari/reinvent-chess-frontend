import { Application, Sprite, Assets, Spritesheet } from "pixi.js"
import BoardRenderer from "./rendering/boardRenderer"
import { PieceRegistry } from "./types"
import ChessBoard from "./components/board"

const app = new Application({
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  width: window.innerWidth,
  height: window.innerHeight,
})
document.body.appendChild(app.view as HTMLCanvasElement)

const scaleFactor = 0.5

// TODO: Abstract this into a class
async function init() {
  const screenWidth = app.screen.width
  const screenHeight = app.screen.height

  // Create board state with default piece setup
  const state = new ChessBoard()

  const chessSheet: Spritesheet = (await Assets.load(
    "assets/chess_spritesheet.json"
  )) as Spritesheet

  const pieceRegistry: PieceRegistry = {
    whitePawn: chessSheet.textures["white_pawn"],
    whiteKnight: chessSheet.textures["white_knight"],
    whiteBishop: chessSheet.textures["white_bishop"],
    whiteRook: chessSheet.textures["white_rook"],
    whiteQueen: chessSheet.textures["white_queen"],
    whiteKing: chessSheet.textures["white_king"],

    blackPawn: chessSheet.textures["black_pawn"],
    blackKnight: chessSheet.textures["black_knight"],
    blackBishop: chessSheet.textures["black_bishop"],
    blackRook: chessSheet.textures["black_rook"],
    blackQueen: chessSheet.textures["black_queen"],
    blackKing: chessSheet.textures["black_king"],
  }

  const gameBoard = new BoardRenderer(
    scaleFactor,
    chessSheet.textures["square_gray_light"],
    chessSheet.textures["square_gray_dark"],
    pieceRegistry
  )

  gameBoard.setCenteringDimensions(screenWidth, screenHeight)

  app.stage.addChild(gameBoard.getBoardContainer())

  gameBoard.renderBoardState(state)
}

export default init()
