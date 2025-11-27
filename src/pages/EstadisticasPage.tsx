import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useEstadisticas, useEstadisticasPorPeriodo } from '../hooks/useEstadisticas';
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#1E88E5', '#43A047', '#FB8C00', '#E53935', '#8E24AA', '#00ACC1'];

export const EstadisticasPage = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [usarPeriodo, setUsarPeriodo] = useState(false);

  const { data: estadisticas, isLoading } = useEstadisticas();
  const { data: estadisticasPeriodo } = useEstadisticasPorPeriodo(
    fechaInicio,
    fechaFin
  );

  const datos = usarPeriodo && estadisticasPeriodo ? estadisticasPeriodo : estadisticas;

  const handleAplicarPeriodo = () => {
    if (fechaInicio && fechaFin) {
      setUsarPeriodo(true);
    } else {
      setUsarPeriodo(false);
    }
  };

  const handleLimpiarPeriodo = () => {
    setFechaInicio('');
    setFechaFin('');
    setUsarPeriodo(false);
  };

  const partidosPorCategoriaData = datos
    ? Object.entries(datos.partidosPorCategoria).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se pudieron cargar las estadísticas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Estadísticas</h1>
          <p className="text-gray-600">Métricas y reportes del sistema</p>
        </div>

        {/* Filtros de Fecha */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAplicarPeriodo} disabled={!fechaInicio || !fechaFin}>
                Aplicar
              </Button>
              {usarPeriodo && (
                <Button variant="outline" onClick={handleLimpiarPeriodo}>
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Partidos</p>
                <p className="text-2xl font-bold text-gray-900">{datos.totalPartidos}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reservas</p>
                <p className="text-2xl font-bold text-gray-900">{datos.totalReservas}</p>
              </div>
              <Users className="h-8 w-8 text-primary-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${datos.ingresosTotales.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ocupación Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {datos.tasaOcupacionPromedio.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Partidos por Categoría */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Partidos por Categoría</h3>
            {partidosPorCategoriaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={partidosPorCategoriaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {partidosPorCategoriaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </Card>

          {/* Gráfico de Partidos Populares */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Partidos Populares</h3>
            {datos.partidosPopulares && datos.partidosPopulares.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datos.partidosPopulares.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="titulo"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="porcentajeOcupacion" fill="#1E88E5" name="Ocupación %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </Card>
        </div>

        {/* Tablas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usuarios Activos */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuarios Más Activos</h3>
            {datos.usuariosActivos && datos.usuariosActivos.length > 0 ? (
              <div className="space-y-3">
                {datos.usuariosActivos.slice(0, 5).map((usuario) => (
                  <div
                    key={usuario.usuarioId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{usuario.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {usuario.cantidadReservas} reservas
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      ${usuario.totalGastado.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </Card>

          {/* Sedes Utilizadas */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sedes Más Utilizadas</h3>
            {datos.sedesUtilizadas && datos.sedesUtilizadas.length > 0 ? (
              <div className="space-y-3">
                {datos.sedesUtilizadas.slice(0, 5).map((sede) => (
                  <div
                    key={sede.sedeId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {sede.nombre || sede.direccion || `Sede #${sede.sedeId}`}
                      </p>
                      {sede.direccion && sede.nombre && (
                        <p className="text-sm text-gray-500">{sede.direccion}</p>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {sede.cantidadPartidos} partidos
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

