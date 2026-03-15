import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '../GameContext';
import { Bot, ChevronRight } from 'lucide-react';

function Tower({ position, active, onClick }: { position: [number, number, number]; active: boolean; onClick: () => void }) {
  return (
    <group position={position} onClick={onClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      {/* Main pole */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.25, 5, 0.25]} />
        <meshStandardMaterial color="#78909C" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Cross arms */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[2.8, 0.12, 0.12]} />
        <meshStandardMaterial color="#78909C" metalness={0.8} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[1.8, 0.1, 0.1]} />
        <meshStandardMaterial color="#78909C" metalness={0.8} />
      </mesh>
      {/* Diagonal braces */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={`brace-${i}`} position={[x * 0.4, 1.5, 0]} rotation={[0, 0, x * 0.15]}>
          <boxGeometry args={[0.06, 3, 0.06]} />
          <meshStandardMaterial color="#90A4AE" metalness={0.6} />
        </mesh>
      ))}
      {/* Insulators */}
      {[-1.2, 0, 1.2].map(x => (
        <mesh key={x} position={[x, 4.7, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.25, 8]} />
          <meshStandardMaterial
            color={active ? '#5DADE2' : '#90A4AE'}
            emissive={active ? '#5DADE2' : '#000'}
            emissiveIntensity={active ? 0.4 : 0}
          />
        </mesh>
      ))}
      {/* Base */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshStandardMaterial color="#757575" />
      </mesh>
    </group>
  );
}

function PowerLine({ from, to, active }: { from: [number, number, number]; to: [number, number, number]; active: boolean }) {
  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(from[0], from[1] + 4.7, from[2]),
      new THREE.Vector3((from[0] + to[0]) / 2, Math.min(from[1], to[1]) + 3.8, (from[2] + to[2]) / 2),
      new THREE.Vector3(to[0], to[1] + 4.7, to[2]),
    ]);
    return curve.getPoints(30);
  }, [from, to]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]} count={points.length} />
      </bufferGeometry>
      <lineBasicMaterial color={active ? '#5DADE2' : '#666'} linewidth={2} />
    </line>
  );
}

function ElectricityParticles({ from, to, active }: { from: [number, number, number]; to: [number, number, number]; active: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const count = 20;
  const positions = useMemo(() => new Float32Array(count * 3), []);

  useFrame(({ clock }) => {
    if (!active || !ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const t = ((clock.elapsedTime * 0.4 + i / count) % 1);
      pos[i * 3] = from[0] + (to[0] - from[0]) * t;
      pos[i * 3 + 1] = from[1] + 4.7 + Math.sin(t * Math.PI) * -0.9 + Math.sin(clock.elapsedTime * 8 + i) * 0.08;
      pos[i * 3 + 2] = from[2] + (to[2] - from[2]) * t;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.2} color="#7EC8E3" transparent opacity={0.7} />
    </points>
  );
}

function StepUpTransformer({ active }: { active: boolean }) {
  return (
    <group position={[-10, 0, 0]}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.3, 2, 0.8]} />
        <meshStandardMaterial color="#546E7A" emissive={active ? '#E8B930' : '#000'} emissiveIntensity={active ? 0.15 : 0} metalness={0.7} />
      </mesh>
      <mesh position={[-0.35, 1, 0.5]}>
        <torusGeometry args={[0.22, 0.04, 8, 12]} />
        <meshStandardMaterial color="#E67E22" />
      </mesh>
      <mesh position={[0.35, 1, 0.5]}>
        <torusGeometry args={[0.32, 0.04, 8, 12]} />
        <meshStandardMaterial color="#E67E22" />
      </mesh>
    </group>
  );
}

