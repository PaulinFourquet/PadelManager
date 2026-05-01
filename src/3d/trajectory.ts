import type { RallyEvent, RallyResult } from '../types';

export type BallKeyframe = {
  time: number;
  position: [number, number, number];
};

const laneByTeam: Record<'A' | 'B', number> = {
  A: -5.8,
  B: 5.8,
};

const playerX = (event: RallyEvent) => (event.hitterId.length % 2 === 0 ? -2.5 : 2.5);

const shotApex = (shot: RallyEvent['shot']) => {
  switch (shot) {
    case 'lob':
      return 4.2;
    case 'smash':
      return 3.2;
    case 'serve':
      return 1.6;
    case 'wallExit':
      return 2.8;
    default:
      return 2.2;
  }
};

const clampCourt = (x: number, z: number): [number, number] => [
  Math.max(-4.8, Math.min(4.8, x)),
  Math.max(-9.7, Math.min(9.7, z)),
];

export const createBallKeyframes = (rally: RallyResult | null, speed = 1): BallKeyframe[] => {
  if (!rally || rally.events.length === 0) {
    return [
      { time: 0, position: [0, 0.18, -4] },
      { time: 1, position: [0, 0.18, -4] },
    ];
  }

  const frames: BallKeyframe[] = [];
  const step = 0.9 / speed;

  rally.events.forEach((event, index) => {
    const nextTeam = event.defenderTeam;
    const startZ = laneByTeam[event.hitterTeam];
    const endZ = laneByTeam[nextTeam] + (event.shot === 'lob' ? (nextTeam === 'A' ? -2 : 2) : 0);
    const startX = playerX(event);
    const endX = -startX * 0.72;
    const [safeEndX, safeEndZ] = clampCourt(endX, endZ);
    const baseTime = index * step;
    const apex = shotApex(event.shot);

    if (index === 0) {
      frames.push({ time: baseTime, position: [startX, 1.05, startZ] });
    }

    frames.push({
      time: baseTime + step * 0.48,
      position: [(startX + safeEndX) / 2, apex, (startZ + safeEndZ) / 2],
    });
    frames.push({
      time: baseTime + step,
      position: [safeEndX, event.shot === 'smash' ? 0.16 : 0.32, safeEndZ],
    });

    if (event.shot === 'wallExit' || event.shot === 'lob') {
      const reboundZ = Math.max(-9.7, Math.min(9.7, safeEndZ * 0.88));
      frames.push({
        time: baseTime + step * 1.16,
        position: [safeEndX * 0.86, 0.42, reboundZ],
      });
    }
  });

  return frames.sort((a, b) => a.time - b.time);
};

export const interpolateKeyframes = (frames: BallKeyframe[], time: number): [number, number, number] => {
  if (frames.length === 0) {
    return [0, 0.18, 0];
  }

  const duration = frames[frames.length - 1].time || 1;
  const normalizedTime = duration > 0 ? time % duration : 0;
  const nextIndex = frames.findIndex((frame) => frame.time >= normalizedTime);

  if (nextIndex <= 0) {
    return frames[0].position;
  }

  const previous = frames[nextIndex - 1];
  const next = frames[nextIndex];
  const span = next.time - previous.time || 1;
  const t = (normalizedTime - previous.time) / span;

  return [
    previous.position[0] + (next.position[0] - previous.position[0]) * t,
    previous.position[1] + (next.position[1] - previous.position[1]) * t,
    previous.position[2] + (next.position[2] - previous.position[2]) * t,
  ];
};
