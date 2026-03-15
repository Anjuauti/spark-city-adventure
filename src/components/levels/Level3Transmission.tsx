import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

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
        color={active ? '#f59e0b' : '#888888'}
        emissive={active ? '#f59e0b' : '#000000'}
        emissiveIntensity={active ? 0.7 : 0}
        metalness={0.3} roughness={0.5}
      />
    </mesh>
  );
};

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
      ts[i] = (ts[i] + dt * 0.45) % 1;
      const t = ts[i];
      const mid = [
        (start[0] + end[0]) / 2,
        Math.min(start[1], end[1]) - 1.5,
        (start[2] + end[2]) / 2,
      ];
      const p0 = [start[0], start[1], start[2]];
      const p1 = mid;
      const p2 = [end[0], end[1], end[2]];
      arr[i * 3]     = (1-t)*(1-t)*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0];
      arr[i * 3 + 1] = (1-t)*(1-t)*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1];
      arr[i * 3 + 2] = (1-t)*(1-t)*p0[2] + 2*(1-t)*t*p1[2] + t*t*p2[2];
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posRef.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#fbbf24" size={0.35} transparent opacity={active ? 1 : 0} />
    </points>
  );
};

const Tower = ({
  position, onClick, active, nextToClick,
}: {
  position: [number,number,number],
  onClick: () => void,
  active: boolean,
  nextToClick: boolean,
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (!nextToClick || !groupRef.current) return;
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
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[0.5, 10, 0.5]} />
        <meshStandardMaterial color={active ? '#888888' : '#777777'} metalness={0.6} roughness={0.4} />
      </mesh>
      {[7, 8.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <boxGeometry args={[5 - i * 1.5, 0.2, 0.2]} />
          <meshStandardMaterial color={active ? '#999999' : '#777777'} metalness={0.5} />
        </mesh>
      ))}
      {[-2, 2, -1, 1].map((x, i) => (
        <mesh key={i} position={[x, i < 2 ? 7 : 8.5, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.5, 12]} />
          <meshStandardMaterial
            color={active ? '#f59e0b' : '#aaaaaa'}
            emissive={active ? '#f59e0b' : '#000000'}
            emissiveIntensity={active ? 0.6 : 0}
          />
        </mesh>
      ))}
      {nextToClick && (
        <mesh position={[0, 11, 0]}>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  );
};

const Transformer = ({ energized }: { energized: boolean }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = energized ? 0.25 + Math.sin(clock.getElapsedTime() * 4) * 0.15 : 0;
  });
  return (
    <group position={[-15, 0, 0]}>
      <mesh ref={ref} position={[0, 2, 0]} castShadow>
        <boxGeometry args={[3.5, 4, 3.5]} />
        <meshStandardMaterial color="#6b7280" emissive="#f59e0b" emissiveIntensity={0} metalness={0.6} roughness={0.3} />
      </mesh>
      {[-0.8, 0, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 4.3, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.9, 12]} />
          <meshStandardMaterial color={energized ? '#f59e0b' : '#aa5555'} emissive={energized ? '#f59e0b' : '#000'} emissiveIntensity={energized ? 0.8 : 0} />
        </mesh>
      ))}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
    </group>
  );
};

const TOWER_POSITIONS: [number, number, number][] = [
  [-8, 0, 0],
  [0, 0, 0],
  [8, 0, 0],
];

