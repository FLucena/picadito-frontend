import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sedeSchema, type SedeFormData } from '../utils/validators';
import { Button } from './ui/Button';
import type { SedeResponseDTO } from '../types';

interface SedeFormProps {
  sede?: SedeResponseDTO;
  onSubmit: (data: SedeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SedeForm = ({ sede, onSubmit, onCancel, isLoading = false }: SedeFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SedeFormData>({
    resolver: zodResolver(sedeSchema),
    defaultValues: sede
      ? {
          nombre: sede.nombre || '',
          direccion: sede.direccion || '',
          descripcion: sede.descripcion || '',
          telefono: sede.telefono || '',
          coordenadas: sede.coordenadas || '',
        }
      : {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          id="nombre"
          {...register('nombre')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ej: Cancha Parque Central"
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <input
          type="text"
          id="direccion"
          {...register('direccion')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ej: Av. Principal 123"
        />
        {errors.direccion && (
          <p className="mt-1 text-sm text-red-600">{errors.direccion.message}</p>
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
          placeholder="Descripción opcional de la sede"
        />
        {errors.descripcion && (
          <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          type="text"
          id="telefono"
          {...register('telefono')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ej: +54 11 1234-5678"
        />
        {errors.telefono && (
          <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="coordenadas" className="block text-sm font-medium text-gray-700 mb-1">
          Coordenadas
        </label>
        <input
          type="text"
          id="coordenadas"
          {...register('coordenadas')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ej: -34.6037, -58.3816"
        />
        {errors.coordenadas && (
          <p className="mt-1 text-sm text-red-600">{errors.coordenadas.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {sede ? 'Actualizar' : 'Crear Sede'}
        </Button>
      </div>
    </form>
  );
};

