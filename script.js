// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;
const gameSpeed = 5;

let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Paddle objects
const player = {
    x: 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const computer = {
    x: canvas.width - paddleWidth - 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4.5
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: gameSpeed,
    dy: gameSpeed,
    radius: ballSize
};

// Mouse position for player control
let mouseY = canvas.height / 2;

// Keyboard keys state
const keys = {};

// Event listeners
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Draw rectangle
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Draw circle (ball)
function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Draw center line
function drawCenterLine() {
    ctx.strokeStyle = '#00ff00';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Update player position (mouse or arrow keys)
function updatePlayer() {
    // Arrow keys control
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y += player.speed;
    }
    
    // Mouse control
    const mouseTarget = mouseY - player.height / 2;
    const distance = mouseTarget - player.y;
    if (Math.abs(distance) > 5) {
        player.y += distance * 0.1;
    }
    
    // Keep player paddle within bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// Update computer AI
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    
    if (computerCenter < ballCenter - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= computer.speed;
    }
    
    // Keep computer paddle within bounds
    if (computer.y < 0) computer.y = 0;
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }
    
    // Ball collision with paddles
    // Player paddle collision
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - player.y) / player.height - 0.5;
        ball.dy += hitPos * 4;
    }
    
    // Computer paddle collision
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - computer.y) / computer.height - 0.5;
        ball.dy += hitPos * 4;
    }
    
    // Ball out of bounds (scoring)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }
    
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

// Reset ball position
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = gameSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = gameSpeed * (Math.random() > 0.5 ? 1 : -1);
}

// Draw game
function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');
    
    // Draw center line
    drawCenterLine();
    
    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#00d4ff');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#ff00ff');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#00ff00');
}

// Main game loop
function gameLoop() {
    if (gameRunning) {
        updatePlayer();
        updateComputer();
        updateBall();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
