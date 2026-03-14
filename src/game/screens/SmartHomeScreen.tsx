import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useGame, APPLIANCES } from '../GameContext';
import HomeModel from '../models/HomeModel';
import { Zap, Bot, Droplets, Factory, Building2, Home, Power, Lightbulb } from 'lucide-react';

const ALL_IDS = APPLIANCES.map(a => a.id);

const flowSteps = [
  { icon: Droplets, label: 'Water' },
  { icon: Factory, label: 'Turbine' },
  { icon: Zap, label: 'Generator' },
  { icon: Building2, label: 'Grid' },
  { icon: Building2, label: 'Substation' },
  { icon: Home, label: 'House' },
  { icon: Power, label: 'MCB' },
  { icon: Lightbulb, label: 'Appliances' },
];

export default function SmartHomeScreen() {
  const { addStar, addPoints, showVoltGuide, nextLevel, applianceStates, toggleAppliance, totalConsumption, voltMessage } = useGame();
  const [activeFlowStep, setActiveFlowStep] = useState(-1);
  const [allLit, setAllLit] = useState(false);
  const [flowComplete, setFlowComplete] = useState(false);

  useEffect(() => {
    showVoltGuide("Watch electricity flow from the power plant through the entire system to your home!");
    const timer = setInterval(() => {
      setActiveFlowStep(prev => {
        if (prev >= flowSteps.length - 1) {
          clearInterval(timer);
          setFlowComplete(true);
          showVoltGuide("⚡ Power is flowing! Turn on ALL appliances to fully light up Spark City!");
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const allOn = APPLIANCES.every(a => applianceStates[a.id]);
    if (allOn && !allLit) {
      setAllLit(true);
      addStar();
      addPoints(200);
      showVoltGuide("🎉 Spark City is fully powered! You restored electricity from generation to home!");
    }
  }, [applianceStates]);

  return (
    <div className="fixed inset-0 z-40 flex bg-background">
      {/* 3D Scene */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [8, 6, 10], fov: 45 }}>
          <HomeModel
            placedAppliances={ALL_IDS}
            applianceStates={applianceStates}
            showServiceWire
            serviceWireActive={flowComplete}
            showMeter
            meterActive={flowComplete}
            showMCB
            mcbActive={flowComplete}
            showInteriorFlow={flowComplete && totalConsumption > 0}
          />
          <OrbitControls
            enablePan={false}
            minDistance={8}
            maxDistance={18}
            maxPolarAngle={Math.PI / 2.3}
            target={[0, 1.2, 0]}
          />
          <Environment preset="apartment" />
        </Canvas>

        <div className="absolute top-3 left-3 z-10 game-panel py-2 px-4">
          <p className="font-fredoka-one text-xs text-primary uppercase tracking-wider">Final Level — 8 of 8</p>
          <p className="font-fredoka-one text-base text-foreground">Smart Home Activation</p>
        </div>

        {/* Energy flow visualization */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 game-panel py-2 px-3">
          <div className="flex items-center gap-1">
            {flowSteps.map((step, i) => {
              const Icon = step.icon;
              const isActive = i <= activeFlowStep;
              return (
                <div key={i} className="flex items-center">
                  <div className={`flex flex-col items-center transition-all duration-500 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-25 scale-75'
                  }`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
                    <span className={`font-fredoka text-[8px] ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < flowSteps.length - 1 && (
                    <div className={`w-3 h-0.5 mx-0.5 ${i < activeFlowStep ? 'bg-accent' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 bg-card border-l border-border flex flex-col overflow-y-auto">
        {/* Volt */}
        <div className="p-3 border-b border-border bg-accent/5">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <p className="font-fredoka text-xs text-foreground leading-relaxed">{voltMessage || "Activate all appliances!"}</p>
          </div>
        </div>

        {flowComplete && (
          <div className="p-3 flex-1 space-y-3">
            {['Hall', 'Kitchen', 'Bedroom'].map(room => (
              <div key={room} className={`p-2 rounded-xl transition-all duration-500 ${
                APPLIANCES.filter(a => a.room === room).every(a => applianceStates[a.id]) ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted/30'
              }`}>
                <h3 className="font-fredoka-one text-xs text-foreground mb-1.5">
                  {room === 'Hall' ? '🛋' : room === 'Kitchen' ? '🍳' : '🛏'} {room}
                </h3>
                <div className="space-y-1">
                  {APPLIANCES.filter(a => a.room === room).map(appliance => {
                    const isOn = applianceStates[appliance.id];
                    return (
                      <div
                        key={appliance.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                          isOn ? 'bg-primary/10' : 'bg-muted/50'
                        }`}
                        onClick={() => toggleAppliance(appliance.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{appliance.icon}</span>
                          <span className="font-fredoka text-xs text-foreground">{appliance.name}</span>
                        </div>
                        <div className={`w-8 h-5 rounded-full flex items-center px-0.5 transition-all ${
                          isOn ? 'bg-accent justify-end' : 'bg-muted-foreground/20 justify-start'
                        }`}>
                          <div className={`w-4 h-4 rounded-full ${isOn ? 'bg-accent-foreground' : 'bg-card'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {!flowComplete && (
          <div className="p-6 flex-1 flex items-center justify-center">
            <p className="font-fredoka text-sm text-muted-foreground text-center animate-pulse-glow">
              ⚡ Energy flowing through the grid...
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-fredoka-one text-sm text-foreground">{totalConsumption}W</span>
          </div>
          {allLit && (
            <button onClick={nextLevel} className="game-btn w-full text-sm">
              🎉 Celebrate! →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
