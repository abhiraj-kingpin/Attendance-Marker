import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import Icon from './Icon';

/**
 * Material 3 Floating Action Button — circular, elevated, bottom-right.
 * Portaled to document.body: Framer Motion's animated tab wrapper in App.jsx
 * sets a CSS transform, which turns it into a containing block for any
 * `position: fixed` descendant — without the portal the FAB would anchor to
 * that wrapper's (short) content box instead of the real viewport.
 */
export default function Fab({ icon, label, onClick, className = '' }) {
  return createPortal(
    <div className="gpu-layer fixed inset-0 z-30 pointer-events-none">
      <div className="relative mx-auto h-full max-w-lg">
        <motion.button
          onClick={onClick}
          aria-label={label}
          whileTap={{ scale: 0.94 }}
          className={`pointer-events-auto absolute bottom-24 right-5 flex items-center gap-2 bg-g-blue text-white rounded-full shadow-elevation-3 pl-4 pr-5 py-4 min-h-14 ${className}`}
        >
          <Icon svg={icon} size={24} />
          {label && <span className="font-medium text-sm whitespace-nowrap">{label}</span>}
        </motion.button>
      </div>
    </div>,
    document.body
  );
}
