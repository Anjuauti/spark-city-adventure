import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

/* ── Step-Down Transformer 3D ── */
const StepDownTransformer = ({ active }: { active: boolean }) => {
  const coilRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!active || !coilRef.current) return;
    const mat = coilRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 6) * 0.35;
  });
  return (
    <group position={[0, 0, 0]}>
      {/* Main tank */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[5, 4.5, 4]} />
        <meshStandardMaterial color="#445566" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Cooling fins */}
      {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 2.5, 2.1]} castShadow>
          <boxGeometry args={[0.18, 3.5, 0.12]} />
          <meshStandardMaterial color="#334455" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Bushing coils on top */}
      {[-1, 0, 1].map((x, i) => (
        <mesh key={i} ref={i === 1 ? coilRef : undefined} position={[x * 1.4, 4.8, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 1.2, 12]} />
          <meshStandardMaterial
            color={active ? '#00c2ff' : '#aa5555'}
            emissive={active ? '#00c2ff' : '#000000'}
            emissiveIntensity={active ? 0.6 : 0}
          />
        </mesh>
      ))}
      {/* Base platform */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color="#777777" roughness={0.9} />
      </mesh>
    </group>
  );
};

/* ── Circuit Breaker ── */
const CircuitBreaker = ({ on, onClick }: { on: boolean; onClick: () => void }) => {
  const leverRef = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (!leverRef.current) return;
    const targetRot = on ? 0 : -Math.PI / 4;
    leverRef.current.rotation.x += (targetRot - leverRef.current.rotation.x) * 0.12;
  });
  return (
    <group
      position={[-4.5, 0, 2.5]}
      onClick={onClick}
      onPointerOver={() => { if (!on) document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      {/* Box */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1.2, 2.5, 1.2]} />
        <meshStandardMaterial color="#222222" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Lever */}
      <mesh ref={leverRef} position={[0, 1.8, 0.65]}>
        <boxGeometry args={[0.22, 1.1, 0.22]} />
        <meshStandardMaterial
          color={on ? '#22c55e' : '#ef4444'}
          emissive={on ? '#22c55e' : '#ef4444'}
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* Glow ring when not on (hint to click) */}
      {!on && (
        <mesh position={[0, 2.8, 0]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  );
};

/* ── Lightning bolt when energized ── */
const EnergyBolt = ({ active }: { active: boolean }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.visible = active;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1 + Math.sin(clock.getElapsedTime() * 8) * 0.8;
  });
  return (
    <mesh ref={ref} position={[0, 7, 0]} visible={active}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={1.5} />
    </mesh>
  );
};

