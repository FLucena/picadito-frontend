import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { CategoriaBadge } from './CategoriaBadge';
import { formatFechaHoraCorta, formatFechaRelativa, getEstadoLabel } from '../utils/formatters';
import { Calendar, MapPin, Users, CalendarCheck, AlertCircle, Clock, ChevronDown, ChevronUp, Star } from 'lucide-react';
import type { PartidoResponseDTO } from '../types';
import { EstadoPartido } from '../types';

interface PartidoCardProps {
  partido: PartidoResponseDTO;
  onViewDetails: (id: number) => void;
  onInscribirse?: (id: number) => void;
  onAgregarAlEvento?: (id: number) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
  showCheckbox?: boolean;
}

import { EstadoPartido } from '../types';

const getEstadoVariant = (estado: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
  switch (estado) {
    case EstadoPartido.PROGRAMADO:
      return 'success';
    case EstadoPartido.EN_CURSO:
      return 'info';
    case EstadoPartido.FINALIZADO:
      return 'default';
    case EstadoPartido.CANCELADO:
      return 'error';
    default:
      return 'default';
  }
};

export const PartidoCard = ({ 
  partido, 
  onViewDetails, 
  onInscribirse, 
  onAgregarAlEvento,
  isSelected = false,
  onToggleSelect,
  showCheckbox = false
}: PartidoCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = (partido.cantidadParticipantes / partido.maxJugadores) * 100;
  const isDisponible = partido.estado === EstadoPartido.PROGRAMADO;
  const cuposDisponibles = partido.maxJugadores - partido.cantidadParticipantes;
  const pocosCupos = cuposDisponibles > 0 && cuposDisponibles <= 3;
  const fechaPartido = new Date(partido.fechaHora);
  const ahora = new Date();
  const esProximo = fechaPartido > ahora && fechaPartido.getTime() - ahora.getTime() < 24 * 60 * 60 * 1000;

  return (
    <Card className={`flex flex-col h-full group ${isSelected ? 'ring-2 ring-primary-500' : ''}`} variant="default">
      {/* Header */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {showCheckbox && onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(partido.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
              />
            )}
            <h3 className="text-lg font-medium text-gray-900 flex-1 leading-tight">{partido.titulo}</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <Badge variant={getEstadoVariant(partido.estado)} size="sm">
              {getEstadoLabel(partido.estado)}
            </Badge>
            {partido.categorias && partido.categorias.length > 0 && (
              partido.categorias.map((categoria) => (
                <CategoriaBadge key={categoria.id} categoria={categoria} size="sm" />
              ))
            )}
            {partido.promedioCalificacion && (
              <div className="flex items-center gap-0.5 text-yellow-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs font-medium text-gray-700">
                  {partido.promedioCalificacion.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Essential Info - Always Visible */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">{formatFechaHoraCorta(partido.fechaHora)}</div>
              {fechaPartido > ahora && (
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {formatFechaRelativa(partido.fechaHora)}
                </div>
              )}
            </div>
            {esProximo && (
              <Badge variant="warning" size="sm" className="flex-shrink-0">
                <AlertCircle className="h-3 w-3 mr-1" />
                Próximo
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">
              {partido.sede?.nombre || partido.sede?.direccion || partido.ubicacion || 'Sin ubicación'}
            </span>
          </div>

          {/* Players Info */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {partido.cantidadParticipantes}/{partido.maxJugadores}
              </span>
            </div>
            {pocosCupos && isDisponible && (
              <Badge variant="error" size="sm">
                {cuposDisponibles} cupo{cuposDisponibles !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progress >= 100 ? 'bg-warning-500' : 'bg-primary-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Expandable Description */}
        {partido.descripcion && (
          <div className="mb-4">
            {isExpanded ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 leading-relaxed">{partido.descripcion}</p>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
                >
                  <ChevronUp className="h-3 w-3" />
                  Ocultar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
              >
                <ChevronDown className="h-3 w-3" />
                Ver descripción
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(partido.id)}
            className="flex-1"
          >
            Detalles
          </Button>
          {isDisponible && onInscribirse && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onInscribirse(partido.id)}
              className="flex-1"
              disabled={partido.cantidadParticipantes >= partido.maxJugadores}
            >
              Inscribirse
            </Button>
          )}
        </div>
        {isDisponible && onAgregarAlEvento && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAgregarAlEvento(partido.id)}
            className="w-full flex items-center justify-center gap-2"
            disabled={partido.cantidadParticipantes >= partido.maxJugadores}
          >
            <CalendarCheck className="h-4 w-4" />
            Guardar
          </Button>
        )}
      </div>
    </Card>
  );
};

