import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { logger } from '../utils/logger';
import { getToken, getRefreshToken, setTokens, clearAuthData } from '../utils/storage';
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
  CategoriaDTO,
  CategoriaResponseDTO,
  AlertaResponseDTO,
  CalificacionDTO,
  CalificacionResponseDTO,
  EquipoResponseDTO,
  EstadisticasResponseDTO,
  ReporteVentasDTO,
  ReportePartidosDTO,
  ReporteUsuariosDTO,
  PageResponseDTO,
  BusquedaPartidoDTO,
  CategoriasResponseDTO,
  SedesResponseDTO,
  RegisterRequestDTO,
  LoginRequestDTO,
  RefreshTokenRequestDTO,
  AuthResponseDTO,
} from '../types';

/**
 * Validates that a URL is safe (HTTPS only in production, or relative path)
 */
function validateApiUrl(url: string): boolean {
  try {
    // Relative URLs are always safe
    if (url.startsWith('/')) {
      return true;
    }
    
    const parsed = new URL(url);
    
    // In production, only allow HTTPS
    if (!import.meta.env.DEV && parsed.protocol !== 'https:') {
      logger.warn('Invalid API URL protocol. Only HTTPS is allowed in production.');
      return false;
    }
    
    // Allow http in development, https in production
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    
    // Block javascript:, data:, file:, etc.
    if (['javascript:', 'data:', 'file:', 'vbscript:'].includes(parsed.protocol)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Allowed origins for API requests (whitelist)
 */
const ALLOWED_ORIGINS = [
  'https://picadito-backend.onrender.com',
  'https://unpicadito.vercel.app',
  'http://localhost:8080', // Development only
  'http://127.0.0.1:8080', // Development only
];

/**
 * Validates that the origin is in the whitelist
 */
function validateOrigin(url: string): boolean {
  try {
    // Relative URLs are always safe
    if (url.startsWith('/')) {
      return true;
    }
    
    const parsed = new URL(url);
    const origin = `${parsed.protocol}//${parsed.host}`;
    
    // In development, allow localhost
    if (import.meta.env.DEV) {
      return ALLOWED_ORIGINS.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1');
    }
    
    // In production, only allow whitelisted origins
    return ALLOWED_ORIGINS.includes(origin);
  } catch {
    return false;
  }
}

// En desarrollo, usar URL relativa para aprovechar el proxy de Vite
// En producción, usar la URL de API configurada mediante variable de entorno
// Si no se configura VITE_API_URL en producción, se usará la URL de producción con /api
// URL de producción: https://picadito-backend.onrender.com/api
const getApiUrl = () => {
  // En desarrollo, SIEMPRE usar el proxy de Vite (/api)
  // Esto evita problemas de CORS al hacer que las peticiones pasen por el proxy
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // Si hay una variable de entorno configurada, usarla (solo en producción)
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim();
    
    // Validate URL security
    if (!validateApiUrl(url)) {
      logger.error('Invalid API URL from environment variable. Using default.');
      return 'https://picadito-backend.onrender.com/api';
    }
    
    // Validate origin
    if (!validateOrigin(url)) {
      logger.error('API URL origin not in whitelist. Using default.');
      return 'https://picadito-backend.onrender.com/api';
    }
    
    // Asegurar que termine con /api si no lo tiene
    if (url.endsWith('/api')) {
      return url;
    } else if (url.endsWith('/')) {
      return `${url}api`;
    } else {
      return `${url}/api`;
    }
  }
  
  // En producción, usar la URL completa del backend (SIEMPRE con /api)
  const defaultUrl = 'https://picadito-backend.onrender.com/api';
  
  // Validate default URL
  if (!validateApiUrl(defaultUrl) || !validateOrigin(defaultUrl)) {
    logger.error('Default API URL is invalid. This should not happen.');
    throw new Error('Invalid API configuration');
  }
  
  return defaultUrl;
};

const API_URL = getApiUrl();

// Log para debugging (solo en desarrollo)
logger.log('API URL configurada:', API_URL);
logger.log('Modo desarrollo:', import.meta.env.DEV);
logger.log('VITE_API_URL:', import.meta.env.VITE_API_URL ? '[CONFIGURADA]' : '[NO CONFIGURADA]');

// Timeout de 30 segundos para todas las peticiones
const REQUEST_TIMEOUT = 30000;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Para CORS con credenciales
  timeout: REQUEST_TIMEOUT, // Timeout de 30 segundos
});

