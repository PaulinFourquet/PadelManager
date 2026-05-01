import { ArrowLeft, BarChart3, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGameStore } from '@/store/gameStore';
import { PageHeader } from '@/ui/components/PageHeader';

export const ResultPage = () => {
  const summary = useGameStore((state) => state.lastCareerMatch);
  const setView = useGameStore((state) => state.setView);
  const tournaments = useGameStore((state) => state.tournaments);

  if (!summary) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader eyebrow="Replay" title="Aucun resultat" />
        <Card className="p-8 shadow-card">
          <p className="text-foreground">Lance un match depuis le calendrier pour afficher le replay.</p>
          <Button className="mt-4" onClick={() => setView('calendar')}>
            Ouvrir le calendrier
          </Button>
        </Card>
      </div>
    );
  }

  const tournament = tournaments.find((candidate) => candidate.id === summary.tournamentId);
  const winnerSide = summary.result.winner;
  const winnerName = winnerSide === 'A' ? summary.playerTeamName : summary.opponentTeamName;
  const playerWon = winnerSide === 'A';
  const setsLine = summary.result.finalScore.completedSets.map((set) => `${set.A}-${set.B}`).join(' · ');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow={tournament?.name ?? 'Tournoi'}
        title={`${winnerName} gagne le match`}
        description={`${summary.playerTeamName} affrontait ${summary.opponentTeamName}.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setView('calendar')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Calendrier
            </Button>
            <Button variant="outline" onClick={() => setView('progression')} className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Progression
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className={playerWon ? 'h-5 w-5 text-accent' : 'h-5 w-5 text-muted-foreground'} />
              Score final
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-border bg-background/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sets</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums text-foreground">
                {summary.result.finalScore.sets.A}
                <span className="mx-3 text-muted-foreground">-</span>
                {summary.result.finalScore.sets.B}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{setsLine}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <TeamLine
                name={summary.playerTeamName}
                isWinner={playerWon}
                accent="team-a"
                sets={summary.result.finalScore.sets.A}
              />
              <TeamLine
                name={summary.opponentTeamName}
                isWinner={!playerWon}
                accent="team-b"
                sets={summary.result.finalScore.sets.B}
              />
            </div>

            <div className="rounded-md border border-border bg-background/40 p-3 text-xs text-muted-foreground">
              <p>{summary.result.log.length} points simules sur {summary.result.finalScore.completedSets.length} sets joues.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Replay textuel</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[68vh] pr-3">
              <ol className="space-y-2 text-sm">
                {summary.result.log.map((entry) => (
                  <li
                    key={entry.pointNumber}
                    className="rounded-md border border-border bg-background/40 px-3 py-2"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="tabular-nums text-[10px] font-semibold text-muted-foreground">
                        #{entry.pointNumber}
                      </span>
                      <span className="text-foreground">{entry.rally.log}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{entry.scoreLabel}</p>
                  </li>
                ))}
              </ol>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

type TeamLineProps = {
  name: string;
  isWinner: boolean;
  accent: 'team-a' | 'team-b';
  sets: number;
};

const accentClasses: Record<TeamLineProps['accent'], string> = {
  'team-a': 'border-team-a/60 bg-team-a/10',
  'team-b': 'border-team-b/60 bg-team-b/10',
};

const TeamLine = ({ name, isWinner, accent, sets }: TeamLineProps) => (
  <div
    className={cn(
      'rounded-md border p-3',
      isWinner ? accentClasses[accent] : 'border-border bg-background/40',
    )}
  >
    <div className="flex items-center justify-between gap-2">
      <span className={cn('truncate text-sm font-semibold', isWinner ? 'text-foreground' : 'text-muted-foreground')}>
        {name}
      </span>
      <span className="tabular-nums text-lg font-semibold text-foreground">{sets}</span>
    </div>
    {isWinner ? <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">Vainqueur</p> : null}
  </div>
);
