import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene } from '../../utils/three-helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

/* ── Step definitions ── */
const STEPS = [
  {
    title: '1. Service Pole & Cable',
    icon: '🔌',
    color: '#3b82f6',
    info: '240V AC electricity arrives from the national grid through thick overhead cables. The utility pole outside your home is the last connection point of the distribution network before electricity enters your house.',
    voltMsg: "🔌 The SERVICE POLE brings 240V AC from the grid! Thick overhead cables carry high-current electricity to your home. Click 'Next Step' when ready!",
  },
  {
    title: '2. Electric Meter',
    icon: '📊',
    color: '#8b5cf6',
    info: 'The Electric Meter counts every kilowatt-hour (kWh) of electricity you use. 1 kWh = 1000 Watts running for 1 hour. The utility company reads this meter every month to calculate your bill!',
    voltMsg: "📊 The ELECTRIC METER is now connected! It counts kilowatt-hours (kWh). 1 kWh = 1000W for 1 hour. Every unit on your bill started here!",
  },
  {
    title: '3. Main Switch (Isolator)',
    icon: '🔴',
    color: '#ef4444',
    info: 'The Main Isolator Switch cuts ALL electricity to the house instantly. ALWAYS turn this OFF before doing any electrical repair work — it is your primary safety control and emergency shutoff!',
    voltMsg: "🔴 MAIN SWITCH added! This cuts ALL power to the house instantly. Always turn it OFF before touching any wires — your life depends on it!",
  },
  {
    title: '4. MCB Panel (Distribution Board)',
    icon: '🛡️',
    color: '#059669',
    info: 'The MCB Panel contains separate Miniature Circuit Breakers for each room. If too much current flows through a circuit — from a fault or short-circuit — the MCB trips automatically, preventing fires and electric shocks!',
    voltMsg: "🛡️ MCB PANEL installed! Each breaker protects one room's circuit. When a fault happens, the MCB TRIPS in 0.01 seconds — faster than your heart can beat!",
  },
  {
    title: '5. Three Essential Wires',
    icon: '🔴🔵🟢',
    color: '#f59e0b',
    info: 'Every electrical circuit has exactly 3 wires:\n• PHASE (Red/Brown): Live wire at 240V — NEVER touch!\n• NEUTRAL (Blue): Returns current safely back to the grid.\n• EARTH (Green/Yellow): Safety wire — diverts fault current to ground, protecting you from electric shock.',
    voltMsg: "⭐ THREE WIRES complete the circuit! Phase carries 240V, Neutral returns the current, Earth is your safety net. You've traced the complete path of electricity!",
  },
];

/* ── Glowing wire helper ── */
const addGlowWire = (
  scene: THREE.Scene,
  pts: THREE.Vector3[],
  color: number,
  glowing = true
): THREE.Mesh => {
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, 24, 0.07, 8, false);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: glowing ? 1.6 : 0.2,
    roughness: 0.3,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  return mesh;
};

/* ── BUILDERS ── */
const buildStep0 = (scene: THREE.Scene) => {
  // Utility pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 13, 12),
    new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.9 })
  );
  pole.position.set(-10, 6.5, 2);
  scene.add(pole);

  // Cross arm
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x5a3a20 })
  );
  arm.position.set(-10, 11.5, 2);
  scene.add(arm);

  // Insulators
  [-0.9, 0.9].forEach(dx => {
    const ins = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.35, 8),
      new THREE.MeshStandardMaterial({ color: 0xaaaacc })
    );
    ins.position.set(-10 + dx, 11.3, 2);
    scene.add(ins);
  });

  // Service wire (dark — electricity not flowing yet)
  addGlowWire(scene, [
    new THREE.Vector3(-10, 11.3, 2),
    new THREE.Vector3(-7.5, 10.2, 2),
    new THREE.Vector3(-5.5, 9.4, 2),
  ], 0x333333, false);
};

const buildStep1 = (scene: THREE.Scene) => {
  // Electric meter box
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 2.8, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.3 })
  );
  box.position.set(-8.2, 5, 2);
  scene.add(box);

  const dial = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.12, 20),
    new THREE.MeshStandardMaterial({ color: 0xecf0f1 })
  );
  dial.rotation.x = Math.PI / 2;
  dial.position.set(-8.2, 5.2, 2.48);
  scene.add(dial);

  const needle = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.48, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xe74c3c })
  );
  needle.position.set(-8.2, 5.2, 2.52);
  needle.rotation.z = Math.PI / 5;
  scene.add(needle);

  // Label strip (yellow bar)
  const label = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.3, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.5 })
  );
  label.position.set(-8.2, 3.8, 2.48);
  scene.add(label);

  // Glowing wire: pole → meter
  addGlowWire(scene, [
    new THREE.Vector3(-10, 11.3, 2),
    new THREE.Vector3(-9.5, 8, 2),
    new THREE.Vector3(-8.8, 5.8, 2),
  ], 0xffdd00);
};

