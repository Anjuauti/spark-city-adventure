import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '../GameContext';
import { Bot, ChevronRight } from 'lucide-react';

function RotorMagnet({ spinning }: { spinning: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (spinning && ref.current) ref.current.rotation.y += delta * 2.5;
  });
  return (
    <group ref={ref}>
      {/* Shaft */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 4, 16]} />
        <meshStandardMaterial color="#616161" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Magnets */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.7, 0, Math.sin(angle) * 0.7]}>
          <boxGeometry args={[0.25, 1.8, 0.12]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#B71C1C' : '#0D47A1'}
            emissive={i % 2 === 0 ? '#B71C1C' : '#0D47A1'}
            emissiveIntensity={spinning ? 0.3 : 0.06}
            metalness={0.7}
          />
        </mesh>
      ))}
      {/* N/S labels via small colored caps */}
      {[0, Math.PI].map((angle, i) => (
        <mesh key={`cap-${i}`} position={[Math.cos(angle) * 0.7, 1, Math.sin(angle) * 0.7]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={i === 0 ? '#F44336' : '#2196F3'} emissive={i === 0 ? '#F44336' : '#2196F3'} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function StatorCoils({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (!active || !ref.current) return;
    ref.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.15 + Math.sin(clock.elapsedTime * 5 + i * 1.2) * 0.2;
    });
  });
  return (
    <group ref={ref}>
      {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 1.4, 0, Math.sin(angle) * 1.4]}>
          <torusGeometry args={[0.18, 0.06, 8, 16]} />
          <meshStandardMaterial color="#E67E22" emissive={active ? '#F0B27A' : '#000'} emissiveIntensity={active ? 0.2 : 0} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function MagneticFieldLines({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const count = 80;
  const positions = useMemo(() => new Float32Array(count * 3), []);
  useFrame(({ clock }) => {
    if (!active || !ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const t = (clock.elapsedTime * 0.4 + i / count) % 1;
      const angle = (i / count) * Math.PI * 4;
      const r = 0.4 + t * 1.1;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (t - 0.5) * 1.8;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  if (!active) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#85C1E9" transparent opacity={0.5} />
    </points>
  );
}

function GeneratorHousing() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[1.8, 1.8, 2.5, 32, 1, true]} />
        <meshStandardMaterial color="#B0BEC5" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      {[1.25, -1.25].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[1.8, 1.8, 0.04, 32]} />
          <meshStandardMaterial color="#90A4AE" transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

const STEPS = [
  {
    title: 'Generator Cross-Section',
    instruction: 'Click the generator to spin the rotor. The rotor contains magnets (red = North, blue = South) that spin inside copper coils.',
    science: 'A generator converts mechanical energy into electrical energy using electromagnetic induction.',
  },
  {
    title: 'Rotor Spinning',
    instruction: 'The rotor magnets are spinning! North (red) and South (blue) poles alternate, creating a changing magnetic field.',
    science: 'Moving magnets create a changing magnetic field around the copper coils of the stator.',
  },
  {
    title: 'Electromagnetic Induction',
    instruction: 'The changing magnetic field passes through the copper coils. This induces an electric current — electromagnetic induction!',
    science: "Faraday's Law: A changing magnetic field through a conductor induces an electromotive force (EMF).",
  },
  {
    title: 'AC Current Generated',
    instruction: 'Alternating Current (AC) is generated! The current direction switches each half rotation of the magnets.',
    science: 'AC means the current flows back and forth. This is the type of electricity used in homes worldwide.',
  },
];

function GeneratorContent() {
  const { generatorStep, setGeneratorStep } = useGame();
  const spinning = ['spinning', 'magnetic-field', 'current-generated', 'complete'].includes(generatorStep);
  const fieldActive = ['magnetic-field', 'current-generated', 'complete'].includes(generatorStep);
  const currentActive = ['current-generated', 'complete'].includes(generatorStep);

  const handleClick = () => {
    if (generatorStep === 'idle') setGeneratorStep('spinning');
  };

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 5]} intensity={0.85} />
      <pointLight position={[0, 0, 0]} intensity={currentActive ? 1 : 0} color="#F0B27A" />
      <group onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = generatorStep === 'idle' ? 'pointer' : 'default'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <GeneratorHousing />
        <RotorMagnet spinning={spinning} />
        <StatorCoils active={currentActive} />
        <MagneticFieldLines active={fieldActive} />
      </group>
      <OrbitControls enablePan={false} minDistance={4} maxDistance={10} />
      <Environment preset="warehouse" />
    </>
  );
}

export default function GeneratorScene() {
  const { generatorStep, setGeneratorStep, nextLevel, addStar, addPoints, voltMessage } = useGame();

  const stepIndex = (() => {
    switch (generatorStep) {
      case 'idle': return 0;
      case 'spinning': return 1;
      case 'magnetic-field': return 2;
      case 'current-generated': return 3;
      case 'complete': return 4;
      default: return 0;
    }
  })();

  const currentStep = STEPS[Math.min(stepIndex, STEPS.length - 1)];
  const canClickNext = stepIndex > 0 && stepIndex < STEPS.length && generatorStep !== 'complete';

  const handleNextStep = () => {
    switch (generatorStep) {
      case 'spinning': setGeneratorStep('magnetic-field'); break;
      case 'magnetic-field': setGeneratorStep('current-generated'); break;
      case 'current-generated':
        setGeneratorStep('complete');
        addStar();
        addPoints(100);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex">
      <div className="flex-1 relative">
        <Canvas camera={{ position: [4, 3, 4], fov: 48 }}>
          <GeneratorContent />
        </Canvas>

        <div className="absolute top-2 left-2 z-10 game-panel py-1.5 px-3">
          <p className="font-fredoka-one text-[10px] text-accent uppercase tracking-wider">Level 2 of 8</p>
          <p className="font-fredoka-one text-sm text-foreground">Generator Mechanism</p>
        </div>

        {/* AC Waveform */}
        {['current-generated', 'complete'].includes(generatorStep) && (
          <div className="absolute bottom-2 left-2 z-10 game-panel py-1.5 px-3">
            <p className="font-fredoka-one text-[9px] text-accent mb-1">AC Waveform</p>
            <svg width="140" height="35" viewBox="0 0 200 60">
              <path d="M 0 30 Q 25 0, 50 30 Q 75 60, 100 30 Q 125 0, 150 30 Q 175 60, 200 30"
                fill="none" stroke="hsl(200, 65%, 48%)" strokeWidth="2">
                <animate attributeName="stroke-dashoffset" from="400" to="0" dur="2s" repeatCount="indefinite" />
              </path>
              <line x1="0" y1="30" x2="200" y2="30" stroke="hsl(215, 12%, 50%)" strokeWidth="0.5" strokeDasharray="4" />
            </svg>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="w-60 bg-card border-l border-border flex flex-col">
        <div className="p-2.5 border-b border-border bg-accent/5">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <p className="font-fredoka-one text-[10px] text-accent">Volt says:</p>
              <p className="font-fredoka text-[11px] text-foreground leading-snug">{voltMessage || "Tap the generator!"}</p>
            </div>
          </div>
        </div>

        <div className="p-2.5 flex-1 overflow-y-auto">
          <p className="font-fredoka-one text-xs text-foreground mb-1.5">{currentStep.title}</p>
          <p className="font-fredoka text-[11px] text-muted-foreground leading-relaxed mb-3">{currentStep.instruction}</p>

          <div className="p-2 bg-muted/50 rounded-lg mb-3">
            <p className="font-fredoka-one text-[10px] text-accent mb-1">🔬 Science Fact</p>
            <p className="font-fredoka text-[10px] text-muted-foreground leading-snug">{currentStep.science}</p>
          </div>

          {/* Step indicators */}
          <div className="space-y-1">
            {['Spin Rotor', 'Magnetic Field', 'Induction', 'AC Generated'].map((label, i) => (
              <div key={label} className={`flex items-center gap-2 text-[10px] font-fredoka transition-all ${
                i + 1 < stepIndex ? 'text-accent' : i + 1 === stepIndex ? 'text-foreground font-semibold' : 'text-muted-foreground/50'
              }`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                  i + 1 < stepIndex ? 'bg-accent/20 text-accent' : i + 1 === stepIndex ? 'bg-primary/20 text-primary' : 'bg-muted'
                }`}>
                  {i + 1 < stepIndex ? '✓' : i + 1}
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
          {generatorStep === 'complete' && (
            <button onClick={nextLevel} className="game-btn game-btn-accent w-full text-xs flex items-center justify-center gap-1">
              Transmit Power → <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {generatorStep === 'idle' && (
            <p className="font-fredoka text-[10px] text-muted-foreground text-center">👆 Click the generator in the 3D scene</p>
          )}
        </div>
      </div>
    </div>
  );
}
