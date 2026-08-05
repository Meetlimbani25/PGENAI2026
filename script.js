const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const highScorePanelEl = document.getElementById("high-score-panel");
const scoreDeltaEl = document.getElementById("score-delta");
const speedEl = document.getElementById("speed");
const segmentsEl = document.getElementById("segments");
const levelEl = document.getElementById("level");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreEl = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const gameOverRestartBtn = document.getElementById("gameover-restart-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");

const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let level = 1;
let dx = 1;
let dy = 0;
let score = 0;
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;
let gameInterval;
const gameSpeed = 90;

highScoreEl.innerText = highScore;

document.addEventListener("keydown", handleKeydown);
restartBtn.addEventListener("click", resetGame);
gameOverRestartBtn.addEventListener("click", resetGame);
fullscreenBtn.addEventListener("click", toggleFullScreen);
window.addEventListener("resize", onWindowResize);
document.addEventListener("fullscreenchange", onFullScreenChange);

function getTileCount() {
  return canvas.width / gridSize;
}

function resizeCanvas() {
  const margin = 80;
  const maxSize = Math.min(window.innerWidth - margin, window.innerHeight - margin - 120);
  const size = Math.max(gridSize * 12, Math.floor(maxSize / gridSize) * gridSize);
  canvas.width = size;
  canvas.height = size;
}

function startGame() {
  resizeCanvas();
  if (gameInterval) {
    clearInterval(gameInterval);
  }
  updateHud();
  gameInterval = setInterval(gameLoop, gameSpeed);
  fullscreenBtn.innerText = document.fullscreenElement ? "EXIT FULL SCREEN" : "ENTER FULL SCREEN";
}

function gameLoop() {
  updateSnake();
  if (checkGameOver()) {
    handleGameOver();
    return;
  }
  clearCanvas();
  drawFood();
  drawSnake();
}

function clearCanvas() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#090a10");
  gradient.addColorStop(1, "#0b1120");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  for (let i = 0; i <= canvas.width; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    if (index === 0) {
      ctx.fillStyle = "#72ffe7";
      ctx.shadowBlur = 18;
      ctx.shadowColor = "rgba(114, 255, 231, 0.8)";
    } else {
      ctx.fillStyle = "#2ad3b5";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(42, 211, 181, 0.35)";
    }
    ctx.fillRect(
      segment.x * gridSize + 2,
      segment.y * gridSize + 2,
      gridSize - 4,
      gridSize - 4
    );
  });
  ctx.shadowBlur = 0;
}

function updateSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.innerText = score;
    generateFood();
  } else {
    snake.pop();
  }
}

function generateFood() {
  const tileCount = getTileCount();
  let nextFood;
  do {
    nextFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some(segment => segment.x === nextFood.x && segment.y === nextFood.y));

  food = nextFood;
}

function drawFood() {
  ctx.fillStyle = "#ff4fb8";
  ctx.shadowBlur = 16;
  ctx.shadowColor = "rgba(255, 79, 184, 0.8)";
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2 - 3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

function updateHud() {
  scoreEl.innerText = score.toString().padStart(4, "0");
  highScoreEl.innerText = highScore.toString().padStart(4, "0");
  highScorePanelEl.innerText = highScore.toString().padStart(4, "0");
  scoreDeltaEl.innerText = getScoreDelta();
  speedEl.innerText = (1000 / gameSpeed).toFixed(1);
  segmentsEl.innerText = snake.length.toString().padStart(2, "0");
  levelEl.innerText = level.toString().padStart(2, "0");
}

function getScoreDelta() {
  if (highScore === 0) return "+0%";
  return `+${Math.round((score / highScore) * 100)}%`;
}

function handleKeydown(e) {
  if (e.key === " ") {
    e.preventDefault();
    togglePause();
    return;
  }
  changeDirection(e);
}

function changeDirection(e) {
  const key = e.key.toLowerCase();
  if ((key === "arrowup" || key === "w") && dy === 0) { dx = 0; dy = -1; }
  if ((key === "arrowdown" || key === "s") && dy === 0) { dx = 0; dy = 1; }
  if ((key === "arrowleft" || key === "a") && dx === 0) { dx = -1; dy = 0; }
  if ((key === "arrowright" || key === "d") && dx === 0) { dx = 1; dy = 0; }
}

function checkGameOver() {
  const tileCount = getTileCount();
  const head = snake[0];
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;
  return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
}

function handleGameOver() {
  clearInterval(gameInterval);
  finalScoreEl.innerText = score;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", highScore);
  }
  updateHud();
  gameOverScreen.classList.remove("hidden");
}

function togglePause() {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
    gameOverScreen.classList.remove("hidden");
    gameOverScreen.querySelector("h2").innerText = "PAUSED";
    gameOverScreen.querySelector("p").innerText = "Press SPACE to resume";
    return;
  }
  gameOverScreen.querySelector("h2").innerText = "PAUSED";
  gameOverScreen.querySelector("p").innerText = "Press SPACE to resume";
  gameOverScreen.classList.add("hidden");
  startGame();
}

function resetGame() {
  snake = [{ x: Math.floor(getTileCount() / 2), y: Math.floor(getTileCount() / 2) }];
  dx = 1;
  dy = 0;
  score = 0;
  level = 1;
  updateHud();
  generateFood();
  finalScoreEl.innerText = score;
  gameOverScreen.classList.add("hidden");
  gameOverScreen.querySelector("h2").innerText = "GAME OVER";
  gameOverScreen.querySelector("p").innerText = `Final Score: ${score}`;
  startGame();
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function onWindowResize() {
  resizeCanvas();
}

function onFullScreenChange() {
  fullscreenBtn.innerText = document.fullscreenElement ? "EXIT FULL SCREEN" : "ENTER FULL SCREEN";
  resizeCanvas();
}

startGame();