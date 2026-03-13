import { useGame } from '../GameContext';
import { Zap, Droplets, Home, Lightbulb, Factory, Bot } from 'lucide-react';

export default function AttractScreen() {
  const { setLevel } = useGame();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-accent/10 via-background to-primary/10">
      <div className="text-center max-w-3xl px-6">
        <div className="flex justify-center gap-4 mb-8">
          {[Droplets, Factory, Zap, Home, Lightbulb].map((Icon, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center animate-float"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              <Icon className="w-8 h-8 text-accent" />
            </div>
          ))}
        </div>

        <h1 className="font-fredoka-one text-4xl md:text-6xl text-foreground mb-3">
          ⚡ Spark City Adventure
        </h1>
        <p className="font-fredoka-one text-xl md:text-2xl text-accent mb-2">
          From Generation to Home Electricity
        </p>
        <p className="font-fredoka text-lg text-muted-foreground mb-10">
          Restore electricity to Spark City through 8 interactive missions!
        </p>

        <button
          onClick={() => setLevel('instructions')}
          className="game-btn text-2xl px-10 py-4"
        >
          Start Adventure!
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
          <Bot className="w-5 h-5 text-accent" />
          <span className="font-fredoka text-sm">Meet Volt — Your AI Robot Guide</span>
        </div>
      </div>
    </div>
  );
}
