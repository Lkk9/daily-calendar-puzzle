const app = document.getElementById('app')

const itemsList = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', false,'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', false,...Array(31).fill(0).map((_, i) => i+1), 'SUN', 'MON', 'TUE', 'WED',false, false, false, false, 'THU', 'FRI', 'SAT']
const piecesList = [
  [
    [1, 1],
    [0, 1],
    [1, 1]
  ],
  [
    [1, 1, 1, 0],
    [0, 0, 1, 1]
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0]
  ],
  [
    [1, 1, 1, 1]
  ],
  [
    [1, 0, 0],
    [1, 1, 1]
  ],
  [
    [1, 1],
    [0, 1],
    [0, 1],
    [0, 1]
  ],
  [
    [1, 0],
    [1, 1],
    [1, 1]
  ],
  [
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1]
  ],
  [
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 1]
  ],
  [
    [0, 1],
    [1, 1],
    [1, 0]
  ]
]
const grid = new Grid(7, 8)

let canvas
function setup() {
  canvas = createCanvas(app.clientWidth, app.clientHeight)
  canvas.parent('app')

  textAlign(CENTER, CENTER)
  textFont('Helvetica')

  grid.setItems(itemsList)
  grid.resizeText(width, height)
  for (const [i, piece] of piecesList.entries()) {
    grid.addPiece(new Piece(Math.random()*(width-100), Math.random()*(height-100), piece, i))
  }

}

function draw() {
  background(255)
  grid.update(width, height)
}

function windowResized() {
  resizeCanvas(app.clientWidth, app.clientHeight)
  grid.resizeText(app.clientWidth, app.clientHeight)
}
