import { useState } from 'react';
import { useGame } from '../GameContext';
import { Zap, Shield, Gauge, Cable } from 'lucide-react';

const entryPath = [
  {
    id: 'service',
    label: 'Service Wire',
    icon: Cable,
    description: 'Power line connects to your home via service wires from the nearest pole.',
    detail: 'Copper conductor with PVC insulation carries AC current.',
    color: 'text-accent',
  },
  {
    id: 'meter',
    label: 'Electric Meter',
    icon: Gauge,
    description: 'The meter measures how much electricity you use, counted in kWh.',
    detail: 'Displays real-time consumption and total units used.',
    color: 'text-primary',
  },
  {
    id: 'mcb',
    label: 'MCB Panel',
    icon: Shield,
    description: 'Miniature Circuit Breaker protects your home from short circuits and overloads.',
    detail: 'Automatically trips when current exceeds safe limits.',
    color: 'text-accent',
  },
];

const wireInfo = [
  { name: 'Phase (Live)', color: 'bg-wire-red', purpose: 'Carries current to devices', material: 'Copper' },
  { name: 'Neutral', color: 'bg-wire-blue', purpose: 'Return path for current', material: 'Copper' },
  { name: 'Earth', color: 'bg-wire-green', purpose: 'Safety — prevents electric shock', material: 'Copper' },
];

export default function HomeEntryScene() {
  const { homeEntryStep, setHomeEntryStep, addStar, addPoints, showVoltGuide, nextLevel } = useGame();
  const [activeIndex, setActiveIndex] = useState(-1);

  const stepMap: Record<string, number> = {
    'idle': -1,
    'service-connected': 0,
    'meter-on': 1,
    'mcb-set': 2,
    'complete': 3,
  };
  const currentStep = stepMap[homeEntryStep] ?? -1;

  const handleStepClick = (index: number) => {
    if (index !== currentStep + 1) {
      showVoltGuide(`Complete step ${currentStep + 2} first!`);
      return;
    }

    setActiveIndex(index);
    const steps: ('service-connected' | 'meter-on' | 'mcb-set')[] = ['service-connected', 'meter-on', 'mcb-set'];
    setHomeEntryStep(steps[index]);
    showVoltGuide(entryPath[index].description);

    if (index === 2) {
      setTimeout(() => {
        setHomeEntryStep('complete');
        addStar();
        addPoints(100);
        showVoltGuide("⭐ Home electrical entry complete! Power flows: Service Wire → Meter → MCB → Home Wiring!");
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-br from-background via-background to-accent/5 flex flex-col items-center justify-center p-6">
      <div className="game-panel py-3 px-5 mb-8">
        <p className="font-fredoka-one text-sm text-accent uppercase tracking-wider text-center">Level 5 of 8</p>
        <p className="font-fredoka-one text-2xl text-foreground text-center">Electricity Enters the House</p>
      </div>

      {/* Entry path visualization */}
      <div className="flex items-center gap-4 mb-10 flex-wrap justify-center">
        {entryPath.map((step, i) => {
          const Icon = step.icon;
          const isActive = i <= currentStep;
          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex flex-col items-center gap-2 p-6 rounded-2xl cursor-pointer transition-all duration-500 min-w-[140px] ${
                  isActive ? 'bg-accent/15 glow-accent scale-105' :
                  i === currentStep + 1 ? 'bg-muted border-2 border-dashed border-accent animate-pulse-glow' :
                  'bg-muted/50 opacity-40'
                }`}
                onClick={() => handleStepClick(i)}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isActive ? 'bg-accent/20' : 'bg-card'
                }`}>
                  <Icon className={`w-8 h-8 ${isActive ? step.color : 'text-muted-foreground'}`} />
                </div>
                <span className={`font-fredoka-one text-lg ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
                {isActive && (
                  <span className="font-fredoka text-xs text-muted-foreground text-center">{step.detail}</span>
                )}
              </div>
              {i < entryPath.length - 1 && (
                <div className={`w-12 h-1 mx-2 rounded transition-all ${i < currentStep ? 'bg-accent' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Wire color info */}
      <div className="game-panel py-4 px-6 max-w-xl w-full mb-6">
        <p className="font-fredoka-one text-lg text-foreground mb-3">🔌 Home Wiring Colors</p>
        <div className="space-y-2">
          {wireInfo.map(wire => (
            <div key={wire.name} className="flex items-center gap-3">
              <div className={`w-8 h-3 rounded-full ${wire.color}`} />
              <span className="font-fredoka text-foreground font-semibold w-28">{wire.name}</span>
              <span className="font-fredoka text-sm text-muted-foreground">{wire.purpose}</span>
              <span className="font-fredoka text-xs text-muted-foreground ml-auto">({wire.material})</span>
            </div>
          ))}
        </div>
      </div>

      {homeEntryStep === 'complete' && (
        <button onClick={nextLevel} className="game-btn game-btn-accent text-xl animate-float">
          Start Wiring the House →
        </button>
      )}
    </div>
  );
}
