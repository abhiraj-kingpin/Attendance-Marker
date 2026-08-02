import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center gap-2 py-10 px-6"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full glass-panel grid place-items-center mb-1 shadow-glow-nova">
          <Icon size={28} className="text-nova-300" />
        </div>
      )}
      <p className="font-display text-lg text-ink-100">{title}</p>
      {subtitle && <p className="text-sm text-ink-400 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
}
