/**
 * useCountUp.js — Animated number counter hook
 * Counts from 0 to a target value when triggered
 */
import { useState, useEffect, useRef } from 'react';

export function useCountUp({ to, duration = 1800, decimals = 0, startOnMount = false }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(startOnMount);
  const frameRef = useRef(null);

  const start = () => setStarted(true);

  useEffect(() => {
    if (!started) return;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * to).toFixed(decimals)));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [started, to, duration, decimals]);

  return { value, start };
}

export default useCountUp;
