import { Star } from 'lucide-react';
import { Card } from './ui/Card';
import { useCalificacionesByPartido, usePromedioCalificacionByPartido } from '../hooks/useCalificaciones';
import { formatFechaHora } from '../utils/formatters';

interface CalificacionDisplayProps {
  partidoId: number;
  showPromedio?: boolean;
  showResenas?: boolean;
}

export const CalificacionDisplay = ({ partidoId, showPromedio = true, showResenas = true }: CalificacionDisplayProps) => {
  const { data: calificaciones = [], isLoading } = useCalificacionesByPartido(partidoId);
  const { data: promedio } = usePromedioCalificacionByPartido(partidoId);

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">Cargando calificaciones...</p>
      </div>
    );
  }

  if (calificaciones.length === 0 && !promedio) {
    return null;
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {showPromedio && promedio && (
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Calificación promedio</p>
            {renderStars(promedio, 'md')}
          </div>
          <div className="text-sm text-gray-500">
            {calificaciones.length} {calificaciones.length === 1 ? 'calificación' : 'calificaciones'}
          </div>
        </div>
      )}

      {showResenas && calificaciones.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Reseñas</h4>
          {calificaciones.map((calificacion) => (
            <Card key={calificacion.id} variant="default" className="p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{calificacion.usuarioNombre}</p>
                  <p className="text-xs text-gray-500">
                    {formatFechaHora(calificacion.fechaCreacion)}
                  </p>
                </div>
                {renderStars(calificacion.puntuacion, 'sm')}
              </div>
              {calificacion.comentario && (
                <p className="text-sm text-gray-700 mt-2">{calificacion.comentario}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

