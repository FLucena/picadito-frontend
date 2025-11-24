import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '../services/api';
import type { CategoriaDTO } from '../types';

export const useCategorias = () => {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.getAll,
  });
};

export const useCategoria = (id: number) => {
  return useQuery({
    queryKey: ['categorias', id],
    queryFn: () => categoriasApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoria: CategoriaDTO) => categoriasApi.create(categoria),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
};

export const useUpdateCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, categoria }: { id: number; categoria: CategoriaDTO }) =>
      categoriasApi.update(id, categoria),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['categorias', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
    },
  });
};

export const useDeleteCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
    },
  });
};

export const usePartidosByCategoria = (categoriaId: number) => {
  return useQuery({
    queryKey: ['partidos', 'categoria', categoriaId],
    queryFn: () => categoriasApi.getPartidosByCategoria(categoriaId),
    enabled: !!categoriaId,
  });
};

