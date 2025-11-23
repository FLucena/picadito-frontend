import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface BadgeProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
  ...props
}: BadgeProps) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  
  const variantStyles = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
    info: 'bg-primary-100 text-primary-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const Component = onClick ? 'button' : 'span';
  const interactiveStyles = onClick ? 'cursor-pointer transition-colors' : '';

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${interactiveStyles} ${className}`}
      onClick={onClick}
      {...(onClick ? props : {})}
    >
      {children}
    </Component>
  );
};

