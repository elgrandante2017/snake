import { GRID_SIZE, GAME_SPEED } from './config.js';
import * as state from './state.js';
import { draw, drawGameOver } from './draw.js';
import { canvas, scoreElement, focusableElements, setFocusedElementIndex, restartButton, coinAmountElement, updateElegantSuitUI, levelElement, experienceFillElement, experienceTextElement } from './ui.js';
import { getTranslation } from './translations.js';


export function generateFood() {
    // 20% de probabilidad de generar comida especial con power-up
    const isPowerUp = Math.random() < 0.2 && state.level >= 3; // Solo desde nivel 3

    const food = {
        x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)) * GRID_SIZE,
        y: Math.floor(Math.random() * (canvas.height / GRID_SIZE)) * GRID_SIZE,
        isPowerUp: isPowerUp,
        powerUpType: isPowerUp ? (Math.random() < 0.5 ? 'speed' : 'invincibility') : null
    };
    state.setFood(food);
    if (state.snake.some(part => part.x === food.x && part.y === food.y)) {
        generateFood();
    }
}

function moveSnake() {
    const head = { x: state.snake[0].x, y: state.snake[0].y };
    switch (state.direction) {
        case 'up': head.y -= GRID_SIZE; break;
        case 'down': head.y += GRID_SIZE; break;
        case 'left': head.x -= GRID_SIZE; break;
        case 'right': head.x += GRID_SIZE; break;
    }
    const newSnake = [head, ...state.snake];
    if (head.x === state.food.x && head.y === state.food.y) {
        // Manejar power-ups
        if (state.food.isPowerUp) {
            const powerUpType = state.food.powerUpType;
            const duration = 10000; // 10 segundos
            state.activatePowerUp(powerUpType, duration);

            // Actualizar estadísticas
            state.updateStat('totalPowerUps', 1);

            // Efectos visuales y sonido especial para power-ups
            createParticles(head.x + GRID_SIZE/2, head.y + GRID_SIZE/2);
            playSound(1200, 0.3, 'sawtooth'); // Sonido especial para power-up

            // Notificación
            showPowerUpNotification(powerUpType, duration);
        } else {
            // Comida normal
            state.setScore(state.score + 10);
            scoreElement.textContent = state.score;

            // Dar experiencia
            const expGained = 10;
            state.setExperience(state.experience + expGained);
    
            // Actualizar estadísticas
            state.updateStat('totalApples', 1);

            // Verificar si sube de nivel
            if (state.experience >= state.experienceToNext) {
                state.setLevel(state.level + 1);
                state.setExperience(state.experience - state.experienceToNext);
                state.setExperienceToNext(Math.floor(state.experienceToNext * 1.2)); // Aumenta la exp necesaria
                levelElement.textContent = state.level;

                // Actualizar estadística de nivel máximo
                if (state.level > state.stats.maxLevel) {
                    state.stats.maxLevel = state.level;
                }

                // Reproducir sonido de subir nivel
                playLevelUpSound();
            }

            // Actualizar barra de experiencia
            updateExperienceBar();

            // Crear efecto de partículas
            createParticles(head.x + GRID_SIZE/2, head.y + GRID_SIZE/2);

            // Reproducir sonido de comer
            playEatSound();

            // Verificar logros
            checkAchievements();

            // Actualizar progreso del traje elegante si está equipado
            if (state.elegantSuitEquipped) {
                const maxLength = 20; // Cabeza + 19 segmentos para completar el traje
                state.setElegantSuitProgress(Math.min((state.snake.length - 1) / (maxLength - 1), 1));
                updateElegantSuitUI(state); // Actualizar UI
            }
        }
        generateFood();
    } else {
        newSnake.pop();
    }
    state.setSnake(newSnake);
}

function checkCollision() {
    // Si tiene invencibilidad, no hay colisiones
    if (state.activePowerUps.invincibility.active) return false;

    const head = state.snake[0];
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return true;
    for (let i = 1; i < state.snake.length; i++) {
        if (head.x === state.snake[i].x && head.y === state.snake[i].y) return true;
    }
    return false;
}

function gameOver() {
    state.setGameRunning(false);
    clearInterval(state.gameInterval);
    state.setGameInterval(null);

    // Calcular monedas ganadas
    const baseCoins = state.score / 10; // 1 moneda por cada 10 puntos
    let finalMultiplier = 1;
    let earnedCoins = 0;

    // Lógica de multiplicadores (antes "PORs")
    const scoreDifference = state.score - state.record;
    if (scoreDifference >= 100) {
        const numMultipliers = Math.floor(scoreDifference / 100);
        finalMultiplier = 1 + numMultipliers;
    }

    earnedCoins = Math.floor(baseCoins * finalMultiplier);
    state.setCoins(state.coins + earnedCoins);
    state.updateStat('totalCoinsEarned', earnedCoins);
    state.updateStat('totalGames', 1);
    localStorage.setItem('snakeCoins', state.coins);
    coinAmountElement.textContent = state.coins;
    coinAmountElement.classList.add('coin-pulse'); // Añadir clase para efecto
    setTimeout(() => {
        coinAmountElement.classList.remove('coin-pulse');
    }, 500); // Remover clase después de la animación

    drawGameOver();

    // Reiniciar puntuación visualmente
    scoreElement.textContent = '0';

    if (state.gamepad) {
        setFocusedElementIndex(1);
        focusableElements[1].classList.add('joystick-focus');
    }
}

function gameLoop() {
    if (!state.gameRunning) return;
    state.setChangingDirection(false);

    // Actualizar power-ups activos
    updatePowerUps();

    moveSnake();
    if (checkCollision()) {
        gameOver();
    } else {
        draw();
    }
}

