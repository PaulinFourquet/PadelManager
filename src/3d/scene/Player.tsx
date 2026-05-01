import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import type { Player as PlayerType, RallyResult } from '@/types';
import { usePlayerAnimation, type PlayerAnimationState } from '@/3d/animation/usePlayerAnimation';

type PlayerProps = {
  player: PlayerType;
  team: 'A' | 'B';
  basePosition: [number, number, number];
  latestRally: RallyResult | null;
  facing: 1 | -1;
  playbackSpeed?: number;
};

type Palette = {
  primary: string;
  secondary: string;
  skin: string;
  shoes: string;
  socks: string;
};

const teamPalette: Record<'A' | 'B', Palette> = {
  A: { primary: '#1f9c5e', secondary: '#0f3d24', skin: '#f0c8a4', shoes: '#1e1e1e', socks: '#f7faf6' },
  B: { primary: '#d24a36', secondary: '#5a1f15', skin: '#dca176', shoes: '#171717', socks: '#f7faf6' },
};

export const Player = ({ player, team, basePosition, latestRally, facing, playbackSpeed = 1 }: PlayerProps) => {
  const rootRef = useRef<Group>(null);
  const torsoRef = useRef<Group>(null);
  const animation = usePlayerAnimation({ player, team, latestRally, playbackSpeed });
  const palette = teamPalette[team];

  const initials = useMemo(
    () =>
      player.name
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join(''),
    [player.name],
  );

  useFrame(({ clock }) => {
    if (!rootRef.current || !torsoRef.current) {
      return;
    }
    const frame = animation.current;
    const breath = Math.sin(clock.elapsedTime * (frame.emphasis > 0.6 ? 9 : 1.5)) * frame.bobAmount;
    rootRef.current.position.y = breath;
    rootRef.current.rotation.y = facing > 0 ? frame.bodyTwist * 0.5 : Math.PI - frame.bodyTwist * 0.5;
    torsoRef.current.rotation.x = frame.bodyTilt;
    torsoRef.current.rotation.z = frame.bodyTwist * 0.3;
  });

  return (
    <group position={basePosition}>
      <group ref={rootRef}>
        <group ref={torsoRef}>
          <Body palette={palette} state={animation.current.state} />
          <Head palette={palette} initials={initials} />
          <Arm side="left" palette={palette} animation={animation} />
          <Arm side="right" palette={palette} animation={animation} hasRacket />
        </group>
        <Legs palette={palette} animation={animation} />
      </group>
      <ContactShadow active={animation.current.emphasis > 0.6} />
    </group>
  );
};

const Body = ({ palette, state }: { palette: Palette; state: PlayerAnimationState }) => {
  const accentColor =
    state === 'celebrating' ? '#ffd76a' : state === 'dejected' ? '#3a3a3a' : palette.secondary;
  return (
    <group>
      <mesh castShadow position={[0, 0.92, 0]}>
        <capsuleGeometry args={[0.18, 0.34, 6, 12]} />
        <meshStandardMaterial color={palette.primary} roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh castShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[0.42, 0.18, 0.22]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.95, -0.15]}>
        <planeGeometry args={[0.18, 0.18]} />
        <meshStandardMaterial color={palette.secondary} roughness={0.5} />
      </mesh>
    </group>
  );
};

const Head = ({ palette, initials: _initials }: { palette: Palette; initials: string }) => (
  <group position={[0, 1.34, 0]}>
    <mesh castShadow>
      <sphereGeometry args={[0.16, 18, 18]} />
      <meshStandardMaterial color={palette.skin} roughness={0.55} />
    </mesh>
    <mesh castShadow position={[0, 0.06, 0]}>
      <cylinderGeometry args={[0.165, 0.165, 0.12, 16, 1, true]} />
      <meshStandardMaterial color={palette.primary} roughness={0.55} />
    </mesh>
    <mesh castShadow position={[0, 0.13, 0]}>
      <cylinderGeometry args={[0.165, 0.165, 0.01, 16]} />
      <meshStandardMaterial color={palette.primary} roughness={0.55} />
    </mesh>
    <mesh castShadow position={[0, 0.05, 0.15]} rotation={[Math.PI / 2.6, 0, 0]}>
      <boxGeometry args={[0.28, 0.02, 0.18]} />
      <meshStandardMaterial color={palette.secondary} roughness={0.55} />
    </mesh>
    <mesh position={[-0.05, -0.01, 0.15]}>
      <sphereGeometry args={[0.014, 8, 8]} />
      <meshStandardMaterial color="#0a0a0a" />
    </mesh>
    <mesh position={[0.05, -0.01, 0.15]}>
      <sphereGeometry args={[0.014, 8, 8]} />
      <meshStandardMaterial color="#0a0a0a" />
    </mesh>
  </group>
);

