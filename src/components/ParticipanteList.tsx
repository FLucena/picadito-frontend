import { Button } from './ui/Button';
import { formatFechaHoraCorta, getPosicionLabel, getNivelLabel, getNivelBadgeColor } from '../utils/formatters';
import { Trash2 } from 'lucide-react';
import type { ParticipanteResponseDTO } from '../types';

interface ParticipanteListProps {
  participantes: ParticipanteResponseDTO[];
  onDesinscribirse?: (participanteId: number) => void;
  isLoading?: boolean;
}

export const ParticipanteList = ({
  participantes,
  onDesinscribirse,
  isLoading = false,
}: ParticipanteListProps) => {
  if (participantes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay participantes inscritos aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {participantes.map((participante) => (
        <div
          key={participante.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">{participante.nombre}</h4>
                {participante.apodo && (
                  <span className="text-sm text-gray-500 italic">"{participante.apodo}"</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {participante.posicion && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {getPosicionLabel(participante.posicion)}
                  </span>
                )}
                {participante.nivel && (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getNivelBadgeColor(participante.nivel)}`}
                  >
                    {getNivelLabel(participante.nivel)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Inscrito el {formatFechaHoraCorta(participante.fechaInscripcion)}
              </p>
            </div>
            {onDesinscribirse && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDesinscribirse(participante.id)}
                disabled={isLoading}
                className="ml-4"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

