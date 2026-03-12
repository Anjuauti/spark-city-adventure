import { useState } from 'react';
import { useGame } from '../GameContext';
import { MousePointer2, Move, Cable, ToggleRight, ChevronRight } from 'lucide-react';

const instructions = [
  { icon: MousePointer2, text: 'Follow glowing arrows to complete missions', color: 'text-accent' },
  { icon: Move, text: 'Drag components to install them', color: 'text-primary' },
  { icon: Cable, text: 'Connect wires using your mouse', color: 'text-wire-red' },
  { icon: ToggleRight, text: 'Turn switches to power the house', color: 'text-accent' },
];

export default function InstructionsScreen() {
  const { setLevel, showElectroGuide } = useGame();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < instructions.length - 1) {
      setStep(step + 1);
    } else {
      showElectroGuide("Hello! Our city needs electricity! Help me generate power from water and bring electricity to the house!");
      setLevel('level1-hydro');
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-accent/5 via-background to-primary/5">
      <div className="game-panel max-w-lg w-full mx-4">
        <h2 className="font-fredoka-one text-3xl text-foreground text-center mb-8">
          Welcome to the Electricity Adventure!
        </h2>

        <div className="space-y-4 mb-8">
          {instructions.map((inst, i) => {
            const Icon = inst.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  i === step ? 'bg-accent/10 scale-105 glow-accent' : i < step ? 'opacity-60' : 'opacity-30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-card flex items-center justify-center ${inst.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-fredoka text-lg text-foreground">{inst.text}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-1.5">
            {instructions.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i <= step ? 'bg-accent' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <button onClick={handleNext} className="game-btn game-btn-accent flex items-center gap-2">
            {step < instructions.length - 1 ? 'Next' : "Let's Go!"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
