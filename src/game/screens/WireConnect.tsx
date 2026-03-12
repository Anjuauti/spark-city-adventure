import { useState } from 'react';
import { useGame } from '../GameContext';

interface Wire {
  id: string;
  from: string;
  fromLabel: string;
  to: string;
  toLabel: string;
  color: string;
  colorClass: string;
}

const wires: Wire[] = [
  { id: 'w1', from: 'main-breaker', fromLabel: 'Main Breaker', to: 'hall-switch', toLabel: 'Hall Switch', color: '#E53935', colorClass: 'bg-wire-red' },
  { id: 'w2', from: 'hall-switch', fromLabel: 'Hall Switch', to: 'hall-lights', toLabel: 'Hall Lights', color: '#1E88E5', colorClass: 'bg-wire-blue' },
  { id: 'w3', from: 'hall-switch', fromLabel: 'Hall Switch', to: 'hall-fan', toLabel: 'Hall Fan', color: '#43A047', colorClass: 'bg-wire-green' },
  { id: 'w4', from: 'main-breaker', fromLabel: 'Main Breaker', to: 'kitchen', toLabel: 'Kitchen', color: '#E53935', colorClass: 'bg-wire-red' },
  { id: 'w5', from: 'main-breaker', fromLabel: 'Main Breaker', to: 'bed-lights', toLabel: 'Bedroom Lights', color: '#1E88E5', colorClass: 'bg-wire-blue' },
  { id: 'w6', from: 'bed-lights', fromLabel: 'Bedroom Lights', to: 'bed-fan', toLabel: 'Bedroom Fan', color: '#43A047', colorClass: 'bg-wire-green' },
];

const nodePositions: Record<string, { x: number; y: number }> = {
  'main-breaker': { x: 50, y: 8 },
  'hall-switch': { x: 20, y: 35 },
  'hall-lights': { x: 10, y: 65 },
  'hall-fan': { x: 30, y: 65 },
  'kitchen': { x: 50, y: 65 },
  'bed-lights': { x: 70, y: 35 },
  'bed-fan': { x: 80, y: 65 },
};

export default function WireConnect() {
  const { connectedWires, connectWire, addStar, showElectroGuide, nextLevel } = useGame();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [currentWireIndex, setCurrentWireIndex] = useState(0);

  const allConnected = wires.every(w => connectedWires.includes(w.id));
  const currentWire = wires[currentWireIndex];

  const handleNodeClick = (nodeId: string) => {
    if (allConnected) return;

    if (!selectedNode) {
      if (nodeId === currentWire.from) {
        setSelectedNode(nodeId);
        showElectroGuide(`Now connect to ${currentWire.toLabel}!`);
      } else {
        showElectroGuide(`Start from ${currentWire.fromLabel} first!`);
      }
    } else {
      if (nodeId === currentWire.to) {
        connectWire(currentWire.id);
        setSelectedNode(null);
        
        if (currentWireIndex < wires.length - 1) {
          setCurrentWireIndex(currentWireIndex + 1);
          showElectroGuide("Great connection! Keep wiring!");
        } else {
          addStar();
          showElectroGuide("⭐ All wires connected! Get ready for the magic moment!");
        }
      } else {
        showElectroGuide(`Hmm! That wire should connect to ${currentWire.toLabel}!`);
        setSelectedNode(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col">
      <div className="p-6 flex justify-between items-start">
        <div className="game-panel py-3 px-5">
          <p className="font-fredoka-one text-sm text-accent uppercase tracking-wider">Level 5</p>
          <p className="font-fredoka-one text-xl text-foreground">Connect the Wires</p>
        </div>

        {!allConnected && (
          <div className="game-panel py-2 px-4 flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${currentWire.colorClass}`} />
            <p className="font-fredoka text-foreground">
              Connect: <strong>{currentWire.fromLabel}</strong> → <strong>{currentWire.toLabel}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Wiring diagram */}
      <div className="flex-1 relative mx-6 mb-6">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
          {/* Connected wires */}
          {wires.filter(w => connectedWires.includes(w.id)).map(w => {
            const from = nodePositions[w.from];
            const to = nodePositions[w.to];
            const midY = (from.y + to.y) / 2;
            return (
              <path
                key={w.id}
                d={`M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`}
                stroke={w.color}
                strokeWidth="0.8"
                fill="none"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
          
          {/* Active wire hint */}
          {selectedNode && !allConnected && (
            <path
              d={`M ${nodePositions[selectedNode].x} ${nodePositions[selectedNode].y} 
                  C ${nodePositions[selectedNode].x} ${(nodePositions[selectedNode].y + nodePositions[currentWire.to].y) / 2}, 
                    ${nodePositions[currentWire.to].x} ${(nodePositions[selectedNode].y + nodePositions[currentWire.to].y) / 2}, 
                    ${nodePositions[currentWire.to].x} ${nodePositions[currentWire.to].y}`}
              stroke={currentWire.color}
              strokeWidth="0.5"
              fill="none"
              strokeDasharray="2 2"
              opacity={0.4}
            />
          )}
        </svg>

        {/* Nodes */}
        {Object.entries(nodePositions).map(([id, pos]) => {
          const isActive = selectedNode === id;
          const isTarget = selectedNode && currentWire?.to === id;
          const isFrom = !selectedNode && currentWire?.from === id && !allConnected;
          
          return (
            <div
              key={id}
              className={`absolute w-20 h-20 -ml-10 -mt-10 flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 ${
                isActive ? 'bg-accent/30 glow-accent scale-110' :
                isTarget ? 'bg-primary/20 glow-primary animate-pulse-glow scale-105' :
                isFrom ? 'bg-accent/20 border-2 border-accent animate-pulse-glow' :
                'bg-card border border-border hover:border-accent/50'
              }`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => handleNodeClick(id)}
            >
              <div className={`w-4 h-4 rounded-full ${
                isActive ? 'bg-accent' : isTarget ? 'bg-primary' : 'bg-muted-foreground/30'
              }`} />
              <span className="font-fredoka text-[10px] text-foreground mt-1 text-center leading-tight">
                {id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="px-6 pb-6">
        <div className="game-panel py-3 px-4 flex items-center justify-between">
          <div className="flex gap-2">
            {wires.map(w => (
              <div 
                key={w.id} 
                className={`w-8 h-2 rounded-full transition-all ${
                  connectedWires.includes(w.id) ? w.colorClass : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <span className="font-fredoka text-sm text-muted-foreground">
            {connectedWires.length}/{wires.length} wires
          </span>
          {allConnected && (
            <button onClick={nextLevel} className="game-btn game-btn-accent animate-float">
              ⚡ Activate Power! →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
