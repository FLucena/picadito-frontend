import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equiposApi } from '../services/api';

export const useEquiposByPartido = (partidoId: number) => {
  return useQuery({
    queryKey: ['equipos', 'partido', partidoId],
    queryFn: () => equiposApi.getByPartido(partidoId),
    enabled: !!partidoId,
  });
};

export const useEquipo = (id: number) => {
  return useQuery({
    queryKey: ['equipos', id],
    queryFn: () => equiposApi.getById(id),
    enabled: !!id,
  });
};

export const useGenerarEquipos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partidoId: number) => equiposApi.generarEquipos(partidoId),
    onSuccess: (_, partidoId) => {
      queryClient.invalidateQueries({ queryKey: ['equipos', 'partido', partidoId] });
      queryClient.invalidateQueries({ queryKey: ['partidos', partidoId] });
    },
  });
};

export const useDeleteEquipos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partidoId: number) => equiposApi.delete(partidoId),
    onSuccess: (_, partidoId) => {
      queryClient.invalidateQueries({ queryKey: ['equipos', 'partido', partidoId] });
      queryClient.invalidateQueries({ queryKey: ['partidos', partidoId] });
    },
  });
};

