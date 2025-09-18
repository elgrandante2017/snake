import * as state from './state.js';
import { getTranslation } from './translations.js';
import {
    achievementPrev,
    achievementNext,
    achievementIndex,
    achievementTitle,
    achievementBadge,
    achievementDesc,
    achievementClaim,
    achievementsOverlay,
    achievementsModalClose,
    coinAmountElement,
    shopMainOverlay,
    shopAchievementsButton
} from './ui.js';

// Datos de logros (íconos, claves de traducción y descripción en español)
const achievementsData = [
    { id: 'firstApple', icon: '🍎', translateKey: 'firstApple', description: 'Come tu primera manzana en el juego', difficulty: 'easy' },
    { id: 'hundredApples', icon: '🍏', translateKey: 'hundredApples', description: 'Come 100 manzanas en total', difficulty: 'hard' },
    { id: 'elegantSuit', icon: '👔', translateKey: 'elegantSuitEquipped', description: 'Compra y equipa el traje elegante', difficulty: 'medium' },
    { id: 'level5', icon: '⭐', translateKey: 'level5', description: 'Alcanza el nivel 5', difficulty: 'medium' },
    { id: 'speedDemon', icon: '⚡', translateKey: 'speedDemon', description: 'Usa 10 power-ups de velocidad', difficulty: 'medium' },
    { id: 'invincible', icon: '🛡️', translateKey: 'invincible', description: 'Usa 5 power-ups de invencibilidad', difficulty: 'medium' },
    { id: 'coinCollector', icon: '💰', translateKey: 'coinCollector', description: 'Gana 1000 monedas en total', difficulty: 'hard' },
    { id: 'longSnake', icon: '🐍', translateKey: 'longSnake', description: 'Alcanza una longitud de 30 segmentos', difficulty: 'medium' },
    { id: 'perfectGame', icon: '🏆', translateKey: 'perfectGame', description: 'Gana una partida sin morir', difficulty: 'hard' },
    { id: 'explorer', icon: '🗺️', translateKey: 'explorer', description: 'Juega durante 1 hora en total', difficulty: 'easy' }
];

// Recompensas según dificultad
const rewardMap = {
    easy: 10,
    medium: 25,
    hard: 50
};

let currentIndex = 0;
let claimed = new Set(JSON.parse(localStorage.getItem('claimedAchievements') || '[]'));
let listenersAttached = false;

function render(currentLang = localStorage.getItem('selectedLanguage') || 'es') {
    const ach = achievementsData[currentIndex];
    const unlocked = !!state.achievements[ach.id];

    achievementIndex.textContent = `${currentIndex + 1} / ${achievementsData.length}`;
    achievementBadge.textContent = unlocked ? ach.icon : '❓';
    achievementTitle.textContent = unlocked ? getTranslation(ach.translateKey || ach.id, currentLang) : '?';
    achievementDesc.textContent = ach.description;

    if (unlocked && !claimed.has(ach.id)) {
        achievementClaim.classList.remove('hidden');
        achievementClaim.textContent = `Reclamar (${rewardMap[ach.difficulty]}$)`;
        achievementClaim.disabled = false;
    } else if (unlocked && claimed.has(ach.id)) {
        achievementClaim.classList.remove('hidden');
        achievementClaim.textContent = 'Reclamado';
        achievementClaim.disabled = true;
    } else {
        achievementClaim.classList.add('hidden');
    }

    // Actualizar botones de navegación (habilitado/deshabilitado en los extremos)
    achievementPrev.disabled = currentIndex === 0;
    achievementNext.disabled = currentIndex === achievementsData.length - 1;
}

function changeIndex(delta) {
    currentIndex = Math.max(0, Math.min(achievementsData.length - 1, currentIndex + delta));
    render();
}

// Exponer función global para compatibilidad con input.js (gamepad/teclado)
window.moveCounter = function(direction) {
    // direction expected -1 o 1
    changeIndex(direction);
};

function claimCurrent() {
    const ach = achievementsData[currentIndex];
    if (!state.achievements[ach.id]) return; // no desbloqueado
    if (claimed.has(ach.id)) return; // ya reclamado

    const reward = rewardMap[ach.difficulty] || 10;
    state.setCoins(state.coins + reward);
    coinAmountElement.textContent = state.coins;
    localStorage.setItem('snakeCoins', state.coins);

    // Marcar como reclamado
    claimed.add(ach.id);
    localStorage.setItem('claimedAchievements', JSON.stringify(Array.from(claimed)));

    // Animación y sonido al reclamar
    triggerClaimEffects();

    // Actualizar UI
    achievementClaim.textContent = 'Reclamado';
    achievementClaim.disabled = true;

    // Actualizar visualmente el badge (mantener efecto)
    achievementBadge.classList.add('claimed');

    // Actualizar el indicador del botón de logros (contador/badge)
    try {
        updateAchievementsButtonHighlight();
    } catch (e) {
        // noop si por alguna razón no está disponible
    }
}

function attachListeners() {
    if (listenersAttached) return;
    listenersAttached = true;

    achievementPrev.addEventListener('click', () => {
        changeIndex(-1);
    });

    achievementNext.addEventListener('click', () => {
        changeIndex(1);
    });

    achievementClaim.addEventListener('click', () => {
        claimCurrent();
    });

    achievementsModalClose.addEventListener('click', () => {
        achievementsOverlay.classList.add('hidden');
        // Si venimos desde la tienda, mostrarla de nuevo
        if (shopMainOverlay) shopMainOverlay.classList.remove('hidden');
    });
}

