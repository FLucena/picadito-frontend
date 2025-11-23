import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  icon?: ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
}

export const FloatingActionButton = ({
  children,
  icon,
  label,
  position = 'bottom-right',
  className = '',
  size = 'md',
  ...props
}: FloatingActionButtonProps) => {
  const positionStyles = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const sizeStyles = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  };

  const iconSizeStyles = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  return (
    <button
      className={`fixed ${positionStyles[position]} ${sizeStyles[size]} bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-primary-700 active:scale-95 transition-all duration-200 flex items-center justify-center z-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
      aria-label={label}
      {...props}
    >
      {icon ? <span className={iconSizeStyles[size]}>{icon}</span> : children}
    </button>
  );
};

