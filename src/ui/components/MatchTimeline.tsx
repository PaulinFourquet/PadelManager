import { ArrowDown, ArrowUp, CornerRightDown, Flame, Layers, Repeat, ShieldQuestion, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { MatchLogEntry, ShotType } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type MatchTimelineProps = {
  entries: MatchLogEntry[];
  className?: string;
};

const shotIcons: Record<ShotType, LucideIcon> = {
  serve: Zap,
  smash: Flame,
  vibora: Repeat,
  bandeja: Layers,
  volley: ArrowDown,
  lob: ArrowUp,
  wallExit: CornerRightDown,
};

const shotLabels: Record<ShotType, string> = {
  serve: 'Service',
  smash: 'Smash',
  vibora: 'Vibora',
  bandeja: 'Bandeja',
  volley: 'Volee',
  lob: 'Lob',
  wallExit: 'Sortie de mur',
};

const teamColor = (team: 'A' | 'B') => (team === 'A' ? 'text-team-a' : 'text-team-b');

export const MatchTimeline = ({ entries, className }: MatchTimelineProps) => {
  const ordered = entries.slice().reverse();

  if (ordered.length === 0) {
    return (
      <div className={cn('flex items-center gap-2 rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground', className)}>
        <ShieldQuestion className="h-4 w-4" />
        Aucun point joue pour le moment.
      </div>
    );
  }

  return (
    <ScrollArea className={cn('h-full pr-2', className)}>
      <ol className="space-y-2">
        {ordered.map((entry) => {
          const lastEvent = entry.rally.events.at(-1);
          const Icon = lastEvent ? shotIcons[lastEvent.shot] : Zap;
          const shotLabel = lastEvent ? shotLabels[lastEvent.shot] : '';
          return (
            <li key={entry.pointNumber} className="rounded-md border border-border bg-card/60 p-2.5 transition hover:bg-card">
              <div className="flex items-baseline gap-2">
                <span className="rounded bg-background/40 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                  #{entry.pointNumber}
                </span>
                <span className={cn('flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider', teamColor(entry.winner))}>
                  <Icon className="h-3 w-3" />
                  {shotLabel || 'Point'}
                </span>
                <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">{entry.scoreLabel}</span>
              </div>
              <p className="mt-1.5 text-sm text-foreground">{entry.rally.log}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Proba serveur {(entry.rally.winProbabilityForServer * 100).toFixed(1)}%
              </p>
            </li>
          );
        })}
      </ol>
    </ScrollArea>
  );
};
