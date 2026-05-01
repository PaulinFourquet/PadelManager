import { describe, expect, it } from 'vitest';
import { careerCalendar } from '../data/tournaments';
import { createCareerTeams, createDefaultCareer, simulateCareerTournamentMatch, tournamentPoints } from './career';

describe('career flow', () => {
  it('builds the player pair and tournament opponent pair', () => {
    const career = {
      ...createDefaultCareer(),
      playerId: 'arturo-coello',
      partnerId: 'agustin-tapia',
    };

    const teams = createCareerTeams(career, careerCalendar[0]);

    expect(teams.A.name).toBe('Arturo Coello / Agustin Tapia');
    expect(teams.B.players.map((player) => player.id)).toEqual(['momo-gonzalez', 'javi-garrido']);
  });

  it('simulates a career tournament match with deterministic output', () => {
    const career = {
      ...createDefaultCareer(),
      playerId: 'arturo-coello',
      partnerId: 'agustin-tapia',
    };

    const first = simulateCareerTournamentMatch(career, 'sevilla-challenger', 2026);
    const second = simulateCareerTournamentMatch(career, 'sevilla-challenger', 2026);

    expect(first.result.finalScore).toEqual(second.result.finalScore);
    expect(first.playerTeamName).toBe('Arturo Coello / Agustin Tapia');
    expect(first.result.log.length).toBeGreaterThan(0);
  });

  it('awards more ranking points for a win than a loss', () => {
    const tournament = careerCalendar[1];

    expect(tournamentPoints(tournament, true)).toBeGreaterThan(tournamentPoints(tournament, false));
  });
});
