import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon';
import { ICONS } from '../../lib/icons';

/**
 * Portaled to document.body for the same reason as Fab: the per-tab
 * animated wrapper in App.jsx has a CSS transform, which would otherwise
 * make `fixed` here anchor to that wrapper's content box instead of the
 * real viewport.
 */
export default function BottomSheet({ open, onClose, title, children }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="relative mx-auto h-full max-w-lg">
              <motion.div
                className="pointer-events-auto absolute left-0 right-0 bottom-0"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
              >
                <div className="rounded-t-[28px] bg-surface shadow-elevation-3 max-h-[85dvh] overflow-y-auto safe-bottom">
                  <div className="sticky top-0 bg-surface flex flex-col items-center pt-2.5 pb-1 rounded-t-[28px]">
                    <span className="w-8 h-1 rounded-full bg-outline" />
                  </div>
                  <div className="sticky top-3 bg-surface flex items-center justify-between px-5 pt-1 pb-3">
                    <h3 className="font-display font-medium text-lg text-on-surface">{title}</h3>
                    <button
                      onClick={onClose}
                      className="relative w-11 h-11 grid place-items-center rounded-full text-on-surface-secondary active:bg-surface-variant-2 transition-colors"
                      aria-label="Close"
                    >
                      <Icon svg={ICONS.close} size={20} />
                    </button>
                  </div>
                  <div className="px-5 pb-4">{children}</div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
