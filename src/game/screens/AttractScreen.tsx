import { useGame } from '../GameContext';
import { Zap, Droplets, Home, Lightbulb } from 'lucide-react';

export default function AttractScreen() {
  const { setLevel } = useGame();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-accent/10 via-background to-primary/10">
      <div className="text-center max-w-2xl px-6">
        <div className="flex justify-center gap-4 mb-8">
          {[Droplets, Zap, Home, Lightbulb].map((Icon, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center animate-float"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              <Icon className="w-8 h-8 text-accent" />
            </div>
          ))}
        </div>

        <h1 className="font-fredoka-one text-5xl md:text-6xl text-foreground mb-4">
          From Water to Light
        </h1>
        <p className="font-fredoka text-xl text-muted-foreground mb-2">
          Smart Home Electrical Wiring Simulator
        </p>
        <p className="font-fredoka text-lg text-muted-foreground mb-10">
          An interactive 3D educational adventure
        </p>

        <button
          onClick={() => setLevel('instructions')}
          className="game-btn text-2xl px-10 py-4"
        >
          Start Adventure!
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-fredoka text-sm">Powered by Electro — Your Energy Robot Guide</span>
        </div>
      </div>
    </div>
  );
}
