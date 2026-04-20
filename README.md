# Sudoku-Game

A clean, minimal Sudoku web app — no frameworks, no dependencies, just HTML, CSS, and vanilla JavaScript.

🔗 **[Live Demo](https://Hoangnguyenhuu12.github.io/Sudoku-Game)**

---

## Features

- **3 difficulty levels** — Easy (46 clues), Medium (32 clues), Hard (24 clues)
- **Hint system** — limited per difficulty: Easy × 5, Medium × 3, Hard × 1
- **Note mode** — pencil in candidate numbers per cell
- **Undo** — step back one move at a time
- **Mistake tracking** — game ends after 5 mistakes
- **Live timer** — stops on win or game over
- **Personal best (PR)** — tracks your fastest solve per difficulty via `localStorage`
- **Result screen** — shows You Win / New PR / Game Over with your time
- **Dark / Light mode** — toggle in the header, no flash on load
- **Keyboard support** — navigate and fill the board without a mouse
- **No dependencies** — zero npm, zero build step, open the file and play

---

## Project Structure

```
sudoku/
├── index.html        # Markup only — no inline scripts or styles
├── css/
│   └── style.css     # All styling, CSS custom properties for theming
└── js/
    ├── game.js       # Pure sudoku logic (generation, validation) — no DOM
    └── app.js        # State, rendering, events, timer, theme
```

---

## Getting Started

### Play locally

```bash
git clone https://github.com/Hoangnguyenhuu12/Sudoku-Game.git
cd sudoku
# Open index.html in your browser — no server needed
open index.html
```

> If you prefer a local server (to avoid any browser file restrictions):
> ```bash
> npx serve .
> # or
> python3 -m http.server 8080
> ```

### Deploy to GitHub Pages

1. Push the repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Save — your app will be live at `https://Hoangnguyenhuu12.github.io/Sudoku-Game`

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` – `9` | Fill selected cell |
| `Backspace` / `Delete` | Erase cell |
| `Arrow keys` | Move between cells |
| `N` | Toggle note mode |

---

## How It Works

**Puzzle generation** (`game.js`)
A complete solution is built first using recursive backtracking with a shuffled digit order, giving a different puzzle every time. Clues are then removed at random to match the target count for the chosen difficulty.

**Validation** — each number is checked against its row, column, and 3×3 box in a single loop, keeping the logic compact and readable.

**Personal best** — solve times are saved to `localStorage` under the key `sudoku_pr_<difficulty>`. On a win, the new time is compared to the stored value; if it's faster, the result screen shows "New PR!" in amber instead of the standard green "You Win".

---

## Customisation

All visual tokens live in `:root` inside `style.css` — tweak colours, cell size, or font size without touching any logic:

```css
:root {
  --accent:  #2563eb;   /* user-entered numbers, selection highlight */
  --error:   #dc2626;   /* wrong number colour */
  --cell:    clamp(38px, 9.5vw, 56px);  /* responsive cell size */
}
```

To change hint limits per difficulty, edit `HINTS` in `game.js`:

```js
const HINTS = { easy: 5, medium: 3, hard: 1 };
```

---

## License

MIT — free to use, modify, and distribute.
