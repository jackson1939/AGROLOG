import { Badge } from '@/components/ui/Badge';

const tipoVariant: Record<string, 'campo' | 'alerta' | 'critico' | 'default'> = {
  ENFERMEDAD: 'alerta',
  PLAGA: 'critico',
  DEFICIENCIA: 'default',
  FISIOLOGICO: 'default',
  NORMAL: 'campo',
};

interface EnfermedadBadgeProps {
  tipo: string;
  label?: string;
}

export function EnfermedadBadge({ tipo, label }: EnfermedadBadgeProps) {
  return (
    <Badge variant={tipoVariant[tipo] ?? 'default'}>
      {label ?? tipo}
    </Badge>
  );
}