const buildStep2 = (scene: THREE.Scene) => {
  // Main switch housing
  const sw = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1.8, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xe74c3c, emissive: 0xaa0000, emissiveIntensity: 0.35 })
  );
  sw.position.set(-6.5, 5, 2);
  scene.add(sw);

  const lever = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.9, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.5 })
  );
  lever.position.set(-6.5, 5.8, 2.4);
  scene.add(lever);

  // Glowing wire: meter → switch
  addGlowWire(scene, [
    new THREE.Vector3(-8.2, 5, 2),
    new THREE.Vector3(-7.4, 5, 2),
    new THREE.Vector3(-7, 5, 2),
  ], 0xffdd00);
};

const buildStep3 = (scene: THREE.Scene) => {
  // MCB distribution panel
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 4.5, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.25 })
  );
  panel.position.set(-4, 5.2, -3.6);
  scene.add(panel);

  // MCB breakers
  const mcbColors = [0x22c55e, 0x22c55e, 0xf59e0b, 0xf59e0b, 0x3b82f6, 0x3b82f6];
  for (let i = 0; i < 6; i++) {
    const mcb = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 1.1, 0.5),
      new THREE.MeshStandardMaterial({
        color: mcbColors[i],
        emissive: mcbColors[i],
        emissiveIntensity: 0.4,
      })
    );
    mcb.position.set(-5.2 + i * 0.55, 5.4, -3.15);
    scene.add(mcb);
  }

  // Labels on panel
  const panelLabel = new THREE.Mesh(
    new THREE.BoxGeometry(3.3, 0.35, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.4 })
  );
  panelLabel.position.set(-4, 7.1, -3.15);
  scene.add(panelLabel);

  // Glowing wire: switch → MCB
  addGlowWire(scene, [
    new THREE.Vector3(-6.5, 5, 2),
    new THREE.Vector3(-6.5, 5, -1),
    new THREE.Vector3(-5.5, 5.2, -3.3),
  ], 0xffdd00);
};

const buildStep4 = (scene: THREE.Scene) => {
  const wireColors = [0xdc2626, 0x2563eb, 0x16a34a];
  const names = ['Phase (Live)', 'Neutral', 'Earth'];
  const yOffsets = [0.3, 0, -0.3];

  wireColors.forEach((col, i) => {
    addGlowWire(scene, [
      new THREE.Vector3(-4, 5.2 + yOffsets[i], -3.2),
      new THREE.Vector3(-1, 5.5 + yOffsets[i], -3.5),
      new THREE.Vector3(2, 7.5, -3.5),
      new THREE.Vector3(6, 7.5, -3.5),
    ], col);

    // Label dot above wire end
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.5 })
    );
    dot.position.set(6, 7.7, -3.5);
    scene.add(dot);
  });
};

const BUILDERS = [buildStep0, buildStep1, buildStep2, buildStep3, buildStep4];

