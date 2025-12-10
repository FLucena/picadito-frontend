import { User, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { usePartidos } from '../hooks/usePartidos';
import { getPosicionLabel, getNivelLabel, getNivelBadgeColor } from '../utils/formatters';
import type { Posicion, Nivel } from '../types';

interface Jugador {
  id: string;
  nombre: string;
  apodo?: string;
  posicion?: Posicion;
  nivel?: Nivel;
  partidosParticipados: number;
  partidosIds: number[];
  ultimaParticipacion?: string;
}

export const GestionarJugadoresPage = () => {
  const { data: partidos, isLoading, error } = usePartidos();

  // Extraer jugadores únicos de todos los participantes
  const jugadoresMap = new Map<string, Jugador>();
  
  if (partidos && Array.isArray(partidos)) {
    partidos.forEach((partido) => {
      if (partido?.participantes && Array.isArray(partido.participantes)) {
        partido.participantes.forEach((participante) => {
          if (!participante?.nombre) return; // Saltar participantes sin nombre
          
          const key = participante.nombre.toLowerCase();
          if (!jugadoresMap.has(key)) {
            jugadoresMap.set(key, {
              id: participante.id?.toString() || key,
              nombre: participante.nombre,
              apodo: participante.apodo,
              posicion: participante.posicion,
              nivel: participante.nivel,
              partidosParticipados: 1,
              partidosIds: partido.id ? [partido.id] : [],
              ultimaParticipacion: participante.fechaInscripcion || undefined,
            });
          } else {
            const jugador = jugadoresMap.get(key)!;
            jugador.partidosParticipados += 1;
            if (partido.id) {
              jugador.partidosIds.push(partido.id);
            }
            // Actualizar última participación si es más reciente
            if (participante.fechaInscripcion) {
              try {
                const fechaParticipacion = new Date(participante.fechaInscripcion);
                if (!isNaN(fechaParticipacion.getTime())) {
                  const fechaUltima = jugador.ultimaParticipacion 
                    ? new Date(jugador.ultimaParticipacion)
                    : new Date(0);
                  if (!isNaN(fechaUltima.getTime()) && fechaParticipacion > fechaUltima) {
                    jugador.ultimaParticipacion = participante.fechaInscripcion;
                  }
                }
              } catch (e) {
                // Ignorar errores de fecha inválida
              }
            }
          }
        });
      }
    });
  }

  const jugadores = Array.from(jugadoresMap.values())
    .sort((a, b) => b.partidosParticipados - a.partidosParticipados); // Ordenar por más participaciones


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Jugadores</h1>
            <p className="text-gray-600 mt-1">Jugadores que han participado en partidos</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando jugadores...</p>
          </div>
        ) : error ? (
          <Card className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <User className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-red-600 text-lg font-semibold mb-2">Error al cargar jugadores</p>
            <p className="text-gray-600 text-sm mb-4">
              {error instanceof Error ? error.message : 'No se pudieron cargar los jugadores. Por favor, intenta nuevamente.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reintentar
            </button>
          </Card>
        ) : jugadores.length === 0 ? (
          <Card className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No hay jugadores registrados aún</p>
            <p className="text-gray-400 text-sm">
              Los jugadores aparecerán aquí cuando se inscriban a partidos
            </p>
          </Card>
        ) : (
          <>
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Total de jugadores únicos:</strong> {jugadores.length} jugador{jugadores.length !== 1 ? 'es' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jugadores.map((jugador) => (
                <Card key={jugador.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{jugador.nombre}</h3>
                      {jugador.apodo && (
                        <p className="text-sm text-gray-600 italic">"{jugador.apodo}"</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {jugador.posicion && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Posición:</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {getPosicionLabel(jugador.posicion)}
                        </span>
                      </div>
                    )}
                    {jugador.nivel && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Nivel:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getNivelBadgeColor(jugador.nivel)}`}>
                          {getNivelLabel(jugador.nivel)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {jugador.partidosParticipados} partido{jugador.partidosParticipados !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {jugador.ultimaParticipacion && (() => {
                      try {
                        const fecha = new Date(jugador.ultimaParticipacion);
                        if (isNaN(fecha.getTime())) return null;
                        return (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Última participación: {fecha.toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

