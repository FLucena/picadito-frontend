import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategorias, useCategoria, useCreateCategoria } from './useCategorias';
import { categoriasApi } from '../services/api';
import type { CategoriaResponseDTO } from '../types';

vi.mock('../services/api', () => ({
  categoriasApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
  },
}));

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

describe('useCategorias hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCategorias', () => {
    it('fetches all categorias', async () => {
      const mockCategorias = [
        { id: 1, nombre: 'Fútbol 11', icono: '⚽', color: '#1E88E5' },
        { id: 2, nombre: 'Fútbol 7', icono: '⚽', color: '#43A047' },
      ];
      vi.mocked(categoriasApi.getAll).mockResolvedValue(mockCategorias as CategoriaResponseDTO[]);

      const { result } = renderHook(() => useCategorias(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockCategorias);
      expect(categoriasApi.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('useCategoria', () => {
    it('fetches a single categoria by id', async () => {
      const mockCategoria = { id: 1, nombre: 'Fútbol 11', icono: '⚽', color: '#1E88E5' };
      vi.mocked(categoriasApi.getById).mockResolvedValue(mockCategoria as CategoriaResponseDTO);

      const { result } = renderHook(() => useCategoria(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockCategoria);
      expect(categoriasApi.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('useCreateCategoria', () => {
    it('creates a categoria and invalidates queries', async () => {
      const newCategoria = {
        nombre: 'Fútbol 5',
        icono: '⚽',
        color: '#FB8C00',
      };
      const createdCategoria = { id: 3, ...newCategoria };
      vi.mocked(categoriasApi.create).mockResolvedValue(createdCategoria as CategoriaResponseDTO);

      const { result } = renderHook(() => useCreateCategoria(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newCategoria);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(categoriasApi.create).toHaveBeenCalledWith(newCategoria);
      expect(result.current.data).toEqual(createdCategoria);
    });
  });
});

