import { useEffect, useMemo, useRef, useState } from 'react';
import { realPlayerNotes } from '../data/realPlayers.seed';
import { useGameStore, type CareerView } from '../store/gameStore';
import { calculatePointWinProbability } from '../engine/matchEngine';
import { MatchScene } from '../3d/MatchScene';
import type {
  CameraMode,
  GlobalStyle,
  NetPosition,
  NetPressure,
  PlaybackSpeed,
  Player,
  RiskTaking,
  TacticalOrders,
  TargetPreference,
  Tournament,
  TournamentCategory,
  TrainingFocus,
} from '../types';

const viewLabels: Record<CareerView, string> = {
  home: 'Accueil',
  playerSelect: 'Joueur',
  partnerSelect: 'Partenaire',
  calendar: 'Calendrier',
  match: 'Match',
  result: 'Resultat',
  admin: 'Admin',
  progression: 'Progression',
};

const statAverage = (player: Player) => {
  const values = Object.values(player.stats).flatMap((family) => Object.values(family));
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const money = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

export const App = () => {
  const demoBooted = useRef(false);
  const view = useGameStore((state) => state.view);
  const setView = useGameStore((state) => state.setView);
  const resetCareer = useGameStore((state) => state.resetCareer);
  const career = useGameStore((state) => state.career);
  const choosePlayer = useGameStore((state) => state.choosePlayer);
  const choosePartner = useGameStore((state) => state.choosePartner);
  const startTournamentMatch = useGameStore((state) => state.startTournamentMatch);

  useEffect(() => {
    if (window.location.search.includes('admin=1')) {
      setView('admin');
      return;
    }
    if (window.location.search.includes('progression=1')) {
      if (!career.playerId) {
        choosePlayer('arturo-coello');
        choosePartner('agustin-tapia');
      }
      setView('progression');
      return;
    }
    if (demoBooted.current || !window.location.search.includes('demo3d=1')) {
      return;
    }
    demoBooted.current = true;
    choosePlayer('arturo-coello');
    choosePartner('agustin-tapia');
    startTournamentMatch('sevilla-challenger');
  }, [career.playerId, choosePlayer, choosePartner, setView, startTournamentMatch]);

  return (
    <main className="min-h-screen bg-[#eef4ef] text-[#162119]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6">
        <header className="flex flex-col gap-4 border-b border-[#c6d4c9] pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#53735d]">Padel Manager</p>
            <h1 className="mt-1 text-3xl font-bold">Carriere MVP</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {(Object.keys(viewLabels) as CareerView[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setView(item)}
                className={`h-10 rounded border px-3 text-sm font-semibold transition ${
                  view === item
                    ? 'border-[#1f6f45] bg-[#1f6f45] text-white'
                    : 'border-[#b7c8bb] bg-white text-[#26362b] hover:border-[#1f6f45]'
                }`}
              >
                {viewLabels[item]}
              </button>
            ))}
            <button
              type="button"
              onClick={resetCareer}
              className="h-10 rounded border border-[#d2b8a4] bg-white px-3 text-sm font-semibold text-[#704328]"
            >
              Nouvelle carriere
            </button>
          </nav>
        </header>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[280px_1fr]">
          <aside className="rounded border border-[#c6d4c9] bg-white p-4">
            <h2 className="text-lg font-semibold">Profil</h2>
            <CareerStatus />
          </aside>

          <div>
            {view === 'home' && <HomeScreen />}
            {view === 'playerSelect' && <PlayerSelectScreen />}
            {view === 'partnerSelect' && <PartnerSelectScreen />}
            {view === 'calendar' && <CalendarScreen />}
            {view === 'match' && <MatchScreen />}
            {view === 'result' && <ResultScreen />}
            {view === 'admin' && <AdminScreen />}
            {view === 'progression' && <ProgressionScreen />}
          </div>
        </section>
      </div>
    </main>
  );
};

const CareerStatus = () => {
  const career = useGameStore((state) => state.career);
  const players = useGameStore((state) => state.players);
  const player = players.find((candidate) => candidate.id === career.playerId);
  const partner = players.find((candidate) => candidate.id === career.partnerId);

  return (
    <div className="mt-4 space-y-4 text-sm">
      <StatusRow label="Jour" value={String(career.currentDay)} />
      <StatusRow label="Saison" value={String(career.season)} />
      <StatusRow label="Points" value={String(career.rankingPoints)} />
      <StatusRow label="Budget" value={money(career.money)} />
      <StatusRow label="Joueur" value={player?.name ?? 'A choisir'} />
      <StatusRow label="Partenaire" value={partner?.name ?? 'A choisir'} />
      {player && partner ? (
        <div className="rounded border border-[#dce6df] bg-[#f7faf8] p-3">
          <p className="font-semibold">{player.name.split(' ')[0]} / {partner.name.split(' ')[0]}</p>
          <p className="mt-1 text-[#68766d]">Paire inscrite au prochain tournoi disponible.</p>
        </div>
      ) : null}
      {career.injury ? (
        <div className="rounded border border-[#d2b8a4] bg-[#fff8f2] p-3 text-[#704328]">
          <p className="font-semibold">{career.injury.label}</p>
          <p className="mt-1">{career.injury.remainingDays} jours restants</p>
        </div>
      ) : null}
    </div>
  );
};

const StatusRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 border-b border-[#edf2ee] pb-2">
    <span className="text-[#66746b]">{label}</span>
    <span className="text-right font-semibold">{value}</span>
  </div>
);

