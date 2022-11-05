const itemType = {
  fixedBlock: 'fixedBlock',
  contentBlock: 'contentBlock'
}

class Item {
  constructor(type, content='') {
    this.content = content
    this.type = type
    this.pieceOnIt = type === itemType.fixedBlock // default value
  }

  draw(x, y, size) {
    push()
    if (this.type === itemType.fixedBlock) {
      stroke('#000000aa')
      fill('#DBE2E9')
      rect(x, y, size, size)
    } else {
      rect(x, y, size, size)
      text(this.content, x, y, size, size)
    }
    pop()

  }
}

class Menu {
  constructor() {
    this.list = []
    this.menu = createDiv()
    this.menu.class('menu')

    this.btnSize = 23

    this.inHitBox = false
    this.opened = false
  }

  addButton(label, onClick=()=>{}) {
    const btn = createButton(label)
    btn.class('btn')
    this.list.push({
      btn,
      action: onClick
    })
  }

  open(x, y) {
    this.opened = true
    this.list.forEach((obj, i) => {
      const {btn, action} = obj
      btn.position(x+canvas.canvas.offsetLeft+this.btnSize*2*i, y+canvas.canvas.offsetTop-this.btnSize)
      btn.mousePressed(() => {
        this.inHitBox = true
        action()
      })
    })
  }

  close() {
    this.inHitBox = false
    this.opened = false
    this.list.forEach((obj, i) => {
      const {btn} = obj
      btn.position(-100, -100)
    })
  }
}

let pieceSelected = false
// let selectedPieceId = -1
class Piece {
  canDrag = false
  colors=['#A47449', '#63462D', '#B07C4F', '#BA8E4A', '#704F32']
  constructor(x, y, structure, id) {
    this.x = x
    this.y = y
    this.id = id
    this.color = this.colors[~~(Math.random()*this.colors.length)]
    this.structure = {
      width: structure[0].length,
      height: structure.length,
      blocks: structure.reduce((acc, cur, i) => {
        cur.forEach((block, j) => {
          if (block) {
            acc.push({
              x: j,
              y: i
            })
          }
        })
        return acc
      }, [])
    }

    this.#createMenuList()

  }

  #createMenuList() {
    this.menu = new Menu()
    this.menu.addButton('rotate', () => this.#rotate())
    this.menu.addButton('flip x', () => this.#flipX())
    this.menu.addButton('flip y', () => this.#flipY())
  }

  #rotate() {
    [this.structure.width, this.structure.height] = [this.structure.height, this.structure.width]

    this.structure.blocks.map(block => {
      [block.x, block.y] = [block.y, block.x]
      block.x = -block.x + this.structure.width-1
    })
  }
  #flipX() {
    this.structure.blocks.map(block => {
      block.x = -block.x + this.structure.width-1
    })
  }
  #flipY () {
    this.structure.blocks.map(block => {
      block.y = -block.y + this.structure.height-1
    })
  }


  lastOffset
  lastMousePos
  grab(size) {
    // check hitBox
    const isMoved = !createVector(mouseX, mouseY).equals(this.lastMousePos)
    const isHitBox = (
      mouseX >= this.x-this.menu.btnSize && mouseX <= this.x+this.structure.width*size+this.menu.btnSize &&
      mouseY >= this.y-this.menu.btnSize && mouseY <= this.y+this.structure.height*size+this.menu.btnSize
    )
    if (
      mouseIsPressed && !pieceSelected && !this.canDrag &&
      this.structure.blocks.some(block => {
        return mouseX >= this.x+block.x*size && mouseX <= this.x+size*(block.x+1) &&
        mouseY >= this.y+block.y*size && mouseY <= this.y+size*(block.y+1)
      })
    ) {
      this.canDrag = true
      pieceSelected = true
      this.lastOffset = createVector(mouseX-this.x, mouseY-this.y)
      this.lastMousePos = createVector(mouseX, mouseY)
    } else if (this.canDrag && !mouseIsPressed && this.lastOffset) {
      this.canDrag = false
      pieceSelected = false

      if (!this.menu.opened && !isMoved) {
        // selectedPieceId = this.id
        this.menu.open(this.x, this.y)
      } else {
        // selectedPieceId = -1
        this.menu.close()
      }


    } else if (this.canDrag) {
      if (isMoved) {
        // selectedPieceId = -1
        this.menu.close()
      }
      this.x = mouseX-this.lastOffset.x
      this.y = mouseY-this.lastOffset.y
    } else if (!isHitBox) {
      // selectedPieceId = -1
      this.menu.close()
    }



    this.x = Math.max(0, Math.min(width-size*this.structure.width, this.x))
    this.y = Math.max(0, Math.min(height-this.structure.height*size, this.y))
  }

  draw(size) {
    push()

    fill('#000')
    strokeWeight(5)
    this.structure.blocks.forEach(block => {
      rect(this.x+block.x*size, this.y+block.y*size, size)
    })
    fill(this.color)
    noStroke()
    this.structure.blocks.forEach(block => {
      rect(this.x+block.x*size, this.y+block.y*size, size)
    })

    pop()
  }
}

class Grid {
  grid = []
  pieces = []
  constructor(cols, rows) {
    this.cols = cols
    this.rows = rows
  }

  setItems(itemsList) {
    for (let i = 0; i < this.rows; i++) {
      const row = []
      for (let j = 0; j < this.cols; j++) {
        const item = itemsList[i*this.cols+j]
        row.push(
          item ?
          new Item(
            itemType.contentBlock,
            item)
          : new Item(itemType.fixedBlock)
        )
      }
      this.grid.push(row)
    }
  }

  addPiece(piece) {
    this.pieces.push(piece)
  }

  #getItemSize(w, h) {
    const dw = w/this.cols
    const dh = h/this.rows
    const itemSize = Math.min(dw, dh)

    return {
      dw, dh, itemSize
    }
  }

  resizeText(w, h) {
    textSize(this.#getItemSize(w, h).itemSize*.4)
  }

  update(w, h) {
    const {dw, dh, itemSize} = this.#getItemSize(w, h)

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.grid[i][j].draw((dw>=dh)*(w/2-this.cols*itemSize/2)+j*itemSize, (dh > dw)*(h/2-this.rows*itemSize/2)+i*itemSize, itemSize)
      }
    }

    for (let i = this.pieces.length-1; i >= 0; i--) {
      const piece = this.pieces[i]
      const pieceDraw = this.pieces[this.pieces.length-1-i]
      piece.grab(itemSize)
      pieceDraw.draw(itemSize)
    }
  }

}
