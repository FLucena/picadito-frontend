import type { SedeDTO } from '../types';

const nombres = [
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
  'Polideportivo Municipal',
  'Cancha Eléctrica',
  'Estadio Olímpico',
  'Campo Deportivo Este',
  'Cancha Los Pinos',
];

const direcciones = [
  'Av. Principal 123',
  'Calle Deportiva 456',
  'Boulevard del Deporte 789',
  'Av. Central 321',
  'Calle del Estadio 654',
  'Av. Deportiva 987',
  'Calle Municipal 147',
  'Boulevard Central 258',
  'Av. del Campo 369',
  'Calle Deportiva 741',
  'Av. Olímpica 852',
  'Calle del Parque 963',
  'Boulevard Deportivo 159',
  'Av. Municipal 357',
  'Calle Central 486',
];

const descripciones = [
  'Cancha de césped natural con iluminación',
  'Campo de fútbol 11 con gradas',
  'Cancha sintética con vestuarios',
  'Campo abierto con iluminación nocturna',
  'Complejo deportivo con múltiples canchas',
  'Estadio con capacidad para 500 personas',
  'Cancha de fútbol 7 con césped artificial',
  'Campo municipal con estacionamiento',
  'Cancha barrial con iluminación',
  'Centro deportivo con servicios completos',
  undefined,
  'Cancha profesional con vestuarios',
  'Campo deportivo con iluminación LED',
];

const telefonos = [
  '+54 11 1234-5678',
  '+54 11 2345-6789',
  '+54 11 3456-7890',
  '+54 11 4567-8901',
  '+54 11 5678-9012',
  '+54 11 6789-0123',
  undefined,
  '+54 11 7890-1234',
  '+54 11 8901-2345',
];

const coordenadas = [
  '-34.6037, -58.3816',
  '-34.6118, -58.3960',
  '-34.6092, -58.3732',
  '-34.6158, -58.4333',
  '-34.5875, -58.3974',
  '-34.6015, -58.3841',
  undefined,
  '-34.5950, -58.4100',
  '-34.6200, -58.3700',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateRandomSede(): SedeDTO {
  return {
    nombre: getRandomElement(nombres),
    direccion: getRandomElement(direcciones),
    descripcion: getRandomElement(descripciones),
    telefono: getRandomElement(telefonos),
    coordenadas: getRandomElement(coordenadas),
  };
}

export function generateRandomSedes(count: number = 5): SedeDTO[] {
  return Array.from({ length: count }, () => generateRandomSede());
}

