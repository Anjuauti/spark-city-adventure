import { useGame } from './GameContext';
import { Star, Zap } from 'lucide-react';

export default function StarCounter() {
  const { stars, points } = useGame();
  if (stars === 0 && points === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-4 game-panel py-2 px-4">
      <div className="flex items-center gap-1">
        <Star className="w-5 h-5 text-primary fill-primary" />
        <span className="font-fredoka-one text-lg text-foreground">{stars}</span>
      </div>
      <div className="flex items-center gap-1">
        <Zap className="w-5 h-5 text-accent" />
        <span className="font-fredoka-one text-lg text-foreground">{points}</span>
      </div>
    </div>
  );
}
