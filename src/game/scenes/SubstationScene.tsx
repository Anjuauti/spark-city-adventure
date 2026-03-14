import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '../GameContext';

function Transformer({ position, active }: { position: [number, number, number]; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (active && ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.15 + Math.sin(clock.elapsedTime * 3) * 0.1;
    }
  });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <boxGeometry args={[1.5, 2.5, 1]} />
        <meshStandardMaterial color="#455A64" emissive={active ? '#66BB6A' : '#000'} emissiveIntensity={0} metalness={0.7} roughness={0.3} />
      </mesh>
      {[-0.6, -0.2, 0.2, 0.6].map((y, i) => (
        <mesh key={i} position={[0.85, y, 0]}>
          <boxGeometry args={[0.1, 0.3, 0.8]} />
          <meshStandardMaterial color="#607D8B" metalness={0.6} />
        </mesh>
      ))}
      {[-0.4, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 1.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
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
        <boxGeometry args={[0.8, 1.5, 0.6]} />
        <meshStandardMaterial
          color={active ? '#66BB6A' : '#E57373'}
          emissive={active ? '#66BB6A' : '#E57373'}
          emissiveIntensity={0.15}
          metalness={0.5}
        />
      </mesh>
      <mesh position={[0, active ? 0.4 : -0.4, 0.35]} rotation={[active ? -0.3 : 0.3, 0, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.1]} />
        <meshStandardMaterial color="#212121" />
      </mesh>
    </group>
  );
}

function ControlPanel({ position, active }: { position: [number, number, number]; active: boolean }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[2, 2.5, 0.3]} />
        <meshStandardMaterial color="#37474F" metalness={0.5} />
      </mesh>
      {[[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.3], [0.5, -0.3]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.16]}>
          <boxGeometry args={[0.6, 0.4, 0.02]} />
          <meshStandardMaterial
            color={active ? '#1B5E20' : '#263238'}
            emissive={active ? '#66BB6A' : '#000'}
            emissiveIntensity={active ? 0.4 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

function SubstationContent() {
  const { substationStep, setSubstationStep, addStar, addPoints, showVoltGuide, setVoltageLevel } = useGame();

  const handleBreakerClick = () => {
    if (substationStep === 'idle') {
      setSubstationStep('breaker-on');
      showVoltGuide("Circuit breaker ON! This protects the system from overloads.");
      setTimeout(() => {
        setSubstationStep('voltage-set');
        setVoltageLevel(230);
        showVoltGuide("Voltage stepped down from 132kV to 230V — safe for homes! The transformer uses electromagnetic induction in reverse.");
        setTimeout(() => {
          setSubstationStep('complete');
          addStar();
          addPoints(100);
          showVoltGuide("⭐ Substation operational! Power is ready for distribution to homes!");
        }, 3000);
      }, 3000);
    }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 10, 5]} intensity={0.9} castShadow />
      <Transformer position={[-2, 1.25, 0]} active={substationStep !== 'idle'} />
      <Transformer position={[2, 1.25, 0]} active={['voltage-set', 'complete'].includes(substationStep)} />
      <CircuitBreaker position={[0, 0.75, 2]} active={substationStep !== 'idle'} onClick={handleBreakerClick} />
      <ControlPanel position={[0, 1.25, -2]} active={['voltage-set', 'complete'].includes(substationStep)} />
      {[[-4, 1, -3], [4, 1, -3], [-4, 1, 3], [4, 1, 3]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#78909C" />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#CFD8DC" roughness={0.9} />
      </mesh>
      <OrbitControls enablePan={false} minDistance={6} maxDistance={18} maxPolarAngle={Math.PI / 2.3} />
      <Environment preset="city" />
    </>
  );
}

export default function SubstationScene() {
  const { substationStep, nextLevel } = useGame();
  return (
    <div className="fixed inset-0 z-30">
      <Canvas shadows camera={{ position: [6, 5, 8], fov: 50 }}>
        <SubstationContent />
      </Canvas>

      <div className="fixed top-3 left-3 z-50 game-panel py-2 px-4">
        <p className="font-fredoka-one text-xs text-accent uppercase tracking-wider">Level 4 of 8</p>
        <p className="font-fredoka-one text-base text-foreground">Substation & Voltage Control</p>
      </div>

      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 game-panel py-2 px-3">
        <p className="font-fredoka text-xs text-foreground text-center">
          {substationStep === 'idle' && '👆 Tap the circuit breaker to activate!'}
          {substationStep === 'breaker-on' && '⚡ Stepping down voltage...'}
          {substationStep === 'voltage-set' && '✅ 132kV → 230V — Safe for homes!'}
          {substationStep === 'complete' && '⭐ Substation ready!'}
        </p>
      </div>

      <div className="fixed bottom-14 left-3 z-50 game-panel py-2 px-3 max-w-[240px]">
        <p className="font-fredoka text-[11px] text-muted-foreground">
          🔬 <strong>Step-down transformer:</strong> More turns on primary coil, fewer on secondary = lower voltage. Keeps homes safe!
        </p>
      </div>

      {substationStep === 'complete' && (
        <div className="fixed bottom-3 right-3 z-50">
          <button onClick={nextLevel} className="game-btn game-btn-accent text-sm animate-float">
            Enter the House →
          </button>
        </div>
      )}
    </div>
  );
}
