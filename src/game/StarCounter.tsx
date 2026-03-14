import { useGame } from './GameContext';
import { Star, Zap } from 'lucide-react';

export default function StarCounter() {
  const { stars, points } = useGame();
  if (stars === 0 && points === 0) return null;

  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-3 game-panel py-1.5 px-3">
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-primary fill-primary" />
        <span className="font-fredoka-one text-sm text-foreground">{stars}</span>
      </div>
      <div className="flex items-center gap-1">
        <Zap className="w-4 h-4 text-accent" />
        <span className="font-fredoka-one text-sm text-foreground">{points}</span>
      </div>
    </div>
  );
}
