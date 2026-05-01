import { describe, expect, it } from 'vitest';
import { applyPointToScore, createInitialScore } from './scoring';
import { defaultMatchOptions } from './matchEngine';
import type { GameScore } from '../types';

const options = defaultMatchOptions();

const scoreGameTo = (score: GameScore, winner: 'A' | 'B') => {
  let next = score;
  for (let i = 0; i < 4; i += 1) {
    next = applyPointToScore(next, winner, options);
  }
  return next;
};

describe('padel scoring', () => {
  it('awards a standard game after four straight points', () => {
    const score = scoreGameTo(createInitialScore(), 'A');

    expect(score.games.A).toBe(1);
    expect(score.games.B).toBe(0);
    expect(score.points).toEqual({ A: 0, B: 0 });
  });

  it('uses advantage scoring when punto de oro is disabled', () => {
    let score = createInitialScore();
    for (const winner of ['A', 'B', 'A', 'B', 'A', 'B', 'A'] as const) {
      score = applyPointToScore(score, winner, options);
    }

    expect(score.points.A).toBe('AD');
    expect(score.games.A).toBe(0);
  });

  it('starts a tie-break at six games all', () => {
    let score = createInitialScore();
    for (let game = 0; game < 6; game += 1) {
      score = scoreGameTo(score, 'A');
      score = scoreGameTo(score, 'B');
    }

    expect(score.games).toEqual({ A: 6, B: 6 });
    expect(score.tieBreak?.points).toEqual({ A: 0, B: 0 });
  });

  it('completes a set from the tie-break by two clear points', () => {
    let score = createInitialScore();
    score.games = { A: 6, B: 6 };
    score.tieBreak = { points: { A: 6, B: 6 }, serverAfterFirstPoint: 'B' };

    score = applyPointToScore(score, 'A', options);
    score = applyPointToScore(score, 'A', options);

    expect(score.sets.A).toBe(1);
    expect(score.completedSets[0]).toEqual({ A: 7, B: 6 });
    expect(score.tieBreak).toBeNull();
  });
});
