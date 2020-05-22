'use strict'

const MINE_IMAGE = '&#9737;'
const FLAG = '&#9971;'
const SMILEY = '&#128578;'
const WORRIED = '&#128543;'
const SUN_GLASSES = '&#128526;'
const CLUE = '&#10067;'

// todo: timer startsv on first click
// todo: timer ends when last cell is shown
var timerInterval
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  firstClick: true,
}
var life = 3
var cluesCount = 3
var numOfSafeClickes = 3
var level = { SIZE: 4, MINES: 2 }
var mines = []
var actions = []
var board
var testLevel
var isHint = false
var isManualMode = false
var minePlacedCount = 0

board = createBoard(level) // play default level
setMinesNegsCount(board)
renderMineSweeperBoard(board)
renderBestScorePerLevel()
renderClues()
updateLife()

function setManualMode() {
  isManualMode = true
  var placeButtonEl = document.querySelector('.manual')
  placeButtonEl.innerText = 'Place Mines'
  placeButtonEl.style = 'background-color:purple'
}

function runTimer() {
  var timerEl = document.querySelector('h3')
  timerInterval = setInterval(function () {
    timerEl.innerText = `Time: ${gGame.secsPassed}`
    gGame.secsPassed++
  }, 1000)
}

function getLevel(numLevel) {
  gGame.firstClick = true
  switch (numLevel) {
    case 4:
      level = { SIZE: 4, MINES: 2 }
      break
    case 8:
      level = { SIZE: 8, MINES: 12 }
      break
    case 16:
      level = { SIZE: 12, MINES: 30 }
      break
    default:
      break
  }
  gGame.secsPassed = 0
  var timerEl = document.querySelector('h3')
  timerEl.innerText = `Time: ${gGame.secsPassed}`
  board = createBoard(level) // play user level
  setMinesNegsCount(board)
  renderMineSweeperBoard(board)
  renderBestScorePerLevel()
  gGame.markedCount = 0
  gGame.shownCount = 0
  cluesCount = 3
  renderClues()
  life = 3
  updateLife()
}

function createBoard(level) {
  var board = []
  for (let row = 0; row < level.SIZE; row++) {
    board.push([])
    for (let col = 0; col < level.SIZE; col++) {
      board[row].push({
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      })
    }
  }
  if (!isManualMode) {
    placeMinesAtRandomLocations(board)
  }
  return board
}

// setMinesNegsCount(board)
// console.log(board)
function setMinesNegsCount(board) {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      var cell = board[row][col]
      var numOfMinesAround = getMineNeighboursCount(row, col, board)
      cell.minesAroundCount = numOfMinesAround
    }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}

function placeMinesAtRandomLocations(board) {
  var mineCount = 0
  while (level.MINES !== mineCount) {
    var randomRow = getRandomInt(0, level.SIZE - 1)
    var randomCol = getRandomInt(0, level.SIZE - 1)
    if (board[randomRow][randomCol].isMine) continue
    var cell = board[randomRow][randomCol]
    cell.isMine = true
    mineCount++
  }
}

function getMineNeighboursCount(currRow, currCol, board) {
  var minesCount = 0
  for (let row = currRow - 1; row <= currRow + 1; row++) {
    if (row < 0 || row > level.SIZE - 1) continue
    for (let col = currCol - 1; col <= currCol + 1; col++) {
      var cell = board[row][col]
      if (col < 0 || col > level.SIZE - 1) continue
      if (currRow === row && currCol === col) continue
      if (cell.isMine) minesCount++
    }
  }
  return minesCount
}

