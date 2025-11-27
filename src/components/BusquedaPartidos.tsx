import { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter, Calendar, MapPin, User, Users } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Drawer } from './ui/Drawer';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useCategorias } from '../hooks/useCategorias';
import type { BusquedaPartidoDTO, EstadoPartido } from '../types';

interface BusquedaPartidosProps {
  onSearch: (busqueda: BusquedaPartidoDTO) => void;
  onClear: () => void;
}

export const BusquedaPartidos = ({ onSearch, onClear }: BusquedaPartidosProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { data: categorias } = useCategorias();
  const [titulo, setTitulo] = useState('');
  const [tituloDebounced, setTituloDebounced] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [creadorNombre, setCreadorNombre] = useState('');
  const [estado, setEstado] = useState<EstadoPartido | ''>('');
  const [categoriaIds, setCategoriaIds] = useState<number[]>([]);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [minJugadores, setMinJugadores] = useState('');
  const [maxJugadores, setMaxJugadores] = useState('');
  const [cuposDisponiblesMin, setCuposDisponiblesMin] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  const buildBusqueda = useCallback((): BusquedaPartidoDTO => {
    return {
      titulo: titulo || undefined,
      ubicacion: ubicacion || undefined,
      creadorNombre: creadorNombre || undefined,
      estado: estado || undefined,
      categoriaIds: categoriaIds.length > 0 ? categoriaIds : undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      minJugadores: minJugadores ? parseInt(minJugadores) : undefined,
      maxJugadores: maxJugadores ? parseInt(maxJugadores) : undefined,
      cuposDisponiblesMin: cuposDisponiblesMin ? parseInt(cuposDisponiblesMin) : undefined,
      soloDisponibles: soloDisponibles || undefined,
    };
  }, [titulo, ubicacion, creadorNombre, estado, categoriaIds, fechaDesde, fechaHasta, minJugadores, maxJugadores, cuposDisponiblesMin, soloDisponibles]);

  const handleSearch = useCallback(() => {
    const busqueda = buildBusqueda();
    onSearch(busqueda);
  }, [buildBusqueda, onSearch]);

  // Debounce para búsqueda instantánea
  useEffect(() => {
    const timer = setTimeout(() => {
      setTituloDebounced(titulo);
    }, 300);
    return () => clearTimeout(timer);
  }, [titulo]);

  // Búsqueda automática cuando cambia el título
  useEffect(() => {
    if (tituloDebounced !== '') {
      handleSearch();
    }
  }, [tituloDebounced, handleSearch]);

  const handleClear = () => {
    setTitulo('');
    setTituloDebounced('');
    setUbicacion('');
    setCreadorNombre('');
    setEstado('');
    setCategoriaIds([]);
    setFechaDesde('');
    setFechaHasta('');
    setMinJugadores('');
    setMaxJugadores('');
    setCuposDisponiblesMin('');
    setSoloDisponibles(false);
    onClear();
  };

  const getEstadoLabel = (estado: EstadoPartido | '') => {
    const labels: Record<string, string> = {
      'DISPONIBLE': 'Disponible',
      'COMPLETO': 'Completo',
      'FINALIZADO': 'Finalizado',
      'CANCELADO': 'Cancelado',
    };
    return labels[estado] || estado;
  };

  const categoriasSeleccionadas = categorias?.filter(c => categoriaIds.includes(c.id)) || [];
  const activeFilters = [
    { key: 'ubicacion', label: ubicacion, onRemove: () => setUbicacion('') },
    { key: 'creador', label: creadorNombre, onRemove: () => setCreadorNombre('') },
    { key: 'estado', label: estado ? getEstadoLabel(estado) : '', onRemove: () => setEstado('') },
    ...categoriasSeleccionadas.map(cat => ({
      key: `categoria-${cat.id}`,
      label: cat.nombre,
      onRemove: () => setCategoriaIds(categoriaIds.filter(id => id !== cat.id)),
    })),
    { key: 'fechaDesde', label: fechaDesde ? 'Desde: ' + fechaDesde.split('T')[0] : '', onRemove: () => setFechaDesde('') },
    { key: 'fechaHasta', label: fechaHasta ? 'Hasta: ' + fechaHasta.split('T')[0] : '', onRemove: () => setFechaHasta('') },
    { key: 'minJugadores', label: minJugadores ? `Min: ${minJugadores}` : '', onRemove: () => setMinJugadores('') },
    { key: 'maxJugadores', label: maxJugadores ? `Max: ${maxJugadores}` : '', onRemove: () => setMaxJugadores('') },
    { key: 'cupos', label: cuposDisponiblesMin ? `Cupos: ${cuposDisponiblesMin}` : '', onRemove: () => setCuposDisponiblesMin('') },
    { key: 'soloDisponibles', label: soloDisponibles ? 'Solo disponibles' : '', onRemove: () => setSoloDisponibles(false) },
  ].filter(filter => filter.label);

  const hasFilters = activeFilters.length > 0 || titulo;

  const renderFiltersContent = () => (
    <div className="space-y-4">
      <Input
        label="Ubicación"
        value={ubicacion}
        onChange={(e) => setUbicacion(e.target.value)}
        placeholder="Ej: Cancha Central"
        leftIcon={<MapPin className="h-4 w-4" />}
      />

      <Input
        label="Creador"
        value={creadorNombre}
        onChange={(e) => setCreadorNombre(e.target.value)}
        placeholder="Nombre del creador"
        leftIcon={<User className="h-4 w-4" />}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Categorías</label>
        <div className="border border-gray-300 rounded-xl p-3 max-h-48 overflow-y-auto bg-white">
          {categorias && categorias.length > 0 ? (
            <div className="space-y-2">
              {categorias.map((categoria) => {
                const isChecked = categoriaIds.includes(categoria.id);
                return (
                  <label
                    key={categoria.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCategoriaIds([...categoriaIds, categoria.id]);
                        } else {
                          setCategoriaIds(categoriaIds.filter((id) => id !== categoria.id));
                        }
                      }}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      {categoria.icono && <span className="mr-1">{categoria.icono}</span>}
                      {categoria.nombre}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay categorías disponibles</p>
          )}
        </div>
        {categoriaIds.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {categoriaIds.length} categoría{categoriaIds.length !== 1 ? 's' : ''} seleccionada{categoriaIds.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoPartido | '')}
          className="w-full px-4 py-2.5 text-base rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        >
          <option value="">Todos</option>
          <option value="DISPONIBLE">Disponible</option>
          <option value="COMPLETO">Completo</option>
          <option value="FINALIZADO">Finalizado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fecha Desde"
          type="datetime-local"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          leftIcon={<Calendar className="h-4 w-4" />}
        />
        <Input
          label="Fecha Hasta"
          type="datetime-local"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          leftIcon={<Calendar className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Mín. Jugadores"
          type="number"
          min="1"
          value={minJugadores}
          onChange={(e) => setMinJugadores(e.target.value)}
          placeholder="Ej: 10"
          leftIcon={<Users className="h-4 w-4" />}
        />
        <Input
          label="Máx. Jugadores"
          type="number"
          min="1"
          value={maxJugadores}
          onChange={(e) => setMaxJugadores(e.target.value)}
          placeholder="Ej: 22"
          leftIcon={<Users className="h-4 w-4" />}
        />
      </div>

      <Input
        label="Cupos Disponibles Mín."
        type="number"
        min="0"
        value={cuposDisponiblesMin}
        onChange={(e) => setCuposDisponiblesMin(e.target.value)}
        placeholder="Ej: 2"
      />

      <div className="flex items-center pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={soloDisponibles}
            onChange={(e) => setSoloDisponibles(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Solo partidos disponibles</span>
        </label>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <Button onClick={handleSearch} className="flex-1">
          Aplicar Filtros
        </Button>
        <Button variant="outline" onClick={handleClear} className="flex-1">
          Limpiar
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Card className="mb-6" variant="default">
        <div className="space-y-4">
          {/* Búsqueda rápida */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Buscar por título..."
                leftIcon={<Search className="h-4 w-4" />}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            {!isMobile && (
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            )}
            {isMobile ? (
              <Button
                variant="outline"
                onClick={() => setShowFiltersDrawer(true)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {activeFilters.length > 0 && (
                  <Badge variant="info" size="sm">{activeFilters.length}</Badge>
                )}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {showAdvanced ? 'Ocultar' : 'Filtros'}
                  {activeFilters.length > 0 && (
                    <Badge variant="info" size="sm" className="ml-1">{activeFilters.length}</Badge>
                  )}
                </Button>
                {hasFilters && (
                  <Button variant="ghost" onClick={handleClear} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Limpiar
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Chips de filtros activos */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="info"
                  size="sm"
                  className="flex items-center gap-1.5 cursor-pointer hover:bg-primary-200 transition-colors"
                  onClick={filter.onRemove}
                >
                  {filter.label}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}

          {/* Filtros avanzados - Desktop */}
          {!isMobile && showAdvanced && (
            <div className="pt-4 border-t border-gray-200 animate-fade-in">
              {renderFiltersContent()}
            </div>
          )}
        </div>
      </Card>

      {/* Drawer de filtros - Mobile */}
      <Drawer
        isOpen={showFiltersDrawer}
        onClose={() => setShowFiltersDrawer(false)}
        title="Filtros de Búsqueda"
        position="bottom"
        size="lg"
      >
        {renderFiltersContent()}
      </Drawer>
    </>
  );
};