const STEP_EXPLANATIONS = [
  {
    title: 'Connect Tower 1',
    icon: '🗼',
    color: 'from-amber-600 to-amber-400',
    info: 'TAP Tower 1 to start! Electricity from the generator is stepped UP to 132,000 Volts (132 kV) by the step-up transformer. High voltage means LOW current, which means LESS heat wasted in the wires!',
    formula: 'P_loss = I² × R',
    formulaNote: 'Lower current = much less power loss!',
  },
  {
    title: 'Tower 1 Connected! → Tower 2',
    icon: '🗼',
    color: 'from-orange-600 to-amber-500',
    info: 'Tower 1 done! Now tap Tower 2. Electricity travels at close to the speed of light through these wires! Transmission towers can be 50–100 meters tall and carry wires thousands of kilometres.',
    formula: 'V₁/V₂ = N₁/N₂',
    formulaNote: 'Transformer turns ratio determines voltage.',
  },
  {
    title: 'Tower 2 Connected! → Tower 3',
    icon: '🗼',
    color: 'from-yellow-600 to-amber-400',
    info: 'Almost there! Tap Tower 3. These high-voltage transmission lines carry electricity from power plants far away, over mountains and rivers, all the way to cities and towns!',
    formula: '132 kV',
    formulaNote: 'High-tension lines carry this voltage.',
  },
  {
    title: 'All Towers Connected! ⚡',
    icon: '✅',
    color: 'from-green-600 to-emerald-500',
    info: 'Excellent! All 3 towers are now connected. 132,000 Volts of electricity is flowing from the power plant to Spark City! Next stop: the Substation, where voltage will be stepped DOWN to safe levels.',
    formula: 'Dam → Tower → Substation',
    formulaNote: 'Electricity journey continues!',
  },
];

