import { Badge } from './ui/Badge';

interface CategoriaBadgeProps {
  categoria?: {
    nombre: string;
    icono?: string;
    color?: string;
  };
  size?: 'sm' | 'md';
}

export const CategoriaBadge = ({ categoria, size = 'sm' }: CategoriaBadgeProps) => {
  if (!categoria) return null;

  const badgeStyle = categoria.color
    ? {
        backgroundColor: `${categoria.color}15`,
        color: categoria.color,
        borderColor: categoria.color,
      }
    : {};

  return (
    <Badge
      variant="info"
      size={size as 'sm' | 'md'}
      style={badgeStyle}
      className="flex items-center gap-1"
    >
      {categoria.icono && <span>{categoria.icono}</span>}
      <span>{categoria.nombre}</span>
    </Badge>
  );
};