const HomeScreen = () => {
  const setView = useGameStore((state) => state.setView);
  const career = useGameStore((state) => state.career);
  const tournaments = useGameStore((state) => state.tournaments);
  const nextView: CareerView = career.playerId ? (career.partnerId ? 'calendar' : 'partnerSelect') : 'playerSelect';

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded border border-[#c6d4c9] bg-white p-5">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#53735d]">Phase 2</p>
        <h2 className="mt-2 text-3xl font-bold">Construis ta paire et entre dans le calendrier.</h2>
        <p className="mt-4 max-w-2xl text-[#526158]">
          Cette version ajoute la boucle de carriere minimale : choix du joueur, choix du partenaire, inscription a un
          tournoi, simulation du match via le moteur pur de Phase 1, puis replay textuel complet.
        </p>
        <button
          type="button"
          onClick={() => setView(nextView)}
          className="mt-6 h-11 rounded bg-[#1f6f45] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#195c39]"
        >
          Continuer
        </button>
      </section>

      <section className="rounded border border-[#c6d4c9] bg-white p-5">
        <h2 className="text-lg font-semibold">Prochains tournois</h2>
        <div className="mt-4 space-y-3">
          {tournaments.map((tournament) => (
            <TournamentLine key={tournament.id} tournament={tournament} compact />
          ))}
        </div>
      </section>
    </div>
  );
};

const PlayerSelectScreen = () => {
  const choosePlayer = useGameStore((state) => state.choosePlayer);
  const career = useGameStore((state) => state.career);
  const players = useGameStore((state) => state.players);

  return (
    <SelectionScreen
      title="Choix du joueur"
      subtitle="Selectionne le padelista que tu incarnes pour cette carriere."
      players={players}
      selectedId={career.playerId}
      onSelect={choosePlayer}
      actionLabel="Incarner"
    />
  );
};

const PartnerSelectScreen = () => {
  const choosePartner = useGameStore((state) => state.choosePartner);
  const career = useGameStore((state) => state.career);
  const players = useGameStore((state) => state.players);
  const partners = players.filter((player) => player.id !== career.playerId);

  return (
    <SelectionScreen
      title="Choix du partenaire"
      subtitle="Compose une paire complementaire avant de t'inscrire au premier tournoi."
      players={partners}
      selectedId={career.partnerId}
      onSelect={choosePartner}
      actionLabel="Signer"
    />
  );
};

const SelectionScreen = ({
  title,
  subtitle,
  players,
  selectedId,
  onSelect,
  actionLabel,
}: {
  title: string;
  subtitle: string;
  players: Player[];
  selectedId: string | null;
  onSelect: (playerId: string) => void;
  actionLabel: string;
}) => (
  <section className="rounded border border-[#c6d4c9] bg-white">
    <div className="border-b border-[#dce6df] p-5">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-[#5f6f65]">{subtitle}</p>
    </div>
    <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} selected={selectedId === player.id} onSelect={() => onSelect(player.id)} actionLabel={actionLabel} />
      ))}
    </div>
  </section>
);

