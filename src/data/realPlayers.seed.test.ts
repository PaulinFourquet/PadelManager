import { describe, expect, it } from 'vitest';
import { realPlayers } from './realPlayers.seed';

describe('real players seed', () => {
  it('contains a replaceable initial pro database with unique ids', () => {
    const ids = new Set(realPlayers.map((player) => player.id));

    expect(realPlayers.length).toBeGreaterThanOrEqual(40);
    expect(ids.size).toBe(realPlayers.length);
  });

  it('includes male and female players with complete stat families', () => {
    expect(realPlayers.some((player) => player.gender === 'male')).toBe(true);
    expect(realPlayers.some((player) => player.gender === 'female')).toBe(true);
    expect(realPlayers.every((player) => Object.values(player.stats).every((family) => Object.values(family).every((value) => value >= 0 && value <= 100)))).toBe(true);
  });
});
