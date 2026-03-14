import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '../GameContext';

function RotorMagnet({ spinning }: { spinning: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (spinning && ref.current) ref.current.rotation.y += delta * 3;
  });
  return (
    <group ref={ref}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 4, 16]} />
        <meshStandardMaterial color="#78909C" metalness={0.9} roughness={0.2} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.8, 0, Math.sin(angle) * 0.8]}>
          <boxGeometry args={[0.3, 2, 0.15]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#C0392B' : '#2E86C1'}
            emissive={i % 2 === 0 ? '#C0392B' : '#2E86C1'}
            emissiveIntensity={spinning ? 0.3 : 0.08}
            metalness={0.7}
          />
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
      mat.emissiveIntensity = 0.15 + Math.sin(clock.elapsedTime * 6 + i * 1.5) * 0.2;
    });
  });
  return (
    <group ref={ref}>
      {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5]}>
          <torusGeometry args={[0.2, 0.08, 8, 16]} />
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
      const t = (clock.elapsedTime * 0.5 + i / count) % 1;
      const angle = (i / count) * Math.PI * 4;
      const r = 0.5 + t * 1.2;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (t - 0.5) * 2;
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
      <pointsMaterial size={0.08} color="#85C1E9" transparent opacity={0.6} />
    </points>
  );
}

function GeneratorHousing() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[2, 2, 2.5, 32, 1, true]} />
        <meshStandardMaterial color="#B0BEC5" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[2, 2, 0.05, 32]} />
        <meshStandardMaterial color="#90A4AE" transparent opacity={0.25} />
      </mesh>
      <mesh position={[0, -1.25, 0]}>
        <cylinderGeometry args={[2, 2, 0.05, 32]} />
        <meshStandardMaterial color="#90A4AE" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function GeneratorContent() {
  const { generatorStep, setGeneratorStep, addStar, addPoints, showVoltGuide } = useGame();
  const spinning = ['spinning', 'magnetic-field', 'current-generated', 'complete'].includes(generatorStep);
  const fieldActive = ['magnetic-field', 'current-generated', 'complete'].includes(generatorStep);
  const currentActive = ['current-generated', 'complete'].includes(generatorStep);

  const handleClick = () => {
    if (generatorStep === 'idle') {
      setGeneratorStep('spinning');
      showVoltGuide("The rotor starts spinning! Red and blue magnets are North and South poles.");
      setTimeout(() => {
        setGeneratorStep('magnetic-field');
        showVoltGuide("The changing magnetic field passes through copper coils — electromagnetic induction!");
        setTimeout(() => {
          setGeneratorStep('current-generated');
          showVoltGuide("Alternating Current (AC) is generated! Direction changes as magnets rotate.");
          setTimeout(() => {
            setGeneratorStep('complete');
            addStar();
            addPoints(100);
            showVoltGuide("⭐ You understand generators! Now let's transmit this power!");
          }, 3000);
        }, 3000);
      }, 3000);
    }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} />
      <pointLight position={[0, 0, 0]} intensity={currentActive ? 1.2 : 0} color="#F0B27A" />

      <group onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <GeneratorHousing />
        <RotorMagnet spinning={spinning} />
        <StatorCoils active={currentActive} />
        <MagneticFieldLines active={fieldActive} />
      </group>

      <OrbitControls enablePan={false} minDistance={4} maxDistance={12} />
      <Environment preset="warehouse" />
    </>
  );
}

export default function GeneratorScene() {
  const { generatorStep, nextLevel } = useGame();

  return (
    <div className="fixed inset-0 z-30">
      <Canvas camera={{ position: [4, 3, 4], fov: 50 }}>
        <GeneratorContent />
      </Canvas>

      <div className="fixed top-3 left-3 z-50 game-panel py-2 px-4">
        <p className="font-fredoka-one text-xs text-accent uppercase tracking-wider">Level 2 of 8</p>
        <p className="font-fredoka-one text-base text-foreground">Generator Mechanism</p>
      </div>

      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 game-panel py-2 px-3">
        <p className="font-fredoka text-xs text-foreground text-center">
          {generatorStep === 'idle' && '👆 Tap the generator to spin the rotor!'}
          {generatorStep === 'spinning' && '🔄 Rotor magnets spinning — N & S poles alternate!'}
          {generatorStep === 'magnetic-field' && '🧲 Changing magnetic field induces current!'}
          {generatorStep === 'current-generated' && '⚡ AC electricity generated!'}
          {generatorStep === 'complete' && '⭐ Generator mastered!'}
        </p>
      </div>

      {['current-generated', 'complete'].includes(generatorStep) && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 game-panel py-2 px-4">
          <p className="font-fredoka-one text-[10px] text-accent mb-1">AC Waveform</p>
          <svg width="160" height="40" viewBox="0 0 200 60">
            <path d="M 0 30 Q 25 0, 50 30 Q 75 60, 100 30 Q 125 0, 150 30 Q 175 60, 200 30"
              fill="none" stroke="hsl(200, 65%, 48%)" strokeWidth="2">
              <animate attributeName="stroke-dashoffset" from="400" to="0" dur="2s" repeatCount="indefinite" />
            </path>
            <line x1="0" y1="30" x2="200" y2="30" stroke="hsl(215, 12%, 50%)" strokeWidth="0.5" strokeDasharray="4" />
          </svg>
        </div>
      )}

      {generatorStep === 'complete' && (
        <div className="fixed bottom-3 right-3 z-50">
          <button onClick={nextLevel} className="game-btn game-btn-accent text-sm animate-float">
            Transmit Power →
          </button>
        </div>
      )}
    </div>
  );
}
