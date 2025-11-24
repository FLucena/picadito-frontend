import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/api';

export const useEstadisticas = () => {
  return useQuery({
    queryKey: ['admin', 'estadisticas'],
    queryFn: adminApi.getEstadisticas,
  });
};

export const useEstadisticasPorPeriodo = (fechaInicio: string, fechaFin: string) => {
  return useQuery({
    queryKey: ['admin', 'estadisticas', 'periodo', fechaInicio, fechaFin],
    queryFn: () => adminApi.getEstadisticasPorPeriodo(fechaInicio, fechaFin),
    enabled: !!fechaInicio && !!fechaFin,
  });
};

export const useReporteVentas = (fechaInicio: string, fechaFin: string) => {
  return useQuery({
    queryKey: ['admin', 'reportes', 'ventas', fechaInicio, fechaFin],
    queryFn: () => adminApi.getReporteVentas(fechaInicio, fechaFin),
    enabled: !!fechaInicio && !!fechaFin,
  });
};

export const useReportePartidos = (fechaInicio: string, fechaFin: string) => {
  return useQuery({
    queryKey: ['admin', 'reportes', 'partidos', fechaInicio, fechaFin],
    queryFn: () => adminApi.getReportePartidos(fechaInicio, fechaFin),
    enabled: !!fechaInicio && !!fechaFin,
  });
};

export const useReporteUsuarios = (fechaInicio: string, fechaFin: string) => {
  return useQuery({
    queryKey: ['admin', 'reportes', 'usuarios', fechaInicio, fechaFin],
    queryFn: () => adminApi.getReporteUsuarios(fechaInicio, fechaFin),
    enabled: !!fechaInicio && !!fechaFin,
  });
};

