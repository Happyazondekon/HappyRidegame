// Enhanced game variables
const backgroundMusic = document.getElementById('background-music');
const collisionSound = document.getElementById('collision-sound');
const powerUpSound = document.getElementById('power-up-sound');
const comboSound = document.getElementById('combo-sound');
const playerCar = document.querySelector('.player-car');
const currentScoreDisplay = document.getElementById('current-score');
const comboCounter = document.getElementById('combo-counter');
const gameOverPopup = document.getElementById('game-over-popup');
const restartBtn = document.getElementById('restart-btn');
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const roadElement = document.getElementById('road');
const highScoreDisplay = document.getElementById('high-score');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const soundToggle = document.getElementById('sound-toggle');
const musicToggle = document.getElementById('music-toggle');
const difficultySelect = document.getElementById('difficulty');

// Game state variables
let playerX = 150;
let playerY = 400;
let score = 0;
let combo = 0;
let gameOver = false;
let paused = false;
let gameSpeed = 5;
let level = 1;
let lives = 3;
let powerUps = [];
let enemies = [];
let isInvincible = false;
let isSlowMotion = false;
let animationFrameId = null;
let roadYOffset = 0;
let powerUpInterval;
let powerUpEndTime = 0;
let highScore = localStorage.getItem('happyRideHighScore') || 0;
let lastDodgeTime = 0;
let dodgeStreak = 0;

// Initialize game
function initGame() {
  highScoreDisplay.textContent = highScore;
  
  // Set up event listeners
  document.addEventListener('keydown', handleKeyboardMovement);
  document.getElementById('pause-btn').addEventListener('click', togglePause);
  document.getElementById('new-game-btn').addEventListener('click', restartGame);
  restartBtn.addEventListener('click', restartGame);
  document.getElementById('start-btn').addEventListener('click', startGame);
  settingsBtn.addEventListener('click', toggleSettings);
  
  // Touch controls
  document.addEventListener('touchstart', handleTouchStart);
  document.addEventListener('touchmove', handleTouchMove);
  
  // Settings controls
  soundToggle.addEventListener('change', toggleSound);
  musicToggle.addEventListener('change', toggleMusic);
  difficultySelect.addEventListener('change', updateDifficulty);
  
  createGameElements();
}

// Create game elements
function createGameElements() {
  createCustomRoad();
  createPlayerCar();
  createMobileControls();
  createEnemyCar();
}

// Start game
function startGame() {
  startScreen.style.display = 'none';
  gameContainer.style.display = 'block';
  resetGameState();
  
  // Play music if enabled
  if (musicToggle.checked) {
    backgroundMusic.volume = 0.3;
    backgroundMusic.play().catch(e => console.log('Audio play prevented:', e));
  }
  
  gameLoop();
  powerUpInterval = setInterval(spawnPowerUp, 15000);
}

// Game loop
function gameLoop() {
  if (gameOver || paused) return;
  
  animateRoad();
  moveEnemies();
  movePowerUps();
  checkCollisions();
  updatePowerUpTimer();
  
  // Increase difficulty
  if (score > 0 && score % 15 === 0 && score / 15 > level - 1) {
    increaseLevel();
  }
  
  animationFrameId = requestAnimationFrame(gameLoop);
}

