import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let seq = 0;

export default function ShootingStars({ reducedMotion = false }) {
  const [stars, setStars] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return undefined;

    function scheduleNext() {
      const delay = 5000 + Math.random() * 9000;
      timerRef.current = setTimeout(() => {
        const id = ++seq;
        const startX = 10 + Math.random() * 60;
        const startY = 5 + Math.random() * 30;
        const travel = 180 + Math.random() * 140;
        const angle = 28 + Math.random() * 12;
        setStars((s) => [...s, { id, startX, startY, travel, angle }]);
        scheduleNext();
      }, delay);
    }

    scheduleNext();
    return () => clearTimeout(timerRef.current);
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute h-px w-24"
            style={{
              top: `${star.startY}%`,
              left: `${star.startX}%`,
              background: 'linear-gradient(90deg, transparent, #E8F3FF 60%, #FFFFFF)',
              transform: `rotate(${star.angle}deg)`,
              borderRadius: 999,
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: star.travel * Math.cos((star.angle * Math.PI) / 180),
              y: star.travel * Math.sin((star.angle * Math.PI) / 180),
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: 1.1, ease: 'easeIn' }}
            onAnimationComplete={() => setStars((s) => s.filter((x) => x.id !== star.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
