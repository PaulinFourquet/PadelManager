import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useEffect, useMemo, useRef, type ReactElement } from 'react';
import { Vector3 } from 'three';
import type { Group, Mesh, PerspectiveCamera as PerspectiveCameraType } from 'three';
import type { CameraMode, MatchState, Player, RallyResult } from '../types';
import { createBallKeyframes, interpolateKeyframes } from './trajectory';

type MatchSceneProps = {
  matchState: MatchState;
  latestRally: RallyResult | null;
  cameraMode: CameraMode;
  playbackSpeed: number;
};

const teamColors: Record<'A' | 'B', string> = {
  A: '#1f6f45',
  B: '#b9432f',
};

export const MatchScene = ({ matchState, latestRally, cameraMode, playbackSpeed }: MatchSceneProps) => (
  <div data-testid="match-3d-scene" className="relative h-[420px] min-h-[320px] overflow-hidden rounded border border-[#c6d4c9] bg-[#0f1b14]">
    <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true }}>
      <color attach="background" args={['#102018']} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[3, 8, 4]} intensity={1.6} castShadow />
      <CameraRig mode={cameraMode} />
      <Court />
      <Players matchState={matchState} latestRally={latestRally} />
      <Ball latestRally={latestRally} playbackSpeed={playbackSpeed} />
      <OrbitControls enablePan={false} enableZoom={cameraMode !== 'ball'} maxPolarAngle={Math.PI / 2.15} />
    </Canvas>
    <div className="pointer-events-none absolute left-3 top-3 rounded bg-black/55 px-3 py-2 text-xs font-semibold text-white">
      Court 10m x 20m - filet 0.88m
    </div>
  </div>
);

const CameraRig = ({ mode }: { mode: CameraMode }) => {
  const ref = useRef<PerspectiveCameraType>(null);
  const broadcast = useMemo(() => new Vector3(7.7, 7.2, -12.5), []);
  const top = useMemo(() => new Vector3(0, 19, 0.1), []);
  const ball = useMemo(() => new Vector3(0, 5.2, -8.8), []);

  useFrame(() => {
    if (!ref.current) {
      return;
    }
    const camera = ref.current;
    if (mode === 'top') {
      camera.position.lerp(top, 0.08);
      camera.lookAt(0, 0, 0);
      return;
    }
    if (mode === 'ball') {
      camera.position.lerp(ball, 0.06);
      camera.lookAt(0, 1.2, 0);
      return;
    }
    camera.position.lerp(broadcast, 0.06);
    camera.lookAt(0, 0.6, 0);
  });

  return <PerspectiveCamera ref={ref} makeDefault fov={45} position={[7.7, 7.2, -12.5]} />;
};

const Court = () => (
  <group>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[10, 20]} />
      <meshStandardMaterial color="#315d4a" roughness={0.88} />
    </mesh>
    <CourtLines />
    <Net />
    <GlassWalls />
    <Fence />
  </group>
);

const CourtLines = () => {
  const lineMaterial = <meshStandardMaterial color="#e9f2ec" roughness={0.7} />;
  return (
    <group position={[0, 0.012, 0]}>
      <LineBox position={[0, 0, -9.95]} scale={[10, 0.035, 0.035]} material={lineMaterial} />
      <LineBox position={[0, 0, 9.95]} scale={[10, 0.035, 0.035]} material={lineMaterial} />
      <LineBox position={[-4.95, 0, 0]} scale={[0.035, 0.035, 20]} material={lineMaterial} />
      <LineBox position={[4.95, 0, 0]} scale={[0.035, 0.035, 20]} material={lineMaterial} />
      <LineBox position={[0, 0, -3]} scale={[10, 0.035, 0.035]} material={lineMaterial} />
      <LineBox position={[0, 0, 3]} scale={[10, 0.035, 0.035]} material={lineMaterial} />
      <LineBox position={[0, 0, 0]} scale={[0.035, 0.035, 20]} material={lineMaterial} />
    </group>
  );
};

const LineBox = ({
  position,
  scale,
  material,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  material: ReactElement;
}) => (
  <mesh position={position} scale={scale}>
    <boxGeometry args={[1, 1, 1]} />
    {material}
  </mesh>
);

const Net = () => (
  <group position={[0, 0.46, 0]}>
    <mesh>
      <boxGeometry args={[10.15, 0.88, 0.05]} />
      <meshStandardMaterial color="#1d2922" transparent opacity={0.42} wireframe />
    </mesh>
    <mesh position={[-5.08, 0.02, 0]}>
      <boxGeometry args={[0.08, 0.92, 0.08]} />
      <meshStandardMaterial color="#f1f4ee" />
    </mesh>
    <mesh position={[5.08, 0.02, 0]}>
      <boxGeometry args={[0.08, 0.92, 0.08]} />
      <meshStandardMaterial color="#f1f4ee" />
    </mesh>
  </group>
);

