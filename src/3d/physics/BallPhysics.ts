import type { RallyEvent, RallyResult } from '@/types';

export type BallKeyframe = {
  time: number;
  position: [number, number, number];
};

const GRAVITY = 9.81;
const COURT_HALF_WIDTH = 4.8;
const COURT_HALF_DEPTH = 9.7;
const GLASS_RESTITUTION = 0.62;
const GROUND_RESTITUTION = 0.65;
const GROUND_FRICTION = 0.84;
const FRAME_DT = 0.04;

const laneByTeam: Record<'A' | 'B', number> = {
  A: -5.8,
  B: 5.8,
};

const playerLane = (event: RallyEvent) => (event.hitterId.length % 2 === 0 ? -2.5 : 2.5);

const shotApex = (shot: RallyEvent['shot']) => {
  switch (shot) {
    case 'lob':
      return 4.4;
    case 'smash':
      return 3.4;
    case 'serve':
      return 1.7;
    case 'wallExit':
      return 2.9;
    case 'vibora':
      return 2.5;
    case 'bandeja':
      return 2.6;
    default:
      return 2.2;
  }
};

const shotDuration = (shot: RallyEvent['shot']) => {
  switch (shot) {
    case 'lob':
      return 1.05;
    case 'smash':
      return 0.65;
    case 'serve':
      return 0.85;
    case 'wallExit':
      return 1.0;
    default:
      return 0.85;
  }
};

const clampCourt = (x: number, z: number): [number, number] => [
  Math.max(-COURT_HALF_WIDTH, Math.min(COURT_HALF_WIDTH, x)),
  Math.max(-COURT_HALF_DEPTH, Math.min(COURT_HALF_DEPTH, z)),
];

type ShotPath = {
  startTime: number;
  startPos: [number, number, number];
  endPos: [number, number, number];
  apex: number;
  duration: number;
  shot: RallyEvent['shot'];
};

const computeShotPath = (event: RallyEvent, previousEnd: [number, number, number] | null, baseTime: number): ShotPath => {
  const startX = previousEnd?.[0] ?? playerLane(event);
  const startZ = previousEnd?.[2] ?? laneByTeam[event.hitterTeam];
  const startPos: [number, number, number] = [startX, previousEnd?.[1] ?? 1.05, startZ];

  const targetZ = laneByTeam[event.defenderTeam] + (event.shot === 'lob' ? (event.defenderTeam === 'A' ? -2 : 2) : 0);
  const targetX = -startX * 0.7 + (event.shot === 'wallExit' ? -startX * 0.2 : 0);
  const [endX, endZ] = clampCourt(targetX, targetZ);
  const endY = event.shot === 'smash' ? 0.16 : 0.32;

  return {
    startTime: baseTime,
    startPos,
    endPos: [endX, endY, endZ],
    apex: shotApex(event.shot),
    duration: shotDuration(event.shot),
    shot: event.shot,
  };
};

// Sample a parabolic trajectory with gravity, applying glass + ground bounces along the way.
const sampleShot = (path: ShotPath, frames: BallKeyframe[], speed: number): [number, number, number] => {
  const { startPos, endPos, apex, duration, startTime } = path;
  const totalDuration = duration / speed;
  const steps = Math.max(8, Math.ceil(totalDuration / (FRAME_DT / speed)));
  const dt = totalDuration / steps;

  const horizontalVelocity = [(endPos[0] - startPos[0]) / totalDuration, (endPos[2] - startPos[2]) / totalDuration];
  const peakHeight = Math.max(apex, startPos[1] + 0.6, endPos[1] + 0.6);
  const initialVerticalV = 2 * (peakHeight - startPos[1]) / (totalDuration / 2);

  let position: [number, number, number] = [startPos[0], startPos[1], startPos[2]];
  let velocity: [number, number, number] = [horizontalVelocity[0], initialVerticalV, horizontalVelocity[1]];

  frames.push({ time: startTime, position: [...position] });

  for (let i = 1; i <= steps; i += 1) {
    velocity[1] -= GRAVITY * dt;
    position = [position[0] + velocity[0] * dt, position[1] + velocity[1] * dt, position[2] + velocity[2] * dt];

    // Glass bounce — sides
    if (position[0] > COURT_HALF_WIDTH) {
      position[0] = COURT_HALF_WIDTH;
      velocity[0] = -velocity[0] * GLASS_RESTITUTION;
    } else if (position[0] < -COURT_HALF_WIDTH) {
      position[0] = -COURT_HALF_WIDTH;
      velocity[0] = -velocity[0] * GLASS_RESTITUTION;
    }

    // Glass bounce — back walls
    if (position[2] > COURT_HALF_DEPTH) {
      position[2] = COURT_HALF_DEPTH;
      velocity[2] = -velocity[2] * GLASS_RESTITUTION;
    } else if (position[2] < -COURT_HALF_DEPTH) {
      position[2] = -COURT_HALF_DEPTH;
      velocity[2] = -velocity[2] * GLASS_RESTITUTION;
    }

    // Ground bounce
    if (position[1] < 0.13) {
      position[1] = 0.13;
      velocity[1] = -velocity[1] * GROUND_RESTITUTION;
      velocity[0] *= GROUND_FRICTION;
      velocity[2] *= GROUND_FRICTION;
    }

    frames.push({ time: startTime + i * dt, position: [...position] });
  }

  return position;
};

export const createBallKeyframes = (rally: RallyResult | null, speed = 1): BallKeyframe[] => {
  if (!rally || rally.events.length === 0) {
    return [
      { time: 0, position: [0, 0.18, -4] },
      { time: 1, position: [0, 0.18, -4] },
    ];
  }

  const frames: BallKeyframe[] = [];
  let baseTime = 0;
  let previousEnd: [number, number, number] | null = null;

  rally.events.forEach((event) => {
    const path = computeShotPath(event, previousEnd, baseTime);
    previousEnd = sampleShot(path, frames, speed);
    baseTime += path.duration / speed;
  });

  // Sort + clamp safety
  return frames
    .map((frame) => ({
      ...frame,
      position: [
        Math.max(-COURT_HALF_WIDTH, Math.min(COURT_HALF_WIDTH, frame.position[0])),
        Math.max(0, frame.position[1]),
        Math.max(-COURT_HALF_DEPTH, Math.min(COURT_HALF_DEPTH, frame.position[2])),
      ] as [number, number, number],
    }))
    .sort((a, b) => a.time - b.time);
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
