import { useState, useEffect, useMemo } from 'react';
import { useGame } from '../GameContext';
import { Star, Zap, PartyPopper, Trophy, Bot } from 'lucide-react';

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 3,
      color: ['#E8B930', '#5DADE2', '#C0392B', '#66BB6A', '#2E86C1', '#E67E22'][Math.floor(Math.random() * 6)],
      size: 5 + Math.random() * 6,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(p => (
        <div key={p.id} className="absolute rounded-sm"
          style={{ left: `${p.left}%`, width: p.size, height: p.size, backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s infinite` }} />
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
    setTimeout(() => setShowContent(true), 600);
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center overflow-auto">
      <Confetti />
      <div className={`text-center max-w-lg px-4 py-6 transition-all duration-1000 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center glow-primary">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="font-fredoka-one text-3xl text-foreground mb-3">🎉 Congratulations! 🎉</h1>
        <p className="font-fredoka text-base text-foreground mb-1">You restored electricity to Spark City!</p>

        <div className="flex items-center justify-center gap-3 my-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: stars }).map((_, i) => (
              <Star key={i} className="w-5 h-5 text-primary fill-primary" />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-5 h-5 text-accent" />
            <span className="font-fredoka-one text-xl text-foreground">{points} pts</span>
          </div>
        </div>

        <div className="game-panel inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-accent" />
          </div>
          <p className="font-fredoka-one text-sm text-foreground text-left">
            "Amazing work! You are now a Spark City Power Engineer!"
          </p>
        </div>

        <div className="game-panel text-left mb-6 max-w-sm mx-auto">
          <p className="font-fredoka-one text-sm text-foreground mb-2">🎓 You learned:</p>
          <ul className="space-y-0.5">
            {learnings.map((item, i) => (
              <li key={i} className="font-fredoka text-xs text-muted-foreground">{item}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center gap-3">
          <button onClick={resetGame} className="game-btn text-sm">
            <PartyPopper className="w-4 h-4 inline mr-1" /> Start Again
          </button>
          <button onClick={() => setLevel('attract')} className="game-btn bg-muted text-foreground text-sm">Exit</button>
        </div>
      </div>
    </div>
  );
}
