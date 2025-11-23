import axios, { AxiosError } from 'axios';
import type {
  ErrorResponse,
  PartidoDTO,
  PartidoResponseDTO,
  ParticipanteDTO,
  ParticipanteResponseDTO,
  PartidosSeleccionadosResponseDTO,
  ReservaResponseDTO,
  EstadoReserva,
  SedeDTO,
  SedeResponseDTO,
} from '../types';

// En desarrollo, usar URL relativa para aprovechar el proxy de Vite
// En producción, usar la URL de API configurada
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:8080/api');

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de peticiones
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      });
      
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          `Error ${error.response.status}: ${error.response.statusText}`;
      return Promise.reject(new Error(errorMessage));
    }
    if (error.request) {
      return Promise.reject(new Error('No se pudo conectar con el servidor'));
    }
    return Promise.reject(error);
  }
);

// Partidos API
export const partidosApi = {
  getAll: async (): Promise<PartidoResponseDTO[]> => {
    const response = await apiClient.get<PartidoResponseDTO[]>('/partidos');
    return response.data;
  },

  getDisponibles: async (): Promise<PartidoResponseDTO[]> => {
    const response = await apiClient.get<PartidoResponseDTO[]>('/partidos/disponibles');
    return response.data;
  },

  getById: async (id: number): Promise<PartidoResponseDTO> => {
    const response = await apiClient.get<PartidoResponseDTO>(`/partidos/${id}`);
    return response.data;
  },

  create: async (partido: PartidoDTO): Promise<PartidoResponseDTO> => {
    const response = await apiClient.post<PartidoResponseDTO>('/partidos', partido);
    return response.data;
  },

  update: async (id: number, partido: PartidoDTO): Promise<PartidoResponseDTO> => {
    const response = await apiClient.put<PartidoResponseDTO>(`/partidos/${id}`, partido);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/partidos/${id}`);
  },

  buscar: async (busqueda: import('../types').BusquedaPartidoDTO): Promise<PartidoResponseDTO[]> => {
    const response = await apiClient.post<PartidoResponseDTO[]>('/partidos/buscar', busqueda);
    return response.data;
  },

  getCostoPorJugador: async (id: number): Promise<number> => {
    const response = await apiClient.get<number>(`/partidos/${id}/costo-por-jugador`);
    return response.data;
  },
};

// Participantes API
export const participantesApi = {
  getByPartido: async (partidoId: number): Promise<ParticipanteResponseDTO[]> => {
    const response = await apiClient.get<ParticipanteResponseDTO[]>(`/partidos/${partidoId}/participantes`);
    return response.data;
  },

  inscribirse: async (partidoId: number, participante: ParticipanteDTO): Promise<ParticipanteResponseDTO> => {
    const response = await apiClient.post<ParticipanteResponseDTO>(
      `/partidos/${partidoId}/participantes`,
      participante
    );
    return response.data;
  },

  desinscribirse: async (partidoId: number, participanteId: number): Promise<void> => {
    await apiClient.delete(`/partidos/${partidoId}/participantes/${participanteId}`);
  },
};

// Partidos Seleccionados API
export const partidosSeleccionadosApi = {
  getByUsuario: async (usuarioId: number): Promise<PartidosSeleccionadosResponseDTO> => {
    const response = await apiClient.get<PartidosSeleccionadosResponseDTO>(`/partidos-seleccionados/usuario/${usuarioId}`);
    return response.data;
  },

  agregarPartido: async (usuarioId: number, partidoId: number, cantidad: number = 1): Promise<PartidosSeleccionadosResponseDTO> => {
    const response = await apiClient.post<PartidosSeleccionadosResponseDTO>(
      `/partidos-seleccionados/usuario/${usuarioId}/agregar?partidoId=${partidoId}&cantidad=${cantidad}`
    );
    return response.data;
  },

  actualizarCantidad: async (usuarioId: number, lineaPartidoSeleccionadoId: number, cantidad: number): Promise<PartidosSeleccionadosResponseDTO> => {
    const response = await apiClient.put<PartidosSeleccionadosResponseDTO>(
      `/partidos-seleccionados/usuario/${usuarioId}/item/${lineaPartidoSeleccionadoId}?cantidad=${cantidad}`
    );
    return response.data;
  },

  eliminarItem: async (usuarioId: number, lineaPartidoSeleccionadoId: number): Promise<void> => {
    await apiClient.delete(`/partidos-seleccionados/usuario/${usuarioId}/item/${lineaPartidoSeleccionadoId}`);
  },

  vaciar: async (usuarioId: number): Promise<void> => {
    await apiClient.delete(`/partidos-seleccionados/usuario/${usuarioId}`);
  },
};

// Reservas API
export const reservasApi = {
  getAll: async (): Promise<ReservaResponseDTO[]> => {
    const response = await apiClient.get<ReservaResponseDTO[]>('/reservas');
    return response.data;
  },

  getById: async (id: number): Promise<ReservaResponseDTO> => {
    const response = await apiClient.get<ReservaResponseDTO>(`/reservas/${id}`);
    return response.data;
  },

  getByUsuario: async (usuarioId: number): Promise<ReservaResponseDTO[]> => {
    const response = await apiClient.get<ReservaResponseDTO[]>(`/reservas/usuario/${usuarioId}`);
    return response.data;
  },

  getTotalGastado: async (usuarioId: number): Promise<number> => {
    const response = await apiClient.get<number>(`/reservas/usuario/${usuarioId}/total-gastado`);
    return response.data;
  },

  crearDesdePartidosSeleccionados: async (usuarioId: number): Promise<ReservaResponseDTO> => {
    const response = await apiClient.post<ReservaResponseDTO>(
      `/reservas/desde-partidos-seleccionados/${usuarioId}`
    );
    return response.data;
  },

  actualizarEstado: async (id: number, estado: EstadoReserva): Promise<ReservaResponseDTO> => {
    const response = await apiClient.put<ReservaResponseDTO>(`/reservas/${id}/estado`, estado);
    return response.data;
  },

  cancelar: async (id: number): Promise<void> => {
    await apiClient.put(`/reservas/${id}/cancelar`);
  },
};

// Sedes API
export const sedesApi = {
  getAll: async (): Promise<SedeResponseDTO[]> => {
    const response = await apiClient.get<SedeResponseDTO[]>('/sedes');
    return response.data;
  },

  getById: async (id: number): Promise<SedeResponseDTO> => {
    const response = await apiClient.get<SedeResponseDTO>(`/sedes/${id}`);
    return response.data;
  },

  create: async (sede: SedeDTO): Promise<SedeResponseDTO> => {
    const response = await apiClient.post<SedeResponseDTO>('/sedes', sede);
    return response.data;
  },

  update: async (id: number, sede: SedeDTO): Promise<SedeResponseDTO> => {
    const response = await apiClient.put<SedeResponseDTO>(`/sedes/${id}`, sede);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/sedes/${id}`);
  },

  migrar: async (): Promise<{ sedesCreadas: number; partidosActualizados: number; mensaje: string }> => {
    const response = await apiClient.post<{ sedesCreadas: number; partidosActualizados: number; mensaje: string }>('/sedes/migrar');
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getPartidosCapacidadBaja: async (capacidadMinima?: number): Promise<PartidoResponseDTO[]> => {
    const params = capacidadMinima ? `?capacidadMinima=${capacidadMinima}` : '';
    const response = await apiClient.get<PartidoResponseDTO[]>(`/admin/partidos-capacidad-baja${params}`);
    return response.data;
  },
};
