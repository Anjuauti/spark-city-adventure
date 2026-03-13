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
      mat.emissiveIntensity = 0.2 + Math.sin(clock.elapsedTime * 3) * 0.15;
    }
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <boxGeometry args={[1.5, 2.5, 1]} />
        <meshStandardMaterial
          color="#455A64"
          emissive={active ? '#4CAF50' : '#000'}
          emissiveIntensity={0}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      {/* Fins */}
      {[-0.6, -0.2, 0.2, 0.6].map((y, i) => (
        <mesh key={i} position={[0.85, y, 0]}>
          <boxGeometry args={[0.1, 0.3, 0.8]} />
          <meshStandardMaterial color="#607D8B" metalness={0.6} />
        </mesh>
      ))}
      {/* Bushings */}
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
          color={active ? '#4CAF50' : '#F44336'}
          emissive={active ? '#4CAF50' : '#F44336'}
          emissiveIntensity={0.2}
          metalness={0.5}
        />
      </mesh>
      {/* Handle */}
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
      {/* Displays */}
      {[[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.3], [0.5, -0.3]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.16]}>
          <boxGeometry args={[0.6, 0.4, 0.02]} />
          <meshStandardMaterial
            color={active ? '#1B5E20' : '#263238'}
            emissive={active ? '#4CAF50' : '#000'}
            emissiveIntensity={active ? 0.5 : 0}
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
      showVoltGuide("Circuit breaker ON! This protects the system from overloads. Now the transformer steps voltage down.");
      setTimeout(() => {
        setSubstationStep('voltage-set');
        setVoltageLevel(230);
        showVoltGuide("Voltage stepped down from 132kV to 230V — safe for homes! The transformer uses electromagnetic induction in reverse.");
        setTimeout(() => {
          setSubstationStep('complete');
          addStar();
          addPoints(100);
          showVoltGuide("⭐ Substation operational! Power is ready for distribution to homes!");
        }, 2000);
      }, 2000);
    }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 10, 5]} intensity={1} castShadow />

      <Transformer position={[-2, 1.25, 0]} active={substationStep !== 'idle'} />
      <Transformer position={[2, 1.25, 0]} active={['voltage-set', 'complete'].includes(substationStep)} />
      <CircuitBreaker position={[0, 0.75, 2]} active={substationStep !== 'idle'} onClick={handleBreakerClick} />
      <ControlPanel position={[0, 1.25, -2]} active={['voltage-set', 'complete'].includes(substationStep)} />

      {/* Fence */}
      {[[-4, 1, -3], [4, 1, -3], [-4, 1, 3], [4, 1, 3]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#78909C" />
        </mesh>
      ))}

      {/* Ground */}
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

      <div className="fixed top-6 left-6 z-50 game-panel py-3 px-5">
        <p className="font-fredoka-one text-sm text-accent uppercase tracking-wider">Level 4 of 8</p>
        <p className="font-fredoka-one text-xl text-foreground">Substation & Voltage Control</p>
      </div>

      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 game-panel py-2 px-4">
        <p className="font-fredoka text-foreground text-center">
          {substationStep === 'idle' && '👆 Tap the circuit breaker to activate the substation!'}
          {substationStep === 'breaker-on' && '⚡ Stepping down voltage...'}
          {substationStep === 'voltage-set' && '✅ 132kV → 230V — Safe for homes!'}
          {substationStep === 'complete' && '⭐ Substation ready!'}
        </p>
      </div>

      <div className="fixed bottom-20 left-6 z-50 game-panel py-2 px-4 max-w-xs">
        <p className="font-fredoka text-sm text-muted-foreground">
          🔬 <strong>Step-down transformer:</strong> More turns on primary coil, fewer on secondary = lower voltage output. This keeps homes safe!
        </p>
      </div>

      {substationStep === 'complete' && (
        <div className="fixed bottom-6 right-6 z-50">
          <button onClick={nextLevel} className="game-btn game-btn-accent text-xl animate-float">
            Enter the House →
          </button>
        </div>
      )}
    </div>
  );
}
