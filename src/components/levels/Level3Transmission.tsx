import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

/* ── Power line with catenary sag ── */
const PowerLine = ({ start, end, active }: { start: [number,number,number], end: [number,number,number], active: boolean }) => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(...start),
    new THREE.Vector3(
      (start[0] + end[0]) / 2,
      Math.min(start[1], end[1]) - 1.5,
      (start[2] + end[2]) / 2,
    ),
    new THREE.Vector3(...end),
  ]);
  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.09, 8, false]} />
      <meshStandardMaterial
        color={active ? '#00c2ff' : '#444444'}
        emissive={active ? '#00c2ff' : '#000000'}
        emissiveIntensity={active ? 0.9 : 0}
        metalness={0.3} roughness={0.5}
      />
    </mesh>
  );
};

/* ── Electricity particles along a line ── */
const ElectricParticles = ({ start, end, active }: { start: [number,number,number], end: [number,number,number], active: boolean }) => {
  const ref = useRef<THREE.Points>(null!);
  const COUNT = 35;
  const posRef = useRef(new Float32Array(COUNT * 3));
  const tRef = useRef<number[]>([]);

  useEffect(() => {
    tRef.current = Array.from({ length: COUNT }, () => Math.random());
  }, []);

  useFrame((_, dt) => {
    if (!active || !ref.current) return;
    const arr = posRef.current;
    const ts = tRef.current;
    for (let i = 0; i < COUNT; i++) {
      ts[i] = (ts[i] + dt * 0.4) % 1;
      const t = ts[i];
      const mid = [
        (start[0] + end[0]) / 2,
        Math.min(start[1], end[1]) - 1.5,
        (start[2] + end[2]) / 2,
      ];
      // Quadratic Bezier approximation
      const p0 = [start[0], start[1], start[2]];
      const p1 = mid;
      const p2 = [end[0], end[1], end[2]];
      arr[i * 3]     = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
      arr[i * 3 + 1] = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
      arr[i * 3 + 2] = (1 - t) * (1 - t) * p0[2] + 2 * (1 - t) * t * p1[2] + t * t * p2[2];
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posRef.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.35} transparent opacity={active ? 1 : 0} />
    </points>
  );
};

/* ── Transmission Tower ── */
const Tower = ({
  position,
  onClick,
  active,
  nextToClick,
}: {
  position: [number,number,number],
  onClick: () => void,
  active: boolean,
  nextToClick: boolean,
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (!nextToClick || !groupRef.current) return;
    // Pulsing scale hint
    const s = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.04;
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      {/* Main column */}
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[0.5, 10, 0.5]} />
        <meshStandardMaterial color={active ? '#aaaaaa' : '#666666'} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Crossarms */}
      {[7, 8.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <boxGeometry args={[5 - i * 1.5, 0.2, 0.2]} />
          <meshStandardMaterial color={active ? '#aaaaaa' : '#666666'} metalness={0.5} />
        </mesh>
      ))}
      {/* Insulators */}
      {[-2, 2, -1, 1].map((x, i) => (
        <mesh key={i} position={[x, i < 2 ? 7 : 8.5, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.5, 12]} />
          <meshStandardMaterial
            color={active ? '#00c2ff' : '#888888'}
            emissive={active ? '#00c2ff' : '#000000'}
            emissiveIntensity={active ? 0.8 : 0}
          />
        </mesh>
      ))}
      {/* Glow indicator for next-to-click */}
      {nextToClick && (
        <mesh position={[0, 11, 0]}>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  );
};

/* ── Step-up Transformer ── */
const Transformer = ({ energized }: { energized: boolean }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = energized ? 0.3 + Math.sin(clock.getElapsedTime() * 4) * 0.2 : 0;
  });
  return (
    <group position={[-15, 0, 0]}>
      <mesh ref={ref} position={[0, 2, 0]} castShadow>
        <boxGeometry args={[3.5, 4, 3.5]} />
        <meshStandardMaterial color="#445566" emissive="#00c2ff" emissiveIntensity={0} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Coil indicators */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 4.3, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.9, 12]} />
          <meshStandardMaterial color={energized ? '#00c2ff' : '#aa5555'} emissive={energized ? '#00c2ff' : '#000'} emissiveIntensity={energized ? 0.9 : 0} />
        </mesh>
      ))}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
    </group>
  );
};

/* ── Main Level ── */
const TOWER_POSITIONS: [number, number, number][] = [
  [-8, 0, 0],
  [0, 0, 0],
  [8, 0, 0],
];

