import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PartidoCard } from '../components/PartidoCard';
import { usePartidos } from '../hooks/usePartidos';
import { EstadoPartido } from '../types';

interface ProximosPartidosPageProps {
  onBack: () => void;
  onViewPartidoDetails: (id: number) => void;
}

export const ProximosPartidosPage = ({ onBack, onViewPartidoDetails }: ProximosPartidosPageProps) => {
  const { data: partidos, isLoading } = usePartidos();

  // Filtrar partidos futuros y ordenarlos por fecha
  const proximosPartidos = partidos
    ? partidos
        .filter((partido) => {
          const fechaPartido = new Date(partido.fechaHora);
          const ahora = new Date();
          return fechaPartido > ahora && 
                 (partido.estado === EstadoPartido.PROGRAMADO || partido.estado === EstadoPartido.EN_CURSO);
        })
        .sort((a, b) => {
          const fechaA = new Date(a.fechaHora).getTime();
          const fechaB = new Date(b.fechaHora).getTime();
          return fechaA - fechaB;
        })
    : [];

  const handleInscribirse = (partidoId: number) => {
    onViewPartidoDetails(partidoId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Próximos Partidos</h1>
          <p className="text-gray-600">Partidos programados para disputarse próximamente</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : proximosPartidos.length === 0 ? (
          <Card className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay partidos próximos programados</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proximosPartidos.map((partido) => (
              <PartidoCard
                key={partido.id}
                partido={partido}
                onViewDetails={onViewPartidoDetails}
                onInscribirse={handleInscribirse}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

