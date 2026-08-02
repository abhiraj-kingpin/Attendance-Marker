import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useParallaxTarget } from '../../lib/useParallaxTarget';

export default function StarfieldScene({ reducedMotion = false }) {
  const groupRef = useRef(null);
  const parallax = useParallaxTarget();

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (!reducedMotion) {
      group.rotation.y += delta * 0.01;
      group.rotation.x += delta * 0.003;
    }

    const targetX = reducedMotion ? 0 : parallax.current.y * 0.08;
    const targetY = reducedMotion ? 0 : parallax.current.x * 0.1;
    group.rotation.x += (targetX - group.rotation.x) * Math.min(1, delta * 1.5);
    group.rotation.y += (targetY - group.rotation.y) * Math.min(1, delta * 1.5);
  });

  return (
    <group ref={groupRef}>
      {/* distant, dense, faint layer */}
      <Stars radius={110} depth={70} count={reducedMotion ? 600 : 1400} factor={2.6} saturation={0.15} fade speed={reducedMotion ? 0 : 0.35} />
      {/* nearer, sparser, brighter layer for depth */}
      <Stars radius={55} depth={35} count={reducedMotion ? 150 : 350} factor={4.5} saturation={0.25} fade speed={reducedMotion ? 0 : 0.6} />
    </group>
  );
}
