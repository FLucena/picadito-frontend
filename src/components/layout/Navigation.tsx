import { Calendar, Plus, CalendarCheck } from 'lucide-react';
import type { Page } from '../../App';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  partidosGuardadosCount?: number;
}

interface NavItem {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Navigation = ({ currentPage, onNavigate, partidosGuardadosCount = 0 }: NavigationProps) => {
  const navItems: NavItem[] = [
    { id: 'ver-partidos', label: 'Partidos', icon: Calendar },
    { id: 'crear-partido', label: 'Crear', icon: Plus },
    { id: 'mis-partidos', label: 'Mis Partidos', icon: CalendarCheck, badge: partidosGuardadosCount },
  ];

  const isActive = (pageId: Page) => {
    if (pageId === 'ver-partidos') {
      return currentPage === 'ver-partidos' || currentPage === 'partido-detail';
    }
    return currentPage === pageId;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative ${
                active
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-0.5 font-medium transition-all duration-200 ${active ? 'scale-105' : ''}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

