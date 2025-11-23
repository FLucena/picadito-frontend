import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partidosSeleccionadosApi } from '../services/api';

// Hook principal para obtener partidos seleccionados
export const usePartidosSeleccionados = (usuarioId: number) => {
  return useQuery({
    queryKey: ['partidos-seleccionados', usuarioId],
    queryFn: () => partidosSeleccionadosApi.getByUsuario(usuarioId),
    enabled: !!usuarioId,
  });
};

// Mantener compatibilidad con nombre antiguo
export const usePartidosGuardados = usePartidosSeleccionados;

export const useAgregarPartidoSeleccionado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, partidoId, cantidad = 1 }: { usuarioId: number; partidoId: number; cantidad?: number }) =>
      partidosSeleccionadosApi.agregarPartido(usuarioId, partidoId, cantidad),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partidos-seleccionados', variables.usuarioId] });
    },
  });
};

// Mantener compatibilidad con nombre antiguo
export const useAgregarPartidoGuardado = useAgregarPartidoSeleccionado;

export const useActualizarCantidadPartidoSeleccionado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, lineaPartidoSeleccionadoId, cantidad }: { usuarioId: number; lineaPartidoSeleccionadoId: number; cantidad: number }) =>
      partidosSeleccionadosApi.actualizarCantidad(usuarioId, lineaPartidoSeleccionadoId, cantidad),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partidos-seleccionados', variables.usuarioId] });
    },
  });
};

export const useEliminarPartidoSeleccionado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ usuarioId, lineaPartidoSeleccionadoId }: { usuarioId: number; lineaPartidoSeleccionadoId: number }) =>
      partidosSeleccionadosApi.eliminarItem(usuarioId, lineaPartidoSeleccionadoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partidos-seleccionados', variables.usuarioId] });
    },
  });
};

// Mantener compatibilidad con nombre antiguo
export const useEliminarPartidoGuardado = useEliminarPartidoSeleccionado;

export const useVaciarPartidosSeleccionados = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usuarioId: number) => partidosSeleccionadosApi.vaciar(usuarioId),
    onSuccess: (_, usuarioId) => {
      queryClient.invalidateQueries({ queryKey: ['partidos-seleccionados', usuarioId] });
    },
  });
};

// Mantener compatibilidad con nombre antiguo
export const useVaciarPartidosGuardados = useVaciarPartidosSeleccionados;

