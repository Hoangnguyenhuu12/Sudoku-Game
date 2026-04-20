/**
 * game.js — Pure Sudoku logic (no DOM dependencies)
 * Exports: generatePuzzle(difficulty), isValid(grid, idx, n)
 * Constants: CLUES, HINTS
 */

const CLUES = { easy: 46, medium: 32, hard: 24 };
const HINTS = { easy: 5,  medium: 3,  hard: 1  };

/** Fisher-Yates shuffle — returns a new shuffled array */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Check if placing n at idx is valid in the current grid */
function isValid(grid, idx, n) {
  const row = Math.floor(idx / 9), col = idx % 9;
  const br  = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let i = 0; i < 9; i++) {
    if (grid[row * 9 + i]           === n) return false; // row
    if (grid[i * 9 + col]           === n) return false; // col
    if (grid[(br + Math.floor(i/3)) * 9 + (bc + i % 3)] === n) return false; // box
  }
  return true;
}

/** Recursively fill grid with a valid solution */
function fillGrid(grid) {
  const idx = grid.indexOf(0);
  if (idx === -1) return true; // solved
  for (const n of shuffle([1,2,3,4,5,6,7,8,9])) {
    if (isValid(grid, idx, n)) {
      grid[idx] = n;
      if (fillGrid(grid)) return true;
      grid[idx] = 0;
    }
  }
  return false;
}

/**
 * Generate a puzzle for the given difficulty.
 * Returns { puzzle: number[], solution: number[] }
 */
function generatePuzzle(difficulty) {
  const solution = Array(81).fill(0);
  fillGrid(solution);

  const puzzle  = [...solution];
  const remove  = 81 - CLUES[difficulty];
  shuffle([...Array(81).keys()]).slice(0, remove).forEach(i => (puzzle[i] = 0));

  return { puzzle, solution };
}
