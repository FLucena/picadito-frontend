import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertasApi } from '../services/api';

export const useAlertas = (usuarioId: number, refetchInterval?: number) => {
  return useQuery({
    queryKey: ['alertas', usuarioId],
    queryFn: () => alertasApi.getByUsuario(usuarioId),
    enabled: !!usuarioId,
    refetchInterval: refetchInterval || false,
  });
};

export const useAlertasNoLeidas = (usuarioId: number, refetchInterval?: number) => {
  return useQuery({
    queryKey: ['alertas', usuarioId, 'no-leidas'],
    queryFn: () => alertasApi.getNoLeidas(usuarioId),
    enabled: !!usuarioId,
    refetchInterval: refetchInterval || 30000, // Default 30 seconds polling
  });
};

export const useMarcarAlertaLeida = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => alertasApi.marcarLeida(id),
    onSuccess: (_, id) => {
      // Invalidate all alertas queries to refresh the count
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
};

export const useMarcarTodasAlertasLeidas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usuarioId: number) => alertasApi.marcarTodasLeidas(usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
};

export const useDeleteAlerta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => alertasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
};

