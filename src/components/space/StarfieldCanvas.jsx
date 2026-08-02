import { Canvas } from '@react-three/fiber';
import StarfieldScene from './StarfieldScene';

export default function StarfieldCanvas({ reducedMotion }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 1], fov: 75 }}
      style={{ position: 'absolute', inset: 0 }}
      className="!absolute !inset-0"
    >
      <StarfieldScene reducedMotion={reducedMotion} />
    </Canvas>
  );
}
