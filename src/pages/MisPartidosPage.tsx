import { useState, useEffect, useRef, useMemo } from 'react';
import { Trash2, MapPin, Users, CheckCircle, CalendarCheck, AlertTriangle, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';
import { usePartidosSeleccionados, useEliminarPartidoSeleccionado, useVaciarPartidosSeleccionados } from '../hooks/usePartidosGuardados';
import { useCrearReservaDesdePartidosSeleccionados } from '../hooks/useInscripciones';
import { usePartido, useCostoPorJugador } from '../hooks/usePartidos';
import { partidosApi } from '../services/api';
import { formatPrecio } from '../utils/formatters';
import { toast } from '../utils/toast';

// Componente para mostrar información de jugadores del partido
const PartidoJugadoresInfo = ({ partidoId }: { partidoId: number }) => {
  const { data: partido, isLoading } = usePartido(partidoId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Users className="h-4 w-4 text-gray-400" />
        <span>Cargando...</span>
      </div>
    );
  }

  if (!partido) {
    return null;
  }

  const estaCompleto = partido.cantidadParticipantes === partido.maxJugadores;
  const cuposDisponibles = partido.maxJugadores - partido.cantidadParticipantes;

  return (
    <div className="flex items-center gap-2 text-sm">
      <Users className={`h-4 w-4 ${estaCompleto ? 'text-green-600' : 'text-gray-500'}`} />
      <span className="text-gray-700">
        <strong>{partido.cantidadParticipantes}</strong> / <strong>{partido.maxJugadores}</strong> jugadores
        {estaCompleto ? (
          <span className="ml-2 text-green-600 font-medium">✓ Completo</span>
        ) : (
          <span className="ml-2 text-gray-500">({cuposDisponibles} cupo{cuposDisponibles !== 1 ? 's' : ''} disponible{cuposDisponibles !== 1 ? 's' : ''})</span>
        )}
      </span>
    </div>
  );
};

// Componente para mostrar el precio del partido
const PartidoPrecio = ({ partidoId, cantidad }: { partidoId: number; cantidad: number }) => {
  const { data: partido } = usePartido(partidoId);
  const { data: costoPorJugador } = useCostoPorJugador(partidoId);

  if (!partido?.precio && !costoPorJugador) {
    return null;
  }

  const precioTotal = costoPorJugador ? costoPorJugador * cantidad : (partido?.precio ? (partido.precio / (partido.maxJugadores || 1)) * cantidad : 0);

  return (
    <div className="flex items-center gap-2 text-sm">
      <DollarSign className="h-4 w-4 text-green-600" />
      <span className="text-gray-700">
        {costoPorJugador ? (
          <>
            {formatPrecio(costoPorJugador)} por jugador × {cantidad} = <strong className="text-green-600">{formatPrecio(precioTotal)}</strong>
          </>
        ) : partido?.precio ? (
          <>
            {formatPrecio(partido.precio / (partido.maxJugadores || 1))} por jugador × {cantidad} = <strong className="text-green-600">{formatPrecio(precioTotal)}</strong>
          </>
        ) : null}
      </span>
    </div>
  );
};

interface MisPartidosPageProps {
  onBack: () => void;
  usuarioId?: number;
  onViewPartidoDetails: (id: number) => void;
}

