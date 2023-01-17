import { Application, Assets, Spritesheet, Text } from "pixi.js"
import { PieceRegistry } from "./types"
import ChessBoard from "./components/board"

const app = new Application({
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  width: window.innerWidth,
  height: window.innerHeight,
})
document.body.appendChild(app.view as HTMLCanvasElement)

class Game {
  board: ChessBoard
  pieceRegistry: PieceRegistry = null

  // Debug lines
  gameString: Text
  moveCounter: Text
  turnColor: Text
  generalInfo: Text

  constructor() {
    this.board = new ChessBoard()

    app.stage.addChild(this.board)

    this.board.x = (app.view.width - this.board.width) / 2
    this.board.y = (app.view.height - this.board.height) / 2

    this.loadSpriteSheet()

    console.log(`fen string of current state is ${this.board.outputBoardStateToFen()}`)
  }

  private loadSpriteSheet() {
    Assets.load("assets/chess_spritesheet.json").then((chessSheet: Spritesheet) => {
      this.pieceRegistry = {
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

      this.board.setPiecesUp(this.pieceRegistry)
    })
  }

  private renderDebugInfo() {
    this.gameString = new Text("", {
      align: "center",
      stroke: "#000",
      strokeThickness: 2,
    })
  }
}

async function init() {
  const game = new Game()
}

export default init()