/**
 * Abre el modal de logros y renderiza el logro actual.
 * También adjunta listeners la primera vez.
 */
export function openAchievements(targetId) {
    const currentLang = localStorage.getItem('selectedLanguage') || 'es';
    attachListeners();

    // Si se pasa un id de logro, mover el índice al logro correspondiente
    if (targetId) {
        const idx = achievementsData.findIndex(a => a.id === targetId);
        if (idx >= 0) {
            currentIndex = idx;
        } else {
            currentIndex = 0;
        }
    } else {
        currentIndex = 0;
    }

    render(currentLang);
    achievementsOverlay.classList.remove('hidden');
}

// Efectos de recompensa: sonido y animación al reclamar
function playClaimSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioCtx.currentTime;

        // Secuencia corta de tonos agradables
        const freqs = [880, 1100, 1320];
        freqs.forEach((f, i) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(f, now + i * 0.06);
            g.gain.setValueAtTime(0.0001, now + i * 0.06);
            g.gain.exponentialRampToValueAtTime(0.25, now + i * 0.06 + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
            o.connect(g);
            g.connect(audioCtx.destination);
            o.start(now + i * 0.06);
            o.stop(now + i * 0.06 + 0.28);
        });
    } catch (e) {
        // Ignorar errores de WebAudio
    }
}

function triggerClaimEffects() {
    // Reproducir sonido
    playClaimSound();

    // Efecto visual en la insignia
    if (achievementBadge) {
        achievementBadge.classList.add('claimed');
        setTimeout(() => {
            achievementBadge.classList.remove('claimed');
        }, 1200);
    }

    // Flotante de +monedas cerca del contador
    try {
        const ach = achievementsData[currentIndex];
        const reward = rewardMap[ach.difficulty] || 10;
        const counter = document.getElementById('coin-counter');
        if (counter) {
            const float = document.createElement('div');
            float.className = 'claim-float';
            float.textContent = `+${reward}`;
            document.body.appendChild(float);
            const rect = counter.getBoundingClientRect();
            float.style.left = (rect.left + rect.width / 2) + 'px';
            float.style.top = (rect.top + rect.height / 2) + 'px';
            // Animación CSS via Web Animations API
            float.animate([
                { transform: 'translateY(0) scale(1)', opacity: 1 },
                { transform: 'translateY(-40px) scale(1.2)', opacity: 0 }
            ], {
                duration: 900,
                easing: 'cubic-bezier(.2,.8,.2,1)'
            });
            setTimeout(() => {
                if (float.parentNode) float.parentNode.removeChild(float);
            }, 900);
        }
    } catch (e) {
        // noop
    }
}

/**
 * Revisa si hay logros desbloqueados y no reclamados.
 * Devuelve true si existe al menos uno que puede reclamarse.
 */
function hasUnclaimedAchievements() {
    try {
        for (const ach of achievementsData) {
            if (state.achievements[ach.id] && !claimed.has(ach.id)) {
                return true;
            }
        }
    } catch (e) {
        // noop
    }
    return false;
}

/**
 * Actualiza visualmente el botón "Logros" en la tienda para indicar que
 * hay al menos un logro disponible para reclamar.
 */
function updateAchievementsButtonHighlight() {
    if (!shopAchievementsButton) return;

    // Calcular cuántos logros desbloqueados están sin reclamar
    let unclaimedCount = 0;
    for (const ach of achievementsData) {
        if (state.achievements[ach.id] && !claimed.has(ach.id)) {
            unclaimedCount++;
        }
    }

    if (unclaimedCount > 0) {
        shopAchievementsButton.classList.add('achievement-alert');
        shopAchievementsButton.setAttribute('aria-live', 'polite');

        // Mostrar un pequeño contador con la cantidad de recompensas sin reclamar
        let countEl = shopAchievementsButton.querySelector('.achievement-unclaimed-count');
        if (!countEl) {
            countEl = document.createElement('span');
            countEl.className = 'achievement-unclaimed-count';
            // Estilo mínimo en línea en caso de que no exista CSS (se puede refinar en style.css)
            countEl.style.marginLeft = '8px';
            countEl.style.background = '#f1c40f';
            countEl.style.color = '#222';
            countEl.style.padding = '2px 6px';
            countEl.style.borderRadius = '999px';
            countEl.style.fontWeight = '700';
            countEl.style.fontSize = '0.85em';
            shopAchievementsButton.appendChild(countEl);
        }
        countEl.textContent = String(unclaimedCount);
    } else {
        shopAchievementsButton.classList.remove('achievement-alert');
        shopAchievementsButton.removeAttribute('aria-live');
        const countEl = shopAchievementsButton.querySelector('.achievement-unclaimed-count');
        if (countEl && countEl.parentNode) countEl.parentNode.removeChild(countEl);
    }
}

// Exponer una función para forzar la actualización manualmente desde otros módulos si se desea
export function refreshAchievementsButton() {
    updateAchievementsButtonHighlight();
}

// Llamar a la actualización cuando se abre el modal y cuando se adjuntan listeners
// También llamar después de reclamar un logro (se hace en claimCurrent)

// Inicializar comprobación periódica (liviana) para mantener el estado del botón en sincronía
updateAchievementsButtonHighlight();
setInterval(updateAchievementsButtonHighlight, 1000);