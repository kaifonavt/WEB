const MIN_VAL = 1;
const MAX_VAL = 100;
const INITIAL_LIVES = 3;

let currentValue;
let lives = INITIAL_LIVES;
let streak = 0;
let bestStreak = 0;
let isGameOver = false;

const uiLives = document.getElementById('lives');
const uiStreak = document.getElementById('streak');
const uiBestStreak = document.getElementById('best-streak');
const uiCurrentValue = document.querySelector('#current-value span');
const uiMessage = document.getElementById('message');
const btnHigher = document.getElementById('btn-higher');
const btnLower = document.getElementById('btn-lower');
const btnRestart = document.getElementById('btn-restart');

function getRandomValue() {
    return Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL;
}

function initGame() {
    currentValue = getRandomValue();
    lives = INITIAL_LIVES;
    streak = 0;
    isGameOver = false;
    updateUI();
    uiMessage.textContent = "Make your choice!";
    btnHigher.style.display = 'inline-block';
    btnLower.style.display = 'inline-block';
    btnRestart.style.display = 'none';
}

function handleGuess(guess) {
    if (isGameOver) {
        uiMessage.textContent = "Game over. Click 'Restart Game'.";
        return;
    }

    const nextValue = getRandomValue();
    const isHigherOrEqual = nextValue >= currentValue;
    const isLowerOrEqual = nextValue <= currentValue;
    const isCorrect = ((guess === 'higher' && isHigherOrEqual) || (guess === 'lower' && isLowerOrEqual));

    if (isCorrect) {
        streak++;
        if (streak > bestStreak) bestStreak = streak;
        uiMessage.textContent = `Correct! The next number was ${nextValue}.`;
    } else {
        lives--;
        uiMessage.textContent = `Wrong! The next number was ${nextValue}.`;
    }

    currentValue = nextValue;

    if (lives <= 0) {
        isGameOver = true;
        uiMessage.textContent = "Game Over! You lost all your lives.";
        btnHigher.style.display = 'none';
        btnLower.style.display = 'none';
        btnRestart.style.display = 'inline-block';
    }

    updateUI();
}

function updateUI() {
    uiLives.textContent = lives;
    uiStreak.textContent = streak;
    uiBestStreak.textContent = bestStreak;
    uiCurrentValue.textContent = currentValue;
}

btnHigher.addEventListener('click', () => handleGuess('higher'));
btnLower.addEventListener('click', () => handleGuess('lower'));
btnRestart.addEventListener('click', initGame);

initGame();