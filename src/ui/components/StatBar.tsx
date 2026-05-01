import { cn } from '@/lib/utils';

type StatBarProps = {
  label?: string;
  value: number;
  max?: number;
  variant?: 'primary' | 'team-a' | 'team-b' | 'accent';
  showValue?: boolean;
  className?: string;
};

const variantTokens: Record<NonNullable<StatBarProps['variant']>, string> = {
  primary: 'bg-primary',
  'team-a': 'bg-team-a',
  'team-b': 'bg-team-b',
  accent: 'bg-accent',
};

export const StatBar = ({ label, value, max = 100, variant = 'primary', showValue = true, className }: StatBarProps) => {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label ? <span className="font-medium text-muted-foreground">{label}</span> : <span />}
          {showValue ? <span className="tabular-nums font-semibold text-foreground">{Math.round(value)}</span> : null}
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-500', variantTokens[variant])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
