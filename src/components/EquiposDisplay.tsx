import { Users, RefreshCw } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useEquiposByPartido, useGenerarEquipos, useDeleteEquipos } from '../hooks/useEquipos';
import { toast } from '../utils/toast';
import { getPosicionLabel, getNivelLabel } from '../utils/formatters';
import type { Posicion, Nivel } from '../types';

interface EquiposDisplayProps {
  partidoId: number;
  cantidadParticipantes: number;
  maxJugadores: number;
}

export const EquiposDisplay = ({ partidoId, cantidadParticipantes, maxJugadores }: EquiposDisplayProps) => {
  const { data: equipos = [], isLoading } = useEquiposByPartido(partidoId);
  const generarEquipos = useGenerarEquipos();
  const deleteEquipos = useDeleteEquipos();

  const canGenerarEquipos = cantidadParticipantes >= 2 && equipos.length === 0;
  const hasEquipos = equipos.length > 0;

  const handleGenerarEquipos = () => {
    generarEquipos.mutate(partidoId, {
      onSuccess: () => {
        toast.success('Equipos generados exitosamente');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Error al generar los equipos');
      },
    });
  };

  const handleRebalancear = () => {
    deleteEquipos.mutate(partidoId, {
      onSuccess: () => {
        handleGenerarEquipos();
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Error al rebalancear los equipos');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
        <p className="text-sm text-gray-500">Cargando equipos...</p>
      </div>
    );
  }

  if (!hasEquipos && !canGenerarEquipos) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">
          Se necesitan al menos 2 participantes para generar equipos
        </p>
      </div>
    );
  }

  if (!hasEquipos && canGenerarEquipos) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-sm text-gray-500 mb-4">
          Genera equipos balanceados automáticamente
        </p>
        <Button
          onClick={handleGenerarEquipos}
          isLoading={generarEquipos.isPending}
          className="flex items-center gap-2 mx-auto"
        >
          <Users className="h-4 w-4" />
          Generar Equipos
        </Button>
      </div>
    );
  }

  const totalParticipantes = equipos.reduce((sum, equipo) => sum + equipo.cantidadParticipantes, 0);
  const diferencia = Math.abs(equipos[0]?.cantidadParticipantes - equipos[1]?.cantidadParticipantes || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Equipos Generados</h3>
          <p className="text-sm text-gray-600">
            {totalParticipantes} participantes distribuidos en {equipos.length} equipos
            {diferencia > 0 && (
              <span className="ml-2 text-warning-600">
                (diferencia: {diferencia} jugador{diferencia !== 1 ? 'es' : ''})
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRebalancear}
          isLoading={deleteEquipos.isPending || generarEquipos.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Rebalancear
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {equipos.map((equipo) => (
          <Card key={equipo.id} variant="default" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{equipo.nombre}</h4>
              <Badge variant="info" size="sm">
                {equipo.cantidadParticipantes} jugador{equipo.cantidadParticipantes !== 1 ? 'es' : ''}
              </Badge>
            </div>

            <div className="space-y-2">
              {equipo.participantes.map((participante) => (
                <div
                  key={participante.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {participante.nombre}
                      {participante.apodo && (
                        <span className="text-gray-500 ml-1">({participante.apodo})</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {participante.posicion && (
                        <Badge variant="default" size="sm">
                          {getPosicionLabel(participante.posicion as Posicion)}
                        </Badge>
                      )}
                      {participante.nivel && (
                        <Badge variant="info" size="sm">
                          {getNivelLabel(participante.nivel as Nivel)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

