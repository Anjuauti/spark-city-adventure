import { useGame } from './GameContext';
import { Bot } from 'lucide-react';

export default function VoltGuide() {
  const { showVolt, voltMessage } = useGame();

  if (!showVolt || !voltMessage) return null;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 game-panel py-2 px-4 max-w-lg">
      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-accent" />
      </div>
      <p className="font-fredoka text-xs text-foreground leading-relaxed">{voltMessage}</p>
    </div>
  );
}
