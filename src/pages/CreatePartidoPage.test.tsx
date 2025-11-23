import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/testUtils';
import { CreatePartidoPage } from './CreatePartidoPage';

vi.mock('../hooks/usePartidos', () => ({
  useCreatePartido: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('../hooks/useParticipantes', () => ({
  useInscribirse: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('../hooks/useSedes', () => ({
  useSedes: vi.fn(() => ({
    data: [
      { id: 1, nombre: 'Estadio Olímpico', direccion: 'Av. Principal 123' },
      { id: 2, nombre: 'Cancha Central', direccion: 'Calle Secundaria 456' },
    ],
    isLoading: false,
  })),
}));

describe('CreatePartidoPage', () => {
  const mockOnBack = vi.fn();
  const mockOnPartidoCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form correctly', () => {
    render(
      <CreatePartidoPage
        onBack={mockOnBack}
        onPartidoCreated={mockOnPartidoCreated}
      />
    );

    expect(screen.getByText('Crear Nuevo Partido')).toBeInTheDocument();
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
  });
});

