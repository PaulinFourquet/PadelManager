import { Lock, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { PageHeader } from '@/ui/components/PageHeader';
import { TournamentCard } from '@/ui/components/TournamentCard';

export const CalendarPage = () => {
  const career = useGameStore((state) => state.career);
  const startTournamentMatch = useGameStore((state) => state.startTournamentMatch);
  const setView = useGameStore((state) => state.setView);
  const tournaments = useGameStore((state) => state.tournaments);
  const canPlay = Boolean(career.playerId && career.partnerId);

  if (!canPlay) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader eyebrow="Carriere" title="Calendrier verrouille" />
        <Card className="flex flex-col items-start gap-4 p-8 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Choisis d'abord ton joueur et ton partenaire.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Le calendrier des tournois s'ouvre une fois la paire formee.
            </p>
          </div>
          <Button onClick={() => setView('playerSelect')}>Aller a la selection</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow={`Saison ${career.season}`}
        title="Calendrier"
        description="Lance un match dans le tournoi de ton choix. Chaque tournoi rapporte points et dotation selon le resultat."
      />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{tournaments.length} tournois programmes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              action={
                <Button onClick={() => startTournamentMatch(tournament.id)} className="gap-1.5">
                  <PlayCircle className="h-4 w-4" />
                  Ouvrir le match
                </Button>
              }
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
