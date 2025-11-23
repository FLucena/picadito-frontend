import type { PartidoDTO } from '../types';

const titulos = [
  'Partido Dominical',
  'Fútbol en el Parque Central',
  'Cancha de Fútbol 7',
  'Partido Nocturno',
  'Fútbol Matutino',
  'Partido de Mediodía',
  'Cancha Sintética',
  'Fútbol de Fin de Semana',
  'Partido Vespertino',
  'Fútbol Rápido',
];

const ubicaciones = [
  'Parque Central',
  'Cancha Municipal',
  'Campo Deportivo Norte',
  'Complejo Deportivo Sur',
  'Cancha Sintética Plaza',
  'Estadio Local',
  'Campo de Fútbol 7',
  'Cancha Barrial',
  'Centro Deportivo',
  'Campo Abierto',
];

const descripciones = [
  'Partido amistoso, todos son bienvenidos',
  'Busco jugadores de todos los niveles',
  'Partido competitivo',
  'Fútbol recreativo',
  'Partido para pasarla bien',
  undefined,
  'Todos los niveles son bienvenidos',
  'Partido semanal',
];

const nombresCreadores = [
  'Juan Pérez',
  'María García',
  'Carlos Rodríguez',
  'Ana Martínez',
  'Luis López',
  'Laura Sánchez',
  'Pedro Fernández',
  'Sofía Torres',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFutureDate(): string {
  const now = new Date();
  // Fecha entre 1 día y 30 días en el futuro
  const daysOffset = getRandomInt(1, 30);
  const hoursOffset = getRandomInt(0, 23);
  const minutesOffset = getRandomInt(0, 59);
  
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + daysOffset);
  futureDate.setHours(hoursOffset, minutesOffset, 0, 0);
  
  // Formato ISO 8601: YYYY-MM-DDTHH:mm:ss (formato esperado por el backend)
  const year = futureDate.getFullYear();
  const month = String(futureDate.getMonth() + 1).padStart(2, '0');
  const day = String(futureDate.getDate()).padStart(2, '0');
  const hours = String(futureDate.getHours()).padStart(2, '0');
  const minutes = String(futureDate.getMinutes()).padStart(2, '0');
  const seconds = '00';
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function generateRandomPartido(): PartidoDTO {
  return {
    titulo: getRandomElement(titulos),
    descripcion: getRandomElement(descripciones),
    fechaHora: getRandomFutureDate(),
    ubicacion: getRandomElement(ubicaciones),
    maxJugadores: getRandomInt(8, 22),
    creadorNombre: getRandomElement(nombresCreadores),
  };
}

export function generateRandomPartidos(count: number = 5): PartidoDTO[] {
  return Array.from({ length: count }, () => generateRandomPartido());
}

