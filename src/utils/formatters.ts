import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { EstadoReserva, EstadoPartido, Posicion, Nivel } from '../types';

export const formatPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(precio);
};

export const formatFecha = (fecha: string): string => {
  const date = new Date(fecha);
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
};

export const formatFechaHora = (fechaHora: string): string => {
  const date = new Date(fechaHora);
  return format(date, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
};

export const formatFechaCorta = (fecha: string): string => {
  const date = new Date(fecha);
  return format(date, 'dd/MM/yyyy', { locale: es });
};

export const formatFechaHoraCorta = (fechaHora: string): string => {
  const date = new Date(fechaHora);
  return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
};

export const formatFechaRelativa = (fecha: string): string => {
  const date = new Date(fecha);
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
};

// Funciones para Reservas
export const getEstadoReservaBadgeColor = (estado: EstadoReserva): string => {
  switch (estado) {
    case EstadoReserva.PENDIENTE:
      return 'bg-yellow-100 text-yellow-800';
    case EstadoReserva.CONFIRMADO:
      return 'bg-blue-100 text-blue-800';
    case EstadoReserva.EN_PROCESO:
      return 'bg-purple-100 text-purple-800';
    case EstadoReserva.FINALIZADO:
      return 'bg-green-100 text-green-800';
    case EstadoReserva.CANCELADO:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getEstadoReservaLabel = (estado: EstadoReserva): string => {
  switch (estado) {
    case EstadoReserva.PENDIENTE:
      return 'Pendiente';
    case EstadoReserva.CONFIRMADO:
      return 'Confirmado';
    case EstadoReserva.EN_PROCESO:
      return 'En Proceso';
    case EstadoReserva.FINALIZADO:
      return 'Finalizado';
    case EstadoReserva.CANCELADO:
      return 'Cancelado';
    default:
      return String(estado);
  }
};

export const formatStock = (stock: number): string => {
  if (stock === 0) return 'Sin stock';
  if (stock < 10) return `Stock bajo (${stock})`;
  return `${stock} unidades`;
};

export const getStockBadgeColor = (stock: number): string => {
  if (stock === 0) return 'bg-red-100 text-red-800';
  if (stock < 10) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

// Funciones para Partidos
export const getEstadoBadgeColor = (estado: EstadoPartido): string => {
  switch (estado) {
    case EstadoPartido.DISPONIBLE:
      return 'bg-green-100 text-green-800';
    case EstadoPartido.COMPLETO:
      return 'bg-yellow-100 text-yellow-800';
    case EstadoPartido.FINALIZADO:
      return 'bg-gray-100 text-gray-800';
    case EstadoPartido.CANCELADO:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getEstadoLabel = (estado: EstadoPartido): string => {
  switch (estado) {
    case EstadoPartido.DISPONIBLE:
      return 'Disponible';
    case EstadoPartido.COMPLETO:
      return 'Completo';
    case EstadoPartido.FINALIZADO:
      return 'Finalizado';
    case EstadoPartido.CANCELADO:
      return 'Cancelado';
    default:
      return estado;
  }
};

// Funciones para Posiciones
export const getPosicionLabel = (posicion: Posicion): string => {
  switch (posicion) {
    case Posicion.PORTERO:
      return 'Portero';
    case Posicion.DEFENSA:
      return 'Defensa';
    case Posicion.MEDIOCAMPISTA:
      return 'Mediocampista';
    case Posicion.DELANTERO:
      return 'Delantero';
    default:
      return posicion;
  }
};

// Funciones para Niveles
export const getNivelLabel = (nivel: Nivel): string => {
  switch (nivel) {
    case Nivel.PRINCIPIANTE:
      return 'Principiante';
    case Nivel.INTERMEDIO:
      return 'Intermedio';
    case Nivel.AVANZADO:
      return 'Avanzado';
    case Nivel.EXPERTO:
      return 'Experto';
    default:
      return nivel;
  }
};

export const getNivelBadgeColor = (nivel: Nivel): string => {
  switch (nivel) {
    case Nivel.PRINCIPIANTE:
      return 'bg-blue-100 text-blue-800';
    case Nivel.INTERMEDIO:
      return 'bg-green-100 text-green-800';
    case Nivel.AVANZADO:
      return 'bg-yellow-100 text-yellow-800';
    case Nivel.EXPERTO:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