function renderMineSweeperBoard(board) {
  var strHtml = ``
  for (let row = 0; row < board.length; row++) {
    strHtml += `<tr>`
    for (let col = 0; col < board[row].length; col++) {
      var cell = board[row][col]
      var numOfMines = cell.minesAroundCount
      if (numOfMines === 0 && !cell.isMine) {
        strHtml += `<td id='cell-${row}-${col}'
                        class='cell-hidden'
                        onclick='cellClicked(this, ${row}, ${col})'
                        oncontextmenu='cellMarked(this,${row}, ${col});return false'>
                    0    
                    </td>`
      } else if (cell.isMine) {
        strHtml += `<td id='cell-${row}-${col}'
                        class='cell-hidden'
                        onclick='cellClicked(this, ${row}, ${col})'
                        oncontextmenu='cellMarked(this ,${row}, ${col});return false'>
                        ${MINE_IMAGE}
                        </td>`
      } else {
        //var className = cell.isShown ? '' : 'cell-hidden'
        strHtml += `<td id='cell-${row}-${col}'
                        class='cell-hidden'
                        onclick='cellClicked(this, ${row}, ${col})'
                        oncontextmenu='cellMarked(this, ${row}, ${col});return false'>
                        ${numOfMines}
                        </td>`
      }
    }
    strHtml += `</tr>`
  }
  var tableBodyEl = document.querySelector('table tbody')
  tableBodyEl.innerHTML = strHtml
}

function showAllMines() {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      var cell = board[row][col]
      if (cell.isMine) {
        cell.isShown = true
        var mineEl = document.querySelector(`#cell-${row}-${col}`)
        mineEl.classList.remove('cell-hidden')
        mineEl.classList.add('show-mine')
      }
    }
  }
}

function showAMine(col, row, cell) {
  cell.isShown = true
  cell.isMarked = true
  gGame.markedCount++
  var mineEl = document.querySelector(`#cell-${row}-${col}`)
  mineEl.classList.remove('cell-hidden')
  mineEl.classList.add('show-mine')
}

function unShowMine(row, col) {
  var cell = board[row][col]
  cell.isShown = false
  cell.isMarked = false
  gGame.markedCount--
  var mineEl = document.querySelector(`#cell-${row}-${col}`)
  mineEl.classList.remove('show-mine')
  mineEl.classList.add('cell-hidden')
}

function showFirstDegreeNeighbours(currRow, currCol) {
  debugger
  for (let row = currRow - 1; row <= currRow + 1; row++) {
    if (row < 0 || row > level.SIZE - 1) continue
    for (let col = currCol - 1; col <= currCol + 1; col++) {
      var cell = board[row][col]
      if (col < 0 || col > level.SIZE - 1) continue
      if (cell.isShown) continue
      if (cell.isMine) continue
      if (cell.isMarked) continue
      cell.isShown = true
      var cellEl = document.querySelector(`#cell-${row}-${col}`)
      cellEl.classList.remove('cell-hidden')
      if (cell.minesAroundCount === 0) {
        showFirstDegreeNeighbours(row, col)
      }
      gGame.shownCount++
    }
  }
}

function hideFirstDegreeNeighbours(currRow, currCol) {
  for (let row = currRow - 1; row <= currRow + 1; row++) {
    if (row < 0 || row > level.SIZE - 1) continue
    for (let col = currCol - 1; col <= currCol + 1; col++) {
      var cell = board[row][col]
      if (col < 0 || col > level.SIZE - 1) continue
      if (!cell.isShown) continue
      if (cell.isMine) continue
      if (cell.isMarked) continue
      cell.isShown = false
      var cellEl = document.querySelector(`#cell-${row}-${col}`)
      cellEl.classList.add('cell-hidden')
      if (cell.minesAroundCount === 0) {
        hideFirstDegreeNeighbours(row, col)
      }
      gGame.shownCount--
    }
  }
}

function clearBoard() {
  board = []
}