/* ── Main Level ── */
export const Level4Substation = () => {
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [breakerOn, setBreakerOn] = useState(false);
  const [voltage, setVoltage] = useState(132);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setVoltMessage("⚡ Welcome to the SUBSTATION! TAP the RED circuit breaker to step down the voltage safely!");
  }, [setVoltMessage]);

  const handleBreaker = () => {
    if (breakerOn) return;
    setBreakerOn(true);
    setVoltMessage("🔌 Breaker CLOSED! The step-down transformer is reducing 132kV to 11kV...");

    let v = 132;
    const interval = setInterval(() => {
      v = Math.max(11, v - 4);
      setVoltage(v);
      if (v <= 11) {
        clearInterval(interval);
        setVoltMessage("⭐ Voltage safely stepped DOWN to 11kV! The neighborhood can now receive safe electricity!");
        setComplete(true);
        setLevelComplete(true);
        addScore(100);
        addStar();
      }
    }, 80);
  };

  const voltPercent = Math.max(0, Math.min(100, ((voltage - 11) / (132 - 11)) * 100));

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Industrial BG */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,#1a2035 0%,#2a3050 40%,#1a1a2e 100%)' }} />

      <Canvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        camera={{ position: [0, 8, 18], fov: 55 }}
        shadows
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 8]} intensity={0.9} castShadow />
        <pointLight position={[0, 6, 0]} color="#00c2ff" intensity={breakerOn ? 3.5 : 0} distance={20} />
        <pointLight position={[-4.5, 5, 2.5]} color="#ffd700" intensity={!breakerOn ? 1.5 : 0} distance={8} />
        <Environment preset="city" />
        <OrbitControls enablePan={false} minDistance={5} maxDistance={22} maxPolarAngle={Math.PI / 2.2} />

        {/* Ground pad */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#888888" roughness={0.95} />
        </mesh>

        {/* Chain-link fence */}
        {[-6, 6].map((x, i) => (
          <mesh key={i} position={[x, 1.5, 0]}>
            <boxGeometry args={[0.1, 3, 14]} />
            <meshStandardMaterial color="#555555" metalness={0.5} transparent opacity={0.5} />
          </mesh>
        ))}

        <StepDownTransformer active={breakerOn} />
        <CircuitBreaker on={breakerOn} onClick={handleBreaker} />
        <EnergyBolt active={breakerOn && !complete} />

        {/* Incoming high-voltage line */}
        <mesh position={[-3, 7.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 6, 8]} />
          <meshStandardMaterial
            color={breakerOn ? '#00c2ff' : '#444444'}
            emissive={breakerOn ? '#00c2ff' : '#000'}
            emissiveIntensity={breakerOn ? 0.8 : 0}
          />
        </mesh>

        {/* Outgoing distribution line */}
        <mesh position={[3, 5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 6, 8]} />
          <meshStandardMaterial
            color={complete ? '#00e676' : '#444444'}
            emissive={complete ? '#00e676' : '#000'}
            emissiveIntensity={complete ? 0.8 : 0}
          />
        </mesh>
      </Canvas>

      {/* Right panel */}
      <div
        className="absolute right-3 top-14 z-10 flex flex-col gap-3 pointer-events-auto"
        style={{ width: 'clamp(210px, 23vw, 285px)' }}
      >
        <InfoCard title="Substation" icon="🏢" colorClass="from-cyan-700 to-cyan-500">
          <p><strong>Why Step Down?</strong> 132kV is far too dangerous for homes — it would kill instantly!</p>
          <p><strong>Transformer:</strong> V₁/V₂ = N₁/N₂ — fewer coil turns = lower output voltage.</p>
          <p><strong>Circuit Breaker:</strong> Protects the grid from overloads, short circuits and faults.</p>
          <p><strong>Distribution:</strong> 11kV goes to street-level transformers, then steps down to 240V for homes.</p>
        </InfoCard>

        {/* Voltage meter */}
        <div className="game-panel">
          <h3 className="font-display font-bold text-slate-800 mb-2" style={{ fontSize: '1.05rem' }}>
            Voltage Meter
          </h3>
          <div className="meter-display mb-2">
            <motion.span
              key={voltage}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-cyan-400 font-mono font-bold"
              style={{ fontSize: '2rem' }}
            >
              {voltage}
            </motion.span>
            <span className="text-cyan-600 font-mono font-bold" style={{ fontSize: '1.1rem' }}> kV</span>
          </div>

          {/* Progress bar */}
          <div className="rounded-full overflow-hidden" style={{ height: 14, background: '#1e293b' }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${voltPercent}%`,
                background: voltage > 50
                  ? 'linear-gradient(90deg,#ef4444,#f59e0b)'
                  : 'linear-gradient(90deg,#22c55e,#06b6d4)',
              }}
              animate={{ width: `${voltPercent}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-bold text-green-500" style={{ fontSize: '0.7rem' }}>11 kV ✓</span>
            <span className="font-bold text-red-400" style={{ fontSize: '0.7rem' }}>132 kV ⚠</span>
          </div>

          <p
            className="text-center font-bold mt-2"
            style={{
              fontSize: '0.85rem',
              color: voltage <= 11 ? '#059669' : '#94a3b8',
            }}
          >
            {voltage <= 11 ? '✓ Safe for Distribution!' : `Target: 11 kV`}
          </p>
        </div>

        {!breakerOn && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBreaker}
            className="game-btn w-full justify-center animate-pulse-yellow"
            style={{
              background: 'linear-gradient(135deg,#ffd700,#f59e0b)',
              fontSize: '1.15rem',
            }}
          >
            🔌 CLOSE THE BREAKER!
          </motion.button>
        )}
      </div>

      {/* Bottom hint */}
      {!breakerOn && (
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none z-20"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <div
            className="px-5 py-3 rounded-full font-display font-bold text-slate-900 shadow-xl"
            style={{ background: 'linear-gradient(135deg,#ffd700,#f59e0b)', fontSize: '1.05rem', boxShadow: '0 0 20px rgba(255,215,0,0.6)' }}
          >
            👆 TAP the RED CIRCUIT BREAKER to activate!
          </div>
        </motion.div>
      )}
    </div>
  );
};