// Interceptor de peticiones
apiClient.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Loguear solo en desarrollo (sin datos sensibles)
    logger.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      hasAuth: !!token,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de respuestas
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      // Solo loguear en desarrollo (sin datos sensibles)
      logger.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
      });
      
      // Mensajes más específicos según el código de estado
      let errorMessage = error.response.data?.message || 
                        error.response.data?.error || 
                        `Error ${error.response.status}: ${error.response.statusText}`;
      
      // Handle 401 Unauthorized - Try to refresh token
      if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getRefreshToken();
        
        if (refreshToken) {
          try {
            const response = await authApi.refresh({ refreshToken });
            const { token: newToken, refreshToken: newRefreshToken } = response;
            
            // Store new tokens using storage utility
            setTokens(newToken, newRefreshToken);
            
            // Update the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            
            processQueue(null, newToken);
            isRefreshing = false;
            
            // Retry the original request
            return apiClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear tokens and reject
            processQueue(refreshError, null);
            isRefreshing = false;
            clearAuthData();
            
            // Reload page to show login
            if (window.location.pathname !== '/') {
              window.location.href = '/';
            }
            
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          }
        } else {
          // No refresh token available - clear tokens
          isRefreshing = false;
          clearAuthData();
          errorMessage = errorMessage || 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        }
      }
      
      // Mensajes más descriptivos para errores comunes
      if (error.response.status === 500) {
        // Si el mensaje es genérico, intentar dar más contexto
        if (errorMessage.includes('error inesperado') || errorMessage.includes('Internal Server Error')) {
          const url = error.config?.url || '';
          if (url.includes('/partidos/') && error.config?.method === 'delete') {
            errorMessage = 'No se puede eliminar el partido. Puede tener participantes inscritos, reservas asociadas o equipos generados.';
          } else {
            errorMessage = 'Error del servidor. Por favor, verifica los logs del backend o contacta al administrador.';
          }
        }
      } else if (error.response.status === 400) {
        // Detectar si el error está relacionado con partidos guardados
        const url = error.config?.url || '';
        const lowerMessage = errorMessage.toLowerCase();
        if (url.includes('/partidos/') && error.config?.method === 'delete') {
          if (lowerMessage.includes('guardado') || lowerMessage.includes('partidos guardados') || 
              lowerMessage.includes('partidos seleccionados') || lowerMessage.includes('partidos-seleccionados')) {
            errorMessage = 'No se puede eliminar el partido porque está guardado en "Mis Partidos". Primero debes eliminarlo desde la sección "Mis Partidos".';
          } else {
            errorMessage = errorMessage || 'Datos inválidos. Por favor, verifica la información ingresada.';
          }
        } else {
          errorMessage = errorMessage || 'Datos inválidos. Por favor, verifica la información ingresada.';
        }
      } else if (error.response.status === 409) {
        // Detectar si el error está relacionado con partidos guardados
        const url = error.config?.url || '';
        const lowerMessage = errorMessage.toLowerCase();
        if (url.includes('/partidos/') && error.config?.method === 'delete') {
          if (lowerMessage.includes('guardado') || lowerMessage.includes('partidos guardados') || 
              lowerMessage.includes('partidos seleccionados') || lowerMessage.includes('partidos-seleccionados')) {
            errorMessage = 'No se puede eliminar el partido porque está guardado en "Mis Partidos". Primero debes eliminarlo desde la sección "Mis Partidos".';
          } else {
            errorMessage = errorMessage || 'Conflicto: El recurso ha sido modificado por otro usuario. Por favor, recarga la página.';
          }
        } else {
          errorMessage = errorMessage || 'Conflicto: El recurso ha sido modificado por otro usuario. Por favor, recarga la página.';
        }
      } else if (error.response.status === 404) {
        errorMessage = errorMessage || 'Recurso no encontrado.';
      } else if (error.response.status === 403) {
        // Sin permisos - puede ser token inválido o falta de permisos
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          errorMessage = errorMessage || 'Debes iniciar sesión para acceder a este recurso.';
        } else {
          errorMessage = errorMessage || 'No tienes permisos para acceder a este recurso.';
        }
      }
      
      return Promise.reject(new Error(errorMessage));
    }
    
    // Manejo de errores de red (servidor no responde, no está levantado, timeout, etc.)
    if (error.request) {
      let networkErrorMessage = 'No se pudo conectar con el servidor.';
      
      // Detectar el tipo específico de error de red
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_CONNECTION_REFUSED') {
        networkErrorMessage = 'El servidor no está disponible o no se ha iniciado. Por favor, verifica que el backend esté corriendo.';
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        networkErrorMessage = 'La conexión con el servidor ha excedido el tiempo de espera. El servidor puede estar sobrecargado o no disponible.';
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        networkErrorMessage = 'Error de red. Verifica tu conexión a internet o que el servidor esté disponible.';
      } else if (error.code === 'ERR_INTERNET_DISCONNECTED') {
        networkErrorMessage = 'No hay conexión a internet. Por favor, verifica tu conexión.';
      } else if (!navigator.onLine) {
        networkErrorMessage = 'No hay conexión a internet. Por favor, verifica tu conexión.';
      } else {
        // Mensaje genérico pero más descriptivo
        networkErrorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo y que tu conexión a internet funcione correctamente.';
      }
      
      // Log detallado en desarrollo
      logger.error('Network Error:', {
        code: error.code,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      });
      
      return Promise.reject(new Error(networkErrorMessage));
    }
    
    // Error desconocido
    logger.error('Unknown Error:', error);
    return Promise.reject(error instanceof Error ? error : new Error('Error desconocido al realizar la petición.'));
  }
);

