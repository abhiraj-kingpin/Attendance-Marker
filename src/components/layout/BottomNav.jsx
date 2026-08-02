import { motion } from 'framer-motion';
import { TABS } from '../../lib/tabs';

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 safe-bottom">
      <div className="mx-auto max-w-lg px-2 pb-2 pt-1">
        <div className="flex items-stretch justify-between bg-space-850/90 backdrop-blur-xl rounded-3xl shadow-pop border border-white/10 px-1 py-1">
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className="relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl min-h-[52px] active:scale-95 transition-transform"
                aria-label={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="navPill"
                    className="absolute inset-0 bg-nova-500/20 border border-nova-400/40 rounded-2xl shadow-glow-nova"
                    transition={{ type: 'spring', duration: 0.5, bounce: 0.25 }}
                  />
                )}
                <motion.span
                  className="relative z-10"
                  animate={isActive ? { y: -2, scale: 1.08 } : { y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-nova-300' : 'text-ink-500'}
                  />
                </motion.span>
                <span
                  className={`relative z-10 text-[10px] font-bold ${
                    isActive ? 'text-nova-200' : 'text-ink-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
