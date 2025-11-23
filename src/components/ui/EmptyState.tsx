import { Button } from './Button';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon, title, description, action, secondaryAction }: EmptyStateProps) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action && (
          <Button
            variant={action.variant || 'primary'}
            onClick={action.onClick}
            className="flex items-center gap-2"
          >
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            variant="outline"
            onClick={secondaryAction.onClick}
            className="flex items-center gap-2"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
};

