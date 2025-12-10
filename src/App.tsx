import { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { ToastContainer } from './components/ui/Toast';
import { Navigation } from './components/layout/Navigation';
import { Sidebar } from './components/layout/Sidebar';
import { usePartidosGuardados } from './hooks/usePartidosGuardados';
import { useInactivity } from './hooks/useInactivity';
import { toast } from './utils/toast';
import { isTokenValid } from './utils/tokenUtils';
import { getToken, clearAuthData, cleanupExpiredTokens, getUserEmail, getUserNombre, getUserRol } from './utils/storage';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const MenuPrincipalPage = lazy(() => import('./pages/MenuPrincipalPage').then(m => ({ default: m.MenuPrincipalPage })));
const VerPartidosPage = lazy(() => import('./pages/VerPartidosPage').then(m => ({ default: m.VerPartidosPage })));
const CreatePartidoPage = lazy(() => import('./pages/CreatePartidoPage').then(m => ({ default: m.CreatePartidoPage })));
const EditPartidoPage = lazy(() => import('./pages/EditPartidoPage').then(m => ({ default: m.EditPartidoPage })));
const GestionarJugadoresPage = lazy(() => import('./pages/GestionarJugadoresPage').then(m => ({ default: m.GestionarJugadoresPage })));
const GestionarSedesPage = lazy(() => import('./pages/GestionarSedesPage').then(m => ({ default: m.GestionarSedesPage })));
const GestionarCategoriasPage = lazy(() => import('./pages/GestionarCategoriasPage').then(m => ({ default: m.GestionarCategoriasPage })));
const EstadisticasPage = lazy(() => import('./pages/EstadisticasPage').then(m => ({ default: m.EstadisticasPage })));
const MisPartidosPage = lazy(() => import('./pages/MisPartidosPage').then(m => ({ default: m.MisPartidosPage })));
const HistorialInscripcionesPage = lazy(() => import('./pages/HistorialInscripcionesPage').then(m => ({ default: m.HistorialInscripcionesPage })));
const PartidoDetailPage = lazy(() => import('./pages/PartidoDetailPage').then(m => ({ default: m.PartidoDetailPage })));
const TestEndpointsPage = lazy(() => import('./pages/TestEndpointsPage').then(m => ({ default: m.TestEndpointsPage })));

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
  | 'partido-detail'
  | 'test-endpoints';

interface UserData {
  email: string;
  nombre: string;
  rol: string;
  usuarioId?: number;
}

function App() {
  // Cleanup expired tokens on mount
  cleanupExpiredTokens();
  
  // Check if user is authenticated - validate token exists and is not expired
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = getToken();
    return isTokenValid(token);
  });
  
  // Estado para mostrar login o registro
  const [showRegister, setShowRegister] = useState(false);

  const [currentPage, setCurrentPage] = useState<Page>('ver-partidos');
  const [selectedPartidoId, setSelectedPartidoId] = useState<number | null>(null);
  const [editingPartidoId, setEditingPartidoId] = useState<number | null>(null);
  const [usuarioId] = useState<number>(1); // TODO: Get from user data or token
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

  // Validate token on mount and periodically
  useEffect(() => {
    const validateToken = () => {
      const token = getToken();
      if (!isTokenValid(token)) {
        // Token is invalid or expired - clear auth state
        clearAuthData();
        setIsAuthenticated(false);
      } else {
        // Cleanup expired tokens periodically
        cleanupExpiredTokens();
      }
    };

    // Validate immediately
    validateToken();

    // Validate every 5 minutes
    const interval = setInterval(validateToken, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (_userData: UserData) => {
    setIsAuthenticated(true);
    setCurrentPage('ver-partidos');
    setShowRegister(false);
  };

  const handleRegisterSuccess = (_userData: UserData) => {
    setIsAuthenticated(true);
    setCurrentPage('ver-partidos');
    setShowRegister(false);
  };

  const handleLogout = useCallback(() => {
    clearAuthData();
    setIsAuthenticated(false);
    setCurrentPage('ver-partidos');
    toast.info('Sesión cerrada');
  }, []);

  // Auto-logout after 30 minutes of inactivity (only when authenticated)
  useInactivity(
    30 * 60 * 1000, // 30 minutes
    useCallback(() => {
      if (isAuthenticated) {
        handleLogout();
        toast.info('Sesión cerrada por inactividad');
      }
    }, [isAuthenticated, handleLogout])
  );

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

  // Show login or register page if not authenticated
  if (!isAuthenticated) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        {showRegister ? (
          <RegisterPage 
            onRegisterSuccess={handleRegisterSuccess}
            onBackToLogin={() => setShowRegister(false)}
          />
        ) : (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onShowRegister={() => setShowRegister(true)}
          />
        )}
      </Suspense>
    );
  }

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
          onLogout={handleLogout}
          userEmail={getUserEmail() || undefined}
          userNombre={getUserNombre() || undefined}
          userRol={getUserRol() || undefined}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${showSidebar ? 'md:ml-0' : ''}`}>
        <main className={`flex-1 ${showNavigation ? 'pb-16 md:pb-0' : ''}`}>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
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

            {currentPage === 'test-endpoints' && (
              <TestEndpointsPage />
            )}
          </Suspense>
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