// Enhanced player car creation
function createPlayerCar() {
  playerCar.innerHTML = '';
  
  const carSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  carSvg.setAttribute('width', '60');
  carSvg.setAttribute('height', '100');
  carSvg.setAttribute('viewBox', '0 0 60 100');
  
  // Car body
  const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  body.setAttribute('d', 'M10,80 L10,30 C10,20 20,10 30,10 C40,10 50,20 50,30 L50,80 Z');
  body.setAttribute('fill', '#0066cc');
  body.setAttribute('stroke', '#003366');
  body.setAttribute('stroke-width', '2');
  carSvg.appendChild(body);
  
  // Windows
  const windshield = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  windshield.setAttribute('d', 'M20,30 C20,25 25,20 30,20 C35,20 40,25 40,30 L40,40 L20,40 Z');
  windshield.setAttribute('fill', '#99ccff');
  carSvg.appendChild(windshield);
  
  const rearWindow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rearWindow.setAttribute('x', '25');
  rearWindow.setAttribute('y', '45');
  rearWindow.setAttribute('width', '10');
  rearWindow.setAttribute('height', '15');
  rearWindow.setAttribute('fill', '#99ccff');
  carSvg.appendChild(rearWindow);
  
  // Lights
  const headlights = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  
  const leftHeadlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  leftHeadlight.setAttribute('cx', '15');
  leftHeadlight.setAttribute('cy', '20');
  leftHeadlight.setAttribute('r', '5');
  leftHeadlight.setAttribute('fill', 'yellow');
  headlights.appendChild(leftHeadlight);
  
  const rightHeadlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  rightHeadlight.setAttribute('cx', '45');
  rightHeadlight.setAttribute('cy', '20');
  rightHeadlight.setAttribute('r', '5');
  rightHeadlight.setAttribute('fill', 'yellow');
  headlights.appendChild(rightHeadlight);
  
  carSvg.appendChild(headlights);
  
  // Taillights
  const leftTaillight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  leftTaillight.setAttribute('cx', '15');
  leftTaillight.setAttribute('cy', '80');
  leftTaillight.setAttribute('r', '5');
  leftTaillight.setAttribute('fill', 'red');
  carSvg.appendChild(leftTaillight);
  
  const rightTaillight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  rightTaillight.setAttribute('cx', '45');
  rightTaillight.setAttribute('cy', '80');
  rightTaillight.setAttribute('r', '5');
  rightTaillight.setAttribute('fill', 'red');
  carSvg.appendChild(rightTaillight);
  
  // Wheels with rims
  const wheels = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  
  const wheelPositions = [
    {x: 5, y: 30},
    {x: 45, y: 30},
    {x: 5, y: 70},
    {x: 45, y: 70}
  ];
  
  wheelPositions.forEach(pos => {
    const wheel = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    wheel.setAttribute('x', pos.x);
    wheel.setAttribute('y', pos.y);
    wheel.setAttribute('width', '10');
    wheel.setAttribute('height', '20');
    wheel.setAttribute('fill', '#333');
    wheel.setAttribute('rx', '2');
    wheels.appendChild(wheel);
    
    const rim = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rim.setAttribute('x', pos.x + 2);
    rim.setAttribute('y', pos.y + 5);
    rim.setAttribute('width', '6');
    rim.setAttribute('height', '10');
    rim.setAttribute('fill', '#666');
    wheels.appendChild(rim);
  });
  
  carSvg.appendChild(wheels);
  
  // Racing stripe
  const stripe = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  stripe.setAttribute('d', 'M20,25 L40,25 L35,75 L25,75 Z');
  stripe.setAttribute('fill', 'white');
  stripe.setAttribute('opacity', '0.3');
  carSvg.appendChild(stripe);
  
  playerCar.appendChild(carSvg);
  updatePlayerPosition();
}

