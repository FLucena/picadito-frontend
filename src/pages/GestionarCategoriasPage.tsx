import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CategoriaForm } from '../components/CategoriaForm';
import { CategoriaBadge } from '../components/CategoriaBadge';
import { Modal } from '../components/ui/Modal';
import { useCategorias, useCreateCategoria, useUpdateCategoria, useDeleteCategoria } from '../hooks/useCategorias';
import { toast } from '../utils/toast';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import type { CategoriaResponseDTO } from '../types';
import type { CategoriaFormData } from '../utils/validators';

export const GestionarCategoriasPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaResponseDTO | null>(null);
  const { data: categorias, isLoading } = useCategorias();
  const createCategoria = useCreateCategoria();
  const updateCategoria = useUpdateCategoria();
  const deleteCategoria = useDeleteCategoria();

  const handleSubmit = async (data: CategoriaFormData) => {
    try {
      if (categoriaEditando) {
        await updateCategoria.mutateAsync({ id: categoriaEditando.id, categoria: data });
        toast.success('Categoría actualizada exitosamente');
      } else {
        await createCategoria.mutateAsync(data);
        toast.success('Categoría creada exitosamente');
      }
      setShowForm(false);
      setCategoriaEditando(null);
    } catch (error) {
      toast.error((error as Error).message || 'Error al guardar la categoría');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      return;
    }
    try {
      await deleteCategoria.mutateAsync(id);
      toast.success('Categoría eliminada exitosamente');
    } catch (error) {
      toast.error((error as Error).message || 'Error al eliminar la categoría');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Categorías</h1>
            <Button
              onClick={() => {
                setCategoriaEditando(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Agregar Categoría
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando categorías...</p>
          </div>
        ) : !categorias || categorias.length === 0 ? (
          <Card className="text-center py-12">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No hay categorías registradas aún</p>
            <p className="text-gray-400 text-sm mb-4">
              Las categorías ayudan a clasificar los partidos por tipo
            </p>
            <Button
              onClick={() => {
                setCategoriaEditando(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Crear Primera Categoría
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorias.map((categoria) => (
              <Card key={categoria.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <CategoriaBadge categoria={categoria} size="md" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCategoriaEditando(categoria);
                        setShowForm(true);
                      }}
                      className="bg-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(categoria.id)}
                      className="bg-white text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {categoria.descripcion && (
                  <p className="text-sm text-gray-600 mb-4">{categoria.descripcion}</p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400">
                  Creada: {new Date(categoria.fechaCreacion).toLocaleDateString('es-ES')}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setCategoriaEditando(null);
          }}
          title={categoriaEditando ? 'Editar Categoría' : 'Agregar Categoría'}
        >
          <CategoriaForm
            categoria={categoriaEditando || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setCategoriaEditando(null);
            }}
            isLoading={createCategoria.isPending || updateCategoria.isPending}
          />
        </Modal>
      </div>
    </div>
  );
};

