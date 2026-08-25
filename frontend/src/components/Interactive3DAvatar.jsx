/**
 * Interactive3DAvatar.jsx — Premium 3D AI Robot Companion
 * Fully connected, clean, high-definition android body.
 * Crystal clear face with expressive glowing eye sensors that track the cursor in 3D.
 */

import { motion, useTransform } from 'framer-motion';

export function Interactive3DAvatar({ springX, springY }) {
  // ── Unified 3D Kinematics ──────────────────────────────────────────
  // Master body 3D tilt
  const bodyRotateY = useTransform(springX, (v) => v * 0.45); // up to ~15 deg
  const bodyRotateX = useTransform(springY, (v) => -v * 0.35); // up to ~12 deg
  const bodyX = useTransform(springX, (v) => v * 0.25);

  // Head + Face specific 3D pivot (turns directly toward cursor)
  const headRotateY = useTransform(springX, (v) => v * 1.05); // up to ~32 deg
  const headRotateX = useTransform(springY, (v) => -v * 0.85); // up to ~25 deg
  const headX = useTransform(springX, (v) => v * 0.45);
  const headY = useTransform(springY, (v) => v * 0.35);

  // Eye sensors gaze tracking
  const eyeX = useTransform(springX, (v) => v * 0.38);
  const eyeY = useTransform(springY, (v) => v * 0.30);

  // Orbiting Tech Halo
  const haloRotateX = useTransform(springY, (v) => 68 - v * 0.5);
  const haloRotateY = useTransform(springX, (v) => v * 0.8);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        perspective: 1400,
        zIndex: 1,
      }}
    >
      {/* ── 3D Tech Halo Rings (Positioned safely behind character) ──── */}
      <motion.div
        style={{
          position: 'absolute',
          width: 440,
          height: 440,
          borderRadius: '50%',
          border: '1.5px dashed rgba(16, 185, 129, 0.25)',
          rotateX: haloRotateX,
          rotateY: haloRotateY,
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.1), inset 0 0 30px rgba(6, 182, 212, 0.08)',
          animation: 'spinSlow 24s linear infinite',
          zIndex: 0,
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: 370,
          height: 370,
          borderRadius: '50%',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          rotateX: haloRotateX,
          rotateY: haloRotateY,
          zIndex: 0,
        }}
      />

      {/* ── Unified 3D AI Robot Body ─────────────────────────────────── */}
      <motion.div
        style={{
          width: 360,
          height: 460,
          position: 'relative',
          transformStyle: 'preserve-3d',
          rotateX: bodyRotateX,
          rotateY: bodyRotateY,
          x: bodyX,
          zIndex: 2,
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Soft Ambient Core Glow behind Robot */}
        <div
          style={{
            position: 'absolute',
            inset: 40,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(6, 182, 212, 0.1) 50%, transparent 70%)',
            filter: 'blur(30px)',
            zIndex: 0,
          }}
        />

        {/* ── 1. Contiguous Torso, Collar & Shoulder Armor ──────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 10,
            width: 340,
            height: 240,
            zIndex: 2,
          }}
        >
          <svg viewBox="0 0 340 240" width="100%" height="100%" fill="none">
            {/* Base Body Shadow */}
            <ellipse cx="170" cy="235" rx="140" ry="12" fill="rgba(15,23,42,0.06)" />

            {/* Armored Shoulders & Chest Chassis */}
            <path
              d="M30 240 C35 150 85 110 170 110 C255 110 305 150 310 240 Z"
              fill="url(#torsoChassisGrad)"
              stroke="rgba(16, 185, 129, 0.45)"
              strokeWidth="2.5"
              filter="drop-shadow(0 10px 24px rgba(15,23,42,0.08))"
            />

            {/* Shoulder Armor Plates */}
            <path
              d="M30 240 C35 170 70 140 105 132 L95 240 Z"
              fill="url(#darkArmorGrad)"
              stroke="rgba(15, 23, 42, 0.15)"
              strokeWidth="1.5"
            />
            <path
              d="M310 240 C305 170 270 140 235 132 L245 240 Z"
              fill="url(#darkArmorGrad)"
              stroke="rgba(15, 23, 42, 0.15)"
              strokeWidth="1.5"
            />

            {/* Center High-Tech Breastplate */}
            <path
              d="M110 135 L170 120 L230 135 L215 230 L125 230 Z"
              fill="#ffffff"
              stroke="rgba(16, 185, 129, 0.35)"
              strokeWidth="2"
              filter="drop-shadow(0 4px 16px rgba(15,23,42,0.06))"
            />

            {/* Glowing Cyber Reactor Core */}
            <circle cx="170" cy="175" r="26" fill="url(#arcReactorGlow)" />
            <circle cx="170" cy="175" r="18" fill="#0f172a" />
            <circle cx="170" cy="175" r="10" fill="#10b981" filter="drop-shadow(0 0 10px #10b981)" />
            <circle cx="170" cy="175" r="4.5" fill="#ffffff" />

            {/* Glowing Neon Power Traces */}
            <path d="M125 152 L150 175" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 6px #10b981)" />
            <path d="M215 152 L190 175" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 6px #06b6d4)" />
            <path d="M170 202 L170 224" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 6px #3b82f6)" />

            {/* Collar Socket Joint — Seamlessly merges into the neck */}
            <path
              d="M135 112 C135 112 150 128 170 128 C190 128 205 112 205 112 L195 90 L145 90 Z"
              fill="url(#collarMetalGrad)"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            {/* Neck Glowing Fiber Conduits */}
            <line x1="152" y1="92" x2="152" y2="124" stroke="#10b981" strokeWidth="2" filter="drop-shadow(0 0 4px #10b981)" />
            <line x1="170" y1="92" x2="170" y2="126" stroke="#06b6d4" strokeWidth="2" filter="drop-shadow(0 0 4px #06b6d4)" />
            <line x1="188" y1="92" x2="188" y2="124" stroke="#10b981" strokeWidth="2" filter="drop-shadow(0 0 4px #10b981)" />

            <defs>
              <linearGradient id="torsoChassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <linearGradient id="darkArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="collarMetalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <radialGradient id="arcReactorGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="55%" stopColor="#10b981" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* ── 2. Unified 3D Head & Clean Crystal Faceplate ──────────── */}
        <motion.div
          style={{
            position: 'absolute',
            top: 28,
            left: 70,
            width: 220,
            height: 270,
            transformStyle: 'preserve-3d',
            rotateX: headRotateX,
            rotateY: headRotateY,
            x: headX,
            y: headY,
            zIndex: 4,
          }}
        >
          <svg viewBox="0 0 220 270" width="100%" height="100%" fill="none">
            {/* Robot Helmet Outer Ceramic Shell */}
            <path
              d="M35 125 C30 50 62 14 110 14 C158 14 190 50 185 125 C185 185 158 228 110 228 C62 228 35 185 35 125 Z"
              fill="url(#robotHeadGrad)"
              stroke="rgba(16, 185, 129, 0.45)"
              strokeWidth="2.5"
              filter="drop-shadow(0 14px 28px rgba(15,23,42,0.12))"
            />

            {/* Helmet Top Crest Armor */}
            <path
              d="M70 18 C85 16 135 16 150 18 L158 48 L62 48 Z"
              fill="url(#crestDarkGrad)"
              stroke="rgba(6, 182, 212, 0.4)"
              strokeWidth="1.5"
            />
            {/* Forehead Optical Sensor Jewel */}
            <circle cx="110" cy="32" r="5.5" fill="#10b981" filter="drop-shadow(0 0 8px #10b981)" />
            <circle cx="110" cy="32" r="2" fill="#ffffff" />

            {/* Left & Right Audio Transceiver Pods */}
            <rect x="22" y="105" width="15" height="46" rx="7.5" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
            <circle cx="29.5" cy="128" r="4.5" fill="#10b981" filter="drop-shadow(0 0 6px #10b981)" />

            <rect x="183" y="105" width="15" height="46" rx="7.5" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
            <circle cx="190.5" cy="128" r="4.5" fill="#06b6d4" filter="drop-shadow(0 0 6px #06b6d4)" />

            {/* Clean Sculpted Faceplate */}
            <path
              d="M48 85 C48 65 72 56 110 56 C148 56 172 65 172 85 C172 145 152 205 110 205 C68 205 48 145 48 85 Z"
              fill="url(#innerFaceGrad)"
              stroke="rgba(15, 23, 42, 0.12)"
              strokeWidth="1.5"
            />

            {/* Eyebrow / Sensor Ridge */}
            <path d="M62 94 Q84 88 102 94" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <path d="M118 94 Q136 88 158 94" stroke="#334155" strokeWidth="3" strokeLinecap="round" />

            {/* Dual Optical Display Sockets */}
            <rect x="62" y="102" width="40" height="26" rx="13" fill="#0f172a" stroke="rgba(16, 185, 129, 0.45)" strokeWidth="1.5" />
            <rect x="118" y="102" width="40" height="26" rx="13" fill="#0f172a" stroke="rgba(6, 182, 212, 0.45)" strokeWidth="1.5" />

            {/* Nose Bridge / Sensor Notch */}
            <path d="M110 110 L106 136 L114 136" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Friendly LED Smile Indicator */}
            <path d="M92 164 Q110 178 128 164" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" filter="drop-shadow(0 0 6px #10b981)" />

            {/* Chin Guard Contours */}
            <path d="M94 192 L110 202 L126 192" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />

            <defs>
              <linearGradient id="robotHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <linearGradient id="crestDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="innerFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="65%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
            </defs>
          </svg>

          {/* ── Left Glowing Eye Optical Sensor (Tracks Cursor) ──────── */}
          <motion.div
            style={{
              position: 'absolute',
              top: 107,
              left: 74,
              width: 16,
              height: 16,
              x: eyeX,
              y: eyeY,
              zIndex: 6,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #34d399 0%, #10b981 45%, #064e3b 100%)',
                boxShadow: '0 0 12px #10b981, inset 0 0 4px #ffffff',
                border: '1.5px solid #ffffff',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: 2.5, left: 2.5, width: 5, height: 5, borderRadius: '50%', background: '#ffffff' }} />
            </div>
          </motion.div>

          {/* ── Right Glowing Eye Optical Sensor (Tracks Cursor) ─────── */}
          <motion.div
            style={{
              position: 'absolute',
              top: 107,
              left: 130,
              width: 16,
              height: 16,
              x: eyeX,
              y: eyeY,
              zIndex: 6,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #22d3ee 0%, #06b6d4 45%, #083344 100%)',
                boxShadow: '0 0 12px #06b6d4, inset 0 0 4px #ffffff',
                border: '1.5px solid #ffffff',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: 2.5, left: 2.5, width: 5, height: 5, borderRadius: '50%', background: '#ffffff' }} />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Interactive3DAvatar;
