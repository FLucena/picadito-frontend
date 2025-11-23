import { Card } from '../components/ui/Card';
import { PartidoForm } from '../components/PartidoForm';
import { useCreatePartido } from '../hooks/usePartidos';
import { useInscribirse } from '../hooks/useParticipantes';
import { toast } from '../utils/toast';
import type { PartidoFormData } from '../utils/validators';

interface CreatePartidoPageProps {
  onBack: () => void;
  onPartidoCreated?: () => void;
}

export const CreatePartidoPage = ({ onBack, onPartidoCreated }: CreatePartidoPageProps) => {
  const createPartido = useCreatePartido();
  const inscribirse = useInscribirse();

  const handleSubmit = (data: PartidoFormData, inscribirseTambien: boolean) => {
    createPartido.mutate(data, {
      onSuccess: (partidoCreado) => {
        if (inscribirseTambien && partidoCreado) {
          // Inscribir al creador automáticamente
          inscribirse.mutate(
            {
              partidoId: partidoCreado.id,
              participante: {
                nombre: data.creadorNombre,
              },
            },
            {
              onSuccess: () => {
                toast.success('Partido creado y te has inscrito correctamente');
                onPartidoCreated?.();
              },
              onError: (error: Error) => {
                toast.success('Partido creado correctamente');
                toast.error(`No se pudo inscribirte automáticamente: ${error.message}`);
                onPartidoCreated?.();
              },
            }
          );
        } else {
          toast.success('Partido creado correctamente');
          onPartidoCreated?.();
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Error al crear el partido');
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Partido</h1>
          <PartidoForm
            onSubmit={handleSubmit}
            onCancel={onBack}
            isLoading={createPartido.isPending || inscribirse.isPending}
          />
        </Card>
      </div>
    </div>
  );
};

