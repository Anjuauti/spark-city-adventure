import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '../GameContext';
import { Bot, ChevronRight } from 'lucide-react';

/* ---- Water surface ---- */
function Water() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = -1.5 + Math.sin(clock.elapsedTime * 1.2) * 0.04;
  });
  return (
    <mesh ref={ref} position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[22, 22, 32, 32]} />
      <meshStandardMaterial color="#4a90b8" transparent opacity={0.6} roughness={0.1} metalness={0.3} />
    </mesh>
  );
}

/* ---- Reservoir wall ---- */
function ReservoirWall() {
  return (
    <group position={[4, -0.5, 0]}>
      <mesh>
        <boxGeometry args={[1, 4, 10]} />
        <meshStandardMaterial color="#6D6D6D" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ---- Dam ---- */
function Dam({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Dam body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 5, 10]} />
        <meshStandardMaterial color="#7B7B7B" roughness={0.85} />
      </mesh>
      {/* Dam top railing */}
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[2.2, 0.15, 10.2]} />
        <meshStandardMaterial color="#9E9E9E" roughness={0.7} />
      </mesh>
      {/* Gate */}
      <mesh
        position={[0, isOpen ? 3.8 : 0.2, 1.2]}
        onClick={onClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[1.6, 2.2, 0.25]} />
        <meshStandardMaterial
          color={isOpen ? '#66BB6A' : '#E8B930'}
          emissive={isOpen ? '#66BB6A' : '#E8B930'}
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}

/* ---- Penstock pipe ---- */
function Penstock({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <group>
      <mesh position={[-3, -0.8, 0]} rotation={[0, 0, Math.PI / 10]}>
        <cylinderGeometry args={[0.4, 0.35, 6, 16]} />
        <meshStandardMaterial color="#546E7A" metalness={0.5} roughness={0.5} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

/* ---- Turbine with visible blades ---- */
function Turbine({ spinning }: { spinning: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (spinning && ref.current) ref.current.rotation.z += delta * 3;
  });
  return (
    <group position={[-6, -0.5, 0]}>
      {/* Housing */}
      <mesh>
        <cylinderGeometry args={[2, 2, 1, 32]} />
        <meshStandardMaterial color="#546E7A" metalness={0.6} roughness={0.4} transparent opacity={0.3} />
      </mesh>
      {/* Central hub */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 1.2, 16]} />
        <meshStandardMaterial color="#455A64" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Blades */}
      <group ref={ref}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]} position={[0, 0, 0]}>
            <boxGeometry args={[0.18, 1.7, 0.08]} />
            <meshStandardMaterial color="#90CAF9" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {/* Shaft connecting to generator */}
      <mesh position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 3, 8]} />
        <meshStandardMaterial color="#616161" metalness={0.9} />
      </mesh>
    </group>
  );
}

/* ---- Generator with visible rotor/stator ---- */
function Generator({ active }: { active: boolean }) {
  const rotorRef = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (active && rotorRef.current) rotorRef.current.rotation.y += dt * 3;
  });
  return (
    <group position={[-9, -0.5, 0]}>
      {/* Stator (outer shell - transparent) */}
      <mesh>
        <cylinderGeometry args={[1.4, 1.4, 2, 32, 1, true]} />
        <meshStandardMaterial color="#78909C" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Stator coils */}
      {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 1.1, 0, Math.sin(angle) * 1.1]}>
          <torusGeometry args={[0.15, 0.04, 8, 12]} />
          <meshStandardMaterial
            color="#E67E22"
            emissive={active ? '#F0B27A' : '#000'}
            emissiveIntensity={active ? 0.4 : 0}
          />
        </mesh>
      ))}
      {/* Rotor */}
      <group ref={rotorRef}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.12, 2.2, 8]} />
          <meshStandardMaterial color="#616161" metalness={0.9} />
        </mesh>
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5]}>
            <boxGeometry args={[0.2, 1.4, 0.1]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#C62828' : '#1565C0'}
              emissive={i % 2 === 0 ? '#C62828' : '#1565C0'}
              emissiveIntensity={active ? 0.3 : 0.05}
            />
          </mesh>
        ))}
      </group>
      {active && <pointLight intensity={1.2} distance={4} color="#5DADE2" />}
    </group>
  );
}