export function doChangeDirection(newDirection) {
    if (state.changingDirection || !state.gameRunning) return;
    const goingUp = state.direction === 'up';
    const goingDown = state.direction === 'down';
    const goingLeft = state.direction === 'left';
    const goingRight = state.direction === 'right';
    if (newDirection === 'up' && !goingDown) state.setDirection('up');
    if (newDirection === 'down' && !goingUp) state.setDirection('down');
    if (newDirection === 'left' && !goingRight) state.setDirection('left');
    if (newDirection === 'right' && !goingLeft) state.setDirection('right');
    state.setChangingDirection(true);
}

export function startGame() {
    if (state.gameRunning) return;
    restartButton.textContent = 'Reiniciar';
    // Lógica de inicio
    state.setGameRunning(true);
    const speed = state.activePowerUps.speed.active ? GAME_SPEED / 2 : GAME_SPEED;
    state.setGameInterval(setInterval(gameLoop, speed));
}

export function pauseGame() {
    if (state.gameInterval) {
        clearInterval(state.gameInterval);
        state.setGameInterval(null);
    }
}

export function resumeGame() {
    if (!state.gameInterval && state.gameRunning) {
        const speed = state.activePowerUps.speed.active ? GAME_SPEED / 2 : GAME_SPEED;
        state.setGameInterval(setInterval(gameLoop, speed));
    }
}

export function getGameRunningState() {
    return state.gameRunning;
}

function createParticles(x, y) {
    const particlesContainer = document.getElementById('particles-container');
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Posición aleatoria alrededor del punto de comida
        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = Math.random() * 30 + 10;
        const particleX = x + Math.cos(angle) * distance;
        const particleY = y + Math.sin(angle) * distance;

        particle.style.left = particleX + 'px';
        particle.style.top = particleY + 'px';

        particlesContainer.appendChild(particle);

        // Remover partícula después de la animación
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }
}

// Sistema de sonido simple
function playSound(frequency, duration, type = 'sine') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        // Silenciar errores si Web Audio no está disponible
    }
}

function playEatSound() {
    playSound(800, 0.1, 'square');
    setTimeout(() => playSound(1000, 0.1, 'square'), 50);
}

function playLevelUpSound() {
    playSound(523, 0.2); // Do
    setTimeout(() => playSound(659, 0.2), 100); // Mi
    setTimeout(() => playSound(784, 0.3), 200); // Sol
}

function playAchievementSound() {
    playSound(440, 0.15); // La
    setTimeout(() => playSound(554, 0.15), 75); // Do#
    setTimeout(() => playSound(659, 0.2), 150); // Mi
    setTimeout(() => playSound(880, 0.3), 225); // La
}

export function playPurchaseSound() {
    playSound(600, 0.1);
    setTimeout(() => playSound(800, 0.1), 50);
    setTimeout(() => playSound(1000, 0.2), 100);
}

export function updateExperienceBar() {
    const percentage = (state.experience / state.experienceToNext) * 100;
    experienceFillElement.style.width = percentage + '%';
    experienceTextElement.textContent = `${state.experience}/${state.experienceToNext} XP`;
}

function checkAchievements() {
    const currentLang = localStorage.getItem('selectedLanguage') || 'es';

    // Logro: Primera manzana
    if (state.score >= 10 && !state.achievements.firstApple) {
        state.unlockAchievement('firstApple');
        showAchievementNotification(getTranslation('firstApple', currentLang));
    }

    // Logro: 100 manzanas
    if (state.score >= 1000 && !state.achievements.hundredApples) {
        state.unlockAchievement('hundredApples');
        showAchievementNotification(getTranslation('hundredApples', currentLang));
    }

    // Logro: Traje elegante
    if (state.elegantSuitEquipped && !state.achievements.elegantSuit) {
        state.unlockAchievement('elegantSuit');
        showAchievementNotification(getTranslation('elegantSuitEquipped', currentLang));
    }

    // Logro: Nivel 5
    if (state.level >= 5 && !state.achievements.level5) {
        state.unlockAchievement('level5');
        showAchievementNotification(getTranslation('level5', currentLang));
    }

    // Logro: Demonio de la velocidad (10 power-ups de velocidad)
    if (state.stats.totalPowerUps >= 10 && !state.achievements.speedDemon) {
        state.unlockAchievement('speedDemon');
        showAchievementNotification(getTranslation('speedDemon', currentLang));
    }

    // Logro: Coleccionista de monedas (1000 monedas)
    if (state.coins >= 1000 && !state.achievements.coinCollector) {
        state.unlockAchievement('coinCollector');
        showAchievementNotification(getTranslation('coinCollector', currentLang));
    }

    // Logro: Serpiente larga (30 segmentos)
    if (state.snake.length >= 30 && !state.achievements.longSnake) {
        state.unlockAchievement('longSnake');
        showAchievementNotification(getTranslation('longSnake', currentLang));
    }
}

function showAchievementNotification(message) {
    // Reproducir sonido de logro
    playAchievementSound();

    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.textContent = '🏆 ' + message;
    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

function showPowerUpNotification(type, duration) {
    const currentLang = localStorage.getItem('selectedLanguage') || 'es';
    const messages = {
        speed: getTranslation('speedBoost', currentLang),
        invincibility: getTranslation('invincibility', currentLang)
    };

    const notification = document.createElement('div');
    notification.className = 'powerup-notification';
    notification.textContent = messages[type];
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 2000);
}

function updatePowerUps() {
    // Actualizar tiempo restante de power-ups
    Object.keys(state.activePowerUps).forEach(type => {
        if (state.activePowerUps[type].active) {
            state.activePowerUps[type].timeLeft -= 16; // ~60fps
            if (state.activePowerUps[type].timeLeft <= 0) {
                state.deactivatePowerUp(type);
            }
        }
    });
}
