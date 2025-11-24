import { useState, useRef, useEffect, useMemo } from 'react';
import type { ParticipanteResponseDTO } from '../types';
import { useInscribirse, useDesinscribirse } from '../hooks/useParticipantes';
import { toast } from '../utils/toast';
import type { ParticipanteFormData } from '../utils/validators';
import type { Posicion, Nivel } from '../types';

interface CanchaVisualizationProps {
  participantes: ParticipanteResponseDTO[];
  partidoId: number;
  maxJugadores: number;
  canInscribirse: boolean;
}

interface PlayerPosition {
  id: number | string;
  x: number;
  y: number;
  nombre: string;
  isCurrentUser?: boolean;
  equipo?: 1 | 2; // Equipo 1 o 2
}

interface PlaceholderPosition {
  id: string;
  x: number;
  y: number;
  equipo: 1 | 2;
  fila: number; // Fila en la formación (0 = portero, 1 = defensa, 2 = mediocampo, 3 = delantero)
}

interface Formation {
  name: string;
  label: string;
  positions: { equipo: 1 | 2; x: number; y: number; fila: number }[];
}

// Colores de los equipos - más modernos y sutiles
const EQUIPO_1_COLOR = '#2563eb'; // Azul más suave
const EQUIPO_2_COLOR = '#dc2626'; // Rojo más suave
const PLACEHOLDER_COLOR = '#9ca3af'; // Gris para placeholders
const PLACEHOLDER_BORDER_COLOR = '#6b7280'; // Gris más oscuro para borde

// Genera un nombre aleatorio para el usuario si no tiene uno
const generateRandomName = (existingNames: string[] = []): string => {
  const nombres = ['Jugador', 'Futbolista', 'Estrella', 'Crack', 'Goleador', 'Máquina', 'Leyenda'];
  const apellidos = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  let nombre: string;
  let intentos = 0;
  do {
    const nombreBase = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
    nombre = `${nombreBase} ${apellido}`;
    intentos++;
    // Si después de 50 intentos no encontramos uno único, agregamos un timestamp
    if (intentos > 50) {
      nombre = `${nombreBase} ${Date.now()}`;
      break;
    }
  } while (existingNames.includes(nombre));
  return nombre;
};

// Obtiene el color según el equipo
const getColorByEquipo = (equipo: 1 | 2): string => {
  return equipo === 1 ? EQUIPO_1_COLOR : EQUIPO_2_COLOR;
};

