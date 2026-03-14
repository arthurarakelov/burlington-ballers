import { useState, useEffect, useCallback, useRef } from 'react';

export const useMouseTracking = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const latestPos = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    latestPos.current = { x: e.clientX, y: e.clientY };
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        setMousePosition(latestPos.current);
        rafRef.current = null;
      });
    }
  }, []);

  useEffect(() => {
    // Skip mouse tracking on touch-only devices
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return mousePosition;
};
