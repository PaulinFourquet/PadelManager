import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { samplePlayers, sampleTeams } from '../data/samplePlayers';
import { careerCalendar } from '../data/tournaments';
import { createCareerTeams, createDefaultCareer, simulateCareerTournamentMatch, tournamentPoints } from '../engine/career';
import {
  agePlayersOneSeason,
  applyTrainingToPlayer,
  careerEvent,
  getRankingTable,
  progressInjury,
  recalculateRankings,
  rollTrainingInjury,
} from '../engine/careerProgression';
import {
  createInitialMatchState,
  defaultOrders,
  simulateMatch,
  simulatePoint,
} from '../engine/matchEngine';
import type {
  CareerMatchSummary,
  CareerProfile,
  CameraMode,
  CareerEvent,
  GlobalStyle,
  MatchLogEntry,
  MatchResult,
  MatchState,
  NetPosition,
  NetPressure,
  PlaybackSpeed,
  Player,
  PlayerStats,
  RiskTaking,
  TacticalOrders,
  TargetPreference,
  Tournament,
  TrainingFocus,
  RankingEntry,
} from '../types';
import { createLocalStorageAdapter } from '../data/storage';

export type CareerView = 'home' | 'playerSelect' | 'partnerSelect' | 'calendar' | 'match' | 'result' | 'admin' | 'progression';
type OrderKey = keyof Omit<TacticalOrders, 'moraleBoostsRemaining'>;
type PlayerStatFamily = keyof PlayerStats;
type PlayerStatKey<F extends PlayerStatFamily> = keyof PlayerStats[F];

const playersStorageKey = 'padel-manager.players.v1';
const tournamentsStorageKey = 'padel-manager.tournaments.v1';
const careerEventsStorageKey = 'padel-manager.events.v1';

const loadStored = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  return createLocalStorageAdapter<T>(key).load() ?? fallback;
};

const saveStored = <T>(key: string, value: T) => {
  if (typeof window !== 'undefined') {
    createLocalStorageAdapter<T>(key).save(value);
  }
};

const createBlankStats = (): PlayerStats => ({
  attack: { smash: 70, vibora: 70, bandejaOff: 70, volleyAttack: 70 },
  defense: { lob: 70, wallExit: 70, recovery: 70, bandejaDef: 70 },
  technique: { precision: 70, slice: 70, topspin: 70, serve: 70 },
  physical: { speed: 70, stamina: 70, reflexes: 70, jump: 70 },
  mental: { composure: 70, focus: 70, adaptability: 70, teamwork: 70 },
  tactical: { gameReading: 70, positioning: 70, anticipation: 70 },
});

const createBlankPlayer = (index: number): Player => ({
  id: `custom-player-${Date.now()}-${index}`,
  name: `Custom Player ${index}`,
  gender: 'male',
  ranking: 999,
  rankingPoints: 0,
  age: 22,
  heightCm: 178,
  nationality: 'FRA',
  photoUrl: 'https://placehold.co/160x160?text=CP',
  preferredSide: 'drive',
  dominantHand: 'right',
  naturalStyle: 'balanced',
  stats: createBlankStats(),
});

type GameStore = {
  view: CareerView;
  career: CareerProfile;
  players: Player[];
  tournaments: Tournament[];
  careerEvents: CareerEvent[];
  selectedAdminPlayerId: string | null;
  selectedAdminTournamentId: string | null;
  orders: Record<'A' | 'B', TacticalOrders>;
  lastMatch: MatchResult | null;
  lastCareerMatch: CareerMatchSummary | null;
  liveMatchState: MatchState | null;
  liveMatchLog: MatchLogEntry[];
  liveTournamentId: string | null;
  debugMode: boolean;
  cameraMode: CameraMode;
  playbackSpeed: PlaybackSpeed;
  isAutoPlaying: boolean;
  setView: (view: CareerView) => void;
  choosePlayer: (playerId: string) => void;
  choosePartner: (partnerId: string) => void;
  train: (focus: TrainingFocus) => void;
  advanceWeek: () => void;
  finishSeason: () => void;
  rankings: () => RankingEntry[];
  createPlayer: () => void;
  updatePlayer: (playerId: string, patch: Partial<Player>) => void;
  updatePlayerStat: <F extends PlayerStatFamily>(playerId: string, family: F, key: PlayerStatKey<F>, value: number) => void;
  duplicatePlayer: (playerId: string) => void;
  deletePlayer: (playerId: string) => void;
  importPlayers: (json: string) => void;
  resetPlayersSeed: () => void;
  selectAdminPlayer: (playerId: string) => void;
  createTournament: () => void;
  updateTournament: (tournamentId: string, patch: Partial<Tournament>) => void;
  deleteTournament: (tournamentId: string) => void;
  selectAdminTournament: (tournamentId: string) => void;
  importTournaments: (json: string) => void;
  startQuickMatch: (playerIds: [string, string, string, string]) => void;
  startTournamentMatch: (tournamentId: string) => void;
  simulateLivePoint: () => void;
  simulateLiveToEnd: () => void;
  updateOrder: <K extends OrderKey>(team: 'A' | 'B', key: K, value: TacticalOrders[K]) => void;
  useMoraleBoost: (team: 'A' | 'B') => void;
  toggleDebugMode: () => void;
  setCameraMode: (mode: CameraMode) => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  toggleAutoPlay: () => void;
  launchTournamentMatch: (tournamentId: string) => void;
  resetCareer: () => void;
  runDemoMatch: (seed?: number) => void;
};

