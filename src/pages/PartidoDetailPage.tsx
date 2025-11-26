import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Edit, Trash2, User, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Tabs } from '../components/ui/Tabs';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { ParticipanteForm } from '../components/ParticipanteForm';
import { ParticipanteList } from '../components/ParticipanteList';
import { CanchaVisualization } from '../components/CanchaVisualization';
import { PartidoForm } from '../components/PartidoForm';
import { CategoriaBadge } from '../components/CategoriaBadge';
import { CalificacionDisplay } from '../components/CalificacionDisplay';
import { EquiposDisplay } from '../components/EquiposDisplay';
import { usePartido, useUpdatePartido, useDeletePartido } from '../hooks/usePartidos';
import { useParticipantes, useInscribirse, useDesinscribirse } from '../hooks/useParticipantes';
import {
  formatFechaHora,
  getEstadoLabel,
} from '../utils/formatters';
import { toast } from '../utils/toast';
import type { PartidoFormData, ParticipanteFormData } from '../utils/validators';
import type { Posicion, Nivel } from '../types';

const getEstadoVariant = (estado: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
  switch (estado) {
    case 'DISPONIBLE':
      return 'success';
    case 'COMPLETO':
      return 'warning';
    case 'FINALIZADO':
      return 'default';
    case 'CANCELADO':
      return 'error';
    default:
      return 'default';
  }
};

interface PartidoDetailPageProps {
  partidoId: number;
  onBack: () => void;
  onPartidoUpdated?: () => void;
  initialShowInscripcionModal?: boolean;
  onInscripcionModalClose?: () => void;
}

