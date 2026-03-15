const game = document.getElementById("game");
const ship = document.getElementById("ship");

const distanceEl = document.getElementById("distance");
const dodgedEl = document.getElementById("dodged");
const levelEl = document.getElementById("level");
const bestScoreEl = document.getElementById("bestScore");
const startBestScoreEl = document.getElementById("startBestScore");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalDistanceEl = document.getElementById("finalDistance");
const finalDodgedEl = document.getElementById("finalDodged");
const finalBestScoreEl = document.getElementById("finalBestScore");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

let gameWidth = 0;
let gameHeight = 0;
let shipWidth = 0;
let shipHeight = 0;

let shipX = 0;
let distance = 0;
let dodged = 0;
let level = 1;
let bestScore = 0;

let running = false;
let animationId = null;
let spawnTimer = null;
let lastFrameTime = 0;

const icebergs = [];

const keyboard = {
  left: false,
  right: false,
};

let touchActive = false;
let lastTouchX = 0;

function loadBestScore() {
  const saved = localStorage.getItem("titanic_best_score");
  bestScore = saved ? Number(saved) : 0;
  renderBestScore();
}

function saveBestScore() {
  localStorage.setItem("titanic_best_score", String(bestScore));
}

function renderBestScore() {
  const rounded = Math.floor(bestScore);
  bestScoreEl.textContent = rounded;
  startBestScoreEl.textContent = rounded;
  finalBestScoreEl.textContent = rounded;
}

function setupSizes() {
  const rect = game.getBoundingClientRect();
  gameWidth = rect.width;
  gameHeight = rect.height;

  shipWidth = ship.offsetWidth || 86;
  shipHeight = ship.offsetHeight || 40;

  if (!shipX || shipX > gameWidth - shipWidth) {
    shipX = (gameWidth - shipWidth) / 2;
  }

  renderShip();
}

function renderShip() {
  ship.style.left = `${shipX}px`;
  ship.style.transform = "translateX(0)";
}

function updateHUD() {
  distanceEl.textContent = Math.floor(distance);
  dodgedEl.textContent = dodged;
  levelEl.textContent = level;
}

function clearIcebergs() {
  while (icebergs.length > 0) {
    const iceberg = icebergs.pop();
    iceberg.el.remove();
  }
}

function createIceberg() {
  if (!running) return;

  const el = document.createElement("div");
  el.className = "iceberg";

  const img = document.createElement("img");
  img.src = "assets/img/iceberg.png";
  img.alt = "Iceberg";

  const size = 34 + Math.random() * 28;
  const x = Math.random() * Math.max(20, gameWidth - size - 8);
  const speed = 170 + Math.random() * 120 + (level - 1) * 35;

  el.style.left = `${x}px`;
  el.style.top = `-${size}px`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;

  el.appendChild(img);
  game.appendChild(el);

  icebergs.push({
    el,
    x,
    y: -size,
    size,
    speed,
    counted: false,
  });
}

function getShipRect() {
  return {
    x: shipX + 10,
    y: gameHeight - shipHeight - 18 + 8,
    width: Math.max(30, shipWidth - 20),
    height: Math.max(18, shipHeight - 10),
  };
}

function overlaps(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function moveShip(dt) {
  const speed = 360;
  const amount = speed * dt;

  if (keyboard.left) {
    shipX -= amount;
  }

  if (keyboard.right) {
    shipX += amount;
  }

  if (shipX < 0) shipX = 0;
  if (shipX > gameWidth - shipWidth) shipX = gameWidth - shipWidth;

  renderShip();
}

function updateIcebergs(dt) {
  const shipRect = getShipRect();

  for (let i = icebergs.length - 1; i >= 0; i--) {
    const iceberg = icebergs[i];
    iceberg.y += iceberg.speed * dt;
    iceberg.el.style.top = `${iceberg.y}px`;

    const icebergRect = {
      x: iceberg.x + 4,
      y: iceberg.y + 4,
      width: Math.max(20, iceberg.size - 8),
      height: Math.max(20, iceberg.size - 8),
    };

    if (overlaps(shipRect, icebergRect)) {
      endGame();
      return;
    }

    if (!iceberg.counted && iceberg.y > gameHeight) {
      iceberg.counted = true;
      dodged += 1;
      updateHUD();
    }

    if (iceberg.y > gameHeight + iceberg.size + 20) {
      iceberg.el.remove();
      icebergs.splice(i, 1);
    }
  }
}

function gameLoop(timestamp) {
  if (!running) return;

  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  let dt = (timestamp - lastFrameTime) / 1000;
  if (dt > 0.03) dt = 0.03;
  lastFrameTime = timestamp;

  distance += 95 * dt + (level - 1) * 22 * dt;

  if (distance > bestScore) {
    bestScore = distance;
    saveBestScore();
    renderBestScore();
  }

  const nextLevel = Math.floor(distance / 1000) + 1;
  if (nextLevel !== level) {
    level = nextLevel;
    restartSpawner();
  }

  moveShip(dt);
  updateIcebergs(dt);
  updateHUD();

  animationId = requestAnimationFrame(gameLoop);
}

function restartSpawner() {
  clearInterval(spawnTimer);

  const spawnMs = Math.max(320, 900 - (level - 1) * 70);

  spawnTimer = setInterval(() => {
    createIceberg();
  }, spawnMs);
}

function startGame() {
  clearIcebergs();
  setupSizes();

  distance = 0;
  dodged = 0;
  level = 1;
  running = true;
  lastFrameTime = 0;

  updateHUD();
  renderBestScore();

  startScreen.classList.remove("show");
  gameOverScreen.classList.remove("show");

  restartSpawner();

  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  running = false;
  clearInterval(spawnTimer);
  cancelAnimationFrame(animationId);

  finalDistanceEl.textContent = Math.floor(distance);
  finalDodgedEl.textContent = dodged;
  renderBestScore();

  gameOverScreen.classList.add("show");
}

function moveButtonLeft() {
  if (!running) return;
  shipX -= 35;
  if (shipX < 0) shipX = 0;
  renderShip();
}

function moveButtonRight() {
  if (!running) return;
  shipX += 35;
  if (shipX > gameWidth - shipWidth) shipX = gameWidth - shipWidth;
  renderShip();
}

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (key === "arrowleft" || key === "a") {
    keyboard.left = true;
  }

  if (key === "arrowright" || key === "d") {
    keyboard.right = true;
  }
});

document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();

  if (key === "arrowleft" || key === "a") {
    keyboard.left = false;
  }

  if (key === "arrowright" || key === "d") {
    keyboard.right = false;
  }
});

game.addEventListener("touchstart", (e) => {
  if (!running) return;
  touchActive = true;
  lastTouchX = e.touches[0].clientX;
}, { passive: true });

game.addEventListener("touchmove", (e) => {
  if (!running || !touchActive) return;

  const currentX = e.touches[0].clientX;
  const diff = currentX - lastTouchX;

  shipX += diff;

  if (shipX < 0) shipX = 0;
  if (shipX > gameWidth - shipWidth) shipX = gameWidth - shipWidth;

  renderShip();
  lastTouchX = currentX;
}, { passive: true });

game.addEventListener("touchend", () => {
  touchActive = false;
});

leftBtn.addEventListener("click", moveButtonLeft);
rightBtn.addEventListener("click", moveButtonRight);
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

window.addEventListener("resize", setupSizes);

loadBestScore();
setupSizes();
updateHUD();