// Enhanced enemy car creation
function createEnemyCar() {
  const enemy = document.createElement('div');
  enemy.className = 'enemy-car';
  
  const carSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  carSvg.setAttribute('width', '60');
  carSvg.setAttribute('height', '100');
  carSvg.setAttribute('viewBox', '0 0 60 100');
  
  // Random car type (0-2)
  const carType = Math.floor(Math.random() * 3);
  
  // Common car parts
  const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const windshield = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const wheels = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  
  // Different car designs
  if (carType === 0) { // Sports car
    body.setAttribute('d', 'M10,85 L10,25 C10,15 25,5 30,5 C35,5 50,15 50,25 L50,85 Z');
    body.setAttribute('fill', '#cc0000');
    windshield.setAttribute('d', 'M20,25 C20,20 25,15 30,15 C35,15 40,20 40,25 L40,35 L20,35 Z');
  } 
  else if (carType === 1) { // SUV
    body.setAttribute('d', 'M10,90 L10,20 C10,10 20,5 30,5 C40,5 50,10 50,20 L50,90 Z');
    body.setAttribute('fill', '#339900');
    windshield.setAttribute('d', 'M15,20 L45,20 L40,35 L20,35 Z');
  }
  else { // Truck
    body.setAttribute('d', 'M5,90 L5,40 L15,30 L45,30 L55,40 L55,90 Z');
    body.setAttribute('fill', '#9900cc');
    windshield.setAttribute('d', 'M20,30 L40,30 L40,40 L20,40 Z');
  }
  
  body.setAttribute('stroke', '#333');
  body.setAttribute('stroke-width', '2');
  carSvg.appendChild(body);
  
  windshield.setAttribute('fill', '#333');
  carSvg.appendChild(windshield);
  
  // Taillights
  const leftTaillight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  leftTaillight.setAttribute('cx', '15');
  leftTaillight.setAttribute('cy', '85');
  leftTaillight.setAttribute('r', '4');
  leftTaillight.setAttribute('fill', 'red');
  carSvg.appendChild(leftTaillight);
  
  const rightTaillight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  rightTaillight.setAttribute('cx', '45');
  rightTaillight.setAttribute('cy', '85');
  rightTaillight.setAttribute('r', '4');
  rightTaillight.setAttribute('fill', 'red');
  carSvg.appendChild(rightTaillight);
  
  // Wheels
  const wheelPositions = carType === 2 ? 
    [{x: 5, y: 35}, {x: 45, y: 35}, {x: 5, y: 80}, {x: 45, y: 80}] :
    [{x: 5, y: 30}, {x: 45, y: 30}, {x: 5, y: 70}, {x: 45, y: 70}];
  
  wheelPositions.forEach(pos => {
    const wheel = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    wheel.setAttribute('x', pos.x);
    wheel.setAttribute('y', pos.y);
    wheel.setAttribute('width', '10');
    wheel.setAttribute('height', '20');
    wheel.setAttribute('fill', '#333');
    wheels.appendChild(wheel);
  });
  
  carSvg.appendChild(wheels);
  
  enemy.appendChild(carSvg);
  enemy.style.top = '-100px';
  enemy.style.left = getRandomRoadPosition() + 'px';
  
  roadElement.appendChild(enemy);
  enemies.push(enemy);
}

// Power-up system
function spawnPowerUp() {
  if (gameOver || paused || powerUps.length >= 2) return;
  
  const powerUp = document.createElement('div');
  const powerUpType = Math.floor(Math.random() * 3); // 0-2
  
  powerUp.className = 'power-up';
  
  switch(powerUpType) {
    case 0: // Invincibility
      powerUp.classList.add('invincibility');
      powerUp.innerHTML = '🛡️';
      break;
    case 1: // Slow motion
      powerUp.classList.add('slow-motion');
      powerUp.innerHTML = '⏱️';
      break;
    case 2: // Extra life
      powerUp.classList.add('extra-life');
      powerUp.innerHTML = '❤️';
      break;
  }
  
  powerUp.dataset.type = powerUpType;
  powerUp.style.top = '-50px';
  powerUp.style.left = getRandomRoadPosition() + 'px';
  
  roadElement.appendChild(powerUp);
  powerUps.push(powerUp);
}

function collectPowerUp(powerUp) {
  const powerUpType = parseInt(powerUp.dataset.type);
  
  if (soundToggle.checked) {
    powerUpSound.currentTime = 0;
    powerUpSound.play().catch(e => console.log('Audio play prevented:', e));
  }
  
  switch(powerUpType) {
    case 0: // Invincibility
      activateInvincibility();
      break;
    case 1: // Slow motion
      activateSlowMotion();
      break;
    case 2: // Extra life
      addExtraLife();
      break;
  }
  
  const index = powerUps.indexOf(powerUp);
  if (index > -1) {
    powerUp.remove();
    powerUps.splice(index, 1);
  }
}

