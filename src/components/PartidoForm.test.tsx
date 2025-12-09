import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/testUtils';
import userEvent from '@testing-library/user-event';
import { PartidoForm } from './PartidoForm';
import type { PartidoResponseDTO } from '../types';
import { EstadoPartido } from '../types';

vi.mock('../hooks/useSedes', () => ({
  useSedes: vi.fn(() => ({
    data: [
      { id: 1, nombre: 'Estadio Olímpico', direccion: 'Av. Principal 123' },
      { id: 2, nombre: 'Cancha Central', direccion: 'Calle Secundaria 456' },
    ],
  })),
}));

vi.mock('../hooks/useCategorias', () => ({
  useCategorias: vi.fn(() => ({
    data: [
      { id: 1, nombre: 'Fútbol 11', icono: '⚽', color: '#1E88E5' },
      { id: 2, nombre: 'Fútbol 7', icono: '⚽', color: '#43A047' },
    ],
  })),
}));

describe('PartidoForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(
      <PartidoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha y hora/i)).toBeInTheDocument();
    expect(screen.getByText(/categorías/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/máximo de jugadores/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre del creador/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/precio total/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/url de imagen/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <PartidoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Crear Partido');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/título es requerido/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(
      <PartidoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const tituloInput = screen.getByLabelText(/título/i);
    const fechaHoraInput = screen.getByLabelText(/fecha y hora/i);
    const maxJugadoresInput = screen.getByLabelText(/máximo de jugadores/i);
    const creadorNombreInput = screen.getByLabelText(/nombre del creador/i);

    // Usar una fecha futura (1 año desde ahora)
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = futureDate.toISOString().slice(0, 16);

    await user.type(tituloInput, 'Partido Test');
    await user.type(fechaHoraInput, futureDateString);
    await user.clear(maxJugadoresInput);
    await user.type(maxJugadoresInput, '22');
    await user.type(creadorNombreInput, 'Test User');

    const submitButton = screen.getByText('Crear Partido');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('pre-fills form when editing partido', () => {
    const partido: PartidoResponseDTO = {
      id: 1,
      titulo: 'Partido Existente',
      descripcion: 'Descripción',
      fechaHora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      maxJugadores: 10,
      cantidadParticipantes: 5,
      estado: EstadoPartido.PROGRAMADO,
      creadorNombre: 'Test User',
      fechaCreacion: new Date().toISOString(),
      precio: 5000,
      imagenUrl: 'https://ejemplo.com/imagen.jpg',
    };

    render(
      <PartidoForm
        partido={partido}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const tituloInput = screen.getByLabelText(/título/i) as HTMLInputElement;
    expect(tituloInput.value).toBe('Partido Existente');
    
    const precioInput = screen.getByLabelText(/precio total/i) as HTMLInputElement;
    expect(precioInput.value).toBe('5000');
    
    const imagenUrlInput = screen.getByLabelText(/url de imagen/i) as HTMLInputElement;
    expect(imagenUrlInput.value).toBe('https://ejemplo.com/imagen.jpg');
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PartidoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows inscribirse checkbox when creating new partido', () => {
    render(
      <PartidoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/inscribirme también/i)).toBeInTheDocument();
  });

  it('does not show inscribirse checkbox when editing partido', () => {
    const partido: PartidoResponseDTO = {
      id: 1,
      titulo: 'Partido Existente',
      fechaHora: new Date().toISOString(),
      maxJugadores: 10,
      cantidadParticipantes: 5,
      estado: EstadoPartido.PROGRAMADO,
      creadorNombre: 'Test User',
      fechaCreacion: new Date().toISOString(),
    };

    render(
      <PartidoForm
        partido={partido}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText(/inscribirme también/i)).not.toBeInTheDocument();
  });
});

