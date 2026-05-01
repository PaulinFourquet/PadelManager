import { Circle } from 'lucide-react';
import type { MatchState, PointScore } from '@/types';
import { cn } from '@/lib/utils';

type ScorePanelProps = {
  matchState: MatchState;
};

const formatPoint = (point: PointScore) => (typeof point === 'number' ? String(point) : 'AD');

export const ScorePanel = ({ matchState }: ScorePanelProps) => {
  const { teams, score, server } = matchState;
  const sets = score.completedSets;
  const currentSet = { A: score.games.A, B: score.games.B };

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card shadow-card">
      <div className="grid grid-cols-[1fr_repeat(4,minmax(40px,52px))_minmax(56px,72px)] gap-x-1 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Equipe</span>
        {sets.map((_, index) => (
          <span key={index} className="text-center">
            S{index + 1}
          </span>
        ))}
        {Array.from({ length: 3 - sets.length }).map((_, index) => (
          <span key={`empty-${index}`} className="text-center opacity-40">
            S{sets.length + index + 1}
          </span>
        ))}
        <span className="text-center text-foreground">Pts</span>
      </div>

      <div className="divide-y divide-border">
        {(['A', 'B'] as const).map((side) => {
          const isServer = server === side;
          const accent = side === 'A' ? 'text-team-a' : 'text-team-b';
          return (
            <div
              key={side}
              className={cn(
                'grid grid-cols-[1fr_repeat(4,minmax(40px,52px))_minmax(56px,72px)] items-center gap-x-1 px-3 py-2.5 transition',
                isServer && 'bg-card/60',
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <Circle
                  className={cn('h-2 w-2 shrink-0 fill-current', isServer ? accent : 'text-muted-foreground/30')}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{teams[side].name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {teams[side].players.map((player) => player.name.split(' ').at(-1)).join(' / ')}
                  </p>
                </div>
              </div>

              {sets.map((set, index) => {
                const won = set[side] > set[side === 'A' ? 'B' : 'A'];
                return (
                  <span
                    key={index}
                    className={cn(
                      'text-center text-sm tabular-nums font-semibold',
                      won ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {set[side]}
                  </span>
                );
              })}

              <span className="text-center text-base font-semibold tabular-nums text-foreground">
                {currentSet[side]}
              </span>

              {Array.from({ length: 3 - sets.length - 1 }).map((_, index) => (
                <span key={`empty-${side}-${index}`} className="text-center text-muted-foreground/40">
                  -
                </span>
              ))}

              <span
                className={cn(
                  'rounded-md px-2 py-1 text-center text-xl font-semibold tabular-nums shadow-sm',
                  isServer ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'bg-background/40 text-foreground',
                )}
              >
                {score.tieBreak ? score.tieBreak.points[side] : formatPoint(score.points[side])}
              </span>
            </div>
          );
        })}
      </div>

      {score.matchWinner ? (
        <div className="bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
          {teams[score.matchWinner].name} remporte le match
        </div>
      ) : null}
    </div>
  );
};
