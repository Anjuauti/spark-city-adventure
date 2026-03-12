import { useState } from 'react';
import { useGame } from '../GameContext';
import { Lightbulb, Fan, Tv, Plug, Power } from 'lucide-react';

interface InteractiveItem {
  id: string;
  name: string;
  room: string;
  icon: typeof Lightbulb;
  type: 'light' | 'fan' | 'device';
}

const items: InteractiveItem[] = [
  { id: 'hall-light', name: 'Hall Lights', room: 'Hall', icon: Lightbulb, type: 'light' },
  { id: 'hall-fan', name: 'Hall Fan', room: 'Hall', icon: Fan, type: 'fan' },
  { id: 'hall-tv', name: 'TV', room: 'Hall', icon: Tv, type: 'device' },
  { id: 'kitchen-light', name: 'Kitchen Light', room: 'Kitchen', icon: Lightbulb, type: 'light' },
  { id: 'bed-light', name: 'Bedroom Light', room: 'Bedroom', icon: Lightbulb, type: 'light' },
  { id: 'bed-fan', name: 'Bedroom Fan', room: 'Bedroom', icon: Fan, type: 'fan' },
];

export default function ExploreMode() {
  const { nextLevel, showElectroGuide } = useGame();
  const [switches, setSwitches] = useState<Record<string, boolean>>({});
  const [interacted, setInteracted] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const newState = !switches[id];
    setSwitches(prev => ({ ...prev, [id]: newState }));
    
    const newInteracted = new Set(interacted);
    newInteracted.add(id);
    setInteracted(newInteracted);

    const item = items.find(i => i.id === id);
    if (newState) {
      showElectroGuide(`${item?.name} is ON! ⚡`);
    } else {
      showElectroGuide(`${item?.name} is OFF.`);
    }

    if (newInteracted.size >= 2 && newState) {
      setTimeout(() => {
        showElectroGuide("🎉 Amazing! You've powered the house! Time to celebrate!");
      }, 1000);
    }
  };

  const canCelebrate = interacted.size >= 2;
  const rooms = ['Hall', 'Kitchen', 'Bedroom'];

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-br from-background via-background to-accent/5 flex flex-col">
      <div className="p-6 flex justify-between items-start">
        <div className="game-panel py-3 px-5">
          <p className="font-fredoka-one text-sm text-primary uppercase tracking-wider">Explore Mode</p>
          <p className="font-fredoka-one text-xl text-foreground">Walk Through the House</p>
        </div>
        <div className="game-panel py-2 px-4">
          <p className="font-fredoka text-foreground">🏠 Toggle switches to control appliances!</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 px-6 pb-6">
        {rooms.map(room => (
          <div key={room} className="game-panel flex flex-col">
            <h3 className="font-fredoka-one text-2xl text-foreground mb-4">
              {room === 'Hall' ? '🛋' : room === 'Kitchen' ? '🍳' : '🛏'} {room}
            </h3>
            <div className="space-y-3 flex-1">
              {items.filter(i => i.room === room).map(item => {
                const Icon = item.icon;
                const isOn = switches[item.id];
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      isOn 
                        ? 'bg-primary/15 glow-primary' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => toggle(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-6 h-6 transition-colors ${
                        isOn ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className="font-fredoka text-foreground">{item.name}</span>
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

            {/* Room visualization */}
            <div className={`mt-4 h-24 rounded-xl flex items-center justify-center transition-all duration-500 ${
              items.filter(i => i.room === room).some(i => switches[i.id])
                ? 'bg-primary/10'
                : 'bg-muted/50'
            }`}>
              {items.filter(i => i.room === room).some(i => switches[i.id]) ? (
                <div className="text-center">
                  <Lightbulb className="w-10 h-10 text-primary mx-auto animate-pulse-glow" />
                  <p className="font-fredoka text-sm text-primary mt-1">Powered! ⚡</p>
                </div>
              ) : (
                <div className="text-center">
                  <Power className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                  <p className="font-fredoka text-sm text-muted-foreground mt-1">Turn on switches</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {canCelebrate && (
        <div className="fixed bottom-6 right-6 z-50">
          <button onClick={nextLevel} className="game-btn text-xl animate-float">
            🎉 Celebrate! →
          </button>
        </div>
      )}
    </div>
  );
}