const Arm = ({
  side,
  palette,
  animation,
  hasRacket = false,
}: {
  side: 'left' | 'right';
  palette: Palette;
  animation: ReturnType<typeof usePlayerAnimation>;
  hasRacket?: boolean;
}) => {
  const ref = useRef<Group>(null);
  const x = side === 'right' ? 0.24 : -0.24;
  useFrame(() => {
    if (!ref.current) {
      return;
    }
    const { state, swingProgress } = animation.current;
    const baseSwing = 0.25;
    let target = baseSwing;

    if (hasRacket) {
      switch (state) {
        case 'serving':
          target = -2.0 + swingProgress * 3.2;
          break;
        case 'smashing':
          target = -1.5 + swingProgress * 2.8;
          break;
        case 'hittingForehand':
          target = 0.4 - swingProgress * 0.8;
          break;
        case 'hittingBackhand':
          target = -0.4 + swingProgress * 0.8;
          break;
        case 'lobbing':
          target = 0.2 - swingProgress * 0.6;
          break;
        case 'celebrating':
          target = -1.6;
          break;
        default:
          target = baseSwing;
      }
    } else {
      target = baseSwing + Math.sin(swingProgress * Math.PI) * 0.2;
    }
    ref.current.rotation.x = ref.current.rotation.x * 0.65 + target * 0.35;
  });

  return (
    <group ref={ref} position={[x, 1.05, 0]}>
      <mesh castShadow position={[0, -0.18, 0]}>
        <capsuleGeometry args={[0.06, 0.32, 4, 8]} />
        <meshStandardMaterial color={palette.skin} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, -0.42, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color={palette.skin} roughness={0.55} />
      </mesh>
      {hasRacket ? <Racket palette={palette} /> : null}
    </group>
  );
};

const Racket = ({ palette }: { palette: Palette }) => (
  <group position={[0, -0.55, 0.05]}>
    <mesh castShadow>
      <cylinderGeometry args={[0.018, 0.018, 0.18, 10]} />
      <meshStandardMaterial color="#15191a" roughness={0.7} />
    </mesh>
    <mesh castShadow position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.13, 0.02, 8, 24]} />
      <meshStandardMaterial color={palette.primary} roughness={0.4} metalness={0.4} />
    </mesh>
    <mesh position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.12, 24]} />
      <meshStandardMaterial color={palette.secondary} roughness={0.85} transparent opacity={0.45} />
    </mesh>
  </group>
);

const Legs = ({ palette, animation }: { palette: Palette; animation: ReturnType<typeof usePlayerAnimation> }) => {
  const leftRef = useRef<Group>(null);
  const rightRef = useRef<Group>(null);

  useFrame(() => {
    if (!leftRef.current || !rightRef.current) {
      return;
    }
    const { state, legSpread, swingProgress } = animation.current;
    const oscillation = state === 'moving' ? Math.sin(swingProgress * Math.PI * 4) * 0.2 : 0;
    leftRef.current.position.z = -legSpread + oscillation;
    rightRef.current.position.z = legSpread - oscillation;
  });

  return (
    <group position={[0, 0.4, 0]}>
      <group ref={leftRef}>
        <Leg side="left" palette={palette} />
      </group>
      <group ref={rightRef}>
        <Leg side="right" palette={palette} />
      </group>
    </group>
  );
};

const Leg = ({ side, palette }: { side: 'left' | 'right'; palette: Palette }) => {
  const x = side === 'left' ? -0.1 : 0.1;
  return (
    <group position={[x, 0, 0]}>
      <mesh castShadow position={[0, -0.18, 0]}>
        <capsuleGeometry args={[0.075, 0.32, 4, 8]} />
        <meshStandardMaterial color="#1d2926" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, -0.45, 0]}>
        <boxGeometry args={[0.16, 0.02, 0.06]} />
        <meshStandardMaterial color={palette.socks} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, -0.49, 0.04]}>
        <boxGeometry args={[0.18, 0.06, 0.18]} />
        <meshStandardMaterial color={palette.shoes} roughness={0.45} />
      </mesh>
    </group>
  );
};

const ContactShadow = ({ active }: { active: boolean }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
    <circleGeometry args={[active ? 0.42 : 0.32, 24]} />
    <meshBasicMaterial color="#000000" transparent opacity={active ? 0.35 : 0.22} />
  </mesh>
);
