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
    pos: [-8, 3.5, 0] as [number, number, number],
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
    pos: [-3, 3.5, 0] as [number, number, number],
    baseColor: 0x778899,
  },
  {
    id: 'tv',
    name: 'Television',
    watts: 120,
    icon: '📺',
    fact: 'TVs have standby mode which still uses power even when "off"!',
    color: '#818cf8',
    emissiveHex: 0x1a44cc,
    pos: [3, 2, 0] as [number, number, number],
    baseColor: 0x222222,
  },
  {
    id: 'fridge',
    name: 'Refrigerator',
    watts: 300,
    icon: '❄️',
    fact: 'Fridges run 24/7 — keeping them full actually makes them more efficient!',
    color: '#67e8f9',
    emissiveHex: 0x00ffff,
    pos: [9, 2.5, 0] as [number, number, number],
    baseColor: 0xdddddd,
  },
  {
    id: 'washer',
    name: 'Washing Machine',
    watts: 500,
    icon: '🌊',
    fact: 'Washing with cold water saves about 90% of the energy used by a washing machine!',
    color: '#6ee7b7',
    emissiveHex: 0x00eebb,
    pos: [15, 1.25, 0] as [number, number, number],
    baseColor: 0xf0f0f0,
  },
];

export const Level7Consumption = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
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

  useEffect(() => {
    APPLIANCES.forEach(app => {
      const mesh = meshesRef.current[app.id];
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const on = activeIds.has(app.id);
      mat.emissive.setHex(on ? app.emissiveHex : 0x000000);
      mat.emissiveIntensity = on ? 1.2 : 0;

      const pl = pointLightsRef.current[app.id];
      if (pl) pl.intensity = on ? 3 : 0;

      const wire = meshesRef.current[app.id + '_wire'];
      if (wire) {
        const wireMat = wire.material as THREE.MeshStandardMaterial;
        wireMat.color.setHex(on ? app.emissiveHex : 0x9ca3af);
        wireMat.emissive.setHex(on ? app.emissiveHex : 0x000000);
        wireMat.emissiveIntensity = on ? 1.2 : 0;
      }
    });
  }, [activeIds]);

  useEffect(() => {
    setVoltMessage("💡 Power Consumption Level! Switch on each appliance and watch your energy meter rise. Energy = Power × Time!");
    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);

    scene.background = new THREE.Color(0xfafafa);
    scene.fog = undefined;
    camera.position.set(4, 10, 22);
    controls.target.set(4, 2, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 20),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const wallBack = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 12),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 })
    );
    wallBack.position.set(4, 5, -3);
    scene.add(wallBack);

    const platformMat = new THREE.MeshStandardMaterial({ color: 0xdde1e7, roughness: 0.7 });

    APPLIANCES.forEach(app => {
      const platform = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.15, 2),
        platformMat
      );
      platform.position.set(app.pos[0], 0.08, app.pos[2]);
      scene.add(platform);

      let geo: THREE.BufferGeometry;
      if (app.id === 'bulb') geo = new THREE.SphereGeometry(0.9, 16, 16);
      else if (app.id === 'fan') geo = new THREE.CylinderGeometry(2.0, 2.0, 0.18, 20);
      else if (app.id === 'tv') geo = new THREE.BoxGeometry(3.8, 2.4, 0.4);
      else if (app.id === 'fridge') geo = new THREE.BoxGeometry(2.3, 5, 2);
      else geo = new THREE.BoxGeometry(2, 2.4, 2);

      const mat = new THREE.MeshStandardMaterial({
        color: app.baseColor,
        emissive: 0x000000,
        emissiveIntensity: 0,
        roughness: 0.5,
        metalness: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...app.pos);
      mesh.castShadow = true;
      scene.add(mesh);
      meshesRef.current[app.id] = mesh;

      const lightColor = new THREE.Color(app.color);
      const pl = new THREE.PointLight(lightColor, 0, 12);
      pl.position.set(app.pos[0], app.pos[1] + 3, app.pos[2] + 1);
      scene.add(pl);
      pointLightsRef.current[app.id] = pl;
    });

    const mcbBox = new THREE.Mesh(
      new THREE.BoxGeometry(3, 5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x374151 })
    );
    mcbBox.position.set(-14, 3, 0);
    scene.add(mcbBox);
    for (let i = 0; i < APPLIANCES.length; i++) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.85, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.4 })
      );
      m.position.set(-14.5 + i * 0.46, 3.2, 0.55);
      scene.add(m);
    }

    const mcbLabel = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.3, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.6 })
    );
    mcbLabel.position.set(-14, 5.8, 0.55);
    scene.add(mcbLabel);

    APPLIANCES.forEach(app => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-14, 5.5, 0),
        new THREE.Vector3(-4, 8, 0),
        new THREE.Vector3(app.pos[0], 7.5, 0),
        new THREE.Vector3(app.pos[0], app.pos[1] + (app.id === 'bulb' ? 2 : 1), 0),
      ]);
      const wireMesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 24, 0.06, 6, false),
        new THREE.MeshStandardMaterial({ color: 0x9ca3af, emissive: 0x000000, emissiveIntensity: 0, roughness: 0.5 })
      );
      scene.add(wireMesh);
      meshesRef.current[app.id + '_wire'] = wireMesh;
    });

    let frame: number;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const active = activeRef.current;
      if (active.has('fan') && meshesRef.current['fan']) {
        meshesRef.current['fan'].rotation.y += 0.12;
      }
      if (active.has('washer') && meshesRef.current['washer']) {
        meshesRef.current['washer'].position.x = 15 + Math.sin(Date.now() / 60) * 0.05;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => { frame && cancelAnimationFrame(frame); cleanup(); };
  }, []);

  const maxWatts = APPLIANCES.reduce((s, a) => s + a.watts, 0);
  const powerPercent = Math.min(100, (totalWatts / maxWatts) * 100);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      <div
        className="absolute right-3 top-14 z-10 flex flex-col gap-3 pointer-events-auto"
        style={{ width: 'clamp(220px, 24vw, 300px)' }}
      >
        <InfoCard title="Power Consumption" icon="📊" colorClass="from-pink-600 to-rose-500">
          <p>Power is measured in <strong>Watts (W)</strong>. Different devices use very different amounts!</p>
          <p><strong>Energy = Power × Time.</strong> Run 1000W for 1 hour = 1 kWh on your bill.</p>
          <div className="mt-1 px-3 py-2 rounded-xl" style={{ background: '#fefce8', border: '2px solid #fde047' }}>
            <code className="font-bold text-amber-700" style={{ fontSize: '0.9rem' }}>1 kWh = 1000 W × 1 hour</code>
          </div>
        </InfoCard>

        <div className="game-panel !p-0 overflow-hidden">
          <div className="px-4 py-2.5 font-display font-bold text-white flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg,#ec4899,#db2777)', fontSize: '0.95rem' }}
          >
            <span>⚡ Energy Meter</span>
            <span style={{ color: activeIds.size === APPLIANCES.length ? '#bbf7d0' : 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
              {activeIds.size}/{APPLIANCES.length} ON
            </span>
          </div>
          <div className="p-3">
            <div className="text-center mb-2">
              <motion.span
                key={totalWatts}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="font-mono font-bold"
                style={{ fontSize: '2.2rem', color: totalWatts > 600 ? '#ef4444' : '#ec4899' }}
              >
                {totalWatts.toString().padStart(4, '0')}
              </motion.span>
              <span className="font-mono font-bold text-slate-400" style={{ fontSize: '1.1rem' }}> W</span>
            </div>

            <div className="rounded-full overflow-hidden mb-2" style={{ height: 10, background: '#e2e8f0' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #34d399, #60a5fa, ${powerPercent > 80 ? '#f87171' : '#a78bfa'})` }}
                animate={{ width: `${powerPercent}%` }}
              />
            </div>

            <div className="flex justify-between font-medium mb-1" style={{ fontSize: '0.72rem', color: '#64748b' }}>
              <span>~{(totalWatts / 240).toFixed(2)} A at 240V</span>
              <span>{totalWatts} / {maxWatts} W</span>
            </div>
            <div className="text-center font-bold" style={{ fontSize: '0.75rem', color: '#64748b' }}>
              ≈ {(totalWatts / 1000).toFixed(2)} kW  |  1 hr = {(totalWatts / 1000).toFixed(2)} kWh
            </div>
          </div>
        </div>

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
                    boxShadow: on ? `0 0 10px ${app.color}33` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <motion.span animate={{ scale: on ? [1, 1.3, 1] : 1 }} style={{ fontSize: '1.4rem' }}>
                      {app.icon}
                    </motion.span>
                    <div className="text-left">
                      <div className="font-display font-bold leading-tight" style={{ fontSize: '0.88rem', color: on ? app.color : '#334155' }}>
                        {app.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{app.watts} W</div>
                    </div>
                  </div>
                  <div className={`big-switch ${on ? 'on' : ''}`} style={{ flexShrink: 0 }}>
                    <div className={`big-switch-knob ${on ? 'on' : ''}`} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {activeIds.size < APPLIANCES.length && (
        <motion.div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none z-20"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.3, repeat: Infinity }}
        >
          <div
            className="px-4 py-2.5 rounded-full font-display font-bold text-slate-900 shadow-xl"
            style={{ background: 'linear-gradient(135deg,#ffd700,#f59e0b)', fontSize: '1rem', boxShadow: '0 0 18px rgba(255,215,0,0.5)' }}
          >
            👆 Turn ON all {APPLIANCES.length} appliances to complete!
          </div>
        </motion.div>
      )}
    </div>
  );
};
