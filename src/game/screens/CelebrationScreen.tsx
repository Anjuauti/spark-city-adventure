import { useState, useEffect, useMemo } from 'react';
import { useGame } from '../GameContext';
import { Star, Zap, PartyPopper, Trophy, Bot } from 'lucide-react';

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      color: ['#FFD700', '#00BCD4', '#E53935', '#43A047', '#1E88E5', '#FF9800'][Math.floor(Math.random() * 6)],
      size: 6 + Math.random() * 8,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

const learnings = [
  '⚡ How electricity is generated at hydroelectric dams',
  '🧲 How generators use electromagnetic induction',
  '🏗️ How electricity travels through transmission lines',
  '🔌 How transformers control voltage',
  '🏠 How electricity enters homes safely',
  '🔧 How home wiring uses phase, neutral & earth wires',
  '📊 How appliances consume different amounts of power',
];

export default function CelebrationScreen() {
  const { stars, points, resetGame, setLevel } = useGame();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 500);
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center overflow-auto">
      <Confetti />

      <div className={`text-center max-w-2xl px-6 py-8 transition-all duration-1000 ${
        showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}>
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center glow-primary">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
        </div>

        <h1 className="font-fredoka-one text-4xl text-foreground mb-4">
          🎉 Congratulations! 🎉
        </h1>

        <p className="font-fredoka text-xl text-foreground mb-2">
          You successfully restored electricity to Spark City!
        </p>

        <div className="flex items-center justify-center gap-4 my-6">
          <div className="flex items-center gap-1">
            {Array.from({ length: stars }).map((_, i) => (
              <Star key={i} className="w-7 h-7 text-primary fill-primary" />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-6 h-6 text-accent" />
            <span className="font-fredoka-one text-2xl text-foreground">{points} pts</span>
          </div>
        </div>

        {/* Volt says */}
        <div className="game-panel inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-accent-foreground" />
          </div>
          <p className="font-fredoka-one text-lg text-foreground text-left">
            "Amazing work! You are now a Spark City Power Engineer!"
          </p>
        </div>

        {/* What you learned */}
        <div className="game-panel text-left mb-8 max-w-md mx-auto">
          <p className="font-fredoka-one text-lg text-foreground mb-3">🎓 You learned:</p>
          <ul className="space-y-1">
            {learnings.map((item, i) => (
              <li key={i} className="font-fredoka text-sm text-muted-foreground">{item}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={resetGame} className="game-btn text-xl">
            <PartyPopper className="w-5 h-5 inline mr-2" />
            Start Again
          </button>
          <button
            onClick={() => setLevel('attract')}
            className="game-btn bg-muted text-foreground text-xl"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
