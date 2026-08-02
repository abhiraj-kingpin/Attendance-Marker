import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion';

/**
 * A small shaded "planet" avatar standing in for a subject's flat color dot
 * — a radial-gradient sphere with an optional tilted ring, slow rotating
 * highlight, and a soft glow matching the subject's palette entry.
 */
export default function Planet({ color, size = 28, ring, label, spin = true, className = '' }) {
  const reducedMotion = usePrefersReducedMotion();
  const showRing = ring ?? size >= 26;
  const active = spin && !reducedMotion;

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      {showRing && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 1.95,
            height: size * 0.6,
            left: size * -0.475,
            top: size * 0.2,
            border: `${Math.max(1, size * 0.045)}px solid ${color.text}`,
            opacity: 0.5,
            transform: 'rotate(-16deg)',
            boxShadow: `0 0 ${size * 0.3}px ${color.glow}`,
          }}
        />
      )}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 32% 26%, color-mix(in srgb, ${color.strong} 45%, white) 0%, ${color.strong} 45%, color-mix(in srgb, ${color.strong} 65%, black) 100%)`,
          boxShadow: `0 0 ${size * 0.55}px ${color.glow}, inset -${size * 0.08}px -${size * 0.08}px ${size * 0.22}px rgba(0,0,0,0.4)`,
        }}
        animate={active ? { rotate: 360 } : {}}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />
      {label !== undefined && (
        <span
          className="absolute inset-0 grid place-items-center font-display font-bold"
          style={{ fontSize: size * 0.4, color: 'rgba(10,9,32,0.75)' }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
