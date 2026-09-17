(function(){
  const DIFFS = {
    easy:   { rows: 9,  cols: 9,  mines: 10 },
    medium: { rows: 12, cols: 12, mines: 30 },
    hard:   { rows: 16, cols: 16, mines: 50 },
  };

  const boardEl = document.getElementById('board');
  const mineCountEl = document.getElementById('mineCount');
  const timerEl = document.getElementById('timer');
  const resetBtn = document.getElementById('resetBtn');
  const statusEl = document.getElementById('status');
  const diffBtns = document.querySelectorAll('.diff-btn');

  let cfg = DIFFS.easy;
  let grid = [];
  let firstClick = true;
  let gameOver = false;
  let flagsUsed = 0;
  let cellsRevealed = 0;
  let timerInterval = null;
  let seconds = 0;

  function pad(n){ return String(n).padStart(3, '0'); }

  function setDifficulty(name){
    cfg = DIFFS[name];
    diffBtns.forEach(b => b.classList.toggle('active', b.dataset.diff === name));
    newGame();
  }

  function newGame(){
    clearInterval(timerInterval);
    seconds = 0;
    timerEl.textContent = pad(0);
    firstClick = true;
    gameOver = false;
    flagsUsed = 0;
    cellsRevealed = 0;
    statusEl.textContent = '';
    statusEl.className = 'status';
    resetBtn.textContent = '😺';
    mineCountEl.textContent = pad(cfg.mines);

    grid = [];
    for (let r = 0; r < cfg.rows; r++){
      const row = [];
      for (let c = 0; c < cfg.cols; c++){
        row.push({ mine: false, revealed: false, flagged: false, adjacent: 0 });
      }
      grid.push(row);
    }
    renderBoard();
  }

  function renderBoard(){
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`;
    boardEl.style.maxWidth = (cfg.cols * 34) + 'px';
    for (let r = 0; r < cfg.rows; r++){
      for (let c = 0; c < cfg.cols; c++){
        const cellEl = document.createElement('div');
        cellEl.className = 'cell';
        cellEl.dataset.r = r;
        cellEl.dataset.c = c;
        cellEl.addEventListener('click', onLeftClick);
        cellEl.addEventListener('contextmenu', onRightClick);
        boardEl.appendChild(cellEl);
      }
    }
  }

  function placeMines(excludeR, excludeC){
    let placed = 0;
    while (placed < cfg.mines){
      const r = Math.floor(Math.random() * cfg.rows);
      const c = Math.floor(Math.random() * cfg.cols);
      const tooClose = Math.abs(r - excludeR) <= 1 && Math.abs(c - excludeC) <= 1;
      if (grid[r][c].mine || tooClose) continue;
      grid[r][c].mine = true;
      placed++;
    }
    for (let r = 0; r < cfg.rows; r++){
      for (let c = 0; c < cfg.cols; c++){
        if (grid[r][c].mine) continue;
        grid[r][c].adjacent = countAdjacentMines(r, c);
      }
    }
  }

  function countAdjacentMines(r, c){
    let count = 0;
    forEachNeighbor(r, c, (nr, nc) => { if (grid[nr][nc].mine) count++; });
    return count;
  }

  function forEachNeighbor(r, c, fn){
    for (let dr = -1; dr <= 1; dr++){
      for (let dc = -1; dc <= 1; dc++){
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < cfg.rows && nc >= 0 && nc < cfg.cols) fn(nr, nc);
      }
    }
  }

  function startTimer(){
    timerInterval = setInterval(() => {
      seconds++;
      if (seconds > 999) seconds = 999;
      timerEl.textContent = pad(seconds);
    }, 1000);
  }

  function onLeftClick(e){
    if (gameOver) return;
    const r = parseInt(e.currentTarget.dataset.r);
    const c = parseInt(e.currentTarget.dataset.c);
    const cell = grid[r][c];

    if (cell.revealed){
      chordCell(r, c);
      return;
    }
    if (cell.flagged) return;

    if (firstClick){
      placeMines(r, c);
      firstClick = false;
      startTimer();
    }

    if (cell.mine){
      revealAllMines(r, c);
      endGame(false);
      return;
    }

    revealCell(r, c);
    checkWin();
  }

  function chordCell(r, c){
    const cell = grid[r][c];
    if (!cell.revealed || cell.adjacent === 0) return;

    let flagCount = 0;
    const neighbors = [];
    forEachNeighbor(r, c, (nr, nc) => {
      neighbors.push([nr, nc]);
      if (grid[nr][nc].flagged) flagCount++;
    });

    if (flagCount !== cell.adjacent) return;

    let hitMine = null;
    for (const [nr, nc] of neighbors){
      const n = grid[nr][nc];
      if (n.flagged || n.revealed) continue;
      if (n.mine){
        hitMine = [nr, nc];
      }
    }

    if (hitMine){
      revealAllMines(hitMine[0], hitMine[1]);
      endGame(false);
      return;
    }

    for (const [nr, nc] of neighbors){
      const n = grid[nr][nc];
      if (!n.flagged && !n.revealed) revealCell(nr, nc);
    }
    checkWin();
  }

  function onRightClick(e){
    e.preventDefault();
    if (gameOver) return;
    const r = parseInt(e.currentTarget.dataset.r);
    const c = parseInt(e.currentTarget.dataset.c);
    const cell = grid[r][c];
    if (cell.revealed) return;

    if (firstClick && !cell.flagged) {
      // allow flagging before first click without starting mines
    }

    cell.flagged = !cell.flagged;
    flagsUsed += cell.flagged ? 1 : -1;
    mineCountEl.textContent = pad(Math.max(cfg.mines - flagsUsed, -99));
    updateCellDisplay(r, c);
  }

  function revealCell(r, c){
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged) return;
    cell.revealed = true;
    cellsRevealed++;
    updateCellDisplay(r, c);

    if (cell.adjacent === 0){
      forEachNeighbor(r, c, (nr, nc) => {
        if (!grid[nr][nc].revealed) revealCell(nr, nc);
      });
    }
  }

  function updateCellDisplay(r, c){
    const cell = grid[r][c];
    const el = boardEl.children[r * cfg.cols + c];
    el.className = 'cell';
    el.textContent = '';

    if (cell.flagged && !cell.revealed){
      el.classList.add('flagged');
      return;
    }
    if (!cell.revealed) return;

    el.classList.add('dug');
    if (cell.mine){
      el.classList.add('mine');
    } else if (cell.adjacent > 0){
      el.textContent = cell.adjacent;
      el.classList.add('n' + cell.adjacent);
      el.classList.add('chordable');
    }
  }

  function revealAllMines(hitR, hitC){
    for (let r = 0; r < cfg.rows; r++){
      for (let c = 0; c < cfg.cols; c++){
        const cell = grid[r][c];
        const el = boardEl.children[r * cfg.cols + c];
        if (cell.mine && !cell.flagged){
          cell.revealed = true;
          el.className = 'cell dug mine';
          if (r === hitR && c === hitC) el.classList.add('mine-hit');
        } else if (!cell.mine && cell.flagged){
          el.className = 'cell wrong-flag';
        }
      }
    }
  }

  function checkWin(){
    const totalSafe = cfg.rows * cfg.cols - cfg.mines;
    if (cellsRevealed === totalSafe){
      endGame(true);
    }
  }

  function endGame(won){
    gameOver = true;
    clearInterval(timerInterval);
    resetBtn.textContent = won ? '😻' : '🙀';
    statusEl.textContent = won ? 'All mice found — good kitty!' : 'A mouse startled you!';
    statusEl.className = 'status ' + (won ? 'win' : 'lose');
    if (won){
      for (let r = 0; r < cfg.rows; r++){
        for (let c = 0; c < cfg.cols; c++){
          if (grid[r][c].mine && !grid[r][c].flagged){
            grid[r][c].flagged = true;
            updateCellDisplay(r, c);
          }
        }
      }
      mineCountEl.textContent = pad(0);
    }
  }

  resetBtn.addEventListener('click', newGame);
  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => setDifficulty(btn.dataset.diff));
  });

  newGame();
})();