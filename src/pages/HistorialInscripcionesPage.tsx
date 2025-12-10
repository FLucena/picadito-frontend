import { useState } from 'react';
import { Calendar, Users, X, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { CalificacionForm } from '../components/CalificacionForm';
import { useReservasPorUsuario, useCancelarReserva } from '../hooks/useInscripciones';
import { toast } from '../utils/toast';
import type { EstadoReserva } from '../types';

interface HistorialInscripcionesPageProps {
  onBack?: () => void;
  usuarioId?: number;
}

const getEstadoReservaBadgeColor = (estado: EstadoReserva) => {
  switch (estado) {
    case 'PENDIENTE':
      return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMADO':
      return 'bg-green-100 text-green-800';
    case 'EN_PROCESO':
      return 'bg-blue-100 text-blue-800';
    case 'FINALIZADO':
      return 'bg-gray-100 text-gray-800';
    case 'CANCELADO':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getEstadoReservaLabel = (estado: EstadoReserva) => {
  switch (estado) {
    case 'PENDIENTE':
      return 'Pendiente';
    case 'CONFIRMADO':
      return 'Confirmado';
    case 'EN_PROCESO':
      return 'En Proceso';
    case 'FINALIZADO':
      return 'Finalizado';
    case 'CANCELADO':
      return 'Cancelado';
    default:
      return estado;
  }
};

export const HistorialInscripcionesPage = ({ usuarioId = 1 }: HistorialInscripcionesPageProps) => {
  const { data: reservasRaw, isLoading, error } = useReservasPorUsuario(usuarioId);
  const cancelarReserva = useCancelarReserva();
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [inscripcionACancelar, setInscripcionACancelar] = useState<number | null>(null);
  const [showCalificacionModal, setShowCalificacionModal] = useState(false);
  const [partidoACalificar, setPartidoACalificar] = useState<number | null>(null);

  // Normalizar reservas para asegurar que sea un array
  const reservas = Array.isArray(reservasRaw) ? reservasRaw : [];

  const handleCancelar = (reservaId: number) => {
    setInscripcionACancelar(reservaId);
    setShowCancelarModal(true);
  };

  const handleConfirmarCancelar = () => {
    if (inscripcionACancelar !== null) {
      cancelarReserva.mutate(inscripcionACancelar, {
        onSuccess: () => {
          toast.success('Reserva cancelada exitosamente');
          setShowCancelarModal(false);
          setInscripcionACancelar(null);
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Error al cancelar la reserva');
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial de Reservas</h1>
          <p className="text-gray-600">Todas tus reservas confirmadas</p>
        </div>

        {error ? (
          <Card className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-red-600 text-lg font-semibold mb-2">Error al cargar historial</p>
            <p className="text-gray-600 text-sm mb-4">
              {error instanceof Error ? error.message : 'No se pudo cargar el historial de reservas. Por favor, intenta nuevamente.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reintentar
            </button>
          </Card>
        ) : !reservas || reservas.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tienes reservas registradas</p>
            <p className="text-gray-400 text-sm mt-2">
              Crea reservas desde "Mis Partidos" para verlas aquí
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {reservas.map((reserva) => (
              <Card key={reserva.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Reserva #{reserva.id}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoReservaBadgeColor(reserva.estado)}`}
                      >
                        {getEstadoReservaLabel(reserva.estado)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {Array.isArray(reserva.lineasReserva) ? reserva.lineasReserva.length : 0} partido{Array.isArray(reserva.lineasReserva) && reserva.lineasReserva.length !== 1 ? 's' : ''} • 
                      {' '}Total: ${reserva.total?.toFixed(2) || '0.00'} • 
                      {' '}Creada el {reserva.fechaCreacion ? (() => {
                        try {
                          const fecha = new Date(reserva.fechaCreacion);
                          return isNaN(fecha.getTime()) ? 'Fecha inválida' : fecha.toLocaleDateString('es-ES');
                        } catch {
                          return 'Fecha inválida';
                        }
                      })() : 'Fecha no disponible'}
                    </p>
                  </div>
                  {reserva.estado !== 'CANCELADO' && reserva.estado !== 'FINALIZADO' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelar(reserva.id)}
                      disabled={cancelarReserva.isPending}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  )}
                </div>

                <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                  {Array.isArray(reserva.lineasReserva) && reserva.lineasReserva.length > 0 ? (
                    reserva.lineasReserva.map((linea) => (
                    <div
                      key={linea.id}
                      className="bg-gray-50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">{linea.partidoTitulo || 'Partido sin título'}</h4>
                        <div className="space-y-1 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-gray-500" />
                            <span>Cantidad: {linea.cantidad}</span>
                          </div>
                          {linea.subtotal && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Subtotal:</span>
                              <span className="font-medium">${linea.subtotal.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {reserva.estado === 'FINALIZADO' && linea.partidoId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPartidoACalificar(linea.partidoId);
                            setShowCalificacionModal(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Star className="h-4 w-4" />
                          Calificar
                        </Button>
                      )}
                    </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No hay líneas de reserva disponibles</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <ConfirmModal
          isOpen={showCancelarModal}
          onClose={() => {
            setShowCancelarModal(false);
            setInscripcionACancelar(null);
          }}
          onConfirm={handleConfirmarCancelar}
          title="Cancelar Reserva"
          message="¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer."
          confirmText="Cancelar Reserva"
          variant="warning"
          isLoading={cancelarReserva.isPending}
        />

        {partidoACalificar && (
          <Modal
            isOpen={showCalificacionModal}
            onClose={() => {
              setShowCalificacionModal(false);
              setPartidoACalificar(null);
            }}
            title="Calificar Partido"
          >
            <CalificacionForm
              partidoId={partidoACalificar}
              usuarioId={usuarioId}
              onSuccess={() => {
                setShowCalificacionModal(false);
                setPartidoACalificar(null);
              }}
              onCancel={() => {
                setShowCalificacionModal(false);
                setPartidoACalificar(null);
              }}
            />
          </Modal>
        )}
      </div>
    </div>
  );
};

