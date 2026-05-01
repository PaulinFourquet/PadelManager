import { useMemo, type ReactNode } from 'react';
import { DoubleSide } from 'three';

const courtColor = '#2a6f4a';
const courtAccent = '#1d5236';
const lineColor = '#ecf6ee';
const fenceColor = '#1c2620';
const glassColor = '#bce0e8';

const Lines = () => {
  const elements: ReactNode[] = [];
  // Baselines (court ends)
  elements.push(<LineBox key="baseline-near" position={[0, 0.011, -9.95]} scale={[10, 0.04, 0.05]} />);
  elements.push(<LineBox key="baseline-far" position={[0, 0.011, 9.95]} scale={[10, 0.04, 0.05]} />);
  // Sidelines
  elements.push(<LineBox key="side-left" position={[-4.95, 0.011, 0]} scale={[0.05, 0.04, 20]} />);
  elements.push(<LineBox key="side-right" position={[4.95, 0.011, 0]} scale={[0.05, 0.04, 20]} />);
  // Service lines (3m from net)
  elements.push(<LineBox key="service-near" position={[0, 0.011, -3]} scale={[10, 0.04, 0.05]} />);
  elements.push(<LineBox key="service-far" position={[0, 0.011, 3]} scale={[10, 0.04, 0.05]} />);
  // Center line (between service lines)
  elements.push(<LineBox key="center" position={[0, 0.011, 0]} scale={[0.05, 0.04, 6]} />);
  return <group position={[0, 0, 0]}>{elements}</group>;
};

const LineBox = ({ position, scale }: { position: [number, number, number]; scale: [number, number, number] }) => (
  <mesh position={position} scale={scale} receiveShadow>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color={lineColor} roughness={0.4} metalness={0.05} emissive={lineColor} emissiveIntensity={0.08} />
  </mesh>
);

const Surface = () => (
  <group>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[10, 20]} />
      <meshStandardMaterial color={courtColor} roughness={0.92} metalness={0} />
    </mesh>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
      <planeGeometry args={[10, 20, 8, 16]} />
      <meshStandardMaterial color={courtAccent} roughness={0.95} transparent opacity={0.18} wireframe />
    </mesh>
  </group>
);

const Net = () => {
  const wires = useMemo(() => {
    const horizontal = Array.from({ length: 12 }, (_, index) => index / 12);
    const vertical = Array.from({ length: 36 }, (_, index) => -5 + (index / 35) * 10);
    return { horizontal, vertical };
  }, []);

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[-5.05, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.95, 12]} />
        <meshStandardMaterial color="#e9ecec" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[5.05, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.95, 12]} />
        <meshStandardMaterial color="#e9ecec" metalness={0.7} roughness={0.25} />
      </mesh>

      <mesh position={[0, 0.88, 0]} castShadow>
        <boxGeometry args={[10.1, 0.04, 0.04]} />
        <meshStandardMaterial color="#f7f8f8" />
      </mesh>
      <mesh position={[0, 0.005, 0]} receiveShadow>
        <boxGeometry args={[10.05, 0.012, 0.06]} />
        <meshStandardMaterial color="#f0f3f3" />
      </mesh>

      <group position={[0, 0.45, 0]}>
        {wires.horizontal.map((ratio) => (
          <mesh key={`h-${ratio}`} position={[0, ratio * 0.85 - 0.42, 0]}>
            <boxGeometry args={[10, 0.01, 0.01]} />
            <meshStandardMaterial color="#1c2922" transparent opacity={0.55} />
          </mesh>
        ))}
        {wires.vertical.map((x) => (
          <mesh key={`v-${x.toFixed(3)}`} position={[x, 0, 0]}>
            <boxGeometry args={[0.01, 0.85, 0.01]} />
            <meshStandardMaterial color="#1c2922" transparent opacity={0.55} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const GlassWalls = () => {
  const walls: Array<[number, number, number, number, number, number]> = [
    [0, 1.5, -10.05, 10.2, 3, 0.1],
    [0, 1.5, 10.05, 10.2, 3, 0.1],
    [-5.05, 1.5, -7.5, 0.1, 3, 5.1],
    [5.05, 1.5, -7.5, 0.1, 3, 5.1],
    [-5.05, 1.5, 7.5, 0.1, 3, 5.1],
    [5.05, 1.5, 7.5, 0.1, 3, 5.1],
  ];
  return (
    <group>
      {walls.map((wall) => {
        const [x, y, z, w, h, d] = wall;
        return (
          <mesh key={`${x}-${z}-${w}`} position={[x, y, z]} castShadow={false} receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshPhysicalMaterial
              color={glassColor}
              transparent
              opacity={0.18}
              roughness={0.05}
              metalness={0.1}
              transmission={0.8}
              thickness={0.05}
              ior={1.45}
              side={DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const Fence = () => {
  const segments = Array.from({ length: 18 }, (_, index) => index);
  return (
    <group>
      {segments.map((index) => {
        const x = -5.05 + (index / 17) * 10.1;
        return (
          <mesh key={`fence-vertical-${index}`} position={[x, 4, -10.05]}>
            <cylinderGeometry args={[0.012, 0.012, 1.6, 6]} />
            <meshStandardMaterial color={fenceColor} />
          </mesh>
        );
      })}
      {segments.map((index) => {
        const x = -5.05 + (index / 17) * 10.1;
        return (
          <mesh key={`fence-vertical-far-${index}`} position={[x, 4, 10.05]}>
            <cylinderGeometry args={[0.012, 0.012, 1.6, 6]} />
            <meshStandardMaterial color={fenceColor} />
          </mesh>
        );
      })}
      {[-10.05, 10.05].map((z) => (
        <mesh key={`fence-top-${z}`} position={[0, 4.7, z]}>
          <boxGeometry args={[10.2, 0.04, 0.04]} />
          <meshStandardMaterial color={fenceColor} />
        </mesh>
      ))}
      {[-10.05, 10.05].map((z) => (
        <mesh key={`fence-mid-${z}`} position={[0, 3.3, z]}>
          <boxGeometry args={[10.2, 0.04, 0.04]} />
          <meshStandardMaterial color={fenceColor} />
        </mesh>
      ))}
    </group>
  );
};

const Frame = () => (
  <group>
    {[
      [-5.1, 1.5, -10.1],
      [5.1, 1.5, -10.1],
      [-5.1, 1.5, 10.1],
      [5.1, 1.5, 10.1],
    ].map(([x, y, z]) => (
      <mesh key={`pillar-${x}-${z}`} position={[x, y, z]} castShadow>
        <boxGeometry args={[0.16, 4.2, 0.16]} />
        <meshStandardMaterial color="#16201b" metalness={0.65} roughness={0.35} />
      </mesh>
    ))}
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <ringGeometry args={[14, 22, 64]} />
      <meshStandardMaterial color="#0d1714" roughness={0.95} side={DoubleSide} />
    </mesh>
  </group>
);

export const Court = () => (
  <group>
    <Surface />
    <Lines />
    <Net />
    <GlassWalls />
    <Fence />
    <Frame />
  </group>
);
