import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partidosApi } from '../services/api';
import type { PartidoDTO, BusquedaPartidoDTO } from '../types';

export const usePartidos = () => {
  return useQuery({
    queryKey: ['partidos'],
    queryFn: partidosApi.getAll,
  });
};

export const usePartidosDisponibles = () => {
  return useQuery({
    queryKey: ['partidos', 'disponibles'],
    queryFn: partidosApi.getDisponibles,
  });
};

export const usePartido = (id: number) => {
  return useQuery({
    queryKey: ['partidos', id],
    queryFn: () => partidosApi.getById(id),
    enabled: !!id,
  });
};

export const useCreatePartido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partido: PartidoDTO) => partidosApi.create(partido),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
    },
  });
};

export const useUpdatePartido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, partido }: { id: number; partido: PartidoDTO }) =>
      partidosApi.update(id, partido),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
      queryClient.invalidateQueries({ queryKey: ['partidos', variables.id] });
    },
  });
};

export const useDeletePartido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => partidosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
    },
  });
};

export const useBuscarPartidos = (busqueda: BusquedaPartidoDTO | null) => {
  return useQuery({
    queryKey: ['partidos', 'busqueda', busqueda],
    queryFn: () => partidosApi.buscar(busqueda!),
    enabled: busqueda !== null,
  });
};

export const useCostoPorJugador = (partidoId: number) => {
  return useQuery({
    queryKey: ['partidos', partidoId, 'costo-por-jugador'],
    queryFn: () => partidosApi.getCostoPorJugador(partidoId),
    enabled: !!partidoId,
  });
};

