import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useGame } from '../GameContext';
import HomeModel from '../models/HomeModel';
import { Bot, ChevronRight } from 'lucide-react';

interface ComponentItem {
  id: string;
  room: string;
  name: string;
  icon: string;
}

const allComponents: ComponentItem[] = [
  { id: 'bulb-hall', room: 'Hall', name: 'Hall Bulb', icon: '💡' },
  { id: 'fan-hall', room: 'Hall', name: 'Hall Fan', icon: '🌀' },
  { id: 'tv-hall', room: 'Hall', name: 'Hall TV', icon: '📺' },
  { id: 'bulb-kitchen', room: 'Kitchen', name: 'Kitchen Bulb', icon: '💡' },
  { id: 'fridge', room: 'Kitchen', name: 'Refrigerator', icon: '🧊' },
  { id: 'washer', room: 'Kitchen', name: 'Washing Machine', icon: '🫧' },
  { id: 'bulb-bed', room: 'Bedroom', name: 'Bedroom Bulb', icon: '💡' },
  { id: 'fan-bed', room: 'Bedroom', name: 'Bedroom Fan', icon: '🌀' },
  { id: 'tv-bed', room: 'Bedroom', name: 'Bedroom TV', icon: '📺' },
];

const rooms = ['Hall', 'Kitchen', 'Bedroom'] as const;

export default function WiringPuzzle() {
  const { placedComponents, placeComponent, addStar, addPoints, showVoltGuide, nextLevel, voltMessage } = useGame();
  const [selected, setSelected] = useState<string | null>(null);

  const allPlaced = allComponents.every(c => placedComponents.includes(c.id));

  useEffect(() => {
    showVoltGuide("Install appliances in each room! Select a component, then click again to install it.");
  }, []);

  const handlePlace = useCallback((id: string) => {
    if (placedComponents.includes(id)) return;
    placeComponent(id);
    addPoints(15);
    setSelected(null);

    const comp = allComponents.find(c => c.id === id);
    showVoltGuide(`✅ ${comp?.name} installed in the ${comp?.room}!`);

    const remaining = allComponents.filter(c => !placedComponents.includes(c.id) && c.id !== id).length;
    if (remaining === 0) {
      setTimeout(() => {
        addStar();
        addPoints(50);
        showVoltGuide("⭐ All components installed! In homes, appliances are connected in parallel so each device gets full voltage.");
      }, 600);
    }
  }, [placedComponents, placeComponent, addStar, addPoints, showVoltGuide]);

  return (
    <div className="fixed inset-0 z-40 flex bg-background">
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [8, 6, 10], fov: 44 }}>
          <HomeModel
            placedAppliances={placedComponents}
            applianceStates={{}}
            showServiceWire
            serviceWireActive
            showMeter
            meterActive
            showMCB
            mcbActive
            showInteriorFlow={false}
            highlightAppliance={selected}
            highlightRoom={selected ? allComponents.find(c => c.id === selected)?.room ?? null : null}
          />
          <OrbitControls enablePan={false} minDistance={8} maxDistance={16} maxPolarAngle={Math.PI / 2.3} target={[0, 1.2, 0]} />
          <Environment preset="apartment" />
        </Canvas>

        <div className="absolute top-2 left-2 z-10 game-panel py-1.5 px-3">
          <p className="font-fredoka-one text-[10px] text-accent uppercase tracking-wider">Level 6 of 8</p>
          <p className="font-fredoka-one text-sm text-foreground">Home Wiring Simulator</p>
        </div>

        <div className="absolute bottom-2 left-2 z-10 game-panel py-1.5 px-2.5 max-w-[220px]">
          <p className="font-fredoka text-[10px] text-muted-foreground">
            🔬 <strong>Why grounding?</strong> The earth wire provides a safe path for fault current, preventing electric shock.
          </p>
        </div>
      </div>

      {/* Toolbox panel */}
      <div className="w-56 bg-card border-l border-border flex flex-col overflow-y-auto">
        <div className="p-2.5 border-b border-border bg-accent/5">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <p className="font-fredoka-one text-[10px] text-accent">Volt says:</p>
              <p className="font-fredoka text-[11px] text-foreground leading-snug">{voltMessage || "Install components!"}</p>
            </div>
          </div>
        </div>

        <div className="p-2.5 flex-1">
          <h3 className="font-fredoka-one text-[11px] text-foreground mb-2">🧰 Toolbox</h3>

          {rooms.map(room => (
            <div key={room} className="mb-2">
              <p className="font-fredoka text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">{room}</p>
              <div className="space-y-1">
                {allComponents
                  .filter(c => c.room === room)
                  .map(comp => {
                    const placed = placedComponents.includes(comp.id);
                    return (
                      <div
                        key={comp.id}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg cursor-pointer transition-all duration-300 ${
                          placed ? 'opacity-40 cursor-default bg-muted/50' :
                          selected === comp.id ? 'bg-accent/15 ring-1 ring-accent' :
                          'bg-muted hover:bg-accent/10'
                        }`}
                        onClick={() => {
                          if (!placed) {
                            if (selected === comp.id) handlePlace(comp.id);
                            else {
                              setSelected(comp.id);
                              showVoltGuide(`Selected ${comp.name}. Click again to install in ${comp.room}!`);
                            }
                          }
                        }}
                      >
                        <span className="text-xs">{comp.icon}</span>
                        <span className="font-fredoka text-[10px] text-foreground flex-1">{comp.name}</span>
                        {placed && <span className="text-accent text-[10px]">✓</span>}
                        {!placed && selected === comp.id && (
                          <span className="text-[9px] text-accent font-fredoka">tap</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Progress */}
          <div className="mt-2 p-1.5 bg-muted/50 rounded-lg">
            <div className="flex justify-between text-[10px] font-fredoka text-muted-foreground mb-0.5">
              <span>Installed</span>
              <span>{placedComponents.length}/{allComponents.length}</span>
            </div>
            <div className="w-full h-1 bg-background rounded-full">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${(placedComponents.length / allComponents.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Parallel wiring explanation */}
          <div className="mt-2 p-1.5 bg-muted/50 rounded-lg">
            <p className="font-fredoka text-[9px] text-muted-foreground leading-snug">
              🔬 <strong>Parallel Wiring:</strong> In homes, appliances are connected in parallel so each device gets full voltage and works independently.
            </p>
          </div>
        </div>

        {allPlaced && (
          <div className="p-2.5 border-t border-border">
            <button onClick={nextLevel} className="game-btn game-btn-accent w-full text-xs flex items-center justify-center gap-1">
              ⚡ Power Consumption → <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
