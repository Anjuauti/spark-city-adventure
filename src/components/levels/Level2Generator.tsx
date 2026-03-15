import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

/* ── Rotor (magnet cross) ── */
const Rotor = ({ spinning }: { spinning: boolean }) => {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (spinning && ref.current) ref.current.rotation.z -= dt * 8;
  });
  return (
    <group ref={ref}>
      {[0, 1, 2, 3].map((i) => {
        const angle = (Math.PI / 2) * i;
        const color = i % 2 === 0 ? '#ef4444' : '#3b82f6';
        return (
          <mesh key={i} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.9, 3.2, 0.9]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.5} roughness={0.3} />
          </mesh>
        );
      })}
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 1.2, 20]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

/* ── Stator (copper coils) ── */
const Stator = ({ active }: { active: boolean }) => {
  const coilsRef = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    if (!active) return;
    const intensity = 0.4 + Math.sin(clock.getElapsedTime() * 8) * 0.4;
    coilsRef.current.forEach((m) => {
      (m.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    });
  });
  return (
    <group>
      {[...Array(8)].map((_, i) => {
        const angle = (Math.PI * 2 / 8) * i;
        return (
          <mesh
            key={i}
            ref={(el) => { if (el) coilsRef.current[i] = el; }}
            position={[Math.sin(angle) * 3.4, Math.cos(angle) * 3.4, 0]}
            rotation={[0, 0, -angle]}
          >
            <torusGeometry args={[0.55, 0.22, 16, 32]} />
            <meshStandardMaterial
              color="#b87333"
              emissive="#ffd700"
              emissiveIntensity={active ? 0.6 : 0}
              metalness={0.3} roughness={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/* ── Magnetic field particles ── */
const MagneticField = ({ active }: { active: boolean }) => {
  const ref = useRef<THREE.Points>(null!);
  const COUNT = 250;
  const posRef = useRef(new Float32Array(COUNT * 3));

  useEffect(() => {
    const arr = posRef.current;
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.2 + Math.random() * 2;
      arr[i * 3] = Math.sin(angle) * r;
      arr[i * 3 + 1] = Math.cos(angle) * r;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
  }, []);

  useFrame((_, dt) => {
    if (!active || !ref.current) return;
    ref.current.rotation.z -= dt * 4;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posRef.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#00c2ff" size={0.12} transparent opacity={active ? 0.7 : 0} />
    </points>
  );
};

/* ── Outer casing ring ── */
const CasingRing = () => (
  <mesh rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[4.2, 4.2, 0.5, 32, 1, true]} />
    <meshStandardMaterial color="#444444" transparent opacity={0.18} side={THREE.DoubleSide} metalness={0.7} roughness={0.3} />
  </mesh>
);

/* ── AC Waveform SVG overlay ── */
const ACWaveform = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  const points = [...Array(200)].map((_, i) => {
    const x = (i / 199) * 220;
    const y = 20 - Math.sin((i / 199) * Math.PI * 4) * 16;
    return `${x},${y}`;
  }).join(' ');
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      style={{
        background: 'rgba(0,10,30,0.85)',
        borderRadius: '1rem',
        border: '2px solid rgba(0,194,255,0.5)',
        padding: '0.6rem 1.2rem',
        boxShadow: '0 0 20px rgba(0,194,255,0.3)',
      }}
    >
      <p className="text-center font-display font-bold text-cyan-400 mb-1" style={{ fontSize: '0.8rem' }}>
        AC WAVEFORM — 50 Hz
      </p>
      <svg width="220" height="40" viewBox="0 0 220 40">
        <polyline
          points={points}
          fill="none"
          stroke="#00c2ff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line x1="0" y1="20" x2="220" y2="20" stroke="rgba(0,194,255,0.25)" strokeWidth="1" strokeDasharray="4,4" />
      </svg>
    </motion.div>
  );
};

/* ── Main Level ── */
export const Level2Generator = () => {
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [step, setStep] = useState(0);

  useEffect(() => {
    setVoltMessage("Inside the Generator! 🤖 TAP 'SPIN ROTOR' to start the electromagnet spinning!");
  }, [setVoltMessage]);

  const handleSpin = () => {
    if (step > 0) return;
    setStep(1);
    setVoltMessage("⚙️ Rotor SPINNING! The electromagnet is rotating inside the copper coils!");
    setTimeout(() => {
      setStep(2);
      setVoltMessage("🌀 Magnetic field lines are cutting through the coils — this creates a changing FLUX!");
      setTimeout(() => {
        setStep(3);
        setVoltMessage("⭐ EMF induced! Alternating Current (AC) flows! Faraday's Law: EMF = −N × dΦ/dt");
        setLevelComplete(true);
        addScore(100);
        addStar();
      }, 2500);
    }, 2000);
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Dark industrial BG */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg,#0f1f3d 0%,#1a2a4a 50%,#0a1525 100%)' }}
      />

      <Canvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 14], fov: 55 }}
        shadows
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
        <pointLight position={[0, 0, 6]} color="#00c2ff" intensity={step >= 3 ? 3 : step >= 1 ? 1.5 : 0} distance={20} />
        <pointLight position={[0, 0, -5]} color="#ffd700" intensity={step >= 3 ? 2 : 0} distance={15} />
        <Environment preset="city" />
        <OrbitControls enablePan={false} minDistance={5} maxDistance={22} maxPolarAngle={Math.PI / 1.5} />

        <CasingRing />
        <Rotor spinning={step >= 1} />
        <Stator active={step >= 3} />
        <MagneticField active={step >= 2} />

        {/* Generator shaft */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 10, 16]} />
          <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Outer label rings */}
        {[4.8, -4.8].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[4.5, 4.5, 0.4, 32]} />
            <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
      </Canvas>

      {/* AC Waveform */}
      <ACWaveform visible={step >= 3} />

      {/* Right panel */}
      <div
        className="absolute right-3 top-14 z-10 flex flex-col gap-3 pointer-events-auto"
        style={{ width: 'clamp(210px, 23vw, 285px)' }}
      >
        <InfoCard title="Electromagnetic Induction" icon="⚡" colorClass="from-violet-700 to-purple-500">
          <p><strong>Faraday's Law:</strong> EMF = −N × (dΦ/dt)</p>
          <p>A changing magnetic flux (Φ) through a coil induces an electromotive force (EMF).</p>
          <p><strong>Rotor:</strong> The rotating electromagnet changes the flux through the stator coils.</p>
          <p><strong>Result:</strong> Alternating Current (AC) — current reverses 50 times per second!</p>
        </InfoCard>

        <div className="game-panel">
          <h3 className="font-display font-bold text-slate-800 mb-3" style={{ fontSize: '1.05rem' }}>Generator Status</h3>
          {[
            { label: '1. Start the Rotor', done: step >= 1, icon: '▶️' },
            { label: '2. Magnetic Field Active', done: step >= 2, icon: '🧲' },
            { label: '3. EMF Induced in Coils', done: step >= 3, icon: '⚡' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2.5 mb-2">
              <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
              <span className="font-bold flex-1" style={{ fontSize: '0.93rem', color: s.done ? '#059669' : '#94a3b8' }}>
                {s.label}
              </span>
              {s.done && <span style={{ color: '#059669' }}>✓</span>}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {step === 0 && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSpin}
              className="game-btn w-full justify-center animate-pulse-yellow"
              style={{
                background: 'linear-gradient(135deg,#ffd700,#f59e0b)',
                fontSize: '1.2rem',
              }}
            >
              ⚙️ SPIN ROTOR!
            </motion.button>
          )}
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="game-panel text-center"
            >
              <p className="font-display text-slate-500 mb-1" style={{ fontSize: '0.75rem' }}>AC OUTPUT</p>
              <div className="meter-display">
                <span className="text-cyan-400 font-mono font-bold" style={{ fontSize: '1.8rem' }}>240V AC</span>
              </div>
              <p className="text-violet-600 font-bold mt-1.5" style={{ fontSize: '0.85rem' }}>50 Hz Alternating Current ✓</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Labels overlay */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col gap-2">
        {[
          { label: 'STATOR', sublabel: 'Copper Coils', color: '#b87333' },
          { label: 'ROTOR', sublabel: 'Rotating Magnet', color: '#ef4444' },
        ].map((item) => (
          <div key={item.label}
            className="px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.55)', border: `2px solid ${item.color}55` }}
          >
            <p className="font-display font-bold" style={{ color: item.color, fontSize: '0.85rem' }}>{item.label}</p>
            <p className="font-medium" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem' }}>{item.sublabel}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
