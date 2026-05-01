export const Lighting = () => (
  <group>
    <color attach="background" args={['#070d0a']} />
    <ambientLight intensity={0.32} color="#9bb6ad" />
    <hemisphereLight args={['#a9c0b6', '#0a1612', 0.45]} />

    <directionalLight
      position={[8, 12, -10]}
      intensity={1.4}
      color="#fff5d6"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-far={40}
      shadow-camera-left={-15}
      shadow-camera-right={15}
      shadow-camera-top={15}
      shadow-camera-bottom={-15}
      shadow-bias={-0.0001}
    />
    <directionalLight position={[-8, 12, -10]} intensity={1.0} color="#d8e8ff" />
    <directionalLight position={[8, 12, 10]} intensity={1.0} color="#fff2d8" />
    <directionalLight position={[-8, 12, 10]} intensity={1.0} color="#cfe2ff" />

    <pointLight position={[0, 6, 0]} intensity={0.7} color="#a8d8b8" distance={18} />

    <fog attach="fog" args={['#070d0a', 26, 56]} />
  </group>
);