export const Level3Transmission = () => {
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [step, setStep] = useState(0);

  useEffect(() => {
    setVoltMessage("🗼 TAP Tower 1 (the glowing one!) to connect the high-voltage power line!");
  }, [setVoltMessage]);

  const handleTowerClick = (index: number) => {
    if (index !== step) return;
    const next = step + 1;
    setStep(next);
    if (index === 0) setVoltMessage("✅ Tower 1 connected! High voltage (132kV) reduces energy loss. Power = I²R — lower current means less heat!");
    if (index === 1) setVoltMessage("✅ Tower 2 connected! Electricity travels at near light speed through these wires!");
    if (index === 2) {
      setVoltMessage("⭐ All 3 towers connected! 132,000 Volts of power is now flowing 500km to the city!");
      setLevelComplete(true);
      addScore(100);
      addStar();
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Sky */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#a8c8e8 0%,#c5dff0 50%,#d8eef8 80%,#e8f6e8 100%)' }} />

      <Canvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        camera={{ position: [0, 6, 24], fov: 60 }}
        shadows
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 8]} intensity={1.1} castShadow />
        <pointLight position={[0, 10, 0]} color="#00c2ff" intensity={step >= 3 ? 4 : 0} distance={40} />
        <Environment preset="park" />
        <OrbitControls enablePan={false} minDistance={5} maxDistance={35} maxPolarAngle={Math.PI / 2.2} />

        {/* Ground */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[60, 40]} />
          <meshStandardMaterial color="#7ec88e" roughness={0.9} />
        </mesh>

        {/* Step-up Transformer (start) */}
        <Transformer energized={step >= 1} />

        {/* 3 Towers */}
        {TOWER_POSITIONS.map((pos, i) => (
          <Tower
            key={i}
            position={pos}
            onClick={() => handleTowerClick(i)}
            active={step > i}
            nextToClick={step === i}
          />
        ))}

        {/* Lines */}
        {step >= 1 && <PowerLine start={[-8, 8, 0]} end={[0, 8, 0]} active />}
        {step >= 2 && <PowerLine start={[0, 8, 0]} end={[8, 8, 0]} active />}

        {/* Particles */}
        {step >= 1 && <ElectricParticles start={[-8, 8, 0]} end={[0, 8, 0]} active />}
        {step >= 2 && <ElectricParticles start={[0, 8, 0]} end={[8, 8, 0]} active />}

        {/* City destination */}
        <group position={[14, 0, 0]}>
          {[0, 2, -2].map((x, i) => (
            <mesh key={i} position={[x, 2 + i, 0]} castShadow>
              <boxGeometry args={[1.5, 4 + i * 2, 1.5]} />
              <meshStandardMaterial color={step >= 3 ? '#ffd700' : '#888888'} emissive={step >= 3 ? '#ffd700' : '#000'} emissiveIntensity={step >= 3 ? 0.5 : 0} />
            </mesh>
          ))}
        </group>
      </Canvas>

      {/* Right panel */}
      <div
        className="absolute right-3 top-14 z-10 flex flex-col gap-3 pointer-events-auto"
        style={{ width: 'clamp(210px, 23vw, 285px)' }}
      >
        <InfoCard title="Power Transmission" icon="🗼" colorClass="from-amber-600 to-amber-500">
          <p><strong>Why High Voltage?</strong> Power lost = I²R. Higher voltage = lower current = less heat wasted!</p>
          <p><strong>Step-Up Transformer:</strong> 11kV → 132kV using V₁/V₂ = N₁/N₂ (turns ratio).</p>
          <p><strong>Distance:</strong> High-voltage lines carry power 500+ km with minimal loss!</p>
        </InfoCard>

        {/* Tower status */}
        <div className="game-panel">
          <h3 className="font-display font-bold text-slate-800 mb-3" style={{ fontSize: '1.05rem' }}>Transmission Status</h3>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 text-center py-2.5 rounded-xl font-display font-bold transition-all"
                style={{
                  background: step >= i ? 'rgba(0,194,255,0.15)' : '#f1f5f9',
                  color: step >= i ? '#0ea5e9' : '#94a3b8',
                  border: `2px solid ${step >= i ? 'rgba(0,194,255,0.5)' : 'transparent'}`,
                  fontSize: '0.95rem',
                }}
              >
                Tower {i}
              </div>
            ))}
          </div>
          {step < 3 && (
            <p className="text-center mt-2.5 font-bold" style={{ color: '#f59e0b', fontSize: '0.88rem' }}>
              👆 TAP Tower {step + 1}!
            </p>
          )}
        </div>

        {/* Voltage display */}
        <div className="game-panel text-center">
          <p className="font-display text-slate-500 mb-1" style={{ fontSize: '0.75rem' }}>TRANSMISSION VOLTAGE</p>
          <div className="meter-display">
            <span className="text-cyan-400 font-mono font-bold" style={{ fontSize: '1.8rem' }}>132 kV</span>
          </div>
          <p className="mt-1" style={{ color: '#64748b', fontSize: '0.78rem' }}>
            {step >= 3 ? '✓ Reaching the Substation!' : 'Awaiting connection...'}
          </p>
        </div>
      </div>

      {/* Hint when not all connected */}
      {step < 3 && (
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none z-20"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <div
            className="px-5 py-3 rounded-full font-display font-bold text-slate-900 shadow-xl"
            style={{ background: 'linear-gradient(135deg,#ffd700,#f59e0b)', fontSize: '1.05rem', boxShadow: '0 0 20px rgba(255,215,0,0.6)' }}
          >
            👆 TAP Tower {step + 1} to connect the power line!
          </div>
        </motion.div>
      )}
    </div>
  );
};
