import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  Calendar,
  Plus,
  Clock,
  LogOut,
  ChevronRight,
  UserPlus,
  CalendarCheck,
  History,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useCreatePartido } from '../hooks/usePartidos';
import { usePartidosGuardados } from '../hooks/usePartidosGuardados';
import { generateRandomPartidos } from '../utils/generateRandomPartidos';
import { toast } from '../utils/toast';

type MenuOption = 
  | 'ver-partidos'
  | 'crear-partido'
  | 'gestionar-jugadores'
  | 'gestionar-sedes'
  | 'mis-partidos'
  | 'historial-inscripciones'
  | null;

interface MenuPrincipalPageProps {
  onSelectOption: (option: MenuOption) => void;
  onExit: () => void;
}

export const MenuPrincipalPage = ({ onSelectOption, onExit }: MenuPrincipalPageProps) => {
  const createPartido = useCreatePartido();
  const [isCreatingRandom, setIsCreatingRandom] = useState(false);
  const usuarioId = 1; // TODO: obtener del contexto de usuario
  const { data: partidosSeleccionados } = usePartidosGuardados(usuarioId);
  const cantidadPartidosGuardados = partidosSeleccionados?.items?.length || 0;

  const handleSelect = (option: MenuOption) => {
    onSelectOption(option);
  };

  const handleCreateRandomPartidos = async () => {
    setIsCreatingRandom(true);
    const partidosAleatorios = generateRandomPartidos(5);
    let creados = 0;
    let errores = 0;

    try {
      for (const partido of partidosAleatorios) {
        try {
          await createPartido.mutateAsync(partido);
          creados++;
        } catch (error) {
          errores++;
          console.error('Error al crear partido:', error);
        }
      }

      if (creados > 0) {
        toast.success(`✅ ${creados} partido${creados !== 1 ? 's' : ''} creado${creados !== 1 ? 's' : ''} exitosamente`);
      }
      if (errores > 0) {
        toast.error(`⚠️ ${errores} partido${errores !== 1 ? 's' : ''} no se pudo${errores !== 1 ? 'ron' : ''} crear`);
      }
    } catch {
      toast.error('Error al crear partidos aleatorios');
    } finally {
      setIsCreatingRandom(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ⚽ PICADITO
          </h1>
          <p className="text-gray-600">Sistema de Gestión de Partidos de Fútbol</p>
          
          {/* Botón temporal para crear partidos aleatorios */}
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={handleCreateRandomPartidos}
              disabled={isCreatingRandom || createPartido.isPending}
              className="flex items-center gap-2 mx-auto text-sm bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              <Sparkles className="h-4 w-4" />
              {isCreatingRandom ? 'Creando partidos...' : '🎲 Crear 5 Partidos Aleatorios (Temporal)'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSelect('ver-partidos')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">1) Ver Partidos</h3>
                  <p className="text-sm text-gray-600">Explorar partidos disponibles y próximos</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSelect('crear-partido')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">2) Crear Partido</h3>
                  <p className="text-sm text-gray-600">Armar un nuevo partido e incluir jugadores</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSelect('gestionar-jugadores')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <UserPlus className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">3) Jugadores</h3>
                  <p className="text-sm text-gray-600">Crear y administrar jugadores</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSelect('gestionar-sedes')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">4) Gestionar Sedes</h3>
                  <p className="text-sm text-gray-600">Administrar lugares donde se juegan partidos</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSelect('ver-partidos')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">5) Próximos Partidos</h3>
                  <p className="text-sm text-gray-600">Partidos a disputar próximamente</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow relative"
            onClick={() => handleSelect('mis-partidos')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg relative">
                  <CalendarCheck className="h-6 w-6 text-indigo-600" />
                  {cantidadPartidosGuardados > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cantidadPartidosGuardados > 9 ? '9+' : cantidadPartidosGuardados}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">6) Mis Partidos</h3>
                  <p className="text-sm text-gray-600">
                    {cantidadPartidosGuardados > 0 
                      ? `${cantidadPartidosGuardados} partido${cantidadPartidosGuardados !== 1 ? 's' : ''} pendiente${cantidadPartidosGuardados !== 1 ? 's' : ''}`
                      : 'Partidos que quiero inscribirme'}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSelect('historial-inscripciones')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <History className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">7) Historial</h3>
                  <p className="text-sm text-gray-600">Ver todas tus inscripciones confirmadas</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            onClick={onExit}
            className="flex items-center gap-2 mx-auto"
          >
            <LogOut className="h-5 w-5" />
            Salir
          </Button>
        </div>
      </div>
    </div>
  );
};

