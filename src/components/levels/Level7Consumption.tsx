import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initBasicScene } from '../../utils/three-helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

const APPLIANCES = [
  {
    id: 'bulb',
    name: 'LED Bulb',
    watts: 9,
    icon: '💡',
    fact: 'LED bulbs use 90% less energy than old incandescent bulbs!',
    color: '#fbbf24',
    emissiveHex: 0xffee44,
    geo: () => new THREE.SphereGeometry(1, 16, 16),
    pos: [-8, 4, 0] as [number, number, number],
    baseColor: 0x888866,
  },
  {
    id: 'fan',
    name: 'Ceiling Fan',
    watts: 70,
    icon: '🌀',
    fact: 'Ceiling fans use much less energy than air conditioners — about 70W vs 2000W!',
    color: '#60a5fa',
    emissiveHex: 0x2266cc,
    geo: () => new THREE.CylinderGeometry(2.2, 2.2, 0.2, 20),
    pos: [-3, 5, 0] as [number, number, number],
    baseColor: 0x555566,
  },
  {
    id: 'tv',
    name: 'Television',
    watts: 120,
    icon: '📺',
    fact: 'TVs have standby mode which still uses power even when "off"!',
    color: '#818cf8',
    emissiveHex: 0x1a44cc,
    geo: () => new THREE.BoxGeometry(4, 2.5, 0.5),
    pos: [3, 2, 0] as [number, number, number],
    baseColor: 0x111111,
  },
  {
    id: 'fridge',
    name: 'Refrigerator',
    watts: 300,
    icon: '❄️',
    fact: 'Fridges run 24/7 — keeping them full actually makes them more efficient!',
    color: '#67e8f9',
    emissiveHex: 0x00ffff,
    geo: () => new THREE.BoxGeometry(2.5, 5, 2.5),
    pos: [9, 2.5, 0] as [number, number, number],
    baseColor: 0xaaaaaa,
  },
  {
    id: 'washer',
    name: 'Washing Machine',
    watts: 500,
    icon: '🌊',
    fact: 'Washing with cold water saves about 90% of the energy used by a washing machine!',
    color: '#6ee7b7',
    emissiveHex: 0x00eebb,
    geo: () => new THREE.BoxGeometry(2.2, 2.5, 2.2),
    pos: [15, 1.25, 0] as [number, number, number],
    baseColor: 0xf0f0f0,
  },
];

