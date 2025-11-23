import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useReservas,
  useReserva,
  useReservasPorUsuario,
  useTotalGastado,
  useCrearReservaDesdePartidosSeleccionados,
  useActualizarEstadoReserva,
  useCancelarReserva,
} from './useInscripciones';
import { reservasApi } from '../services/api';
import type { ReservaResponseDTO } from '../types';

vi.mock('../services/api', () => ({
  reservasApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getByUsuario: vi.fn(),
    getTotalGastado: vi.fn(),
    crearDesdePartidosSeleccionados: vi.fn(),
    actualizarEstado: vi.fn(),
    cancelar: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useReservas hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useReservas', () => {
    it('fetches reservas', async () => {
      const mockReservas = [
        { id: 1, usuarioId: 1, estado: 'CONFIRMADO' },
        { id: 2, usuarioId: 1, estado: 'PENDIENTE' },
      ];
      vi.mocked(reservasApi.getAll).mockResolvedValue(mockReservas as ReservaResponseDTO[]);

      const { result } = renderHook(() => useReservas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockReservas);
      expect(reservasApi.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('useReserva', () => {
    it('fetches single reserva', async () => {
      const mockReserva = { id: 1, usuarioId: 1, estado: 'CONFIRMADO' };
      vi.mocked(reservasApi.getById).mockResolvedValue(mockReserva as ReservaResponseDTO);

      const { result } = renderHook(() => useReserva(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockReserva);
      expect(reservasApi.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('useReservasPorUsuario', () => {
    it('fetches reservas by usuario', async () => {
      const mockReservas = [{ id: 1, usuarioId: 1, estado: 'CONFIRMADO' }];
      vi.mocked(reservasApi.getByUsuario).mockResolvedValue(mockReservas as ReservaResponseDTO[]);

      const { result } = renderHook(() => useReservasPorUsuario(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockReservas);
      expect(reservasApi.getByUsuario).toHaveBeenCalledWith(1);
    });
  });

  describe('useTotalGastado', () => {
    it('calculates total gastado', async () => {
      vi.mocked(reservasApi.getTotalGastado).mockResolvedValue(150.0);

      const { result } = renderHook(() => useTotalGastado(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBe(150.0);
      expect(reservasApi.getTotalGastado).toHaveBeenCalledWith(1);
    });
  });

  describe('useCrearReservaDesdePartidosSeleccionados', () => {
    it('creates reserva from partidos seleccionados', async () => {
      const mockReserva = { id: 1, usuarioId: 1, estado: 'CONFIRMADO' };
      vi.mocked(reservasApi.crearDesdePartidosSeleccionados).mockResolvedValue(mockReserva as ReservaResponseDTO);

      const { result } = renderHook(() => useCrearReservaDesdePartidosSeleccionados(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(reservasApi.crearDesdePartidosSeleccionados).toHaveBeenCalledWith(1);
    });
  });

  describe('useActualizarEstadoReserva', () => {
    it('updates reserva estado', async () => {
      const mockReserva = { id: 1, usuarioId: 1, estado: 'EN_PROCESO' };
      vi.mocked(reservasApi.actualizarEstado).mockResolvedValue(mockReserva as ReservaResponseDTO);

      const { result } = renderHook(() => useActualizarEstadoReserva(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 1, estado: 'EN_PROCESO' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(reservasApi.actualizarEstado).toHaveBeenCalledWith(1, 'EN_PROCESO');
    });
  });

  describe('useCancelarReserva', () => {
    it('cancels reserva', async () => {
      vi.mocked(reservasApi.cancelar).mockResolvedValue();

      const { result } = renderHook(() => useCancelarReserva(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(reservasApi.cancelar).toHaveBeenCalledWith(1);
    });
  });
});

