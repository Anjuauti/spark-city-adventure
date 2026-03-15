import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useGame, APPLIANCES } from '../GameContext';
import HomeModel from '../models/HomeModel';
import { Zap, Gauge, Bot, ChevronRight } from 'lucide-react';

const ALL_IDS = APPLIANCES.map(a => a.id);

export default function ConsumptionScreen() {
  const { applianceStates, toggleAppliance, totalConsumption, addStar, addPoints, showVoltGuide, nextLevel, voltMessage } = useGame();
  const [meterReading, setMeterReading] = useState(0);
  const [hasAwarded, setHasAwarded] = useState(false);

  const rooms = ['Hall', 'Kitchen', 'Bedroom'];

  useEffect(() => {
    showVoltGuide("Toggle appliances ON to see how much power each uses! Watch the smart meter count up.");
  }, []);

  useEffect(() => {
    if (totalConsumption > 0) {
      const interval = setInterval(() => {
        setMeterReading(prev => prev + totalConsumption / 3600);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [totalConsumption]);

  const handleToggle = (id: string) => {
    toggleAppliance(id);
    const appliance = APPLIANCES.find(a => a.id === id);
    const willBeOn = !applianceStates[id];
    if (willBeOn && appliance) {
      addPoints(5);
      showVoltGuide(`${appliance.name} uses ${appliance.watts}W. Energy = Power × Time.`);
    }
  };

  const activeCount = Object.values(applianceStates).filter(Boolean).length;
  const canProceed = activeCount >= 3;

  useEffect(() => {
    if (canProceed && !hasAwarded) {
      setHasAwarded(true);
      addStar();
      showVoltGuide("⭐ Great! Each appliance adds to power consumption. Energy meters measure this in kWh!");
    }
  }, [canProceed, hasAwarded]);

  return (
    <div className="fixed inset-0 z-40 flex bg-background">
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [8, 6, 10], fov: 44 }}>
          <HomeModel
            placedAppliances={ALL_IDS}
            applianceStates={applianceStates}
            showServiceWire
            serviceWireActive
            showMeter
            meterActive
            showMCB
            mcbActive
            showInteriorFlow={totalConsumption > 0}
          />
          <OrbitControls enablePan={false} minDistance={8} maxDistance={16} maxPolarAngle={Math.PI / 2.3} target={[0, 1.2, 0]} />
          <Environment preset="apartment" />
        </Canvas>

        <div className="absolute top-2 left-2 z-10 game-panel py-1.5 px-3">
          <p className="font-fredoka-one text-[10px] text-accent uppercase tracking-wider">Level 7 of 8</p>
          <p className="font-fredoka-one text-sm text-foreground">Power Consumption</p>
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
              <p className="font-fredoka text-[11px] text-foreground leading-snug">{voltMessage || "Toggle appliances!"}</p>
            </div>
          </div>
        </div>

        {/* Smart meter */}
        <div className="p-2.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Gauge className="w-3.5 h-3.5 text-accent" />
            <span className="font-fredoka-one text-[10px] text-muted-foreground">Smart Meter</span>
          </div>
          <p className="font-fredoka-one text-lg text-foreground">{meterReading.toFixed(3)} <span className="text-[9px] text-muted-foreground">kWh</span></p>
          <div className="flex items-center gap-1 mt-0.5">
            <Zap className="w-3 h-3 text-primary" />
            <span className="font-fredoka text-[10px] text-primary">{totalConsumption}W total</span>
          </div>
        </div>

        {/* Appliance toggles */}
        <div className="p-2.5 flex-1 space-y-2">
          {rooms.map(room => (
            <div key={room}>
              <h3 className="font-fredoka-one text-[10px] text-foreground mb-1">
                {room === 'Hall' ? '🛋' : room === 'Kitchen' ? '🍳' : '🛏'} {room}
              </h3>
              <div className="space-y-0.5">
                {APPLIANCES.filter(a => a.room === room).map(appliance => {
                  const isOn = applianceStates[appliance.id];
                  return (
                    <div
                      key={appliance.id}
                      className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-all duration-300 ${
                        isOn ? 'bg-primary/10' : 'bg-muted/50 hover:bg-muted'
                      }`}
                      onClick={() => handleToggle(appliance.id)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{appliance.icon}</span>
                        <div>
                          <span className="font-fredoka text-[10px] text-foreground block">{appliance.name}</span>
                          <span className="font-fredoka text-[9px] text-muted-foreground">{appliance.watts}W</span>
                        </div>
                      </div>
                      <div className={`w-7 h-4 rounded-full flex items-center px-0.5 transition-all duration-200 ${
                        isOn ? 'bg-accent justify-end' : 'bg-muted-foreground/20 justify-start'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${isOn ? 'bg-accent-foreground' : 'bg-card'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Formula */}
          <div className="p-1.5 bg-muted/50 rounded-lg">
            <p className="font-fredoka-one text-[9px] text-accent mb-0.5">📐 Energy Formula</p>
            <p className="font-fredoka text-[10px] text-muted-foreground">Energy (kWh) = Power (W) × Time (h) ÷ 1000</p>
          </div>
        </div>

        {canProceed && (
          <div className="p-2.5 border-t border-border">
            <button onClick={nextLevel} className="game-btn game-btn-accent w-full text-xs flex items-center justify-center gap-1">
              🏠 Smart Home → <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
