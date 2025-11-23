import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onHome?: () => void;
}

export const Breadcrumbs = ({ items, onHome }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
      {onHome && (
        <>
          <button
            onClick={onHome}
            className="flex items-center hover:text-gray-900 transition-colors"
            aria-label="Inicio"
          >
            <Home className="h-4 w-4" />
          </button>
          {items.length > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
        </>
      )}
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-gray-900 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
          {index < items.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />}
        </div>
      ))}
    </nav>
  );
};