function activateInvincibility() {
  isInvincible = true;
  playerCar.classList.add('invincible');
  powerUpEndTime = Date.now() + 8000; // 8 seconds
  
  // Show timer
  const timer = document.getElementById('power-up-timer');
  timer.style.display = 'block';
  timer.style.animation = 'timerProgress 8s linear';
  
  setTimeout(() => {
    isInvincible = false;
    playerCar.classList.remove('invincible');
    timer.style.display = 'none';
  }, 8000);
}

function activateSlowMotion() {
  isSlowMotion = true;
  const originalSpeed = gameSpeed;
  gameSpeed = Math.max(3, gameSpeed - 3);
  powerUpEndTime = Date.now() + 5000; // 5 seconds
  
  // Show timer
  const timer = document.getElementById('power-up-timer');
  timer.style.display = 'block';
  timer.style.animation = 'timerProgress 5s linear';
  
  setTimeout(() => {
    isSlowMotion = false;
    gameSpeed = originalSpeed;
    timer.style.display = 'none';
  }, 5000);
}

function addExtraLife() {
  lives = Math.min(5, lives + 1);
  updateLivesDisplay();
  
  // Show visual effect
  const effect = document.createElement('div');
  effect.className = 'combo-effect';
  gameContainer.appendChild(effect);
  setTimeout(() => effect.remove(), 500);
}

function updatePowerUpTimer() {
  const timer = document.getElementById('power-up-timer');
  if (!timer.style.display || timer.style.display === 'none') return;
  
  const remaining = powerUpEndTime - Date.now();
  if (remaining <= 0) {
    timer.style.display = 'none';
  }
}

// Combo system
// Modifier la fonction updateCombo() comme ceci :
function updateCombo() {
  const now = Date.now();
  
  if (now - lastDodgeTime < 1000) { // Si dodge dans la dernière seconde
    dodgeStreak++;
    
    // Seulement afficher le combo à partir de x3
    if (dodgeStreak >= 3) {
      combo = dodgeStreak - 2; // Combo x1 à partir de 3 dodges
      comboCounter.textContent = `Combo: ${combo}x`;
      comboCounter.style.display = 'block';
      
      // Bonus sonore et visuel pour les gros combos
      if (combo >= 3 && soundToggle.checked) {
        comboSound.currentTime = 0;
        comboSound.play();
      }
      
      // Bonus de points proportionnel au combo
      addScore(combo); 
    }
  } else {
    dodgeStreak = 0;
    combo = 0;
    comboCounter.style.display = 'none';
  }
  
  lastDodgeTime = now;
}

// Game mechanics
function animateRoad() {
  roadYOffset += gameSpeed;
  if (roadYOffset >= 600) roadYOffset = 0;
  
  document.getElementById('bg-layer-1').style.transform = `translateY(${roadYOffset}px)`;
  document.getElementById('bg-layer-2').style.transform = `translateY(${roadYOffset * 0.5}px)`;
}

function moveEnemies() {
  const now = Date.now();
  const spawnInterval = Math.max(500, 2000 - (level * 100)); // Faster spawning as level increases
  
  // Spawn new enemies
  if (now - (enemies[enemies.length - 1]?.lastSpawnTime || 0) > spawnInterval) {
    createEnemyCar();
    enemies[enemies.length - 1].lastSpawnTime = now;
  }
  
  // Move existing enemies
  enemies.forEach((enemy, index) => {
    const currentTop = parseInt(enemy.style.top);
    const newTop = currentTop + gameSpeed;
    
    enemy.style.top = newTop + 'px';
    
    // Remove enemies that are off screen
    if (newTop > 600) {
      enemy.remove();
      enemies.splice(index, 1);
      addScore(1); // +1 point par voiture évitée
      updateCombo(); // Comptabilise le dodge pour le combo
    }
  });
}

