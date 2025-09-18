export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');
export const scoreElement = document.getElementById('score');
export const recordElement = document.getElementById('record');
export const coinAmountElement = document.getElementById('coin-amount');
export const restartButton = document.getElementById('restartButton');
export const shopIcon = document.getElementById('shop-icon');
export const shopMainOverlay = document.getElementById('shop-main-overlay');
export const shopMainCloseButton = document.getElementById('shop-main-close-button');
export const shopCosmeticsButton = document.getElementById('shop-cosmetics-button');
export const shopUpgradesButton = document.getElementById('shop-upgrades-button');
export const shopAchievementsButton = document.getElementById('shop-achievements-button');
export const shopCosmeticsOverlay = document.getElementById('shop-cosmetics-overlay');
export const shopCosmeticsBackButton = document.getElementById('shop-cosmetics-back-button');
export const comingSoonModal = document.getElementById('coming-soon-modal');
export const comingSoonCloseButton = document.getElementById('coming-soon-close');
export const elegantSuitButton = document.getElementById('elegant-suit-button');
export const elegantSuitPriceElement = document.getElementById('elegant-suit-price');
export const brightnessIcon = document.getElementById('brightness-icon');
export const brightnessOverlay = document.getElementById('brightness-overlay');
export const brightnessSlider = document.getElementById('brightness-slider');
export const brightnessValue = document.getElementById('brightness-value');
export const brightnessDefault = document.getElementById('brightness-default');
export const brightnessClose = document.getElementById('brightness-close');

// Elementos de idioma
export const languageIcon = document.getElementById('language-icon');
export const languageOverlay = document.getElementById('language-overlay');
export const languageClose = document.getElementById('language-close');
export const languageButtons = {
    es: document.getElementById('lang-es'),
    en: document.getElementById('lang-en'),
    fr: document.getElementById('lang-fr'),
    pt: document.getElementById('lang-pt'),
    zh: document.getElementById('lang-zh'),
    ru: document.getElementById('lang-ru')
};

// Elementos de logros
export const achievementsOverlay = document.getElementById('achievements-overlay');
export const achievementsClose = document.getElementById('achievements-close');
export const counterLeft = document.getElementById('counter-left');
export const counterRight = document.getElementById('counter-right');
export const counterValue = document.getElementById('counter-value');

// Elementos de nivel y experiencia
export const levelElement = document.getElementById('level');
export const experienceFillElement = document.getElementById('experience-fill');
export const experienceTextElement = document.getElementById('experience-text');

export let focusedElementIndex = -1;

export const focusableElements = [shopIcon, restartButton, shopCosmeticsButton, shopUpgradesButton, shopAchievementsButton, shopCosmeticsBackButton, shopMainCloseButton, comingSoonCloseButton, elegantSuitButton, brightnessIcon, languageIcon, languageButtons.es, languageButtons.en, languageButtons.fr, languageButtons.pt, languageButtons.zh, languageButtons.ru, brightnessSlider, brightnessDefault, brightnessClose, languageClose, counterLeft, counterRight, achievementsClose];

export function setFocusedElementIndex(index) {
    focusedElementIndex = index;
}

export function hideFocus() {
    focusableElements.forEach(el => el.classList.remove('joystick-focus'));
    focusedElementIndex = -1;
}

export function updateFocus(change) {
    if (focusableElements.length === 0) return;
    focusableElements.forEach(el => el.classList.remove('joystick-focus'));
    let newIndex = focusedElementIndex + change;
    if (newIndex >= focusableElements.length) newIndex = 0;
    if (newIndex < 0) newIndex = focusableElements.length - 1;
    focusedElementIndex = newIndex;
    const focusedEl = focusableElements[focusedElementIndex];
    focusedEl.classList.add('joystick-focus');
    focusedEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
}

export function updateElegantSuitUI(state) {
    const currentLang = localStorage.getItem('selectedLanguage') || 'es';

    if (state.elegantSuitPurchased) {
        elegantSuitPriceElement.style.display = 'none';
        if (state.elegantSuitEquipped) {
            const progressPercent = Math.round(state.elegantSuitProgress * 100);
            elegantSuitButton.textContent = `${getTranslation('unequip', currentLang)} (${progressPercent}%)`;
        } else {
            elegantSuitButton.textContent = getTranslation('equip', currentLang);
        }
        elegantSuitButton.classList.remove('not-purchased');
    } else {
        elegantSuitPriceElement.style.display = 'block';
        elegantSuitButton.textContent = getTranslation('buy', currentLang);
        elegantSuitButton.classList.add('not-purchased');
    }
}

// Función auxiliar para obtener traducciones (importada dinámicamente)
function getTranslation(key, lang = 'es') {
    // Importar dinámicamente las traducciones
    const translations = {
        es: { buy: 'Comprar', equip: 'Equipar', unequip: 'Desequipar' },
        zh: { buy: '购买', equip: '装备', unequip: '卸下' },
        ru: { buy: 'Купить', equip: 'Надеть', unequip: 'Снять' },
        fr: { buy: 'Acheter', equip: 'Équiper', unequip: 'Déséquiper' },
        pt: { buy: 'Comprar', equip: 'Equipar', unequip: 'Desequipar' },
        en: { buy: 'Buy', equip: 'Equip', unequip: 'Unequip' }
    };
    return translations[lang]?.[key] || translations.es[key] || key;
}