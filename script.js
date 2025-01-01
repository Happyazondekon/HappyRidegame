// Sélectionner les éléments audio
const backgroundMusic = document.querySelector('#background-music');
const collisionSound = document.querySelector('#collision-sound');

document.addEventListener('keydown', handleMovement);
document.querySelector('#pause-btn').addEventListener('click', togglePause);
document.querySelector('#new-game-btn').addEventListener('click', restartGame);
document.querySelector('#restart-btn').addEventListener('click', restartGame);
document.querySelector('#start-btn').addEventListener('click', startGame);

const playerCar = document.querySelector('.player-car');
const enemyCar = document.querySelector('.enemy-car');
const currentScoreDisplay = document.querySelector('#current-score');
const gameOverPopup = document.querySelector('#game-over-popup');
const restartBtn = document.querySelector('#restart-btn');
const startScreen = document.querySelector('#start-screen');
const gameContainer = document.querySelector('#game-container');

let playerX = 130;
let playerY = 400;
let score = 0;
let gameOver = false;
let paused = false;

function startGame() {
  startScreen.style.display = 'none';
  gameContainer.style.display = 'block';

  // Lancer la musique de fond
  backgroundMusic.play();

  moveEnemyCar();
}

function handleMovement(event) {
  if (gameOver || paused) return;

  const speed = 20;  // Augmenter cette valeur pour un déplacement plus rapide
  
  if (event.key === 'ArrowLeft' && playerX > 10) playerX -= speed;
  if (event.key === 'ArrowRight' && playerX < 250) playerX += speed;
  if (event.key === 'ArrowUp' && playerY > 0) playerY -= speed;
  if (event.key === 'ArrowDown' && playerY < 430) playerY += speed;

  playerCar.style.left = playerX + 'px';
  playerCar.style.top = playerY + 'px';
}

function moveEnemyCar() {
  if (gameOver || paused) return;

  let enemyY = enemyCar.offsetTop;
  if (enemyY > 500) {
    enemyY = -100;
    enemyCar.style.left = Math.random() * 260 + 'px';
    updateScore();
  } else {
    enemyY += 5;
  }
  enemyCar.style.top = enemyY + 'px';

  checkCollision();
  requestAnimationFrame(moveEnemyCar);
}

function updateScore() {
  score++;
  currentScoreDisplay.textContent = `Score : ${score}`;
}

function checkCollision() {
  const playerRect = playerCar.getBoundingClientRect();
  const enemyRect = enemyCar.getBoundingClientRect();

  if (
    playerRect.left < enemyRect.right &&
    playerRect.right > enemyRect.left &&
    playerRect.top < enemyRect.bottom &&
    playerRect.bottom > enemyRect.top
  ) {
    // Jouer le son de collision
    collisionSound.play();
    endGame();
  }
}

function endGame() {
  gameOver = true;
  gameOverPopup.style.display = 'block';
  document.querySelector('#final-score').textContent = score;

  // Arrêter la musique de fond
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0; // Recommencer la musique à zéro pour la prochaine partie
}

function restartGame() {
  playerX = 130;
  playerY = 400;
  score = 0;
  gameOver = false;
  paused = false;

  playerCar.style.left = playerX + 'px';
  playerCar.style.top = playerY + 'px';
  enemyCar.style.top = '-100px';
  enemyCar.style.left = '150px';

  currentScoreDisplay.textContent = `Score : ${score}`;
  gameOverPopup.style.display = 'none';

  moveEnemyCar();

  // Redémarrer la musique de fond
  backgroundMusic.play();
}

function togglePause() {
  paused = !paused;
  document.querySelector('#pause-btn').textContent = paused ? 'Reprendre' : 'Pause';

  if (!paused) moveEnemyCar();
}
