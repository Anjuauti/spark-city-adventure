import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '../GameContext';
import { Bot, ChevronRight } from 'lucide-react';

function Transformer({ position, active }: { position: [number, number, number]; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (active && ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.12 + Math.sin(clock.elapsedTime * 2.5) * 0.08;
    }
  });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <boxGeometry args={[1.3, 2.2, 0.9]} />
        <meshStandardMaterial color="#455A64" emissive={active ? '#66BB6A' : '#000'} emissiveIntensity={0} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Cooling fins */}
      {[-0.55, -0.2, 0.15, 0.5].map((y, i) => (
        <mesh key={i} position={[0.75, y, 0]}>
          <boxGeometry args={[0.08, 0.25, 0.7]} />
          <meshStandardMaterial color="#607D8B" metalness={0.6} />
        </mesh>
      ))}
      {/* Bushings */}
      {[-0.35, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 1.35, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
          <meshStandardMaterial color="#BCAAA4" />
        </mesh>
      ))}
    </group>
  );
}

function CircuitBreaker({ position, active, onClick }: { position: [number, number, number]; active: boolean; onClick: () => void }) {
  return (
    <group position={position} onClick={onClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <mesh>
        <boxGeometry args={[0.7, 1.3, 0.5]} />
        <meshStandardMaterial
          color={active ? '#66BB6A' : '#E57373'}
          emissive={active ? '#66BB6A' : '#E57373'}
          emissiveIntensity={0.12}
          metalness={0.5}
        />
      </mesh>
      {/* Switch lever */}
      <mesh position={[0, active ? 0.35 : -0.35, 0.3]} rotation={[active ? -0.3 : 0.3, 0, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.08]} />
        <meshStandardMaterial color="#212121" />
      </mesh>
    </group>
  );
}

function ControlPanel({ position, active }: { position: [number, number, number]; active: boolean }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.8, 2.2, 0.25]} />
        <meshStandardMaterial color="#37474F" metalness={0.5} />
      </mesh>
      {[[-0.45, 0.4], [0.45, 0.4], [-0.45, -0.3], [0.45, -0.3]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.14]}>
          <boxGeometry args={[0.5, 0.35, 0.02]} />
          <meshStandardMaterial
            color={active ? '#1B5E20' : '#263238'}
            emissive={active ? '#66BB6A' : '#000'}
            emissiveIntensity={active ? 0.35 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

const STEPS = [
  {
    title: 'Substation Overview',
    instruction: 'Click the circuit breaker (red box) to activate the substation. Circuit breakers protect the system from overloads.',
    science: 'A substation contains transformers, circuit breakers, and control equipment to manage electricity distribution.',
  },
  {
    title: 'Circuit Breaker Active',
    instruction: 'The breaker is ON! It monitors current flow and can instantly disconnect if there\'s a fault — protecting equipment and people.',
    science: 'Circuit breakers can interrupt thousands of amperes of fault current in milliseconds.',
  },
  {
    title: 'Voltage Stepped Down',
    instruction: 'The step-down transformer reduces voltage from 132,000V to 230V — safe for homes! It uses electromagnetic induction in reverse.',
    science: 'Transformers work by electromagnetic induction between two coils. More turns = higher voltage, fewer turns = lower voltage.',
  },
];

function SubstationContent() {
  const { substationStep, setSubstationStep } = useGame();

  const handleBreakerClick = () => {
    if (substationStep === 'idle') setSubstationStep('breaker-on');
  };

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[8, 10, 5]} intensity={0.85} castShadow />
      <Transformer position={[-2, 1.1, 0]} active={substationStep !== 'idle'} />
      <Transformer position={[2, 1.1, 0]} active={['voltage-set', 'complete'].includes(substationStep)} />
      <CircuitBreaker position={[0, 0.65, 2]} active={substationStep !== 'idle'} onClick={handleBreakerClick} />
      <ControlPanel position={[0, 1.1, -2]} active={['voltage-set', 'complete'].includes(substationStep)} />
      {/* Fence posts */}
      {[[-4, 0.8, -3], [4, 0.8, -3], [-4, 0.8, 3], [4, 0.8, 3]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.08, 1.6, 0.08]} />
          <meshStandardMaterial color="#78909C" />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#CFD8DC" roughness={0.9} />
      </mesh>
      <OrbitControls enablePan={false} minDistance={6} maxDistance={16} maxPolarAngle={Math.PI / 2.3} />
      <Environment preset="city" />
    </>
  );
}

