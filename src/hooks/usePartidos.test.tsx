import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePartidos, usePartido, useCreatePartido } from './usePartidos';
import { partidosApi } from '../services/api';
import type { PartidoResponseDTO } from '../types';

// Mock del API
vi.mock('../services/api', () => ({
  partidosApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
  },
}));

// Helper para crear wrapper con QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('usePartidos hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePartidos', () => {
    it('fetches all partidos', async () => {
      const mockPartidos = [
        { id: 1, titulo: 'Partido 1' },
        { id: 2, titulo: 'Partido 2' },
      ];
      vi.mocked(partidosApi.getAll).mockResolvedValue(mockPartidos as PartidoResponseDTO[]);

      const { result } = renderHook(() => usePartidos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPartidos);
      expect(partidosApi.getAll).toHaveBeenCalledTimes(1);
    });

    it('handles error when fetching partidos', async () => {
      const error = new Error('Failed to fetch');
      vi.mocked(partidosApi.getAll).mockRejectedValue(error);

      const { result } = renderHook(() => usePartidos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('usePartido', () => {
    it('fetches a single partido by id', async () => {
      const mockPartido = { id: 1, titulo: 'Partido 1' };
      vi.mocked(partidosApi.getById).mockResolvedValue(mockPartido as PartidoResponseDTO);

      const { result } = renderHook(() => usePartido(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPartido);
      expect(partidosApi.getById).toHaveBeenCalledWith(1);
    });

    it('does not fetch when id is not provided', () => {
      const { result } = renderHook(() => usePartido(0), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(partidosApi.getById).not.toHaveBeenCalled();
    });
  });

  describe('useCreatePartido', () => {
    it('creates a partido and invalidates queries', async () => {
      const newPartido = {
        titulo: 'New Partido',
        fechaHora: new Date().toISOString(),
        maxJugadores: 10,
        creadorNombre: 'Test User',
      };
      const createdPartido = { id: 1, ...newPartido };
      vi.mocked(partidosApi.create).mockResolvedValue(createdPartido as PartidoResponseDTO);

      const { result } = renderHook(() => useCreatePartido(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newPartido);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(partidosApi.create).toHaveBeenCalledWith(newPartido);
      expect(result.current.data).toEqual(createdPartido);
    });
  });
});

