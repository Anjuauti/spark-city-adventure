import { useGame } from './GameContext';
import { Bot } from 'lucide-react';

export default function VoltGuide() {
  const { showVolt, voltMessage } = useGame();

  if (!showVolt || !voltMessage) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-end gap-3 animate-float max-w-md">
      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center glow-accent shrink-0">
        <Bot className="w-8 h-8 text-accent-foreground" />
      </div>
      <div className="electro-bubble">
        <p className="font-fredoka-one text-sm text-accent mb-1">Volt says:</p>
        <p className="font-fredoka text-foreground text-lg" style={{ textWrap: 'balance' }}>
          {voltMessage}
        </p>
      </div>
    </div>
  );
}
