const game = document.getElementById("game");
const ship = document.getElementById("ship");

const distanceEl = document.getElementById("distance");
const dodgedEl = document.getElementById("dodged");
const levelEl = document.getElementById("level");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const finalDistance = document.getElementById("finalDistance");
const finalDodged = document.getElementById("finalDodged");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

let shipX = 0;
let shipWidth = 54;
let gameWidth = 0;
let gameHeight = 0;

let distance = 0;
let dodged = 0;
let level = 1;

let running = false;
let animationId = null;
let spawnInterval = null;

const icebergs = [];
const keys = {
  left: false,
  right: false,
};

function setupGameSize() {
  const rect = game.getBoundingClientRect();
  gameWidth = rect.width;
  gameHeight = rect.height;
  shipWidth = ship.getBoundingClientRect().width || 54;
  shipX = (gameWidth / 2) - (shipWidth / 2);
  ship.style.left = `${shipX}px`;
  ship.style.transform = `translateX(0)`;
}

function updateHUD() {
  distanceEl.textContent = `${Math.floor(distance)} m`;
  dodgedEl.textContent = dodged;
  levelEl.textContent = level;
}

function createIceberg() {
  const iceberg = document.createElement("div");
  iceberg.className = "iceberg";
  iceberg.textContent = "🧊";

  const size = 30 + Math.random() * 22;
  const x = Math.random() * (gameWidth - size);
  const speed = 2 + Math.random() * 1.8 + (level - 1) * 0.5;

  iceberg.style.left = `${x}px`;
  iceberg.style.top = `-40px`;
  iceberg.style.fontSize = `${size}px`;

  game.appendChild(iceberg);

  icebergs.push({
    el: iceberg,
    x,
    y: -40,
    size,
    speed,
    counted: false,
  });
}

function moveShip() {
  const shipSpeed = 7;

  if (keys.left) {
    shipX -= shipSpeed;
  }

  if (keys.right) {
    shipX += shipSpeed;
  }

  if (shipX < 0) shipX = 0;
  if (shipX > gameWidth - shipWidth) shipX = gameWidth - shipWidth;

  ship.style.left = `${shipX}px`;
}

function getShipRect() {
  return {
    x: shipX,
    y: gameHeight - 24 - 54,
    width: shipWidth,
    height: 54,
  };
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function updateIcebergs() {
  const shipRect = getShipRect();

  for (let i = icebergs.length - 1; i >= 0; i--) {
    const iceberg = icebergs[i];
    iceberg.y += iceberg.speed;
    iceberg.el.style.top = `${iceberg.y}px`;

    const icebergRect = {
      x: iceberg.x,
      y: iceberg.y,
      width: iceberg.size * 0.8,
      height: iceberg.size * 0.8,
    };

    if (isColliding(shipRect, icebergRect)) {
      endGame();
      return;
    }

    if (iceberg.y > gameHeight && !iceberg.counted) {
      dodged++;
      iceberg.counted = true;
      updateHUD();
    }

    if (iceberg.y > gameHeight + 60) {
      iceberg.el.remove();
      icebergs.splice(i, 1);
    }
  }
}

function gameLoop() {
  if (!running) return;

  distance += 2.4 + (level - 1) * 0.35;

  const newLevel = Math.floor(distance / 1000) + 1;
  if (newLevel !== level) {
    level = newLevel;
  }

  moveShip();
  updateIcebergs();
  updateHUD();

  animationId = requestAnimationFrame(gameLoop);
}

function clearIcebergs() {
  for (const iceberg of icebergs) {
    iceberg.el.remove();
  }
  icebergs.length = 0;
}

function startGame() {
  clearIcebergs();
  setupGameSize();

  distance = 0;
  dodged = 0;
  level = 1;

  updateHUD();

  startScreen.classList.remove("show");
  gameOverScreen.classList.remove("show");

  running = true;

  clearInterval(spawnInterval);
  spawnInterval = setInterval(() => {
    if (running) createIceberg();
  }, 900);

  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  running = false;
  clearInterval(spawnInterval);
  cancelAnimationFrame(animationId);

  finalDistance.textContent = `Distancia: ${Math.floor(distance)} m`;
  finalDodged.textContent = `Icebergs esquivados: ${dodged}`;
  gameOverScreen.classList.add("show");
}

function moveLeftButton() {
  shipX -= 25;
  if (shipX < 0) shipX = 0;
  ship.style.left = `${shipX}px`;
}

function moveRightButton() {
  shipX += 25;
  if (shipX > gameWidth - shipWidth) shipX = gameWidth - shipWidth;
  ship.style.left = `${shipX}px`;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    keys.left = true;
  }

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    keys.right = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    keys.left = false;
  }

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    keys.right = false;
  }
});

leftBtn.addEventListener("click", moveLeftButton);
rightBtn.addEventListener("click", moveRightButton);
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

window.addEventListener("resize", setupGameSize);

setupGameSize();
updateHUD();
    