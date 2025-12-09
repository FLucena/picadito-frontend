import { useState } from 'react';
import { partidosApi, categoriasApi, sedesApi, healthApi } from '../services/api';
import type { CategoriaResponseDTO, SedeResponseDTO, BusquedaPartidoDTO } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface TestResult {
  endpoint: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
  timestamp?: string;
}

export function TestEndpointsPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [selectedPartidoId, setSelectedPartidoId] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useState<BusquedaPartidoDTO>({
    soloDisponibles: true,
  });

  const updateResult = (endpoint: string, update: Partial<TestResult>) => {
    setResults((prev) => ({
      ...prev,
      [endpoint]: {
        ...prev[endpoint],
        ...update,
        timestamp: new Date().toISOString(),
      },
    }));
  };

  const testEndpoint = async (
    endpoint: string,
    testFn: () => Promise<any>
  ) => {
    updateResult(endpoint, { status: 'loading' });
    try {
      const data = await testFn();
      updateResult(endpoint, { status: 'success', data });
    } catch (error: any) {
      updateResult(endpoint, {
        status: 'error',
        error: error.message || 'Error desconocido',
      });
    }
  };

  const testHealthCheck = () => {
    testEndpoint('health', () => healthApi.check());
  };

  const testGetPartidos = () => {
    testEndpoint('partidos-all', () => partidosApi.getAll());
  };

  const testGetPartidosPaginated = () => {
    testEndpoint('partidos-paginated', () =>
      partidosApi.getAllPaginated(0, 20, 'fechaHora', 'DESC')
    );
  };

  const testGetPartidosDisponibles = () => {
    testEndpoint('partidos-disponibles', () => partidosApi.getDisponibles());
  };

  const testGetPartidosDisponiblesPaginated = () => {
    testEndpoint('partidos-disponibles-paginated', () =>
      partidosApi.getDisponiblesPaginated(0, 20, 'fechaHora', 'DESC')
    );
  };

  const testGetPartidoById = () => {
    if (!selectedPartidoId) {
      alert('Por favor, primero obtén la lista de partidos y selecciona uno');
      return;
    }
    testEndpoint(`partido-${selectedPartidoId}`, () =>
      partidosApi.getById(selectedPartidoId!)
    );
  };

  const testGetCostoPorJugador = () => {
    if (!selectedPartidoId) {
      alert('Por favor, primero obtén la lista de partidos y selecciona uno');
      return;
    }
    testEndpoint(`costo-por-jugador-${selectedPartidoId}`, () =>
      partidosApi.getCostoPorJugador(selectedPartidoId!)
    );
  };

  const testBuscarPartidos = () => {
    testEndpoint('buscar-partidos', () =>
      partidosApi.buscarPaginated(searchParams, 0, 20, 'fechaHora', 'DESC')
    );
  };

  const testGetCategorias = () => {
    testEndpoint('categorias', () => categoriasApi.getAll());
  };

  const testGetCategoriaById = (id: number) => {
    testEndpoint(`categoria-${id}`, () => categoriasApi.getById(id));
  };

  const testGetPartidosByCategoria = (categoriaId: number) => {
    testEndpoint(`partidos-categoria-${categoriaId}`, () =>
      categoriasApi.getPartidosByCategoria(categoriaId)
    );
  };

  const testGetSedes = () => {
    testEndpoint('sedes', () => sedesApi.getAll());
  };

  const testGetSedeById = (id: number) => {
    testEndpoint(`sede-${id}`, () => sedesApi.getById(id));
  };

  const renderResult = (endpoint: string, result: TestResult) => {
    if (result.status === 'idle') return null;

    return (
      <div className="mt-4 p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm">{endpoint}</h4>
          <span
            className={`px-2 py-1 rounded text-xs ${
              result.status === 'loading'
                ? 'bg-yellow-100 text-yellow-800'
                : result.status === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {result.status}
          </span>
        </div>
        {result.timestamp && (
          <p className="text-xs text-gray-500 mb-2">
            {new Date(result.timestamp).toLocaleString()}
          </p>
        )}
        {result.status === 'loading' && (
          <p className="text-sm text-gray-600">Cargando...</p>
        )}
        {result.status === 'error' && (
          <div className="text-sm text-red-600">
            <p className="font-semibold">Error:</p>
            <p>{result.error}</p>
          </div>
        )}
        {result.status === 'success' && result.data && (
          <div className="mt-2">
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
              {JSON.stringify(result.data, null, 2)}
            </pre>
            {Array.isArray(result.data) && (
              <p className="text-xs text-gray-600 mt-2">
                Total: {result.data.length} elementos
              </p>
            )}
            {result.data.content && (
              <p className="text-xs text-gray-600 mt-2">
                Página {result.data.page + 1} de {result.data.totalPages} (
                {result.data.totalElements} elementos totales)
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Prueba de Endpoints Públicos</h1>
        <p className="text-gray-600">
          Prueba los endpoints públicos del backend en producción
        </p>
        <p className="text-sm text-gray-500 mt-1">
          URL Base: {import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://picadito-backend.onrender.com/api')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Health Check */}
        <Card>
          <h3 className="font-semibold mb-3">Health Check</h3>
          <Button onClick={testHealthCheck} className="w-full">
            GET /actuator/health
          </Button>
          {results['health'] && renderResult('health', results['health'])}
        </Card>

        {/* Partidos */}
        <Card>
          <h3 className="font-semibold mb-3">Partidos</h3>
          <div className="space-y-2">
            <Button onClick={testGetPartidos} className="w-full text-sm">
              GET /partidos
            </Button>
            <Button onClick={testGetPartidosPaginated} className="w-full text-sm">
              GET /partidos (paginado)
            </Button>
            <Button
              onClick={testGetPartidosDisponibles}
              className="w-full text-sm"
            >
              GET /partidos/disponibles
            </Button>
            <Button
              onClick={testGetPartidosDisponiblesPaginated}
              className="w-full text-sm"
            >
              GET /partidos/disponibles (paginado)
            </Button>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="ID Partido"
                value={selectedPartidoId || ''}
                onChange={(e) =>
                  setSelectedPartidoId(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <Button onClick={testGetPartidoById} className="text-sm">
                GET /partidos/{'{id}'}
              </Button>
            </div>
            <Button onClick={testGetCostoPorJugador} className="w-full text-sm">
              GET /partidos/{'{id}'}/costo-por-jugador
            </Button>
          </div>
          {Object.entries(results)
            .filter(([key]) => key.startsWith('partido') || key.startsWith('costo'))
            .map(([key, result]) => (
              <div key={key}>{renderResult(key, result)}</div>
            ))}
        </Card>

        {/* Búsqueda de Partidos */}
        <Card>
          <h3 className="font-semibold mb-3">Búsqueda de Partidos</h3>
          <div className="space-y-2 mb-3">
            <input
              type="text"
              placeholder="Título"
              value={searchParams.titulo || ''}
              onChange={(e) =>
                setSearchParams({ ...searchParams, titulo: e.target.value })
              }
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <input
              type="text"
              placeholder="Ubicación"
              value={searchParams.ubicacion || ''}
              onChange={(e) =>
                setSearchParams({ ...searchParams, ubicacion: e.target.value })
              }
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={searchParams.soloDisponibles || false}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    soloDisponibles: e.target.checked,
                  })
                }
              />
              Solo disponibles
            </label>
          </div>
          <Button onClick={testBuscarPartidos} className="w-full">
            POST /partidos/buscar
          </Button>
          {results['buscar-partidos'] &&
            renderResult('buscar-partidos', results['buscar-partidos'])}
        </Card>

        {/* Categorías */}
        <Card>
          <h3 className="font-semibold mb-3">Categorías</h3>
          <div className="space-y-2">
            <Button onClick={testGetCategorias} className="w-full text-sm">
              GET /categorias
            </Button>
            {results['categorias']?.status === 'success' &&
              Array.isArray(results['categorias'].data) &&
              results['categorias'].data.length > 0 && (
                <div className="space-y-1">
                  {results['categorias'].data
                    .slice(0, 3)
                    .map((cat: CategoriaResponseDTO) => (
                      <div key={cat.id} className="flex gap-2">
                        <Button
                          onClick={() => testGetCategoriaById(cat.id)}
                          className="flex-1 text-xs"
                        >
                          GET /categorias/{cat.id}
                        </Button>
                        <Button
                          onClick={() =>
                            testGetPartidosByCategoria(cat.id)
                          }
                          className="flex-1 text-xs"
                        >
                          GET /partidos/categoria/{cat.id}
                        </Button>
                      </div>
                    ))}
                </div>
              )}
          </div>
          {Object.entries(results)
            .filter(([key]) => key.startsWith('categoria') || key.startsWith('partidos-categoria'))
            .map(([key, result]) => (
              <div key={key}>{renderResult(key, result)}</div>
            ))}
        </Card>

        {/* Sedes */}
        <Card>
          <h3 className="font-semibold mb-3">Sedes</h3>
          <div className="space-y-2">
            <Button onClick={testGetSedes} className="w-full text-sm">
              GET /sedes
            </Button>
            {results['sedes']?.status === 'success' &&
              Array.isArray(results['sedes'].data) &&
              results['sedes'].data.length > 0 && (
                <div className="space-y-1">
                  {results['sedes'].data
                    .slice(0, 3)
                    .map((sede: SedeResponseDTO) => (
                      <Button
                        key={sede.id}
                        onClick={() => testGetSedeById(sede.id)}
                        className="w-full text-xs"
                      >
                        GET /sedes/{sede.id}
                      </Button>
                    ))}
                </div>
              )}
          </div>
          {Object.entries(results)
            .filter(([key]) => key.startsWith('sede'))
            .map(([key, result]) => (
              <div key={key}>{renderResult(key, result)}</div>
            ))}
        </Card>
      </div>

      {/* Resumen de resultados */}
      <Card className="mt-6">
        <h3 className="font-semibold mb-3">Resumen de Pruebas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total:</p>
            <p className="text-2xl font-bold">
              {Object.keys(results).length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Exitosas:</p>
            <p className="text-2xl font-bold text-green-600">
              {
                Object.values(results).filter((r) => r.status === 'success')
                  .length
              }
            </p>
          </div>
          <div>
            <p className="text-gray-600">Errores:</p>
            <p className="text-2xl font-bold text-red-600">
              {
                Object.values(results).filter((r) => r.status === 'error')
                  .length
              }
            </p>
          </div>
          <div>
            <p className="text-gray-600">Cargando:</p>
            <p className="text-2xl font-bold text-yellow-600">
              {
                Object.values(results).filter((r) => r.status === 'loading')
                  .length
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

