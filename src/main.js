import * as state from './state.js';
import { resetGameState, setRecord } from './state.js';
import { generateFood, startGame, pauseGame, resumeGame, getGameRunningState, updateExperienceBar, playPurchaseSound } from './game.js';
import { draw, drawStartScreen } from './draw.js';
import { recordElement, restartButton, shopIcon, shopMainOverlay, shopMainCloseButton, shopCosmeticsButton, shopUpgradesButton, shopAchievementsButton, shopCosmeticsOverlay, shopCosmeticsBackButton, comingSoonModal, comingSoonCloseButton, coinAmountElement, elegantSuitButton, elegantSuitPriceElement, brightnessIcon, brightnessOverlay, brightnessSlider, brightnessValue, brightnessDefault, brightnessClose, updateElegantSuitUI, levelElement, languageIcon, languageOverlay, languageClose, languageButtons, achievementsOverlay, achievementsClose, counterLeft, counterRight, counterValue } from './ui.js';
import { changeLanguage, getTranslation } from './translations.js';
import { setupAllInputs } from './input.js';

let gameWasRunningBeforeShop = false;

function init(quickStart = false) {
    resetGameState();
    const storedRecord = parseInt(localStorage.getItem('snakeRecord')) || 0;
    setRecord(storedRecord);
    recordElement.textContent = storedRecord;

    const storedCoins = localStorage.getItem('snakeCoins');
    if (storedCoins === null) {
        // Primera vez jugando, dar 100 monedas de regalo
        state.setCoins(100);
        localStorage.setItem('snakeCoins', '100');
    } else {
        state.setCoins(parseInt(storedCoins));
    }
    coinAmountElement.textContent = state.coins;

    const storedElegantSuitPurchased = localStorage.getItem('elegantSuitPurchased') === 'true';
    state.setElegantSuitPurchased(storedElegantSuitPurchased);

    const storedElegantSuitEquipped = localStorage.getItem('elegantSuitEquipped') === 'true';
    state.setElegantSuitEquipped(storedElegantSuitEquipped);

    const storedBrightness = parseFloat(localStorage.getItem('brightness')) || 1;
    state.setBrightness(storedBrightness);

    updateElegantSuitUI(state);
    updateBrightness();

    // Inicializar nivel y experiencia
    levelElement.textContent = state.level;
    updateExperienceBar();

    // Inicializar idioma (por defecto español)
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'es';
    changeLanguage(savedLanguage);

    // Marcar el botón correspondiente como seleccionado
    Object.values(languageButtons).forEach(btn => btn.classList.remove('selected'));
    if (languageButtons[savedLanguage]) {
        languageButtons[savedLanguage].classList.add('selected');
    }

    restartButton.textContent = 'Empezar';
    generateFood();
    draw();

    if (!quickStart) {
        drawStartScreen();
    }
}

// --- Configuración Inicial ---
restartButton.addEventListener('click', () => {
    if (restartButton.textContent === 'Empezar') {
        startGame();
    } else {
        init(false);
    }
});

shopIcon.addEventListener('click', () => {
    shopMainOverlay.classList.remove('hidden');
    gameWasRunningBeforeShop = getGameRunningState();
    if (gameWasRunningBeforeShop) {
        pauseGame();
    }
});

shopMainCloseButton.addEventListener('click', () => {
    shopMainOverlay.classList.add('hidden');
    if (gameWasRunningBeforeShop) {
        resumeGame();
    }
});

shopCosmeticsButton.addEventListener('click', () => {
    shopMainOverlay.classList.add('hidden');
    shopCosmeticsOverlay.classList.remove('hidden');
});

shopCosmeticsBackButton.addEventListener('click', () => {
    shopCosmeticsOverlay.classList.add('hidden');
    shopMainOverlay.classList.remove('hidden');
});

shopUpgradesButton.addEventListener('click', () => {
    comingSoonModal.classList.remove('hidden');
});

shopAchievementsButton.addEventListener('click', () => {
    comingSoonModal.classList.remove('hidden');
});

comingSoonCloseButton.addEventListener('click', () => {
    comingSoonModal.classList.add('hidden');
});

setupAllInputs();


elegantSuitButton.addEventListener('click', () => {
    if (!state.elegantSuitPurchased) {
        if (state.coins >= 100) {
            state.setCoins(state.coins - 100);
            coinAmountElement.textContent = state.coins;
            localStorage.setItem('snakeCoins', state.coins);
            state.setElegantSuitPurchased(true);
            localStorage.setItem('elegantSuitPurchased', 'true');
            state.setElegantSuitEquipped(true);
            localStorage.setItem('elegantSuitEquipped', 'true');

            // Reproducir sonido de compra
            playPurchaseSound();
        } else {
            // No hay suficientes monedas, quizás mostrar un mensaje
            return;
        }
    } else {
        state.setElegantSuitEquipped(!state.elegantSuitEquipped);
        localStorage.setItem('elegantSuitEquipped', state.elegantSuitEquipped.toString());
    }
    updateElegantSuitUI(state);
});

function updateBrightness() {
    document.body.style.filter = `brightness(${state.brightness})`;
    brightnessSlider.value = state.brightness;
    brightnessValue.textContent = Math.round(state.brightness * 100) + '%';
}

brightnessIcon.addEventListener('click', () => {
    brightnessOverlay.classList.remove('hidden');
});

brightnessClose.addEventListener('click', () => {
    brightnessOverlay.classList.add('hidden');
});

brightnessSlider.addEventListener('input', () => {
    const value = parseFloat(brightnessSlider.value);
    state.setBrightness(value);
    updateBrightness();
    localStorage.setItem('brightness', value.toString());
});

