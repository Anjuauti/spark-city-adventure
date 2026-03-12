import { useState, useCallback } from 'react';
import { useGame } from '../GameContext';
import { Lightbulb, Fan, ToggleRight, Plug, GripVertical } from 'lucide-react';

interface ComponentItem {
  id: string;
  room: string;
  name: string;
  icon: typeof Lightbulb;
}

const allComponents: ComponentItem[] = [
  { id: 'hall-light1', room: 'Hall', name: 'LED Light 1', icon: Lightbulb },
  { id: 'hall-light2', room: 'Hall', name: 'LED Light 2', icon: Lightbulb },
  { id: 'hall-light3', room: 'Hall', name: 'LED Light 3', icon: Lightbulb },
  { id: 'hall-fan', room: 'Hall', name: 'Ceiling Fan', icon: Fan },
  { id: 'hall-switch', room: 'Hall', name: 'Switch Board', icon: ToggleRight },
  { id: 'hall-tv', room: 'Hall', name: 'TV Socket', icon: Plug },
  { id: 'kitchen-light', room: 'Kitchen', name: 'LED Light', icon: Lightbulb },
  { id: 'kitchen-socket', room: 'Kitchen', name: 'Socket Board', icon: Plug },
  { id: 'bed-light', room: 'Bedroom', name: 'LED Light', icon: Lightbulb },
  { id: 'bed-fan', room: 'Bedroom', name: 'Ceiling Fan', icon: Fan },
  { id: 'bed-socket', room: 'Bedroom', name: 'Bedside Socket', icon: Plug },
];

const rooms = ['Hall', 'Kitchen', 'Bedroom'] as const;

const dropZones: Record<string, { label: string; room: string; x: number; y: number }> = {
  'hall-light1': { label: 'Light 1', room: 'Hall', x: 10, y: 15 },
  'hall-light2': { label: 'Light 2', room: 'Hall', x: 20, y: 15 },
  'hall-light3': { label: 'Light 3', room: 'Hall', x: 30, y: 15 },
  'hall-fan': { label: 'Fan', room: 'Hall', x: 20, y: 8 },
  'hall-switch': { label: 'Switch', room: 'Hall', x: 8, y: 35 },
  'hall-tv': { label: 'TV', room: 'Hall', x: 30, y: 35 },
  'kitchen-light': { label: 'Light', room: 'Kitchen', x: 55, y: 15 },
  'kitchen-socket': { label: 'Socket', room: 'Kitchen', x: 55, y: 35 },
  'bed-light': { label: 'Light', room: 'Bedroom', x: 80, y: 15 },
  'bed-fan': { label: 'Fan', room: 'Bedroom', x: 80, y: 8 },
  'bed-socket': { label: 'Socket', room: 'Bedroom', x: 80, y: 35 },
};

