import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { participanteSchema, type ParticipanteFormData } from '../utils/validators';
import { Button } from './ui/Button';
import { Posicion, Nivel } from '../types';

interface ParticipanteFormProps {
  onSubmit: (data: ParticipanteFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ParticipanteForm = ({ onSubmit, onCancel, isLoading = false }: ParticipanteFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParticipanteFormData>({
    resolver: zodResolver(participanteSchema) as any,
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
          placeholder="Tu nombre completo"
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="apodo" className="block text-sm font-medium text-gray-700 mb-1">
          Apodo
        </label>
        <input
          type="text"
          id="apodo"
          {...register('apodo')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Tu apodo (opcional)"
        />
        {errors.apodo && (
          <p className="mt-1 text-sm text-red-600">{errors.apodo.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="posicion" className="block text-sm font-medium text-gray-700 mb-1">
          Posición Preferida
        </label>
        <select
          id="posicion"
          {...register('posicion')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Sin posición</option>
          <option value={Posicion.PORTERO}>Portero</option>
          <option value={Posicion.DEFENSA}>Defensa</option>
          <option value={Posicion.MEDIOCAMPISTA}>Mediocampista</option>
          <option value={Posicion.DELANTERO}>Delantero</option>
        </select>
        {errors.posicion && (
          <p className="mt-1 text-sm text-red-600">{errors.posicion.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
          Nivel
        </label>
        <select
          id="nivel"
          {...register('nivel')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Sin nivel</option>
          <option value={Nivel.PRINCIPIANTE}>Principiante</option>
          <option value={Nivel.INTERMEDIO}>Intermedio</option>
          <option value={Nivel.AVANZADO}>Avanzado</option>
          <option value={Nivel.EXPERTO}>Experto</option>
        </select>
        {errors.nivel && (
          <p className="mt-1 text-sm text-red-600">{errors.nivel.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          Inscribirse
        </Button>
      </div>
    </form>
  );
};

