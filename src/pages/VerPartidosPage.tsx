import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Calendar, Clock, Sparkles, Trash2, CalendarCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeletonCard } from '../components/ui/LoadingSkeleton';
import { PartidoCard } from '../components/PartidoCard';
import { BusquedaPartidos } from '../components/BusquedaPartidos';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { usePartidosDisponibles, useBuscarPartidos, useCreatePartido, useDeletePartido } from '../hooks/usePartidos';
import { useAgregarPartidoGuardado } from '../hooks/usePartidosGuardados';
import { generateRandomPartidos } from '../utils/generateRandomPartidos';
import { toast } from '../utils/toast';
import type { BusquedaPartidoDTO } from '../types';

type FilterType = 'todos' | 'proximos';

interface VerPartidosPageProps {
  onBack?: () => void;
  onCreatePartido: () => void;
  onViewPartidoDetails: (id: number) => void;
  usuarioId?: number;
}

export const VerPartidosPage = ({ 
  onCreatePartido, 
  onViewPartidoDetails,
  usuarioId = 1
}: VerPartidosPageProps) => {
  const [busqueda, setBusqueda] = useState<BusquedaPartidoDTO | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('todos');
  const [isCreatingRandom, setIsCreatingRandom] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const [partidoToDelete, setPartidoToDelete] = useState<number | null>(null);
  const [selectedPartidos, setSelectedPartidos] = useState<Set<number>>(new Set());
  const { data: partidosDisponibles, isLoading: isLoadingDisponibles } = usePartidosDisponibles();
  const { data: partidosBusqueda, isLoading: isLoadingBusqueda } = useBuscarPartidos(busqueda);
  const agregarPartidoGuardado = useAgregarPartidoGuardado();
  const createPartido = useCreatePartido();
  const deletePartido = useDeletePartido();

  // Usar resultados de búsqueda si hay búsqueda activa, sino usar partidos disponibles
  const partidosBase = busqueda ? partidosBusqueda : partidosDisponibles;
  const isLoading = busqueda ? isLoadingBusqueda : isLoadingDisponibles;

  // Filtrar por tipo (todos o próximos)
  const partidos = useMemo(() => {
    if (!partidosBase) return [];
    
    if (filterType === 'proximos') {
      const ahora = new Date();
      return partidosBase
        .filter((partido) => {
          const fechaPartido = new Date(partido.fechaHora);
          return fechaPartido > ahora && 
                 (partido.estado === 'DISPONIBLE' || partido.estado === 'COMPLETO');
        })
        .sort((a, b) => {
          const fechaA = new Date(a.fechaHora).getTime();
          const fechaB = new Date(b.fechaHora).getTime();
          return fechaA - fechaB;
        });
    }
    
    return partidosBase;
  }, [partidosBase, filterType]);

  // Limpiar selección cuando cambian los partidos
  useEffect(() => {
    setSelectedPartidos(new Set());
  }, [partidosBase, filterType, busqueda]);

  const partidosIds = useMemo(() => partidos.map((p) => p.id), [partidos]);
  const todosSeleccionados = partidos.length > 0 && partidos.every((p) => selectedPartidos.has(p.id));
  const algunosSeleccionados = selectedPartidos.size > 0 && selectedPartidos.size < partidos.length;
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = algunosSeleccionados;
    }
  }, [algunosSeleccionados]);

  const handleInscribirse = (partidoId: number) => {
    onViewPartidoDetails(partidoId);
  };

  const handleAgregarPartidoGuardado = async (partidoId: number) => {
    try {
      await agregarPartidoGuardado.mutateAsync({ usuarioId, partidoId });
      toast.success('Partido guardado en Mis Partidos');
    } catch (error) {
      toast.error((error as Error).message || 'Error al guardar el partido');
    }
  };

  const handleSearch = (busquedaData: BusquedaPartidoDTO) => {
    // Solo establecer búsqueda si hay al menos un criterio
    const hasCriteria = Object.values(busquedaData).some(
      value => value !== undefined && value !== null && value !== '' && value !== false
    );
    setBusqueda(hasCriteria ? busquedaData : null);
  };

  const handleClearSearch = () => {
    setBusqueda(null);
  };

  const handleCreateRandomPartidos = async () => {
    setIsCreatingRandom(true);
    const partidosAleatorios = generateRandomPartidos(5);
    let creados = 0;
    let errores = 0;

    try {
      for (const partido of partidosAleatorios) {
        try {
          await createPartido.mutateAsync(partido);
          creados++;
        } catch (error) {
          errores++;
          console.error('Error al crear partido:', error);
        }
      }

      if (creados > 0) {
        toast.success(`✅ ${creados} partido${creados !== 1 ? 's' : ''} creado${creados !== 1 ? 's' : ''} exitosamente`);
      }
      if (errores > 0) {
        toast.error(`⚠️ ${errores} partido${errores !== 1 ? 's' : ''} no se pudo${errores !== 1 ? 'ron' : ''} crear`);
      }
    } catch {
      toast.error('Error al crear partidos aleatorios');
    } finally {
      setIsCreatingRandom(false);
    }
  };

  const handleConfirmDelete = () => {
    if (partidoToDelete !== null) {
      deletePartido.mutate(partidoToDelete, {
        onSuccess: () => {
          toast.success('Partido eliminado correctamente');
          setShowDeleteModal(false);
          setPartidoToDelete(null);
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Error al eliminar el partido');
        },
      });
    }
  };

  const handleToggleSelect = (partidoId: number) => {
    setSelectedPartidos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(partidoId)) {
        newSet.delete(partidoId);
      } else {
        newSet.add(partidoId);
      }
      return newSet;
    });
  };

  const handleToggleSelectAll = () => {
    if (todosSeleccionados) {
      setSelectedPartidos(new Set());
    } else {
      setSelectedPartidos(new Set(partidosIds));
    }
  };

  const handleGuardarSeleccionados = async () => {
    if (selectedPartidos.size === 0) {
      toast.error('Por favor selecciona al menos un partido para guardar');
      return;
    }

    const partidosSeleccionados = partidos.filter((p) => selectedPartidos.has(p.id));
    let guardados = 0;
    let errores = 0;

    for (const partido of partidosSeleccionados) {
      try {
        await agregarPartidoGuardado.mutateAsync({ usuarioId, partidoId: partido.id });
        guardados++;
      } catch (error) {
        errores++;
        console.error('Error al guardar partido:', error);
      }
    }

    if (guardados > 0) {
      toast.success(`${guardados} partido${guardados !== 1 ? 's' : ''} guardado${guardados !== 1 ? 's' : ''} en Mis Partidos`);
      setSelectedPartidos(new Set());
    }
    if (errores > 0) {
      toast.error(`${errores} partido${errores !== 1 ? 's' : ''} no se pudo${errores !== 1 ? 'ron' : ''} guardar`);
    }
  };

  const handleEliminarSeleccionados = () => {
    if (selectedPartidos.size === 0) {
      toast.error('Por favor selecciona al menos un partido para eliminar');
      return;
    }
    setShowDeleteMultipleModal(true);
  };

  const handleConfirmDeleteMultiple = async () => {
    const partidosAEliminar = Array.from(selectedPartidos);
    let eliminados = 0;
    let errores = 0;

    for (const partidoId of partidosAEliminar) {
      try {
        await deletePartido.mutateAsync(partidoId);
        eliminados++;
      } catch (error) {
        errores++;
        console.error('Error al eliminar partido:', error);
      }
    }

    if (eliminados > 0) {
      toast.success(`${eliminados} partido${eliminados !== 1 ? 's' : ''} eliminado${eliminados !== 1 ? 's' : ''} correctamente`);
      setSelectedPartidos(new Set());
    }
    if (errores > 0) {
      toast.error(`${errores} partido${errores !== 1 ? 's' : ''} no se pudo${errores !== 1 ? 'ron' : ''} eliminar`);
    }
    setShowDeleteMultipleModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-medium text-gray-900 mb-1">Partidos Disponibles</h1>
              <p className="text-sm text-gray-500">Explora y únete a partidos de fútbol</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleCreateRandomPartidos}
                disabled={isCreatingRandom || createPartido.isPending}
                className="hidden sm:flex items-center gap-2"
                size="sm"
              >
                <Sparkles className={`h-4 w-4 ${isCreatingRandom ? 'animate-spin' : ''}`} />
                {isCreatingRandom ? 'Creando...' : '5 Aleatorios'}
              </Button>
              <Button 
                onClick={onCreatePartido} 
                className="hidden sm:flex items-center gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Crear
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filterType === 'todos' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('todos')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Todos
          </Button>
          <Button
            variant={filterType === 'proximos' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('proximos')}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Próximos
          </Button>
        </div>

        {/* Búsqueda */}
        <BusquedaPartidos onSearch={handleSearch} onClear={handleClearSearch} />

        {/* Contador de resultados y selección */}
        {!isLoading && partidos && partidos.length > 0 && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-500">
              {busqueda ? (
                <span>
                  <strong className="text-gray-700">{partidos.length}</strong> resultado{partidos.length !== 1 ? 's' : ''} encontrado{partidos.length !== 1 ? 's' : ''}
                </span>
              ) : (
                <span>
                  <strong className="text-gray-700">{partidos.length}</strong> {filterType === 'proximos' ? 'próximo' : 'partido'}{partidos.length !== 1 ? 's' : ''} {filterType === 'proximos' ? 'próximo' : 'disponible'}{partidos.length !== 1 ? 's' : ''}
                </span>
              )}
              {selectedPartidos.size > 0 && (
                <span className="ml-2 text-primary-600 font-medium">
                  • {selectedPartidos.size} seleccionado{selectedPartidos.size !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  ref={selectAllCheckboxRef}
                  type="checkbox"
                  checked={todosSeleccionados}
                  onChange={handleToggleSelectAll}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 font-medium">
                  {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </span>
              </label>
              {selectedPartidos.size > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGuardarSeleccionados}
                    className="flex items-center gap-2"
                    disabled={agregarPartidoGuardado.isPending}
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Guardar ({selectedPartidos.size})
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleEliminarSeleccionados}
                    className="flex items-center gap-2"
                    disabled={deletePartido.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar ({selectedPartidos.size})
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contenido */}
        {isLoading ? (
          <LoadingSkeletonCard count={6} />
        ) : partidos && partidos.length === 0 ? (
          <Card variant="outlined">
            <EmptyState
              icon={<Calendar className="h-12 w-12 text-gray-300" />}
              title={busqueda ? 'No se encontraron partidos' : 'No hay partidos disponibles'}
              description={
                busqueda
                  ? 'Intenta ajustar los filtros de búsqueda para ver más resultados.'
                  : 'Sé el primero en crear un partido y comienza a organizar encuentros de fútbol.'
              }
              action={
                busqueda
                  ? {
                      label: 'Limpiar búsqueda',
                      onClick: handleClearSearch,
                      variant: 'outline',
                    }
                  : {
                      label: 'Crear Partido',
                      onClick: onCreatePartido,
                      variant: 'primary',
                    }
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {partidos?.map((partido) => (
              <PartidoCard
                key={partido.id}
                partido={partido}
                onViewDetails={onViewPartidoDetails}
                onInscribirse={handleInscribirse}
                onAgregarAlEvento={handleAgregarPartidoGuardado}
                isSelected={selectedPartidos.has(partido.id)}
                onToggleSelect={handleToggleSelect}
                showCheckbox={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar un partido */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPartidoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Partido"
        message="¿Estás seguro de que deseas eliminar este partido? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
        isLoading={deletePartido.isPending}
      />

      {/* Modal de confirmación para eliminar múltiples partidos */}
      <ConfirmModal
        isOpen={showDeleteMultipleModal}
        onClose={() => setShowDeleteMultipleModal(false)}
        onConfirm={handleConfirmDeleteMultiple}
        title="Eliminar Partidos Seleccionados"
        message={`¿Estás seguro de que deseas eliminar ${selectedPartidos.size} partido${selectedPartidos.size !== 1 ? 's' : ''}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deletePartido.isPending}
      />

      {/* FAB para móvil */}
      <FloatingActionButton
        onClick={onCreatePartido}
        icon={<Plus className="h-6 w-6" />}
        label="Crear Partido"
        position="bottom-right"
        size="md"
        className="sm:hidden"
      />
    </div>
  );
};

