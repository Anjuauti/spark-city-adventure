import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '../GameContext';

function Water() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = -1.5 + Math.sin(clock.elapsedTime * 2) * 0.05;
    }
  });
  return (
    <mesh ref={ref} position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20, 32, 32]} />
      <meshStandardMaterial color="#1e90ff" transparent opacity={0.7} roughness={0.1} metalness={0.3} />
    </mesh>
  );
}

function Dam({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[8, 4, 1.5]} />
        <meshStandardMaterial color="#8B8B8B" roughness={0.8} />
      </mesh>
      <mesh
        position={[0, isOpen ? 3.5 : 0.5, 0.8]}
        onClick={onClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[2, 2, 0.3]} />
        <meshStandardMaterial
          color={isOpen ? '#4CAF50' : '#FFD700'}
          emissive={isOpen ? '#4CAF50' : '#FFD700'}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

function Turbine({ spinning }: { spinning: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (spinning && ref.current) {
      ref.current.rotation.z += delta * 4;
    }
  });
  return (
    <group position={[-5, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[1.5, 1.5, 0.5, 32]} />
        <meshStandardMaterial color="#607D8B" metalness={0.7} roughness={0.3} />
      </mesh>
      <group ref={ref}>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]} position={[0, 0, 0.3]}>
            <boxGeometry args={[0.2, 1.3, 0.1]} />
            <meshStandardMaterial color="#B0BEC5" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Generator({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (active && ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(clock.elapsedTime * 5) * 0.2;
    }
  });
  return (
    <group position={[-8, 0, 0]}>
      <mesh ref={ref}>
        <cylinderGeometry args={[1, 1, 2, 32]} />
        <meshStandardMaterial
          color="#455A64"
          metalness={0.8}
          roughness={0.2}
          emissive={active ? '#00BCD4' : '#000'}
          emissiveIntensity={active ? 0.3 : 0}
        />
      </mesh>
    </group>
  );
}

function WaterFlow({ active }: { active: boolean }) {
  const particles = useRef<THREE.Points>(null!);
  const count = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = Math.random() * 5 - 2.5;
      pos[i * 3 + 1] = Math.random() * 2 - 2;
      pos[i * 3 + 2] = Math.random() * 2 - 1;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!active || !particles.current) return;
    const pos = particles.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] -= delta * 3;
      if (pos[i * 3] < -5) pos[i * 3] = 2.5;
    }
    particles.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={particles} position={[0, -0.5, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#00BCD4" transparent opacity={0.8} />
    </points>
  );
}

function Penstock({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <mesh position={[-2.5, -0.5, 0]} rotation={[0, 0, Math.PI / 12]}>
      <cylinderGeometry args={[0.3, 0.3, 5, 16]} />
      <meshStandardMaterial color="#546E7A" metalness={0.6} roughness={0.4} transparent opacity={0.8} />
    </mesh>
  );
}

function HydroSceneContent() {
  const { hydroStep, setHydroStep, addStar, addPoints, showVoltGuide } = useGame();

  const handleDamClick = () => {
    if (hydroStep === 'idle') {
      setHydroStep('dam-open');
      showVoltGuide("Great! The dam gate is open! Water's kinetic energy will push the turbine!");
      setTimeout(() => {
        setHydroStep('water-flowing');
        showVoltGuide("Water flows through the penstock — its potential energy converts to kinetic energy!");
        setTimeout(() => {
          setHydroStep('turbine-spinning');
          showVoltGuide("The turbine's mechanical rotation drives the generator shaft!");
          setTimeout(() => {
            setHydroStep('generating');
            showVoltGuide("Electromagnetic induction! The rotating magnetic field generates AC electricity! ⚡");
            setTimeout(() => {
              setHydroStep('complete');
              addStar();
              addPoints(100);
              showVoltGuide("⭐ Electricity generated! Now let's see how the generator works inside!");
            }, 1500);
          }, 1500);
        }, 1500);
      }, 1000);
    }
  };

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-8, 3, 0]} intensity={hydroStep === 'generating' || hydroStep === 'complete' ? 2 : 0} color="#00BCD4" />

      <Water />
      <Dam onClick={handleDamClick} isOpen={hydroStep !== 'idle'} />
      <Penstock active={hydroStep !== 'idle'} />
      <WaterFlow active={['water-flowing', 'turbine-spinning', 'generating', 'complete'].includes(hydroStep)} />
      <Turbine spinning={['turbine-spinning', 'generating', 'complete'].includes(hydroStep)} />
      <Generator active={['generating', 'complete'].includes(hydroStep)} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#4a7c59" roughness={0.9} />
      </mesh>

      {[-6, 6].map((x, i) => (
        <mesh key={i} position={[x, 0, -8]}>
          <coneGeometry args={[4, 8, 4]} />
          <meshStandardMaterial color="#6B8E6B" roughness={0.9} />
        </mesh>
      ))}

      <OrbitControls enablePan={false} minDistance={5} maxDistance={20} maxPolarAngle={Math.PI / 2.2} target={[-3, 0, 0]} />
      <Environment preset="sunset" />
    </>
  );
}

export default function HydroScene() {
  const { hydroStep, nextLevel } = useGame();

  return (
    <div className="fixed inset-0 z-30">
      <Canvas shadows camera={{ position: [5, 5, 12], fov: 50 }}>
        <HydroSceneContent />
      </Canvas>

      <div className="fixed top-6 left-6 z-50 game-panel py-3 px-5">
        <p className="font-fredoka-one text-sm text-accent uppercase tracking-wider">Level 1 of 8</p>
        <p className="font-fredoka-one text-xl text-foreground">Hydroelectric Dam</p>
      </div>

      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 game-panel py-2 px-4">
        <p className="font-fredoka text-foreground text-center">
          {hydroStep === 'idle' && '👆 Tap the golden gate to open the dam!'}
          {hydroStep === 'dam-open' && '💧 Dam gate opening...'}
          {hydroStep === 'water-flowing' && '💧 Water flowing through the penstock!'}
          {hydroStep === 'turbine-spinning' && '⚙️ Turbine is spinning!'}
          {hydroStep === 'generating' && '⚡ Electromagnetic induction — generating AC electricity!'}
          {hydroStep === 'complete' && '⭐ Power generated!'}
        </p>
      </div>

      {hydroStep === 'complete' && (
        <div className="fixed bottom-6 right-6 z-50">
          <button onClick={nextLevel} className="game-btn game-btn-accent text-xl animate-float">
            Explore the Generator →
          </button>
        </div>
      )}
    </div>
  );
}
