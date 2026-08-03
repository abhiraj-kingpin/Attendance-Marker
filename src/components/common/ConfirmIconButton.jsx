import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { ICONS } from '../../lib/icons';

export default function ConfirmIconButton({ onConfirm, className = '', size = 18 }) {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function handleClick(e) {
    e.stopPropagation();
    if (confirming) {
      clearTimeout(timerRef.current);
      setConfirming(false);
      onConfirm();
    } else {
      setConfirming(true);
      timerRef.current = setTimeout(() => setConfirming(false), 2500);
    }
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.92 }}
      layout
      className={`relative inline-flex items-center justify-center rounded-full transition-colors min-w-11 min-h-11 px-2 ${
        confirming ? 'bg-g-red-container text-g-red-dark' : 'text-on-surface-tertiary hover:bg-surface-variant-2'
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {confirming ? (
          <motion.span
            key="confirm"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="flex items-center gap-1 px-2 text-xs font-medium whitespace-nowrap"
          >
            <Icon svg={ICONS.check} size={size} /> Sure?
          </motion.span>
        ) : (
          <motion.span
            key="trash"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="flex items-center justify-center"
          >
            <Icon svg={ICONS.delete} size={size} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
