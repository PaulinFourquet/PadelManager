import { describe, expect, it } from 'vitest';
import type { RallyResult } from '../types';
import { createBallKeyframes, interpolateKeyframes } from './trajectory';

const rally: RallyResult = {
  pointWinner: 'A',
  outcome: 'winner',
  winProbabilityForServer: 0.54,
  tacticalMultiplier: { A: 1, B: 1 },
  log: 'test',
  events: [
    {
      shot: 'serve',
      hitterTeam: 'A',
      hitterId: 'arturo-coello',
      defenderTeam: 'B',
      quality: 88,
      description: 'serve',
    },
    {
      shot: 'lob',
      hitterTeam: 'B',
      hitterId: 'ale-galan',
      defenderTeam: 'A',
      quality: 85,
      description: 'lob',
    },
  ],
};

describe('3d trajectory', () => {
  it('creates bounded court keyframes from rally events', () => {
    const frames = createBallKeyframes(rally);

    expect(frames.length).toBeGreaterThan(3);
    expect(frames.every((frame) => Math.abs(frame.position[0]) <= 4.8)).toBe(true);
    expect(frames.every((frame) => Math.abs(frame.position[2]) <= 9.7)).toBe(true);
  });

  it('interpolates between generated keyframes', () => {
    const frames = createBallKeyframes(rally);
    const position = interpolateKeyframes(frames, 0.2);

    expect(position).toHaveLength(3);
    expect(position[1]).toBeGreaterThan(0);
  });
});
