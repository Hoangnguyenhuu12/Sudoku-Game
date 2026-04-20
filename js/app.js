/**
 * app.js — State management, UI rendering, events
 * Depends on: game.js (generatePuzzle, HINTS, isValid)
 */

// ── State ────────────────────────────────────────────────
const state = {
  board:      Array(81).fill(0),
  solution:   Array(81).fill(0),
  given:      Array(81).fill(false),
  notes:      Array.from({ length: 81 }, () => new Set()),
  history:    [],
  selected:   -1,
  noteMode:   false,
  mistakes:   0,
  hintsLeft:  5,
  difficulty: 'easy',
  timerSec:   0,
  timerID:    null,
  solved:     false,
};

// ── Game Control ─────────────────────────────────────────
function newGame() {
  const { puzzle, solution } = generatePuzzle(state.difficulty);
  Object.assign(state, {
    board:     [...puzzle],
    solution,
    given:     puzzle.map(v => v !== 0),
    notes:     Array.from({ length: 81 }, () => new Set()),
    history:   [],
    selected:  -1,
    noteMode:  false,
    mistakes:  0,
    hintsLeft: HINTS[state.difficulty],
    solved:    false,
  });
  document.getElementById('noteBtn').classList.remove('active');
  document.getElementById('overlay').classList.remove('show');
  updateMeta();
  resetTimer();
  startTimer();
  renderBoard();
}

function setDifficulty(btn) {
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.difficulty = btn.dataset.diff;
  newGame();
}

// ── Input ─────────────────────────────────────────────────
function inputNum(n) {
  const { selected, given, solved, noteMode, board, notes, solution } = state;
  if (selected === -1 || given[selected] || solved) return;

  pushHistory(selected);

  if (noteMode && n !== 0) {
    // Toggle note
    board[selected] = 0;
    notes[selected].has(n) ? notes[selected].delete(n) : notes[selected].add(n);
  } else {
    notes[selected].clear();
    board[selected] = n;
    if (n !== 0 && n !== solution[selected]) {
      state.mistakes++;
      updateMeta();
      if (state.mistakes >= 5) { endGame('lose'); return; }
    }
  }

  renderBoard();
  if (board.every((v, i) => v === solution[i])) endGame('win');
}

function undoMove() {
  if (!state.history.length) return;
  const { idx, val, notesCopy } = state.history.pop();
  state.board[idx] = val;
  state.notes[idx] = notesCopy;
  renderBoard();
}

function hintMove() {
  if (state.solved || state.hintsLeft <= 0) return;
  const empties = state.board
    .map((v, i) => (v === 0 && !state.given[i] ? i : -1))
    .filter(i => i !== -1);
  if (!empties.length) return;

  const idx = empties[Math.floor(Math.random() * empties.length)];
  pushHistory(idx);
  state.board[idx] = state.solution[idx];
  state.notes[idx].clear();
  state.given[idx] = true; // show as pre-filled
  state.hintsLeft--;
  updateMeta();
  renderBoard();
  if (state.board.every((v, i) => v === state.solution[i])) endGame('win');
}

function toggleNoteMode() {
  state.noteMode = !state.noteMode;
  document.getElementById('noteBtn').classList.toggle('active', state.noteMode);
}

function pushHistory(idx) {
  state.history.push({ idx, val: state.board[idx], notesCopy: new Set(state.notes[idx]) });
}

// ── End Game ──────────────────────────────────────────────
function endGame(result) {
  state.solved = true;
  stopTimer();

  const timeStr = formatTime(state.timerSec);
  const labelEl = document.getElementById('resultLabel');
  const timeEl  = document.getElementById('resultTime');
  const subEl   = document.getElementById('resultSub');

  if (result === 'lose') {
    labelEl.textContent = 'Game Over';
    labelEl.className   = 'result-label lose';
    timeEl.textContent  = timeStr;
    subEl.textContent   = '5 mistakes reached.';
  } else {
    const prKey  = `sudoku_pr_${state.difficulty}`;
    const prevPR = parseInt(localStorage.getItem(prKey)) || Infinity;
    const isNewPR = state.timerSec < prevPR;
    if (isNewPR) localStorage.setItem(prKey, state.timerSec);

    labelEl.textContent = isNewPR ? 'New PR!' : 'You Win';
    labelEl.className   = `result-label ${isNewPR ? 'pr' : 'win'}`;
    timeEl.textContent  = timeStr;

    const bestTime = formatTime(parseInt(localStorage.getItem(prKey)));
    subEl.textContent = isNewPR
      ? `New best on ${state.difficulty}!`
      : `Best on ${state.difficulty}: ${bestTime}`;
  }

  document.getElementById('overlay').classList.add('show');
}