const PlayerCard = ({
  player,
  selected,
  onSelect,
  actionLabel,
}: {
  player: Player;
  selected: boolean;
  onSelect: () => void;
  actionLabel: string;
}) => (
  <article className={`rounded border p-4 ${selected ? 'border-[#1f6f45] bg-[#f2faf5]' : 'border-[#dce6df] bg-white'}`}>
    <div className="flex items-center gap-3">
      <img className="h-14 w-14 rounded object-cover" src={player.photoUrl} alt="" />
      <div className="min-w-0">
        <h3 className="truncate font-bold">{player.name}</h3>
        <p className="text-sm text-[#66746b]">
          {player.nationality} - {player.preferredSide} - {player.naturalStyle}
        </p>
      </div>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
      <Metric label="GEN" value={statAverage(player)} />
      <Metric label="ATQ" value={Math.round((player.stats.attack.smash + player.stats.attack.volleyAttack) / 2)} />
      <Metric label="DEF" value={Math.round((player.stats.defense.lob + player.stats.defense.recovery) / 2)} />
    </div>
    <button
      type="button"
      onClick={onSelect}
      className="mt-4 h-10 w-full rounded bg-[#1f6f45] px-3 text-sm font-bold text-white hover:bg-[#195c39]"
    >
      {selected ? 'Selectionne' : actionLabel}
    </button>
  </article>
);

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded border border-[#edf2ee] bg-[#f7faf8] p-2 text-center">
    <p className="text-[11px] font-bold text-[#66746b]">{label}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

const CalendarScreen = () => {
  const career = useGameStore((state) => state.career);
  const startTournamentMatch = useGameStore((state) => state.startTournamentMatch);
  const setView = useGameStore((state) => state.setView);
  const tournaments = useGameStore((state) => state.tournaments);
  const canPlay = Boolean(career.playerId && career.partnerId);

  if (!canPlay) {
    return (
      <section className="rounded border border-[#c6d4c9] bg-white p-5">
        <h2 className="text-2xl font-bold">Calendrier verrouille</h2>
        <p className="mt-2 text-[#5f6f65]">Choisis d'abord ton joueur et ton partenaire.</p>
        <button type="button" onClick={() => setView('playerSelect')} className="mt-5 h-10 rounded bg-[#1f6f45] px-4 text-sm font-bold text-white">
          Aller a la selection
        </button>
      </section>
    );
  }

  return (
    <section className="rounded border border-[#c6d4c9] bg-white">
      <div className="border-b border-[#dce6df] p-5">
        <h2 className="text-2xl font-bold">Calendrier</h2>
        <p className="mt-2 text-sm text-[#5f6f65]">Lance un match rapide dans le tournoi de ton choix.</p>
      </div>
      <div className="divide-y divide-[#edf2ee]">
        {tournaments.map((tournament) => (
          <div key={tournament.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <TournamentLine tournament={tournament} />
            <button
              type="button"
              onClick={() => startTournamentMatch(tournament.id)}
              className="h-10 rounded bg-[#1f6f45] px-4 text-sm font-bold text-white hover:bg-[#195c39]"
            >
              Ouvrir le match
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

const MatchScreen = () => {
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

  useEffect(() => {
    if (!isAutoPlaying || !matchState || matchState.score.matchWinner) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      simulateLivePoint();
    }, 1900 / playbackSpeed);
    return () => window.clearInterval(interval);
  }, [isAutoPlaying, matchState, playbackSpeed, simulateLivePoint]);

  if (!matchState) {
    return (
      <section className="rounded border border-[#c6d4c9] bg-white p-5">
        <h2 className="text-2xl font-bold">Aucun match en cours</h2>
        <p className="mt-2 text-[#5f6f65]">Choisis un tournoi depuis le calendrier.</p>
        <button type="button" onClick={() => setView('calendar')} className="mt-5 h-10 rounded bg-[#1f6f45] px-4 text-sm font-bold text-white">
          Ouvrir le calendrier
        </button>
      </section>
    );
  }

  const serverProbability = calculatePointWinProbability(matchState, matchState.server);
  const teamAProbability = matchState.server === 'A' ? serverProbability : 1 - serverProbability;
  const lastPoints = log.slice(-12).reverse();
  const latestRally = log.at(-1)?.rally ?? null;

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <MatchScene matchState={matchState} latestRally={latestRally} cameraMode={cameraMode} playbackSpeed={playbackSpeed} />

        <div className="rounded border border-[#c6d4c9] bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#53735d]">Match textuel live</p>
              <h2 className="mt-2 text-2xl font-bold">
                {matchState.teams.A.name} vs {matchState.teams.B.name}
              </h2>
              <p className="mt-2 text-sm text-[#66746b]">
                Serveur : {matchState.teams[matchState.server].players[matchState.serverPlayerIndex].name}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={toggleAutoPlay} className="h-10 rounded border border-[#b7c8bb] bg-white px-4 text-sm font-bold">
                {isAutoPlaying ? 'Pause' : 'Lecture'}
              </button>
              <button type="button" onClick={simulateLivePoint} className="h-10 rounded bg-[#1f6f45] px-4 text-sm font-bold text-white">
                Point suivant
              </button>
              <button type="button" onClick={simulateLiveToEnd} className="h-10 rounded border border-[#b7c8bb] bg-white px-4 text-sm font-bold">
                Resultat instantane
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <ScoreBox label="Points" value={`${matchState.score.points.A}-${matchState.score.points.B}`} />
            <ScoreBox label="Jeux" value={`${matchState.score.games.A}-${matchState.score.games.B}`} />
            <ScoreBox label="Sets" value={`${matchState.score.sets.A}-${matchState.score.sets.B}`} />
            <ScoreBox label="Point" value={`#${matchState.pointNumber + 1}`} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <ButtonGroup<PlaybackSpeed>
              label="Vitesse"
              value={playbackSpeed}
              options={[
                [1, 'x1'],
                [2, 'x2'],
                [5, 'x5'],
              ]}
              onChange={setPlaybackSpeed}
            />
            <ButtonGroup<CameraMode>
              label="Camera"
              value={cameraMode}
              options={[
                ['broadcast', 'TV'],
                ['top', 'Plongee'],
                ['ball', 'Suivi balle'],
              ]}
              onChange={setCameraMode}
            />
          </div>

          <div className="mt-5 rounded border border-[#dce6df] bg-[#f7faf8] p-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold">Debug probabilites</h3>
              <button type="button" onClick={toggleDebugMode} className="h-9 rounded border border-[#b7c8bb] bg-white px-3 text-sm font-bold">
                {debugMode ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {debugMode ? (
              <div className="mt-4 space-y-3">
                <ProbabilityBar label={matchState.teams.A.name} value={teamAProbability} />
                <ProbabilityBar label={matchState.teams.B.name} value={1 - teamAProbability} />
                <p className="text-sm text-[#66746b]">
                  Les barres se recalculent immediatement quand tu changes le style, le filet, la cible ou le risque.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded border border-[#c6d4c9] bg-white">
          <div className="border-b border-[#dce6df] p-4">
            <h2 className="text-lg font-semibold">Derniers points</h2>
          </div>
          <ol className="max-h-[42vh] overflow-auto px-4 py-2 text-sm">
            {lastPoints.length ? (
              lastPoints.map((entry) => (
                <li key={entry.pointNumber} className="border-b border-[#edf2ee] py-2 last:border-0">
                  <span className="font-semibold">#{entry.pointNumber}</span> {entry.rally.log}
                  <span className="block text-[#66746b]">
                    {entry.scoreLabel} - proba serveur {(entry.rally.winProbabilityForServer * 100).toFixed(1)}%
                  </span>
                </li>
              ))
            ) : (
              <li className="py-3 text-[#66746b]">Aucun point joue pour le moment.</li>
            )}
          </ol>
        </div>
      </div>

      <TacticalPanel />
    </section>
  );
};

const ScoreBox = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded border border-[#edf2ee] bg-white p-3">
    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#66746b]">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
  </div>
);

const ProbabilityBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-semibold">{label}</span>
      <span>{(value * 100).toFixed(1)}%</span>
    </div>
    <div className="mt-1 h-3 overflow-hidden rounded bg-[#dce6df]">
      <div className="h-full bg-[#1f6f45]" style={{ width: `${Math.max(2, Math.min(98, value * 100))}%` }} />
    </div>
  </div>
);

const ButtonGroup = <T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<[T, string]>;
  onChange: (value: T) => void;
}) => (
  <div>
    <p className="mb-2 text-sm font-semibold">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map(([optionValue, optionLabel]) => (
        <button
          key={String(optionValue)}
          type="button"
          onClick={() => onChange(optionValue)}
          className={`h-9 rounded border px-3 text-sm font-bold ${
            value === optionValue ? 'border-[#1f6f45] bg-[#e6f0e9] text-[#173d26]' : 'border-[#dce6df] bg-white text-[#38483e]'
          }`}
        >
          {optionLabel}
        </button>
      ))}
    </div>
  </div>
);

const TacticalPanel = () => {
  const orders = useGameStore((state) => state.orders.A);
  const opponentOrders = useGameStore((state) => state.orders.B);
  const updateOrder = useGameStore((state) => state.updateOrder);
  const useMoraleBoost = useGameStore((state) => state.useMoraleBoost);
  const matchState = useGameStore((state) => state.liveMatchState);

  return (
    <aside className="rounded border border-[#c6d4c9] bg-white p-4">
      <h2 className="text-lg font-semibold">Ordres tactiques</h2>
      <p className="mt-1 text-sm text-[#66746b]">Equipe A uniquement pour cette phase.</p>

      <div className="mt-4 space-y-5">
        <SegmentedControl<GlobalStyle>
          label="Style global"
          value={orders.globalStyle}
          options={[
            ['veryDefensive', 'Tres defensif'],
            ['defensive', 'Defensif'],
            ['balanced', 'Equilibre'],
            ['offensive', 'Offensif'],
            ['veryOffensive', 'Tres offensif'],
          ]}
          onChange={(value) => updateOrder('A', 'globalStyle', value)}
        />
        <SegmentedControl<NetPosition>
          label="Position au filet"
          value={orders.netPosition}
          options={[
            ['deep', 'Reculee'],
            ['standard', 'Standard'],
            ['advanced', 'Avancee'],
          ]}
          onChange={(value) => updateOrder('A', 'netPosition', value)}
        />
        <SegmentedControl<NetPressure>
          label="Pression au filet"
          value={orders.netPressure}
          options={[
            ['low', 'Faible'],
            ['medium', 'Moyenne'],
            ['high', 'Forte'],
          ]}
          onChange={(value) => updateOrder('A', 'netPressure', value)}
        />
        <SegmentedControl<TargetPreference>
          label="Cible preferee"
          value={orders.targetPreference}
          options={[
            ['weakPlayer', 'Joueur faible'],
            ['balanced', '50-50'],
            ['strongPlayer', 'Joueur fort'],
            ['center', 'Centre'],
          ]}
          onChange={(value) => updateOrder('A', 'targetPreference', value)}
        />
        <SegmentedControl<RiskTaking>
          label="Prise de risque"
          value={orders.riskTaking}
          options={[
            ['safe', 'Securise'],
            ['standard', 'Standard'],
            ['risky', 'Risque'],
          ]}
          onChange={(value) => updateOrder('A', 'riskTaking', value)}
        />

        <button
          type="button"
          disabled={orders.moraleBoostsRemaining <= 0}
          onClick={() => useMoraleBoost('A')}
          className="h-10 w-full rounded bg-[#704328] px-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#b9aaa0]"
        >
          Soutien moral ({orders.moraleBoostsRemaining})
        </button>

        <div className="rounded border border-[#edf2ee] bg-[#f7faf8] p-3 text-sm">
          <p className="font-semibold">Adversaire</p>
          <p className="mt-1 text-[#66746b]">
            {opponentOrders.globalStyle}, risque {opponentOrders.riskTaking}
          </p>
          {matchState ? (
            <p className="mt-2 text-[#66746b]">
              Fatigue A {(matchState.fatigue.A * 100).toFixed(1)}% - B {(matchState.fatigue.B * 100).toFixed(1)}%
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
};

const SegmentedControl = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<[T, string]>;
  onChange: (value: T) => void;
}) => (
  <div>
    <p className="mb-2 text-sm font-semibold">{label}</p>
    <div className="grid gap-2">
      {options.map(([optionValue, optionLabel]) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          className={`min-h-9 rounded border px-3 py-2 text-left text-sm font-semibold ${
            value === optionValue ? 'border-[#1f6f45] bg-[#e6f0e9] text-[#173d26]' : 'border-[#dce6df] bg-white text-[#38483e]'
          }`}
        >
          {optionLabel}
        </button>
      ))}
    </div>
  </div>
);

const trainingFocuses: Array<[TrainingFocus, string]> = [
  ['attack', 'Attaque'],
  ['defense', 'Defense'],
  ['technique', 'Technique'],
  ['physical', 'Physique'],
  ['mental', 'Mental'],
  ['tactical', 'Tactique'],
  ['recovery', 'Recuperation'],
];

const ProgressionScreen = () => {
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
      <section className="rounded border border-[#c6d4c9] bg-white p-5">
        <h2 className="text-2xl font-bold">Progression verrouillee</h2>
        <p className="mt-2 text-[#5f6f65]">Choisis d'abord le joueur que tu incarnes.</p>
        <button type="button" onClick={() => setView('playerSelect')} className="mt-5 h-10 rounded bg-[#1f6f45] px-4 text-sm font-bold text-white">
          Choisir joueur
        </button>
      </section>
    );
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div className="rounded border border-[#c6d4c9] bg-white p-5">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#53735d]">Phase 6</p>
          <h2 className="mt-2 text-2xl font-bold">Progression carriere</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <ScoreBox label="Saison" value={String(career.season)} />
            <ScoreBox label="Jour" value={String(career.currentDay)} />
            <ScoreBox label="Ranking" value={`#${player.ranking}`} />
            <ScoreBox label="Charge" value={`${career.trainingLoad}/10`} />
          </div>
          <div className="mt-4 rounded border border-[#edf2ee] bg-[#f7faf8] p-4 text-sm">
            <p className="font-semibold">{player.name}{partner ? ` / ${partner.name}` : ''}</p>
            <p className="mt-1 text-[#66746b]">
              Points {career.rankingPoints} - budget {money(career.money)} - moyenne generale {statAverage(player)}
            </p>
            {career.injury ? (
              <p className="mt-2 font-semibold text-[#704328]">
                Blessure: {career.injury.label}, {career.injury.remainingDays} jours restants.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded border border-[#c6d4c9] bg-white p-5">
          <h3 className="text-lg font-bold">Entrainement</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {trainingFocuses.map(([focus, label]) => (
              <button
                key={focus}
                type="button"
                onClick={() => train(focus)}
                className={`min-h-16 rounded border px-3 py-2 text-left ${
                  focus === 'recovery' ? 'border-[#b7c8bb] bg-[#f7faf8]' : 'border-[#dce6df] bg-white hover:border-[#1f6f45]'
                }`}
              >
                <span className="block font-bold">{label}</span>
                <span className="text-sm text-[#66746b]">{focus === 'recovery' ? 'Baisse charge et soigne' : '+stats, +charge'}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={advanceWeek} className="h-10 rounded border border-[#b7c8bb] bg-white px-4 text-sm font-bold">
              Avancer 1 semaine
            </button>
            <button type="button" onClick={finishSeason} className="h-10 rounded border border-[#d2b8a4] bg-white px-4 text-sm font-bold text-[#704328]">
              Fin de saison
            </button>
          </div>
        </div>

        <div className="rounded border border-[#c6d4c9] bg-white">
          <div className="border-b border-[#dce6df] p-4">
            <h3 className="text-lg font-bold">Journal</h3>
          </div>
          <div className="max-h-[34vh] overflow-auto p-4 text-sm">
            {events.length ? (
              events.slice(0, 18).map((event) => (
                <div key={event.id} className="border-b border-[#edf2ee] py-2 last:border-0">
                  <span className="font-bold">Jour {event.day}</span>
                  <span className="ml-2 text-[#66746b]">{event.message}</span>
                </div>
              ))
            ) : (
              <p className="text-[#66746b]">Aucun evenement pour le moment.</p>
            )}
          </div>
        </div>
      </div>

      <aside className="rounded border border-[#c6d4c9] bg-white">
        <div className="border-b border-[#dce6df] p-4">
          <h3 className="text-lg font-bold">Classement mondial</h3>
        </div>
        <div className="max-h-[74vh] overflow-auto p-3 text-sm">
          {table.map((entry) => (
            <div
              key={entry.playerId}
              className={`mb-2 grid grid-cols-[44px_1fr_auto] gap-2 rounded border p-2 ${
                entry.playerId === career.playerId ? 'border-[#1f6f45] bg-[#e6f0e9]' : 'border-[#edf2ee] bg-white'
              }`}
            >
              <span className="font-bold">#{entry.rank}</span>
              <span className="truncate">{entry.name}</span>
              <span className="font-semibold">{entry.points}</span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
};

const statFamilies = ['attack', 'defense', 'technique', 'physical', 'mental', 'tactical'] as const;
const tournamentCategories: TournamentCategory[] = ['FIP Bronze', 'FIP Silver', 'FIP Gold', 'Challenger', 'P2', 'P1', 'Premier Padel'];

const AdminScreen = () => {
  const [tab, setTab] = useState<'players' | 'tournaments' | 'quick'>('players');

  return (
    <section className="space-y-5">
      <div className="rounded border border-[#c6d4c9] bg-white p-5">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#53735d]">Phase 5</p>
        <h2 className="mt-2 text-2xl font-bold">Base joueurs pros + Admin</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(['players', 'tournaments', 'quick'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`h-10 rounded border px-4 text-sm font-bold ${
                tab === item ? 'border-[#1f6f45] bg-[#1f6f45] text-white' : 'border-[#b7c8bb] bg-white'
              }`}
            >
              {item === 'players' ? 'Joueurs' : item === 'tournaments' ? 'Tournois' : 'Test rapide'}
            </button>
          ))}
        </div>
      </div>
      {tab === 'players' && <AdminPlayers />}
      {tab === 'tournaments' && <AdminTournaments />}
      {tab === 'quick' && <QuickMatchAdmin />}
    </section>
  );
};

const AdminPlayers = () => {
  const players = useGameStore((state) => state.players);
  const selectedId = useGameStore((state) => state.selectedAdminPlayerId);
  const selectAdminPlayer = useGameStore((state) => state.selectAdminPlayer);
  const createPlayer = useGameStore((state) => state.createPlayer);
  const duplicatePlayer = useGameStore((state) => state.duplicatePlayer);
  const deletePlayer = useGameStore((state) => state.deletePlayer);
  const importPlayers = useGameStore((state) => state.importPlayers);
  const resetPlayersSeed = useGameStore((state) => state.resetPlayersSeed);
  const [importText, setImportText] = useState('');
  const selected = players.find((player) => player.id === selectedId) ?? players[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
      <aside className="rounded border border-[#c6d4c9] bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-[#dce6df] p-4">
          <h3 className="font-bold">Joueurs ({players.length})</h3>
          <button type="button" onClick={createPlayer} className="h-9 rounded bg-[#1f6f45] px-3 text-sm font-bold text-white">
            Creer
          </button>
        </div>
        <div className="max-h-[72vh] overflow-auto p-2">
          {players
            .slice()
            .sort((a, b) => a.gender.localeCompare(b.gender) || a.ranking - b.ranking)
            .map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => selectAdminPlayer(player.id)}
                className={`mb-2 w-full rounded border p-3 text-left text-sm ${
                  selected?.id === player.id ? 'border-[#1f6f45] bg-[#e6f0e9]' : 'border-[#edf2ee] bg-white'
                }`}
              >
                <span className="font-bold">#{player.ranking} {player.name}</span>
                <span className="block text-[#66746b]">{player.gender} - {player.nationality} - {player.naturalStyle}</span>
              </button>
            ))}
        </div>
      </aside>

      <div className="space-y-5">
        {selected ? <PlayerEditor player={selected} /> : null}

        <div className="rounded border border-[#c6d4c9] bg-white p-4">
          <h3 className="font-bold">Import / Export JSON</h3>
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            className="mt-3 h-28 w-full rounded border border-[#dce6df] p-3 font-mono text-xs"
            placeholder="Colle ici un tableau JSON de joueurs"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setImportText(JSON.stringify(players, null, 2))} className="h-9 rounded border border-[#b7c8bb] bg-white px-3 text-sm font-bold">
              Exporter
            </button>
            <button type="button" onClick={() => importPlayers(importText)} className="h-9 rounded bg-[#1f6f45] px-3 text-sm font-bold text-white">
              Importer
            </button>
            <button type="button" onClick={resetPlayersSeed} className="h-9 rounded border border-[#d2b8a4] bg-white px-3 text-sm font-bold text-[#704328]">
              Reset seed
            </button>
            {selected ? (
              <>
                <button type="button" onClick={() => duplicatePlayer(selected.id)} className="h-9 rounded border border-[#b7c8bb] bg-white px-3 text-sm font-bold">
                  Dupliquer
                </button>
                <button type="button" onClick={() => deletePlayer(selected.id)} className="h-9 rounded border border-[#d2b8a4] bg-white px-3 text-sm font-bold text-[#704328]">
                  Supprimer
                </button>
              </>
            ) : null}
          </div>
          <div className="mt-4 rounded border border-[#edf2ee] bg-[#f7faf8] p-3 text-sm text-[#5f6f65]">
            {realPlayerNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerEditor = ({ player }: { player: Player }) => {
  const updatePlayer = useGameStore((state) => state.updatePlayer);
  const updatePlayerStat = useGameStore((state) => state.updatePlayerStat);

  return (
    <div className="rounded border border-[#c6d4c9] bg-white p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div>
          <h3 className="text-xl font-bold">Edition joueur</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <AdminInput label="Nom" value={player.name} onChange={(value) => updatePlayer(player.id, { name: value })} />
            <AdminInput label="Nationalite" value={player.nationality} onChange={(value) => updatePlayer(player.id, { nationality: value })} />
            <AdminNumber label="Age" value={player.age} onChange={(value) => updatePlayer(player.id, { age: value })} />
            <AdminNumber label="Taille cm" value={player.heightCm} onChange={(value) => updatePlayer(player.id, { heightCm: value })} />
            <AdminNumber label="Ranking" value={player.ranking} onChange={(value) => updatePlayer(player.id, { ranking: value })} />
            <AdminNumber label="Points" value={player.rankingPoints} onChange={(value) => updatePlayer(player.id, { rankingPoints: value })} />
            <AdminSelect label="Genre" value={player.gender} options={['male', 'female']} onChange={(value) => updatePlayer(player.id, { gender: value as Player['gender'] })} />
            <AdminSelect label="Cote" value={player.preferredSide} options={['drive', 'revers']} onChange={(value) => updatePlayer(player.id, { preferredSide: value as Player['preferredSide'] })} />
            <AdminSelect label="Main" value={player.dominantHand} options={['right', 'left']} onChange={(value) => updatePlayer(player.id, { dominantHand: value as Player['dominantHand'] })} />
            <AdminSelect label="Style" value={player.naturalStyle} options={['offensive', 'balanced', 'defensive', 'counter']} onChange={(value) => updatePlayer(player.id, { naturalStyle: value as Player['naturalStyle'] })} />
          </div>
        </div>
        <RadarChart player={player} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {statFamilies.map((family) => (
          <div key={family} className="rounded border border-[#edf2ee] p-3">
            <h4 className="font-bold capitalize">{family}</h4>
            <div className="mt-3 space-y-3">
              {(Object.keys(player.stats[family]) as Array<keyof typeof player.stats[typeof family]>).map((key) => (
                <label key={String(key)} className="grid gap-1 text-sm">
                  <span className="flex justify-between">
                    <span>{String(key)}</span>
                    <span className="font-bold">{player.stats[family][key]}</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={player.stats[family][key]}
                    onChange={(event) => updatePlayerStat(player.id, family, key, Number(event.target.value))}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RadarChart = ({ player }: { player: Player }) => {
  const values = statFamilies.map((family) => {
    const stats = Object.values(player.stats[family]);
    return stats.reduce((sum, value) => sum + value, 0) / stats.length;
  });
  const points = values
    .map((value, index) => {
      const angle = -Math.PI / 2 + (index / values.length) * Math.PI * 2;
      const radius = (value / 100) * 92;
      return `${120 + Math.cos(angle) * radius},${120 + Math.sin(angle) * radius}`;
    })
    .join(' ');

  return (
    <div className="rounded border border-[#edf2ee] bg-[#f7faf8] p-3">
      <svg viewBox="0 0 240 240" className="h-60 w-full">
        {[30, 60, 90].map((radius) => (
          <circle key={radius} cx="120" cy="120" r={radius} fill="none" stroke="#d4e0d7" />
        ))}
        {statFamilies.map((family, index) => {
          const angle = -Math.PI / 2 + (index / statFamilies.length) * Math.PI * 2;
          const x = 120 + Math.cos(angle) * 104;
          const y = 120 + Math.sin(angle) * 104;
          return (
            <g key={family}>
              <line x1="120" y1="120" x2={x} y2={y} stroke="#d4e0d7" />
              <text x={x} y={y} fontSize="10" textAnchor="middle" dominantBaseline="middle" fill="#405247">
                {family.slice(0, 3)}
              </text>
            </g>
          );
        })}
        <polygon points={points} fill="#1f6f45" opacity="0.28" stroke="#1f6f45" strokeWidth="3" />
      </svg>
    </div>
  );
};

const AdminTournaments = () => {
  const tournaments = useGameStore((state) => state.tournaments);
  const players = useGameStore((state) => state.players);
  const selectedId = useGameStore((state) => state.selectedAdminTournamentId);
  const selectAdminTournament = useGameStore((state) => state.selectAdminTournament);
  const createTournament = useGameStore((state) => state.createTournament);
  const updateTournament = useGameStore((state) => state.updateTournament);
  const deleteTournament = useGameStore((state) => state.deleteTournament);
  const importTournaments = useGameStore((state) => state.importTournaments);
  const [importText, setImportText] = useState('');
  const selected = tournaments.find((tournament) => tournament.id === selectedId) ?? tournaments[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
      <aside className="rounded border border-[#c6d4c9] bg-white">
        <div className="flex items-center justify-between border-b border-[#dce6df] p-4">
          <h3 className="font-bold">Tournois</h3>
          <button type="button" onClick={createTournament} className="h-9 rounded bg-[#1f6f45] px-3 text-sm font-bold text-white">
            Creer
          </button>
        </div>
        <div className="p-2">
          {tournaments.map((tournament) => (
            <button
              key={tournament.id}
              type="button"
              onClick={() => selectAdminTournament(tournament.id)}
              className={`mb-2 w-full rounded border p-3 text-left text-sm ${
                selected?.id === tournament.id ? 'border-[#1f6f45] bg-[#e6f0e9]' : 'border-[#edf2ee] bg-white'
              }`}
            >
              <span className="font-bold">{tournament.name}</span>
              <span className="block text-[#66746b]">{tournament.category} - jour {tournament.startDay}</span>
            </button>
          ))}
        </div>
      </aside>
      <div className="rounded border border-[#c6d4c9] bg-white p-4">
        {selected ? (
          <div className="grid gap-3 md:grid-cols-2">
            <AdminInput label="Nom" value={selected.name} onChange={(value) => updateTournament(selected.id, { name: value })} />
            <AdminSelect label="Categorie" value={selected.category} options={tournamentCategories} onChange={(value) => updateTournament(selected.id, { category: value as TournamentCategory })} />
            <AdminSelect label="Surface" value={selected.surface} options={['standard', 'fast', 'slow']} onChange={(value) => updateTournament(selected.id, { surface: value as Tournament['surface'] })} />
            <AdminNumber label="Jour" value={selected.startDay} onChange={(value) => updateTournament(selected.id, { startDay: value })} />
            <AdminNumber label="Dotation" value={selected.prizeMoney} onChange={(value) => updateTournament(selected.id, { prizeMoney: value })} />
            <AdminNumber label="Participants" value={selected.participantPairs} onChange={(value) => updateTournament(selected.id, { participantPairs: value })} />
            <AdminSelect label="Adversaire 1" value={selected.opponentPlayerIds[0]} options={players.map((player) => player.id)} onChange={(value) => updateTournament(selected.id, { opponentPlayerIds: [value, selected.opponentPlayerIds[1]] })} />
            <AdminSelect label="Adversaire 2" value={selected.opponentPlayerIds[1]} options={players.map((player) => player.id)} onChange={(value) => updateTournament(selected.id, { opponentPlayerIds: [selected.opponentPlayerIds[0], value] })} />
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setImportText(JSON.stringify(tournaments, null, 2))} className="h-9 rounded border border-[#b7c8bb] bg-white px-3 text-sm font-bold">
            Exporter
          </button>
          <button type="button" onClick={() => importTournaments(importText)} className="h-9 rounded bg-[#1f6f45] px-3 text-sm font-bold text-white">
            Importer
          </button>
          {selected ? (
            <button type="button" onClick={() => deleteTournament(selected.id)} className="h-9 rounded border border-[#d2b8a4] bg-white px-3 text-sm font-bold text-[#704328]">
              Supprimer
            </button>
          ) : null}
        </div>
        <textarea value={importText} onChange={(event) => setImportText(event.target.value)} className="mt-3 h-28 w-full rounded border border-[#dce6df] p-3 font-mono text-xs" />
      </div>
    </div>
  );
};

const QuickMatchAdmin = () => {
  const players = useGameStore((state) => state.players);
  const startQuickMatch = useGameStore((state) => state.startQuickMatch);
  const defaults = [players[0]?.id, players[1]?.id, players[2]?.id, players[3]?.id].filter(Boolean) as string[];
  const [ids, setIds] = useState<[string, string, string, string]>([
    defaults[0] ?? '',
    defaults[1] ?? '',
    defaults[2] ?? '',
    defaults[3] ?? '',
  ]);

  const set = (index: number, value: string) => {
    setIds((current) => current.map((id, idx) => (idx === index ? value : id)) as [string, string, string, string]);
  };

  return (
    <div className="rounded border border-[#c6d4c9] bg-white p-4">
      <h3 className="text-xl font-bold">Mode test rapide</h3>
      <p className="mt-1 text-sm text-[#66746b]">Lance un match entre deux paires sans passer par la carriere.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {ids.map((id, index) => (
          <AdminSelect key={index} label={`Joueur ${index + 1}`} value={id} options={players.map((player) => player.id)} onChange={(value) => set(index, value)} />
        ))}
      </div>
      <button type="button" onClick={() => startQuickMatch(ids)} className="mt-4 h-10 rounded bg-[#1f6f45] px-4 text-sm font-bold text-white">
        Lancer le match 3D
      </button>
    </div>
  );
};

const AdminInput = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <label className="grid gap-1 text-sm">
    <span className="font-semibold">{label}</span>
    <input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded border border-[#dce6df] px-3" />
  </label>
);

const AdminNumber = ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => (
  <label className="grid gap-1 text-sm">
    <span className="font-semibold">{label}</span>
    <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-10 rounded border border-[#dce6df] px-3" />
  </label>
);

const AdminSelect = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) => (
  <label className="grid gap-1 text-sm">
    <span className="font-semibold">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded border border-[#dce6df] px-3">
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

const TournamentLine = ({ tournament, compact = false }: { tournament: Tournament; compact?: boolean }) => {
  const players = useGameStore((state) => state.players);
  const opponents = tournament.opponentPlayerIds.map((id) => players.find((player) => player.id === id)?.name ?? id).join(' / ');

  return (
    <div className={compact ? 'rounded border border-[#edf2ee] p-3' : ''}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold">{tournament.name}</h3>
        <span className="rounded bg-[#e6f0e9] px-2 py-1 text-xs font-bold text-[#31553c]">{tournament.category}</span>
      </div>
      <p className="mt-1 text-sm text-[#66746b]">
        Jour {tournament.startDay} - {tournament.surface} - {tournament.participantPairs} paires - {money(tournament.prizeMoney)}
      </p>
      <p className="mt-1 text-sm text-[#39483f]">Adversaires prevus : {opponents}</p>
    </div>
  );
};

const ResultScreen = () => {
  const summary = useGameStore((state) => state.lastCareerMatch);
  const setView = useGameStore((state) => state.setView);
  const tournaments = useGameStore((state) => state.tournaments);

  if (!summary) {
    return (
      <section className="rounded border border-[#c6d4c9] bg-white p-5">
        <h2 className="text-2xl font-bold">Aucun resultat</h2>
        <p className="mt-2 text-[#5f6f65]">Lance un match depuis le calendrier pour afficher le replay.</p>
        <button type="button" onClick={() => setView('calendar')} className="mt-5 h-10 rounded bg-[#1f6f45] px-4 text-sm font-bold text-white">
          Ouvrir le calendrier
        </button>
      </section>
    );
  }

  const tournament = tournaments.find((candidate) => candidate.id === summary.tournamentId);
  const winnerName = summary.result.winner === 'A' ? summary.playerTeamName : summary.opponentTeamName;

  return (
    <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
      <div className="rounded border border-[#c6d4c9] bg-white p-5">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#53735d]">{tournament?.name ?? 'Tournoi'}</p>
        <h2 className="mt-2 text-2xl font-bold">{winnerName} gagne</h2>
        <p className="mt-3 text-[#5f6f65]">
          {summary.playerTeamName} vs {summary.opponentTeamName}
        </p>
        <div className="mt-5 rounded border border-[#edf2ee] bg-[#f7faf8] p-4">
          <p className="text-sm font-semibold">Score final</p>
          <p className="mt-1 text-2xl font-bold">
            Sets {summary.result.finalScore.sets.A}-{summary.result.finalScore.sets.B}
          </p>
          <p className="mt-1 text-sm text-[#66746b]">
            {summary.result.finalScore.completedSets.map((set) => `${set.A}-${set.B}`).join(', ')}
          </p>
        </div>
        <button type="button" onClick={() => setView('calendar')} className="mt-5 h-10 rounded border border-[#b7c8bb] bg-white px-4 text-sm font-bold">
          Retour calendrier
        </button>
      </div>

      <div className="rounded border border-[#c6d4c9] bg-white">
        <div className="border-b border-[#dce6df] p-4">
          <h2 className="text-lg font-semibold">Replay textuel</h2>
          <p className="mt-1 text-sm text-[#66746b]">{summary.result.log.length} points simules.</p>
        </div>
        <ol className="max-h-[72vh] overflow-auto px-4 py-2 text-sm">
          {summary.result.log.map((entry) => (
            <li key={entry.pointNumber} className="border-b border-[#edf2ee] py-2 last:border-0">
              <span className="font-semibold">#{entry.pointNumber}</span> {entry.rally.log}
              <span className="block text-[#66746b]">{entry.scoreLabel}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