const initialState = createInitialMatchState(sampleTeams);
const nextSeed = (career: CareerProfile, tournamentId: string) =>
  20260000 + career.currentDay * 97 + tournamentId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

export const useGameStore = create<GameStore>()(
  immer<GameStore>((set, get) => ({
    view: 'home' as CareerView,
    career: createDefaultCareer(),
    players: loadStored(playersStorageKey, samplePlayers),
    tournaments: loadStored(tournamentsStorageKey, careerCalendar),
    careerEvents: loadStored(careerEventsStorageKey, [] as CareerEvent[]),
    selectedAdminPlayerId: samplePlayers[0]?.id ?? null,
    selectedAdminTournamentId: careerCalendar[0]?.id ?? null,
    orders: initialState.orders,
    lastMatch: null,
    lastCareerMatch: null,
    liveMatchState: null,
    liveMatchLog: [],
    liveTournamentId: null,
    debugMode: true,
    cameraMode: 'broadcast',
    playbackSpeed: 1,
    isAutoPlaying: false,
    setView: (view) =>
      set((state) => {
        state.view = view;
      }),
    choosePlayer: (playerId) =>
      set((state) => {
        state.career.playerId = playerId;
        if (state.career.partnerId === playerId) {
          state.career.partnerId = null;
        }
        state.view = 'partnerSelect';
      }),
    choosePartner: (partnerId) =>
      set((state) => {
        state.career.partnerId = partnerId;
        state.view = 'calendar';
      }),
    train: (focus) =>
      set((state) => {
        if (!state.career.playerId) {
          return;
        }
        const playerIndex = state.players.findIndex((candidate) => candidate.id === state.career.playerId);
        if (playerIndex < 0) {
          return;
        }
        state.players[playerIndex] = applyTrainingToPlayer(state.players[playerIndex], focus, state.career.injury);
        const injury = rollTrainingInjury(state.career, focus, 9000 + state.career.currentDay + state.career.trainingLoad);
        state.career.trainingLoad = focus === 'recovery' ? Math.max(0, state.career.trainingLoad - 2) : Math.min(10, state.career.trainingLoad + 1);
        state.career.currentDay += focus === 'recovery' ? 2 : 3;
        state.career.injury = injury ?? progressInjury(state.career.injury, focus === 'recovery' ? 2 : 3);
        state.careerEvents.unshift(
          careerEvent(
            state.career.currentDay,
            injury ? 'injury' : 'training',
            injury ? `${injury.label}: ${injury.remainingDays} jours` : `Entrainement ${focus} termine`,
          ),
        );
        saveStored(playersStorageKey, state.players);
        saveStored(careerEventsStorageKey, state.careerEvents);
      }),
    advanceWeek: () =>
      set((state) => {
        state.career.currentDay += 7;
        state.career.trainingLoad = Math.max(0, state.career.trainingLoad - 2);
        const previousInjury = state.career.injury;
        state.career.injury = progressInjury(state.career.injury, 7);
        state.players = recalculateRankings(state.players, state.career.playerId, state.career.rankingPoints);
        state.careerEvents.unshift(
          careerEvent(
            state.career.currentDay,
            previousInjury && !state.career.injury ? 'recovery' : 'ranking',
            previousInjury && !state.career.injury ? 'Retour a 100%, blessure terminee' : 'Semaine avancee, classement recalcule',
          ),
        );
        saveStored(playersStorageKey, state.players);
        saveStored(careerEventsStorageKey, state.careerEvents);
      }),
    finishSeason: () =>
      set((state) => {
        state.career.season += 1;
        state.career.currentDay = 1;
        state.career.trainingLoad = 0;
        state.career.injury = null;
        state.career.rankingPoints = Math.round(state.career.rankingPoints * 0.72);
        state.players = recalculateRankings(agePlayersOneSeason(state.players), state.career.playerId, state.career.rankingPoints);
        state.careerEvents.unshift(careerEvent(state.career.currentDay, 'season', `Debut saison ${state.career.season}`));
        saveStored(playersStorageKey, state.players);
        saveStored(careerEventsStorageKey, state.careerEvents);
      }),
    rankings: () => getRankingTable(get().players, 30),
    createPlayer: () =>
      set((state) => {
        const player = createBlankPlayer(state.players.length + 1);
        state.players.push(player);
        state.selectedAdminPlayerId = player.id;
        saveStored(playersStorageKey, state.players);
      }),
    updatePlayer: (playerId, patch) =>
      set((state) => {
        const player = state.players.find((candidate) => candidate.id === playerId);
        if (!player) {
          return;
        }
        Object.assign(player, patch);
        saveStored(playersStorageKey, state.players);
      }),
    updatePlayerStat: (playerId, family, key, value) =>
      set((state) => {
        const player = state.players.find((candidate) => candidate.id === playerId);
        if (!player) {
          return;
        }
        player.stats[family][key] = Math.max(0, Math.min(100, value)) as PlayerStats[typeof family][typeof key];
        saveStored(playersStorageKey, state.players);
      }),
    duplicatePlayer: (playerId) =>
      set((state) => {
        const player = state.players.find((candidate) => candidate.id === playerId);
        if (!player) {
          return;
        }
        const duplicate: Player = {
          ...player,
          id: `${player.id}-copy-${Date.now()}`,
          name: `${player.name} Copy`,
          ranking: 999,
          rankingPoints: 0,
          stats: JSON.parse(JSON.stringify(player.stats)) as PlayerStats,
        };
        state.players.push(duplicate);
        state.selectedAdminPlayerId = duplicate.id;
        saveStored(playersStorageKey, state.players);
      }),
    deletePlayer: (playerId) =>
      set((state) => {
        state.players = state.players.filter((candidate) => candidate.id !== playerId);
        if (state.selectedAdminPlayerId === playerId) {
          state.selectedAdminPlayerId = state.players[0]?.id ?? null;
        }
        if (state.career.playerId === playerId) {
          state.career.playerId = null;
        }
        if (state.career.partnerId === playerId) {
          state.career.partnerId = null;
        }
        saveStored(playersStorageKey, state.players);
      }),
    importPlayers: (json) =>
      set((state) => {
        const parsed = JSON.parse(json) as Player[];
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('Players import must be a non-empty array');
        }
        state.players = parsed;
        state.selectedAdminPlayerId = parsed[0].id;
        saveStored(playersStorageKey, state.players);
      }),
    resetPlayersSeed: () =>
      set((state) => {
        state.players = samplePlayers;
        state.selectedAdminPlayerId = samplePlayers[0]?.id ?? null;
        saveStored(playersStorageKey, state.players);
      }),
    selectAdminPlayer: (playerId) =>
      set((state) => {
        state.selectedAdminPlayerId = playerId;
      }),
    createTournament: () =>
      set((state) => {
        const tournament: Tournament = {
          id: `custom-tournament-${Date.now()}`,
          name: `Custom Tournament ${state.tournaments.length + 1}`,
          category: 'Challenger',
          surface: 'standard',
          startDay: state.career.currentDay + 7,
          prizeMoney: 50000,
          participantPairs: 32,
          opponentPlayerIds: [state.players[0]?.id ?? 'arturo-coello', state.players[1]?.id ?? 'agustin-tapia'],
        };
        state.tournaments.push(tournament);
        state.selectedAdminTournamentId = tournament.id;
        saveStored(tournamentsStorageKey, state.tournaments);
      }),
    updateTournament: (tournamentId, patch) =>
      set((state) => {
        const tournament = state.tournaments.find((candidate) => candidate.id === tournamentId);
        if (!tournament) {
          return;
        }
        Object.assign(tournament, patch);
        saveStored(tournamentsStorageKey, state.tournaments);
      }),
    deleteTournament: (tournamentId) =>
      set((state) => {
        state.tournaments = state.tournaments.filter((candidate) => candidate.id !== tournamentId);
        if (state.selectedAdminTournamentId === tournamentId) {
          state.selectedAdminTournamentId = state.tournaments[0]?.id ?? null;
        }
        saveStored(tournamentsStorageKey, state.tournaments);
      }),
    selectAdminTournament: (tournamentId) =>
      set((state) => {
        state.selectedAdminTournamentId = tournamentId;
      }),
    importTournaments: (json) =>
      set((state) => {
        const parsed = JSON.parse(json) as Tournament[];
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('Tournaments import must be a non-empty array');
        }
        state.tournaments = parsed;
        state.selectedAdminTournamentId = parsed[0].id;
        saveStored(tournamentsStorageKey, state.tournaments);
      }),
    startQuickMatch: (playerIds) =>
      set((state) => {
        const players = playerIds.map((id) => state.players.find((candidate) => candidate.id === id));
        if (players.some((player) => !player)) {
          throw new Error('Quick match needs four valid players');
        }
        const [a1, a2, b1, b2] = players as [Player, Player, Player, Player];
        const teams = {
          A: { id: 'A' as const, name: `${a1.name} / ${a2.name}`, players: [a1, a2] as [Player, Player] },
          B: { id: 'B' as const, name: `${b1.name} / ${b2.name}`, players: [b1, b2] as [Player, Player] },
        };
        state.liveMatchState = createInitialMatchState(teams, 505050, {}, state.orders);
        state.liveMatchLog = [];
        state.liveTournamentId = null;
        state.lastCareerMatch = null;
        state.lastMatch = null;
        state.view = 'match';
      }),
    startTournamentMatch: (tournamentId) =>
      set((state) => {
        const tournament = state.tournaments.find((candidate) => candidate.id === tournamentId);
        if (!tournament) {
          throw new Error(`Tournament not found: ${tournamentId}`);
        }
        const teams = createCareerTeams(state.career, tournament, state.players);
        state.liveMatchState = createInitialMatchState(
          teams,
          nextSeed(state.career, tournamentId),
          { surface: tournament.surface },
          state.orders,
        );
        state.liveMatchLog = [];
        state.liveTournamentId = tournamentId;
        state.lastCareerMatch = null;
        state.lastMatch = null;
        state.isAutoPlaying = false;
        state.view = 'match';
      }),
    simulateLivePoint: () =>
      set((state) => {
        if (!state.liveMatchState || !state.liveTournamentId || state.liveMatchState.score.matchWinner) {
          return;
        }
        state.liveMatchState.orders = state.orders;
        const nextPoint = simulatePoint(state.liveMatchState);
        state.liveMatchState = nextPoint.state;
        state.liveMatchLog.push(nextPoint.entry);

        if (nextPoint.state.score.matchWinner) {
          const tournament = state.tournaments.find((candidate) => candidate.id === state.liveTournamentId);
          if (!tournament) {
            throw new Error(`Tournament not found: ${state.liveTournamentId}`);
          }
          const summary: CareerMatchSummary = {
            tournamentId: state.liveTournamentId,
            playerTeamName: nextPoint.state.teams.A.name,
            opponentTeamName: nextPoint.state.teams.B.name,
            result: {
              winner: nextPoint.state.score.matchWinner,
              finalScore: nextPoint.state.score,
              log: state.liveMatchLog,
              finalState: nextPoint.state,
            },
          };
          state.lastCareerMatch = summary;
          state.lastMatch = summary.result;
          state.career.currentDay = tournament.startDay + 1;
          state.career.rankingPoints += tournamentPoints(tournament, summary.result.winner === 'A');
          state.career.money += summary.result.winner === 'A' ? Math.round(tournament.prizeMoney * 0.08) : Math.round(tournament.prizeMoney * 0.025);
          state.career.trainingLoad = Math.max(0, state.career.trainingLoad - 1);
          state.players = recalculateRankings(state.players, state.career.playerId, state.career.rankingPoints);
          state.careerEvents.unshift(
            careerEvent(
              state.career.currentDay,
              'ranking',
              `${tournament.name}: ${tournamentPoints(tournament, summary.result.winner === 'A')} pts gagnes`,
            ),
          );
          saveStored(playersStorageKey, state.players);
          saveStored(careerEventsStorageKey, state.careerEvents);
          state.isAutoPlaying = false;
          state.view = 'result';
        }
      }),
    simulateLiveToEnd: () =>
      set((state) => {
        while (state.liveMatchState && !state.liveMatchState.score.matchWinner) {
          state.liveMatchState.orders = state.orders;
          const nextPoint = simulatePoint(state.liveMatchState);
          state.liveMatchState = nextPoint.state;
          state.liveMatchLog.push(nextPoint.entry);
        }

        if (state.liveMatchState?.score.matchWinner && state.liveTournamentId) {
          const tournament = state.tournaments.find((candidate) => candidate.id === state.liveTournamentId);
          if (!tournament) {
            throw new Error(`Tournament not found: ${state.liveTournamentId}`);
          }
          const summary: CareerMatchSummary = {
            tournamentId: state.liveTournamentId,
            playerTeamName: state.liveMatchState.teams.A.name,
            opponentTeamName: state.liveMatchState.teams.B.name,
            result: {
              winner: state.liveMatchState.score.matchWinner,
              finalScore: state.liveMatchState.score,
              log: state.liveMatchLog,
              finalState: state.liveMatchState,
            },
          };
          state.lastCareerMatch = summary;
          state.lastMatch = summary.result;
          state.career.currentDay = tournament.startDay + 1;
          state.career.rankingPoints += tournamentPoints(tournament, summary.result.winner === 'A');
          state.career.money += summary.result.winner === 'A' ? Math.round(tournament.prizeMoney * 0.08) : Math.round(tournament.prizeMoney * 0.025);
          state.career.trainingLoad = Math.max(0, state.career.trainingLoad - 1);
          state.players = recalculateRankings(state.players, state.career.playerId, state.career.rankingPoints);
          state.careerEvents.unshift(
            careerEvent(
              state.career.currentDay,
              'ranking',
              `${tournament.name}: ${tournamentPoints(tournament, summary.result.winner === 'A')} pts gagnes`,
            ),
          );
          saveStored(playersStorageKey, state.players);
          saveStored(careerEventsStorageKey, state.careerEvents);
          state.isAutoPlaying = false;
          state.view = 'result';
        }
      }),
    updateOrder: (team, key, value) =>
      set((state) => {
        state.orders[team][key] = value;
        if (state.liveMatchState) {
          state.liveMatchState.orders[team][key] = value;
        }
      }),
    useMoraleBoost: (team) =>
      set((state) => {
        if (state.orders[team].moraleBoostsRemaining <= 0) {
          return;
        }
        state.orders[team].moraleBoostsRemaining -= 1;
        if (state.liveMatchState) {
          state.liveMatchState.orders[team].moraleBoostsRemaining = state.orders[team].moraleBoostsRemaining;
          state.liveMatchState.fatigue[team] = Math.max(0, state.liveMatchState.fatigue[team] - 0.04);
        }
      }),
    toggleDebugMode: () =>
      set((state) => {
        state.debugMode = !state.debugMode;
      }),
    setCameraMode: (mode) =>
      set((state) => {
        state.cameraMode = mode;
      }),
    setPlaybackSpeed: (speed) =>
      set((state) => {
        state.playbackSpeed = speed;
      }),
    toggleAutoPlay: () =>
      set((state) => {
        state.isAutoPlaying = !state.isAutoPlaying;
      }),
    launchTournamentMatch: (tournamentId: string) =>
      set((state) => {
        const tournament = state.tournaments.find((candidate) => candidate.id === tournamentId);
        if (!tournament) {
          throw new Error(`Tournament not found: ${tournamentId}`);
        }
        const summary = simulateCareerTournamentMatch(state.career, tournamentId, nextSeed(state.career, tournamentId), state.players, state.tournaments);
        state.lastCareerMatch = summary;
        state.lastMatch = summary.result;
        state.career.currentDay = tournament.startDay + 1;
        state.career.rankingPoints += tournamentPoints(tournament, summary.result.winner === 'A');
        state.career.money += summary.result.winner === 'A' ? Math.round(tournament.prizeMoney * 0.08) : Math.round(tournament.prizeMoney * 0.025);
        state.players = recalculateRankings(state.players, state.career.playerId, state.career.rankingPoints);
        state.careerEvents.unshift(careerEvent(state.career.currentDay, 'ranking', `${tournament.name}: classement mis a jour`));
        saveStored(playersStorageKey, state.players);
        saveStored(careerEventsStorageKey, state.careerEvents);
        state.view = 'result';
      }),
    resetCareer: () =>
      set((state) => {
        state.view = 'home';
        state.career = createDefaultCareer();
        state.players = loadStored(playersStorageKey, samplePlayers);
        state.tournaments = loadStored(tournamentsStorageKey, careerCalendar);
        state.careerEvents = [];
        state.orders = { A: defaultOrders(), B: defaultOrders() };
        state.lastMatch = null;
        state.lastCareerMatch = null;
        state.liveMatchState = null;
        state.liveMatchLog = [];
        state.liveTournamentId = null;
        state.isAutoPlaying = false;
        state.cameraMode = 'broadcast';
        state.playbackSpeed = 1;
        saveStored(careerEventsStorageKey, state.careerEvents);
      }),
    runDemoMatch: (seed = 20260430) =>
      set((state) => {
        const matchState = createInitialMatchState(sampleTeams, seed, {}, state.orders);
        state.lastMatch = simulateMatch(matchState);
      }),
  })),
);