brightnessDefault.addEventListener('click', () => {
    state.setBrightness(1);
    updateBrightness();
    localStorage.setItem('brightness', '1');
});

// --- Event Listeners de Idioma ---
languageIcon.addEventListener('click', () => {
    languageOverlay.classList.remove('hidden');
});

languageClose.addEventListener('click', () => {
    languageOverlay.classList.add('hidden');
});

// Event listeners para botones de idioma
Object.keys(languageButtons).forEach(lang => {
    languageButtons[lang].addEventListener('click', () => {
        // Remover clase selected de todos los botones
        Object.values(languageButtons).forEach(btn => btn.classList.remove('selected'));

        // Agregar clase selected al botón seleccionado
        languageButtons[lang].classList.add('selected');

        // Cambiar idioma
        changeLanguage(lang);

        // NO cerrar modal automáticamente - el usuario puede elegir otro idioma
    });
});

// --- Event Listeners de Logros ---
shopAchievementsButton.addEventListener('click', () => {
    shopMainOverlay.classList.add('hidden');
    achievementsOverlay.classList.remove('hidden');
    populateAchievements();
});

achievementsClose.addEventListener('click', () => {
    achievementsOverlay.classList.add('hidden');
    shopMainOverlay.classList.remove('hidden');
});

// Función para poblar los logros con datos reales
function populateAchievements() {
    const slots = document.querySelectorAll('.achievement-slot');
    const currentLang = localStorage.getItem('selectedLanguage') || 'es';
    
    // Definir los logros con sus íconos, nombres y descripciones
    const achievementsData = [
        { 
            id: 'firstApple', 
            icon: '🍎', 
            name: getTranslation('firstApple', currentLang),
            description: 'Come tu primera manzana en el juego'
        },
        { 
            id: 'hundredApples', 
            icon: '🍏', 
            name: getTranslation('hundredApples', currentLang),
            description: 'Come 100 manzanas en total'
        },
        { 
            id: 'elegantSuit', 
            icon: '👔', 
            name: getTranslation('elegantSuit', currentLang),
            description: 'Compra y equipa el traje elegante'
        },
        { 
            id: 'level5', 
            icon: '⭐', 
            name: getTranslation('level5', currentLang),
            description: 'Alcanza el nivel 5'
        },
        { 
            id: 'speedDemon', 
            icon: '⚡', 
            name: 'Velocidad Máxima',
            description: 'Usa 10 power-ups de velocidad'
        },
        { 
            id: 'invincible', 
            icon: '🛡️', 
            name: 'Invencible',
            description: 'Usa 5 power-ups de invencibilidad'
        },
        { 
            id: 'coinCollector', 
            icon: '💰', 
            name: 'Coleccionista',
            description: 'Gana 1000 monedas en total'
        },
        { 
            id: 'longSnake', 
            icon: '🐍', 
            name: 'Serpiente Larga',
            description: 'Alcanza una longitud de 30 segmentos'
        },
        { 
            id: 'perfectGame', 
            icon: '🏆', 
            name: 'Partida Perfecta',
            description: 'Gana una partida sin morir'
        },
        { 
            id: 'explorer', 
            icon: '🗺️', 
            name: 'Explorador',
            description: 'Juega durante 1 hora en total'
        }
    ];
    
    slots.forEach((slot, index) => {
        if (index < achievementsData.length) {
            const achievement = achievementsData[index];
            
            // Limpiar el contenido del slot
            slot.innerHTML = '';
            
            // Crear y añadir el ícono del logro
            const icon = document.createElement('div');
            icon.textContent = achievement.icon;
            icon.style.fontSize = '2em';
            
            // Crear y añadir la descripción
            const description = document.createElement('div');
            description.className = 'achievement-description';
            description.textContent = achievement.description;
            
            // Crear y añadir el nombre
            const name = document.createElement('div');
            name.className = 'achievement-name';
            name.textContent = achievement.name;
            
            // Añadir elementos al slot
            slot.appendChild(icon);
            slot.appendChild(description);
            slot.appendChild(name);
            
            // Verificar si el logro está desbloqueado
            if (state.achievements[achievement.id]) {
                slot.classList.remove('locked');
                slot.classList.add('unlocked');
            } else {
                slot.classList.remove('unlocked');
                slot.classList.add('locked');
            }
        }
    });
}

// --- Funcionalidad del contador ---
let counterValueNum = 1;
const maxCounterValue = 10;

function updateCounterDisplay() {
    counterValue.textContent = counterValueNum;
}

function moveCounter(direction) {
    if (direction === -1 && counterValueNum > 1) {
        counterValueNum--;
        updateCounterDisplay();
    } else if (direction === 1 && counterValueNum < maxCounterValue) {
        counterValueNum++;
        updateCounterDisplay();
    }
}

counterLeft.addEventListener('click', () => {
    moveCounter(-1);
});

counterRight.addEventListener('click', () => {
    moveCounter(1);
});

// Exportar función para uso en input.js
window.moveCounter = moveCounter;

init();

// Sistema de guardado automático
setInterval(() => {
    if (state.gameRunning) {
        // Actualizar tiempo de juego
        state.updateStat('totalPlayTime', 30); // 30 segundos

        // Guardar progreso automáticamente cada 30 segundos
        localStorage.setItem('snakeAutoSave', JSON.stringify({
            level: state.level,
            experience: state.experience,
            experienceToNext: state.experienceToNext,
            achievements: state.achievements,
            coins: state.coins,
            record: state.record,
            elegantSuitPurchased: state.elegantSuitPurchased,
            elegantSuitEquipped: state.elegantSuitEquipped,
            brightness: state.brightness,
            stats: state.stats
        }));
    }
}, 30000); // 30 segundos