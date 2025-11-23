import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PartidoDTO, SedeDTO } from '../types';

// Mock axios completamente antes de importar api
vi.mock('axios', () => {
  // Crear mock de la instancia de axios dentro del factory
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
    // Exportar la instancia para uso en tests
    __mockInstance: mockAxiosInstance,
  };
});

// Importar después del mock
import axios from 'axios';
import { partidosApi, sedesApi } from './api';

describe('API Services', () => {
  let mockAxiosInstance: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Obtener la instancia mockeada (la misma que usa api.ts)
    mockAxiosInstance = axios.create({}) as typeof mockAxiosInstance;
  });

  describe('partidosApi', () => {
    it('getAll fetches all partidos', async () => {
      const mockPartidos = [
        { id: 1, titulo: 'Partido 1' },
        { id: 2, titulo: 'Partido 2' },
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: mockPartidos });

      const result = await partidosApi.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/partidos');
      expect(result).toEqual(mockPartidos);
    });

    it('getById fetches a single partido', async () => {
      const mockPartido = { id: 1, titulo: 'Partido 1' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockPartido });

      const result = await partidosApi.getById(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/partidos/1');
      expect(result).toEqual(mockPartido);
    });

    it('create creates a new partido', async () => {
      const newPartido: PartidoDTO = {
        titulo: 'New Partido',
        fechaHora: new Date().toISOString(),
        maxJugadores: 10,
        creadorNombre: 'Test User',
      };
      const createdPartido = { id: 1, ...newPartido };
      mockAxiosInstance.post.mockResolvedValue({ data: createdPartido });

      const result = await partidosApi.create(newPartido);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/partidos', newPartido);
      expect(result).toEqual(createdPartido);
    });

    it('update updates an existing partido', async () => {
      const updatedPartido: PartidoDTO = {
        titulo: 'Updated Partido',
        fechaHora: new Date().toISOString(),
        maxJugadores: 12,
        creadorNombre: 'Test User',
      };
      const responsePartido = { id: 1, ...updatedPartido };
      mockAxiosInstance.put.mockResolvedValue({ data: responsePartido });

      const result = await partidosApi.update(1, updatedPartido);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/partidos/1', updatedPartido);
      expect(result).toEqual(responsePartido);
    });

    it('delete removes a partido', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: {} });

      await partidosApi.delete(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/partidos/1');
    });
  });

  describe('sedesApi', () => {
    it('getAll fetches all sedes', async () => {
      const mockSedes = [
        { id: 1, nombre: 'Sede 1' },
        { id: 2, nombre: 'Sede 2' },
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: mockSedes });

      const result = await sedesApi.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/sedes');
      expect(result).toEqual(mockSedes);
    });

    it('create creates a new sede', async () => {
      const newSede: SedeDTO = {
        nombre: 'New Sede',
        direccion: 'Address 123',
      };
      const createdSede = { id: 1, ...newSede };
      mockAxiosInstance.post.mockResolvedValue({ data: createdSede });

      const result = await sedesApi.create(newSede);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/sedes', newSede);
      expect(result).toEqual(createdSede);
    });
  });
});
