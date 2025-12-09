import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/testUtils';
import userEvent from '@testing-library/user-event';
import { MisPartidosPage } from './MisPartidosPage';
import { usePartidosSeleccionados, useEliminarPartidoSeleccionado, useVaciarPartidosSeleccionados } from '../hooks/usePartidosGuardados';
import { useCrearReservaDesdePartidosSeleccionados } from '../hooks/useInscripciones';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import type { PartidosSeleccionadosResponseDTO, ReservaResponseDTO } from '../types';

// Mock de hooks
vi.mock('../hooks/usePartidosGuardados', () => ({
  usePartidosSeleccionados: vi.fn(),
  useEliminarPartidoSeleccionado: vi.fn(),
  useVaciarPartidosSeleccionados: vi.fn(),
}));

vi.mock('../hooks/useInscripciones', () => ({
  useCrearReservaDesdePartidosSeleccionados: vi.fn(),
}));

vi.mock('../hooks/usePartidos', () => ({
  usePartido: vi.fn(() => ({ data: null, isLoading: false })),
  useCostoPorJugador: vi.fn(() => ({ data: null })),
}));

vi.mock('../services/api', () => ({
  partidosApi: {
    getById: vi.fn(),
  },
}));

describe('MisPartidosPage', () => {
  const mockOnBack = vi.fn();
  const mockOnViewPartidoDetails = vi.fn();
  const mockEliminarPartido = { mutate: vi.fn(), isPending: false } as unknown as UseMutationResult<void, Error, { usuarioId: number; lineaPartidoSeleccionadoId: number }, unknown>;
  const mockVaciarPartidos = { mutate: vi.fn(), isPending: false } as unknown as UseMutationResult<void, Error, number, unknown>;
  const mockCrearReserva = { mutate: vi.fn(), isPending: false } as unknown as UseMutationResult<ReservaResponseDTO, Error, number, unknown>;

  const mockPartidosSeleccionados = {
    items: [
      {
        id: 1,
        partidoId: 1,
        partidoTitulo: 'Partido Test 1',
        partidoUbicacion: 'Ubicación 1',
        cantidad: 2,
      },
      {
        id: 2,
        partidoId: 2,
        partidoTitulo: 'Partido Test 2',
        partidoUbicacion: 'Ubicación 2',
        cantidad: 1,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePartidosSeleccionados).mockReturnValue({
      data: mockPartidosSeleccionados,
      isLoading: false,
    } as unknown as UseQueryResult<PartidosSeleccionadosResponseDTO, Error>);
    vi.mocked(useEliminarPartidoSeleccionado).mockReturnValue(mockEliminarPartido);
    vi.mocked(useVaciarPartidosSeleccionados).mockReturnValue(mockVaciarPartidos);
    vi.mocked(useCrearReservaDesdePartidosSeleccionados).mockReturnValue(mockCrearReserva);
  });

  it('renders list of partidos seleccionados', () => {
    render(
      <MisPartidosPage
        onBack={mockOnBack}
        usuarioId={1}
        onViewPartidoDetails={mockOnViewPartidoDetails}
      />
    );

    expect(screen.getByText('Partido Test 1')).toBeInTheDocument();
    expect(screen.getByText('Partido Test 2')).toBeInTheDocument();
  });

  it('shows empty state when no partidos', () => {
    vi.mocked(usePartidosSeleccionados).mockReturnValue({
      data: { items: [] },
      isLoading: false,
    } as unknown as UseQueryResult<PartidosSeleccionadosResponseDTO, Error>);

    render(
      <MisPartidosPage
        onBack={mockOnBack}
        usuarioId={1}
        onViewPartidoDetails={mockOnViewPartidoDetails}
      />
    );

    expect(screen.getByText(/no tienes partidos guardados/i)).toBeInTheDocument();
  });

  it('allows selecting and deselecting partidos', async () => {
    const user = userEvent.setup();
    render(
      <MisPartidosPage
        onBack={mockOnBack}
        usuarioId={1}
        onViewPartidoDetails={mockOnViewPartidoDetails}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);

    // Todos deberían estar seleccionados por defecto
    const firstCheckbox = checkboxes[0];
    expect(firstCheckbox).toBeChecked();

    // Deseleccionar
    await user.click(firstCheckbox);
    expect(firstCheckbox).not.toBeChecked();
  });

  it('shows confirm button when partidos are selected', () => {
    render(
      <MisPartidosPage
        onBack={mockOnBack}
        usuarioId={1}
        onViewPartidoDetails={mockOnViewPartidoDetails}
      />
    );

    expect(screen.getByText(/confirmar partido/i)).toBeInTheDocument();
  });

  it('disables confirm button when no partidos are selected', async () => {
    const user = userEvent.setup();
    render(
      <MisPartidosPage
        onBack={mockOnBack}
        usuarioId={1}
        onViewPartidoDetails={mockOnViewPartidoDetails}
      />
    );

    // Deseleccionar todos los checkboxes de partidos (excluyendo el de "seleccionar todos")
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    // El primer checkbox es "seleccionar todos", los siguientes son de partidos
    for (let i = 1; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        await user.click(checkboxes[i]);
      }
    }

    // Esperar a que el estado se actualice
    await new Promise(resolve => setTimeout(resolve, 100));

    const confirmButton = screen.getByText(/confirmar partido/i);
    expect(confirmButton).toBeDisabled();
  });
});

