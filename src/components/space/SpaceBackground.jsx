import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import ShootingStars from './ShootingStars';
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion';

const StarfieldCanvas = lazy(() => import('./StarfieldCanvas'));

function NebulaBlob({ className, style, duration = 30, delay = 0, reducedMotion }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      style={style}
      animate={
        reducedMotion
          ? {}
          : {
              x: [0, 30, -20, 0],
              y: [0, -20, 15, 0],
              opacity: [0.55, 0.8, 0.6, 0.55],
            }
      }
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export default function SpaceBackground() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="fixed inset-0 -z-30 overflow-hidden bg-[#0A0A1A]">
      {/* base deep-space gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1B1140_0%,_#0B0B23_45%,_#050510_100%)]" />

      {/* nebula glow layers */}
      <NebulaBlob
        className="opacity-60"
        style={{ width: 420, height: 420, top: '-8%', left: '-15%', background: '#5B2A9E' }}
        duration={26}
        reducedMotion={reducedMotion}
      />
      <NebulaBlob
        className="opacity-50"
        style={{ width: 380, height: 380, top: '35%', right: '-18%', background: '#1E4FA0' }}
        duration={32}
        delay={2}
        reducedMotion={reducedMotion}
      />
      <NebulaBlob
        className="opacity-40"
        style={{ width: 320, height: 320, bottom: '-12%', left: '20%', background: '#B3457A' }}
        duration={38}
        delay={4}
        reducedMotion={reducedMotion}
      />
      <NebulaBlob
        className="opacity-30"
        style={{ width: 260, height: 260, top: '10%', right: '10%', background: '#E08A3C' }}
        duration={40}
        delay={6}
        reducedMotion={reducedMotion}
      />

      {/* real 3D starfield — code-split so the UI is interactive before three.js downloads */}
      <Suspense fallback={null}>
        <StarfieldCanvas reducedMotion={reducedMotion} />
      </Suspense>

      <ShootingStars reducedMotion={reducedMotion} />

      {/* soft vignette so foreground glass cards stay legible */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(5,5,16,0.55)_100%)]" />
    </div>
  );
}
