import { z } from 'zod';

export const usuarioSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('El email debe tener un formato válido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  rol: z.enum(['ADMIN', 'CLIENTE']).optional(),
  activo: z.boolean().optional(),
});


// Validators para Partidos
export const partidoSchema = z.object({
  titulo: z
    .string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres'),
  descripcion: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  fechaHora: z
    .string()
    .min(1, 'La fecha y hora son requeridas')
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const now = new Date();
        return selectedDate > now;
      },
      {
        message: 'La fecha y hora deben ser en el futuro',
      }
    ),
  ubicacion: z
    .string()
    .max(300, 'La ubicación no puede exceder 300 caracteres')
    .optional()
    .or(z.literal('')),
  sedeId: z
    .union([z.number().positive('El ID de la sede debe ser un número positivo'), z.undefined()])
    .optional(),
  maxJugadores: z
    .number()
    .int('El número máximo de jugadores debe ser un número entero')
    .min(1, 'El número máximo de jugadores debe ser al menos 1')
    .max(50, 'El número máximo de jugadores no puede exceder 50'),
  creadorNombre: z
    .string()
    .min(1, 'El nombre del creador es requerido')
    .max(100, 'El nombre del creador no puede exceder 100 caracteres'),
});

// Validators para Participantes
export const participanteSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  apodo: z
    .string()
    .max(100, 'El apodo no puede exceder 100 caracteres')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  posicion: z
    .preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.enum(['PORTERO', 'DEFENSA', 'MEDIOCAMPISTA', 'DELANTERO']).optional()
    ),
  nivel: z
    .preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.enum(['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'EXPERTO']).optional()
    ),
});

// Validators para Sedes
export const sedeSchema = z.object({
  nombre: z
    .string()
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
  direccion: z
    .string()
    .max(300, 'La dirección no puede exceder 300 caracteres')
    .optional()
    .or(z.literal('')),
  descripcion: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  telefono: z
    .string()
    .max(50, 'El teléfono no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  coordenadas: z
    .string()
    .max(100, 'Las coordenadas no pueden exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
});

export type UsuarioFormData = z.infer<typeof usuarioSchema>;
export type PartidoFormData = z.infer<typeof partidoSchema>;
export type ParticipanteFormData = z.infer<typeof participanteSchema>;
export type SedeFormData = z.infer<typeof sedeSchema>;