export default function SubstationScene() {
  const { substationStep, setSubstationStep, nextLevel, addStar, addPoints, voltMessage, setVoltageLevel, showVoltGuide } = useGame();

  const stepIndex = (() => {
    switch (substationStep) {
      case 'idle': return 0;
      case 'breaker-on': return 1;
      case 'voltage-set': return 2;
      case 'complete': return 3;
      default: return 0;
    }
  })();

  const info = STEPS[Math.min(stepIndex, STEPS.length - 1)];

  const handleNextStep = () => {
    switch (substationStep) {
      case 'breaker-on':
        setSubstationStep('voltage-set');
        setVoltageLevel(230);
        showVoltGuide("Voltage stepped down: 132kV → 230V! Safe for homes.");
        break;
      case 'voltage-set':
        setSubstationStep('complete');
        addStar();
        addPoints(100);
        showVoltGuide("⭐ Substation operational! Power ready for homes!");
        break;
    }
  };

  const canClickNext = stepIndex > 0 && stepIndex < STEPS.length && substationStep !== 'complete';

  return (
    <div className="fixed inset-0 z-30 flex">
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [6, 5, 8], fov: 48 }}>
          <SubstationContent />
        </Canvas>

        <div className="absolute top-2 left-2 z-10 game-panel py-1.5 px-3">
          <p className="font-fredoka-one text-[10px] text-accent uppercase tracking-wider">Level 4 of 8</p>
          <p className="font-fredoka-one text-sm text-foreground">Substation & Voltage</p>
        </div>

        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 game-panel py-1.5 px-3">
          <p className="font-fredoka text-[11px] text-foreground text-center">
            {substationStep === 'idle' && '👆 Tap the circuit breaker!'}
            {substationStep === 'breaker-on' && '⚡ Breaker ON — stepping voltage down...'}
            {substationStep === 'voltage-set' && '✅ 132kV → 230V — Safe for homes!'}
            {substationStep === 'complete' && '⭐ Substation ready!'}
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
              <p className="font-fredoka text-[11px] text-foreground leading-snug">{voltMessage || "Activate the breaker!"}</p>
            </div>
          </div>
        </div>

        <div className="p-2.5 flex-1 overflow-y-auto">
          <p className="font-fredoka-one text-xs text-foreground mb-1.5">{info.title}</p>
          <p className="font-fredoka text-[11px] text-muted-foreground leading-relaxed mb-3">{info.instruction}</p>

          <div className="p-2 bg-muted/50 rounded-lg mb-3">
            <p className="font-fredoka-one text-[10px] text-accent mb-1">🔬 Science Fact</p>
            <p className="font-fredoka text-[10px] text-muted-foreground leading-snug">{info.science}</p>
          </div>

          <div className="space-y-1">
            {['Circuit Breaker', 'Step-Down', 'Distribution'].map((label, i) => (
              <div key={label} className={`flex items-center gap-2 text-[10px] font-fredoka transition-all ${
                i + 1 <= stepIndex ? 'text-accent' : i + 1 === stepIndex + 1 ? 'text-foreground font-semibold' : 'text-muted-foreground/50'
              }`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                  i + 1 <= stepIndex ? 'bg-accent/20 text-accent' : i + 1 === stepIndex + 1 ? 'bg-primary/20 text-primary' : 'bg-muted'
                }`}>
                  {i + 1 <= stepIndex ? '✓' : i + 1}
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="p-2.5 border-t border-border">
          {canClickNext && (
            <button onClick={handleNextStep} className="game-btn game-btn-accent w-full text-xs flex items-center justify-center gap-1">
              Next Step <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {substationStep === 'complete' && (
            <button onClick={nextLevel} className="game-btn game-btn-accent w-full text-xs flex items-center justify-center gap-1">
              Enter the House → <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {substationStep === 'idle' && (
            <p className="font-fredoka text-[10px] text-muted-foreground text-center">👆 Click the red breaker</p>
          )}
        </div>
      </div>
    </div>
  );
}
