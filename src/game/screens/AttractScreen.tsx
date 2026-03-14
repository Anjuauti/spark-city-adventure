import { useGame } from '../GameContext';
import { Zap, Droplets, Home, Lightbulb, Factory, Bot } from 'lucide-react';

export default function AttractScreen() {
  const { setLevel } = useGame();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-accent/5 via-background to-primary/5">
      <div className="text-center max-w-2xl px-6">
        <div className="flex justify-center gap-3 mb-6">
          {[Droplets, Factory, Zap, Home, Lightbulb].map((Icon, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center animate-float"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              <Icon className="w-6 h-6 text-accent" />
            </div>
          ))}
        </div>

        <h1 className="font-fredoka-one text-3xl md:text-5xl text-foreground mb-2">
          ⚡ Spark City Adventure
        </h1>
        <p className="font-fredoka-one text-lg md:text-xl text-accent mb-1">
          From Generation to Home Electricity
        </p>
        <p className="font-fredoka text-sm text-muted-foreground mb-8">
          Restore electricity to Spark City through 8 interactive missions!
        </p>

        <button
          onClick={() => setLevel('instructions')}
          className="game-btn text-lg px-8 py-3"
        >
          Start Adventure!
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
          <Bot className="w-4 h-4 text-accent" />
          <span className="font-fredoka text-xs">Meet Volt — Your AI Robot Guide</span>
        </div>
      </div>
    </div>
  );
}
