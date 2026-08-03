import { motion } from 'framer-motion';

const emphasizedEasing = [0.2, 0, 0, 1];

export default function Splash() {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-surface flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: emphasizedEasing }}
    >
      <motion.img
        src="/logo.png"
        alt="Attendance Marker"
        width={112}
        height={112}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: emphasizedEasing }}
      />
    </motion.div>
  );
}
