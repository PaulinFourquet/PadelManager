import type { ReactNode } from 'react';
import { CalendarDays, Coins, Trophy, Users } from 'lucide-react';
import type { Tournament, TournamentCategory } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/gameStore';
import { money } from '@/ui/lib/format';

type TournamentCardProps = {
  tournament: Tournament;
  compact?: boolean;
  action?: ReactNode;
  className?: string;
};

const categoryStyles: Record<TournamentCategory, string> = {
  'FIP Bronze': 'border-amber-700/50 bg-amber-700/10 text-amber-300',
  'FIP Silver': 'border-slate-400/50 bg-slate-400/10 text-slate-200',
  'FIP Gold': 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300',
  Challenger: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
  P2: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
  P1: 'border-violet-500/50 bg-violet-500/10 text-violet-300',
  'Premier Padel': 'border-primary/60 bg-primary/15 text-primary',
};

export const TournamentCard = ({ tournament, compact = false, action, className }: TournamentCardProps) => {
  const players = useGameStore((state) => state.players);
  const opponents = tournament.opponentPlayerIds
    .map((id) => players.find((player) => player.id === id)?.name ?? id)
    .join(' / ');

  return (
    <article
      className={cn(
        'rounded-md border border-border bg-card/60 p-4 transition hover:border-primary/40',
        compact ? 'text-sm' : 'text-sm',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Trophy className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground">{tournament.name}</h3>
        <Badge variant="outline" className={cn('border', categoryStyles[tournament.category])}>
          {tournament.category}
        </Badge>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Jour {tournament.startDay} - {tournament.surface}
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {tournament.participantPairs} paires
        </div>
        <div className="flex items-center gap-1.5">
          <Coins className="h-3.5 w-3.5" />
          {money(tournament.prizeMoney)}
        </div>
        <div className="flex items-center gap-1.5 text-foreground/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Adv.</span>
          <span className="truncate">{opponents}</span>
        </div>
      </div>

      {action ? <div className="mt-4 flex justify-end">{action}</div> : null}
    </article>
  );
};
