import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, ExternalLink, CheckCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { useAlertasNoLeidas, useMarcarAlertaLeida, useMarcarTodasAlertasLeidas, useDeleteAlerta } from '../hooks/useAlertas';
import { toast } from '../utils/toast';
import type { AlertaResponseDTO, TipoAlerta } from '../types';

interface AlertasPanelProps {
  usuarioId: number;
  onNavigateToPartido?: (partidoId: number) => void;
}

const getTipoAlertaLabel = (tipo: TipoAlerta): string => {
  const labels: Record<TipoAlerta, string> = {
    CUPOS_BAJOS: 'Cupos Bajos',
    PARTIDO_PROXIMO: 'Partido Próximo',
    RESERVA_CONFIRMADA: 'Reserva Confirmada',
    PARTIDO_CANCELADO: 'Partido Cancelado',
    PARTIDO_COMPLETO: 'Partido Completo',
  };
  return labels[tipo] || tipo;
};

const getTipoAlertaVariant = (tipo: TipoAlerta): 'default' | 'success' | 'warning' | 'error' | 'info' => {
  switch (tipo) {
    case 'CUPOS_BAJOS':
      return 'warning';
    case 'PARTIDO_PROXIMO':
      return 'info';
    case 'RESERVA_CONFIRMADA':
      return 'success';
    case 'PARTIDO_CANCELADO':
      return 'error';
    case 'PARTIDO_COMPLETO':
      return 'default';
    default:
      return 'default';
  }
};

export const AlertasPanel = ({ usuarioId, onNavigateToPartido }: AlertasPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { data: alertasNoLeidas = [], isLoading } = useAlertasNoLeidas(usuarioId, 30000); // Polling cada 30s
  const marcarLeida = useMarcarAlertaLeida();
  const marcarTodasLeidas = useMarcarTodasAlertasLeidas();
  const deleteAlerta = useDeleteAlerta();

  const count = alertasNoLeidas.length;

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarcarLeida = (id: number) => {
    marcarLeida.mutate(id, {
      onSuccess: () => {
        toast.success('Alerta marcada como leída');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Error al marcar la alerta');
      },
    });
  };

  const handleMarcarTodasLeidas = () => {
    marcarTodasLeidas.mutate(usuarioId, {
      onSuccess: () => {
        toast.success('Todas las alertas marcadas como leídas');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Error al marcar las alertas');
      },
    });
  };

  const handleDelete = (id: number) => {
    deleteAlerta.mutate(id, {
      onSuccess: () => {
        toast.success('Alerta eliminada');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Error al eliminar la alerta');
      },
    });
  };

  const handleNavigateToPartido = (partidoId: number | undefined) => {
    if (partidoId && onNavigateToPartido) {
      onNavigateToPartido(partidoId);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Alertas"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 md:w-96 max-h-96 overflow-hidden z-50 shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Alertas</h3>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarcarTodasLeidas}
                  disabled={marcarTodasLeidas.isPending}
                  className="text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Marcar todas
                </Button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-80">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Cargando alertas...</p>
              </div>
            ) : alertasNoLeidas.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No tienes alertas nuevas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alertasNoLeidas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Badge variant={getTipoAlertaVariant(alerta.tipo)} size="sm">
                        {getTipoAlertaLabel(alerta.tipo)}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{alerta.mensaje}</p>
                        {alerta.partidoTitulo && (
                          <p className="text-xs text-gray-500 mt-1">{alerta.partidoTitulo}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(alerta.fechaCreacion).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {alerta.partidoId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNavigateToPartido(alerta.partidoId)}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver partido
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarcarLeida(alerta.id)}
                        disabled={marcarLeida.isPending}
                        className="text-xs"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Leída
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(alerta.id)}
                        disabled={deleteAlerta.isPending}
                        className="text-xs text-error-600 hover:text-error-700"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