function closeOverlay() {
  document.getElementById('overlay').classList.remove('show');
}

// ── Render ────────────────────────────────────────────────
function renderBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  for (let i = 0; i < 81; i++) {
    const cell = createCell(i);
    boardEl.appendChild(cell);
  }
}

function createCell(i) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.dataset.idx = i;
  applyCellState(cell, i);

  if (state.board[i]) {
    cell.textContent = state.board[i];
  } else if (state.notes[i].size) {
    cell.appendChild(buildNotesEl(state.notes[i]));
  }

  cell.addEventListener('click', () => { state.selected = i; renderBoard(); });
  return cell;
}

function applyCellState(cell, i) {
  const { selected, board, given, solution } = state;

  if (given[i]) {
    cell.classList.add('given');
  } else if (board[i]) {
    cell.classList.add(board[i] !== solution[i] ? 'error' : 'user');
  }

  if (selected === -1) return;
  const sr = Math.floor(selected / 9), sc = selected % 9;
  const ir = Math.floor(i / 9),        ic = i % 9;
  const sameBox = Math.floor(sr/3) === Math.floor(ir/3) && Math.floor(sc/3) === Math.floor(ic/3);

  if (i === selected) {
    cell.classList.add('selected');
  } else if (sr === ir || sc === ic || sameBox) {
    cell.classList.add('highlight');
  }
  if (board[selected] && board[i] === board[selected] && i !== selected) {
    cell.classList.add('same-num');
  }
}

function buildNotesEl(noteSet) {
  const grid = document.createElement('div');
  grid.className = 'notes-grid';
  for (let n = 1; n <= 9; n++) {
    const s = document.createElement('span');
    s.className = 'note';
    s.textContent = noteSet.has(n) ? n : '';
    grid.appendChild(s);
  }
  return grid;
}

function updateMeta() {
  document.getElementById('mistakeCnt').textContent = state.mistakes;
  document.getElementById('hintCnt').textContent    = state.hintsLeft;
}

// ── Numpad (built once) ───────────────────────────────────
function buildNumpad() {
  const pad = document.getElementById('numpad');
  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement('button');
    btn.className   = 'num-btn';
    btn.textContent = n;
    btn.onclick     = () => inputNum(n);
    pad.appendChild(btn);
  }
  const erase = document.createElement('button');
  erase.className   = 'num-btn';
  erase.textContent = '⌫';
  erase.onclick     = () => inputNum(0);
  pad.appendChild(erase);
}

// ── Timer ─────────────────────────────────────────────────
function resetTimer() {
  stopTimer();
  state.timerSec = 0;
  document.getElementById('timer').textContent = '00:00';
}
function startTimer() {
  state.timerID = setInterval(() => {
    state.timerSec++;
    document.getElementById('timer').textContent = formatTime(state.timerSec);
  }, 1000);
}
function stopTimer()       { clearInterval(state.timerID); }
function formatTime(secs)  {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ── Theme ─────────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.dataset.theme === 'dark';
  html.dataset.theme = isDark ? 'light' : 'dark';
  document.getElementById('themeBtn').textContent = isDark ? 'Dark' : 'Light';
}

// ── Keyboard ──────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const key = e.key;
  if (key >= '1' && key <= '9')          inputNum(+key);
  else if (key === 'Backspace' || key === 'Delete') inputNum(0);
  else if (key.toLowerCase() === 'n')    toggleNoteMode();
  else if (key === 'ArrowRight') moveSelected(0,  1);
  else if (key === 'ArrowLeft')  moveSelected(0, -1);
  else if (key === 'ArrowDown')  moveSelected(1,  0);
  else if (key === 'ArrowUp')    moveSelected(-1, 0);
});

function moveSelected(dr, dc) {
  if (state.selected === -1) { state.selected = 0; renderBoard(); return; }
  const r = Math.floor(state.selected / 9) + dr;
  const c = state.selected % 9 + dc;
  if (r >= 0 && r < 9 && c >= 0 && c < 9) {
    state.selected = r * 9 + c;
    renderBoard();
  }
}

// ── Init ──────────────────────────────────────────────────
buildNumpad();
newGame();
