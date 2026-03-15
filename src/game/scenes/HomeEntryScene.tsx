import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useGame } from '../GameContext';
import HomeModel from '../models/HomeModel';
import { Zap, Cable, Gauge, Shield, Bot, ChevronRight } from 'lucide-react';

const entrySteps = [
  {
    id: 'service',
    label: 'Service Wire',
    icon: Cable,
    description: 'Power travels from the nearest pole through service wires to your home. These are insulated copper or aluminum conductors.',
    detail: 'The service wire carries AC current at 230V from the distribution pole to your house.',
    science: 'Conductors like copper allow electrons to flow easily. Insulation (PVC) prevents short circuits and shocks.',
  },
  {
    id: 'meter',
    label: 'Electric Meter',
    icon: Gauge,
    description: 'The electric meter measures how much electricity your home uses, counted in kilowatt-hours (kWh).',
    detail: 'It records real-time consumption so you pay only for what you use.',
    science: 'Energy (kWh) = Power (kW) × Time (hours). If a 100W bulb runs for 10 hours, it uses 1 kWh.',
  },
  {
    id: 'mcb',
    label: 'MCB Panel',
    icon: Shield,
    description: 'MCB stands for Miniature Circuit Breaker. It automatically stops electricity when too much current flows, preventing damage or fires.',
    detail: 'Each circuit in your house has its own MCB for safety.',
    science: 'If current exceeds the rated value (e.g., 16A), the MCB trips instantly to protect wiring and prevent fires.',
  },
];

const wireInfo = [
  { name: 'Phase (Live)', color: 'bg-wire-red', purpose: 'Carries current to devices' },
  { name: 'Neutral', color: 'bg-wire-blue', purpose: 'Return path for current' },
  { name: 'Earth', color: 'bg-wire-green', purpose: 'Safety — prevents electric shock' },
];

function HomeEntry3D({ step }: { step: number }) {
  return (
    <>
      <HomeModel
        showServiceWire
        serviceWireActive={step >= 0}
        showMeter
        meterActive={step >= 1}
        showMCB
        mcbActive={step >= 2}
        showInteriorFlow={step >= 2}
        placedAppliances={step >= 2 ? ['bulb-hall', 'bulb-kitchen', 'bulb-bed'] : []}
        applianceStates={step >= 2 ? { 'bulb-hall': true, 'bulb-kitchen': true, 'bulb-bed': true } : {}}
      />
      <OrbitControls enablePan={false} minDistance={8} maxDistance={16} maxPolarAngle={Math.PI / 2.3} target={[0, 1.2, 0]} />
      <Environment preset="apartment" />
    </>
  );
}

export default function HomeEntryScene() {
  const { homeEntryStep, setHomeEntryStep, addStar, addPoints, showVoltGuide, nextLevel, voltMessage } = useGame();

  useEffect(() => {
    showVoltGuide("Welcome! Let's see how electricity enters a house safely. Tap each step in order!");
  }, []);

  const stepMap: Record<string, number> = { idle: -1, 'service-connected': 0, 'meter-on': 1, 'mcb-set': 2, complete: 3 };
  const stepNum = stepMap[homeEntryStep] ?? -1;

  const handleStepClick = (index: number) => {
    if (index !== stepNum + 1) {
      showVoltGuide(`Complete step ${stepNum + 2} first!`);
      return;
    }
    const steps: ('service-connected' | 'meter-on' | 'mcb-set')[] = ['service-connected', 'meter-on', 'mcb-set'];
    setHomeEntryStep(steps[index]);
    showVoltGuide(entrySteps[index].description);
  };

  const handleComplete = () => {
    setHomeEntryStep('complete');
    addStar();
    addPoints(100);
    showVoltGuide("⭐ Home electrical entry complete! Power flows: Service Wire → Meter → MCB → Home Wiring!");
  };

  return (
    <div className="fixed inset-0 z-40 flex bg-background">
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [8, 6, 10], fov: 44 }}>
          <HomeEntry3D step={stepNum} />
        </Canvas>

        <div className="absolute top-2 left-2 z-10 game-panel py-1.5 px-3">
          <p className="font-fredoka-one text-[10px] text-accent uppercase tracking-wider">Level 5 of 8</p>
          <p className="font-fredoka-one text-sm text-foreground">Electricity Enters the House</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-60 bg-card border-l border-border flex flex-col overflow-y-auto">
        <div className="p-2.5 border-b border-border bg-accent/5">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <p className="font-fredoka-one text-[10px] text-accent">Volt says:</p>
              <p className="font-fredoka text-[11px] text-foreground leading-snug">{voltMessage || "Tap each step to learn!"}</p>
            </div>
          </div>
        </div>

        <div className="p-2.5 space-y-1.5 flex-1">
          <p className="font-fredoka-one text-xs text-foreground mb-1.5">⚡ Entry Path</p>
          {entrySteps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i <= stepNum;
            const isNext = i === stepNum + 1;
            return (
              <div
                key={step.id}
                className={`p-2 rounded-lg cursor-pointer transition-all duration-500 ${
                  isActive ? 'bg-accent/10 border border-accent/30' :
                  isNext ? 'bg-muted border border-dashed border-accent/40 animate-pulse-glow' :
                  'bg-muted/50 opacity-40'
                }`}
                onClick={() => handleStepClick(i)}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
                  <span className={`font-fredoka-one text-[11px] ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                  {isActive && <Zap className="w-3 h-3 text-accent ml-auto" />}
                </div>
                {isActive && (
                  <>
                    <p className="font-fredoka text-[10px] text-muted-foreground leading-snug mb-1">{step.detail}</p>
                    <div className="p-1.5 bg-muted/50 rounded">
                      <p className="font-fredoka text-[9px] text-accent leading-snug">🔬 {step.science}</p>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Wire colors */}
          <div className="mt-2 p-2 bg-muted/50 rounded-lg">
            <p className="font-fredoka-one text-[10px] text-foreground mb-1.5">🔌 Wire Colors</p>
            {wireInfo.map(wire => (
              <div key={wire.name} className="flex items-center gap-1.5 mb-0.5">
                <div className={`w-4 h-1.5 rounded-full ${wire.color}`} />
                <span className="font-fredoka text-[10px] text-foreground">{wire.name}</span>
                <span className="font-fredoka text-[9px] text-muted-foreground ml-auto">{wire.purpose}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-2.5 border-t border-border">
          {stepNum === 2 && homeEntryStep !== 'complete' && (
            <button onClick={handleComplete} className="game-btn game-btn-accent w-full text-xs flex items-center justify-center gap-1">
              Complete Entry <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {homeEntryStep === 'complete' && (
            <button onClick={nextLevel} className="game-btn game-btn-accent w-full text-xs flex items-center justify-center gap-1">
              Start Wiring → <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
