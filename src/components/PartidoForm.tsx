import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partidoSchema, type PartidoFormData } from '../utils/validators';
import { Button } from './ui/Button';
import { useSedes } from '../hooks/useSedes';
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
  const { data: sedes } = useSedes();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PartidoFormData>({
    resolver: zodResolver(partidoSchema),
    defaultValues: partido
      ? {
          titulo: partido.titulo,
          descripcion: partido.descripcion || '',
          fechaHora: partido.fechaHora.slice(0, 16),
          ubicacion: partido.ubicacion || '',
          sedeId: partido.sedeId,
          maxJugadores: partido.maxJugadores,
          creadorNombre: partido.creadorNombre,
        }
      : {
          maxJugadores: 22,
        },
  });

  const creadorNombre = watch('creadorNombre');
  const sedeId = watch('sedeId');

  const handleFormSubmit = (data: PartidoFormData) => {
    onSubmit(data, inscribirseTambien);
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
          {sedes?.map((sede) => (
            <option key={sede.id} value={sede.id}>
              {sede.nombre || sede.direccion || `Sede #${sede.id}`}
            </option>
          ))}
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
        <label htmlFor="maxJugadores" className="block text-sm font-medium text-gray-700 mb-1">
          Máximo de Jugadores <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="maxJugadores"
          {...register('maxJugadores', { valueAsNumber: true })}
          min="1"
          max="50"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
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