/* ── Component ── */
export const Level5House = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [step, setStep] = useState(0);
  const sceneRef = useRef<THREE.Scene | null>(null);

  /* ── One-time scene init ── */
  useEffect(() => {
    setVoltMessage(STEPS[0].voltMsg);
    if (!containerRef.current) return;

    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);
    sceneRef.current = scene;

    scene.background = new THREE.Color(0xc8e4f8);
    scene.fog = new THREE.FogExp2(0xc8e4f8, 0.016);
    camera.position.set(0, 10, 24);
    camera.fov = 52;
    camera.updateProjectionMatrix();
    controls.target.set(0, 4, 0);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5efe6, roughness: 0.7 });

    // Grass
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 40),
      new THREE.MeshStandardMaterial({ color: 0x6ab04c, roughness: 0.9 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.15;
    grass.receiveShadow = true;
    scene.add(grass);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.35, 8),
      new THREE.MeshStandardMaterial({ color: 0xe8d5b7, roughness: 0.8 })
    );
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls
    const addBox = (w: number, h: number, d: number, x: number, y: number, z: number, mat = wallMat) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
    };
    addBox(16, 8, 0.5, 0, 4.25, -3.75);
    addBox(0.5, 8, 8, -7.75, 4.25, 0);
    addBox(0.5, 8, 8, 7.75, 4.25, 0);
    addBox(0.2, 8, 5, -2, 4.25, -0.75);
    addBox(0.2, 8, 5, 3, 4.25, -0.75);

    // Roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(12, 4, 4),
      new THREE.MeshStandardMaterial({ color: 0xb03020 })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, 10.25, 0);
    roof.castShadow = true;
    scene.add(roof);

    // Front porch step
    const porch = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.4, 1.5),
      new THREE.MeshStandardMaterial({ color: 0xd4c0a0, roughness: 0.9 })
    );
    porch.position.set(0, 0.2, 4.5);
    scene.add(porch);

    // Build step 0 immediately
    BUILDERS[0](scene);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      cleanup();
      sceneRef.current = null;
    };
  }, []);

  /* ── Build each step progressively ── */
  useEffect(() => {
    if (step === 0) return;
    const scene = sceneRef.current;
    if (!scene) return;
    BUILDERS[step](scene);
    setVoltMessage(STEPS[step].voltMsg);

    if (step === BUILDERS.length - 1) {
      setLevelComplete(true);
      addScore(100);
      addStar();
    }
  }, [step]);

  const currentStep = STEPS[step];

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Right panel */}
      <div
        className="absolute right-3 top-14 z-10 flex flex-col gap-3 pointer-events-auto"
        style={{ width: 'clamp(215px, 24vw, 290px)' }}
      >
        {/* Current step explanation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <InfoCard
              title={currentStep.title}
              icon={currentStep.icon}
              colorClass={step === 0 ? 'from-blue-700 to-blue-500'
                : step === 1 ? 'from-violet-700 to-violet-500'
                : step === 2 ? 'from-red-700 to-red-500'
                : step === 3 ? 'from-emerald-700 to-emerald-500'
                : 'from-amber-600 to-yellow-500'}
            >
              <p className="leading-snug" style={{ whiteSpace: 'pre-line' }}>{currentStep.info}</p>
            </InfoCard>
          </motion.div>
        </AnimatePresence>

        {/* Volt robot inline for levels 5+ */}
        <div
          className="game-panel flex items-start gap-3"
          style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', border: '1.5px solid rgba(0,194,255,0.25)' }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg,#1e40af,#0ea5e9)',
              borderRadius: '50%',
              width: 42, height: 42,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', flexShrink: 0,
              boxShadow: '0 0 14px rgba(0,194,255,0.5)',
            }}
          >🤖</div>
          <p className="font-medium leading-snug" style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
            {currentStep.voltMsg}
          </p>
        </div>

        {/* Progress tracker */}
        <div className="game-panel">
          <h3 className="font-display font-bold text-slate-700 mb-3" style={{ fontSize: '0.92rem' }}>
            Electricity Path
          </h3>
          <div className="flex justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="rounded-full flex items-center justify-center font-display font-bold transition-all"
                  style={{
                    width: 30, height: 30, fontSize: '0.78rem',
                    background: i < step ? '#059669' : i === step ? s.color : '#e2e8f0',
                    color: i <= step ? 'white' : '#94a3b8',
                    boxShadow: i === step ? `0 0 12px ${s.color}88` : 'none',
                  }}
                >
                  {i < step ? '✓' : i + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Electricity flow indicator */}
          <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-lg" style={{ background: '#f8fafc' }}>
            {['🔌', '📊', '🔴', '🛡️', '⚡'].map((icon, i) => (
              <React.Fragment key={i}>
                <span style={{ fontSize: '0.95rem', opacity: i <= step ? 1 : 0.25 }}>{icon}</span>
                {i < 4 && <span style={{ fontSize: '0.7rem', color: i < step ? '#ffd700' : '#cbd5e1' }}>→</span>}
              </React.Fragment>
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(s => s + 1)}
              className="w-full py-2.5 rounded-xl font-display font-bold text-white shadow-md"
              style={{
                background: `linear-gradient(135deg, ${currentStep.color}, ${currentStep.color}bb)`,
                fontSize: '1rem',
                boxShadow: `0 4px 14px ${currentStep.color}44`,
              }}
            >
              Next Step ➡
            </motion.button>
          ) : (
            <div className="text-center py-2.5 rounded-xl font-display font-bold" style={{ background: '#f0fdf4', color: '#059669' }}>
              ⭐ Electricity enters your home!
            </div>
          )}
        </div>

        {/* Wire legend — shows on last step */}
        {step === STEPS.length - 1 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="game-panel"
          >
            <h4 className="font-display font-bold text-slate-700 mb-2" style={{ fontSize: '0.88rem' }}>3-Wire System</h4>
            {[
              { bg: '#fee2e2', dot: '#dc2626', text: 'Phase — 240V LIVE!', textCol: '#991b1b' },
              { bg: '#dbeafe', dot: '#2563eb', text: 'Neutral — Return Path', textCol: '#1e40af' },
              { bg: '#dcfce7', dot: '#16a34a', text: 'Earth — Safety Ground', textCol: '#15803d' },
            ].map((w) => (
              <div key={w.text} className="flex items-center gap-2 rounded-lg px-2 py-1.5 mb-1.5" style={{ background: w.bg }}>
                <div className="rounded-full flex-shrink-0" style={{ width: 12, height: 12, background: w.dot, boxShadow: `0 0 6px ${w.dot}` }} />
                <span className="font-bold" style={{ color: w.textCol, fontSize: '0.82rem' }}>{w.text}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
