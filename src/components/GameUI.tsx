import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/game-store';
import { Star, Zap, ArrowRight } from 'lucide-react';

const LEVEL_NAMES = [
  "",
  "Hydroelectric Dam",
  "Generator",
  "Transmission Lines",
  "Substation",
  "Home Entry",
  "Home Wiring",
  "Power Consumption",
  "Smart Home",
];

const LEVEL_COLORS: Record<number, string> = {
  1: '#3b82f6',
  2: '#8b5cf6',
  3: '#f59e0b',
  4: '#06b6d4',
  5: '#10b981',
  6: '#f97316',
  7: '#ec4899',
  8: '#14b8a6',
};

export const GameHUD = () => {
  const { currentLevel, score, stars } = useGameStore();
  if (currentLevel === 0 || currentLevel === 9) return null;

  const color = LEVEL_COLORS[currentLevel] || '#3b82f6';

  return (
    <div className="absolute top-0 left-0 w-full z-40 pointer-events-none">
      <div className="flex justify-between items-start px-4 pt-3 gap-2">
        <motion.div
          key={currentLevel}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.3 }}
          className="game-panel pointer-events-auto flex items-center gap-3"
          style={{ paddingTop: '0.55rem', paddingBottom: '0.55rem' }}
        >
          <div
            className="flex items-center justify-center rounded-xl text-white font-display font-bold"
            style={{ background: color, width: 40, height: 40, fontSize: '0.95rem', flexShrink: 0 }}
          >
            {currentLevel}
          </div>
          <div>
            <p className="font-bold uppercase tracking-widest" style={{ fontSize: '0.62rem', color }}>
              LEVEL {currentLevel} OF 8
            </p>
            <h2 className="font-display font-bold text-slate-800 leading-tight" style={{ fontSize: 'clamp(0.9rem, 1.4vw, 1.15rem)' }}>
              {LEVEL_NAMES[currentLevel]}
            </h2>
          </div>
        </motion.div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <motion.div
            className="flex items-center gap-1.5 game-panel"
            style={{ paddingTop: '0.45rem', paddingBottom: '0.45rem', paddingLeft: '0.8rem', paddingRight: '0.8rem' }}
          >
            <Star className="fill-yellow-400 text-yellow-400" style={{ width: 20, height: 20 }} />
            <span className="font-display font-bold text-slate-700" style={{ fontSize: '1.05rem' }}>{stars}</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-1.5 game-panel"
            style={{ paddingTop: '0.45rem', paddingBottom: '0.45rem', paddingLeft: '0.8rem', paddingRight: '0.8rem' }}
          >
            <Zap className="fill-yellow-400 text-yellow-400" style={{ width: 20, height: 20 }} />
            <motion.span
              key={score}
              initial={{ scale: 1.5, color: '#f59e0b' }}
              animate={{ scale: 1, color: '#334155' }}
              transition={{ duration: 0.4 }}
              className="font-display font-bold text-slate-700"
              style={{ fontSize: '1.05rem' }}
            >
              {score}
            </motion.span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export const VoltGuide = () => {
  const { voltMessage, currentLevel } = useGameStore();
  if (currentLevel === 0 || currentLevel === 9 || currentLevel >= 5) return null;

  return (
    <div
      className="absolute bottom-3 left-3 z-40 flex items-end gap-3 pointer-events-none"
      style={{ maxWidth: '46%' }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        className="animate-float flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #1e40af, #0ea5e9)',
          borderRadius: '50%',
          width: 58,
          height: 58,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0,194,255,0.6), 0 0 40px rgba(0,194,255,0.3)',
          border: '3px solid rgba(0,194,255,0.6)',
          fontSize: '1.8rem',
        }}
      >
        🤖
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={voltMessage}
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.92 }}
          transition={{ duration: 0.25 }}
          className="electro-bubble mb-2 relative pointer-events-auto"
          style={{ maxWidth: 290 }}
        >
          <p
            className="font-display font-bold mb-1"
            style={{ fontSize: '0.7rem', color: '#0ea5e9', letterSpacing: '0.05em' }}
          >
            ⚡ VOLT SAYS:
          </p>
          <p
            className="text-slate-700 font-medium leading-snug"
            style={{ fontSize: 'clamp(0.8rem, 1.1vw, 0.95rem)' }}
          >
            {voltMessage}
          </p>
          <div
            className="absolute -bottom-3 left-4 w-0 h-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '0px solid transparent',
              borderTop: '12px solid white',
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export const NextLevelButton = () => {
  const { levelComplete, nextLevel, currentLevel } = useGameStore();
  if (currentLevel === 0 || currentLevel === 9) return null;

  const NEXT_LABELS: Record<number, string> = {
    1: '⚙️ Explore the Generator',
    2: '🗼 See Transmission Lines',
    3: '🏢 Visit the Substation',
    4: '🏠 Enter the House',
    5: '🔌 Wire the House',
    6: '💡 Power the Appliances',
    7: '🏠 Smart Home!',
    8: '🏆 See Final Results',
  };

  return (
    <AnimatePresence>
      {levelComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 pointer-events-none"
        >
          <div className="absolute inset-0 bg-white/25 backdrop-blur-sm" />

          <motion.div
            initial={{ y: -40, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', bounce: 0.4 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
              boxShadow: '0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,215,0,0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            <Star className="fill-white text-white" style={{ width: 22, height: 22 }} />
            <span className="font-display font-bold text-slate-900" style={{ fontSize: '1.25rem' }}>
              Level Complete! +50 ⚡
            </span>
            <Star className="fill-white text-white" style={{ width: 22, height: 22 }} />
          </motion.div>

          <motion.button
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.35, type: 'spring', bounce: 0.35 }}
            onClick={nextLevel}
            className="absolute bottom-5 right-5 pointer-events-auto game-btn game-btn-accent flex items-center gap-2"
            style={{ fontSize: '1.05rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
          >
            {NEXT_LABELS[currentLevel] || 'Next Level'}
            <ArrowRight style={{ width: 19, height: 19 }} className="animate-bounce-arrow flex-shrink-0" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const InfoCard = ({
  title,
  icon,
  colorClass = 'from-blue-600 to-cyan-500',
  borderColor = 'border-blue-100',
  children,
}: {
  title: string;
  icon?: string;
  colorClass?: string;
  borderColor?: string;
  children: React.ReactNode;
}) => (
  <div className={`game-panel !p-0 border-2 ${borderColor} overflow-hidden`}>
    <div className={`bg-gradient-to-r ${colorClass} px-4 py-3 flex items-center gap-2`}>
      {icon && <span style={{ fontSize: '1.3rem' }}>{icon}</span>}
      <h3
        className="font-display font-bold text-white"
        style={{ fontSize: 'clamp(0.88rem, 1.3vw, 1.05rem)' }}
      >
        {title}
      </h3>
    </div>
    <div className="info-card-body space-y-1">{children}</div>
  </div>
);
