import { useMemo } from 'react';
import { DoubleSide } from 'three';

type CrowdSegment = {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
};

const baseColors = ['#0f3924', '#1a5237', '#2c6748', '#152e22', '#214a36'];

const seededColor = (seed: number) => baseColors[seed % baseColors.length];

export const Stadium = () => {
  const crowdRows: CrowdSegment[] = useMemo(() => {
    const segments: CrowdSegment[] = [];
    // Long sides (near and far)
    [-1, 1].forEach((zSign) => {
      for (let row = 0; row < 4; row += 1) {
        segments.push({
          position: [0, 1 + row * 1.6, zSign * (12 + row * 1.4)],
          rotation: [0, 0, 0],
          size: [16 + row * 2, 1.6, 0.6],
        });
      }
    });
    // Short sides (left, right)
    [-1, 1].forEach((xSign) => {
      for (let row = 0; row < 3; row += 1) {
        segments.push({
          position: [xSign * (7 + row * 1.4), 1 + row * 1.6, 0],
          rotation: [0, Math.PI / 2, 0],
          size: [10 + row * 2, 1.6, 0.6],
        });
      }
    });
    return segments;
  }, []);

  const crowdDots = useMemo(
    () =>
      crowdRows.flatMap((seg, segIndex) => {
        const count = Math.round(seg.size[0] * 1.4);
        return Array.from({ length: count }, (_, i) => ({
          key: `${segIndex}-${i}`,
          x: seg.position[0] + (i / count - 0.5) * seg.size[0] * Math.cos(seg.rotation[1]),
          z: seg.position[2] + (i / count - 0.5) * seg.size[0] * Math.sin(seg.rotation[1]),
          y: seg.position[1] + Math.random() * 0.2,
          color: seededColor(segIndex * 37 + i),
        }));
      }),
    [crowdRows],
  );

  return (
    <group>
      {/* Sol stade autour du court */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <ringGeometry args={[7, 30, 48]} />
        <meshStandardMaterial color="#0a1410" roughness={0.95} side={DoubleSide} />
      </mesh>

      {/* Gradins simplifies (boites en escalier) */}
      {crowdRows.map((seg, index) => (
        <mesh
          key={`row-${index}`}
          position={seg.position}
          rotation={seg.rotation}
          castShadow={false}
          receiveShadow
        >
          <boxGeometry args={seg.size} />
          <meshStandardMaterial color="#0d1d18" roughness={0.9} />
        </mesh>
      ))}

      {/* Petits cubes de "foule" sur les gradins */}
      {crowdDots.map((dot) => (
        <mesh key={dot.key} position={[dot.x, dot.y, dot.z]}>
          <boxGeometry args={[0.22, 0.4, 0.22]} />
          <meshStandardMaterial color={dot.color} roughness={0.85} />
        </mesh>
      ))}

      {/* Mat d'eclairage corners */}
      {[
        [-12, 0, -14],
        [12, 0, -14],
        [-12, 0, 14],
        [12, 0, 14],
      ].map(([x, , z]) => (
        <group key={`pylon-${x}-${z}`} position={[x, 0, z]}>
          <mesh castShadow position={[0, 4, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 8, 8]} />
            <meshStandardMaterial color="#1a1f1d" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 8.1, 0]}>
            <boxGeometry args={[0.7, 0.18, 0.5]} />
            <meshStandardMaterial color="#222826" />
          </mesh>
          <mesh position={[0, 8.1, 0]}>
            <boxGeometry args={[0.6, 0.08, 0.4]} />
            <meshStandardMaterial color="#fcfcd8" emissive="#fffbb8" emissiveIntensity={1.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