export const PartidoDetailPage = ({
  partidoId,
  onBack,
  onPartidoUpdated,
  initialShowInscripcionModal = false,
  onInscripcionModalClose,
}: PartidoDetailPageProps) => {
  const [showInscripcionModal, setShowInscripcionModal] = useState(false);

  // Abrir modal automáticamente si viene desde el botón Inscribirse
  useEffect(() => {
    if (initialShowInscripcionModal) {
      setShowInscripcionModal(true);
    }
  }, [initialShowInscripcionModal]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: partido, isLoading: isLoadingPartido } = usePartido(partidoId);
  const { data: participantes, isLoading: isLoadingParticipantes } = useParticipantes(partidoId);

  const updatePartido = useUpdatePartido();
  const deletePartido = useDeletePartido();
  const inscribirse = useInscribirse();
  const desinscribirse = useDesinscribirse();

  const handleInscribirse = (data: ParticipanteFormData) => {
    inscribirse.mutate(
      {
        partidoId,
        participante: {
          ...data,
          posicion: data.posicion as Posicion | undefined,
          nivel: data.nivel as Nivel | undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Te has inscrito correctamente al partido');
          setShowInscripcionModal(false);
          onInscripcionModalClose?.();
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Error al inscribirse');
        },
      }
    );
  };

  const handleUpdatePartido = (data: PartidoFormData) => {
    // Transformar datos: solo enviar categoriaIds si hay categorías seleccionadas
    const partidoData: import('../types').PartidoDTO = {
      ...data,
      categoriaIds: data.categoriaIds && data.categoriaIds.length > 0 ? data.categoriaIds : undefined,
    };
    updatePartido.mutate(
      { id: partidoId, partido: partidoData },
      {
        onSuccess: () => {
          toast.success('Partido actualizado correctamente');
          setShowEditModal(false);
          onPartidoUpdated?.();
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Error al actualizar el partido');
        },
      }
    );
  };

  const handleDeletePartido = () => {
    deletePartido.mutate(partidoId, {
      onSuccess: () => {
        toast.success('Partido eliminado correctamente');
        onBack();
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Error al eliminar el partido');
        setShowDeleteModal(false);
      },
    });
  };

  const handleDesinscribirse = (participanteId: number) => {
    desinscribirse.mutate(
      { partidoId, participanteId },
      {
        onSuccess: () => {
          toast.success('Te has desinscrito del partido');
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Error al desinscribirse');
        },
      }
    );
  };

  if (isLoadingPartido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando partido...</p>
        </div>
      </div>
    );
  }

  if (!partido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Partido no encontrado</p>
        </div>
      </div>
    );
  }

  const progress = (partido.cantidadParticipantes / partido.maxJugadores) * 100;
  const isDisponible = partido.estado === 'DISPONIBLE';
  const canInscribirse = isDisponible && partido.cantidadParticipantes < partido.maxJugadores;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <Card className="mb-6" variant="default">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-medium text-gray-900">{partido.titulo}</h1>
                <Badge variant={getEstadoVariant(partido.estado)} size="md">
                  {getEstadoLabel(partido.estado)}
                </Badge>
                {partido.categorias && partido.categorias.length > 0 && (
                  partido.categorias.map((categoria) => (
                    <CategoriaBadge key={categoria.id} categoria={categoria} size="md" />
                  ))
                )}
                {partido.promedioCalificacion && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="text-sm font-medium text-gray-700">
                      {partido.promedioCalificacion.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              {partido.descripcion && (
                <p className="text-gray-600 leading-relaxed">{partido.descripcion}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 text-error-600 hover:text-error-700 hover:bg-error-50"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Fecha y Hora</p>
                <p className="text-sm font-medium text-gray-900">{formatFechaHora(partido.fechaHora)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Ubicación</p>
                <p className="text-sm font-medium text-gray-900">
                  {partido.sede?.nombre || partido.sede?.direccion || partido.ubicacion || 'Sin ubicación'}
                </p>
                {partido.sede && (
                  <div className="mt-1 space-y-1">
                    {partido.sede.direccion && partido.sede.nombre && (
                      <p className="text-xs text-gray-500">{partido.sede.direccion}</p>
                    )}
                    {partido.sede.telefono && (
                      <p className="text-xs text-gray-500">Tel: {partido.sede.telefono}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Jugadores</p>
                <p className="text-sm font-medium text-gray-900">
                  {partido.cantidadParticipantes} / {partido.maxJugadores}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Creado por</p>
                <p className="text-sm font-medium text-gray-900">{partido.creadorNombre}</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Progreso de inscripciones</span>
              <span className="font-medium text-gray-700">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progress >= 100 ? 'bg-warning-500' : 'bg-primary-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Inscribirse Button - Desktop */}
          {canInscribirse && (
            <Button
              variant="primary"
              onClick={() => setShowInscripcionModal(true)}
              className="hidden sm:flex items-center gap-2"
            >
              Inscribirse al Partido
            </Button>
          )}
        </Card>

        <Card variant="default">
          <Tabs
            tabs={[
              {
                id: 'lista',
                label: 'Lista',
                content: (
                  <>
                    {isLoadingParticipantes ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                        <p className="text-sm text-gray-500">Cargando participantes...</p>
                      </div>
                    ) : (
                      <ParticipanteList
                        participantes={participantes || []}
                        onDesinscribirse={handleDesinscribirse}
                        isLoading={desinscribirse.isPending}
                      />
                    )}
                  </>
                ),
              },
              {
                id: 'cancha',
                label: 'Cancha',
                content: (
                  <>
                    {isLoadingParticipantes ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                        <p className="text-sm text-gray-500">Cargando participantes...</p>
                      </div>
                    ) : (
                      <CanchaVisualization
                        participantes={participantes || []}
                        partidoId={partidoId}
                        maxJugadores={partido.maxJugadores}
                        canInscribirse={canInscribirse}
                      />
                    )}
                  </>
                ),
              },
              {
                id: 'equipos',
                label: 'Equipos',
                content: (
                  <EquiposDisplay
                    partidoId={partidoId}
                    cantidadParticipantes={partido.cantidadParticipantes}
                    maxJugadores={partido.maxJugadores}
                  />
                ),
              },
              {
                id: 'calificaciones',
                label: 'Calificaciones',
                content: (
                  <CalificacionDisplay
                    partidoId={partidoId}
                    showPromedio={true}
                    showResenas={true}
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>

      {/* FAB para móvil */}
      {canInscribirse && (
        <FloatingActionButton
          onClick={() => setShowInscripcionModal(true)}
          icon={<Users className="h-6 w-6" />}
          label="Inscribirse"
          position="bottom-right"
          size="md"
          className="sm:hidden"
        />
      )}

      <Modal
        isOpen={showInscripcionModal}
        onClose={() => {
          setShowInscripcionModal(false);
          onInscripcionModalClose?.();
        }}
        title="Inscribirse al Partido"
      >
        <ParticipanteForm
          onSubmit={handleInscribirse}
          onCancel={() => {
            setShowInscripcionModal(false);
            onInscripcionModalClose?.();
          }}
          isLoading={inscribirse.isPending}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Partido"
      >
        <PartidoForm
          partido={partido}
          onSubmit={handleUpdatePartido}
          onCancel={() => setShowEditModal(false)}
          isLoading={updatePartido.isPending}
        />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar Partido"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeletePartido} isLoading={deletePartido.isPending}>
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          ¿Estás seguro de que deseas eliminar este partido? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
};

