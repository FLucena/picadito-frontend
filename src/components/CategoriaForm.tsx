import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoriaSchema, type CategoriaFormData } from '../utils/validators';
import { Button } from './ui/Button';
import type { CategoriaResponseDTO } from '../types';

interface CategoriaFormProps {
  categoria?: CategoriaResponseDTO;
  onSubmit: (data: CategoriaFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CategoriaForm = ({ categoria, onSubmit, onCancel, isLoading = false }: CategoriaFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: categoria
      ? {
          nombre: categoria.nombre,
          descripcion: categoria.descripcion || '',
          icono: categoria.icono || '',
          color: categoria.color || '',
        }
      : {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nombre"
          {...register('nombre')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ej: Fútbol 11"
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
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
          placeholder="Descripción opcional de la categoría"
        />
        {errors.descripcion && (
          <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="icono" className="block text-sm font-medium text-gray-700 mb-1">
          Icono
        </label>
        <input
          type="text"
          id="icono"
          {...register('icono')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ej: ⚽"
          maxLength={10}
        />
        <p className="mt-1 text-xs text-gray-500">Emoji o símbolo para la categoría (máx. 10 caracteres)</p>
        {errors.icono && (
          <p className="mt-1 text-sm text-red-600">{errors.icono.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            id="color-picker"
            {...register('color')}
            className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            id="color"
            {...register('color')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="#1E88E5"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Código hexadecimal del color (ej: #1E88E5)</p>
        {errors.color && (
          <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {categoria ? 'Actualizar' : 'Crear Categoría'}
        </Button>
      </div>
    </form>
  );
};