export default function WiringPuzzle() {
  const { placedComponents, placeComponent, addStar, showElectroGuide, nextLevel } = useGame();
  const [dragging, setDragging] = useState<string | null>(null);
  const [justPlaced, setJustPlaced] = useState<string | null>(null);

  const allPlaced = allComponents.every(c => placedComponents.includes(c.id));

  const handleDragStart = (id: string) => {
    if (!placedComponents.includes(id)) {
      setDragging(id);
    }
  };

  const handleDrop = useCallback((zoneId: string) => {
    if (dragging === zoneId && !placedComponents.includes(zoneId)) {
      placeComponent(zoneId);
      setJustPlaced(zoneId);
      setTimeout(() => setJustPlaced(null), 800);
      
      const remaining = allComponents.filter(c => !placedComponents.includes(c.id) && c.id !== zoneId).length;
      if (remaining === 0) {
        addStar();
        showElectroGuide("⭐ All components installed! Now let's connect the wires!");
      } else if (remaining <= 3) {
        showElectroGuide(`Almost there! ${remaining} components left!`);
      } else {
        showElectroGuide("Great job! Keep placing components!");
      }
    } else if (dragging && dragging !== zoneId) {
      showElectroGuide("Hmm, that component goes somewhere else! Try again.");
    }
    setDragging(null);
  }, [dragging, placedComponents, placeComponent, addStar, showElectroGuide]);

  return (
    <div className="fixed inset-0 z-40 bg-background flex">
      {/* House layout area */}
      <div className="flex-1 relative p-6">
        <div className="absolute top-6 left-6 z-10 game-panel py-3 px-5">
          <p className="font-fredoka-one text-sm text-accent uppercase tracking-wider">Level 4</p>
          <p className="font-fredoka-one text-xl text-foreground">Wiring Puzzle</p>
        </div>

        {/* Room outlines */}
        <div className="absolute inset-6 top-20">
          {/* Room labels */}
          <div className="absolute left-[5%] top-0 w-[35%] h-full border-2 border-dashed border-accent/30 rounded-2xl p-4">
            <span className="font-fredoka-one text-accent text-lg">🛋 Hall</span>
          </div>
          <div className="absolute left-[42%] top-0 w-[25%] h-full border-2 border-dashed border-accent/30 rounded-2xl p-4">
            <span className="font-fredoka-one text-accent text-lg">🍳 Kitchen</span>
          </div>
          <div className="absolute left-[69%] top-0 w-[28%] h-full border-2 border-dashed border-accent/30 rounded-2xl p-4">
            <span className="font-fredoka-one text-accent text-lg">🛏 Bedroom</span>
          </div>

          {/* Drop zones */}
          {Object.entries(dropZones).map(([id, zone]) => {
            const placed = placedComponents.includes(id);
            const comp = allComponents.find(c => c.id === id);
            const Icon = comp?.icon || Lightbulb;
            
            return (
              <div
                key={id}
                className={`absolute w-16 h-16 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  placed 
                    ? justPlaced === id 
                      ? 'bg-primary/30 glow-primary scale-110' 
                      : 'bg-accent/20 border-2 border-accent'
                    : 'bg-muted border-2 border-dashed border-muted-foreground/30 animate-pulse-glow'
                }`}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(id)}
                onClick={() => dragging && handleDrop(id)}
              >
                <Icon className={`w-5 h-5 ${placed ? 'text-accent' : 'text-muted-foreground/50'}`} />
                <span className="text-[10px] font-fredoka text-muted-foreground mt-0.5">{zone.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toolbox */}
      <div className="w-52 bg-card border-l border-border p-4 overflow-y-auto">
        <h3 className="font-fredoka-one text-lg text-foreground mb-4">🧰 Toolbox</h3>
        
        {rooms.map(room => (
          <div key={room} className="mb-4">
            <p className="font-fredoka text-sm text-muted-foreground mb-2">{room}</p>
            <div className="space-y-2">
              {allComponents
                .filter(c => c.room === room)
                .map(comp => {
                  const placed = placedComponents.includes(comp.id);
                  const Icon = comp.icon;
                  return (
                    <div
                      key={comp.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-grab transition-all ${
                        placed 
                          ? 'opacity-40 cursor-default' 
                          : dragging === comp.id 
                            ? 'bg-accent/20 scale-105 glow-accent' 
                            : 'bg-muted hover:bg-accent/10'
                      }`}
                      draggable={!placed}
                      onDragStart={() => handleDragStart(comp.id)}
                      onClick={() => !placed && setDragging(dragging === comp.id ? null : comp.id)}
                    >
                      <GripVertical className="w-3 h-3 text-muted-foreground" />
                      <Icon className="w-4 h-4 text-foreground" />
                      <span className="font-fredoka text-sm text-foreground">{comp.name}</span>
                      {placed && <span className="ml-auto text-accent text-xs">✓</span>}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-muted rounded-xl">
          <p className="font-fredoka text-sm text-muted-foreground">
            {placedComponents.length}/{allComponents.length} placed
          </p>
          <div className="w-full h-2 bg-background rounded-full mt-2">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(placedComponents.length / allComponents.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dragging indicator */}
      {dragging && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 game-panel py-2 px-4">
          <p className="font-fredoka text-foreground">
            📦 Now click the matching drop zone for "{allComponents.find(c => c.id === dragging)?.name}"
          </p>
        </div>
      )}

      {allPlaced && (
        <div className="fixed bottom-6 right-60 z-50">
          <button onClick={nextLevel} className="game-btn game-btn-accent text-xl animate-float">
            Connect Wires →
          </button>
        </div>
      )}
    </div>
  );
}
