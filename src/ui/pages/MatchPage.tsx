import { ArrowLeft, Camera, FastForward, Gauge, Pause, Play, SkipForward, View, Video } from 'lucide-react';
import { MatchScene } from '@/3d/MatchScene';
import { calculatePointWinProbability } from '@/engine/matchEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useGameStore } from '@/store/gameStore';
import type { CameraMode, PlaybackSpeed } from '@/types';
import { MatchTimeline } from '@/ui/components/MatchTimeline';
import { PageHeader } from '@/ui/components/PageHeader';
import { ProbabilityGauge } from '@/ui/components/ProbabilityGauge';
import { ScorePanel } from '@/ui/components/ScorePanel';
import { TacticalOrdersPanel } from '@/ui/components/TacticalOrdersPanel';
import { useMatchAutoPlay } from '@/ui/hooks/useMatchAutoPlay';

export const MatchPage = () => {
  const matchState = useGameStore((state) => state.liveMatchState);
  const log = useGameStore((state) => state.liveMatchLog);
  const simulateLivePoint = useGameStore((state) => state.simulateLivePoint);
  const simulateLiveToEnd = useGameStore((state) => state.simulateLiveToEnd);
  const setView = useGameStore((state) => state.setView);
  const debugMode = useGameStore((state) => state.debugMode);
  const toggleDebugMode = useGameStore((state) => state.toggleDebugMode);
  const cameraMode = useGameStore((state) => state.cameraMode);
  const setCameraMode = useGameStore((state) => state.setCameraMode);
  const playbackSpeed = useGameStore((state) => state.playbackSpeed);
  const setPlaybackSpeed = useGameStore((state) => state.setPlaybackSpeed);
  const isAutoPlaying = useGameStore((state) => state.isAutoPlaying);
  const toggleAutoPlay = useGameStore((state) => state.toggleAutoPlay);

  useMatchAutoPlay();

  if (!matchState) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader eyebrow="Match" title="Aucun match en cours" />
        <Card className="p-8 shadow-card">
          <p className="text-foreground">Choisis un tournoi depuis le calendrier.</p>
          <Button className="mt-4 gap-2" onClick={() => setView('calendar')}>
            <ArrowLeft className="h-4 w-4" />
            Ouvrir le calendrier
          </Button>
        </Card>
      </div>
    );
  }

  const serverProbability = calculatePointWinProbability(matchState, matchState.server);
  const teamAProbability = matchState.server === 'A' ? serverProbability : 1 - serverProbability;
  const matchWon = Boolean(matchState.score.matchWinner);

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        eyebrow="Match en direct"
        title={`${matchState.teams.A.name} vs ${matchState.teams.B.name}`}
        description={`Serveur : ${matchState.teams[matchState.server].players[matchState.serverPlayerIndex].name} · Point #${
          matchState.pointNumber + 1
        }`}
        actions={
          <Button variant="outline" onClick={() => setView('calendar')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Calendrier
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card className="overflow-hidden p-0 shadow-card">
            <MatchScene
              matchState={matchState}
              latestRally={log.at(-1)?.rally ?? null}
              cameraMode={cameraMode}
              playbackSpeed={playbackSpeed}
            />
          </Card>

          <ScorePanel matchState={matchState} />

          <Card className="shadow-card">
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <Button
                onClick={toggleAutoPlay}
                variant={isAutoPlaying ? 'secondary' : 'default'}
                className="gap-2"
                disabled={matchWon}
              >
                {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isAutoPlaying ? 'Pause' : 'Lecture'}
              </Button>
              <Button onClick={simulateLivePoint} variant="outline" className="gap-2" disabled={matchWon}>
                <SkipForward className="h-4 w-4" />
                Point suivant
              </Button>
              <Button onClick={simulateLiveToEnd} variant="outline" className="gap-2" disabled={matchWon}>
                <FastForward className="h-4 w-4" />
                Resultat instant
              </Button>

              <Separator orientation="vertical" className="hidden h-8 sm:block" />

              <div className="flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                <ToggleGroup
                  type="single"
                  value={String(playbackSpeed)}
                  onValueChange={(next) => {
                    if (next) setPlaybackSpeed(Number(next) as PlaybackSpeed);
                  }}
                >
                  <ToggleGroupItem value="1" size="sm" className="px-2.5">x1</ToggleGroupItem>
                  <ToggleGroupItem value="2" size="sm" className="px-2.5">x2</ToggleGroupItem>
                  <ToggleGroupItem value="5" size="sm" className="px-2.5">x5</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="flex items-center gap-2">
                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                <ToggleGroup
                  type="single"
                  value={cameraMode}
                  onValueChange={(next) => {
                    if (next) setCameraMode(next as CameraMode);
                  }}
                >
                  <ToggleGroupItem value="broadcast" size="sm" className="gap-1 px-2.5">
                    <Video className="h-3 w-3" /> TV
                  </ToggleGroupItem>
                  <ToggleGroupItem value="top" size="sm" className="px-2.5">Plongee</ToggleGroupItem>
                  <ToggleGroupItem value="ball" size="sm" className="gap-1 px-2.5">
                    <View className="h-3 w-3" /> Balle
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Probabilites & live</CardTitle>
              <Button variant="ghost" size="sm" onClick={toggleDebugMode}>
                {debugMode ? 'Masquer debug' : 'Debug'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProbabilityGauge
                teamAProbability={teamAProbability}
                teamALabel={matchState.teams.A.name}
                teamBLabel={matchState.teams.B.name}
              />
              {debugMode ? (
                <p className="text-[10px] text-muted-foreground">
                  Recalcul a chaque modif d'ordre tactique. Style A = {matchState.orders.A.globalStyle}, risque ={' '}
                  {matchState.orders.A.riskTaking}.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Derniers points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[36vh]">
                <MatchTimeline entries={log.slice(-30)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <TacticalOrdersPanel matchState={matchState} />
        </div>
      </div>
    </div>
  );
};
