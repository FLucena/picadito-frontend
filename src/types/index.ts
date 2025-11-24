export const RolUsuario = {
  ADMIN: 'ADMIN',
  CLIENTE: 'CLIENTE',
} as const;

export type RolUsuario = typeof RolUsuario[keyof typeof RolUsuario];

export interface UsuarioDTO {
  id?: number;
  nombre: string;
  email: string;
  rol?: RolUsuario;
  activo?: boolean;
}

export interface UsuarioResponseDTO {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// Partidos y Participantes
export const EstadoPartido = {
  DISPONIBLE: 'DISPONIBLE',
  COMPLETO: 'COMPLETO',
  FINALIZADO: 'FINALIZADO',
  CANCELADO: 'CANCELADO',
} as const;

export type EstadoPartido = typeof EstadoPartido[keyof typeof EstadoPartido];

export const Posicion = {
  PORTERO: 'PORTERO',
  DEFENSA: 'DEFENSA',
  MEDIOCAMPISTA: 'MEDIOCAMPISTA',
  DELANTERO: 'DELANTERO',
} as const;

export type Posicion = typeof Posicion[keyof typeof Posicion];

export const Nivel = {
  PRINCIPIANTE: 'PRINCIPIANTE',
  INTERMEDIO: 'INTERMEDIO',
  AVANZADO: 'AVANZADO',
  EXPERTO: 'EXPERTO',
} as const;

export type Nivel = typeof Nivel[keyof typeof Nivel];

export interface PartidoDTO {
  titulo: string;
  descripcion?: string;
  fechaHora: string; // ISO 8601 format
  ubicacion?: string;
  sedeId?: number;
  categoriaId?: number;
  maxJugadores: number;
  creadorNombre: string;
  precio?: number;
  imagenUrl?: string;
}

export interface PartidoResponseDTO {
  id: number;
  titulo: string;
  descripcion?: string;
  fechaHora: string;
  ubicacion?: string;
  sedeId?: number;
  sede?: SedeResponseDTO;
  categoriaId?: number;
  categoria?: CategoriaResponseDTO;
  maxJugadores: number;
  estado: EstadoPartido;
  creadorNombre: string;
  fechaCreacion: string;
  cantidadParticipantes: number;
  participantes?: ParticipanteResponseDTO[];
  precio?: number;
  imagenUrl?: string;
  promedioCalificacion?: number | null;
  equipos?: EquipoResponseDTO[];
}

export interface ParticipanteDTO {
  nombre: string;
  apodo?: string;
  posicion?: Posicion;
  nivel?: Nivel;
}

export interface ParticipanteResponseDTO {
  id: number;
  nombre: string;
  apodo?: string;
  posicion?: Posicion;
  nivel?: Nivel;
  fechaInscripcion: string;
}

// Partidos Seleccionados
export interface LineaPartidoSeleccionadoDTO {
  id?: number;
  partidoId: number;
  partidoTitulo?: string;
  partidoUbicacion?: string;
  cantidad: number;
}

export interface PartidosSeleccionadosDTO {
  id?: number;
  usuarioId: number;
  items: LineaPartidoSeleccionadoDTO[];
  totalPartidos?: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface PartidosSeleccionadosResponseDTO {
  id: number;
  usuarioId: number;
  items: LineaPartidoSeleccionadoDTO[];
  totalPartidos: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Reservas
export const EstadoReserva = {
  PENDIENTE: 'PENDIENTE',
  CONFIRMADO: 'CONFIRMADO',
  EN_PROCESO: 'EN_PROCESO',
  FINALIZADO: 'FINALIZADO',
  CANCELADO: 'CANCELADO',
} as const;

export type EstadoReserva = typeof EstadoReserva[keyof typeof EstadoReserva];

export interface LineaReservaDTO {
  id?: number;
  partidoId: number;
  partidoTitulo?: string;
  cantidad: number;
  subtotal?: number;
}

export interface ReservaDTO {
  id?: number;
  usuarioId: number;
  usuarioNombre?: string;
  estado?: EstadoReserva;
  lineasReserva: LineaReservaDTO[];
  total?: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface ReservaResponseDTO {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  estado: EstadoReserva;
  lineasReserva: LineaReservaDTO[];
  total: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Búsqueda de Partidos
export interface BusquedaPartidoDTO {
  titulo?: string;
  ubicacion?: string;
  creadorNombre?: string;
  estado?: EstadoPartido;
  categoriaId?: number;
  fechaDesde?: string; // ISO 8601 format
  fechaHasta?: string; // ISO 8601 format
  minJugadores?: number;
  maxJugadores?: number;
  cuposDisponiblesMin?: number;
  soloDisponibles?: boolean;
}

// Sedes
export interface SedeDTO {
  nombre?: string;
  direccion?: string;
  descripcion?: string;
  telefono?: string;
  coordenadas?: string;
}

export interface SedeResponseDTO {
  id: number;
  nombre?: string;
  direccion?: string;
  descripcion?: string;
  telefono?: string;
  coordenadas?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Categorías
export interface CategoriaDTO {
  nombre: string;
  descripcion?: string;
  icono?: string;
  color?: string;
}

export interface CategoriaResponseDTO {
  id: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
  color?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Alertas
export const TipoAlerta = {
  CUPOS_BAJOS: 'CUPOS_BAJOS',
  PARTIDO_PROXIMO: 'PARTIDO_PROXIMO',
  RESERVA_CONFIRMADA: 'RESERVA_CONFIRMADA',
  PARTIDO_CANCELADO: 'PARTIDO_CANCELADO',
  PARTIDO_COMPLETO: 'PARTIDO_COMPLETO',
} as const;

export type TipoAlerta = typeof TipoAlerta[keyof typeof TipoAlerta];

export interface AlertaResponseDTO {
  id: number;
  tipo: TipoAlerta;
  mensaje: string;
  leida: boolean;
  usuarioId: number;
  partidoId?: number;
  partidoTitulo?: string;
  fechaCreacion: string;
}

// Calificaciones
export interface CalificacionDTO {
  puntuacion: number;
  comentario?: string;
  partidoId: number;
}

export interface CalificacionResponseDTO {
  id: number;
  puntuacion: number;
  comentario?: string;
  usuarioId: number;
  usuarioNombre: string;
  partidoId: number;
  partidoTitulo: string;
  fechaCreacion: string;
}

// Equipos
export interface EquipoResponseDTO {
  id: number;
  nombre: string;
  partidoId: number;
  cantidadParticipantes: number;
  participantes: ParticipanteResponseDTO[];
}

// Estadísticas Admin
export interface PartidoPopularDTO {
  partidoId: number;
  titulo: string;
  cantidadParticipantes: number;
  maxJugadores: number;
  porcentajeOcupacion: number;
}

export interface UsuarioActivoDTO {
  usuarioId: number;
  nombre: string;
  cantidadReservas: number;
  totalGastado: number;
}

export interface SedeUtilizadaDTO {
  sedeId: number;
  nombre?: string;
  direccion?: string;
  cantidadPartidos: number;
}

export interface EstadisticasResponseDTO {
  totalPartidos: number;
  totalReservas: number;
  totalUsuarios: number;
  ingresosTotales: number;
  ingresosPorPeriodo: number;
  partidosPopulares: PartidoPopularDTO[];
  usuariosActivos: UsuarioActivoDTO[];
  sedesUtilizadas: SedeUtilizadaDTO[];
  partidosPorCategoria: Record<string, number>;
  tasaOcupacionPromedio: number;
}

export interface ReporteVentasDTO {
  fechaInicio: string;
  fechaFin: string;
  totalVentas: number;
  cantidadReservas: number;
  reservasPorEstado: Record<string, number>;
  ingresosPorDia: Array<{ fecha: string; ingresos: number }>;
}

export interface ReportePartidosDTO {
  fechaInicio: string;
  fechaFin: string;
  totalPartidos: number;
  partidosPorEstado: Record<string, number>;
  partidosPorCategoria: Record<string, number>;
  partidosPorDia: Array<{ fecha: string; cantidad: number }>;
}

export interface ReporteUsuariosDTO {
  fechaInicio: string;
  fechaFin: string;
  totalUsuarios: number;
  nuevosUsuarios: number;
  usuariosActivos: number;
  usuariosPorRol: Record<string, number>;
}