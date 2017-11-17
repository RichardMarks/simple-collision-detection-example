const axes = {
  xAxisLine: document.querySelector('.drag-x-axis-line'),
  yAxisLine: document.querySelector('.drag-y-axis-line'),
  x: {
    get pos () { return undefined },
    set pos (y) {
      axes.xAxisLine.style.top = `${y}px`
    },
    show () {
      axes.xAxisLine.style.display = 'block'
    },
    hide () {
      axes.xAxisLine.style.display = 'none'
    }
  },
  y: {
    get pos () { return undefined },
    set pos (x) {
      axes.yAxisLine.style.left = `${x}px`
    },
    show () {
      axes.yAxisLine.style.display = 'block'
    },
    hide () {
      axes.yAxisLine.style.display = 'none'
    }
  }
}
const gameContainer = document.querySelector('.game')
const game = {
  width: 640,
  height: 400,
  entities: [],
  addEntity (entity) {
    game.entities.push(entity)
    game.entities.sort((a, b) => a.y - b.y)
    gameContainer.appendChild(entity.div)
  },
  mainLoop (deltaTime) {
    game.entities.sort((a, b) => a.y - b.y)
    game.entities.forEach(entity => {
      entity.update && entity.update(deltaTime * 0.001)
      entity.div.style.zIndex = entity.y * 10
      entity.sync && entity.sync()
    })
    window.requestAnimationFrame(game.mainLoop)
  }
}

const collisionBetween = (a, b) => {
  return !(
    (a.bottom < b.top) ||
    (a.top > b.bottom) ||
    (a.left > b.right) ||
    (a.right < b.left)
  )
}

const createSprite = (
  {
    x = 0,
    y = 0,
    width = 32,
    height = 32,
    color = 'white'
  }
) => {
  const div = document.createElement('div')

  div.classList.add('sprite')
  div.style.background = color

  const sprite = {
    _x: x,
    _y: y,
    get x () { return sprite._x },
    get y () { return sprite._y },
    set x (v) {
      sprite._x = v
      sprite.sync && sprite.sync()
    },
    set y (v) {
      sprite._y = v
      sprite.sync && sprite.sync()
    },
    width,
    height,
    color,
    outlineColor: 'red',
    div,
    debug: false,
    get left () {
      return sprite.x
    },
    get top () {
      return sprite.y
    },
    get right () {
      return sprite.x + sprite.width
    },
    get bottom () {
      return sprite.y + sprite.height
    },
    showOutline (visible) {
      sprite.debug = visible
      sprite.sync && sprite.sync()
    },
    update (deltaTime) {},
    sync () {
      sprite.div.style.left = `${sprite.left}px`
      sprite.div.style.top = `${sprite.top}px`
      sprite.div.style.background = sprite.color
      sprite.div.style.width = `${sprite.width}px`
      sprite.div.style.minHeight = `${sprite.height}px`

      if (sprite.debug) {
        sprite.div.style.outline = `1px solid ${sprite.outlineColor}`
      } else {
        sprite.div.style.outline = 'none'
      }
    }
  }

  return sprite
}

const boot = () => {
  console.clear()

  game.obstacles = [
    createSprite({
      color: 'orangered',
      x: 150,
      y: 150
    }),

    createSprite({
      color: 'crimson',
      x: 450,
      y: 300
    }),

    createSprite({
      color: 'red',
      x: 450,
      y: 50
    })
  ]

  game.player = createSprite({
    color: 'cornflowerblue',
    x: game.width * 0.5,
    y: game.height * 0.5
  })

  game.player.outlineColor = 'white'

  const checkCollisions = () => {
    game.player.showOutline(false)
    game.obstacles.forEach(obstacle => {
      obstacle.showOutline(false)
      obstacle.outlineColor = 'white'
      if (collisionBetween(game.player, obstacle)) {
        game.player.showOutline(true)
        obstacle.showOutline(true)
      }
    })
  }

  game.mouse = {
    x: 0,
    y: 0,
    button: false,
    offset: {
      x: 0,
      y: 0
    }
  }

  game.player.div.style.cursor = 'pointer'
  game.player.div.addEventListener('mousedown', event => {
    game.player.div.style.cursor = 'move'
    game.mouse.button = true
    game.mouse.offset.x = game.player.div.offsetLeft - event.clientX
    game.mouse.offset.y = game.player.div.offsetTop - event.clientY
    axes.x.pos = game.player.y
    axes.y.pos = game.player.x
    axes.x.show()
    axes.y.show()
  }, true)

  gameContainer.addEventListener('mouseup', event => {
    game.player.div.style.cursor = 'pointer'
    game.mouse.button = false
    axes.x.hide()
    axes.y.hide()
  }, true)

  gameContainer.addEventListener('mousemove', event => {
    event.preventDefault()

    if (game.mouse.button) {
      game.mouse.x = event.clientX
      game.mouse.y = event.clientY
      game.player.x = game.mouse.x + game.mouse.offset.x
      game.player.y = game.mouse.y + game.mouse.offset.y

      checkCollisions()

      axes.x.pos = game.player.y
      axes.y.pos = game.player.x

      game.player.sync()
    }
  }, true)

  // add entities
  game.addEntity(game.player)
  game.obstacles.forEach(game.addEntity)

  // start the game main loop
  game.mainLoop()
}

document.addEventListener('DOMContentLoaded', boot, false)
