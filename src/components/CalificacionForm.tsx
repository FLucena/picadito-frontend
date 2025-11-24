import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from './ui/Button';
import { useCreateCalificacion } from '../hooks/useCalificaciones';
import { toast } from '../utils/toast';
import type { CalificacionDTO } from '../types';

interface CalificacionFormProps {
  partidoId: number;
  usuarioId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CalificacionForm = ({ partidoId, usuarioId, onSuccess, onCancel }: CalificacionFormProps) => {
  const [puntuacion, setPuntuacion] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [comentario, setComentario] = useState('');
  const createCalificacion = useCreateCalificacion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (puntuacion === 0) {
      toast.error('Por favor selecciona una puntuación');
      return;
    }

    const calificacion: CalificacionDTO = {
      puntuacion,
      comentario: comentario.trim() || undefined,
      partidoId,
    };

    createCalificacion.mutate(
      { usuarioId, calificacion },
      {
        onSuccess: () => {
          toast.success('Calificación enviada exitosamente');
          onSuccess?.();
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Error al enviar la calificación');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Puntuación <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setPuntuacion(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredStar || puntuacion)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {puntuacion > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              {puntuacion} {puntuacion === 1 ? 'estrella' : 'estrellas'}
            </span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-1">
          Comentario (opcional)
        </label>
        <textarea
          id="comentario"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Comparte tu experiencia con este partido..."
          maxLength={500}
        />
        <p className="mt-1 text-xs text-gray-500">{comentario.length}/500 caracteres</p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={createCalificacion.isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={createCalificacion.isPending} disabled={puntuacion === 0}>
          Enviar Calificación
        </Button>
      </div>
    </form>
  );
};

