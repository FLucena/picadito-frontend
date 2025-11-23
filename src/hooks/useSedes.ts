import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sedesApi } from '../services/api';
import type { SedeDTO } from '../types';

export const useSedes = () => {
  return useQuery({
    queryKey: ['sedes'],
    queryFn: sedesApi.getAll,
  });
};

export const useSede = (id: number) => {
  return useQuery({
    queryKey: ['sedes', id],
    queryFn: () => sedesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateSede = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sede: SedeDTO) => sedesApi.create(sede),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes'] });
    },
  });
};

export const useUpdateSede = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, sede }: { id: number; sede: SedeDTO }) =>
      sedesApi.update(id, sede),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sedes'] });
      queryClient.invalidateQueries({ queryKey: ['sedes', variables.id] });
    },
  });
};

export const useDeleteSede = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sedesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes'] });
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
    },
  });
};

export const useMigrarSedes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sedesApi.migrar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes'] });
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
    },
  });
};

