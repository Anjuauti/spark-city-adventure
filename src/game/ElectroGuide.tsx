import { useGame } from './GameContext';
import { Zap } from 'lucide-react';

export default function ElectroGuide() {
  const { showElectro, electroMessage } = useGame();

  if (!showElectro || !electroMessage) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-end gap-3 animate-float max-w-md">
      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center glow-primary shrink-0">
        <Zap className="w-8 h-8 text-primary-foreground" />
      </div>
      <div className="electro-bubble">
        <p className="font-fredoka-one text-foreground text-lg" style={{ textWrap: 'balance' }}>
          {electroMessage}
        </p>
      </div>
    </div>
  );
}
