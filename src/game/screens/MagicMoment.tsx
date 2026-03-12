import { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import { Zap, Droplets, Building2, Home, Lightbulb } from 'lucide-react';

const steps = [
  { icon: Droplets, label: 'Water', color: 'text-accent' },
  { icon: Zap, label: 'Turbine', color: 'text-accent' },
  { icon: Zap, label: 'Generator', color: 'text-primary' },
  { icon: Building2, label: 'Transmission', color: 'text-accent' },
  { icon: Building2, label: 'Transformer', color: 'text-primary' },
  { icon: Home, label: 'House', color: 'text-accent' },
  { icon: Zap, label: 'Switch', color: 'text-primary' },
  { icon: Lightbulb, label: 'Bulb!', color: 'text-primary' },
];

export default function MagicMoment() {
  const { nextLevel, showElectroGuide } = useGame();
  const [activeStep, setActiveStep] = useState(-1);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    showElectroGuide("Watch the electricity flow through the entire system! ⚡");
    
    const timer = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          setComplete(true);
          showElectroGuide("✨ The electricity has traveled from water all the way to the light bulb!");
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-br from-foreground/95 via-foreground/90 to-accent/20 flex items-center justify-center">
      <div className="max-w-4xl w-full px-6">
        <h2 className="font-fredoka-one text-4xl text-card text-center mb-4">
          ⚡ Electricity Magic Moment ⚡
        </h2>
        <p className="font-fredoka text-xl text-card/70 text-center mb-12">
          Watch electricity travel from water to light!
        </p>

        {/* Flow visualization */}
        <div className="flex items-center justify-center gap-2 mb-16">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i <= activeStep;
            return (
              <div key={i} className="flex items-center">
                <div className={`flex flex-col items-center transition-all duration-500 ${
                  isActive ? 'scale-110 opacity-100' : 'scale-75 opacity-30'
                }`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    isActive ? 'bg-accent/20 glow-accent' : 'bg-card/10'
                  }`}>
                    <Icon className={`w-7 h-7 transition-colors ${isActive ? step.color : 'text-card/30'}`} />
                  </div>
                  <span className={`font-fredoka text-xs mt-2 transition-colors ${
                    isActive ? 'text-card' : 'text-card/30'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-6 h-0.5 mx-1 transition-all duration-300 ${
                    i < activeStep ? 'bg-accent' : 'bg-card/10'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {complete && (
          <div className="text-center animate-float">
            <p className="font-fredoka-one text-3xl text-primary mb-8">
              💡 The light is ON! 💡
            </p>
            <button onClick={nextLevel} className="game-btn text-2xl px-10 py-4">
              Explore the House! →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
