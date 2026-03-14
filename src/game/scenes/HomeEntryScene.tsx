import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useGame } from '../GameContext';
import HomeModel from '../models/HomeModel';
import { Zap, Cable, Gauge, Shield, Bot } from 'lucide-react';

const entrySteps = [
  {
    id: 'service',
    label: 'Service Wire',
    icon: Cable,
    description: 'Power travels from the nearest pole through service wires to your home.',
    detail: 'Copper conductor with PVC insulation carries AC current at 230V.',
  },
  {
    id: 'meter',
    label: 'Electric Meter',
    icon: Gauge,
    description: 'The meter measures how much electricity your home uses, counted in kilowatt-hours (kWh).',
    detail: 'It records real-time consumption so you pay only for what you use.',
  },
  {
    id: 'mcb',
    label: 'MCB Panel',
    icon: Shield,
    description: 'MCB stands for Miniature Circuit Breaker. It automatically stops electricity when too much current flows, preventing damage or fires.',
    detail: 'Each circuit in your house has its own MCB for safety.',
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
      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={18}
        maxPolarAngle={Math.PI / 2.3}
        target={[0, 1.2, 0]}
      />
      <Environment preset="apartment" />
    </>
  );
}

export default function HomeEntryScene() {
  const { homeEntryStep, setHomeEntryStep, addStar, addPoints, showVoltGuide, nextLevel, voltMessage } = useGame();
  const [currentStep, setCurrentStep] = useState(-1);

  useEffect(() => {
    showVoltGuide("Welcome to your home! Let's see how electricity enters a house safely. Tap each step in order!");
  }, []);

  const stepMap: Record<string, number> = {
    idle: -1, 'service-connected': 0, 'meter-on': 1, 'mcb-set': 2, complete: 3,
  };
  const stepNum = stepMap[homeEntryStep] ?? -1;

  const handleStepClick = (index: number) => {
    if (index !== stepNum + 1) {
      showVoltGuide(`Complete step ${stepNum + 2} first!`);
      return;
    }
    setCurrentStep(index);
    const steps: ('service-connected' | 'meter-on' | 'mcb-set')[] = ['service-connected', 'meter-on', 'mcb-set'];
    setHomeEntryStep(steps[index]);
    showVoltGuide(entrySteps[index].description);

    if (index === 2) {
      setTimeout(() => {
        setHomeEntryStep('complete');
        addStar();
        addPoints(100);
        showVoltGuide("⭐ Home electrical entry complete! Power flows: Service Wire → Meter → MCB → Home Wiring!");
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex bg-background">
      {/* 3D Scene — center */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [8, 6, 10], fov: 45 }}>
          <HomeEntry3D step={stepNum} />
        </Canvas>

        {/* Level label */}
        <div className="absolute top-3 left-3 z-10 game-panel py-2 px-4">
          <p className="font-fredoka-one text-xs text-accent uppercase tracking-wider">Level 5 of 8</p>
          <p className="font-fredoka-one text-base text-foreground">Electricity Enters the House</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 bg-card border-l border-border flex flex-col overflow-y-auto">
        {/* Volt message */}
        <div className="p-3 border-b border-border bg-accent/5">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <p className="font-fredoka text-xs text-foreground leading-relaxed">{voltMessage || "Tap each step to learn!"}</p>
          </div>
        </div>

        {/* Steps */}
        <div className="p-3 space-y-2 flex-1">
          <p className="font-fredoka-one text-sm text-foreground mb-2">⚡ Entry Path</p>
          {entrySteps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i <= stepNum;
            const isNext = i === stepNum + 1;
            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-500 ${
                  isActive ? 'bg-accent/10 border border-accent/30' :
                  isNext ? 'bg-muted border border-dashed border-accent/40 animate-pulse-glow' :
                  'bg-muted/50 opacity-40'
                }`}
                onClick={() => handleStepClick(i)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
                  <span className={`font-fredoka-one text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                  {isActive && <Zap className="w-3 h-3 text-accent ml-auto" />}
                </div>
                {isActive && (
                  <p className="font-fredoka text-[11px] text-muted-foreground leading-snug">{step.detail}</p>
                )}
              </div>
            );
          })}

          {/* Wire colors */}
          <div className="mt-3 p-3 bg-muted/50 rounded-xl">
            <p className="font-fredoka-one text-xs text-foreground mb-2">🔌 Wire Colors</p>
            {wireInfo.map(wire => (
              <div key={wire.name} className="flex items-center gap-2 mb-1">
                <div className={`w-5 h-2 rounded-full ${wire.color}`} />
                <span className="font-fredoka text-[11px] text-foreground">{wire.name}</span>
              </div>
            ))}
          </div>
        </div>

        {homeEntryStep === 'complete' && (
          <div className="p-3 border-t border-border">
            <button onClick={nextLevel} className="game-btn game-btn-accent w-full text-sm">
              Start Wiring →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
