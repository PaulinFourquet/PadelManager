import { ArrowRight, CalendarDays, Coins, Medal, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore, type CareerView } from '@/store/gameStore';
import { TournamentCard } from '@/ui/components/TournamentCard';
import { KpiCard } from '@/ui/components/KpiCard';
import { PageHeader } from '@/ui/components/PageHeader';
import { PlayerAvatar } from '@/ui/components/PlayerAvatar';
import { money } from '@/ui/lib/format';
import { statAverage } from '@/ui/lib/playerStats';

export const HomePage = () => {
  const setView = useGameStore((state) => state.setView);
  const career = useGameStore((state) => state.career);
  const tournaments = useGameStore((state) => state.tournaments);
  const players = useGameStore((state) => state.players);
  const player = players.find((candidate) => candidate.id === career.playerId);
  const partner = players.find((candidate) => candidate.id === career.partnerId);
  const nextView: CareerView = career.playerId ? (career.partnerId ? 'calendar' : 'partnerSelect') : 'playerSelect';
  const nextTournaments = tournaments.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow={`Saison ${career.season} · Jour ${career.currentDay}`}
        title="Tableau de bord"
        description="Construis ta paire, programme tes tournois et fais grimper ton ranking. La carriere s'ecrit point apres point."
        actions={
          <Button onClick={() => setView(nextView)} className="gap-2">
            Continuer la carriere
            <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Ranking" value={player ? `#${player.ranking}` : '--'} hint="Position au classement" icon={<Medal className="h-4 w-4" />} />
        <KpiCard
          label="Points"
          value={career.rankingPoints.toLocaleString('fr-FR')}
          hint="Points cumules sur la saison"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
        />
        <KpiCard label="Budget" value={money(career.money)} hint="Tresorerie disponible" icon={<Coins className="h-4 w-4" />} />
        <KpiCard
          label="Prochain tournoi"
          value={tournaments[0] ? `J${tournaments[0].startDay}` : '--'}
          hint={tournaments[0]?.name ?? 'Aucun tournoi programme'}
          icon={<CalendarDays className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Ta paire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <PairSlot
                role="Joueur principal"
                player={player}
                onSelect={() => setView('playerSelect')}
              />
              <PairSlot
                role="Partenaire"
                player={partner}
                onSelect={() => setView('partnerSelect')}
                disabled={!career.playerId}
              />
            </div>
            {player && partner ? (
              <div className="rounded-md border border-border bg-background/40 p-4 text-sm">
                <p className="font-semibold text-foreground">
                  Paire {player.name.split(' ').at(-1)} / {partner.name.split(' ').at(-1)}
                </p>
                <p className="mt-1 text-muted-foreground">
                  Moyenne combinee {Math.round((statAverage(player) + statAverage(partner)) / 2)} - prete pour le calendrier.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Compose ta paire pour debloquer le calendrier des tournois.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Prochains tournois</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setView('calendar')}>
              Voir tout
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} compact />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

type PairSlotProps = {
  role: string;
  player: ReturnType<typeof useGameStore.getState>['players'][number] | undefined;
  onSelect: () => void;
  disabled?: boolean;
};

const PairSlot = ({ role, player, onSelect, disabled }: PairSlotProps) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={disabled}
    className="group flex flex-col gap-3 rounded-md border border-border bg-background/40 p-4 text-left transition hover:border-primary/40 hover:bg-background/60 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{role}</span>
    {player ? (
      <div className="flex items-center gap-3">
        <PlayerAvatar player={player} size={48} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{player.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {player.nationality} - moy. {statAverage(player)}
          </p>
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">A choisir</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    )}
  </button>
);
