import { useState, useEffect } from 'react';
import { useGame, APPLIANCES } from '../GameContext';
import { Zap, Gauge } from 'lucide-react';

export default function ConsumptionScreen() {
  const { applianceStates, toggleAppliance, totalConsumption, addStar, addPoints, showVoltGuide, nextLevel } = useGame();
  const [meterReading, setMeterReading] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const rooms = ['Hall', 'Kitchen', 'Bedroom'];

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
    setHasInteracted(true);
    const appliance = APPLIANCES.find(a => a.id === id);
    const willBeOn = !applianceStates[id];

    if (willBeOn && appliance) {
      addPoints(5);
      showVoltGuide(`${appliance.name} uses ${appliance.watts}W of power! Watch the meter go up!`);
    }
  };

  const activeCount = Object.values(applianceStates).filter(Boolean).length;
  const canProceed = activeCount >= 3;

  useEffect(() => {
    if (canProceed && hasInteracted) {
      addStar();
      showVoltGuide("⭐ Great! You see how each appliance adds to power consumption. Energy meters measure this in kWh!");
    }
  }, [canProceed]);

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-br from-background via-background to-primary/5 flex flex-col p-6 overflow-auto">
      <div className="flex justify-between items-start mb-6">
        <div className="game-panel py-3 px-5">
          <p className="font-fredoka-one text-sm text-accent uppercase tracking-wider">Level 7 of 8</p>
          <p className="font-fredoka-one text-xl text-foreground">Power Consumption</p>
        </div>

        {/* Energy meter */}
        <div className="game-panel py-3 px-5 text-center">
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="w-5 h-5 text-accent" />
            <span className="font-fredoka-one text-sm text-muted-foreground">Energy Meter</span>
          </div>
          <p className="font-fredoka-one text-3xl text-foreground">{meterReading.toFixed(3)} <span className="text-sm text-muted-foreground">kWh</span></p>
          <div className="flex items-center gap-1 mt-1">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-fredoka text-sm text-primary">{totalConsumption}W total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {rooms.map(room => (
          <div key={room} className="game-panel flex flex-col">
            <h3 className="font-fredoka-one text-xl text-foreground mb-3">
              {room === 'Hall' ? '🛋' : room === 'Kitchen' ? '🍳' : '🛏'} {room}
            </h3>
            <div className="space-y-2 flex-1">
              {APPLIANCES.filter(a => a.room === room).map(appliance => {
                const isOn = applianceStates[appliance.id];
                return (
                  <div
                    key={appliance.id}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                      isOn ? 'bg-primary/15 glow-primary' : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => handleToggle(appliance.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{appliance.icon}</span>
                      <div>
                        <span className="font-fredoka text-foreground block">{appliance.name}</span>
                        <span className="font-fredoka text-xs text-muted-foreground">{appliance.watts}W</span>
                      </div>
                    </div>
                    <div className={`w-12 h-7 rounded-full flex items-center transition-all duration-200 px-1 ${
                      isOn ? 'bg-accent justify-end' : 'bg-muted-foreground/20 justify-start'
                    }`}>
                      <div className={`w-5 h-5 rounded-full transition-all ${
                        isOn ? 'bg-accent-foreground' : 'bg-card'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Power bar for room */}
            <div className="mt-3 p-2 bg-muted rounded-lg">
              <div className="flex justify-between text-xs font-fredoka text-muted-foreground mb-1">
                <span>Room power</span>
                <span>
                  {APPLIANCES.filter(a => a.room === room && applianceStates[a.id]).reduce((s, a) => s + a.watts, 0)}W
                </span>
              </div>
              <div className="w-full h-2 bg-background rounded-full">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (APPLIANCES.filter(a => a.room === room && applianceStates[a.id]).reduce((s, a) => s + a.watts, 0) / 600) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {canProceed && (
        <div className="flex justify-center mt-4">
          <button onClick={nextLevel} className="game-btn game-btn-accent text-xl animate-float">
            🏠 Activate Smart Home →
          </button>
        </div>
      )}
    </div>
  );
}
