import { GRID_SIZE } from './config.js';
import * as state from './state.js';
import { canvas, ctx, scoreElement, recordElement } from './ui.js';

export function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.snake.forEach((part, index) => {
        if (state.elegantSuitEquipped) {
            drawElegantSuitSegment(part, index);
        } else {
            ctx.fillStyle = '#2ecc71';
            ctx.strokeStyle = '#27ae60';
            ctx.fillRect(part.x, part.y, GRID_SIZE, GRID_SIZE);
            ctx.strokeRect(part.x, part.y, GRID_SIZE, GRID_SIZE);
        }

        // Efecto de aura para power-ups activos
        if (Object.values(state.activePowerUps).some(pu => pu.active)) {
            drawPowerUpAura(part);
        }

        if (index === 0) {
            drawHeadFeatures(part);
        }
    });
    // Dibujar comida
    if (state.food.isPowerUp) {
        // Comida especial con power-up
        const powerUpType = state.food.powerUpType;
        if (powerUpType === 'speed') {
            ctx.fillStyle = '#f39c12'; // Naranja para velocidad
            ctx.strokeStyle = '#e67e22';
        } else if (powerUpType === 'invincibility') {
            ctx.fillStyle = '#9b59b6'; // Morado para invencibilidad
            ctx.strokeStyle = '#8e44ad';
        }

        // Dibujar con efecto pulsante
        const time = Date.now() * 0.005;
        const scale = 1 + Math.sin(time) * 0.2;
        const offset = (GRID_SIZE * (1 - scale)) / 2;

        ctx.save();
        ctx.translate(state.food.x + offset, state.food.y + offset);
        ctx.scale(scale, scale);
        ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
        ctx.strokeRect(0, 0, GRID_SIZE, GRID_SIZE);
        ctx.restore();

        // Efecto de brillo
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(state.food.x - 2, state.food.y - 2, GRID_SIZE + 4, GRID_SIZE + 4);
        ctx.restore();
    } else {
        // Comida normal
        ctx.fillStyle = '#e74c3c';
        ctx.strokeStyle = '#c0392b';
        ctx.fillRect(state.food.x, state.food.y, GRID_SIZE, GRID_SIZE);
        ctx.strokeRect(state.food.x, state.food.y, GRID_SIZE, GRID_SIZE);
    }
}

function drawHeadFeatures(head) {
    const eyeSize = GRID_SIZE / 5;
    ctx.fillStyle = 'black';
    ctx.fillRect(head.x + (GRID_SIZE / 4), head.y + (GRID_SIZE / 4), eyeSize, eyeSize);
    ctx.fillRect(head.x + GRID_SIZE - (GRID_SIZE / 4) - eyeSize, head.y + (GRID_SIZE / 4), eyeSize, eyeSize);
    
    if(state.gameRunning) {
        ctx.fillStyle = '#e74c3c';
        const tongueWidth = GRID_SIZE / 5, tongueLength = GRID_SIZE / 2;
        switch (state.direction) {
            case 'right': ctx.fillRect(head.x + GRID_SIZE, head.y + (GRID_SIZE - tongueWidth) / 2, tongueLength, tongueWidth); break;
            case 'left': ctx.fillRect(head.x - tongueLength, head.y + (GRID_SIZE - tongueWidth) / 2, tongueLength, tongueWidth); break;
            case 'up': ctx.fillRect(head.x + (GRID_SIZE - tongueWidth) / 2, head.y - tongueLength, tongueWidth, tongueLength); break;
            case 'down': ctx.fillRect(head.x + (GRID_SIZE - tongueWidth) / 2, head.y + GRID_SIZE, tongueWidth, tongueLength); break;
        }
    }
}

export function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px "Poppins"';
    ctx.textAlign = 'center';
    ctx.fillText('¡Juego Terminado!', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '20px "Poppins"';
    ctx.fillText(`Puntuación: ${state.score}`, canvas.width / 2, canvas.height / 2);

    if (state.score > state.record) {
        state.setRecord(state.score);
        localStorage.setItem('snakeRecord', state.record);
        recordElement.textContent = state.record;
        ctx.fillStyle = '#f1c40f';
        ctx.fillText('¡Nuevo Récord!', canvas.width / 2, canvas.height / 2 + 40);
    }
}

export function drawStartScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '22px "Poppins"';
    ctx.textAlign = 'center';
    ctx.fillText('Presiona "Empezar" para jugar', canvas.width / 2, canvas.height / 2);
}