export const Level3Transmission = () => {
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [step, setStep] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setVoltMessage("🗼 TAP Tower 1 (the glowing one!) to connect the high-voltage power line!");
  }, []);

  const handleTowerClick = (index: number) => {
    if (index !== step || showExplanation) return;
    const next = step + 1;
    setStep(next);
    setShowExplanation(true);

    if (index === 0) setVoltMessage("✅ Tower 1 connected! High voltage (132 kV) reduces energy loss. Power = I²R — lower current means less heat!");
    if (index === 1) setVoltMessage("✅ Tower 2 connected! Electricity travels at near light speed through these wires!");
    if (index === 2) {
      setVoltMessage("⭐ All 3 towers connected! 132,000 Volts of power is now flowing to Spark City!");
      setLevelComplete(true);
      addScore(100);
      addStar();
    }
  };

  const handleContinue = () => {
    setShowExplanation(false);
  };

  const explanationStep = Math.min(step, STEP_EXPLANATIONS.length - 1);
  const currentExplanation = STEP_EXPLANATIONS[explanationStep];

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #d8f0d8 100%)' }} />

      <Canvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        camera={{ position: [0, 6, 24], fov: 60 }}
        shadows
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[10, 15, 8]} intensity={1.0} castShadow />
        <pointLight position={[0, 10, 0]} color="#f59e0b" intensity={step >= 3 ? 3 : 0} distance={40} />
        <Environment preset="park" />
        <OrbitControls enablePan={false} minDistance={5} maxDistance={35} maxPolarAngle={Math.PI / 2.2} />

        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[60, 40]} />
          <meshStandardMaterial color="#86efac" roughness={0.9} />
        </mesh>

        <Transformer energized={step >= 1} />

        {TOWER_POSITIONS.map((pos, i) => (
          <Tower
            key={i}
            position={pos}
            onClick={() => handleTowerClick(i)}
            active={step > i}
            nextToClick={step === i && !showExplanation}
          />
        ))}

        {step >= 1 && <PowerLine start={[-8, 8, 0]} end={[0, 8, 0]} active />}
        {step >= 2 && <PowerLine start={[0, 8, 0]} end={[8, 8, 0]} active />}
        {step >= 1 && <ElectricParticles start={[-8, 8, 0]} end={[0, 8, 0]} active />}
        {step >= 2 && <ElectricParticles start={[0, 8, 0]} end={[8, 8, 0]} active />}

        <group position={[14, 0, 0]}>
          {[0, 2, -2].map((x, i) => (
            <mesh key={i} position={[x, 2 + i, 0]} castShadow>
              <boxGeometry args={[1.5, 4 + i * 2, 1.5]} />
              <meshStandardMaterial
                color={step >= 3 ? '#fbbf24' : '#9ca3af'}
                emissive={step >= 3 ? '#fbbf24' : '#000'}
                emissiveIntensity={step >= 3 ? 0.4 : 0}
              />
            </mesh>
          ))}
        </group>
      </Canvas>

      {/* Explanation panel — appears after each tower click */}
      <AnimatePresence>
        {showExplanation && step < 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto"
            style={{ background: 'rgba(0,0,0,0.15)' }}
          >
            <motion.div
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              className="flex flex-col items-center gap-4 px-8 py-7 rounded-3xl"
              style={{
                background: 'rgba(255,255,255,0.97)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                border: '3px solid #fbbf24',
                maxWidth: 440,
                width: '90%',
              }}
            >
              <div
                className={`w-full px-4 py-3 rounded-2xl bg-gradient-to-r ${currentExplanation.color} text-white text-center font-display font-bold`}
                style={{ fontSize: '1.1rem' }}
              >
                {currentExplanation.icon} {currentExplanation.title}
              </div>

              <p className="text-slate-700 leading-relaxed text-center" style={{ fontSize: '0.95rem' }}>
                {currentExplanation.info}
              </p>

              <div className="px-4 py-2.5 rounded-xl w-full text-center" style={{ background: '#fefce8', border: '2px solid #fde047' }}>
                <code className="font-bold text-amber-700" style={{ fontSize: '1.1rem' }}>{currentExplanation.formula}</code>
                <p className="text-amber-600 mt-0.5" style={{ fontSize: '0.78rem' }}>{currentExplanation.formulaNote}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
                className="px-8 py-3 rounded-2xl font-display font-bold text-white"
                style={{
                  background: step < 3
                    ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(135deg, #10b981, #34d399)',
                  fontSize: '1.05rem',
                  boxShadow: step < 3
                    ? '0 4px 16px rgba(245,158,11,0.4)'
                    : '0 4px 16px rgba(16,185,129,0.4)',
                }}
              >
                {step < 3 ? `Continue → Tap Tower ${step + 1}` : '🎉 See Results!'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="absolute right-3 top-14 z-10 flex flex-col gap-3 pointer-events-auto"
        style={{ width: 'clamp(210px, 23vw, 285px)' }}
      >
        <InfoCard title="Why High Voltage?" icon="🗼" colorClass="from-amber-600 to-amber-400">
          <p><strong>Power Loss = I²R</strong> — Doubling voltage halves current, so energy loss is reduced 4× !</p>
          <p><strong>Step-Up Transformer:</strong> 11 kV → 132 kV using V₁/V₂ = N₁/N₂ (turns ratio).</p>
          <p><strong>Distance:</strong> High-voltage lines carry power 500+ km with minimal waste!</p>
        </InfoCard>

        <div className="game-panel">
          <h3 className="font-display font-bold text-slate-800 mb-3" style={{ fontSize: '1.05rem' }}>Transmission Status</h3>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 text-center py-2.5 rounded-xl font-display font-bold transition-all"
                style={{
                  background: step >= i ? 'rgba(245,158,11,0.15)' : '#f1f5f9',
                  color: step >= i ? '#d97706' : '#94a3b8',
                  border: `2px solid ${step >= i ? 'rgba(245,158,11,0.5)' : 'transparent'}`,
                  fontSize: '0.95rem',
                }}
              >
                🗼 {i}
              </div>
            ))}
          </div>
          {!showExplanation && step < 3 && (
            <p className="text-center mt-2.5 font-bold animate-pulse" style={{ color: '#f59e0b', fontSize: '0.88rem' }}>
              👆 TAP Tower {step + 1}!
            </p>
          )}
        </div>

        <div className="game-panel text-center">
          <p className="font-display text-slate-500 mb-1" style={{ fontSize: '0.75rem' }}>TRANSMISSION VOLTAGE</p>
          <p className="text-amber-500 font-mono font-bold" style={{ fontSize: '2rem' }}>132 kV</p>
          <p className="mt-1" style={{ color: '#64748b', fontSize: '0.78rem' }}>
            {step >= 3 ? '✓ Reaching the Substation!' : 'Awaiting all connections...'}
          </p>
        </div>
      </div>

      {!showExplanation && step < 3 && (
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none z-20"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <div
            className="px-5 py-3 rounded-full font-display font-bold text-slate-900 shadow-xl"
            style={{ background: 'linear-gradient(135deg,#ffd700,#f59e0b)', fontSize: '1.05rem', boxShadow: '0 0 20px rgba(255,215,0,0.5)' }}
          >
            👆 TAP Tower {step + 1} to connect the power line!
          </div>
        </motion.div>
      )}
    </div>
  );
};
