import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservasApi } from '../services/api';
import type { EstadoReserva } from '../types';

// Hooks para Reservas (nuevo sistema)
export const useReservas = () => {
  return useQuery({
    queryKey: ['reservas'],
    queryFn: () => reservasApi.getAll(),
  });
};

export const useReserva = (id: number) => {
  return useQuery({
    queryKey: ['reservas', id],
    queryFn: () => reservasApi.getById(id),
    enabled: !!id,
  });
};

export const useReservasPorUsuario = (usuarioId: number) => {
  return useQuery({
    queryKey: ['reservas', 'usuario', usuarioId],
    queryFn: () => reservasApi.getByUsuario(usuarioId),
    enabled: !!usuarioId,
  });
};

export const useTotalGastado = (usuarioId: number) => {
  return useQuery({
    queryKey: ['reservas', 'total-gastado', usuarioId],
    queryFn: () => reservasApi.getTotalGastado(usuarioId),
    enabled: !!usuarioId,
  });
};

export const useCrearReservaDesdePartidosSeleccionados = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usuarioId: number) =>
      reservasApi.crearDesdePartidosSeleccionados(usuarioId),
    onSuccess: (_, usuarioId) => {
      queryClient.invalidateQueries({ queryKey: ['reservas', 'usuario', usuarioId] });
      queryClient.invalidateQueries({ queryKey: ['partidos-seleccionados', usuarioId] });
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
    },
  });
};

export const useActualizarEstadoReserva = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoReserva }) =>
      reservasApi.actualizarEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
    },
  });
};

export const useCancelarReserva = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reservasApi.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
    },
  });
};

