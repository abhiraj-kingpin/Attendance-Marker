import { useEffect, useRef } from 'react';

/**
 * Tracks a normalized (-1..1) parallax target from pointer movement and, on
 * devices that expose it, gyroscope tilt — read every frame by the 3D scene.
 * Listens at the window level so it works even though the canvas itself is
 * pointer-events:none (clicks must pass through to the real UI).
 */
export function useParallaxTarget() {
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function onPointerMove(e) {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }

    function onOrientation(e) {
      if (e.gamma === null || e.beta === null) return;
      target.current.x = Math.max(-1, Math.min(1, e.gamma / 30));
      target.current.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('deviceorientation', onOrientation, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, []);

  return target;
}