/* ---- Water flow particles ---- */
function WaterFlow({ active }: { active: boolean }) {
  const particles = useRef<THREE.Points>(null!);
  const count = 120;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = Math.random() * 6 - 3;
      pos[i * 3 + 1] = Math.random() * 2 - 2;
      pos[i * 3 + 2] = Math.random() * 2 - 1;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!active || !particles.current) return;
    const pos = particles.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] -= delta * 2.5;
      if (pos[i * 3] < -6) pos[i * 3] = 3;
    }
    particles.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;
  return (
    <points ref={particles} position={[0, -1, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#64B5F6" transparent opacity={0.7} />
    </points>
  );
}

/* ---- Mountains ---- */
function Scenery() {
  return (
    <group>
      {[[-8, 0, -10], [8, 0, -10], [0, 0, -14]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <coneGeometry args={[5, 9, 4]} />
          <meshStandardMaterial color="#6B9E6B" roughness={0.9} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#6B9E6B" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ======== Steps definition ======== */
const STEPS = [
  {
    id: 'intro',
    title: 'Hydroelectric Power Station',
    instruction: 'Click the golden dam gate to release water. Water stored behind the dam has potential energy — when released, it converts to kinetic energy!',
    hint: '👆 Tap the golden gate to open the dam',
  },
  {
    id: 'dam-open',
    title: 'Dam Gate Opened',
    instruction: 'The gate is open! Water rushes through the penstock pipe towards the turbine. Potential energy → Kinetic energy.',
    hint: '💧 Water flowing through the penstock',
  },
  {
    id: 'water-flowing',
    title: 'Turbine Rotation',
    instruction: 'Fast-moving water hits the turbine blades, making them spin. This converts kinetic energy into mechanical rotational energy.',
    hint: '⚙️ Turbine blades are spinning!',
  },
  {
    id: 'turbine-spinning',
    title: 'Electromagnetic Induction',
    instruction: 'The turbine shaft rotates magnets inside the generator. The changing magnetic field through copper coils generates alternating current (AC)!',
    hint: '🧲 Magnetic field generating electricity!',
  },
  {
    id: 'generating',
    title: 'Electricity Generated!',
    instruction: '⚡ AC electricity is now being generated! The generator converts mechanical energy into electrical energy through electromagnetic induction.',
    hint: '⚡ AC current flowing!',
  },
];

function HydroSceneContent() {
  const { hydroStep, setHydroStep } = useGame();
  const isOpen = hydroStep !== 'idle';
  const waterFlowing = ['water-flowing', 'turbine-spinning', 'generating', 'complete'].includes(hydroStep);
  const turbineSpinning = ['turbine-spinning', 'generating', 'complete'].includes(hydroStep);
  const generatorActive = ['generating', 'complete'].includes(hydroStep);

  const handleDamClick = () => {
    if (hydroStep === 'idle') {
      setHydroStep('dam-open');
    }
  };

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[10, 12, 5]} intensity={0.85} castShadow />
      <pointLight position={[-9, 2, 0]} intensity={generatorActive ? 1.5 : 0} color="#5DADE2" />

      <ReservoirWall />
      <Water />
      <Dam onClick={handleDamClick} isOpen={isOpen} />
      <Penstock active={isOpen} />
      <WaterFlow active={waterFlowing} />
      <Turbine spinning={turbineSpinning} />
      <Generator active={generatorActive} />
      <Scenery />

      <OrbitControls enablePan={false} minDistance={6} maxDistance={22} maxPolarAngle={Math.PI / 2.2} target={[-3, 0, 0]} />
      <Environment preset="sunset" />
    </>
  );
}

export default function HydroScene() {
  const { hydroStep, setHydroStep, nextLevel, addStar, addPoints, voltMessage } = useGame();
  const [readyToAdvance, setReadyToAdvance] = useState(false);

  const stepIndex = (() => {
    switch (hydroStep) {
      case 'idle': return 0;
      case 'dam-open': return 1;
      case 'water-flowing': return 2;
      case 'turbine-spinning': return 3;
      case 'generating': return 4;
      case 'complete': return 5;
      default: return 0;
    }
  })();

  const currentStep = STEPS[Math.min(stepIndex, STEPS.length - 1)];
  const canClickNext = stepIndex > 0 && stepIndex < STEPS.length && hydroStep !== 'complete';

  const handleNextStep = () => {
    switch (hydroStep) {
      case 'dam-open':
        setHydroStep('water-flowing');
        break;
      case 'water-flowing':
        setHydroStep('turbine-spinning');
        break;
      case 'turbine-spinning':
        setHydroStep('generating');
        break;
      case 'generating':
        setHydroStep('complete');
        addStar();
        addPoints(100);
        setReadyToAdvance(true);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex">
      {/* 3D scene */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [5, 5, 14], fov: 48 }}>
          <HydroSceneContent />
        </Canvas>

        {/* Level label */}
        <div className="absolute top-2 left-2 z-10 game-panel py-1.5 px-3">
          <p className="font-fredoka-one text-[10px] text-accent uppercase tracking-wider">Level 1 of 8</p>
          <p className="font-fredoka-one text-sm text-foreground">Hydroelectric Dam</p>
        </div>

        {/* Status hint */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 game-panel py-1.5 px-3">
          <p className="font-fredoka text-[11px] text-foreground text-center">
            {hydroStep === 'idle' ? currentStep.hint : hydroStep === 'complete' ? '⭐ Power generated!' : currentStep.hint}
          </p>
        </div>
      </div>

      {/* Right instruction panel */}
      <div className="w-60 bg-card border-l border-border flex flex-col">
        {/* Volt message */}
        <div className="p-2.5 border-b border-border bg-accent/5">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <p className="font-fredoka-one text-[10px] text-accent">Volt says:</p>
              <p className="font-fredoka text-[11px] text-foreground leading-snug">{voltMessage || "Let's generate electricity!"}</p>
            </div>
          </div>
        </div>

        {/* Current step explanation */}
        <div className="p-2.5 flex-1 overflow-y-auto">
          <p className="font-fredoka-one text-xs text-foreground mb-1.5">{currentStep.title}</p>
          <p className="font-fredoka text-[11px] text-muted-foreground leading-relaxed mb-3">{currentStep.instruction}</p>

          {/* Science box */}
          <div className="p-2 bg-muted/50 rounded-lg mb-3">
            <p className="font-fredoka-one text-[10px] text-accent mb-1">🔬 Science Fact</p>
            <p className="font-fredoka text-[10px] text-muted-foreground leading-snug">
              {stepIndex <= 1 && "Water behind a dam has gravitational potential energy. When released, gravity converts it to kinetic energy."}
              {stepIndex === 2 && "A turbine converts the kinetic energy of moving water into mechanical rotational energy."}
              {stepIndex === 3 && "Electromagnetic induction: when a magnet rotates inside wire coils, it creates an electric current!"}
              {stepIndex >= 4 && "Generators produce Alternating Current (AC) — the current direction switches back and forth as magnets rotate."}
            </p>
          </div>

          {/* Step progress */}
          <div className="space-y-1">
            {['Dam Gate', 'Water Flow', 'Turbine', 'Generator', 'Complete'].map((label, i) => (
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

        {/* Action buttons */}
        <div className="p-2.5 border-t border-border">
          {canClickNext && (
            <button onClick={handleNextStep} className="game-btn game-btn-accent w-full text-xs flex items-center justify-center gap-1">
              Next Step <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {hydroStep === 'complete' && (
            <button onClick={nextLevel} className="game-btn game-btn-accent w-full text-xs flex items-center justify-center gap-1">
              Explore the Generator → <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {hydroStep === 'idle' && (
            <p className="font-fredoka text-[10px] text-muted-foreground text-center">
              👆 Click the dam gate in the 3D scene
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