function clearVisualBoard() {
  var tableBodyEl = document.querySelector('table tbody')
  tableBodyEl.innerHTML = ''
}
function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell${location.i}-${location.j}`)
  elCell.innerHTML = value
}

function getCellCoords(id) {
  var listOfWords = id.split('-')
  return { row: listOfWords[1], col: listOfWords[2] }
}

function cellMarked(elCell, row, col) {
  if (!gGame.isOn) return
  if (board[row][col].isMarked) {
    if (board[row][col].isMine) {
      elCell.innerHTML = MINE_IMAGE
    } else {
      elCell.innerText = board[row][col].minesAroundCount
    }
    board[row][col].isMarked = false
    gGame.markedCount--
    return
  }
  board[row][col].isMarked = true
  elCell.innerHTML = FLAG
  gGame.markedCount++
  checkGameOver()
}

function getBestScores() {
  var scores = {}
  var easyBestScore = localStorage.getItem('Easy')
  var mediumBestScore = localStorage.getItem('Medium')
  var hardBestScore = localStorage.getItem('Hard')
  scores = { easyBestScore, mediumBestScore, hardBestScore }
  return scores
}

function storeBestScore(time) {
  var levelName = ''
  switch (level.SIZE) {
    case 4:
      levelName = 'Easy'
      break
    case 8:
      levelName = 'Medium'
      break
    case 12:
      levelName = 'Hard'
      break
    default:
      break
  }
  if (localStorage.getItem(levelName)) {
    if (+localStorage.getItem(levelName) > time) {
      localStorage.setItem(levelName, time)
    }
  } else {
    localStorage.setItem(levelName, time)
  }
}

function renderBestScorePerLevel() {
  var bestScores = getBestScores()
  var easyCell = document.querySelector('.scores .easy')
  var mediumCell = document.querySelector('.scores .medium')
  var hardCell = document.querySelector('.scores .hard')

  easyCell.innerText = bestScores.easyBestScore
  mediumCell.innerText = bestScores.mediumBestScore
  hardCell.innerText = bestScores.hardBestScore
}

function checkGameOver() {
  if (
    gGame.markedCount === level.MINES &&
    gGame.shownCount === level.SIZE ** 2 - level.MINES
  ) {
    clearBoard()
    clearVisualBoard()
    clearInterval(timerInterval)
    storeBestScore(gGame.secsPassed)
    renderBestScorePerLevel()
    resetGameObject()
    resetLifeCount()
    updateLife()
    renderSunglassesEmoji()
    resetNumOfSafeClicks()
    renderSafeClicksUpdate()
  }
}

function renderSunglassesEmoji() {
  var bannerEl = document.querySelector('.banner')
  bannerEl.innerHTML = SUN_GLASSES
}

function resetLifeCount() {
  life = 3
}

function resetNumOfSafeClicks() {
  numOfSafeClickes = 3
}

function renderSafeClicksUpdate() {
  var safeEl = document.querySelector('.safe')
  safeEl.innerText = `Safe Click:${numOfSafeClickes}`
}

function getSafeCoords() {
  var coords = []
  for (let row = 0; row < level.SIZE; row++) {
    for (let col = 0; col < level.SIZE; col++) {
      if (!board[row][col].isMine && !board[row][col].isShown) {
        coords.push({ row, col })
      }
    }
  }
  return coords
}

function clickedSafe() {
  if (numOfSafeClickes === 0) return
  numOfSafeClickes--
  var safeCoords = getSafeCoords()
  var randomSafeCoord =
    safeCoords[Math.floor(Math.random() * safeCoords.length)]
  var safeCell = document.querySelector(
    `#cell-${randomSafeCoord.row}-${randomSafeCoord.col}`,
  )
  safeCell.style.border = '2px solid red'
  setInterval(function () {
    safeCell.style.border = ''
  }, 3000)
  var safeEl = document.querySelector('.safe')
  safeEl.innerText = `Safe Click:${numOfSafeClickes}`
}

function updateLife() {
  var lifeEl = document.querySelector('.life')
  lifeEl.innerHTML = SMILEY.repeat(life)
}

function resetGameObject() {
  gGame.shownCount = 0
  gGame.secsPassed = 0
  gGame.markedCount = 0
}

function restartGame() {
  clearBoard()
  clearVisualBoard()
  clearInterval(timerInterval)
  resetGameObject()
  resetLifeCount()
  updateLife()
  resetNumOfSafeClicks()
  renderSafeClicksUpdate()

  board = createBoard(level) // play user level
  setMinesNegsCount(board)
  renderMineSweeperBoard(board)
  renderBestScorePerLevel()
}

function HintClicked() {
  isHint = true
  cluesCount--
}

function ShowOrHideNeighbours(currRow, currCol, action) {
  for (let row = currRow - 1; row <= currRow + 1; row++) {
    if (row < 0 || row > level.SIZE - 1) continue
    for (let col = currCol - 1; col <= currCol + 1; col++) {
      var cell = board[row][col]
      if (col < 0 || col > level.SIZE - 1) continue
      var cellEl = document.querySelector(`#cell-${row}-${col}`)
      if (action === 'show') {
        cellEl.classList.remove('cell-hidden')
      } else if (action === 'hide') {
        cellEl.classList.add('cell-hidden')
      }
    }
  }
}

