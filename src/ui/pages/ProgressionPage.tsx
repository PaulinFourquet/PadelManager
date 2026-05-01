import {
  Activity,
  BookOpenText,
  CalendarPlus,
  ChevronsUp,
  Crown,
  Dumbbell,
  Gauge,
  HeartPulse,
  Lightbulb,
  Sparkles,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGameStore } from '@/store/gameStore';
import type { TrainingFocus } from '@/types';
import { KpiCard } from '@/ui/components/KpiCard';
import { PageHeader } from '@/ui/components/PageHeader';
import { StatRadar } from '@/ui/components/StatRadar';
import { money } from '@/ui/lib/format';
import { statAverage } from '@/ui/lib/playerStats';

type TrainingItem = {
  focus: TrainingFocus;
  label: string;
  description: string;
  icon: LucideIcon;
};

const trainingItems: TrainingItem[] = [
  { focus: 'attack', label: 'Attaque', description: '+ smash, + volee', icon: Sparkles },
  { focus: 'defense', label: 'Defense', description: '+ recuperation, + lob', icon: Target },
  { focus: 'technique', label: 'Technique', description: '+ precision', icon: Lightbulb },
  { focus: 'physical', label: 'Physique', description: '+ vitesse, + endurance', icon: Dumbbell },
  { focus: 'mental', label: 'Mental', description: '+ sang-froid', icon: BookOpenText },
  { focus: 'tactical', label: 'Tactique', description: '+ lecture du jeu', icon: Activity },
  { focus: 'recovery', label: 'Recuperation', description: 'Baisse charge, soigne', icon: HeartPulse },
];

export const ProgressionPage = () => {
  const career = useGameStore((state) => state.career);
  const players = useGameStore((state) => state.players);
  const events = useGameStore((state) => state.careerEvents);
  const train = useGameStore((state) => state.train);
  const advanceWeek = useGameStore((state) => state.advanceWeek);
  const finishSeason = useGameStore((state) => state.finishSeason);
  const rankings = useGameStore((state) => state.rankings);
  const setView = useGameStore((state) => state.setView);
  const player = players.find((candidate) => candidate.id === career.playerId);
  const partner = players.find((candidate) => candidate.id === career.partnerId);
  const table = rankings();

  if (!player) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader eyebrow="Carriere" title="Progression verrouillee" />
        <Card className="p-8 shadow-card">
          <p className="font-semibold text-foreground">Choisis d'abord le joueur que tu incarnes.</p>
          <Button className="mt-4" onClick={() => setView('playerSelect')}>
            Choisir joueur
          </Button>
        </Card>
      </div>
    );
  }

  const playerRank = table.find((entry) => entry.playerId === player.id)?.rank ?? player.ranking;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow={`Saison ${career.season} · Jour ${career.currentDay}`}
        title="Progression carriere"
        description="Pilote l'entrainement, suis ta charge et tes evenements de saison."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={advanceWeek} className="gap-2">
              <CalendarPlus className="h-4 w-4" />
              Avancer 1 semaine
            </Button>
            <Button variant="outline" onClick={finishSeason} className="gap-2 border-accent/40 text-accent hover:bg-accent/10">
              <Crown className="h-4 w-4" />
              Fin de saison
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Saison" value={career.season} hint={`Jour ${career.currentDay}`} icon={<CalendarPlus className="h-4 w-4" />} />
        <KpiCard label="Ranking" value={`#${playerRank}`} hint={`${career.rankingPoints.toLocaleString('fr-FR')} points`} icon={<ChevronsUp className="h-4 w-4" />} trend="up" />
        <KpiCard label="Charge" value={`${career.trainingLoad}/10`} hint="Fatigue d'entrainement" icon={<Gauge className="h-4 w-4" />} />
        <KpiCard label="Budget" value={money(career.money)} hint="Tresorerie" icon={<Trophy className="h-4 w-4" />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Joueur</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[1fr_220px]">
              <div className="space-y-3">
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {player.name}
                    {partner ? ` / ${partner.name}` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {player.nationality} - {player.age} ans - moy. {statAverage(player)}
                  </p>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-muted-foreground">Charge d'entrainement</span>
                    <span className="tabular-nums font-semibold">{career.trainingLoad}/10</span>
                  </div>
                  <Progress value={career.trainingLoad * 10} className="h-2" />
                </div>
                {career.injury ? (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    <p className="font-semibold">{career.injury.label}</p>
                    <p className="mt-1 opacity-80">{career.injury.remainingDays} jours restants</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Pas de blessure en cours</p>
                )}
              </div>
              <StatRadar player={player} variant="neutral" size={200} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Entrainement</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {trainingItems.map(({ focus, label, description, icon: Icon }) => (
                <button
                  key={focus}
                  type="button"
                  onClick={() => train(focus)}
                  className={cn(
                    'group flex flex-col gap-1.5 rounded-md border p-3 text-left transition',
                    focus === 'recovery'
                      ? 'border-accent/40 bg-accent/10 hover:border-accent hover:bg-accent/15'
                      : 'border-border bg-background/40 hover:border-primary/40 hover:bg-card',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      focus === 'recovery' ? 'text-accent' : 'text-primary group-hover:text-primary',
                    )}
                  />
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                  <span className="text-xs text-muted-foreground">{description}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Journal de saison</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[34vh] pr-3">
                {events.length ? (
                  <ul className="space-y-2 text-sm">
                    {events.slice(0, 24).map((event) => (
                      <li key={event.id} className="rounded-md border border-border bg-background/40 px-3 py-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Jour {event.day}
                        </span>
                        <p className="text-sm text-foreground">{event.message}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun evenement pour le moment.</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Classement mondial</CardTitle>
            <span className="text-xs text-muted-foreground">{table.length} joueurs</span>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[68vh] pr-3">
              <ul className="space-y-1.5 text-sm">
                {table.map((entry) => (
                  <li
                    key={entry.playerId}
                    className={cn(
                      'grid grid-cols-[36px_1fr_auto] items-center gap-2 rounded-md border px-2.5 py-2 transition',
                      entry.playerId === career.playerId
                        ? 'border-primary/60 bg-primary/10 text-foreground'
                        : 'border-border bg-background/30 hover:bg-background/60',
                    )}
                  >
                    <span className="tabular-nums text-xs font-semibold text-muted-foreground">#{entry.rank}</span>
                    <span className="truncate">{entry.name}</span>
                    <span className="tabular-nums text-xs font-semibold text-foreground">
                      {entry.points.toLocaleString('fr-FR')}
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
