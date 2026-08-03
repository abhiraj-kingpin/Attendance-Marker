import { motion } from 'framer-motion';

function Segment({ opt, active, onChange, layoutId }) {
  return (
    <button
      onClick={() => onChange(opt.value)}
      className={`relative flex-1 py-2.5 px-2 rounded-full text-sm font-medium transition-colors min-h-11 ${
        active ? 'text-white' : 'text-on-surface-tertiary'
      }`}
    >
      {active && (
        <motion.div
          layoutId={layoutId}
          className="absolute inset-0 bg-g-blue rounded-full"
          transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
        />
      )}
      <span className="relative z-10">{opt.label}</span>
    </button>
  );
}

export default function SegmentedTabs({ options, value, onChange, layoutId }) {
  return (
    <div className="flex gap-1 bg-surface-variant-2 rounded-full p-1">
      {options.map((opt) => (
        <Segment key={opt.value} opt={opt} active={opt.value === value} onChange={onChange} layoutId={layoutId} />
      ))}
    </div>
  );
}
