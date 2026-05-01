import { useGameStore } from '@/store/gameStore';
import { money } from '@/ui/lib/format';

export const CareerStatusPanel = () => {
  const career = useGameStore((state) => state.career);
  const players = useGameStore((state) => state.players);
  const player = players.find((candidate) => candidate.id === career.playerId);
  const partner = players.find((candidate) => candidate.id === career.partnerId);

  return (
    <div className="space-y-3 rounded-md border border-border bg-background/40 p-3 text-xs">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Profil</p>
      <div className="space-y-1.5">
        <StatusRow label="Saison" value={`${career.season} | J${career.currentDay}`} />
        <StatusRow label="Points" value={String(career.rankingPoints)} />
        <StatusRow label="Budget" value={money(career.money)} />
      </div>
      <div className="space-y-1 border-t border-border pt-3">
        <p className="truncate text-sm font-semibold text-foreground">
          {player?.name ?? 'Joueur a choisir'}
        </p>
        <p className="truncate text-muted-foreground">
          + {partner?.name ?? 'partenaire a choisir'}
        </p>
      </div>
      {career.injury ? (
        <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-destructive">
          <p className="font-semibold">{career.injury.label}</p>
          <p className="mt-0.5 text-[11px] opacity-80">{career.injury.remainingDays} jours restants</p>
        </div>
      ) : null}
    </div>
  );
};

const StatusRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="tabular-nums font-semibold text-foreground">{value}</span>
  </div>
);