function movePowerUps() {
  powerUps.forEach((powerUp, index) => {
    const currentTop = parseInt(powerUp.style.top);
    const newTop = currentTop + gameSpeed;
    
    powerUp.style.top = newTop + 'px';
    
    // Remove power-ups that are off screen
    if (newTop > 600) {
      powerUp.remove();
      powerUps.splice(index, 1);
    }
  });
}

function checkCollisions() {
  // Player bounding box
  const playerRect = {
    x: playerX,
    y: playerY,
    width: 60,
    height: 100
  };
  
  // Check enemy collisions
  enemies.forEach((enemy, index) => {
    const enemyRect = {
      x: parseInt(enemy.style.left),
      y: parseInt(enemy.style.top),
      width: 60,
      height: 100
    };
    
    if (checkCollision(playerRect, enemyRect)) {
      handleCollision(enemy, index);
    }
  });
  
  // Check power-up collisions
  powerUps.forEach((powerUp, index) => {
    const powerUpRect = {
      x: parseInt(powerUp.style.left),
      y: parseInt(powerUp.style.top),
      width: 40,
      height: 40
    };
    
    if (checkCollision(playerRect, powerUpRect)) {
      collectPowerUp(powerUp);
    }
  });
}

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function handleCollision(enemy, index) {
  if (isInvincible) {
    // Destroy enemy without penalty
    enemy.remove();
    enemies.splice(index, 1);
    addScore(2);
    return;
  }
  
  if (soundToggle.checked) {
    collisionSound.currentTime = 0;
    collisionSound.play().catch(e => console.log('Audio play prevented:', e));
  }
  
  // Visual feedback
  playerCar.classList.add('collision-animation');
  setTimeout(() => playerCar.classList.remove('collision-animation'), 300);
  
  // Remove enemy
  enemy.remove();
  enemies.splice(index, 1);
  
  // Lose life
  lives--;
  updateLivesDisplay();
  
  // Reset combo
  combo = 0;
  comboCounter.style.display = 'none';
  dodgeStreak = 0;
  
  // Check game over
  if (lives <= 0) {
    endGame();
  }
}

// Scoring system
function addScore(points) {
  score += points;
  currentScoreDisplay.textContent = `Score : ${score}`;
  
  // Update high score if needed
  if (score > highScore) {
    highScore = score;
    highScoreDisplay.textContent = highScore;
    localStorage.setItem('happyRideHighScore', highScore);
  }
}

function increaseLevel() {
  level++;
  document.getElementById('level-indicator').textContent = `Niveau: ${level}`;
  gameSpeed = Math.min(15, gameSpeed + 0.5); // Cap at 15
  
  // Visual effect
  const effect = document.createElement('div');
  effect.className = 'combo-effect';
  effect.style.background = 'radial-gradient(circle at center, rgba(0,204,255,0.3), transparent 70%)';
  gameContainer.appendChild(effect);
  setTimeout(() => effect.remove(), 500);
}

function updateLivesDisplay() {
  const livesDisplay = document.getElementById('lives-display');
  livesDisplay.innerHTML = 'Vies: ' + '❤️'.repeat(lives);
}

// Game state management
function endGame() {
  gameOver = true;
  cancelAnimationFrame(animationFrameId);
  clearInterval(powerUpInterval);
  
  // Show game over popup
  document.getElementById('final-score').textContent = score;
  document.getElementById('final-level').textContent = level;
  
  const newHighScore = document.getElementById('new-high-score');
  if (score > parseInt(highScoreDisplay.textContent)) {
    newHighScore.style.display = 'inline';
  } else {
    newHighScore.style.display = 'none';
  }
  
  gameOverPopup.style.display = 'block';
}

function resetGameState() {
  // Clear all enemies and power-ups
  enemies.forEach(enemy => enemy.remove());
  powerUps.forEach(powerUp => powerUp.remove());
  enemies = [];
  powerUps = [];
  
  // Reset game variables
  score = 0;
  combo = 0;
  lives = 3;
  level = 1;
  gameSpeed = 5;
  gameOver = false;
  isInvincible = false;
  isSlowMotion = false;
  dodgeStreak = 0;
  
  // Reset displays
  currentScoreDisplay.textContent = `Score : 0`;
  comboCounter.style.display = 'none';
  document.getElementById('level-indicator').textContent = `Niveau: 1`;
  updateLivesDisplay();
  
  // Reset player position
  playerX = 150;
  updatePlayerPosition();
}

