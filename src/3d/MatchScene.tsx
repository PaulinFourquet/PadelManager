import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { ACESFilmicToneMapping, Vector3 } from 'three';
import type { PerspectiveCamera as PerspectiveCameraType } from 'three';
import type { CameraMode, MatchState, RallyResult } from '@/types';
import { Court } from '@/3d/scene/Court';
import { Player } from '@/3d/scene/Player';
import { Ball } from '@/3d/scene/Ball';
import { Stadium } from '@/3d/scene/Stadium';
import { Lighting } from '@/3d/scene/Lighting';
import { Effects } from '@/3d/scene/Effects';

type MatchSceneProps = {
  matchState: MatchState;
  latestRally: RallyResult | null;
  cameraMode: CameraMode;
  playbackSpeed: number;
};

const playerSlots: Record<'A0' | 'A1' | 'B0' | 'B1', { position: [number, number, number]; facing: 1 | -1 }> = {
  A0: { position: [-2.6, 0, -6.4], facing: 1 },
  A1: { position: [2.6, 0, -5.4], facing: 1 },
  B0: { position: [-2.6, 0, 5.4], facing: -1 },
  B1: { position: [2.6, 0, 6.4], facing: -1 },
};

export const MatchScene = ({ matchState, latestRally, cameraMode, playbackSpeed }: MatchSceneProps) => (
  <div data-testid="match-3d-scene" className="relative aspect-[16/9] w-full overflow-hidden bg-[#070d0a]">
    <Canvas
      shadows
      dpr={[1, 1.6]}
      gl={{
        antialias: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <Lighting />
      <CameraRig mode={cameraMode} />
      <Stadium />
      <Court />
      <Player
        player={matchState.teams.A.players[0]}
        team="A"
        basePosition={playerSlots.A0.position}
        facing={playerSlots.A0.facing}
        latestRally={latestRally}
        playbackSpeed={playbackSpeed}
      />
      <Player
        player={matchState.teams.A.players[1]}
        team="A"
        basePosition={playerSlots.A1.position}
        facing={playerSlots.A1.facing}
        latestRally={latestRally}
        playbackSpeed={playbackSpeed}
      />
      <Player
        player={matchState.teams.B.players[0]}
        team="B"
        basePosition={playerSlots.B0.position}
        facing={playerSlots.B0.facing}
        latestRally={latestRally}
        playbackSpeed={playbackSpeed}
      />
      <Player
        player={matchState.teams.B.players[1]}
        team="B"
        basePosition={playerSlots.B1.position}
        facing={playerSlots.B1.facing}
        latestRally={latestRally}
        playbackSpeed={playbackSpeed}
      />
      <Ball latestRally={latestRally} playbackSpeed={playbackSpeed} />
      <OrbitControls
        enablePan={false}
        enableZoom={cameraMode !== 'ball'}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={6}
        maxDistance={28}
      />
      <Effects />
    </Canvas>

    <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
      Live · 10m × 20m · filet 0.88m
    </div>
    <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
      Camera · {cameraMode === 'broadcast' ? 'TV' : cameraMode === 'top' ? 'Plongee' : 'Suivi balle'}
    </div>
  </div>
);

const CameraRig = ({ mode }: { mode: CameraMode }) => {
  const ref = useRef<PerspectiveCameraType>(null);
  const broadcast = useMemo(() => new Vector3(8.5, 7.4, -13.5), []);
  const top = useMemo(() => new Vector3(0, 21, 0.1), []);
  const ball = useMemo(() => new Vector3(0, 5.6, -9.2), []);

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
    camera.lookAt(0, 0.8, 0);
  });

  return <PerspectiveCamera ref={ref} makeDefault fov={42} position={[8.5, 7.4, -13.5]} />;
};
