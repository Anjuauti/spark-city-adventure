import { useGame } from './GameContext';
import { Star } from 'lucide-react';

export default function StarCounter() {
  const { stars } = useGame();
  if (stars === 0) return null;
  
  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-2 game-panel py-2 px-4">
      <Star className="w-6 h-6 text-primary fill-primary" />
      <span className="font-fredoka-one text-xl text-foreground">{stars}</span>
    </div>
  );
}
