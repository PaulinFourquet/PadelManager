import type { Player } from '@/types';
import { cn } from '@/lib/utils';
import { statFamilies } from '@/ui/lib/playerStats';

type StatRadarProps = {
  player: Player;
  size?: number;
  variant?: 'team-a' | 'team-b' | 'neutral';
  className?: string;
  showLabels?: boolean;
};

const familyLabels: Record<(typeof statFamilies)[number], string> = {
  attack: 'ATQ',
  defense: 'DEF',
  technique: 'TEC',
  physical: 'PHY',
  mental: 'MEN',
  tactical: 'TAC',
};

const variantTokens: Record<NonNullable<StatRadarProps['variant']>, { stroke: string; fill: string; glow: string }> = {
  'team-a': { stroke: 'hsl(var(--team-a))', fill: 'hsl(var(--team-a) / 0.22)', glow: 'hsl(var(--team-a) / 0.6)' },
  'team-b': { stroke: 'hsl(var(--team-b))', fill: 'hsl(var(--team-b) / 0.22)', glow: 'hsl(var(--team-b) / 0.6)' },
  neutral: { stroke: 'hsl(var(--primary))', fill: 'hsl(var(--primary) / 0.22)', glow: 'hsl(var(--primary) / 0.6)' },
};

export const StatRadar = ({ player, size = 220, variant = 'neutral', className, showLabels = true }: StatRadarProps) => {
  const center = size / 2;
  const maxRadius = size * 0.4;
  const labelRadius = maxRadius * 1.18;
  const tokens = variantTokens[variant];

  const values = statFamilies.map((family) => {
    const stats = Object.values(player.stats[family]);
    return stats.reduce((sum, value) => sum + value, 0) / stats.length;
  });

  const polygonPoints = values
    .map((value, index) => {
      const angle = -Math.PI / 2 + (index / values.length) * Math.PI * 2;
      const radius = (value / 100) * maxRadius;
      return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn('h-full w-full animate-fade-in', className)}
      role="img"
      aria-label={`Radar des stats de ${player.name}`}
    >
      {[0.25, 0.5, 0.75, 1].map((scale) => {
        const r = maxRadius * scale;
        const points = statFamilies
          .map((_, index) => {
            const angle = -Math.PI / 2 + (index / statFamilies.length) * Math.PI * 2;
            return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
          })
          .join(' ');
        return (
          <polygon
            key={scale}
            points={points}
            fill="none"
            stroke="hsl(var(--border))"
            strokeOpacity={scale === 1 ? 0.6 : 0.25}
            strokeWidth={1}
          />
        );
      })}

      {statFamilies.map((family, index) => {
        const angle = -Math.PI / 2 + (index / statFamilies.length) * Math.PI * 2;
        const x1 = center;
        const y1 = center;
        const x2 = center + Math.cos(angle) * maxRadius;
        const y2 = center + Math.sin(angle) * maxRadius;
        const labelX = center + Math.cos(angle) * labelRadius;
        const labelY = center + Math.sin(angle) * labelRadius;
        return (
          <g key={family}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--border))" strokeOpacity={0.25} />
            {showLabels ? (
              <text
                x={labelX}
                y={labelY}
                fontSize={10}
                fontWeight={700}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--muted-foreground))"
                style={{ letterSpacing: '0.08em' }}
              >
                {familyLabels[family]}
              </text>
            ) : null}
          </g>
        );
      })}

      <polygon
        points={polygonPoints}
        fill={tokens.fill}
        stroke={tokens.stroke}
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 6px ${tokens.glow})` }}
      />

      {values.map((value, index) => {
        const angle = -Math.PI / 2 + (index / values.length) * Math.PI * 2;
        const radius = (value / 100) * maxRadius;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        return <circle key={index} cx={x} cy={y} r={3} fill={tokens.stroke} />;
      })}
    </svg>
  );
};
