import { useState, useEffect } from 'react';
import { useGame, APPLIANCES } from '../GameContext';
import { Zap, Lightbulb, Fan, Tv, Power, Home, Droplets, Factory, Building2 } from 'lucide-react';

const flowSteps = [
  { icon: Droplets, label: 'Water', color: 'text-accent' },
  { icon: Factory, label: 'Turbine', color: 'text-accent' },
  { icon: Zap, label: 'Generator', color: 'text-primary' },
  { icon: Building2, label: 'Grid', color: 'text-accent' },
  { icon: Building2, label: 'Substation', color: 'text-primary' },
  { icon: Home, label: 'House', color: 'text-accent' },
  { icon: Power, label: 'MCB', color: 'text-primary' },
  { icon: Lightbulb, label: 'Appliances', color: 'text-primary' },
];

export default function SmartHomeScreen() {
  const { addStar, addPoints, showVoltGuide, nextLevel, applianceStates, toggleAppliance, totalConsumption } = useGame();
  const [activeFlowStep, setActiveFlowStep] = useState(-1);
  const [allLit, setAllLit] = useState(false);
  const [flowComplete, setFlowComplete] = useState(false);

  // Animate energy flow
  useEffect(() => {
    showVoltGuide("Watch electricity flow from the power plant through the entire system to your home!");
    const timer = setInterval(() => {
      setActiveFlowStep(prev => {
        if (prev >= flowSteps.length - 1) {
          clearInterval(timer);
          setFlowComplete(true);
          showVoltGuide("⚡ Power is flowing! Now turn on ALL appliances to fully light up Spark City!");
          return prev;
        }
        return prev + 1;
      });
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Check if all appliances are on
  useEffect(() => {
    const allOn = APPLIANCES.every(a => applianceStates[a.id]);
    if (allOn && !allLit) {
      setAllLit(true);
      addStar();
      addPoints(200);
      showVoltGuide("🎉 Spark City is fully powered! You restored electricity from generation to home!");
    }
  }, [applianceStates]);

  const rooms = ['Hall', 'Kitchen', 'Bedroom'];

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-br from-foreground/5 via-background to-accent/10 flex flex-col p-6 overflow-auto">
      <div className="game-panel py-3 px-5 mb-4 text-center">
        <p className="font-fredoka-one text-sm text-primary uppercase tracking-wider">Final Level — 8 of 8</p>
        <p className="font-fredoka-one text-2xl text-foreground">Smart Home Activation</p>
      </div>

      {/* Energy flow visualization */}
      <div className="flex items-center justify-center gap-1 mb-6 flex-wrap">
        {flowSteps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i <= activeFlowStep;
          return (
            <div key={i} className="flex items-center">
              <div className={`flex flex-col items-center transition-all duration-500 ${
                isActive ? 'scale-110 opacity-100' : 'scale-75 opacity-30'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? 'bg-accent/20 glow-accent' : 'bg-muted'
                }`}>
                  <Icon className={`w-6 h-6 ${isActive ? step.color : 'text-muted-foreground'}`} />
                </div>
                <span className={`font-fredoka text-[10px] mt-1 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
              {i < flowSteps.length - 1 && (
                <div className={`w-4 h-0.5 mx-0.5 transition-all ${i < activeFlowStep ? 'bg-accent' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Appliance controls */}
      {flowComplete && (
        <div className="grid grid-cols-3 gap-4 flex-1">
          {rooms.map(room => (
            <div key={room} className={`game-panel transition-all duration-500 ${
              APPLIANCES.filter(a => a.room === room).every(a => applianceStates[a.id]) ? 'glow-primary' : ''
            }`}>
              <h3 className="font-fredoka-one text-lg text-foreground mb-3">
                {room === 'Hall' ? '🛋' : room === 'Kitchen' ? '🍳' : '🛏'} {room}
              </h3>
              <div className="space-y-2">
                {APPLIANCES.filter(a => a.room === room).map(appliance => {
                  const isOn = applianceStates[appliance.id];
                  return (
                    <div
                      key={appliance.id}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        isOn ? 'bg-primary/15' : 'bg-muted'
                      }`}
                      onClick={() => toggleAppliance(appliance.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{appliance.icon}</span>
                        <span className="font-fredoka text-sm text-foreground">{appliance.name}</span>
                      </div>
                      <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-all ${
                        isOn ? 'bg-accent justify-end' : 'bg-muted-foreground/20 justify-start'
                      }`}>
                        <div className={`w-5 h-5 rounded-full ${isOn ? 'bg-accent-foreground' : 'bg-card'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total consumption */}
      {flowComplete && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="game-panel py-2 px-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-fredoka-one text-foreground">{totalConsumption}W</span>
          </div>
          {allLit && (
            <button onClick={nextLevel} className="game-btn text-xl animate-float">
              🎉 Celebrate! →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
