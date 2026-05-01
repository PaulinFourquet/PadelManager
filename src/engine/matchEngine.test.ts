import { describe, expect, it } from 'vitest';
import { sampleTeams } from '../data/samplePlayers';
import {
  calculatePointWinProbability,
  createInitialMatchState,
  defaultOrders,
  simulateMatch,
  simulateRally,
} from './matchEngine';

describe('match engine', () => {
  it('is deterministic for a fixed seed', () => {
    const first = simulateMatch(createInitialMatchState(sampleTeams, 4242));
    const second = simulateMatch(createInitialMatchState(sampleTeams, 4242));

    expect(first.winner).toBe(second.winner);
    expect(first.finalScore).toEqual(second.finalScore);
    expect(first.log.map((entry) => entry.rally.log)).toEqual(second.log.map((entry) => entry.rally.log));
  });

  it('produces coherent completed set scores', () => {
    const result = simulateMatch(createInitialMatchState(sampleTeams, 20260430));

    expect(result.finalScore.matchWinner).toBe(result.winner);
    expect(result.finalScore.sets[result.winner]).toBe(2);
    expect(result.finalScore.completedSets.length).toBeGreaterThanOrEqual(2);
    expect(result.finalScore.completedSets.every((set) => Math.max(set.A, set.B) >= 6)).toBe(true);
  });

  it('returns a rally result without mutating score state', () => {
    const state = createInitialMatchState(sampleTeams, 99);
    const rally = simulateRally(state);

    expect(rally.events.length).toBeGreaterThan(0);
    expect(['A', 'B']).toContain(rally.pointWinner);
    expect(state.score.games).toEqual({ A: 0, B: 0 });
    expect(state.pointNumber).toBe(0);
  });

  it('changes point probability when tactical orders change', () => {
    const balanced = createInitialMatchState(sampleTeams, 7);
    const aggressive = createInitialMatchState(sampleTeams, 7, {}, {
      A: {
        ...defaultOrders(),
        globalStyle: 'veryOffensive',
        netPosition: 'advanced',
        netPressure: 'high',
        riskTaking: 'risky',
      },
    });

    expect(calculatePointWinProbability(aggressive, 'A')).toBeGreaterThan(calculatePointWinProbability(balanced, 'A'));
  });

  it('penalizes a style that does not match the team strengths', () => {
    const attacking = createInitialMatchState(sampleTeams, 7, {}, {
      A: { ...defaultOrders(), globalStyle: 'veryOffensive' },
    });
    const defensive = createInitialMatchState(sampleTeams, 7, {}, {
      A: { ...defaultOrders(), globalStyle: 'veryDefensive' },
    });

    expect(calculatePointWinProbability(attacking, 'A')).toBeGreaterThan(calculatePointWinProbability(defensive, 'A'));
  });

  it('reflects target preference changes in debug probability', () => {
    const balancedTarget = createInitialMatchState(sampleTeams, 7, {}, {
      A: { ...defaultOrders(), targetPreference: 'balanced' },
    });
    const weakTarget = createInitialMatchState(sampleTeams, 7, {}, {
      A: { ...defaultOrders(), targetPreference: 'weakPlayer' },
    });

    expect(calculatePointWinProbability(weakTarget, 'A')).toBeGreaterThan(calculatePointWinProbability(balancedTarget, 'A'));
  });
});
