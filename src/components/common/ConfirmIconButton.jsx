import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Check } from 'lucide-react';

export default function ConfirmIconButton({ onConfirm, className = '', size = 16 }) {
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
      whileTap={{ scale: 0.88 }}
      layout
      className={`inline-flex items-center justify-center rounded-full transition-colors min-w-11 min-h-11 px-2 ${
        confirming ? 'bg-flare-500/90 text-white' : 'bg-white/8 text-ink-400'
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {confirming ? (
          <motion.span
            key="confirm"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="flex items-center gap-1 px-2 text-xs font-bold whitespace-nowrap"
          >
            <Check size={size} /> Sure?
          </motion.span>
        ) : (
          <motion.span
            key="trash"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="flex items-center justify-center"
          >
            <Trash2 size={size} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
