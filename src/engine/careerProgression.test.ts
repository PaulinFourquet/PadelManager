import { describe, expect, it } from 'vitest';
import { samplePlayers } from '../data/samplePlayers';
import { createDefaultCareer } from './career';
import { agePlayersOneSeason, applyTrainingToPlayer, getRankingTable, recalculateRankings, rollTrainingInjury } from './careerProgression';

describe('career progression', () => {
  it('training improves focused stats', () => {
    const player = samplePlayers[0];
    const trained = applyTrainingToPlayer(player, 'attack', null);

    expect(trained.stats.attack.smash).toBeGreaterThanOrEqual(player.stats.attack.smash);
    expect(trained.stats.attack.volleyAttack).toBeGreaterThanOrEqual(player.stats.attack.volleyAttack);
  });

  it('injury roll is deterministic for the same seed', () => {
    const profile = { ...createDefaultCareer(), trainingLoad: 5 };

    expect(rollTrainingInjury(profile, 'physical', 123)).toEqual(rollTrainingInjury(profile, 'physical', 123));
  });

  it('aging reduces veteran physical stats but can improve reading', () => {
    const veteran = { ...samplePlayers[0], age: 36 };
    const aged = agePlayersOneSeason([veteran])[0];

    expect(aged.age).toBe(37);
    expect(aged.stats.physical.speed).toBeLessThanOrEqual(veteran.stats.physical.speed);
    expect(aged.stats.tactical.gameReading).toBeGreaterThanOrEqual(veteran.stats.tactical.gameReading);
  });

  it('recalculates ranking from career points', () => {
    const players = recalculateRankings(samplePlayers, samplePlayers[10].id, 50000);
    const promoted = players.find((player) => player.id === samplePlayers[10].id);

    expect(promoted?.ranking).toBe(1);
  });

  it('renders a unified ranking table ordered by points', () => {
    const table = getRankingTable(samplePlayers, 5);

    expect(table.map((entry) => entry.rank)).toEqual([1, 2, 3, 4, 5]);
    expect(table[0].points).toBeGreaterThanOrEqual(table[1].points);
  });
});
