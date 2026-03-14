import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useGame } from '../GameContext';
import HomeModel from '../models/HomeModel';
import { Bot, GripVertical } from 'lucide-react';

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
    showVoltGuide("Install appliances in each room! Select a component from the toolbox, then it will appear in the house.");
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
        showVoltGuide("⭐ All components installed! In homes, appliances are connected in parallel so each device gets full voltage and works independently.");
      }, 800);
    }
  }, [placedComponents, placeComponent, addStar, addPoints, showVoltGuide]);

  return (
    <div className="fixed inset-0 z-40 flex bg-background">
      {/* 3D Scene */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [8, 6, 10], fov: 45 }}>
          <HomeModel
            placedAppliances={placedComponents}
            applianceStates={{}}
            showMCB
            mcbActive
            highlightAppliance={selected}
            highlightRoom={selected ? allComponents.find(c => c.id === selected)?.room ?? null : null}
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
          <p className="font-fredoka-one text-xs text-accent uppercase tracking-wider">Level 6 of 8</p>
          <p className="font-fredoka-one text-base text-foreground">Home Wiring Simulator</p>
        </div>

        {/* Grounding info */}
        <div className="absolute bottom-3 left-3 z-10 game-panel py-2 px-3 max-w-[260px]">
          <p className="font-fredoka text-[11px] text-muted-foreground">
            🔬 <strong>Why grounding?</strong> The earth wire provides a safe path for fault current, preventing electric shock.
          </p>
        </div>
      </div>

      {/* Right panel — Toolbox */}
      <div className="w-64 bg-card border-l border-border flex flex-col overflow-y-auto">
        {/* Volt */}
        <div className="p-3 border-b border-border bg-accent/5">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <p className="font-fredoka text-xs text-foreground leading-relaxed">{voltMessage || "Select & install components!"}</p>
          </div>
        </div>

        <div className="p-3 flex-1">
          <h3 className="font-fredoka-one text-sm text-foreground mb-3">🧰 Toolbox</h3>

          {rooms.map(room => (
            <div key={room} className="mb-3">
              <p className="font-fredoka text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">{room}</p>
              <div className="space-y-1.5">
                {allComponents
                  .filter(c => c.room === room)
                  .map(comp => {
                    const placed = placedComponents.includes(comp.id);
                    return (
                      <div
                        key={comp.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-300 ${
                          placed ? 'opacity-40 cursor-default bg-muted/50' :
                          selected === comp.id ? 'bg-accent/15 ring-1 ring-accent' :
                          'bg-muted hover:bg-accent/10'
                        }`}
                        onClick={() => {
                          if (!placed) {
                            if (selected === comp.id) {
                              handlePlace(comp.id);
                            } else {
                              setSelected(comp.id);
                              showVoltGuide(`Selected ${comp.name}. Click again to install in ${comp.room}!`);
                            }
                          }
                        }}
                      >
                        <span className="text-sm">{comp.icon}</span>
                        <span className="font-fredoka text-xs text-foreground flex-1">{comp.name}</span>
                        {placed && <span className="text-accent text-xs">✓</span>}
                        {!placed && selected === comp.id && (
                          <span className="text-[10px] text-accent font-fredoka">tap to install</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Progress */}
          <div className="mt-3 p-2 bg-muted/50 rounded-xl">
            <div className="flex justify-between text-[11px] font-fredoka text-muted-foreground mb-1">
              <span>Installed</span>
              <span>{placedComponents.length}/{allComponents.length}</span>
            </div>
            <div className="w-full h-1.5 bg-background rounded-full">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${(placedComponents.length / allComponents.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {allPlaced && (
          <div className="p-3 border-t border-border">
            <button onClick={nextLevel} className="game-btn game-btn-accent w-full text-sm">
              ⚡ Power Consumption →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
