import { useState, useEffect } from 'react';
import { MenuPrincipalPage } from './pages/MenuPrincipalPage';
import { VerPartidosPage } from './pages/VerPartidosPage';
import { CreatePartidoPage } from './pages/CreatePartidoPage';
import { EditPartidoPage } from './pages/EditPartidoPage';
import { GestionarJugadoresPage } from './pages/GestionarJugadoresPage';
import { GestionarSedesPage } from './pages/GestionarSedesPage';
import { GestionarCategoriasPage } from './pages/GestionarCategoriasPage';
import { EstadisticasPage } from './pages/EstadisticasPage';
import { MisPartidosPage } from './pages/MisPartidosPage';
import { HistorialInscripcionesPage } from './pages/HistorialInscripcionesPage';
import { PartidoDetailPage } from './pages/PartidoDetailPage';
import { ToastContainer } from './components/ui/Toast';
import { Navigation } from './components/layout/Navigation';
import { Sidebar } from './components/layout/Sidebar';
import { usePartidosGuardados } from './hooks/usePartidosGuardados';
import { toast } from './utils/toast';

export type Page = 
  | 'menu'
  | 'ver-partidos'
  | 'crear-partido'
  | 'editar-partido'
  | 'gestionar-jugadores'
  | 'gestionar-sedes'
  | 'gestionar-categorias'
  | 'estadisticas'
  | 'mis-partidos'
  | 'historial-inscripciones'
  | 'partido-detail';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('ver-partidos');
  const [selectedPartidoId, setSelectedPartidoId] = useState<number | null>(null);
  const [editingPartidoId, setEditingPartidoId] = useState<number | null>(null);
  const [usuarioId] = useState<number>(1); // Demo: usuario ID 1
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);
  
  const { data: partidosSeleccionados } = usePartidosGuardados(usuarioId);
  const partidosGuardadosCount = partidosSeleccionados?.items?.length || 0;

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToasts) => {
      setToasts(newToasts);
    });
    return unsubscribe;
  }, []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    if (page !== 'partido-detail' && page !== 'editar-partido') {
      setSelectedPartidoId(null);
      setEditingPartidoId(null);
    }
  };

  const handleMenuSelect = (option: string | null) => {
    switch (option) {
      case 'ver-partidos':
        setCurrentPage('ver-partidos');
        break;
      case 'crear-partido':
        setCurrentPage('crear-partido');
        break;
      case 'gestionar-jugadores':
        setCurrentPage('gestionar-jugadores');
        break;
      case 'gestionar-sedes':
        setCurrentPage('gestionar-sedes');
        break;
      case 'gestionar-categorias':
        setCurrentPage('gestionar-categorias');
        break;
      case 'estadisticas':
        setCurrentPage('estadisticas');
        break;
      case 'mis-partidos':
        setCurrentPage('mis-partidos');
        break;
      case 'historial-inscripciones':
        setCurrentPage('historial-inscripciones');
        break;
      default:
        setCurrentPage('ver-partidos');
    }
  };

  const handleViewPartidoDetails = (id: number) => {
    setSelectedPartidoId(id);
    setCurrentPage('partido-detail');
  };

  const handleBackToMenu = () => {
    setCurrentPage('ver-partidos');
    setSelectedPartidoId(null);
    setEditingPartidoId(null);
  };

  const showNavigation = currentPage !== 'menu';
  const showSidebar = currentPage !== 'menu';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      {showSidebar && (
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          partidosGuardadosCount={partidosGuardadosCount}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          usuarioId={usuarioId}
          onNavigateToPartido={handleViewPartidoDetails}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${showSidebar ? 'md:ml-0' : ''}`}>
        <main className={`flex-1 ${showNavigation ? 'pb-16 md:pb-0' : ''}`}>
          {currentPage === 'menu' && (
            <MenuPrincipalPage
              onSelectOption={handleMenuSelect}
              onExit={() => {
                toast.info('Sesión cerrada');
                setCurrentPage('ver-partidos');
              }}
            />
          )}

          {currentPage === 'ver-partidos' && (
            <VerPartidosPage
              onBack={handleBackToMenu}
              onCreatePartido={() => setCurrentPage('crear-partido')}
              onViewPartidoDetails={handleViewPartidoDetails}
              usuarioId={usuarioId}
            />
          )}

          {currentPage === 'crear-partido' && (
            <CreatePartidoPage
              onBack={() => setCurrentPage('ver-partidos')}
              onPartidoCreated={() => {
                setCurrentPage('ver-partidos');
                toast.success('Partido creado exitosamente');
              }}
            />
          )}

          {currentPage === 'editar-partido' && editingPartidoId && (
            <EditPartidoPage
              partidoId={editingPartidoId}
              onBack={() => setCurrentPage('ver-partidos')}
              onPartidoUpdated={() => {
                setCurrentPage('ver-partidos');
                setEditingPartidoId(null);
                toast.success('Partido actualizado exitosamente');
              }}
            />
          )}

          {currentPage === 'gestionar-jugadores' && (
            <GestionarJugadoresPage />
          )}

          {currentPage === 'gestionar-sedes' && (
            <GestionarSedesPage />
          )}

          {currentPage === 'gestionar-categorias' && (
            <GestionarCategoriasPage />
          )}

          {currentPage === 'estadisticas' && (
            <EstadisticasPage />
          )}

          {currentPage === 'mis-partidos' && (
            <MisPartidosPage
              onBack={handleBackToMenu}
              usuarioId={usuarioId}
              onViewPartidoDetails={handleViewPartidoDetails}
            />
          )}

          {currentPage === 'historial-inscripciones' && (
            <HistorialInscripcionesPage
              onBack={handleBackToMenu}
              usuarioId={usuarioId}
            />
          )}

          {currentPage === 'partido-detail' && selectedPartidoId && (
            <PartidoDetailPage
              partidoId={selectedPartidoId}
              onBack={() => setCurrentPage('ver-partidos')}
              onPartidoUpdated={() => {
                toast.success('Partido actualizado');
              }}
            />
          )}
        </main>

        {/* Bottom Navigation - Mobile */}
        {showNavigation && (
          <Navigation
            currentPage={currentPage}
            onNavigate={handleNavigate}
            partidosGuardadosCount={partidosGuardadosCount}
          />
        )}
      </div>

      <ToastContainer
        toasts={toasts}
        onRemove={(id) => toast.remove(id)}
      />
    </div>
  );
}

export default App;
