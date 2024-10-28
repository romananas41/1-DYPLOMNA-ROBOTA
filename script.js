const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
canvas.width = 300;
canvas.height = 600;
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = canvas.width / COLS;
let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let activePiece;
let gameInterval;
let isPaused = false;
let level = 1;
let isGameStarted = false;
let score = 0;
let dropCounter = 0;
let dropInterval = 1000;

// Кнопки
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const levelSelector = document.getElementById('levelSelector');
const levelSelect = document.getElementById('levelSelect');

// Фігури Тетріс (міні-поліміно)
const pieces = [
    { shape: [[1, 1, 1, 1]], color: '#00F0F0' }, // I
    { shape: [[1, 1, 1], [0, 1, 0]], color: '#F0F000' }, // T
    { shape: [[1, 1], [1, 1]], color: '#00F000' }, // O
    { shape: [[1, 1, 0], [0, 1, 1]], color: '#F00000' }, // Z
    { shape: [[0, 1, 1], [1, 1, 0]], color: '#0000F0' }, // S
    { shape: [[1, 1, 1], [1, 0, 0]], color: '#F0A000' }, // L
    { shape: [[1, 1, 1], [0, 0, 1]], color: '#800080' }, // J
];

// Функція для створення нової фігури
function createPiece() {
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    return {
        shape: piece.shape,
        color: piece.color,
        x: Math.floor(COLS / 2) - Math.ceil(piece.shape[0].length / 2),
        y: 0,
    };
}

// Малювання блоку
function drawBlock(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = '#141E30';
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Малювання сітки
function drawGrid() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Малюємо сітку
    context.strokeStyle = '#ccc'; // Колір ліній сітки
    for (let row = 0; row < ROWS; row++) {
        context.beginPath();
        context.moveTo(0, row * BLOCK_SIZE);
        context.lineTo(canvas.width, row * BLOCK_SIZE);
        context.stroke();
    }
    
    for (let col = 0; col < COLS; col++) {
        context.beginPath();
        context.moveTo(col * BLOCK_SIZE, 0);
        context.lineTo(col * BLOCK_SIZE, canvas.height);
        context.stroke();
    }
    
    // Малюємо зайняті блоки
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (grid[row][col] !== 0) {
                drawBlock(col, row, grid[row][col]);
            }
        }
    }
}

// Переміщення фігури вниз
function moveDown() {
    if (!collide(0, 1)) {
        activePiece.y++;
    } else {
        placePiece();
        activePiece = createPiece();
        if (collide(0, 0)) {
            endGame(); // Закінчення гри
        }
    }
}

// Встановлення фігури на сітку
function placePiece() {
    activePiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                grid[activePiece.y + y][activePiece.x + x] = activePiece.color;
            }
        });
    });
    clearLines();
}

// Перевірка зіткнення
function collide(offsetX, offsetY) {
    for (let y = 0; y < activePiece.shape.length; y++) {
        for (let x = 0; x < activePiece.shape[y].length; x++) {
            if (activePiece.shape[y][x] !== 0) {
                let newY = activePiece.y + y + offsetY;
                let newX = activePiece.x + x + offsetX;
                if (newX < 0 || newX >= COLS || newY >= ROWS || grid[newY][newX] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Очищення ліній
function clearLines() {
    outer: for (let row = ROWS - 1; row >= 0; row--) {
        for (let col = 0; col < COLS; col++) {
            if (grid[row][col] === 0) {
                continue outer;
            }
        }
        grid.splice(row, 1);
        grid.unshift(Array(COLS).fill(0));
        score += 100; // Оновлення рахунку
        dropInterval *= 0.9; // Підвищення складності
    }
}

// Малювання фігури
function drawPiece() {
    activePiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(activePiece.x + x, activePiece.y + y, activePiece.color);
            }
        });
    });
}

// Функція для завершення гри
function endGame() {
    clearInterval(gameInterval);
    alert('Гра завершена!');
    isGameStarted = false;
    levelSelector.style.display = 'block';
    startBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
}

// Оновлення гри
function gameLoop(deltaTime) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawPiece();
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        moveDown();
        dropCounter = 0;
    }
}

// Функція для запуску гри
function startGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    level = parseInt(levelSelect.value);
    activePiece = createPiece();
    dropInterval = 1000 / level;
    dropCounter = 0;
    gameInterval = setInterval(() => gameLoop(16), 16);
    
    // Залишаємо кнопку "Старт" видимою, але можна її заблокувати
    startBtn.disabled = true; // Робимо кнопку неактивною після старту
    pauseBtn.style.display = 'inline-block'; // Показуємо кнопку "Пауза"
    levelSelector.style.display = 'none'; // Приховуємо вибір рівня
    
    pauseBtn.textContent = 'Пауза';
    isPaused = false;
    isGameStarted = true;
    drawGrid(); // Малюємо сітку одразу при старті гри
}

// Функція для паузи або відновлення гри
function togglePause() {
    if (isPaused) {
        gameInterval = setInterval(() => gameLoop(16), 16);
        pauseBtn.textContent = 'Пауза';
    } else {
        clearInterval(gameInterval);
        pauseBtn.textContent = 'Відновити';
    }
    isPaused = !isPaused;
}

// Переміщення фігури вліво, вправо або обертання
function movePiece(direction) {
    if (direction === 'left') {
        if (!collide(-1, 0)) {
            activePiece.x--;
        }
    } else if (direction === 'right') {
        if (!collide(1, 0)) {
            activePiece.x++;
        }
    } else if (direction === 'down') {
        moveDown();
    } else if (direction === 'rotate') {
        const originalShape = activePiece.shape;
        activePiece.shape = rotateMatrix(activePiece.shape);
        if (collide(0, 0)) {
            activePiece.shape = originalShape; // Відкатити обертання, якщо є зіткнення
        }
    }
}

// Поворот фігури
function rotateMatrix(matrix) {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
}

// Обробка натискань клавіш
document.addEventListener('keydown', (event) => {
    if (isGameStarted && !isPaused) {
        if (event.key === 'ArrowLeft') {
            movePiece('left');
        } else if (event.key === 'ArrowRight') {
            movePiece('right');
        } else if (event.key === 'ArrowDown') {
            movePiece('down');
        } else if (event.key === 'ArrowUp') {
            movePiece('rotate');
        }
    }
});

// Прив'язати функції до кнопок
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

// Показати вибір рівня перед стартом гри
levelSelector.style.display = 'block';
pauseBtn.style.display = 'none';

// Відображення сітки при завантаженні
drawGrid();
