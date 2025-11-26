import { Card } from '../components/ui/Card';
import { PartidoForm } from '../components/PartidoForm';
import { useUpdatePartido, usePartido } from '../hooks/usePartidos';
import { toast } from '../utils/toast';
import type { PartidoFormData } from '../utils/validators';
import { LoadingSkeletonCard } from '../components/ui/LoadingSkeleton';

interface EditPartidoPageProps {
  partidoId: number;
  onBack: () => void;
  onPartidoUpdated?: () => void;
}

export const EditPartidoPage = ({ partidoId, onBack, onPartidoUpdated }: EditPartidoPageProps) => {
  const { data: partido, isLoading: isLoadingPartido } = usePartido(partidoId);
  const updatePartido = useUpdatePartido();

  const handleSubmit = (data: PartidoFormData) => {
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
          onPartidoUpdated?.();
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Error al actualizar el partido');
        },
      }
    );
  };

  if (isLoadingPartido) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeletonCard count={1} />
        </div>
      </div>
    );
  }

  if (!partido) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Partido no encontrado</p>
              <button
                onClick={onBack}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Volver
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Partido</h1>
          <PartidoForm
            partido={partido}
            onSubmit={handleSubmit}
            onCancel={onBack}
            isLoading={updatePartido.isPending}
          />
        </Card>
      </div>
    </div>
  );
};

