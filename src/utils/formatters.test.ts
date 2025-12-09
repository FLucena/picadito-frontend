import { describe, it, expect } from 'vitest';
import {
  formatPrecio,
  formatFecha,
  formatFechaHora,
  formatFechaCorta,
  formatFechaHoraCorta,
  formatFechaRelativa,
  getEstadoReservaBadgeColor,
  getEstadoReservaLabel,
  getEstadoBadgeColor,
  getEstadoLabel,
  getPosicionLabel,
  getNivelLabel,
} from './formatters';
import { EstadoReserva, EstadoPartido, Posicion, Nivel } from '../types';

describe('formatters', () => {
  describe('formatPrecio', () => {
    it('formats price in ARS currency', () => {
      expect(formatPrecio(1000)).toContain('$');
      expect(formatPrecio(1000)).toContain('1.000');
    });

    it('formats decimal prices correctly', () => {
      const formatted = formatPrecio(1234.56);
      expect(formatted).toContain('1.234');
      expect(formatted).toContain('56');
    });

    it('formats zero correctly', () => {
      expect(formatPrecio(0)).toContain('0');
    });
  });

  describe('formatFecha', () => {
    it('formats date in Spanish', () => {
      const date = '2024-01-15T10:00:00';
      const formatted = formatFecha(date);
      expect(formatted).toContain('enero');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatFechaHora', () => {
    it('formats date and time in Spanish', () => {
      const date = '2024-01-15T14:30:00';
      const formatted = formatFechaHora(date);
      expect(formatted).toContain('enero');
      expect(formatted).toContain('14:30');
    });
  });

  describe('formatFechaCorta', () => {
    it('formats date in short format', () => {
      const date = '2024-01-15T10:00:00';
      const formatted = formatFechaCorta(date);
      expect(formatted).toBe('15/01/2024');
    });
  });

  describe('formatFechaHoraCorta', () => {
    it('formats date and time in short format', () => {
      const date = '2024-01-15T14:30:00';
      const formatted = formatFechaHoraCorta(date);
      expect(formatted).toBe('15/01/2024 14:30');
    });
  });

  describe('formatFechaRelativa', () => {
    it('formats relative date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const formatted = formatFechaRelativa(futureDate.toISOString());
      expect(formatted).toContain('en');
    });
  });

  describe('getEstadoReservaBadgeColor', () => {
    it('returns correct color for PENDIENTE', () => {
      expect(getEstadoReservaBadgeColor(EstadoReserva.PENDIENTE)).toContain('yellow');
    });

    it('returns correct color for CONFIRMADO', () => {
      expect(getEstadoReservaBadgeColor(EstadoReserva.CONFIRMADO)).toContain('blue');
    });

    it('returns correct color for FINALIZADO', () => {
      expect(getEstadoReservaBadgeColor(EstadoReserva.FINALIZADO)).toContain('green');
    });

    it('returns correct color for CANCELADO', () => {
      expect(getEstadoReservaBadgeColor(EstadoReserva.CANCELADO)).toContain('red');
    });
  });

  describe('getEstadoReservaLabel', () => {
    it('returns correct label for each estado', () => {
      expect(getEstadoReservaLabel(EstadoReserva.PENDIENTE)).toBe('Pendiente');
      expect(getEstadoReservaLabel(EstadoReserva.CONFIRMADO)).toBe('Confirmado');
      expect(getEstadoReservaLabel(EstadoReserva.FINALIZADO)).toBe('Finalizado');
      expect(getEstadoReservaLabel(EstadoReserva.CANCELADO)).toBe('Cancelado');
    });
  });

  describe('getEstadoBadgeColor', () => {
    it('returns correct color for each estado', () => {
      expect(getEstadoBadgeColor(EstadoPartido.PROGRAMADO)).toContain('green');
      expect(getEstadoBadgeColor(EstadoPartido.EN_CURSO)).toContain('blue');
      expect(getEstadoBadgeColor(EstadoPartido.FINALIZADO)).toContain('gray');
      expect(getEstadoBadgeColor(EstadoPartido.CANCELADO)).toContain('red');
    });
  });

  describe('getEstadoLabel', () => {
    it('returns correct label for each estado', () => {
      expect(getEstadoLabel(EstadoPartido.PROGRAMADO)).toBe('Programado');
      expect(getEstadoLabel(EstadoPartido.EN_CURSO)).toBe('En Curso');
      expect(getEstadoLabel(EstadoPartido.FINALIZADO)).toBe('Finalizado');
      expect(getEstadoLabel(EstadoPartido.CANCELADO)).toBe('Cancelado');
    });
  });

  describe('getPosicionLabel', () => {
    it('returns correct label for each posicion', () => {
      expect(getPosicionLabel(Posicion.PORTERO)).toBe('Portero');
      expect(getPosicionLabel(Posicion.DEFENSA)).toBe('Defensa');
      expect(getPosicionLabel(Posicion.MEDIOCAMPISTA)).toBe('Mediocampista');
      expect(getPosicionLabel(Posicion.DELANTERO)).toBe('Delantero');
    });
  });

  describe('getNivelLabel', () => {
    it('returns correct label for each nivel', () => {
      expect(getNivelLabel(Nivel.PRINCIPIANTE)).toBe('Principiante');
      expect(getNivelLabel(Nivel.INTERMEDIO)).toBe('Intermedio');
      expect(getNivelLabel(Nivel.AVANZADO)).toBe('Avanzado');
      expect(getNivelLabel(Nivel.EXPERTO)).toBe('Experto');
    });
  });
});

