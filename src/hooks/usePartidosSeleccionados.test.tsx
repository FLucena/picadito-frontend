import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  usePartidosSeleccionados,
  useAgregarPartidoSeleccionado,
  useActualizarCantidadPartidoSeleccionado,
  useEliminarPartidoSeleccionado,
  useVaciarPartidosSeleccionados,
} from './usePartidosGuardados';
import { partidosSeleccionadosApi } from '../services/api';
import type { PartidosSeleccionadosResponseDTO } from '../types';

vi.mock('../services/api', () => ({
  partidosSeleccionadosApi: {
    getByUsuario: vi.fn(),
    agregarPartido: vi.fn(),
    actualizarCantidad: vi.fn(),
    eliminarItem: vi.fn(),
    vaciar: vi.fn(),
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

describe('usePartidosSeleccionados hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePartidosSeleccionados', () => {
    it('fetches partidos seleccionados', async () => {
      const mockData: PartidosSeleccionadosResponseDTO = {
        id: 1,
        usuarioId: 1,
        items: [],
        totalPartidos: 0,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      };
      vi.mocked(partidosSeleccionadosApi.getByUsuario).mockResolvedValue(mockData);

      const { result } = renderHook(() => usePartidosSeleccionados(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(partidosSeleccionadosApi.getByUsuario).toHaveBeenCalledWith(1);
    });
  });

  describe('useAgregarPartidoSeleccionado', () => {
    it('adds partido to seleccionados', async () => {
      const mockData: PartidosSeleccionadosResponseDTO = {
        id: 1,
        usuarioId: 1,
        items: [{ id: 1, partidoId: 1, cantidad: 2 }],
        totalPartidos: 1,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      };
      vi.mocked(partidosSeleccionadosApi.agregarPartido).mockResolvedValue(mockData);

      const { result } = renderHook(() => useAgregarPartidoSeleccionado(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ usuarioId: 1, partidoId: 1, cantidad: 2 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(partidosSeleccionadosApi.agregarPartido).toHaveBeenCalledWith(1, 1, 2);
    });
  });

  describe('useActualizarCantidadPartidoSeleccionado', () => {
    it('updates cantidad', async () => {
      const mockData: PartidosSeleccionadosResponseDTO = {
        id: 1,
        usuarioId: 1,
        items: [{ id: 1, partidoId: 1, cantidad: 3 }],
        totalPartidos: 1,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      };
      vi.mocked(partidosSeleccionadosApi.actualizarCantidad).mockResolvedValue(mockData);

      const { result } = renderHook(() => useActualizarCantidadPartidoSeleccionado(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ usuarioId: 1, lineaPartidoSeleccionadoId: 1, cantidad: 3 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(partidosSeleccionadosApi.actualizarCantidad).toHaveBeenCalledWith(1, 1, 3);
    });
  });

  describe('useEliminarPartidoSeleccionado', () => {
    it('removes partido from seleccionados', async () => {
      vi.mocked(partidosSeleccionadosApi.eliminarItem).mockResolvedValue();

      const { result } = renderHook(() => useEliminarPartidoSeleccionado(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ usuarioId: 1, lineaPartidoSeleccionadoId: 1 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(partidosSeleccionadosApi.eliminarItem).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('useVaciarPartidosSeleccionados', () => {
    it('clears all partidos seleccionados', async () => {
      vi.mocked(partidosSeleccionadosApi.vaciar).mockResolvedValue();

      const { result } = renderHook(() => useVaciarPartidosSeleccionados(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(partidosSeleccionadosApi.vaciar).toHaveBeenCalledWith(1);
    });
  });
});

