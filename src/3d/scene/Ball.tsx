import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Mesh } from 'three';
import type { RallyResult } from '@/types';
import { createBallKeyframes, interpolateKeyframes } from '@/3d/trajectory';

type BallProps = {
  latestRally: RallyResult | null;
  playbackSpeed: number;
};

export const Ball = ({ latestRally, playbackSpeed }: BallProps) => {
  const ref = useRef<Mesh>(null);
  const trailRef = useRef<Mesh>(null);
  const startedAt = useRef(0);
  const frames = useMemo(() => createBallKeyframes(latestRally, playbackSpeed), [latestRally, playbackSpeed]);

  useEffect(() => {
    startedAt.current = 0;
  }, [latestRally]);

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }
    if (startedAt.current === 0) {
      startedAt.current = clock.elapsedTime;
    }
    const elapsed = (clock.elapsedTime - startedAt.current) * playbackSpeed;
    const position = interpolateKeyframes(frames, elapsed);
    ref.current.position.set(position[0], position[1], position[2]);
    ref.current.rotation.x += 0.5 * playbackSpeed * 0.016;
    ref.current.rotation.y += 0.3 * playbackSpeed * 0.016;

    if (trailRef.current) {
      trailRef.current.position.set(position[0], position[1] + 0.02, position[2]);
      const speed = Math.min(1, Math.abs(position[1] - (interpolateKeyframes(frames, elapsed - 0.05)[1] ?? position[1])));
      trailRef.current.scale.setScalar(0.18 + speed * 0.4);
    }
  });

  return (
    <group>
      <mesh ref={trailRef} position={[0, 0.18, -4]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial color="#d8f168" transparent opacity={0.18} />
      </mesh>
      <mesh ref={ref} castShadow receiveShadow position={[0, 0.18, -4]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial
          color="#e3f482"
          emissive="#5e7b00"
          emissiveIntensity={0.55}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
};
