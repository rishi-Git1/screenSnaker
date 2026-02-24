# Screen Snaker

A fullscreen-friendly snake screensaver-style web page where the snake is controlled by a Hamiltonian cycle algorithm.

## Features

- 20x20 game board
- Autonomous snake movement with a Hamiltonian cycle (safe infinite loop)
- Fast, smooth animation with interpolated movement
- Pause-on-interaction behavior (mouse move or key press)
- Clean display with no stats overlay

## Run locally

Because this project is static, you can serve it with any web server.

### Option 1: Python

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

### Option 2: VS Code Live Server

Open the project and start Live Server.
