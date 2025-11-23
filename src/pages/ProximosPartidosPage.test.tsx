import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/testUtils';
import { ProximosPartidosPage } from './ProximosPartidosPage';
import { usePartidos } from '../hooks/usePartidos';
import type { UseQueryResult } from '@tanstack/react-query';
import type { PartidoResponseDTO } from '../types';

vi.mock('../hooks/usePartidos');

describe('ProximosPartidosPage', () => {
  const mockOnBack = vi.fn();
  const mockOnViewPartidoDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list of upcoming partidos', () => {
    vi.mocked(usePartidos).mockReturnValue({
      data: [
        {
          id: 1,
          titulo: 'Partido Futuro',
          fechaHora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          estado: 'DISPONIBLE',
          maxJugadores: 10,
          cantidadParticipantes: 5,
        },
      ],
      isLoading: false,
    } as unknown as UseQueryResult<PartidoResponseDTO[], Error>);

    render(
      <ProximosPartidosPage
        onBack={mockOnBack}
        onViewPartidoDetails={mockOnViewPartidoDetails}
      />
    );

    expect(screen.getByText('Próximos Partidos')).toBeInTheDocument();
    expect(screen.getByText('Partido Futuro')).toBeInTheDocument();
  });

  it('shows empty state when no partidos', () => {
    vi.mocked(usePartidos).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as UseQueryResult<PartidoResponseDTO[], Error>);

    render(
      <ProximosPartidosPage
        onBack={mockOnBack}
        onViewPartidoDetails={mockOnViewPartidoDetails}
      />
    );

    expect(screen.getByText(/no hay partidos próximos programados/i)).toBeInTheDocument();
  });
});

