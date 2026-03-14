import { useState } from 'react';
import { useGame } from '../GameContext';
import { MousePointer2, Move, Cable, ToggleRight, ChevronRight, Gauge } from 'lucide-react';

const instructions = [
  { icon: MousePointer2, text: 'Tap and interact with 3D machines', color: 'text-accent' },
  { icon: Gauge, text: 'Adjust controls to maintain correct settings', color: 'text-primary' },
  { icon: Move, text: 'Drag components to install them', color: 'text-accent' },
  { icon: Cable, text: 'Connect wires to build circuits', color: 'text-destructive' },
  { icon: ToggleRight, text: 'Switch appliances ON to power the city', color: 'text-primary' },
];

export default function InstructionsScreen() {
  const { setLevel, showVoltGuide } = useGame();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < instructions.length - 1) {
      setStep(step + 1);
    } else {
      showVoltGuide("Hello! Spark City lost power! Help me restore electricity from the dam all the way to homes!");
      setLevel('level1-hydro');
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-accent/5 via-background to-primary/5">
      <div className="game-panel max-w-md w-full mx-4">
        <h2 className="font-fredoka-one text-2xl text-foreground text-center mb-1">
          Welcome to Spark City!
        </h2>
        <p className="font-fredoka text-xs text-muted-foreground text-center mb-6">
          Learn how electricity travels from power plant to your home
        </p>

        <div className="space-y-2 mb-6">
          {instructions.map((inst, i) => {
            const Icon = inst.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                  i === step ? 'bg-accent/10 scale-[1.02] glow-accent' : i < step ? 'opacity-50' : 'opacity-25'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-card flex items-center justify-center ${inst.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-fredoka text-sm text-foreground">{inst.text}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {instructions.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= step ? 'bg-accent' : 'bg-muted'}`} />
            ))}
          </div>
          <button onClick={handleNext} className="game-btn game-btn-accent flex items-center gap-1.5 text-sm">
            {step < instructions.length - 1 ? 'Next' : "Let's Go!"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
