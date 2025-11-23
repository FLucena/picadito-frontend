import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card = ({ 
  children, 
  className = '', 
  onClick,
  variant = 'default'
}: CardProps) => {
  const baseStyles = 'bg-white rounded-xl';
  
  const variantStyles = {
    default: 'border border-gray-100 shadow-sm',
    elevated: 'shadow-md',
    outlined: 'border border-gray-200',
  };

  const paddingStyles = 'px-5 py-6';
  const interactiveStyles = onClick 
    ? 'cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0' 
    : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles} ${interactiveStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

