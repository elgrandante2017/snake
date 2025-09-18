import { GRID_SIZE } from './config.js';

// Variables de estado del juego
export let snake = [];
export let food = {};
export let score = 0;
export let record = 0;
export let coins = 0;
export let direction = 'right';
export let changingDirection = false;
export let gameRunning = false;
export let gameInterval = null;

// Variables de estado del Joystick
export let gamepad = null;

// Variables de estado de la tienda
export let elegantSuitPurchased = false;
export let elegantSuitEquipped = false;
export let elegantSuitProgress = 0; // Progreso del traje (0-1)

// Variables de estado de brillo
export let brightness = 1;

// Variables de estado de niveles y logros
export let level = 1;
export let experience = 0;
export let experienceToNext = 100;
export let achievements = {
    firstApple: false,
    hundredApples: false,
    elegantSuit: false,
    level5: false,
    speedDemon: false,
    invincible: false,
    coinCollector: false,
    longSnake: false,
    perfectGame: false,
    explorer: false
};

// Variables de estado de power-ups
export let activePowerUps = {
    speed: { active: false, timeLeft: 0 },
    invincibility: { active: false, timeLeft: 0 }
};
export let powerUpFood = null; // Comida especial que da power-ups

// Variables de estadísticas
export let stats = {
    totalApples: 0,
    totalPlayTime: 0,
    totalGames: 0,
    totalPowerUps: 0,
    maxLevel: 1,
    totalCoinsEarned: 0
};

// Setters para modificar el estado
export function setSnake(value) { snake = value; }
export function setFood(value) { food = value; }
export function setScore(value) { score = value; }
export function setRecord(value) { record = value; }
export function setDirection(value) { direction = value; }
export function setChangingDirection(value) { changingDirection = value; }
export function setGameRunning(value) { gameRunning = value; }
export function setGameInterval(value) { gameInterval = value; }
export function setCoins(value) { coins = value; }
export function setGamepad(value) { gamepad = value; }
export function setElegantSuitPurchased(value) { elegantSuitPurchased = value; }
export function setElegantSuitEquipped(value) { elegantSuitEquipped = value; }
export function setElegantSuitProgress(value) { elegantSuitProgress = value; }
export function setBrightness(value) { brightness = value; }
export function setLevel(value) { level = value; }
export function setExperience(value) { experience = value; }
export function setExperienceToNext(value) { experienceToNext = value; }
export function setAchievements(value) { achievements = value; }
export function unlockAchievement(key) { achievements[key] = true; }
export function setActivePowerUps(value) { activePowerUps = value; }
export function setPowerUpFood(value) { powerUpFood = value; }
export function activatePowerUp(type, duration) {
    activePowerUps[type].active = true;
    activePowerUps[type].timeLeft = duration;
}
export function deactivatePowerUp(type) {
    activePowerUps[type].active = false;
    activePowerUps[type].timeLeft = 0;
}
export function setStats(value) { stats = value; }
export function updateStat(statName, value) { stats[statName] += value; }

export function resetGameState() {
    if (gameInterval) clearInterval(gameInterval);
    setGameInterval(null);
    setGameRunning(false);
    setScore(0);
    setElegantSuitProgress(0); // Resetear progreso del traje
    setSnake([{ x: 10 * GRID_SIZE, y: 10 * GRID_SIZE }]);
    setDirection('right');
    setChangingDirection(false);
}
