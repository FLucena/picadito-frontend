import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SedeForm } from '../components/SedeForm';
import { Modal } from '../components/ui/Modal';
import { useSedes, useCreateSede, useUpdateSede, useDeleteSede } from '../hooks/useSedes';
import { generateRandomSedes } from '../utils/generateRandomSedes';
import { toast } from '../utils/toast';
import { Plus, Edit, Trash2, MapPin, Phone, Navigation, Sparkles } from 'lucide-react';
import type { SedeResponseDTO } from '../types';
import type { SedeFormData } from '../utils/validators';

export const GestionarSedesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [sedeEditando, setSedeEditando] = useState<SedeResponseDTO | null>(null);
  const [isCreatingRandom, setIsCreatingRandom] = useState(false);
  const { data: sedes, isLoading } = useSedes();
  const createSede = useCreateSede();
  const updateSede = useUpdateSede();
  const deleteSede = useDeleteSede();

  const handleSubmit = async (data: SedeFormData) => {
    try {
      if (sedeEditando) {
        await updateSede.mutateAsync({ id: sedeEditando.id, sede: data });
        toast.success('Sede actualizada exitosamente');
      } else {
        await createSede.mutateAsync(data);
        toast.success('Sede creada exitosamente');
      }
      setShowForm(false);
      setSedeEditando(null);
    } catch (error) {
      toast.error((error as Error).message || 'Error al guardar la sede');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta sede?')) {
      return;
    }
    try {
      await deleteSede.mutateAsync(id);
      toast.success('Sede eliminada exitosamente');
    } catch (error) {
      toast.error((error as Error).message || 'Error al eliminar la sede');
    }
  };

  const handleCreateRandomSedes = async () => {
    setIsCreatingRandom(true);
    const sedesAleatorias = generateRandomSedes(5);
    let creadas = 0;
    const errores: string[] = [];

    try {
      for (const sede of sedesAleatorias) {
        try {
          await createSede.mutateAsync(sede);
          creadas++;
        } catch (error) {
          const mensajeError = (error as Error)?.message || 'Error desconocido';
          errores.push(`${sede.nombre}: ${mensajeError}`);
        }
      }

      if (creadas > 0) {
        toast.success(`✅ ${creadas} sede${creadas !== 1 ? 's' : ''} creada${creadas !== 1 ? 's' : ''} exitosamente`);
      }
      if (errores.length > 0) {
        const mensajeErrores = errores.length === 1 
          ? errores[0] 
          : `${errores.length} sedes no se pudieron crear. ${errores.slice(0, 2).join('; ')}${errores.length > 2 ? '...' : ''}`;
        toast.error(`⚠️ ${mensajeErrores}`);
      }
    } catch {
      toast.error('Error al crear sedes aleatorias');
    } finally {
      setIsCreatingRandom(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Sedes</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCreateRandomSedes}
                disabled={isCreatingRandom || createSede.isPending}
                className="flex items-center gap-2"
              >
                <Sparkles className={`h-4 w-4 ${isCreatingRandom ? 'animate-spin' : ''}`} />
                {isCreatingRandom ? 'Creando...' : '5 Aleatorias'}
              </Button>
              <Button
                onClick={() => {
                  setSedeEditando(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Agregar Sede
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando sedes...</p>
          </div>
        ) : !sedes || sedes.length === 0 ? (
          <Card className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No hay sedes registradas aún</p>
            <p className="text-gray-400 text-sm mb-4">
              Las sedes son los lugares donde se jugarán los partidos
            </p>
            <Button
              onClick={() => {
                setSedeEditando(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Crear Primera Sede
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sedes.map((sede) => (
              <Card key={sede.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sede.nombre || 'Sede sin nombre'}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSedeEditando(sede);
                        setShowForm(true);
                      }}
                      className="bg-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(sede.id)}
                      className="bg-white text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {sede.direccion && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                      <span>{sede.direccion}</span>
                    </div>
                  )}
                  {sede.telefono && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{sede.telefono}</span>
                    </div>
                  )}
                  {sede.coordenadas && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Navigation className="h-4 w-4 text-gray-400" />
                      <span>{sede.coordenadas}</span>
                    </div>
                  )}
                  {sede.descripcion && (
                    <p className="text-sm text-gray-500 mt-2">{sede.descripcion}</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400">
                  Creada: {new Date(sede.fechaCreacion).toLocaleDateString('es-ES')}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setSedeEditando(null);
          }}
          title={sedeEditando ? 'Editar Sede' : 'Agregar Sede'}
        >
          <SedeForm
            sede={sedeEditando || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSedeEditando(null);
            }}
            isLoading={createSede.isPending || updateSede.isPending}
          />
        </Modal>
      </div>
    </div>
  );
};

