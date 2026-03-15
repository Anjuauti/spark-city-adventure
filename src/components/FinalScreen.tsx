import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/game-store';
import { RotateCcw, Star } from 'lucide-react';

/* ── Animated confetti particles ── */
const CONFETTI_COLORS = ['#ffd700', '#00c2ff', '#00e676', '#ff6b6b', '#c084fc', '#fb923c'];

const ConfettiPiece = ({ i }: { i: number }) => {
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const duration = 3 + Math.random() * 3;
  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  const size = 8 + Math.random() * 10;
  return (
    <motion.div
      className="absolute pointer-events-none rounded-sm"
      style={{
        left: `${left}%`,
        top: -20,
        width: size,
        height: size * 0.6,
        background: color,
        opacity: 0.9,
      }}
      animate={{
        y: ['0vh', '110vh'],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
        x: [0, (Math.random() - 0.5) * 200],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

export const FinalScreen = () => {
  const { score, stars, resetGame } = useGameStore();
  const maxStars = 8;

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(150deg,#0f172a 0%,#1e3a5f 35%,#0c2340 65%,#0f172a 100%)' }}
    >
      {/* Electric grid BG */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,194,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(0,194,255,0.5) 1px,transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Confetti */}
      {[...Array(30)].map((_, i) => <ConfettiPiece key={i} i={i} />)}

      {/* Hero badge */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
        className="z-10 text-center mb-6"
        style={{ fontSize: '6rem', lineHeight: 1 }}
      >
        🏆
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="z-10 text-center mb-6"
      >
        <h1
          className="font-display text-white leading-tight text-glow-yellow"
          style={{ fontSize: 'clamp(3rem,5.5vw,5rem)' }}
        >
          ⚡ CITY POWERED! ⚡
        </h1>
        <p
          className="mt-3 font-medium"
          style={{
            color: '#00c2ff',
            fontSize: 'clamp(1rem,1.6vw,1.3rem)',
            maxWidth: 600,
            lineHeight: 1.6,
          }}
        >
          You guided electricity all the way from the Hydroelectric Dam through transmission lines, the substation, into the home — and powered every appliance!
        </p>
      </motion.div>

      {/* Score panel */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="z-10 glass-panel px-10 py-7 flex flex-col items-center gap-5 mb-8"
        style={{ minWidth: 320 }}
      >
        <h3 className="font-display text-white" style={{ fontSize: '1.5rem' }}>Final Score</h3>

        {/* Score number */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: 'spring', bounce: 0.4 }}
          className="font-display text-glow-yellow"
          style={{ fontSize: 'clamp(3.5rem,6vw,5rem)', color: '#ffd700' }}
        >
          {score.toLocaleString()}
        </motion.div>

        {/* Stars */}
        <div className="flex gap-3">
          {[...Array(maxStars)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.8 + i * 0.1, type: 'spring', bounce: 0.5 }}
            >
              <Star
                style={{
                  width: 36, height: 36,
                  fill: i < stars ? '#ffd700' : 'transparent',
                  color: i < stars ? '#ffd700' : '#475569',
                  filter: i < stars ? 'drop-shadow(0 0 8px rgba(255,215,0,0.8))' : 'none',
                }}
              />
            </motion.div>
          ))}
        </div>

        <p
          className="font-bold"
          style={{ color: '#94a3b8', fontSize: '0.95rem' }}
        >
          {stars >= 7 ? '⭐ Electric Genius!' : stars >= 5 ? '🌟 Power Engineer!' : '🔌 Spark Explorer!'}
        </p>
      </motion.div>

      {/* Journey recap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="z-10 flex gap-2 flex-wrap justify-center mb-8"
        style={{ maxWidth: 600 }}
      >
        {[
          { icon: '💧', label: 'Dam' },
          { icon: '⚙️', label: 'Generator' },
          { icon: '🗼', label: 'Lines' },
          { icon: '🏢', label: 'Substation' },
          { icon: '🏠', label: 'Home Entry' },
          { icon: '🔌', label: 'Wiring' },
          { icon: '💡', label: 'Appliances' },
          { icon: '🤖', label: 'Smart Home' },
        ].map((step, i, arr) => (
          <React.Fragment key={step.label}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.07, type: 'spring' }}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="rounded-2xl flex items-center justify-center"
                style={{
                  width: 44, height: 44,
                  background: 'rgba(0,230,118,0.2)',
                  border: '2.5px solid rgba(0,230,118,0.6)',
                  boxShadow: '0 0 12px rgba(0,230,118,0.3)',
                  fontSize: '1.25rem',
                }}
              >
                {step.icon}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.58rem', fontWeight: 'bold' }}>
                {step.label}
              </span>
            </motion.div>
            {i < arr.length - 1 && (
              <span style={{ color: '#00e676', fontSize: '1rem', paddingBottom: 14 }} className="animate-bounce-arrow">
                →
              </span>
            )}
          </React.Fragment>
        ))}
      </motion.div>

      {/* Replay button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, type: 'spring', bounce: 0.4 }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.95 }}
        onClick={resetGame}
        className="z-10 game-btn flex items-center gap-3"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
          border: '2px solid rgba(255,255,255,0.3)',
          color: 'white',
          fontSize: '1.2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <RotateCcw style={{ width: 22, height: 22 }} />
        PLAY AGAIN
      </motion.button>
    </div>
  );
};