const GlassWalls = () => (
  <group>
    {[
      [0, 1.5, -10.05, 10.2, 3, 0.08],
      [0, 1.5, 10.05, 10.2, 3, 0.08],
      [-5.05, 1.5, 0, 0.08, 3, 20.1],
      [5.05, 1.5, 0, 0.08, 3, 20.1],
    ].map(([x, y, z, width, height, depth]) => (
      <mesh key={`${x}-${z}`} position={[x, y, z]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#bfe7ef" transparent opacity={0.2} roughness={0.18} metalness={0.05} />
      </mesh>
    ))}
  </group>
);

const Fence = () => (
  <group>
    {[
      [0, 3.25, -10.12, 10.3, 0.9, 0.04],
      [0, 3.25, 10.12, 10.3, 0.9, 0.04],
    ].map(([x, y, z, width, height, depth]) => (
      <mesh key={`${x}-${z}`} position={[x, y, z]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#24332a" wireframe />
      </mesh>
    ))}
  </group>
);

const Players = ({ matchState, latestRally }: { matchState: MatchState; latestRally: RallyResult | null }) => {
  const positions = useMemo(
    () => ({
      A0: [-2.6, 0, -6.4] as [number, number, number],
      A1: [2.6, 0, -5.4] as [number, number, number],
      B0: [-2.6, 0, 5.4] as [number, number, number],
      B1: [2.6, 0, 6.4] as [number, number, number],
    }),
    [],
  );

  return (
    <group>
      <Mannequin player={matchState.teams.A.players[0]} team="A" basePosition={positions.A0} active={isActive(matchState.teams.A.players[0], latestRally)} />
      <Mannequin player={matchState.teams.A.players[1]} team="A" basePosition={positions.A1} active={isActive(matchState.teams.A.players[1], latestRally)} />
      <Mannequin player={matchState.teams.B.players[0]} team="B" basePosition={positions.B0} active={isActive(matchState.teams.B.players[0], latestRally)} />
      <Mannequin player={matchState.teams.B.players[1]} team="B" basePosition={positions.B1} active={isActive(matchState.teams.B.players[1], latestRally)} />
    </group>
  );
};

const isActive = (player: Player, rally: RallyResult | null) => rally?.events.at(-1)?.hitterId === player.id;

const Mannequin = ({
  player,
  team,
  basePosition,
  active,
}: {
  player: Player;
  team: 'A' | 'B';
  basePosition: [number, number, number];
  active: boolean;
}) => {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }
    const bob = active ? Math.sin(clock.elapsedTime * 9) * 0.04 : 0;
    ref.current.position.set(basePosition[0] + (active ? (team === 'A' ? 0.28 : -0.28) : 0), bob, basePosition[2]);
  });

  return (
    <group ref={ref} position={basePosition}>
      <mesh castShadow position={[0, 0.45, 0]}>
        <capsuleGeometry args={[0.18, 0.55, 4, 8]} />
        <meshStandardMaterial color={teamColors[team]} roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0, 0.93, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#f2c7a0" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.42, 0.05, 0.42]} />
        <meshStandardMaterial color={active ? '#f1d46b' : '#213329'} />
      </mesh>
      <mesh position={[team === 'A' ? 0.26 : -0.26, 0.58, team === 'A' ? 0.13 : -0.13]} rotation={[0.4, 0, active ? 0.9 : 0.35]}>
        <boxGeometry args={[0.08, 0.48, 0.08]} />
        <meshStandardMaterial color="#2a211b" />
      </mesh>
      <mesh position={[0, 1.18, 0]}>
        <boxGeometry args={[Math.min(1.2, player.name.length * 0.035), 0.03, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

const Ball = ({ latestRally, playbackSpeed }: { latestRally: RallyResult | null; playbackSpeed: number }) => {
  const ref = useRef<Mesh>(null);
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
    const position = interpolateKeyframes(frames, (clock.elapsedTime - startedAt.current) * playbackSpeed);
    ref.current.position.set(position[0], position[1], position[2]);
  });

  return (
    <mesh ref={ref} castShadow position={[0, 0.18, -4]}>
      <sphereGeometry args={[0.13, 18, 18]} />
      <meshStandardMaterial color="#d8f168" emissive="#314000" emissiveIntensity={0.35} />
    </mesh>
  );
};
