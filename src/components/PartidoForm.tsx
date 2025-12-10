import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partidoSchema, type PartidoFormData } from '../utils/validators';
import { Button } from './ui/Button';
import { useSedes } from '../hooks/useSedes';
import { useCategorias } from '../hooks/useCategorias';
import type { PartidoResponseDTO } from '../types';

interface PartidoFormProps {
  partido?: PartidoResponseDTO;
  onSubmit: (data: PartidoFormData, inscribirseTambien: boolean) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PartidoForm = ({ partido, onSubmit, onCancel, isLoading = false }: PartidoFormProps) => {
  const [inscribirseTambien, setInscribirseTambien] = useState(false);
  const isCreating = !partido;
  const { data: sedesRaw } = useSedes();
  const { data: categoriasRaw } = useCategorias();

  // Normalizar datos para asegurar que sean arrays
  const sedes = Array.isArray(sedesRaw) ? sedesRaw : (Array.isArray((sedesRaw as any)?.sedes) ? (sedesRaw as any).sedes : []);
  const categorias = Array.isArray(categoriasRaw) ? categoriasRaw : (Array.isArray((categoriasRaw as any)?.categorias) ? (categoriasRaw as any).categorias : []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PartidoFormData>({
    resolver: zodResolver(partidoSchema) as Resolver<PartidoFormData>,
        defaultValues: partido
      ? {
          titulo: partido.titulo,
          descripcion: partido.descripcion || '',
          fechaHora: partido.fechaHora.slice(0, 16),
          ubicacion: partido.ubicacion || '',
          sedeId: partido.sedeId,
          categoriaIds: partido.categoriaIds || [],
          maxJugadores: partido.maxJugadores,
          creadorNombre: partido.creadorNombre,
          precio: partido.precio,
          imagenUrl: partido.imagenUrl || '',
        }
      : {
          maxJugadores: 10,
          categoriaIds: [],
        },
  });

  const creadorNombre = watch('creadorNombre');
  const sedeId = watch('sedeId');
  const categoriaIds = watch('categoriaIds') || [];

  const handleFormSubmit = (data: PartidoFormData) => {
    // Asegurar que categoriaIds esté presente (puede ser undefined si no se seleccionó ninguna)
    const formData = {
      ...data,
      categoriaIds: data.categoriaIds && data.categoriaIds.length > 0 ? data.categoriaIds : undefined,
    };
    onSubmit(formData, inscribirseTambien);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="titulo"
          {...register('titulo')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ej: Partido dominical"
        />
        {errors.titulo && (
          <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          id="descripcion"
          {...register('descripcion')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Descripción opcional del partido"
        />
        {errors.descripcion && (
          <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="fechaHora" className="block text-sm font-medium text-gray-700 mb-1">
          Fecha y Hora <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          id="fechaHora"
          {...register('fechaHora')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.fechaHora && (
          <p className="mt-1 text-sm text-red-600">{errors.fechaHora.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="sedeId" className="block text-sm font-medium text-gray-700 mb-1">
          Sede
        </label>
        <select
          id="sedeId"
          {...register('sedeId', {
            setValueAs: (value) => {
              if (value === '' || value === null || value === undefined) {
                return undefined;
              }
              const numValue = Number(value);
              return isNaN(numValue) ? undefined : numValue;
            },
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Seleccionar sede (opcional)</option>
          {sedes && sedes.length > 0 ? (
            sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre || sede.direccion || `Sede #${sede.id}`}
              </option>
            ))
          ) : (
            <option value="" disabled>No hay sedes disponibles</option>
          )}
        </select>
        {errors.sedeId && (
          <p className="mt-1 text-sm text-red-600">{errors.sedeId.message}</p>
        )}
        {!sedeId && (
          <div className="mt-2">
            <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación (si no hay sede)
            </label>
            <input
              type="text"
              id="ubicacion"
              {...register('ubicacion')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: Cancha Parque Central"
            />
            {errors.ubicacion && (
              <p className="mt-1 text-sm text-red-600">{errors.ubicacion.message}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categorías
        </label>
        <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
          {Array.isArray(categorias) && categorias.length > 0 ? (
            <div className="space-y-2">
              {categorias.map((categoria) => {
                const isChecked = categoriaIds.includes(categoria.id);
                return (
                  <label
                    key={categoria.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...categoriaIds, categoria.id]
                          : categoriaIds.filter((id) => id !== categoria.id);
                        setValue('categoriaIds', newIds, { shouldValidate: true });
                      }}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      {categoria.icono && <span className="mr-1">{categoria.icono}</span>}
                      {categoria.nombre}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay categorías disponibles</p>
          )}
        </div>
        {errors.categoriaIds && (
          <p className="mt-1 text-sm text-red-600">{errors.categoriaIds.message}</p>
        )}
        {categoriaIds.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {categoriaIds.length} categoría{categoriaIds.length !== 1 ? 's' : ''} seleccionada{categoriaIds.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="maxJugadores" className="block text-sm font-medium text-gray-700 mb-1">
          Máximo de Jugadores <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="maxJugadores"
          {...register('maxJugadores', { valueAsNumber: true })}
          min="10"
          max="22"
          step="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Solo se permiten números pares entre 10 y 22 (10, 12, 14, 16, 18, 20, 22)
        </p>
        {errors.maxJugadores && (
          <p className="mt-1 text-sm text-red-600">{errors.maxJugadores.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="creadorNombre" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Creador <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="creadorNombre"
          {...register('creadorNombre')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Tu nombre"
        />
        {errors.creadorNombre && (
          <p className="mt-1 text-sm text-red-600">{errors.creadorNombre.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
          Precio Total (opcional)
        </label>
        <input
          type="number"
          id="precio"
          {...register('precio', { valueAsNumber: true })}
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ej: 5000.00"
        />
        <p className="mt-1 text-xs text-gray-500">
          Precio total del partido. Si se especifica, se calculará el costo por jugador automáticamente.
        </p>
        {errors.precio && (
          <p className="mt-1 text-sm text-red-600">{errors.precio.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="imagenUrl" className="block text-sm font-medium text-gray-700 mb-1">
          URL de Imagen (opcional)
        </label>
        <input
          type="url"
          id="imagenUrl"
          {...register('imagenUrl')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ej: https://ejemplo.com/imagen.jpg"
        />
        {errors.imagenUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.imagenUrl.message}</p>
        )}
      </div>

      {isCreating && (
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="inscribirseTambien"
              type="checkbox"
              checked={inscribirseTambien}
              onChange={(e) => setInscribirseTambien(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              disabled={!creadorNombre || isLoading}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="inscribirseTambien" className="font-medium text-gray-700 cursor-pointer">
              Inscribirme también al partido
            </label>
            <p className="text-gray-500">
              {creadorNombre
                ? 'Te inscribirás automáticamente usando tu nombre como creador'
                : 'Completa tu nombre primero para habilitar esta opción'}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {partido ? 'Actualizar' : 'Crear Partido'}
        </Button>
      </div>
    </form>
  );
};

