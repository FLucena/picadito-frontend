import { describe, it, expect } from 'vitest';
import {
  partidoSchema,
  participanteSchema,
  sedeSchema,
  usuarioSchema,
  categoriaSchema,
} from './validators';

describe('validators', () => {
  describe('partidoSchema', () => {
    it('validates a valid partido', () => {
      const validPartido = {
        titulo: 'Partido de Fútbol',
        descripcion: 'Partido amistoso',
        fechaHora: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        maxJugadores: 10,
        creadorNombre: 'Juan Pérez',
      };
      expect(() => partidoSchema.parse(validPartido)).not.toThrow();
    });

    it('rejects partido without titulo', () => {
      const invalidPartido = {
        fechaHora: new Date(Date.now() + 86400000).toISOString(),
        maxJugadores: 10,
        creadorNombre: 'Juan Pérez',
      };
      expect(() => partidoSchema.parse(invalidPartido)).toThrow();
    });

    it('rejects partido with past fechaHora', () => {
      const invalidPartido = {
        titulo: 'Partido',
        fechaHora: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        maxJugadores: 10,
        creadorNombre: 'Juan Pérez',
      };
      expect(() => partidoSchema.parse(invalidPartido)).toThrow('futuro');
    });

    it('rejects partido with maxJugadores less than 1', () => {
      const invalidPartido = {
        titulo: 'Partido',
        fechaHora: new Date(Date.now() + 86400000).toISOString(),
        maxJugadores: 0,
        creadorNombre: 'Juan Pérez',
      };
      expect(() => partidoSchema.parse(invalidPartido)).toThrow();
    });

    it('rejects partido with maxJugadores greater than 50', () => {
      const invalidPartido = {
        titulo: 'Partido',
        fechaHora: new Date(Date.now() + 86400000).toISOString(),
        maxJugadores: 51,
        creadorNombre: 'Juan Pérez',
      };
      expect(() => partidoSchema.parse(invalidPartido)).toThrow();
    });

    it('accepts optional fields', () => {
      const partido = {
        titulo: 'Partido',
        fechaHora: new Date(Date.now() + 86400000).toISOString(),
        maxJugadores: 10,
        creadorNombre: 'Juan Pérez',
        descripcion: '',
        ubicacion: '',
      };
      expect(() => partidoSchema.parse(partido)).not.toThrow();
    });
  });

  describe('participanteSchema', () => {
    it('validates a valid participante', () => {
      const validParticipante = {
        nombre: 'Juan Pérez',
        apodo: 'Juancho',
        posicion: 'DELANTERO',
        nivel: 'INTERMEDIO',
      };
      expect(() => participanteSchema.parse(validParticipante)).not.toThrow();
    });

    it('rejects participante without nombre', () => {
      const invalidParticipante = {
        posicion: 'DELANTERO',
      };
      expect(() => participanteSchema.parse(invalidParticipante)).toThrow();
    });

    it('accepts empty apodo', () => {
      const participante = {
        nombre: 'Juan Pérez',
        apodo: '',
      };
      expect(() => participanteSchema.parse(participante)).not.toThrow();
    });

    it('accepts optional posicion and nivel', () => {
      const participante = {
        nombre: 'Juan Pérez',
      };
      expect(() => participanteSchema.parse(participante)).not.toThrow();
    });
  });

  describe('sedeSchema', () => {
    it('validates a valid sede with all fields', () => {
      const validSede = {
        nombre: 'Estadio Olímpico',
        direccion: 'Av. Principal 123',
        descripcion: 'Estadio moderno',
        telefono: '1234567890',
        coordenadas: '-34.6037,-58.3816',
      };
      expect(() => sedeSchema.parse(validSede)).not.toThrow();
    });

    it('validates sede with only required fields', () => {
      const sede = {
        nombre: '',
        direccion: '',
      };
      expect(() => sedeSchema.parse(sede)).not.toThrow();
    });

    it('rejects sede with nombre exceeding max length', () => {
      const invalidSede = {
        nombre: 'a'.repeat(201),
      };
      expect(() => sedeSchema.parse(invalidSede)).toThrow();
    });
  });

  describe('usuarioSchema', () => {
    it('validates a valid usuario', () => {
      const validUsuario = {
        nombre: 'Usuario Test',
        email: 'test@example.com',
      };
      expect(() => usuarioSchema.parse(validUsuario)).not.toThrow();
    });

    it('rejects usuario with invalid email', () => {
      const invalidUsuario = {
        nombre: 'Usuario',
        email: 'invalid-email',
      };
      expect(() => usuarioSchema.parse(invalidUsuario)).toThrow();
    });
  });

  describe('categoriaSchema', () => {
    it('validates a valid categoria', () => {
      const validCategoria = {
        nombre: 'Fútbol 11',
        descripcion: 'Partidos de fútbol 11 vs 11',
        icono: '⚽',
        color: '#1E88E5',
      };
      expect(() => categoriaSchema.parse(validCategoria)).not.toThrow();
    });

    it('rejects categoria without nombre', () => {
      const invalidCategoria = {
        descripcion: 'Descripción',
      };
      expect(() => categoriaSchema.parse(invalidCategoria)).toThrow();
    });

    it('accepts optional fields', () => {
      const categoria = {
        nombre: 'Fútbol 11',
        descripcion: '',
        icono: '',
        color: '',
      };
      expect(() => categoriaSchema.parse(categoria)).not.toThrow();
    });

    it('rejects categoria with invalid color format', () => {
      const invalidCategoria = {
        nombre: 'Fútbol 11',
        color: 'invalid-color',
      };
      expect(() => categoriaSchema.parse(invalidCategoria)).toThrow();
    });

    it('accepts valid hex color', () => {
      const categoria = {
        nombre: 'Fútbol 11',
        color: '#1E88E5',
      };
      expect(() => categoriaSchema.parse(categoria)).not.toThrow();
    });
  });
});

