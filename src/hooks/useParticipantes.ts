import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { participantesApi } from '../services/api';
import type { ParticipanteDTO } from '../types';

export const useParticipantes = (partidoId: number) => {
  return useQuery({
    queryKey: ['participantes', partidoId],
    queryFn: () => participantesApi.getByPartido(partidoId),
    enabled: !!partidoId,
  });
};

export const useInscribirse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ partidoId, participante }: { partidoId: number; participante: ParticipanteDTO }) =>
      participantesApi.inscribirse(partidoId, participante),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['participantes', variables.partidoId] });
      queryClient.invalidateQueries({ queryKey: ['partidos', variables.partidoId] });
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
    },
  });
};

export const useDesinscribirse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ partidoId, participanteId }: { partidoId: number; participanteId: number }) =>
      participantesApi.desinscribirse(partidoId, participanteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['participantes', variables.partidoId] });
      queryClient.invalidateQueries({ queryKey: ['partidos', variables.partidoId] });
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
    },
  });
};