// Genera formaciones según la cantidad de jugadores por equipo
const generateFormations = (jugadoresPorEquipo: number): Formation[] => {
  const formations: Formation[] = [];

  // Formaciones comunes según cantidad de jugadores
  if (jugadoresPorEquipo === 5) {
    // 5 vs 5: 1-2-1-1 (Portero, 2 defensas, 1 mediocampista, 1 delantero)
    formations.push({
      name: '1-2-1-1',
      label: '1-2-1-1',
      positions: [
        // Equipo 1 (izquierda)
        { equipo: 1, x: 8, y: 50, fila: 0 }, // Portero
        { equipo: 1, x: 20, y: 35, fila: 1 }, // Defensa 1
        { equipo: 1, x: 20, y: 65, fila: 1 }, // Defensa 2
        { equipo: 1, x: 35, y: 50, fila: 2 }, // Mediocampista
        { equipo: 1, x: 45, y: 50, fila: 3 }, // Delantero
        // Equipo 2 (derecha)
        { equipo: 2, x: 92, y: 50, fila: 0 }, // Portero
        { equipo: 2, x: 80, y: 35, fila: 1 }, // Defensa 1
        { equipo: 2, x: 80, y: 65, fila: 1 }, // Defensa 2
        { equipo: 2, x: 65, y: 50, fila: 2 }, // Mediocampista
        { equipo: 2, x: 55, y: 50, fila: 3 }, // Delantero
      ],
    });
    // 5 vs 5: 1-1-2-1 (Portero, 1 defensa, 2 mediocampistas, 1 delantero)
    formations.push({
      name: '1-1-2-1',
      label: '1-1-2-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 50, fila: 1 },
        { equipo: 1, x: 32, y: 40, fila: 2 },
        { equipo: 1, x: 32, y: 60, fila: 2 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 50, fila: 1 },
        { equipo: 2, x: 68, y: 40, fila: 2 },
        { equipo: 2, x: 68, y: 60, fila: 2 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
      ],
    });
  } else if (jugadoresPorEquipo === 6) {
    // 6 vs 6: 1-2-2-1
    formations.push({
      name: '1-2-2-1',
      label: '1-2-2-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 35, fila: 1 },
        { equipo: 1, x: 20, y: 65, fila: 1 },
        { equipo: 1, x: 35, y: 40, fila: 2 },
        { equipo: 1, x: 35, y: 60, fila: 2 },
        { equipo: 1, x: 42, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 35, fila: 1 },
        { equipo: 2, x: 80, y: 65, fila: 1 },
        { equipo: 2, x: 65, y: 40, fila: 2 },
        { equipo: 2, x: 65, y: 60, fila: 2 },
        { equipo: 2, x: 58, y: 50, fila: 3 },
      ],
    });
    // 6 vs 6: 1-3-1-1
    formations.push({
      name: '1-3-1-1',
      label: '1-3-1-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 30, fila: 1 },
        { equipo: 1, x: 20, y: 50, fila: 1 },
        { equipo: 1, x: 20, y: 70, fila: 1 },
        { equipo: 1, x: 35, y: 50, fila: 2 },
        { equipo: 1, x: 42, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 30, fila: 1 },
        { equipo: 2, x: 80, y: 50, fila: 1 },
        { equipo: 2, x: 80, y: 70, fila: 1 },
        { equipo: 2, x: 65, y: 50, fila: 2 },
        { equipo: 2, x: 58, y: 50, fila: 3 },
      ],
    });
  } else if (jugadoresPorEquipo === 7) {
    // 7 vs 7: 1-3-2-1
    formations.push({
      name: '1-3-2-1',
      label: '1-3-2-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 30, fila: 1 },
        { equipo: 1, x: 20, y: 50, fila: 1 },
        { equipo: 1, x: 20, y: 70, fila: 1 },
        { equipo: 1, x: 35, y: 40, fila: 2 },
        { equipo: 1, x: 35, y: 60, fila: 2 },
        { equipo: 1, x: 42, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 30, fila: 1 },
        { equipo: 2, x: 80, y: 50, fila: 1 },
        { equipo: 2, x: 80, y: 70, fila: 1 },
        { equipo: 2, x: 65, y: 40, fila: 2 },
        { equipo: 2, x: 65, y: 60, fila: 2 },
        { equipo: 2, x: 58, y: 50, fila: 3 },
      ],
    });
    // 7 vs 7: 1-2-3-1
    formations.push({
      name: '1-2-3-1',
      label: '1-2-3-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 40, fila: 1 },
        { equipo: 1, x: 20, y: 60, fila: 1 },
        { equipo: 1, x: 35, y: 30, fila: 2 },
        { equipo: 1, x: 35, y: 50, fila: 2 },
        { equipo: 1, x: 35, y: 70, fila: 2 },
        { equipo: 1, x: 42, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 40, fila: 1 },
        { equipo: 2, x: 80, y: 60, fila: 1 },
        { equipo: 2, x: 65, y: 30, fila: 2 },
        { equipo: 2, x: 65, y: 50, fila: 2 },
        { equipo: 2, x: 65, y: 70, fila: 2 },
        { equipo: 2, x: 58, y: 50, fila: 3 },
      ],
    });
    // 7 vs 7: 1-4-1-1
    formations.push({
      name: '1-4-1-1',
      label: '1-4-1-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 25, fila: 1 },
        { equipo: 1, x: 20, y: 40, fila: 1 },
        { equipo: 1, x: 20, y: 60, fila: 1 },
        { equipo: 1, x: 20, y: 75, fila: 1 },
        { equipo: 1, x: 35, y: 50, fila: 2 },
        { equipo: 1, x: 42, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 25, fila: 1 },
        { equipo: 2, x: 80, y: 40, fila: 1 },
        { equipo: 2, x: 80, y: 60, fila: 1 },
        { equipo: 2, x: 80, y: 75, fila: 1 },
        { equipo: 2, x: 65, y: 50, fila: 2 },
        { equipo: 2, x: 58, y: 50, fila: 3 },
      ],
    });
  } else if (jugadoresPorEquipo === 8) {
    // 8 vs 8: 1-3-3-1
    formations.push({
      name: '1-3-3-1',
      label: '1-3-3-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 30, fila: 1 },
        { equipo: 1, x: 20, y: 50, fila: 1 },
        { equipo: 1, x: 20, y: 70, fila: 1 },
        { equipo: 1, x: 35, y: 30, fila: 2 },
        { equipo: 1, x: 35, y: 50, fila: 2 },
        { equipo: 1, x: 35, y: 70, fila: 2 },
        { equipo: 1, x: 42, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 30, fila: 1 },
        { equipo: 2, x: 80, y: 50, fila: 1 },
        { equipo: 2, x: 80, y: 70, fila: 1 },
        { equipo: 2, x: 65, y: 30, fila: 2 },
        { equipo: 2, x: 65, y: 50, fila: 2 },
        { equipo: 2, x: 65, y: 70, fila: 2 },
        { equipo: 2, x: 58, y: 50, fila: 3 },
      ],
    });
    // 8 vs 8: 1-4-2-1
    formations.push({
      name: '1-4-2-1',
      label: '1-4-2-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 25, fila: 1 },
        { equipo: 1, x: 20, y: 40, fila: 1 },
        { equipo: 1, x: 20, y: 60, fila: 1 },
        { equipo: 1, x: 20, y: 75, fila: 1 },
        { equipo: 1, x: 35, y: 40, fila: 2 },
        { equipo: 1, x: 35, y: 60, fila: 2 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 25, fila: 1 },
        { equipo: 2, x: 80, y: 40, fila: 1 },
        { equipo: 2, x: 80, y: 60, fila: 1 },
        { equipo: 2, x: 80, y: 75, fila: 1 },
        { equipo: 2, x: 65, y: 40, fila: 2 },
        { equipo: 2, x: 65, y: 60, fila: 2 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
      ],
    });
    // 8 vs 8: 1-2-4-1
    formations.push({
      name: '1-2-4-1',
      label: '1-2-4-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 40, fila: 1 },
        { equipo: 1, x: 20, y: 60, fila: 1 },
        { equipo: 1, x: 32, y: 25, fila: 2 },
        { equipo: 1, x: 32, y: 40, fila: 2 },
        { equipo: 1, x: 32, y: 60, fila: 2 },
        { equipo: 1, x: 32, y: 75, fila: 2 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 40, fila: 1 },
        { equipo: 2, x: 80, y: 60, fila: 1 },
        { equipo: 2, x: 68, y: 25, fila: 2 },
        { equipo: 2, x: 68, y: 40, fila: 2 },
        { equipo: 2, x: 68, y: 60, fila: 2 },
        { equipo: 2, x: 68, y: 75, fila: 2 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
      ],
    });
    // 8 vs 8: 1-5-1-1
    formations.push({
      name: '1-5-1-1',
      label: '1-5-1-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 20, fila: 1 },
        { equipo: 1, x: 20, y: 35, fila: 1 },
        { equipo: 1, x: 20, y: 50, fila: 1 },
        { equipo: 1, x: 20, y: 65, fila: 1 },
        { equipo: 1, x: 20, y: 80, fila: 1 },
        { equipo: 1, x: 35, y: 50, fila: 2 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 20, fila: 1 },
        { equipo: 2, x: 80, y: 35, fila: 1 },
        { equipo: 2, x: 80, y: 50, fila: 1 },
        { equipo: 2, x: 80, y: 65, fila: 1 },
        { equipo: 2, x: 80, y: 80, fila: 1 },
        { equipo: 2, x: 65, y: 50, fila: 2 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
      ],
    });
  } else if (jugadoresPorEquipo === 9) {
    // 9 vs 9: 1-4-3-1
    formations.push({
      name: '1-4-3-1',
      label: '1-4-3-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 25, fila: 1 },
        { equipo: 1, x: 20, y: 40, fila: 1 },
        { equipo: 1, x: 20, y: 60, fila: 1 },
        { equipo: 1, x: 20, y: 75, fila: 1 },
        { equipo: 1, x: 35, y: 30, fila: 2 },
        { equipo: 1, x: 35, y: 50, fila: 2 },
        { equipo: 1, x: 35, y: 70, fila: 2 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 25, fila: 1 },
        { equipo: 2, x: 80, y: 40, fila: 1 },
        { equipo: 2, x: 80, y: 60, fila: 1 },
        { equipo: 2, x: 80, y: 75, fila: 1 },
        { equipo: 2, x: 65, y: 30, fila: 2 },
        { equipo: 2, x: 65, y: 50, fila: 2 },
        { equipo: 2, x: 65, y: 70, fila: 2 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
      ],
    });
    // 9 vs 9: 1-3-4-1
    formations.push({
      name: '1-3-4-1',
      label: '1-3-4-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 30, fila: 1 },
        { equipo: 1, x: 20, y: 50, fila: 1 },
        { equipo: 1, x: 20, y: 70, fila: 1 },
        { equipo: 1, x: 35, y: 25, fila: 2 },
        { equipo: 1, x: 35, y: 40, fila: 2 },
        { equipo: 1, x: 35, y: 60, fila: 2 },
        { equipo: 1, x: 35, y: 75, fila: 2 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 30, fila: 1 },
        { equipo: 2, x: 80, y: 50, fila: 1 },
        { equipo: 2, x: 80, y: 70, fila: 1 },
        { equipo: 2, x: 65, y: 25, fila: 2 },
        { equipo: 2, x: 65, y: 40, fila: 2 },
        { equipo: 2, x: 65, y: 60, fila: 2 },
        { equipo: 2, x: 65, y: 75, fila: 2 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
      ],
    });
    // 9 vs 9: 1-4-2-2
    formations.push({
      name: '1-4-2-2',
      label: '1-4-2-2',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 25, fila: 1 },
        { equipo: 1, x: 20, y: 40, fila: 1 },
        { equipo: 1, x: 20, y: 60, fila: 1 },
        { equipo: 1, x: 20, y: 75, fila: 1 },
        { equipo: 1, x: 35, y: 40, fila: 2 },
        { equipo: 1, x: 35, y: 60, fila: 2 },
        { equipo: 1, x: 42, y: 40, fila: 3 },
        { equipo: 1, x: 42, y: 60, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 25, fila: 1 },
        { equipo: 2, x: 80, y: 40, fila: 1 },
        { equipo: 2, x: 80, y: 60, fila: 1 },
        { equipo: 2, x: 80, y: 75, fila: 1 },
        { equipo: 2, x: 65, y: 40, fila: 2 },
        { equipo: 2, x: 65, y: 60, fila: 2 },
        { equipo: 2, x: 58, y: 40, fila: 3 },
        { equipo: 2, x: 58, y: 60, fila: 3 },
      ],
    });
    // 9 vs 9: 1-5-2-1
    formations.push({
      name: '1-5-2-1',
      label: '1-5-2-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 20, fila: 1 },
        { equipo: 1, x: 20, y: 35, fila: 1 },
        { equipo: 1, x: 20, y: 50, fila: 1 },
        { equipo: 1, x: 20, y: 65, fila: 1 },
        { equipo: 1, x: 20, y: 80, fila: 1 },
        { equipo: 1, x: 35, y: 40, fila: 2 },
        { equipo: 1, x: 35, y: 60, fila: 2 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 20, fila: 1 },
        { equipo: 2, x: 80, y: 35, fila: 1 },
        { equipo: 2, x: 80, y: 50, fila: 1 },
        { equipo: 2, x: 80, y: 65, fila: 1 },
        { equipo: 2, x: 80, y: 80, fila: 1 },
        { equipo: 2, x: 65, y: 40, fila: 2 },
        { equipo: 2, x: 65, y: 60, fila: 2 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
      ],
    });
  } else if (jugadoresPorEquipo === 10) {
    // 10 vs 10: 1-4-4-1
    formations.push({
      name: '1-4-4-1',
      label: '1-4-4-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 25, fila: 1 },
        { equipo: 1, x: 20, y: 40, fila: 1 },
        { equipo: 1, x: 20, y: 60, fila: 1 },
        { equipo: 1, x: 20, y: 75, fila: 1 },
        { equipo: 1, x: 35, y: 25, fila: 2 },
        { equipo: 1, x: 35, y: 40, fila: 2 },
        { equipo: 1, x: 35, y: 60, fila: 2 },
        { equipo: 1, x: 35, y: 75, fila: 2 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 25, fila: 1 },
        { equipo: 2, x: 80, y: 40, fila: 1 },
        { equipo: 2, x: 80, y: 60, fila: 1 },
        { equipo: 2, x: 80, y: 75, fila: 1 },
        { equipo: 2, x: 65, y: 25, fila: 2 },
        { equipo: 2, x: 65, y: 40, fila: 2 },
        { equipo: 2, x: 65, y: 60, fila: 2 },
        { equipo: 2, x: 65, y: 75, fila: 2 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
      ],
    });
    // 10 vs 10: 1-4-3-2
    formations.push({
      name: '1-4-3-2',
      label: '1-4-3-2',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 25, fila: 1 },
        { equipo: 1, x: 20, y: 40, fila: 1 },
        { equipo: 1, x: 20, y: 60, fila: 1 },
        { equipo: 1, x: 20, y: 75, fila: 1 },
        { equipo: 1, x: 35, y: 30, fila: 2 },
        { equipo: 1, x: 35, y: 50, fila: 2 },
        { equipo: 1, x: 35, y: 70, fila: 2 },
        { equipo: 1, x: 42, y: 40, fila: 3 },
        { equipo: 1, x: 42, y: 60, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 25, fila: 1 },
        { equipo: 2, x: 80, y: 40, fila: 1 },
        { equipo: 2, x: 80, y: 60, fila: 1 },
        { equipo: 2, x: 80, y: 75, fila: 1 },
        { equipo: 2, x: 65, y: 30, fila: 2 },
        { equipo: 2, x: 65, y: 50, fila: 2 },
        { equipo: 2, x: 65, y: 70, fila: 2 },
        { equipo: 2, x: 58, y: 40, fila: 3 },
        { equipo: 2, x: 58, y: 60, fila: 3 },
      ],
    });
    // 10 vs 10: 1-3-4-2
    formations.push({
      name: '1-3-4-2',
      label: '1-3-4-2',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 30, fila: 1 },
        { equipo: 1, x: 20, y: 50, fila: 1 },
        { equipo: 1, x: 20, y: 70, fila: 1 },
        { equipo: 1, x: 35, y: 25, fila: 2 },
        { equipo: 1, x: 35, y: 40, fila: 2 },
        { equipo: 1, x: 35, y: 60, fila: 2 },
        { equipo: 1, x: 35, y: 75, fila: 2 },
        { equipo: 1, x: 42, y: 40, fila: 3 },
        { equipo: 1, x: 42, y: 60, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 30, fila: 1 },
        { equipo: 2, x: 80, y: 50, fila: 1 },
        { equipo: 2, x: 80, y: 70, fila: 1 },
        { equipo: 2, x: 65, y: 25, fila: 2 },
        { equipo: 2, x: 65, y: 40, fila: 2 },
        { equipo: 2, x: 65, y: 60, fila: 2 },
        { equipo: 2, x: 65, y: 75, fila: 2 },
        { equipo: 2, x: 58, y: 40, fila: 3 },
        { equipo: 2, x: 58, y: 60, fila: 3 },
      ],
    });
    // 10 vs 10: 1-5-3-1
    formations.push({
      name: '1-5-3-1',
      label: '1-5-3-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 20, fila: 1 },
        { equipo: 1, x: 20, y: 35, fila: 1 },
        { equipo: 1, x: 20, y: 50, fila: 1 },
        { equipo: 1, x: 20, y: 65, fila: 1 },
        { equipo: 1, x: 20, y: 80, fila: 1 },
        { equipo: 1, x: 35, y: 30, fila: 2 },
        { equipo: 1, x: 35, y: 50, fila: 2 },
        { equipo: 1, x: 35, y: 70, fila: 2 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 20, fila: 1 },
        { equipo: 2, x: 80, y: 35, fila: 1 },
        { equipo: 2, x: 80, y: 50, fila: 1 },
        { equipo: 2, x: 80, y: 65, fila: 1 },
        { equipo: 2, x: 80, y: 80, fila: 1 },
        { equipo: 2, x: 65, y: 30, fila: 2 },
        { equipo: 2, x: 65, y: 50, fila: 2 },
        { equipo: 2, x: 65, y: 70, fila: 2 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
      ],
    });
  } else if (jugadoresPorEquipo === 11) {
    // 11 vs 11: 1-4-4-2 (clásica)
    formations.push({
      name: '1-4-4-2',
      label: '1-4-4-2',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 25, fila: 1 },
        { equipo: 1, x: 20, y: 40, fila: 1 },
        { equipo: 1, x: 20, y: 60, fila: 1 },
        { equipo: 1, x: 20, y: 75, fila: 1 },
        { equipo: 1, x: 35, y: 25, fila: 2 },
        { equipo: 1, x: 35, y: 40, fila: 2 },
        { equipo: 1, x: 35, y: 60, fila: 2 },
        { equipo: 1, x: 35, y: 75, fila: 2 },
        { equipo: 1, x: 50, y: 40, fila: 3 },
        { equipo: 1, x: 50, y: 60, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 25, fila: 1 },
        { equipo: 2, x: 80, y: 40, fila: 1 },
        { equipo: 2, x: 80, y: 60, fila: 1 },
        { equipo: 2, x: 80, y: 75, fila: 1 },
        { equipo: 2, x: 65, y: 25, fila: 2 },
        { equipo: 2, x: 65, y: 40, fila: 2 },
        { equipo: 2, x: 65, y: 60, fila: 2 },
        { equipo: 2, x: 65, y: 75, fila: 2 },
        { equipo: 2, x: 50, y: 40, fila: 3 },
        { equipo: 2, x: 50, y: 60, fila: 3 },
      ],
    });
    // 11 vs 11: 1-4-3-3
    formations.push({
      name: '1-4-3-3',
      label: '1-4-3-3',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 25, fila: 1 },
        { equipo: 1, x: 20, y: 40, fila: 1 },
        { equipo: 1, x: 20, y: 60, fila: 1 },
        { equipo: 1, x: 20, y: 75, fila: 1 },
        { equipo: 1, x: 35, y: 30, fila: 2 },
        { equipo: 1, x: 35, y: 50, fila: 2 },
        { equipo: 1, x: 35, y: 70, fila: 2 },
        { equipo: 1, x: 42, y: 30, fila: 3 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 1, x: 42, y: 70, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 25, fila: 1 },
        { equipo: 2, x: 80, y: 40, fila: 1 },
        { equipo: 2, x: 80, y: 60, fila: 1 },
        { equipo: 2, x: 80, y: 75, fila: 1 },
        { equipo: 2, x: 65, y: 30, fila: 2 },
        { equipo: 2, x: 65, y: 50, fila: 2 },
        { equipo: 2, x: 65, y: 70, fila: 2 },
        { equipo: 2, x: 58, y: 30, fila: 3 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
        { equipo: 2, x: 58, y: 70, fila: 3 },
      ],
    });
    // 11 vs 11: 1-3-5-2
    formations.push({
      name: '1-3-5-2',
      label: '1-3-5-2',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 30, fila: 1 },
        { equipo: 1, x: 20, y: 50, fila: 1 },
        { equipo: 1, x: 20, y: 70, fila: 1 },
        { equipo: 1, x: 35, y: 20, fila: 2 },
        { equipo: 1, x: 35, y: 35, fila: 2 },
        { equipo: 1, x: 35, y: 50, fila: 2 },
        { equipo: 1, x: 35, y: 65, fila: 2 },
        { equipo: 1, x: 35, y: 80, fila: 2 },
        { equipo: 1, x: 50, y: 40, fila: 3 },
        { equipo: 1, x: 50, y: 60, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 30, fila: 1 },
        { equipo: 2, x: 80, y: 50, fila: 1 },
        { equipo: 2, x: 80, y: 70, fila: 1 },
        { equipo: 2, x: 65, y: 20, fila: 2 },
        { equipo: 2, x: 65, y: 35, fila: 2 },
        { equipo: 2, x: 65, y: 50, fila: 2 },
        { equipo: 2, x: 65, y: 65, fila: 2 },
        { equipo: 2, x: 65, y: 80, fila: 2 },
        { equipo: 2, x: 50, y: 40, fila: 3 },
        { equipo: 2, x: 50, y: 60, fila: 3 },
      ],
    });
    // 11 vs 11: 1-4-1-4-1 (diamante)
    formations.push({
      name: '1-4-1-4-1',
      label: '1-4-1-4-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 25, fila: 1 },
        { equipo: 1, x: 20, y: 40, fila: 1 },
        { equipo: 1, x: 20, y: 60, fila: 1 },
        { equipo: 1, x: 20, y: 75, fila: 1 },
        { equipo: 1, x: 30, y: 50, fila: 2 },
        { equipo: 1, x: 38, y: 30, fila: 2 },
        { equipo: 1, x: 38, y: 45, fila: 2 },
        { equipo: 1, x: 38, y: 55, fila: 2 },
        { equipo: 1, x: 38, y: 70, fila: 2 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 25, fila: 1 },
        { equipo: 2, x: 80, y: 40, fila: 1 },
        { equipo: 2, x: 80, y: 60, fila: 1 },
        { equipo: 2, x: 80, y: 75, fila: 1 },
        { equipo: 2, x: 70, y: 50, fila: 2 },
        { equipo: 2, x: 62, y: 30, fila: 2 },
        { equipo: 2, x: 62, y: 45, fila: 2 },
        { equipo: 2, x: 62, y: 55, fila: 2 },
        { equipo: 2, x: 62, y: 70, fila: 2 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
      ],
    });
    // 11 vs 11: 1-3-4-3
    formations.push({
      name: '1-3-4-3',
      label: '1-3-4-3',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 30, fila: 1 },
        { equipo: 1, x: 20, y: 50, fila: 1 },
        { equipo: 1, x: 20, y: 70, fila: 1 },
        { equipo: 1, x: 35, y: 25, fila: 2 },
        { equipo: 1, x: 35, y: 40, fila: 2 },
        { equipo: 1, x: 35, y: 60, fila: 2 },
        { equipo: 1, x: 35, y: 75, fila: 2 },
        { equipo: 1, x: 42, y: 30, fila: 3 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 1, x: 42, y: 70, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 30, fila: 1 },
        { equipo: 2, x: 80, y: 50, fila: 1 },
        { equipo: 2, x: 80, y: 70, fila: 1 },
        { equipo: 2, x: 65, y: 25, fila: 2 },
        { equipo: 2, x: 65, y: 40, fila: 2 },
        { equipo: 2, x: 65, y: 60, fila: 2 },
        { equipo: 2, x: 65, y: 75, fila: 2 },
        { equipo: 2, x: 58, y: 30, fila: 3 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
        { equipo: 2, x: 58, y: 70, fila: 3 },
      ],
    });
    // 11 vs 11: 1-5-4-1
    formations.push({
      name: '1-5-4-1',
      label: '1-5-4-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 20, fila: 1 },
        { equipo: 1, x: 20, y: 35, fila: 1 },
        { equipo: 1, x: 20, y: 50, fila: 1 },
        { equipo: 1, x: 20, y: 65, fila: 1 },
        { equipo: 1, x: 20, y: 80, fila: 1 },
        { equipo: 1, x: 35, y: 25, fila: 2 },
        { equipo: 1, x: 35, y: 40, fila: 2 },
        { equipo: 1, x: 35, y: 60, fila: 2 },
        { equipo: 1, x: 35, y: 75, fila: 2 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 20, fila: 1 },
        { equipo: 2, x: 80, y: 35, fila: 1 },
        { equipo: 2, x: 80, y: 50, fila: 1 },
        { equipo: 2, x: 80, y: 65, fila: 1 },
        { equipo: 2, x: 80, y: 80, fila: 1 },
        { equipo: 2, x: 65, y: 25, fila: 2 },
        { equipo: 2, x: 65, y: 40, fila: 2 },
        { equipo: 2, x: 65, y: 60, fila: 2 },
        { equipo: 2, x: 65, y: 75, fila: 2 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
      ],
    });
    // 11 vs 11: 1-4-5-1
    formations.push({
      name: '1-4-5-1',
      label: '1-4-5-1',
      positions: [
        { equipo: 1, x: 8, y: 50, fila: 0 },
        { equipo: 1, x: 20, y: 25, fila: 1 },
        { equipo: 1, x: 20, y: 40, fila: 1 },
        { equipo: 1, x: 20, y: 60, fila: 1 },
        { equipo: 1, x: 20, y: 75, fila: 1 },
        { equipo: 1, x: 35, y: 20, fila: 2 },
        { equipo: 1, x: 35, y: 35, fila: 2 },
        { equipo: 1, x: 35, y: 50, fila: 2 },
        { equipo: 1, x: 35, y: 65, fila: 2 },
        { equipo: 1, x: 35, y: 80, fila: 2 },
        { equipo: 1, x: 45, y: 50, fila: 3 },
        { equipo: 2, x: 92, y: 50, fila: 0 },
        { equipo: 2, x: 80, y: 25, fila: 1 },
        { equipo: 2, x: 80, y: 40, fila: 1 },
        { equipo: 2, x: 80, y: 60, fila: 1 },
        { equipo: 2, x: 80, y: 75, fila: 1 },
        { equipo: 2, x: 65, y: 20, fila: 2 },
        { equipo: 2, x: 65, y: 35, fila: 2 },
        { equipo: 2, x: 65, y: 50, fila: 2 },
        { equipo: 2, x: 65, y: 65, fila: 2 },
        { equipo: 2, x: 65, y: 80, fila: 2 },
        { equipo: 2, x: 55, y: 50, fila: 3 },
      ],
    });
  }

  // Si no hay formaciones específicas, crear una distribución básica
  if (formations.length === 0) {
    const positions: { equipo: 1 | 2; x: number; y: number; fila: number }[] = [];
    for (let i = 0; i < jugadoresPorEquipo; i++) {
      const equipo: 1 | 2 = i < jugadoresPorEquipo ? 1 : 2;
      const x = equipo === 1 ? 20 + (i % 4) * 5 : 80 - (i % 4) * 5;
      const y = 20 + Math.floor(i / 4) * 20;
      positions.push({ equipo, x, y, fila: Math.floor(i / 4) });
    }
    formations.push({
      name: 'default',
      label: 'Distribución',
      positions,
    });
  }

  return formations;
};