function restartGame() {
  gameOverPopup.style.display = 'none';
  resetGameState();
  gameLoop();
  powerUpInterval = setInterval(spawnPowerUp, 15000);
}

function togglePause() {
  paused = !paused;
  document.getElementById('pause-btn').textContent = paused ? 'Reprendre' : 'Pause';
  
  if (paused) {
    cancelAnimationFrame(animationFrameId);
    backgroundMusic.pause();
  } else {
    gameLoop();
    if (musicToggle.checked) backgroundMusic.play().catch(e => console.log('Audio play prevented:', e));
  }
}

// Input handling
function handleKeyboardMovement(e) {
  if (paused || gameOver) return;
  
  const moveAmount = 30;
  
  switch(e.key) {
    case 'ArrowLeft':
      playerX = Math.max(20, playerX - moveAmount);
      break;
    case 'ArrowRight':
      playerX = Math.min(320, playerX + moveAmount);
      break;
  }
  
  updatePlayerPosition();
}

let touchStartX = 0;

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e) {
  if (paused || gameOver) return;
  
  const touchX = e.touches[0].clientX;
  const diff = touchX - touchStartX;
  
  if (Math.abs(diff) > 10) { // Threshold to prevent accidental moves
    playerX = Math.max(20, Math.min(320, playerX + diff * 0.5));
    updatePlayerPosition();
    touchStartX = touchX;
  }
  
  e.preventDefault(); // Prevent scrolling
}

function createMobileControls() {
  const leftBtn = document.getElementById('left-btn');
  const rightBtn = document.getElementById('right-btn');
  
  leftBtn.addEventListener('touchstart', () => {
    playerX = Math.max(20, playerX - 30);
    updatePlayerPosition();
  });
  
  rightBtn.addEventListener('touchstart', () => {
    playerX = Math.min(320, playerX + 30);
    updatePlayerPosition();
  });
  
  // Prevent context menu on long press
  [leftBtn, rightBtn].forEach(btn => {
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });
}

function updatePlayerPosition() {
  playerCar.style.left = playerX + 'px';
}

// Utility functions
function getRandomRoadPosition() {
  return 20 + Math.floor(Math.random() * 5) * 60; // 20, 80, 140, 200, 260, 320
}

// Settings functions
function toggleSettings() {
  settingsPanel.style.display = settingsPanel.style.display === 'block' ? 'none' : 'block';
}

function toggleSound() {
  // No action needed - sound effects check this when playing
}

function toggleMusic() {
  if (musicToggle.checked) {
    backgroundMusic.play().catch(e => console.log('Audio play prevented:', e));
  } else {
    backgroundMusic.pause();
  }
}

function updateDifficulty() {
  const difficulty = difficultySelect.value;
  
  switch(difficulty) {
    case 'easy':
      gameSpeed = 4;
      break;
    case 'medium':
      gameSpeed = 5;
      break;
    case 'hard':
      gameSpeed = 6;
      break;
  }
  
  // If game is running, update immediately
  if (!gameOver && !paused) {
    cancelAnimationFrame(animationFrameId);
    gameLoop();
  }
}

// Custom road design
function createCustomRoad() {
  const road = document.getElementById('road');
  
  // Add road markings
  for (let i = 0; i < 12; i++) {
    const marking = document.createElement('div');
    marking.className = 'road-marking';
    marking.style.position = 'absolute';
    marking.style.width = '10px';
    marking.style.height = '50px';
    marking.style.backgroundColor = 'white';
    marking.style.left = '195px';
    marking.style.top = (i * 100) + 'px';
    road.appendChild(marking);
  }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);