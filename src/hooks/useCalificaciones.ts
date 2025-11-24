import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calificacionesApi } from '../services/api';
import type { CalificacionDTO } from '../types';

export const useCalificacionesByPartido = (partidoId: number) => {
  return useQuery({
    queryKey: ['calificaciones', 'partido', partidoId],
    queryFn: () => calificacionesApi.getByPartido(partidoId),
    enabled: !!partidoId,
  });
};

export const usePromedioCalificacionByPartido = (partidoId: number) => {
  return useQuery({
    queryKey: ['calificaciones', 'partido', partidoId, 'promedio'],
    queryFn: () => calificacionesApi.getPromedioByPartido(partidoId),
    enabled: !!partidoId,
  });
};

export const usePromedioCalificacionByCreador = (creadorNombre: string) => {
  return useQuery({
    queryKey: ['calificaciones', 'creador', creadorNombre, 'promedio'],
    queryFn: () => calificacionesApi.getPromedioByCreador(creadorNombre),
    enabled: !!creadorNombre,
  });
};

export const usePromedioCalificacionBySede = (sedeId: number) => {
  return useQuery({
    queryKey: ['calificaciones', 'sede', sedeId, 'promedio'],
    queryFn: () => calificacionesApi.getPromedioBySede(sedeId),
    enabled: !!sedeId,
  });
};

export const useCreateCalificacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, calificacion }: { usuarioId: number; calificacion: CalificacionDTO }) =>
      calificacionesApi.create(usuarioId, calificacion),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['calificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['calificaciones', 'partido', variables.calificacion.partidoId] });
      queryClient.invalidateQueries({ queryKey: ['partidos', variables.calificacion.partidoId] });
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
    },
  });
};

export const useDeleteCalificacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => calificacionesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
    },
  });
};

