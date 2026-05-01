import { Check, Hand } from 'lucide-react';
import type { Player } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlayerAvatar } from '@/ui/components/PlayerAvatar';
import { StatRadar } from '@/ui/components/StatRadar';
import { statAverage } from '@/ui/lib/playerStats';

type PlayerCardProps = {
  player: Player;
  selected: boolean;
  onSelect: () => void;
  actionLabel: string;
  variant?: 'team-a' | 'team-b' | 'neutral';
};

const sideLabels: Record<Player['preferredSide'], string> = {
  drive: 'Drive',
  revers: 'Revers',
};

const styleLabels: Record<Player['naturalStyle'], string> = {
  offensive: 'Offensif',
  defensive: 'Defensif',
  balanced: 'Equilibre',
  counter: 'Contre',
};

export const PlayerCard = ({ player, selected, onSelect, actionLabel, variant = 'neutral' }: PlayerCardProps) => {
  const average = statAverage(player);
  const attack = Math.round((player.stats.attack.smash + player.stats.attack.volleyAttack) / 2);
  const defense = Math.round((player.stats.defense.lob + player.stats.defense.recovery) / 2);

  return (
    <Card
      className={cn(
        'group relative flex flex-col overflow-hidden p-4 shadow-card transition hover:border-primary/40 hover:shadow-card-hover',
        selected && 'border-primary/70 ring-1 ring-primary/40',
      )}
    >
      {selected ? (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </div>
      ) : null}

      <div className="flex items-start gap-3">
        <PlayerAvatar player={player} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-foreground">{player.name}</h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              #{player.ranking}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {player.nationality} - {player.age} ans - {player.heightCm} cm
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[10px] font-semibold">
              <Hand className="h-2.5 w-2.5" />
              {sideLabels[player.preferredSide]}
            </Badge>
            <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-semibold">
              {styleLabels[player.naturalStyle]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_88px] items-center gap-3">
        <div className="grid grid-cols-3 gap-2">
          <Metric label="GEN" value={average} highlight />
          <Metric label="ATQ" value={attack} />
          <Metric label="DEF" value={defense} />
        </div>
        <StatRadar player={player} variant={variant} size={88} showLabels={false} className="h-22 w-22" />
      </div>

      <Button
        type="button"
        onClick={onSelect}
        variant={selected ? 'secondary' : 'default'}
        className="mt-4 w-full"
      >
        {selected ? 'Selectionne' : actionLabel}
      </Button>
    </Card>
  );
};

const Metric = ({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) => (
  <div
    className={cn(
      'rounded-md border px-2 py-1.5 text-center',
      highlight ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-background/40 text-foreground',
    )}
  >
    <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
    <p className="text-lg font-semibold tabular-nums">{value}</p>
  </div>
);
