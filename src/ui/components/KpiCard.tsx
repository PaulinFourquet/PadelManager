import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

type KpiCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
};

const trendTokens: Record<NonNullable<KpiCardProps['trend']>, string> = {
  up: 'text-primary',
  down: 'text-destructive',
  neutral: 'text-muted-foreground',
};

export const KpiCard = ({ label, value, hint, icon, trend, className }: KpiCardProps) => (
  <Card className={cn('flex flex-col gap-2 p-4 shadow-card', className)}>
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {icon ? <span className="text-muted-foreground">{icon}</span> : null}
    </div>
    <div className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{value}</div>
    {hint ? (
      <div className={cn('text-xs', trend ? trendTokens[trend] : 'text-muted-foreground')}>{hint}</div>
    ) : null}
  </Card>
);