export const CanchaVisualization = ({
  participantes,
  partidoId,
  maxJugadores,
  canInscribirse,
}: CanchaVisualizationProps) => {
  const [currentUserName] = useState(() => {
    // En una implementación real, esto vendría del sistema de autenticación
    // Por ahora, usamos localStorage o generamos uno aleatorio
    const stored = localStorage.getItem('currentUserName');
    if (stored) return stored;
    const randomName = generateRandomName();
    localStorage.setItem('currentUserName', randomName);
    return randomName;
  });

  const jugadoresPorEquipo = Math.floor(maxJugadores / 2);
  const availableFormations = useMemo(
    () => generateFormations(jugadoresPorEquipo),
    [jugadoresPorEquipo]
  );
  
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<string>(availableFormations[0]?.name || 'default');
  const [placeholderPositions, setPlaceholderPositions] = useState<PlaceholderPosition[]>([]);
  const [pendingPlacement, setPendingPlacement] = useState<Map<string, { x: number; y: number; equipo: 1 | 2 }>>(new Map());
  const [draggedPlayer, setDraggedPlayer] = useState<PlayerPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | string | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<number | string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const canchaRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const inscribirse = useInscribirse();
  const desinscribirse = useDesinscribirse();

  // Actualizar placeholders cuando cambia la formación
  useEffect(() => {
    const formation = availableFormations.find((f) => f.name === selectedFormation);
    if (formation) {
      const placeholders: PlaceholderPosition[] = formation.positions.map((pos, index) => ({
        id: `placeholder-${pos.equipo}-${index}`,
        x: pos.x,
        y: pos.y,
        equipo: pos.equipo,
        fila: pos.fila,
      }));
      setPlaceholderPositions(placeholders);
    }
  }, [selectedFormation, availableFormations]);

  // Inicializar posiciones de jugadores ya inscritos
  useEffect(() => {
    setPlayerPositions((prevPositions) => {
      // Crear un mapa de posiciones existentes para preservar nombres editados
      const existingPositionsMap = new Map(
        prevPositions.map((p) => [p.id, p])
      );

      const formation = availableFormations.find((f) => f.name === selectedFormation);
      
      // Calcular placeholders desde la formación directamente para evitar dependencia circular
      const currentPlaceholders: PlaceholderPosition[] = formation
        ? formation.positions.map((pos, index) => ({
            id: `placeholder-${pos.equipo}-${index}`,
            x: pos.x,
            y: pos.y,
            equipo: pos.equipo,
            fila: pos.fila,
          }))
        : [];

      const positions: PlayerPosition[] = participantes.map((participante, index) => {
        // Verificar si ya existe una posición para este participante
        const existingPosition = existingPositionsMap.get(participante.id);
        
        // Si existe, preservar nombre editado pero actualizar posición si cambió la formación
        if (existingPosition) {
          // Si hay una formación, intentar encontrar el placeholder más cercano para este jugador
          if (formation && currentPlaceholders.length > 0) {
            const equipo: 1 | 2 = (index % 2 === 0) ? 1 : 2;
            const teamPlaceholders = currentPlaceholders.filter((p) => p.equipo === equipo);
            if (teamPlaceholders.length > 0) {
              // Encontrar el placeholder más cercano que no esté ocupado
              let closestPlaceholder: PlaceholderPosition | null = null;
              let minDistance = Infinity;
              
              for (const placeholder of teamPlaceholders) {
                // Verificar si el placeholder está ocupado usando prevPositions
                const isOccupied = prevPositions.some(
                  (p) => p.id !== participante.id && Math.abs(p.x - placeholder.x) < 3 && Math.abs(p.y - placeholder.y) < 3
                );
                if (!isOccupied) {
                  const distance = Math.sqrt(
                    Math.pow(existingPosition.x - placeholder.x, 2) + 
                    Math.pow(existingPosition.y - placeholder.y, 2)
                  );
                  if (distance < minDistance) {
                    minDistance = distance;
                    closestPlaceholder = placeholder;
                  }
                }
              }
              
              if (closestPlaceholder !== null) {
                return {
                  ...existingPosition,
                  x: closestPlaceholder.x,
                  y: closestPlaceholder.y,
                  equipo: closestPlaceholder.equipo,
                };
              }
            }
          }
          return existingPosition;
        }

        // Si no existe, verificar si hay una posición pendiente para este nombre
        const playerName = participante.nombre || participante.apodo || 'Jugador';
        const pendingPos = pendingPlacement.get(playerName);
        
        if (pendingPos) {
          // Usar la posición del placeholder clickeado
          return {
            id: participante.id,
            x: pendingPos.x,
            y: pendingPos.y,
            nombre: playerName,
            equipo: pendingPos.equipo,
          };
        }

        // Si no existe, asignar según la formación o distribución básica
        if (formation && formation.positions.length > 0) {
          const equipo: 1 | 2 = (index % 2 === 0) ? 1 : 2;
          const teamPositions = formation.positions.filter((p) => p.equipo === equipo);
          
          // Validar que hay posiciones disponibles para este equipo
          if (teamPositions.length > 0) {
            const positionIndex = Math.floor(index / 2) % teamPositions.length;
            const formationPos = teamPositions[positionIndex];
            
            // Validar que formationPos existe antes de usarlo
            if (formationPos) {
              return {
                id: participante.id,
                x: formationPos.x,
                y: formationPos.y,
                nombre: playerName,
                equipo: formationPos.equipo,
              };
            }
          }
        }

        // Fallback: distribución básica
        const totalCols = 4;
        const row = Math.floor(index / totalCols);
        const col = index % totalCols;
        const x = (col / totalCols) * 80 + 10;
        const y = (row / 3) * 60 + 20;
        const equipo: 1 | 2 = (index % 2 === 0) ? 1 : 2;
        return {
          id: participante.id,
          x: Math.min(x, 85),
          y: Math.min(y, 75),
          nombre: participante.nombre || participante.apodo || 'Jugador',
          equipo,
        };
      });
      return positions;
    });
  }, [participantes, selectedFormation, availableFormations, pendingPlacement]);

  // Limpiar posiciones pendientes después de que se hayan aplicado
  useEffect(() => {
    if (pendingPlacement.size > 0) {
      const usedNames = participantes.map((p) => p.nombre || p.apodo || '').filter(Boolean);
      setPendingPlacement((prev) => {
        const newMap = new Map(prev);
        usedNames.forEach((name) => {
          if (newMap.has(name)) {
            newMap.delete(name);
          }
        });
        return newMap;
      });
    }
  }, [participantes, pendingPlacement]);


  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openMenuId]);

  const handleDragStart = (e: React.DragEvent, player: PlayerPosition) => {
    if (!canInscribirse) return;
    setDraggedPlayer(player);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    // Opcional: crear una imagen de arrastre personalizada
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.5';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 20, 20);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handlePlaceholderClick = async (placeholder: PlaceholderPosition) => {
    if (!canInscribirse || participantes.length >= maxJugadores) return;

    // Verificar si ya hay un jugador en esta posición
    const existingPlayer = playerPositions.find(
      (p) => Math.abs(p.x - placeholder.x) < 3 && Math.abs(p.y - placeholder.y) < 3
    );
    if (existingPlayer) return;

    // Generar nombre único
    const existingNames = [
      ...participantes.map((p) => p.nombre || p.apodo || ''),
      ...playerPositions.map((p) => p.nombre),
    ].filter(Boolean);

    const playerName = generateRandomName(existingNames);

    // Guardar la posición del placeholder para este jugador
    setPendingPlacement((prev) => {
      const newMap = new Map(prev);
      newMap.set(playerName, {
        x: placeholder.x,
        y: placeholder.y,
        equipo: placeholder.equipo,
      });
      return newMap;
    });

    // Inscribir al usuario
    const participanteData: ParticipanteFormData = {
      nombre: playerName,
      apodo: undefined,
    };

    inscribirse.mutate(
      {
        partidoId,
        participante: {
          ...participanteData,
          posicion: undefined as Posicion | undefined,
          nivel: undefined as Nivel | undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(`${playerName} se ha inscrito correctamente al partido`);
        },
        onError: (error: Error) => {
          // Limpiar la posición pendiente si hay error
          setPendingPlacement((prev) => {
            const newMap = new Map(prev);
            newMap.delete(playerName);
            return newMap;
          });
          toast.error(error.message || 'Error al inscribirse');
        },
      }
    );
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPlayer || !canchaRef.current || !canInscribirse) {
      setIsDragging(false);
      setDraggedPlayer(null);
      return;
    }

    const rect = canchaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Buscar el placeholder más cercano
    let closestPlaceholder: PlaceholderPosition | null = null;
    let minDistance = Infinity;

    placeholderPositions.forEach((placeholder) => {
      const distance = Math.sqrt(
        Math.pow(placeholder.x - x, 2) + Math.pow(placeholder.y - y, 2)
      );
      if (distance < minDistance && distance < 8) {
        minDistance = distance;
        closestPlaceholder = placeholder;
      }
    });

    // Si se soltó sobre un placeholder, mover el jugador allí
    if (closestPlaceholder) {
      setPlayerPositions((prev) =>
        prev.map((p) =>
          p.id === draggedPlayer.id
            ? {
                ...p,
                x: closestPlaceholder!.x,
                y: closestPlaceholder!.y,
                equipo: closestPlaceholder!.equipo,
              }
            : p
        )
      );
    } else if (x >= 5 && x <= 95 && y >= 10 && y <= 90) {
      // Si se soltó en la cancha pero no en un placeholder, mover libremente
      setPlayerPositions((prev) =>
        prev.map((p) =>
          p.id === draggedPlayer.id
            ? {
                ...p,
                x: Math.max(5, Math.min(x, 95)),
                y: Math.max(10, Math.min(y, 90)),
              }
            : p
        )
      );
    }

    setIsDragging(false);
    setDraggedPlayer(null);
  };

  const handlePlayerDrag = (e: React.DragEvent, playerId: number | string) => {
    if (!canchaRef.current) return;

    const rect = canchaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Actualizar posición del jugador
    setPlayerPositions((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              x: Math.max(5, Math.min(x, 95)),
              y: Math.max(10, Math.min(y, 90)),
            }
          : p
      )
    );
  };

  const handlePlayerDragEnd = () => {
    setIsDragging(false);
  };

  const handlePlayerClick = (e: React.MouseEvent, playerId: number | string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === playerId ? null : playerId);
  };

  const handleCambiarEquipo = (playerId: number | string) => {
    setPlayerPositions((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? { ...p, equipo: p.equipo === 1 ? 2 : 1 }
          : p
      )
    );
    setOpenMenuId(null);
  };

  const handleEditarNombre = (playerId: number | string) => {
    const player = playerPositions.find((p) => p.id === playerId);
    if (player) {
      setEditingPlayerId(playerId);
      setEditingName(player.nombre);
      // Enfocar el input después de un pequeño delay para que el menú se renderice
      setTimeout(() => {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
      }, 100);
    }
  };

  const handleGuardarNombre = (playerId: number | string) => {
    if (editingName.trim()) {
      setPlayerPositions((prev) =>
        prev.map((p) =>
          p.id === playerId
            ? { ...p, nombre: editingName.trim() }
            : p
        )
      );
      setEditingPlayerId(null);
      setEditingName('');
      toast.success('Nombre actualizado');
    }
  };

  const handleCancelarEdicion = () => {
    setEditingPlayerId(null);
    setEditingName('');
  };

  const handleDesinscribirse = (playerId: number | string) => {
    // No se puede desinscribir si es el usuario actual que aún no está inscrito
    if (playerId === 'current-user') {
      toast.error('No puedes desinscribirte si aún no estás inscrito');
      setOpenMenuId(null);
      return;
    }

    // Buscar el participante
    const participante = participantes.find((p) => p.id === playerId);
    if (!participante) {
      toast.error('Participante no encontrado');
      setOpenMenuId(null);
      return;
    }

    // Confirmar desinscripción
    if (!confirm(`¿Estás seguro de que deseas desinscribir a ${participante.nombre}?`)) {
      setOpenMenuId(null);
      return;
    }

    // Desinscribir usando el hook
    desinscribirse.mutate(
      {
        partidoId,
        participanteId: participante.id,
      },
      {
        onSuccess: () => {
          toast.success(`${participante.nombre} ha sido desinscrito del partido`);
          setOpenMenuId(null);
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Error al desinscribirse');
        },
      }
    );
  };

  return (
    <div className="w-full">
      {/* Header mejorado */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500"></div>
              <span className="text-sm font-medium text-gray-700">
                {participantes.length} / {maxJugadores} jugadores
              </span>
            </div>
            {participantes.length >= maxJugadores && (
              <span className="px-2 py-0.5 bg-warning-100 text-warning-700 text-xs font-medium rounded-full">
                Completo
              </span>
            )}
          </div>
          {availableFormations.length > 1 && (
            <div className="flex items-center gap-2">
              <label htmlFor="formation-select" className="text-sm font-medium text-gray-700">
                Formación:
              </label>
              <select
                id="formation-select"
                value={selectedFormation}
                onChange={(e) => setSelectedFormation(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                {availableFormations.map((formation) => (
                  <option key={formation.name} value={formation.name}>
                    {formation.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {!canInscribirse && participantes.length < maxJugadores && (
          <p className="text-xs text-gray-500">
            El partido no está disponible para inscripción
          </p>
        )}
        {canInscribirse && participantes.length < maxJugadores && (
          <p className="text-xs text-gray-500">
            Haz click en un placeholder vacío para agregar un jugador
          </p>
        )}
      </div>

      <div className="relative">

        {/* Cancha */}
        <div
          ref={canchaRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative w-full bg-gradient-to-br from-green-500 to-green-600 rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden"
          style={{ aspectRatio: '3/2', minHeight: '300px' }}
        >
          {/* Líneas de la cancha - más sutiles */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            {/* Círculo central */}
            <circle
              cx="50%"
              cy="50%"
              r="15%"
              fill="none"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="2"
            />
            {/* Línea central */}
            <line
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="2"
            />
            {/* Área izquierda (área de penalti) */}
            <rect
              x="0%"
              y="25%"
              width="20%"
              height="50%"
              fill="none"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="2"
            />
            {/* Área pequeña izquierda (área de meta) */}
            <rect
              x="0%"
              y="35%"
              width="8%"
              height="30%"
              fill="none"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="2"
            />
            {/* Área derecha (área de penalti) */}
            <rect
              x="80%"
              y="25%"
              width="20%"
              height="50%"
              fill="none"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="2"
            />
            {/* Área pequeña derecha (área de meta) */}
            <rect
              x="92%"
              y="35%"
              width="8%"
              height="30%"
              fill="none"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="2"
            />

          </svg>

          {/* Jugadores en la cancha */}
          {playerPositions.map((player) => {
            const participante = participantes.find((p) => p.id === player.id);
            // Solo mostrar jugadores que están realmente inscritos
            if (!participante) return null;
            
            // Usar el nombre editado si existe, sino el del participante
            const displayName = player.nombre || participante.nombre || participante.apodo || 'Jugador';
            const equipo = player.equipo || 1; // Por defecto equipo 1
            const color = getColorByEquipo(equipo);
            const isMenuOpen = openMenuId === player.id;

            return (
              <div
                key={player.id}
                draggable={!player.isCurrentUser || participantes.some((p) => p.nombre === currentUserName)}
                onDragStart={(e) => {
                  if (participantes.some((p) => p.id === player.id)) {
                    handleDragStart(e, player);
                  }
                }}
                onDrag={(e) => {
                  if (participantes.some((p) => p.id === player.id)) {
                    handlePlayerDrag(e, player.id);
                  }
                }}
                onDragEnd={handlePlayerDragEnd}
                onClick={(e) => handlePlayerClick(e, player.id)}
                className="absolute cursor-pointer group"
                style={{
                  left: `${player.x}%`,
                  top: `${player.y}%`,
                  transform: 'translate(-50%, -50%)',
                  transition: isDragging && draggedPlayer?.id === player.id ? 'none' : 'transform 0.2s ease-out',
                  zIndex: isDragging && draggedPlayer?.id === player.id ? 20 : isMenuOpen ? 15 : 5,
                }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg border-2 border-white/80"
                  style={{ backgroundColor: color }}
                >
                  {displayName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                {/* Tooltip moderno */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                    {displayName}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                
                {/* Menú desplegable moderno */}
                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 min-w-[200px] z-50 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {editingPlayerId === player.id ? (
                      // Modo edición de nombre
                      <div className="px-4 py-2.5">
                        <input
                          ref={nameInputRef}
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleGuardarNombre(player.id);
                            } else if (e.key === 'Escape') {
                              handleCancelarEdicion();
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Nombre del jugador"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleGuardarNombre(player.id)}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-150"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={handleCancelarEdicion}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Modo normal del menú
                      <>
                        <button
                          onClick={() => handleEditarNombre(player.id)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2.5 rounded-lg mx-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Cambiar nombre
                        </button>
                        <div className="h-px bg-gray-200 my-1"></div>
                        <button
                          onClick={() => handleCambiarEquipo(player.id)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2.5 rounded-lg mx-1"
                        >
                          <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: getColorByEquipo(equipo === 1 ? 2 : 1) }}></span>
                          Cambiar a Equipo {equipo === 1 ? 2 : 1}
                        </button>
                        <div className="h-px bg-gray-200 my-1"></div>
                        <button
                          onClick={() => handleDesinscribirse(player.id)}
                          className="w-full text-left px-4 py-2.5 text-sm text-error-600 hover:bg-error-50 transition-colors duration-150 rounded-lg mx-1"
                        >
                          Desinscribirse
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Placeholders vacíos */}
          {canInscribirse && participantes.length < maxJugadores && placeholderPositions.map((placeholder) => {
            // Verificar si hay un jugador en esta posición
            const hasPlayer = playerPositions.some(
              (p) => Math.abs(p.x - placeholder.x) < 3 && Math.abs(p.y - placeholder.y) < 3
            );

            if (hasPlayer) return null;

            return (
              <div
                key={placeholder.id}
                onClick={() => handlePlaceholderClick(placeholder)}
                className="absolute cursor-pointer group transition-all duration-200 hover:scale-110"
                style={{
                  left: `${placeholder.x}%`,
                  top: `${placeholder.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1,
                }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-dashed transition-all duration-200 hover:border-solid"
                  style={{
                    backgroundColor: PLACEHOLDER_COLOR + '40',
                    borderColor: PLACEHOLDER_BORDER_COLOR,
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: PLACEHOLDER_BORDER_COLOR }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                    Click para agregar jugador
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

