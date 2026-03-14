import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '../GameContext';

function Tower({ position, active, onClick }: { position: [number, number, number]; active: boolean; onClick: () => void; }) {
  return (
    <group position={position} onClick={onClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.3, 5, 0.3]} />
        <meshStandardMaterial color="#78909C" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[3, 0.15, 0.15]} />
        <meshStandardMaterial color="#78909C" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[2, 0.12, 0.12]} />
        <meshStandardMaterial color="#78909C" metalness={0.8} roughness={0.3} />
      </mesh>
      {[-1, 0, 1].map(x => (
        <mesh key={x} position={[x, 4.7, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
          <meshStandardMaterial
            color={active ? '#5DADE2' : '#90A4AE'}
            emissive={active ? '#5DADE2' : '#000'}
            emissiveIntensity={active ? 0.4 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

function PowerLine({ from, to, active }: { from: [number, number, number]; to: [number, number, number]; active: boolean }) {
  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(from[0], from[1] + 4.7, from[2]),
      new THREE.Vector3((from[0] + to[0]) / 2, Math.min(from[1], to[1]) + 4, (from[2] + to[2]) / 2),
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
      const t = ((clock.elapsedTime * 0.5 + i / count) % 1);
      pos[i * 3] = from[0] + (to[0] - from[0]) * t;
      pos[i * 3 + 1] = from[1] + 4.7 + Math.sin(t * Math.PI) * -0.7 + Math.sin(clock.elapsedTime * 10 + i) * 0.1;
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
      <pointsMaterial size={0.25} color="#7EC8E3" transparent opacity={0.8} />
    </points>
  );
}

function StepUpTransformer({ active }: { active: boolean }) {
  return (
    <group position={[-10, 0, 0]}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.5, 2, 1]} />
        <meshStandardMaterial color="#546E7A" emissive={active ? '#E8B930' : '#000'} emissiveIntensity={active ? 0.2 : 0} metalness={0.7} />
      </mesh>
      <mesh position={[-0.4, 1, 0.6]}>
        <torusGeometry args={[0.3, 0.05, 8, 16]} />
        <meshStandardMaterial color="#E67E22" />
      </mesh>
      <mesh position={[0.4, 1, 0.6]}>
        <torusGeometry args={[0.4, 0.05, 8, 16]} />
        <meshStandardMaterial color="#E67E22" />
      </mesh>
    </group>
  );
}

function TransmissionContent() {
  const { transmissionStep, setTransmissionStep, addStar, addPoints, showVoltGuide } = useGame();
  const towers: [number, number, number][] = [[-6, 0, 0], [0, 0, 0], [6, 0, 0]];
  const stepMap: Record<string, number> = { idle: -1, tower1: 0, tower2: 1, tower3: 2, complete: 3 };
  const activeCount = stepMap[transmissionStep] ?? -1;

  const handleTowerClick = (index: number) => {
    if (index === activeCount + 1) {
      const steps: ('tower1' | 'tower2' | 'tower3')[] = ['tower1', 'tower2', 'tower3'];
      setTransmissionStep(steps[index]);
      const messages = [
        "Tower 1 activated! Electricity is stepped up to high voltage to reduce power loss!",
        "Tower 2 connected! High voltage travels efficiently over long distances!",
        "All towers connected! ⚡ Power flows through transmission lines!"
      ];
      showVoltGuide(messages[index]);
      if (index === 2) {
        setTimeout(() => {
          setTransmissionStep('complete');
          addStar();
          addPoints(100);
          showVoltGuide("⭐ Power transmitted! Now we step it down at the substation!");
        }, 2500);
      }
    }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 5]} intensity={1} />
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
      <OrbitControls enablePan={false} minDistance={8} maxDistance={25} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="city" />
    </>
  );
}

export default function TransmissionScene() {
  const { transmissionStep, nextLevel } = useGame();
  return (
    <div className="fixed inset-0 z-30">
      <Canvas shadows camera={{ position: [0, 8, 16], fov: 50 }}>
        <TransmissionContent />
      </Canvas>

      <div className="fixed top-3 left-3 z-50 game-panel py-2 px-4">
        <p className="font-fredoka-one text-xs text-accent uppercase tracking-wider">Level 3 of 8</p>
        <p className="font-fredoka-one text-base text-foreground">Step-Up & Transmission</p>
      </div>

      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 game-panel py-2 px-3">
        <p className="font-fredoka text-xs text-foreground text-center">
          {transmissionStep === 'idle' && '👆 Tap Tower 1 to send electricity!'}
          {transmissionStep === 'tower1' && '👆 Now tap Tower 2!'}
          {transmissionStep === 'tower2' && '👆 Tap Tower 3 to complete the line!'}
          {transmissionStep === 'tower3' && '⚡ Connecting...'}
          {transmissionStep === 'complete' && '⭐ Transmission complete!'}
        </p>
      </div>

      <div className="fixed bottom-14 left-3 z-50 game-panel py-2 px-3 max-w-[240px]">
        <p className="font-fredoka text-[11px] text-muted-foreground">
          🔬 <strong>Why high voltage?</strong> Higher voltage means lower current for the same power, reducing energy lost as heat!
        </p>
      </div>

      {transmissionStep === 'complete' && (
        <div className="fixed bottom-3 right-3 z-50">
          <button onClick={nextLevel} className="game-btn game-btn-accent text-sm animate-float">
            To the Substation →
          </button>
        </div>
      )}
    </div>
  );
}
