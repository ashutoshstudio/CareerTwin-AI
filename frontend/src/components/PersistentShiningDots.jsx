/**
 * PersistentShiningDots.jsx — Persistent Background Shining Dots & Glowing Particles
 * Fixed viewport background overlay that provides continuous shining, twinkling, and floating
 * ambient spots throughout the entire Home page while scrolling up and down.
 */

import { useMemo } from 'react';

const COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#059669', // Deep Emerald
  '#38bdf8', // Sky Blue
  '#6366f1', // Indigo Glow
  '#14b8a6', // Teal
];

export function PersistentShiningDots({ count = 55 }) {
  const dots = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 1.8 + (i % 4) * 0.9; // 1.8px to 4.5px
      const color = COLORS[i % COLORS.length];
      const left = ((i * 19.3 + (i % 7) * 11) % 98) + 1; // 1% to 99%
      const top = ((i * 23.7 + (i % 5) * 13) % 98) + 1; // 1% to 99%
      const twinkleDuration = 2.5 + (i % 6) * 0.8; // 2.5s to 6.5s
      const twinkleDelay = (i % 10) * 0.45; // 0s to 4.5s
      const floatDuration = 7 + (i % 5) * 2; // 7s to 15s

      return {
        id: i,
        left: `${left}%`,
        top: `${top}%`,
        size,
        color,
        twinkleDuration: `${twinkleDuration}s`,
        twinkleDelay: `${twinkleDelay}s`,
        floatDuration: `${floatDuration}s`,
        boxShadow: `0 0 ${size * 3}px ${color}, 0 0 ${size * 6}px ${color}`,
      };
    });
  }, [count]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Subtle Full-Page Matrix Grid Dots */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 1.2px, transparent 1.2px)',
          backgroundSize: '40px 40px',
          opacity: 0.8,
        }}
      />

      {/* Persistent Glowing & Twinkling Shining Spots */}
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="shining-dot"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.color,
            boxShadow: dot.boxShadow,
            animation: `starTwinkle ${dot.twinkleDuration} ease-in-out infinite ${dot.twinkleDelay}, starFloat ${dot.floatDuration} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default PersistentShiningDots;