function revealNeighboursForASec(currRow, currCol) {
  ShowOrHideNeighbours(currRow, currCol, 'show')
  setTimeout(function () {
    ShowOrHideNeighbours(currRow, currCol, 'hide')
  }, 2000)
}

function renderClues() {
  var clueEl = document.querySelector('.clue')
  var strHtml = ''
  for (let i = 0; i < cluesCount; i++) {
    strHtml += `<span onclick='HintClicked()'>${CLUE}</span>`
  }
  clueEl.innerHTML = strHtml
}

function createActionAndStore(row, col, actionDesc) {
  var action = {}
  action = { row, col, actionDesc }
  actions.push(action)
}

function undoMineFlip(row, col) {
  life++
  updateLife()
  unShowMine(row, col)
  var bannerEl = document.querySelector('.banner')
  bannerEl.innerHTML = SMILEY
}

function undoHasNeighboursFlip(row, col) {
  board[row][col].isShown = false
  var elCell = document.querySelector(`#cell-${row}-${col}`)
  elCell.classList.remove('cell-shown')
  elCell.classList.add('cell-hidden')
  gGame.shownCount--
}

function undoPrevAction() {
  debugger
  var prevAction = actions.pop()
  switch (prevAction.actionDesc) {
    case 'Fliped-Has-No-Neighbours':
      hideFirstDegreeNeighbours(prevAction.row, prevAction.col)
      break
    case 'Fliped-Has-Neighbours':
      undoHasNeighboursFlip(prevAction.row, prevAction.col)
      break
    case 'Fliped-Mine':
      undoMineFlip(prevAction.row, prevAction.col)
      break
    default:
      break
  }
}

function cellClicked(elCell, row, col) {
  var currentCell = board[row][col]
  var bannerEl = document.querySelector('.banner')
  if (isManualMode) {
    debugger
    if (minePlacedCount === 0) {
      board = createBoard(level) // play default level
      renderMineSweeperBoard(board)
    }
    var cell = board[row][col]
    cell.isMine = true
    var mineCell = document.querySelector(`#cell-${row}-${col}`)
    mineCell.style.border = '2px solid purple'
    setInterval(function () {
      mineCell.style.border = ''
    }, 2000)
    minePlacedCount++
    if (minePlacedCount === level.MINES) {
      var placeButtonEl = document.querySelector('.manual')
      placeButtonEl.innerText = 'Manual Mode'
      placeButtonEl.style = 'background-color:'
      setMinesNegsCount(board)
      renderMineSweeperBoard(board)
      isManualMode = false
      minePlacedCount = 0
      return
    }
    return
  }

  if (isHint) {
    revealNeighboursForASec(row, col)
    renderClues()
    isHint = false
    return
  }
  if (currentCell.isMarked) return

  if (gGame.firstClick) {
    runTimer()
    updateLife()
    gGame.firstClick = false
    gGame.isOn = true
  }

  if (!gGame.isOn) return

  if (currentCell.isMine) {
    life--
    createActionAndStore(row, col, 'Fliped-Mine')
    updateLife()
    showAMine(col, row, currentCell)
    bannerEl.innerHTML = WORRIED
    if (life === 0) {
      showAllMines()
      gGame.isOn = false
      resetGameObject()
      clearInterval(timerInterval)
      bannerEl.innerHTML = '&#128577'
      life = 3
      numOfSafeClickes = 3
      var safeEl = document.querySelector('.safe')
      safeEl.innerText = `Safe Click:${numOfSafeClickes}`
      return
    }
    return
  }

  if (currentCell.minesAroundCount > 0) {
    createActionAndStore(row, col, 'Fliped-Has-Neighbours')
    currentCell.isShown = true
    elCell.classList.remove('cell-hidden')
    elCell.classList.add('cell-shown')
    gGame.shownCount++
    bannerEl.innerHTML = SMILEY
  }

  if (!currentCell.minesAroundCount) {
    createActionAndStore(row, col, 'Fliped-Has-No-Neighbours')
    showFirstDegreeNeighbours(row, col, board)
    bannerEl.innerHTML = SMILEY
  }
  checkGameOver()
}
