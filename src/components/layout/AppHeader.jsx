import { motion } from 'framer-motion';

export default function AppHeader({ title, subtitle, right }) {
  return (
    <header className="sticky top-0 z-20 safe-top">
      <div className="mx-auto max-w-lg px-5 pt-5 pb-3 bg-gradient-to-b from-space-950/85 to-space-950/0 backdrop-blur-sm">
        <div className="flex items-end justify-between gap-3">
          <div>
            <motion.h1
              key={title}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-display text-2xl text-ink-50 leading-tight"
            >
              {title}
            </motion.h1>
            {subtitle && <p className="text-sm text-ink-400 font-semibold mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </div>
      </div>
    </header>
  );
}
