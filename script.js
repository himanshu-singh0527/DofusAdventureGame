const configUrl = 'config.json';
let doofusSpeed;
let pulpitMinTime;
let pulpitMaxTime;

fetch(configUrl)
    .then(response => response.json())
    .then(data => {
        doofusSpeed = data.doofus_speed;
        pulpitMinTime = data.pulpit_min_time;
        pulpitMaxTime = data.pulpit_max_time;
        initGame();
    });

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScore = document.getElementById('final-score');

canvas.width = 800;
canvas.height = 600;

let doofus = { x: canvas.width / 2, y: canvas.height / 2, size: 50 };
let pulpits = [];
let score = 0;
let gameOver = false;
let lastPulpitTime = 0;
let pulpitSpawnInterval;

function initGame() {
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', restartGame);
    window.addEventListener('keydown', handleMovement);
}

function startGame() {
    startScreen.classList.add('hidden');
    pulpits.push(spawnPulpit());
    pulpitSpawnInterval = getRandomTime();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    gameOverScreen.classList.add('hidden');
    doofus = { x: canvas.width / 2, y: canvas.height / 2, size: 50 };
    pulpits = [];
    score = 0;
    gameOver = false;
    pulpits.push(spawnPulpit());
    pulpitSpawnInterval = getRandomTime();
    scoreElement.textContent = `Score: ${score}`;
    requestAnimationFrame(gameLoop);
}

function handleMovement(event) {
    if (gameOver) return;

    switch (event.key) {
        case 'ArrowLeft':
        case 'a':
            doofus.x -= doofusSpeed;
            break;
        case 'ArrowRight':
        case 'd':
            doofus.x += doofusSpeed;
            break;
        case 'ArrowUp':
        case 'w':
            doofus.y -= doofusSpeed;
            break;
        case 'ArrowDown':
        case 's':
            doofus.y += doofusSpeed;
            break;
    }
}

function gameLoop(timestamp) {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pulpits.forEach(pulpit => {
        ctx.fillStyle = 'green';
        ctx.fillRect(pulpit.x, pulpit.y, pulpit.size, pulpit.size);
    });

    ctx.fillStyle = 'red';
    ctx.fillRect(doofus.x, doofus.y, doofus.size, doofus.size);

    if (!isOnPulpit()) {
        endGame();
        return;
    }

    if (timestamp - lastPulpitTime > pulpitSpawnInterval) {
        if (pulpits.length < 2) {
            pulpits.push(spawnPulpit());
        }
        lastPulpitTime = timestamp;
        pulpitSpawnInterval = getRandomTime();
    }

    removeExpiredPulpits();

    score++;
    scoreElement.textContent = `Score: ${score}`;
    requestAnimationFrame(gameLoop);
}

function spawnPulpit() {
    const x = getRandomPosition(0, canvas.width - 90);
    const y = getRandomPosition(0, canvas.height - 90);
    return { x: x, y: y, size: 90, timer: getRandomTime() };
}

function getRandomPosition(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomTime() {
    return Math.floor(Math.random() * (pulpitMaxTime - pulpitMinTime + 1)) + pulpitMinTime;
}

function isOnPulpit() {
    return pulpits.some(pulpit =>
        doofus.x + doofus.size > pulpit.x &&
        doofus.x < pulpit.x + pulpit.size &&
        doofus.y + doofus.size > pulpit.y &&
        doofus.y < pulpit.y + pulpit.size
    );
}

function removeExpiredPulpits() {
    pulpits = pulpits.filter(pulpit => {
        pulpit.timer -= 1;
        return pulpit.timer > 0;
    });
}

function endGame() {
    gameOver = true;
    finalScore.textContent = `Final Score: ${score}`;
    gameOverScreen.classList.remove('hidden');
}
