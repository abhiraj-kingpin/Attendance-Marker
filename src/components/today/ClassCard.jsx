import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Ban } from 'lucide-react';
import { colorForSubject } from '../../lib/colors';
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion';
import Planet from '../space/Planet';

const OPTIONS = [
  { status: 'present', label: 'Present', icon: Check, glow: '#34D399' },
  { status: 'absent', label: 'Absent', icon: X, glow: '#FB7185' },
  { status: 'noclass', label: 'No class', icon: Ban, glow: '#9C94C9' },
];

function Burst({ burstId, color }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 18 + Math.random() * 16;
        return { id: i, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- burstId intentionally re-triggers fresh random particles
    [burstId]
  );
  return (
    <div className="absolute inset-0 pointer-events-none grid place-items-center overflow-visible">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function ClassCard({ index, subject, status, onSetStatus, disabled }) {
  const color = colorForSubject(subject);
  const reducedMotion = usePrefersReducedMotion();
  const [burst, setBurst] = useState(null);

  function handleSetStatus(opt) {
    onSetStatus(opt.status);
    if (!reducedMotion) setBurst({ id: Date.now(), status: opt.status, glow: opt.glow });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-3xl glass-panel shadow-pop-sm p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <Planet color={color} size={36} label={index + 1} />
        <div className="min-w-0">
          <p className="font-bold text-ink-50 truncate">{subject?.name || 'Unknown subject'}</p>
          <p className="text-xs text-ink-400 font-semibold">Period {index + 1}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {OPTIONS.map((opt) => {
          const active = status === opt.status;
          const Icon = opt.icon;
          return (
            <motion.button
              key={opt.status}
              disabled={disabled}
              whileTap={disabled ? {} : { scale: 0.9 }}
              animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={{ duration: 0.32 }}
              onClick={() => handleSetStatus(opt)}
              className={`relative flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border font-bold text-xs transition-colors disabled:opacity-40 min-h-11 ${
                active ? statusClasses[opt.status] : 'bg-white/5 border-white/10 text-ink-400'
              }`}
              style={active ? { boxShadow: `0 0 18px ${opt.glow}55` } : undefined}
            >
              <Icon size={17} strokeWidth={2.5} />
              {opt.label}
              <AnimatePresence>
                {burst?.status === opt.status && (
                  <Burst key={burst.id} burstId={burst.id} color={burst.glow} />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

const statusClasses = {
  present: 'bg-aurora-500/15 border-aurora-400/60 text-aurora-400',
  absent: 'bg-flare-500/15 border-flare-400/60 text-flare-400',
  noclass: 'bg-white/10 border-white/25 text-ink-200',
};