export const Level7Consumption = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const meshesRef = useRef<Record<string, THREE.Mesh>>({});
  const pointLightsRef = useRef<Record<string, THREE.PointLight>>({});
  const activeRef = useRef<Set<string>>(new Set());
  const completedRef = useRef(false);

  const totalWatts = Array.from(activeIds).reduce((sum, id) => {
    return sum + (APPLIANCES.find(a => a.id === id)?.watts ?? 0);
  }, 0);

  const toggleAppliance = (id: string) => {
    setActiveIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        const app = APPLIANCES.find(a => a.id === id)!;
        setVoltMessage(`📴 ${app.name} switched OFF. Saving ${app.watts}W! ${app.fact}`);
      } else {
        next.add(id);
        addScore(20);
        const app = APPLIANCES.find(a => a.id === id)!;
        setVoltMessage(`⚡ ${app.name} is ON! Using ${app.watts} Watts. ${app.fact}`);
      }

      activeRef.current = next;

      if (next.size === APPLIANCES.length && !completedRef.current) {
        completedRef.current = true;
        const tw = APPLIANCES.reduce((s, a) => s + a.watts, 0);
        setVoltMessage(`⭐ ALL ${APPLIANCES.length} appliances ON! Total: ${tw}W = about ${(tw / 240).toFixed(1)}A from your MCB panel. Great job!`);
        setLevelComplete(true);
        addStar();
      }
      return next;
    });
  };

  // Update 3D materials + wire glow when state changes
  useEffect(() => {
    APPLIANCES.forEach(app => {
      const mesh = meshesRef.current[app.id];
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const on = activeIds.has(app.id);
      mat.emissive.setHex(on ? app.emissiveHex : 0x000000);
      mat.emissiveIntensity = on ? 1.2 : 0;

      const pl = pointLightsRef.current[app.id];
      if (pl) pl.intensity = on ? 3.5 : 0;

      // Glow the wire from MCB to this appliance
      const wire = meshesRef.current[app.id + '_wire'];
      if (wire) {
        const wireMat = wire.material as THREE.MeshStandardMaterial;
        wireMat.color.setHex(on ? app.emissiveHex : 0x1a3a5c);
        wireMat.emissive.setHex(on ? app.emissiveHex : 0x000000);
        wireMat.emissiveIntensity = on ? 1.4 : 0;
      }
    });
  }, [activeIds]);

  useEffect(() => {
    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);

    scene.background = new THREE.Color(0x0a0f1a);
    scene.fog = new THREE.FogExp2(0x0a0f1a, 0.025);
    camera.position.set(4, 10, 22);
    controls.target.set(4, 2, 0);

    // Grid floor
    const floorGrid = new THREE.GridHelper(50, 30, 0x1a3a5c, 0x0d2035);
    floorGrid.position.y = -0.01;
    scene.add(floorGrid);

    // Floor plane
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 20),
      new THREE.MeshStandardMaterial({ color: 0x0a1a2a, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Appliance meshes
    APPLIANCES.forEach(app => {
      const mat = new THREE.MeshStandardMaterial({
        color: app.baseColor,
        emissive: 0x000000,
        emissiveIntensity: 0,
        roughness: 0.4,
        metalness: 0.3,
      });
      const mesh = new THREE.Mesh(app.geo(), mat);
      mesh.position.set(...app.pos);
      mesh.castShadow = true;
      scene.add(mesh);
      meshesRef.current[app.id] = mesh;

      // Point light for each appliance — use THREE.Color to properly parse hex string
      const lightColor = new THREE.Color(app.color);
      const pl = new THREE.PointLight(lightColor, 0, 14);
      pl.position.set(app.pos[0], app.pos[1] + 3, app.pos[2] + 1);
      scene.add(pl);
      pointLightsRef.current[app.id] = pl;

      // Watt label platform
      const labelMesh = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.4, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x0f2035, roughness: 0.9 })
      );
      labelMesh.position.set(app.pos[0], -0.2, app.pos[2]);
      scene.add(labelMesh);
    });

    // MCB panel — improved look
    const mcbBox = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 0.5), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.3 }));
    mcbBox.position.set(-14, 3, 0);
    scene.add(mcbBox);
    const mcbFront = new THREE.Mesh(new THREE.BoxGeometry(2.7, 4.5, 0.3), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    mcbFront.position.set(-14, 3, 0.3);
    scene.add(mcbFront);
    for (let i = 0; i < APPLIANCES.length; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.85, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.6 }));
      m.position.set(-14.5 + i * 0.46, 3.2, 0.55);
      scene.add(m);
    }
    // MCB label bar
    const mcbLabel = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.3, 0.1), new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.8 }));
    mcbLabel.position.set(-14, 5.8, 0.55);
    scene.add(mcbLabel);

    // Glowing tube wires from MCB to each appliance — stored for live update
    APPLIANCES.forEach(app => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-14, 5.5, 0),
        new THREE.Vector3(-4, 7, 0),
        new THREE.Vector3(app.pos[0], 6.8, 0),
        new THREE.Vector3(app.pos[0], app.pos[1] + (app.id === 'bulb' ? 3 : 1), 0),
      ]);
      const wireMesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 24, 0.06, 6, false),
        new THREE.MeshStandardMaterial({ color: 0x1a3a5c, emissive: 0x000000, emissiveIntensity: 0, roughness: 0.4 })
      );
      scene.add(wireMesh);
      meshesRef.current[app.id + '_wire'] = wireMesh;
    });

    let frame: number;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const active = activeRef.current;

      // Fan rotation
      if (active.has('fan') && meshesRef.current['fan']) {
        meshesRef.current['fan'].rotation.y += 0.15;
      }
      // Washer shake
      if (active.has('washer') && meshesRef.current['washer']) {
        meshesRef.current['washer'].position.x = 15 + Math.sin(Date.now() / 60) * 0.06;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => { frame && cancelAnimationFrame(frame); cleanup(); delete (window as any).__lvl7scene; };
  }, []);

  const maxWatts = APPLIANCES.reduce((s, a) => s + a.watts, 0);
  const powerPercent = Math.min(100, (totalWatts / maxWatts) * 100);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Right panel */}
      <div
        className="absolute right-3 top-14 z-10 flex flex-col gap-3 pointer-events-auto"
        style={{ width: 'clamp(220px, 24vw, 300px)' }}
      >
        <InfoCard title="Power Consumption" icon="📊" colorClass="from-cyan-700 to-blue-600">
          <p>Power is measured in <strong>Watts (W)</strong>. Different devices use very different amounts!</p>
          <p><strong>Energy = Power × Time.</strong> Run 1000W for 1 hour = 1 kWh on your bill.</p>
          <p>Turn on appliances and watch the meter go up in real time!</p>
        </InfoCard>

        {/* Smart meter */}
        <div className="game-panel !p-0 overflow-hidden">
          <div className="px-4 py-2.5 font-display font-bold text-white flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', fontSize: '0.95rem' }}
          >
            <span>⚡ Smart Meter</span>
            <span style={{ color: activeIds.size === APPLIANCES.length ? '#00e676' : '#94a3b8', fontSize: '0.75rem' }}>
              {activeIds.size}/{APPLIANCES.length} ON
            </span>
          </div>
          <div className="p-3">
            <div className="meter-display text-center mb-2">
              <motion.span
                key={totalWatts}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-cyan-400 font-mono font-bold"
                style={{ fontSize: '2.2rem' }}
              >
                {totalWatts.toString().padStart(4, '0')}
              </motion.span>
              <span className="text-cyan-600 font-mono font-bold" style={{ fontSize: '1.1rem' }}> W</span>
            </div>

            {/* Power bar */}
            <div className="rounded-full overflow-hidden mb-2" style={{ height: 10, background: '#1e293b' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg,#00e676,#00c2ff,${powerPercent > 80 ? '#ff3d57' : '#ffd700'})` }}
                animate={{ width: `${powerPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-slate-500 font-medium mb-2" style={{ fontSize: '0.72rem' }}>
              <span>~{(totalWatts / 240).toFixed(2)} A at 240V</span>
              <span>{totalWatts} / {maxWatts}W max</span>
            </div>
          </div>
        </div>

        {/* Appliance switches */}
        <div className="game-panel !p-0 overflow-hidden">
          <div className="px-4 py-2.5 font-display font-bold text-slate-800 flex items-center gap-2"
            style={{ background: '#f8fafc', fontSize: '0.95rem', borderBottom: '2px solid #e2e8f0' }}
          >
            🎛️ Appliance Controls
          </div>
          <div className="p-3 flex flex-col gap-2">
            {APPLIANCES.map(app => {
              const on = activeIds.has(app.id);
              return (
                <motion.button
                  key={app.id}
                  onClick={() => toggleAppliance(app.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between w-full rounded-xl px-3 py-2.5 transition-all border-2"
                  style={{
                    background: on ? `${app.color}18` : '#f8fafc',
                    borderColor: on ? app.color : '#e2e8f0',
                    boxShadow: on ? `0 0 10px ${app.color}44` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <motion.span
                      animate={{ scale: on ? [1, 1.3, 1] : 1 }}
                      style={{ fontSize: '1.5rem' }}
                    >
                      {app.icon}
                    </motion.span>
                    <div className="text-left">
                      <div
                        className="font-display font-bold leading-tight"
                        style={{ fontSize: '0.9rem', color: on ? app.color : '#334155' }}
                      >
                        {app.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{app.watts} W</div>
                    </div>
                  </div>
                  <div className={`big-switch ${on ? 'on' : ''}`} style={{ flexShrink: 0 }}>
                    <div className="big-switch-knob" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      {activeIds.size < APPLIANCES.length && (
        <motion.div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none z-20"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.3, repeat: Infinity }}
        >
          <div
            className="px-4 py-2.5 rounded-full font-display font-bold text-slate-900 shadow-xl"
            style={{ background: 'linear-gradient(135deg,#ffd700,#f59e0b)', fontSize: '1rem', boxShadow: '0 0 18px rgba(255,215,0,0.6)' }}
          >
            👆 Turn ON all {APPLIANCES.length} appliances to complete!
          </div>
        </motion.div>
      )}
    </div>
  );
};