export const MisPartidosPage = ({ onBack, usuarioId = 1, onViewPartidoDetails }: MisPartidosPageProps) => {
  const [showConfirmarModal, setShowConfirmarModal] = useState(false);
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [showVaciarModal, setShowVaciarModal] = useState(false);
  const [lineaPartidoGuardadoAEliminar, setLineaPartidoGuardadoAEliminar] = useState<number | null>(null);
  const [partidosSeleccionadosIds, setPartidosSeleccionadosIds] = useState<Set<number>>(new Set());

  const { data: partidosSeleccionados, isLoading } = usePartidosSeleccionados(usuarioId);
  const crearReserva = useCrearReservaDesdePartidosSeleccionados();
  const eliminarPartido = useEliminarPartidoSeleccionado();
  const vaciarPartidosSeleccionados = useVaciarPartidosSeleccionados();

  const partidos = useMemo(() => partidosSeleccionados?.items || [], [partidosSeleccionados]);

  // Inicializar todos los partidos como seleccionados solo una vez cuando se cargan los partidos
  const partidosIds = useMemo(() => partidos.map((p) => p.id || 0).filter((id) => id > 0), [partidos]);
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (partidosIds.length > 0 && !initializedRef.current) {
      setPartidosSeleccionadosIds(new Set(partidosIds));
      initializedRef.current = true;
    }
    // Reset initialization flag if partidos change
    if (partidosIds.length === 0) {
      initializedRef.current = false;
    }
  }, [partidosIds]);

  const togglePartidoSeleccionado = (lineaId: number) => {
    const newSet = new Set(partidosSeleccionadosIds);
    if (newSet.has(lineaId)) {
      newSet.delete(lineaId);
    } else {
      newSet.add(lineaId);
    }
    setPartidosSeleccionadosIds(newSet);
  };

  const toggleSeleccionarTodos = () => {
    const todosSeleccionados = partidos.length > 0 && partidos.every((p) => p.id && partidosSeleccionadosIds.has(p.id));
    if (todosSeleccionados) {
      setPartidosSeleccionadosIds(new Set());
    } else {
      setPartidosSeleccionadosIds(new Set(partidos.map((p) => p.id || 0).filter((id) => id > 0)));
    }
  };

  const partidosSeleccionadosParaConfirmar = partidos.filter((p) => partidosSeleccionadosIds.has(p.id || 0));
  const todosSeleccionados = partidos.length > 0 && partidos.every((p) => p.id && partidosSeleccionadosIds.has(p.id));
  const algunosSeleccionados = partidosSeleccionadosIds.size > 0 && partidosSeleccionadosIds.size < partidos.length;
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = algunosSeleccionados;
    }
  }, [algunosSeleccionados]);

  const handleEliminarPartido = (lineaPartidoSeleccionadoId: number) => {
    setLineaPartidoGuardadoAEliminar(lineaPartidoSeleccionadoId);
    setShowEliminarModal(true);
  };

  const handleConfirmarEliminar = () => {
    if (lineaPartidoGuardadoAEliminar !== null) {
      eliminarPartido.mutate(
        { usuarioId, lineaPartidoSeleccionadoId: lineaPartidoGuardadoAEliminar },
        {
          onSuccess: () => {
            toast.success('Partido eliminado de tus partidos');
            setShowEliminarModal(false);
            setLineaPartidoGuardadoAEliminar(null);
          },
          onError: (error: Error) => {
            toast.error(error.message || 'Error al eliminar el partido');
          },
        }
      );
    }
  };

  const handleVaciarPartidosSeleccionados = () => {
    setShowVaciarModal(true);
  };

  const handleConfirmarVaciar = () => {
    vaciarPartidosSeleccionados.mutate(usuarioId, {
      onSuccess: () => {
        toast.success('Partidos eliminados');
        setShowVaciarModal(false);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Error al eliminar los partidos');
      },
    });
  };

  const handleAbrirConfirmarModal = () => {
    if (partidosSeleccionadosParaConfirmar.length === 0) {
      toast.error('Por favor selecciona al menos un partido para confirmar');
      return;
    }
    setShowConfirmarModal(true);
  };

  const handleConfirmarReserva = async () => {
    // Validar que todos los partidos seleccionados tengan el total de jugadores
    const partidosInvalidos: string[] = [];
    
    // Cargar detalles de cada partido seleccionado para validar
    const validaciones = await Promise.allSettled(
      partidosSeleccionadosParaConfirmar.map(async (linea) => {
        if (!linea.partidoId) return { valido: false, nombre: linea.partidoTitulo || 'Partido sin título' };
        
        try {
          const partido = await partidosApi.getById(linea.partidoId);
          const tieneTotalJugadores = partido.cantidadParticipantes === partido.maxJugadores;
          return {
            valido: tieneTotalJugadores,
            nombre: partido.titulo || linea.partidoTitulo || 'Partido sin título',
            cantidadParticipantes: partido.cantidadParticipantes,
            maxJugadores: partido.maxJugadores,
          };
        } catch {
          return { valido: false, nombre: linea.partidoTitulo || 'Partido sin título' };
        }
      })
    );

    validaciones.forEach((result) => {
      if (result.status === 'fulfilled' && !result.value.valido) {
        const partido = result.value;
        if (partido.cantidadParticipantes !== undefined && partido.maxJugadores !== undefined) {
          partidosInvalidos.push(
            `${partido.nombre} (${partido.cantidadParticipantes}/${partido.maxJugadores} jugadores)`
          );
        } else {
          partidosInvalidos.push(partido.nombre);
        }
      }
    });

    if (partidosInvalidos.length > 0) {
      toast.error(
        `No se pueden confirmar los siguientes partidos porque aún no están completos (tienen cupos disponibles): ${partidosInvalidos.join(', ')}. Solo puedes confirmar partidos que tengan todos los jugadores necesarios.`
      );
      return;
    }

    // Eliminar partidos no seleccionados temporalmente antes de confirmar
    const partidosNoSeleccionados = partidos.filter((p) => p.id && !partidosSeleccionadosIds.has(p.id));
    const partidosAEliminar = partidosNoSeleccionados.map((p) => p.id!).filter((id) => id > 0);

    try {
      // Eliminar partidos no seleccionados
      await Promise.all(
        partidosAEliminar.map((lineaId) =>
          eliminarPartido.mutateAsync({ usuarioId, lineaPartidoSeleccionadoId: lineaId })
        )
      );

      // Crear reserva con los partidos seleccionados
      crearReserva.mutate(usuarioId, {
        onSuccess: () => {
          toast.success(`¡Reserva creada! Has reservado ${partidosSeleccionadosParaConfirmar.length} partido(s)`);
          setShowConfirmarModal(false);
          setPartidosSeleccionadosIds(new Set());
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Error al crear la reserva');
        },
      });
    } catch (error) {
      toast.error((error as Error).message || 'Error al preparar la reserva');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando partidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Partidos</h1>
              <p className="text-gray-600 mt-1">Partidos que quieres inscribirte</p>
            </div>
            {partidos.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleAbrirConfirmarModal}
                  className="flex items-center gap-2"
                  disabled={partidosSeleccionadosParaConfirmar.length === 0}
                >
                  <CheckCircle className="h-5 w-5" />
                  Confirmar partido{partidosSeleccionadosParaConfirmar.length !== 1 ? 's' : ''}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleVaciarPartidosSeleccionados}
                  disabled={vaciarPartidosSeleccionados.isPending}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-5 w-5" />
                  Vaciar Todo
                </Button>
              </div>
            )}
          </div>
        </div>

        {partidos.length === 0 ? (
          <Card>
            <EmptyState
              icon={<CalendarCheck className="h-16 w-16 text-gray-400" />}
              title="No tienes partidos guardados"
              description="Agrega partidos desde la sección 'Ver Partidos' para comenzar a organizar tus inscripciones."
              action={{
                label: 'Explorar Partidos',
                onClick: onBack,
                variant: 'primary',
              }}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  <strong>Total:</strong> {partidos.length} partido{partidos.length !== 1 ? 's' : ''} guardado{partidos.length !== 1 ? 's' : ''}
                  {partidosSeleccionadosParaConfirmar.length > 0 && (
                    <span className="ml-2">
                      • {partidosSeleccionadosParaConfirmar.length} seleccionado{partidosSeleccionadosParaConfirmar.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    ref={selectAllCheckboxRef}
                    type="checkbox"
                    checked={todosSeleccionados}
                    onChange={toggleSeleccionarTodos}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-blue-800 font-medium">
                    {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </span>
                </label>
              </div>
            </div>

            {partidos.map((linea) => {
              const isSelected = linea.id ? partidosSeleccionadosIds.has(linea.id) : false;
              return (
                <Card key={linea.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => linea.id && togglePartidoSeleccionado(linea.id)}
                      className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{linea.partidoTitulo || 'Partido sin título'}</h3>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span>{linea.partidoUbicacion || 'Ubicación no disponible'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span>Cantidad a reservar: {linea.cantidad}</span>
                            </div>
                            {linea.partidoId && (
                              <>
                                <PartidoJugadoresInfo partidoId={linea.partidoId} />
                                <PartidoPrecio partidoId={linea.partidoId} cantidad={linea.cantidad} />
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => linea.partidoId && onViewPartidoDetails(linea.partidoId)}
                            className="flex items-center gap-2"
                          >
                            Ver Detalles
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => linea.id && handleEliminarPartido(linea.id)}
                            disabled={eliminarPartido.isPending}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Modal
          isOpen={showConfirmarModal}
          onClose={() => setShowConfirmarModal(false)}
          title="Confirmar Reserva"
        >
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Vas a reservar {partidosSeleccionadosParaConfirmar.length} partido{partidosSeleccionadosParaConfirmar.length !== 1 ? 's' : ''}:</strong>
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              {partidosSeleccionadosParaConfirmar.map((linea) => (
                <li key={linea.id}>{linea.partidoTitulo || 'Partido sin título'}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Solo puedes confirmar partidos que estén completos, es decir, que tengan todos los jugadores necesarios. Si un partido aún tiene cupos disponibles, no podrás confirmarlo hasta que se complete.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            ¿Deseas confirmar la reserva de estos partidos?
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmarModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmarReserva}
              disabled={crearReserva.isPending}
            >
              {crearReserva.isPending ? 'Validando...' : 'Confirmar Reserva'}
            </Button>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={showEliminarModal}
          onClose={() => {
            setShowEliminarModal(false);
            setLineaPartidoGuardadoAEliminar(null);
          }}
          onConfirm={handleConfirmarEliminar}
          title="Eliminar Partido"
          message="¿Estás seguro de que deseas eliminar este partido de tus partidos guardados?"
          confirmText="Eliminar"
          variant="danger"
          isLoading={eliminarPartido.isPending}
        />

        <ConfirmModal
          isOpen={showVaciarModal}
          onClose={() => setShowVaciarModal(false)}
          onConfirm={handleConfirmarVaciar}
          title="Eliminar Todos los Partidos"
          message="¿Estás seguro de que deseas eliminar todos los partidos guardados? Esta acción no se puede deshacer."
          confirmText="Vaciar Todo"
          variant="danger"
          isLoading={vaciarPartidosSeleccionados.isPending}
        />
      </div>
    </div>
  );
};

