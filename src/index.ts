import { Application, Sprite, utils } from "pixi.js"

const app = new Application({
  // view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  width: 640,
  height: 480,
  backgroundColor: utils.rgb2hex([100, 100, 100]),
})

function init() {
  const queenie: Sprite = Sprite.from("assets/w_queen_1x_ns.png")
  queenie.anchor.set(0.5)
  queenie.x = app.screen.width / 2
  queenie.y = app.screen.height / 2

  console.log(`sprite x is ${queenie.x} and sprite y is ${queenie.y}`)

  app.stage.addChild(queenie)

  document.body.appendChild(app.view as HTMLCanvasElement)
}

export default init()
