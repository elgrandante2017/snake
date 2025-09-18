import { doChangeDirection, startGame } from './game.js';
import { updateFocus, hideFocus, focusableElements, focusedElementIndex } from './ui.js';
import * as state from './state.js';

let dpad_x_pressed = false;
let action_button_pressed = false;
let gamepadAnimationId = null;

function handleGamepadInput() {
    if (!state.gamepad) return;
    const gp = navigator.getGamepads()[state.gamepad.index];
    if (!gp) return;

    if (!state.gameRunning) {
        const currentActionPressed = gp.buttons[0].pressed || gp.buttons[2].pressed; // A o X
        if (currentActionPressed && !action_button_pressed) {
            if (focusedElementIndex !== -1) {
                focusableElements[focusedElementIndex].click();
            }
        }
        action_button_pressed = currentActionPressed;

        // Si el modal de logros está abierto, manejar navegación del contador
        if (!document.getElementById('achievements-overlay').classList.contains('hidden')) {
            const dpad_x = gp.axes[0] > 0.7 ? 1 : (gp.axes[0] < -0.7 ? -1 : 0);
            const dpad_x_buttons = gp.buttons[14].pressed ? -1 : (gp.buttons[15].pressed ? 1 : 0); // Flechas izquierda/derecha

            const total_dpad_x = dpad_x || dpad_x_buttons;

            if (total_dpad_x !== 0 && !dpad_x_pressed) {
                moveCounter(total_dpad_x);
            }
            dpad_x_pressed = total_dpad_x !== 0;
        } else {
            // Navegación UI normal (Palanca / D-Pad)
            const dpad_x = gp.axes[0] > 0.7 ? 1 : (gp.axes[0] < -0.7 ? -1 : 0);
            if (dpad_x !== 0 && !dpad_x_pressed) {
                updateFocus(dpad_x);
            }
            dpad_x_pressed = dpad_x !== 0;
        }
    }

    if (state.gameRunning) {
        // Movimiento Serpiente (Palanca)
        const axis_y = gp.axes[1];
        const axis_x = gp.axes[0];
        if (Math.abs(axis_y) > 0.7) doChangeDirection(axis_y < 0 ? 'up' : 'down');
        else if (Math.abs(axis_x) > 0.7) doChangeDirection(axis_x < 0 ? 'left' : 'right');

        // Movimiento Serpiente (D-Pad / Flechitas)
        if (gp.buttons[12].pressed) doChangeDirection('up');
        else if (gp.buttons[13].pressed) doChangeDirection('down');
        else if (gp.buttons[14].pressed) doChangeDirection('left');
        else if (gp.buttons[15].pressed) doChangeDirection('right');
    }
}

function gamepadLoop() {
    handleGamepadInput();
    gamepadAnimationId = requestAnimationFrame(gamepadLoop);
}

function setupGamepadListeners() {
    window.addEventListener('gamepadconnected', (e) => {
        state.setGamepad(e.gamepad);
        // Añadido: Ignorar si el botón ya está presionado al conectar
        if ((e.gamepad.buttons[0] && e.gamepad.buttons[0].pressed) ||
            (e.gamepad.buttons[2] && e.gamepad.buttons[2].pressed)) {
            action_button_pressed = true;
        }
        // Mostrar foco si no está corriendo el juego
        if (!state.gameRunning && focusableElements.length > 0) {
            updateFocus(0); // Mostrar foco en el primer elemento
        }
        requestAnimationFrame(gamepadLoop);
    });
    window.addEventListener('gamepaddisconnected', (e) => {
        state.setGamepad(null);
        hideFocus();
        if (gamepadAnimationId) {
            cancelAnimationFrame(gamepadAnimationId);
            gamepadAnimationId = null;
        }
    });
}

function setupKeyboardListeners() {
    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();

        // Si el modal de logros está abierto, manejar navegación del contador
        if (!document.getElementById('achievements-overlay').classList.contains('hidden')) {
            if (key === 'arrowleft' || key === 'a') {
                event.preventDefault();
                moveCounter(-1);
                return;
            }
            if (key === 'arrowright' || key === 'd') {
                event.preventDefault();
                moveCounter(1);
                return;
            }
        }

        // Navegación normal del juego
        if (key === 'arrowup' || key === 'w') doChangeDirection('up');
        if (key === 'arrowdown' || key === 's') doChangeDirection('down');
        if (key === 'arrowleft' || key === 'a') doChangeDirection('left');
        if (key === 'arrowright' || key === 'd') doChangeDirection('right');
    });
}

// Función para mover el contador (usa la función global de main.js)
function moveCounter(direction) {
    if (window.moveCounter) {
        window.moveCounter(direction);
    }
}

export function setupAllInputs() {
    setupGamepadListeners();
    setupKeyboardListeners();
}