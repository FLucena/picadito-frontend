import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/testUtils';
import userEvent from '@testing-library/user-event';
import { SedeForm } from './SedeForm';
import type { SedeResponseDTO } from '../types';

describe('SedeForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(
      <SedeForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/coordenadas/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(
      <SedeForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nombreInput = screen.getByLabelText(/nombre/i);
    const direccionInput = screen.getByLabelText(/dirección/i);

    await user.type(nombreInput, 'Estadio Olímpico');
    await user.type(direccionInput, 'Av. Principal 123');

    const submitButton = screen.getByText('Crear Sede');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('pre-fills form when editing sede', () => {
    const sede: SedeResponseDTO = {
      id: 1,
      nombre: 'Estadio Olímpico',
      direccion: 'Av. Principal 123',
      descripcion: 'Estadio moderno',
      telefono: '1234567890',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };

    render(
      <SedeForm
        sede={sede}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nombreInput = screen.getByLabelText(/nombre/i) as HTMLInputElement;
    expect(nombreInput.value).toBe('Estadio Olímpico');
  });

  it('shows update button when editing', () => {
    const sede: SedeResponseDTO = {
      id: 1,
      nombre: 'Estadio Olímpico',
      direccion: '',
      descripcion: '',
      telefono: '',
      coordenadas: '',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };

    render(
      <SedeForm
        sede={sede}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Actualizar')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SedeForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});

