import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/testUtils';
import { GestionarSedesPage } from './GestionarSedesPage';

vi.mock('../hooks/useSedes', () => ({
  useSedes: vi.fn(() => ({
    data: [
      { id: 1, nombre: 'Estadio Olímpico', direccion: 'Av. Principal 123' },
    ],
    isLoading: false,
  })),
  useCreateSede: vi.fn(() => ({
    mutateAsync: vi.fn(),
  })),
  useUpdateSede: vi.fn(() => ({
    mutateAsync: vi.fn(),
  })),
  useDeleteSede: vi.fn(() => ({
    mutateAsync: vi.fn(),
  })),
}));

describe('GestionarSedesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list of sedes', () => {
    render(<GestionarSedesPage />);

    expect(screen.getByText(/gestión de sedes/i)).toBeInTheDocument();
    expect(screen.getByText('Estadio Olímpico')).toBeInTheDocument();
  });
});

