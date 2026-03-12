import { useState, useEffect, useMemo } from 'react';
import { useGame } from '../GameContext';
import { Star, Zap, PartyPopper, Trophy } from 'lucide-react';

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

export default function CelebrationScreen() {
  const { stars, resetGame, setLevel } = useGame();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 500);
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
      <Confetti />
      
      <div className={`text-center max-w-2xl px-6 transition-all duration-1000 ${
        showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}>
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center glow-primary">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
        </div>

        <h1 className="font-fredoka-one text-5xl text-foreground mb-4">
          🎉 Congratulations! 🎉
        </h1>
        
        <p className="font-fredoka text-xl text-foreground mb-2">
          You successfully generated electricity and powered the entire home!
        </p>

        <div className="flex items-center justify-center gap-2 my-6">
          {Array.from({ length: stars }).map((_, i) => (
            <Star key={i} className="w-8 h-8 text-primary fill-primary" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>

        <div className="game-panel inline-flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="font-fredoka-one text-xl text-foreground">
            "Amazing work! You are now an Electricity Engineer!"
          </p>
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
