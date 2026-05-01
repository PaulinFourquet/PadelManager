import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Player, RallyResult, ShotType } from '@/types';

export type PlayerAnimationState =
  | 'idle'
  | 'moving'
  | 'serving'
  | 'hittingForehand'
  | 'hittingBackhand'
  | 'smashing'
  | 'lobbing'
  | 'celebrating'
  | 'dejected';

export type AnimationFrame = {
  state: PlayerAnimationState;
  swingProgress: number; // 0=prep, 0.5=impact, 1=follow-through
  bodyTilt: number; // -0.5..0.5
  bodyTwist: number; // -0.5..0.5
  legSpread: number; // 0..1
  bobAmount: number;
  emphasis: number; // 0..1 amplitude of motion
};

const idleFrame: AnimationFrame = {
  state: 'idle',
  swingProgress: 0,
  bodyTilt: 0,
  bodyTwist: 0,
  legSpread: 0.2,
  bobAmount: 0.012,
  emphasis: 0.2,
};

const shotToState: Record<ShotType, PlayerAnimationState> = {
  serve: 'serving',
  smash: 'smashing',
  vibora: 'hittingForehand',
  bandeja: 'hittingForehand',
  volley: 'hittingForehand',
  lob: 'lobbing',
  wallExit: 'hittingBackhand',
};

const isHitterShot = (state: PlayerAnimationState) =>
  state === 'serving' ||
  state === 'smashing' ||
  state === 'hittingForehand' ||
  state === 'hittingBackhand' ||
  state === 'lobbing';

type UsePlayerAnimationProps = {
  player: Player;
  team: 'A' | 'B';
  latestRally: RallyResult | null;
  playbackSpeed: number;
  shotDurationSeconds?: number;
};

export const usePlayerAnimation = ({
  player,
  team,
  latestRally,
  playbackSpeed,
  shotDurationSeconds = 0.9,
}: UsePlayerAnimationProps) => {
  const ref = useRef<AnimationFrame>(idleFrame);
  const startedAtRef = useRef(0);
  const rallyId = latestRally?.events.map((event) => event.shot).join('-') ?? null;
  const previousRallyIdRef = useRef<string | null>(null);

  const events = useMemo(() => latestRally?.events ?? [], [latestRally]);

  useFrame(({ clock }) => {
    if (!latestRally) {
      ref.current = idleFrame;
      return;
    }

    if (rallyId !== previousRallyIdRef.current) {
      previousRallyIdRef.current = rallyId;
      startedAtRef.current = clock.elapsedTime;
    }

    const elapsed = (clock.elapsedTime - startedAtRef.current) * playbackSpeed;
    const eventIndex = Math.floor(elapsed / shotDurationSeconds);
    const localProgress = (elapsed % shotDurationSeconds) / shotDurationSeconds;
    const totalEvents = events.length;
    const isPostRally = eventIndex >= totalEvents;

    if (isPostRally) {
      const isWinnerSide = latestRally.pointWinner === team;
      ref.current = {
        ...idleFrame,
        state: isWinnerSide ? 'celebrating' : 'dejected',
        bodyTilt: isWinnerSide ? -0.15 : 0.15,
        bobAmount: isWinnerSide ? 0.06 : 0.008,
        emphasis: isWinnerSide ? 0.9 : 0.3,
      };
      return;
    }

    const event = events[eventIndex];
    if (!event) {
      ref.current = idleFrame;
      return;
    }

    const isHitter = event.hitterId === player.id;
    if (!isHitter) {
      ref.current = {
        state: 'moving',
        swingProgress: 0,
        bodyTilt: Math.sin(elapsed * 4) * 0.05,
        bodyTwist: Math.cos(elapsed * 3) * 0.08,
        legSpread: 0.3 + Math.sin(elapsed * 6) * 0.06,
        bobAmount: 0.018,
        emphasis: 0.45,
      };
      return;
    }

    const targetState = shotToState[event.shot];
    const tiltByShot: Partial<Record<PlayerAnimationState, number>> = {
      serving: -0.25 + localProgress * 0.4,
      smashing: -0.3 + localProgress * 0.45,
      hittingForehand: -0.05 + localProgress * 0.15,
      hittingBackhand: 0.05 - localProgress * 0.18,
      lobbing: 0.18 - localProgress * 0.3,
    };
    const twistByShot: Partial<Record<PlayerAnimationState, number>> = {
      serving: -0.4 + localProgress * 0.7,
      smashing: -0.35 + localProgress * 0.7,
      hittingForehand: 0.3 - localProgress * 0.6,
      hittingBackhand: -0.3 + localProgress * 0.6,
      lobbing: 0.15 - localProgress * 0.3,
    };

    ref.current = {
      state: targetState,
      swingProgress: localProgress,
      bodyTilt: tiltByShot[targetState] ?? 0,
      bodyTwist: twistByShot[targetState] ?? 0,
      legSpread: 0.3 + (1 - Math.abs(localProgress - 0.5) * 2) * 0.35,
      bobAmount: 0.04 + (1 - Math.abs(localProgress - 0.5) * 2) * 0.05,
      emphasis: isHitterShot(targetState) ? 1 : 0.4,
    };
  });

  return ref;
};
