import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion';

/** Circular "orbit ring" progress — a glowing arc around an optional center slot (e.g. a Planet avatar). */
export function OrbitRing({ value, size = 64, strokeWidth = 5, color = '#8B5CF6', trackColor = 'rgba(255,255,255,0.1)', children }) {
  const reducedMotion = usePrefersReducedMotion();
  const clamped = Math.max(0, Math.min(100, value || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ filter: `drop-shadow(0 0 ${strokeWidth}px ${color})` }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', damping: 20, stiffness: 60 }}
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  );
}

/** Linear "comet trail" bar — a glowing head races the fill edge as it grows. */
export function CometBar({ value, color = '#22D3EE', height = 10, trackClassName = '' }) {
  const reducedMotion = usePrefersReducedMotion();
  const clamped = Math.max(0, Math.min(100, value || 0));

  return (
    <div
      className={`relative w-full rounded-full overflow-hidden ${trackClassName || 'bg-white/10'}`}
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full relative"
        style={{ background: `linear-gradient(90deg, transparent, ${color})` }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', damping: 22, stiffness: 90 }}
      >
        {clamped > 2 && (
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: height * 1.8,
              height: height * 1.8,
              right: -height * 0.4,
              background: color,
              boxShadow: `0 0 ${height * 1.6}px ${height * 0.5}px ${color}`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
