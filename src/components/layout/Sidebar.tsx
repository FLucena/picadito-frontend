import { } from 'react';
import { 
  Calendar, 
  Plus, 
  CalendarCheck, 
  History, 
  User,
  MapPin,
  Menu,
  X
} from 'lucide-react';
import type { Page } from '../../App';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  partidosGuardadosCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  group?: string;
}

export const Sidebar = ({ 
  currentPage, 
  onNavigate, 
  partidosGuardadosCount = 0,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps) => {
  const navItems: NavItem[] = [
    { id: 'ver-partidos', label: 'Ver Partidos', icon: Calendar, group: 'main' },
    { id: 'crear-partido', label: 'Crear Partido', icon: Plus, group: 'main' },
    { id: 'mis-partidos', label: 'Mis Partidos', icon: CalendarCheck, badge: partidosGuardadosCount, group: 'main' },
    { id: 'historial-inscripciones', label: 'Historial', icon: History, group: 'secondary' },
    { id: 'gestionar-jugadores', label: 'Jugadores', icon: User, group: 'secondary' },
    { id: 'gestionar-sedes', label: 'Sedes', icon: MapPin, group: 'secondary' },
  ];

  const isActive = (pageId: Page) => {
    if (pageId === 'ver-partidos') {
      return currentPage === 'ver-partidos' || currentPage === 'partido-detail';
    }
    return currentPage === pageId;
  };

  const mainItems = navItems.filter(item => item.group === 'main');
  const secondaryItems = navItems.filter(item => item.group === 'secondary');

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">Picadito</h2>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="ml-auto"
            aria-label={isCollapsed ? 'Expandir' : 'Colapsar'}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Main Items */}
        <div className="space-y-1 mb-6">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                  active
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-primary-600' : ''}`} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="error" size="sm">
                        {item.badge > 9 ? '9+' : item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Items */}
        {!isCollapsed && (
          <div className="pt-4 border-t border-gray-200">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Más opciones
            </p>
            <div className="space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.id);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                      active
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-primary-600' : ''}`} />
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};

