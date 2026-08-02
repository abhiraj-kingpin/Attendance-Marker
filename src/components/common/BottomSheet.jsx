import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function BottomSheet({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-space-950/70 backdrop-blur-[2px] z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-0 right-0 bottom-0 z-50 mx-auto w-full max-w-lg"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="rounded-t-3xl bg-space-850/95 backdrop-blur-xl border-t border-x border-white/12 shadow-pop max-h-[85dvh] overflow-y-auto safe-bottom">
              <div className="sticky top-0 bg-space-850/95 backdrop-blur-xl flex items-center justify-between px-5 pt-4 pb-2 border-b border-white/10 rounded-t-3xl">
                <h3 className="font-display text-lg text-ink-50">{title}</h3>
                <button
                  onClick={onClose}
                  className="w-11 h-11 grid place-items-center rounded-full bg-white/8 text-ink-200 active:scale-90 transition-transform"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-5 py-4">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
