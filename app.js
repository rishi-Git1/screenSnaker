const GRID_SIZE = 20;
const MOVE_INTERVAL_MS = 85;
const CANVAS_SIZE = 1000;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const PAUSE_AFTER_MOUSE_MOVE_MS = 1600;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const pauseOverlay = document.getElementById('pauseOverlay');

function cellKey({ x, y }) {
  return `${x},${y}`;
}

function buildHamiltonianCycle(width, height) {
  if (height % 2 !== 0) {
    throw new Error('Hamiltonian cycle builder requires even grid height.');
  }

  const cycle = [{ x: 0, y: 0 }];

  for (let x = 1; x < width; x += 1) {
    cycle.push({ x, y: 0 });
  }

  for (let y = 1; y < height; y += 1) {
    if (y % 2 === 1) {
      for (let x = width - 1; x >= 1; x -= 1) {
        cycle.push({ x, y });
      }
    } else {
      for (let x = 1; x < width; x += 1) {
        cycle.push({ x, y });
      }
    }
  }

  for (let y = height - 1; y >= 1; y -= 1) {
    cycle.push({ x: 0, y });
  }

  return cycle;
}

const cycle = buildHamiltonianCycle(GRID_SIZE, GRID_SIZE);
const cycleLookup = new Map(cycle.map((point, index) => [cellKey(point), index]));

let snake = [
  { ...cycle[0] },
  { ...cycle[cycle.length - 1] },
  { ...cycle[cycle.length - 2] },
  { ...cycle[cycle.length - 3] }
];
let previousSnake = snake.map((segment) => ({ ...segment }));

function randomFoodPosition() {
  const occupied = new Set(snake.map(cellKey));
  const candidates = cycle.filter((point) => !occupied.has(cellKey(point)));
  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  return selected ? { ...selected } : null;
}

let food = randomFoodPosition();
let lastTick = performance.now();
let pausedUntil = 0;

function moveSnake() {
  previousSnake = snake.map((segment) => ({ ...segment }));

  const head = snake[0];
  const cycleIndex = cycleLookup.get(cellKey(head));
  const next = cycle[(cycleIndex + 1) % cycle.length];

  snake.unshift({ ...next });

  if (food && next.x === food.x && next.y === food.y) {
    food = randomFoodPosition();
  } else {
    snake.pop();
  }

  if (previousSnake.length < snake.length) {
    previousSnake.push({ ...snake[snake.length - 1] });
  }
}

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function draw(progress) {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.fillStyle = '#071327';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.strokeStyle = 'rgba(116, 163, 224, 0.16)';
  ctx.lineWidth = 1;
  for (let i = 1; i < GRID_SIZE; i += 1) {
    const position = i * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, position);
    ctx.lineTo(CANVAS_SIZE, position);
    ctx.stroke();
  }

  if (food) {
    const fx = food.x * CELL_SIZE;
    const fy = food.y * CELL_SIZE;
    const pad = CELL_SIZE * 0.2;
    roundedRect(fx + pad, fy + pad, CELL_SIZE - pad * 2, CELL_SIZE - pad * 2, CELL_SIZE * 0.22);
    ctx.fillStyle = '#ff5c8a';
    ctx.shadowColor = '#ff5c8a';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  snake.forEach((segment, index) => {
    const prev = previousSnake[index] || segment;
    const x = (prev.x + (segment.x - prev.x) * progress) * CELL_SIZE;
    const y = (prev.y + (segment.y - prev.y) * progress) * CELL_SIZE;
    const padding = index === 0 ? CELL_SIZE * 0.08 : CELL_SIZE * 0.11;

    roundedRect(
      x + padding,
      y + padding,
      CELL_SIZE - padding * 2,
      CELL_SIZE - padding * 2,
      CELL_SIZE * (index === 0 ? 0.28 : 0.24)
    );

    if (index === 0) {
      ctx.fillStyle = '#74ffd2';
      ctx.shadowColor = '#66ffcc';
      ctx.shadowBlur = 24;
    } else {
      ctx.fillStyle = `hsl(${150 + Math.min(index, 60)}, 80%, ${Math.max(34, 62 - index * 0.4)}%)`;
      ctx.shadowColor = 'rgba(84, 255, 198, 0.3)';
      ctx.shadowBlur = 11;
    }

    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function setPausedState(isPaused) {
  pauseOverlay.classList.toggle('visible', isPaused);
}

function animate(now) {
  const isPaused = now < pausedUntil;

  if (!isPaused && now - lastTick >= MOVE_INTERVAL_MS) {
    moveSnake();
    lastTick = now;
  }

  const progress = isPaused ? 0 : Math.min((now - lastTick) / MOVE_INTERVAL_MS, 1);
  draw(progress);
  setPausedState(isPaused);
  requestAnimationFrame(animate);
}

window.addEventListener('mousemove', () => {
  pausedUntil = performance.now() + PAUSE_AFTER_MOUSE_MOVE_MS;
});

window.addEventListener('keydown', () => {
  pausedUntil = performance.now() + PAUSE_AFTER_MOUSE_MOVE_MS;
});

requestAnimationFrame(animate);
