import { cn } from '@/lib/utils';

type ProbabilityGaugeProps = {
  teamAProbability: number;
  teamALabel: string;
  teamBLabel: string;
  className?: string;
};

export const ProbabilityGauge = ({ teamAProbability, teamALabel, teamBLabel, className }: ProbabilityGaugeProps) => {
  const teamPercent = Math.max(0, Math.min(1, teamAProbability));
  const teamBPercent = 1 - teamPercent;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-semibold text-team-a">{teamALabel}</span>
        <span className="font-semibold text-team-b">{teamBLabel}</span>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-team-a/80 to-team-a transition-all duration-500"
          style={{ width: `${teamPercent * 100}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-gradient-to-l from-team-b/80 to-team-b transition-all duration-500"
          style={{ width: `${teamBPercent * 100}%` }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-background"
          style={{ left: `${teamPercent * 100}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      <div className="flex items-baseline justify-between text-xs tabular-nums">
        <span className="font-semibold text-foreground">{(teamPercent * 100).toFixed(1)}%</span>
        <span className="font-semibold text-foreground">{(teamBPercent * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
};
