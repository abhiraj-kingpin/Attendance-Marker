import { motion } from 'framer-motion';

export default function SegmentedTabs({ options, value, onChange, layoutId }) {
  return (
    <div className="flex gap-1 bg-white/6 border border-white/10 rounded-2xl p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative flex-1 py-2.5 px-2 rounded-xl text-sm font-bold transition-colors min-h-11 ${
              active ? 'text-ink-50' : 'text-ink-400'
            }`}
          >
            {active && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-nova-500/25 border border-nova-400/50 rounded-xl shadow-glow-nova"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
