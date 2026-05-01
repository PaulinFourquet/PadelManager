import { samplePlayers } from '../data/samplePlayers';
import { careerCalendar } from '../data/tournaments';
import type { CareerMatchSummary, CareerProfile, Player, Team, Tournament } from '../types';
import { createInitialMatchState, simulateMatch } from './matchEngine';

export const createDefaultCareer = (): CareerProfile => ({
  managerName: 'Manager',
  playerId: null,
  partnerId: null,
  currentDay: 1,
  season: 2026,
  rankingPoints: 0,
  money: 25000,
  injury: null,
  trainingLoad: 0,
});

export const findPlayer = (playerId: string, players: Player[] = samplePlayers) => {
  const player = players.find((candidate) => candidate.id === playerId);
  if (!player) {
    throw new Error(`Player not found: ${playerId}`);
  }
  return player;
};

export const createCareerTeams = (
  career: CareerProfile,
  tournament: Tournament,
  players: Player[] = samplePlayers,
): Record<'A' | 'B', Team> => {
  if (!career.playerId || !career.partnerId) {
    throw new Error('Career needs a player and a partner before launching a match');
  }

  const player = findPlayer(career.playerId, players);
  const partner = findPlayer(career.partnerId, players);
  const opponentOne = findPlayer(tournament.opponentPlayerIds[0], players);
  const opponentTwo = findPlayer(tournament.opponentPlayerIds[1], players);

  return {
    A: {
      id: 'A',
      name: `${player.name} / ${partner.name}`,
      players: [player, partner],
    },
    B: {
      id: 'B',
      name: `${opponentOne.name} / ${opponentTwo.name}`,
      players: [opponentOne, opponentTwo],
    },
  };
};

export const tournamentPoints = (tournament: Tournament, wonMatch: boolean) => {
  const base = {
    'FIP Bronze': 18,
    'FIP Silver': 35,
    'FIP Gold': 60,
    Challenger: 90,
    P2: 180,
    P1: 300,
    'Premier Padel': 500,
  }[tournament.category];

  return wonMatch ? base : Math.floor(base * 0.28);
};

export const simulateCareerTournamentMatch = (
  career: CareerProfile,
  tournamentId: string,
  seed: number,
  players: Player[] = samplePlayers,
  tournaments: Tournament[] = careerCalendar,
): CareerMatchSummary => {
  const tournament = tournaments.find((candidate) => candidate.id === tournamentId);
  if (!tournament) {
    throw new Error(`Tournament not found: ${tournamentId}`);
  }

  const teams = createCareerTeams(career, tournament, players);
  const matchState = createInitialMatchState(teams, seed, { surface: tournament.surface });
  const result = simulateMatch(matchState);

  return {
    tournamentId,
    playerTeamName: teams.A.name,
    opponentTeamName: teams.B.name,
    result,
  };
};