function drawElegantSuitSegment(part, index) {
    const progress = state.elegantSuitProgress;
    const totalSegments = state.snake.length;
    const segmentThreshold = (index + 1) / totalSegments;

    if (segmentThreshold > progress) {
        // Sin traje aún, dibujar normal
        ctx.fillStyle = '#2ecc71';
        ctx.strokeStyle = '#27ae60';
        ctx.fillRect(part.x, part.y, GRID_SIZE, GRID_SIZE);
        ctx.strokeRect(part.x, part.y, GRID_SIZE, GRID_SIZE);
        return;
    }

    // Dibujar traje elegante
    ctx.save();
    ctx.globalAlpha = 1; // Completamente visible una vez que aparece

    if (index === 0) {
        // Cabeza: sombrero elegante
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#333333';
        ctx.fillRect(part.x, part.y, GRID_SIZE, GRID_SIZE);
        ctx.strokeRect(part.x, part.y, GRID_SIZE, GRID_SIZE);

        // Sombrero
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#333333';
        ctx.fillRect(part.x, part.y - GRID_SIZE / 4, GRID_SIZE, GRID_SIZE / 4);
        ctx.strokeRect(part.x, part.y - GRID_SIZE / 4, GRID_SIZE, GRID_SIZE / 4);
    } else if (index === 1) {
        // Corbata blanca
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#CCCCCC';
        ctx.fillRect(part.x, part.y, GRID_SIZE, GRID_SIZE);
        ctx.strokeRect(part.x, part.y, GRID_SIZE, GRID_SIZE);

        // Corbata negra
        ctx.fillStyle = '#000000';
        ctx.fillRect(part.x + GRID_SIZE / 2 - 2, part.y, 4, GRID_SIZE);
    } else if (index <= 5) {
        // Chaqueta negra con botones
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#333333';
        ctx.fillRect(part.x, part.y, GRID_SIZE, GRID_SIZE);
        ctx.strokeRect(part.x, part.y, GRID_SIZE, GRID_SIZE);

        // Botones dorados
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(part.x + GRID_SIZE / 2 - 1, part.y + GRID_SIZE / 4, 2, 2);
        ctx.fillRect(part.x + GRID_SIZE / 2 - 1, part.y + 3 * GRID_SIZE / 4, 2, 2);
    } else if (index <= totalSegments - 3) {
        // Chaqueta repetida para cuerpo largo
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#333333';
        ctx.fillRect(part.x, part.y, GRID_SIZE, GRID_SIZE);
        ctx.strokeRect(part.x, part.y, GRID_SIZE, GRID_SIZE);

        // Patrón repetido de botones
        if (index % 3 === 0) {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(part.x + GRID_SIZE / 2 - 1, part.y + GRID_SIZE / 2, 2, 2);
        }
    } else {
        // Zapatos al final
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#333333';
        ctx.fillRect(part.x, part.y, GRID_SIZE, GRID_SIZE);
        ctx.strokeRect(part.x, part.y, GRID_SIZE, GRID_SIZE);

        // Detalles de zapatos
        ctx.fillStyle = '#8B4513'; // Marrón para suela
        ctx.fillRect(part.x, part.y + GRID_SIZE - 2, GRID_SIZE, 2);
        ctx.fillStyle = '#FFD700'; // Hebilla dorada
        ctx.fillRect(part.x + GRID_SIZE / 2 - 1, part.y + GRID_SIZE / 2, 2, 2);
    }

    ctx.restore();
}

function drawPowerUpAura(part) {
    const time = Date.now() * 0.01;
    const glowSize = 6 + Math.sin(time) * 2;

    ctx.save();
    ctx.globalAlpha = 0.6;

    // Aura blanca pulsante
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(part.x - glowSize/2, part.y - glowSize/2, GRID_SIZE + glowSize, GRID_SIZE + glowSize);

    // Aura coloreada según el power-up
    if (state.activePowerUps.speed.active) {
        ctx.fillStyle = '#f39c12';
    } else if (state.activePowerUps.invincibility.active) {
        ctx.fillStyle = '#9b59b6';
    }

    ctx.globalAlpha = 0.4;
    ctx.fillRect(part.x - glowSize/4, part.y - glowSize/4, GRID_SIZE + glowSize/2, GRID_SIZE + glowSize/2);

    ctx.restore();
}