function TransmissionContent() {
  const { transmissionStep, setTransmissionStep } = useGame();
  const towers: [number, number, number][] = [[-6, 0, 0], [0, 0, 0], [6, 0, 0]];
  const stepMap: Record<string, number> = { idle: -1, tower1: 0, tower2: 1, tower3: 2, complete: 3 };
  const activeCount = stepMap[transmissionStep] ?? -1;

  const handleTowerClick = (index: number) => {
    if (index === activeCount + 1) {
      const steps: ('tower1' | 'tower2' | 'tower3')[] = ['tower1', 'tower2', 'tower3'];
      setTransmissionStep(steps[index]);
    }
  };

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[10, 15, 5]} intensity={0.9} />
      <StepUpTransformer active={activeCount >= 0} />
      {towers.map((pos, i) => (
        <Tower key={i} position={pos} active={i <= activeCount} onClick={() => handleTowerClick(i)} />
      ))}
      {towers.slice(0, -1).map((from, i) => (
        <group key={i}>
          <PowerLine from={from} to={towers[i + 1]} active={i < activeCount} />
          <ElectricityParticles from={from} to={towers[i + 1]} active={i < activeCount} />
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#8CB88C" roughness={0.9} />
      </mesh>
      <OrbitControls enablePan={false} minDistance={8} maxDistance={22} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="city" />
    </>
  );
}

const STEPS_INFO = [
  { title: 'Step-Up Transformer', text: 'Electricity from the generator is at low voltage. The step-up transformer increases it to very high voltage (132kV+) for efficient transmission.' },
  { title: 'Tower 1 Connected', text: 'High voltage electricity travels through aluminum conductors suspended on steel towers with ceramic insulators.' },
  { title: 'Tower 2 Connected', text: 'Power flows across long distances. High voltage means lower current, which reduces energy lost as heat in the wires.' },
  { title: 'Tower 3 Connected', text: 'The transmission line is complete! Electricity has traveled from the power plant to the substation area.' },
];

export default function TransmissionScene() {
  const { transmissionStep, setTransmissionStep, nextLevel, addStar, addPoints, voltMessage, showVoltGuide } = useGame();

  const stepIndex = (() => {
    switch (transmissionStep) {
      case 'idle': return 0;
      case 'tower1': return 1;
      case 'tower2': return 2;
      case 'tower3': return 3;
      case 'complete': return 4;
      default: return 0;
    }
  })();

  const info = STEPS_INFO[Math.min(stepIndex, STEPS_INFO.length - 1)];

  const handleComplete = () => {
    if (transmissionStep === 'tower3') {
      setTransmissionStep('complete');
      addStar();
      addPoints(100);
      showVoltGuide("⭐ Power transmitted! Now we step it down at the substation!");
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex">
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [0, 8, 16], fov: 48 }}>
          <TransmissionContent />
        </Canvas>

        <div className="absolute top-2 left-2 z-10 game-panel py-1.5 px-3">
          <p className="font-fredoka-one text-[10px] text-accent uppercase tracking-wider">Level 3 of 8</p>
          <p className="font-fredoka-one text-sm text-foreground">Step-Up & Transmission</p>
        </div>

        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 game-panel py-1.5 px-3">
          <p className="font-fredoka text-[11px] text-foreground text-center">
            {transmissionStep === 'idle' && '👆 Tap Tower 1 to send electricity!'}
            {transmissionStep === 'tower1' && '👆 Now tap Tower 2!'}
            {transmissionStep === 'tower2' && '👆 Tap Tower 3 to complete the line!'}
            {transmissionStep === 'tower3' && '⚡ Line connected!'}
            {transmissionStep === 'complete' && '⭐ Transmission complete!'}
          </p>
        </div>
      </div>

      <div className="w-60 bg-card border-l border-border flex flex-col">
        <div className="p-2.5 border-b border-border bg-accent/5">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <p className="font-fredoka-one text-[10px] text-accent">Volt says:</p>
              <p className="font-fredoka text-[11px] text-foreground leading-snug">{voltMessage || "Connect the towers!"}</p>
            </div>
          </div>
        </div>

        <div className="p-2.5 flex-1 overflow-y-auto">
          <p className="font-fredoka-one text-xs text-foreground mb-1.5">{info.title}</p>
          <p className="font-fredoka text-[11px] text-muted-foreground leading-relaxed mb-3">{info.text}</p>

          <div className="p-2 bg-muted/50 rounded-lg mb-3">
            <p className="font-fredoka-one text-[10px] text-accent mb-1">🔬 Why High Voltage?</p>
            <p className="font-fredoka text-[10px] text-muted-foreground leading-snug">
              Power = Voltage × Current. For the same power, higher voltage means lower current. Lower current means less heat loss in wires!
            </p>
          </div>

          <div className="space-y-1">
            {['Transformer', 'Tower 1', 'Tower 2', 'Tower 3'].map((label, i) => (
              <div key={label} className={`flex items-center gap-2 text-[10px] font-fredoka transition-all ${
                i < stepIndex ? 'text-accent' : i === stepIndex ? 'text-foreground font-semibold' : 'text-muted-foreground/50'
              }`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                  i < stepIndex ? 'bg-accent/20 text-accent' : i === stepIndex ? 'bg-primary/20 text-primary' : 'bg-muted'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="p-2.5 border-t border-border">
          {transmissionStep === 'tower3' && (
            <button onClick={handleComplete} className="game-btn game-btn-accent w-full text-xs flex items-center justify-center gap-1">
              Complete Transmission <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {transmissionStep === 'complete' && (
            <button onClick={nextLevel} className="game-btn game-btn-accent w-full text-xs flex items-center justify-center gap-1">
              To the Substation → <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {transmissionStep === 'idle' && (
            <p className="font-fredoka text-[10px] text-muted-foreground text-center">👆 Tap the first tower</p>
          )}
          {['tower1', 'tower2'].includes(transmissionStep) && (
            <p className="font-fredoka text-[10px] text-muted-foreground text-center">👆 Tap the next tower</p>
          )}
        </div>
      </div>
    </div>
  );
}
