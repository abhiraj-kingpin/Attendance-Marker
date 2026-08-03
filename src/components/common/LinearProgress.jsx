import { motion } from 'framer-motion';

/** Material 3 linear determinate progress indicator — rounded track + rounded indicator bar. */
export default function LinearProgress({ value, color = '#4285F4', height = 8, trackClassName = '' }) {
  const clamped = Math.max(0, Math.min(100, value || 0));
  return (
    <div
      className={`w-full rounded-full overflow-hidden ${trackClassName || 'bg-surface-variant-2'}`}
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
      />
    </div>
  );
}