// Partidos API
export const partidosApi = {
  getAll: async (): Promise<PartidoResponseDTO[]> => {
    const response = await apiClient.get<PartidoResponseDTO[]>('/partidos');
    return response.data;
  },

  getAllPaginated: async (
    page: number = 0,
    size: number = 20,
    sortBy: string = 'fechaHora',
    direction: 'ASC' | 'DESC' = 'ASC'
  ): Promise<PageResponseDTO<PartidoResponseDTO>> => {
    const response = await apiClient.get<PageResponseDTO<PartidoResponseDTO>>(
      `/partidos?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data;
  },

  getDisponibles: async (): Promise<PartidoResponseDTO[]> => {
    const response = await apiClient.get<PartidoResponseDTO[] | PageResponseDTO<PartidoResponseDTO>>('/partidos/disponibles');
    // Handle both array response and paginated response
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // If it's a paginated response, extract the content array
    const data = response.data as PageResponseDTO<PartidoResponseDTO>;
    return data.content || [];
  },

  getDisponiblesPaginated: async (
    page: number = 0,
    size: number = 20,
    sortBy: string = 'fechaHora',
    direction: 'ASC' | 'DESC' = 'ASC'
  ): Promise<PageResponseDTO<PartidoResponseDTO>> => {
    const response = await apiClient.get<PageResponseDTO<PartidoResponseDTO>>(
      `/partidos/disponibles?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
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

  buscar: async (busqueda: BusquedaPartidoDTO): Promise<PartidoResponseDTO[]> => {
    const response = await apiClient.post<PartidoResponseDTO[] | PageResponseDTO<PartidoResponseDTO>>('/partidos/buscar', busqueda);
    // Handle both array response and paginated response
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // If it's a paginated response, extract the content array
    const data = response.data as PageResponseDTO<PartidoResponseDTO>;
    return data.content || [];
  },

  buscarPaginated: async (
    busqueda: BusquedaPartidoDTO,
    page: number = 0,
    size: number = 20,
    sortBy: string = 'fechaHora',
    direction: 'ASC' | 'DESC' = 'ASC'
  ): Promise<PageResponseDTO<PartidoResponseDTO>> => {
    const response = await apiClient.post<PageResponseDTO<PartidoResponseDTO>>(
      `/partidos/buscar?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`,
      busqueda
    );
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

  getAllWithTotal: async (): Promise<SedesResponseDTO> => {
    const response = await apiClient.get<SedesResponseDTO>('/sedes');
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

// Categorías API
export const categoriasApi = {
  getAll: async (): Promise<CategoriaResponseDTO[]> => {
    const response = await apiClient.get<CategoriaResponseDTO[] | CategoriasResponseDTO>('/categorias');
    // Handle both array response and object with categorias property
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // If it's an object with categorias property, extract the array
    const data = response.data as CategoriasResponseDTO;
    return data.categorias || [];
  },

  getAllWithTotal: async (): Promise<CategoriasResponseDTO> => {
    const response = await apiClient.get<CategoriasResponseDTO>('/categorias');
    return response.data;
  },

  getById: async (id: number): Promise<CategoriaResponseDTO> => {
    const response = await apiClient.get<CategoriaResponseDTO>(`/categorias/${id}`);
    return response.data;
  },

  create: async (categoria: CategoriaDTO): Promise<CategoriaResponseDTO> => {
    const response = await apiClient.post<CategoriaResponseDTO>('/categorias', categoria);
    return response.data;
  },

  update: async (id: number, categoria: CategoriaDTO): Promise<CategoriaResponseDTO> => {
    const response = await apiClient.put<CategoriaResponseDTO>(`/categorias/${id}`, categoria);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categorias/${id}`);
  },

  getPartidosByCategoria: async (categoriaId: number): Promise<PartidoResponseDTO[]> => {
    const response = await apiClient.get<PartidoResponseDTO[]>(`/partidos/categoria/${categoriaId}`);
    return response.data;
  },
};

// Alertas API
export const alertasApi = {
  getByUsuario: async (usuarioId: number): Promise<AlertaResponseDTO[]> => {
    const response = await apiClient.get<AlertaResponseDTO[]>(`/alertas/usuario/${usuarioId}`);
    return response.data;
  },

  getNoLeidas: async (usuarioId: number): Promise<AlertaResponseDTO[]> => {
    const response = await apiClient.get<AlertaResponseDTO[]>(`/alertas/usuario/${usuarioId}/no-leidas`);
    return response.data;
  },

  marcarLeida: async (id: number): Promise<void> => {
    await apiClient.put(`/alertas/${id}/marcar-leida`);
  },

  marcarTodasLeidas: async (usuarioId: number): Promise<void> => {
    await apiClient.put(`/alertas/usuario/${usuarioId}/marcar-todas-leidas`);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/alertas/${id}`);
  },
};

// Calificaciones API
export const calificacionesApi = {
  create: async (usuarioId: number, calificacion: CalificacionDTO): Promise<CalificacionResponseDTO> => {
    const response = await apiClient.post<CalificacionResponseDTO>(
      `/calificaciones/usuario/${usuarioId}`,
      calificacion
    );
    return response.data;
  },

  getByPartido: async (partidoId: number): Promise<CalificacionResponseDTO[]> => {
    const response = await apiClient.get<CalificacionResponseDTO[]>(`/calificaciones/partido/${partidoId}`);
    return response.data;
  },

  getPromedioByPartido: async (partidoId: number): Promise<number> => {
    const response = await apiClient.get<number>(`/calificaciones/partido/${partidoId}/promedio`);
    return response.data;
  },

  getPromedioByCreador: async (creadorNombre: string): Promise<number> => {
    const response = await apiClient.get<number>(`/calificaciones/creador/${encodeURIComponent(creadorNombre)}/promedio`);
    return response.data;
  },

  getPromedioBySede: async (sedeId: number): Promise<number> => {
    const response = await apiClient.get<number>(`/calificaciones/sede/${sedeId}/promedio`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/calificaciones/${id}`);
  },
};

// Equipos API
export const equiposApi = {
  generarEquipos: async (partidoId: number): Promise<EquipoResponseDTO[]> => {
    const response = await apiClient.post<EquipoResponseDTO[]>(`/equipos/partido/${partidoId}/generar`);
    return response.data;
  },

  getByPartido: async (partidoId: number): Promise<EquipoResponseDTO[]> => {
    const response = await apiClient.get<EquipoResponseDTO[]>(`/equipos/partido/${partidoId}`);
    return response.data;
  },

  getById: async (id: number): Promise<EquipoResponseDTO> => {
    const response = await apiClient.get<EquipoResponseDTO>(`/equipos/${id}`);
    return response.data;
  },

  delete: async (partidoId: number): Promise<void> => {
    await apiClient.delete(`/equipos/partido/${partidoId}`);
  },
};

// Admin API
export const adminApi = {
  getPartidosCapacidadBaja: async (capacidadMinima?: number): Promise<PartidoResponseDTO[]> => {
    const params = capacidadMinima ? `?capacidadMinima=${capacidadMinima}` : '';
    const response = await apiClient.get<PartidoResponseDTO[]>(`/admin/partidos-capacidad-baja${params}`);
    return response.data;
  },

  getEstadisticas: async (): Promise<EstadisticasResponseDTO> => {
    const response = await apiClient.get<EstadisticasResponseDTO>('/admin/estadisticas');
    return response.data;
  },

  getEstadisticasPorPeriodo: async (fechaInicio: string, fechaFin: string): Promise<EstadisticasResponseDTO> => {
    const response = await apiClient.get<EstadisticasResponseDTO>(
      `/admin/estadisticas/periodo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },

  getReporteVentas: async (fechaInicio: string, fechaFin: string): Promise<ReporteVentasDTO> => {
    const response = await apiClient.get<ReporteVentasDTO>(
      `/admin/reportes/ventas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },

  getReportePartidos: async (fechaInicio: string, fechaFin: string): Promise<ReportePartidosDTO> => {
    const response = await apiClient.get<ReportePartidosDTO>(
      `/admin/reportes/partidos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },

  getReporteUsuarios: async (fechaInicio: string, fechaFin: string): Promise<ReporteUsuariosDTO> => {
    const response = await apiClient.get<ReporteUsuariosDTO>(
      `/admin/reportes/usuarios?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },
};

// Auth API
export const authApi = {
  register: async (data: RegisterRequestDTO): Promise<AuthResponseDTO> => {
    const response = await apiClient.post<AuthResponseDTO>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequestDTO): Promise<AuthResponseDTO> => {
    const response = await apiClient.post<AuthResponseDTO>('/auth/login', data);
    return response.data;
  },

  refresh: async (data: RefreshTokenRequestDTO): Promise<AuthResponseDTO> => {
    const response = await apiClient.post<AuthResponseDTO>('/auth/refresh', data);
    return response.data;
  },
};

// Health Check API (usa baseURL sin /api)
export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    const baseURL = API_URL.replace('/api', '');
    const response = await axios.get<{ status: string }>(`${baseURL}/actuator/health`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  },
};
