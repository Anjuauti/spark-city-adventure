import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { initBasicScene } from '../../utils/three-helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/game-store';
import { InfoCard } from '../GameUI';

/* ── Room definitions ── */
const ROOMS = [
  {
    id: 'hall',
    name: 'Hall / Living Room',
    icon: '🛋️',
    color: '#3b82f6',
    appliances: [
      { id: 'hall_light', name: 'Ceiling Light', icon: '💡', watts: 9, type: 'light' },
      { id: 'hall_fan', name: 'Ceiling Fan', icon: '🌀', watts: 70, type: 'fan' },
      { id: 'hall_tv', name: 'Television', icon: '📺', watts: 120, type: 'tv' },
    ],
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    icon: '🛏️',
    color: '#8b5cf6',
    appliances: [
      { id: 'bed_light', name: 'Ceiling Light', icon: '💡', watts: 9, type: 'light' },
      { id: 'bed_fan', name: 'Ceiling Fan', icon: '🌀', watts: 70, type: 'fan' },
      { id: 'bed_tv', name: 'Television', icon: '📺', watts: 120, type: 'tv' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: '🍳',
    color: '#f97316',
    appliances: [
      { id: 'kit_light', name: 'Ceiling Light', icon: '💡', watts: 9, type: 'light' },
      { id: 'kit_fridge', name: 'Refrigerator', icon: '❄️', watts: 300, type: 'fridge' },
      { id: 'kit_washer', name: 'Washing Machine', icon: '🌊', watts: 500, type: 'washer' },
    ],
  },
];

export const Level6Wiring = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setVoltMessage, setLevelComplete, addScore, addStar } = useGameStore();
  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>({});
  const [selectedRoom, setSelectedRoom] = useState<string>('hall');
  const objectsRef = useRef<Record<string, any>>({});
  const lightsRef = useRef<Map<string, THREE.PointLight>>(new Map());
  const fanRef = useRef<THREE.Group | null>(null);
  const washerRef = useRef<THREE.Group | null>(null);
  const completedRef = useRef(false);
  const activeRef = useRef<Record<string, boolean>>({});

  const totalWatts = Object.entries(switchStates)
    .filter(([, on]) => on)
    .reduce((sum, [id]) => {
      for (const room of ROOMS) {
        const app = room.appliances.find(a => a.id === id);
        if (app) return sum + app.watts;
      }
      return sum;
    }, 0);

  const allCount = ROOMS.reduce((s, r) => s + r.appliances.length, 0);
  const onCount = Object.values(switchStates).filter(Boolean).length;

  const toggle = useCallback((id: string) => {
    setSwitchStates(prev => {
      const next = { ...prev, [id]: !prev[id] };
      activeRef.current = next;
      addScore(15);

      const onCountNew = Object.values(next).filter(Boolean).length;
      if (onCountNew === allCount && !completedRef.current) {
        completedRef.current = true;
        setVoltMessage("⭐ ALL appliances powered! Each runs in PARALLEL — full 240V each, with its own MCB breaker. Total: " + Object.values(next).filter(Boolean).length + " devices ON!");
        setLevelComplete(true);
        addStar();
      } else {
        const roomApps = ROOMS.flatMap(r => r.appliances);
        const app = roomApps.find(a => a.id === id);
        if (app) {
          setVoltMessage(next[id]
            ? `💡 ${app.name} is ON! It's drawing ${app.watts}W from the MCB circuit.`
            : `📴 ${app.name} switched OFF. Saving ${app.watts}W of electricity!`
          );
        }
      }
      return next;
    });
  }, [addScore, addStar, allCount, setLevelComplete, setVoltMessage]);

  useEffect(() => {
    setVoltMessage("🏠 Home Wiring! Use the switches to turn ON each appliance in the house. TAP the switches on the right!");
  }, [setVoltMessage]);

  // Update 3D scene when switches change
  useEffect(() => {
    const scene = objectsRef.current.__scene as THREE.Scene;
    if (!scene) return;

    Object.entries(switchStates).forEach(([id, on]) => {
      // Light bulb glow
      const bulb = objectsRef.current[`bulb_${id}`];
      if (bulb) {
        const mat = bulb.material as THREE.MeshStandardMaterial;
        mat.emissive.setHex(on ? 0xffee44 : 0x000000);
        mat.emissiveIntensity = on ? 1.2 : 0;

        const lightKey = `pointLight_${id}`;
        if (on && !lightsRef.current.has(lightKey)) {
          const pl = new THREE.PointLight(0xffeebb, 2.5, 12);
          pl.position.copy(bulb.position);
          scene.add(pl);
          lightsRef.current.set(lightKey, pl);
        } else if (!on && lightsRef.current.has(lightKey)) {
          scene.remove(lightsRef.current.get(lightKey)!);
          lightsRef.current.delete(lightKey);
        }
      }

      // TV screen
      const tvScreen = objectsRef.current[`tvScreen_${id}`];
      if (tvScreen) {
        const mat = tvScreen.material as THREE.MeshStandardMaterial;
        mat.emissive.setHex(on ? 0x1a44cc : 0x000000);
        mat.emissiveIntensity = on ? 1.3 : 0;
      }
    });
  }, [switchStates]);

  useEffect(() => {
    if (!containerRef.current) return;
    const { scene, camera, renderer, controls, cleanup } = initBasicScene(containerRef.current);
    objectsRef.current.__scene = scene;

    scene.background = new THREE.Color(0x87ceeb);
    camera.position.set(18, 22, 18);
    controls.target.set(0, 2, 0);
    controls.maxPolarAngle = Math.PI / 2.2;

    // ── Terrain ──
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial({ color: 0x6ab04c, roughness: 0.9 }));
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.05;
    scene.add(grass);

    const floor = new THREE.Mesh(new THREE.BoxGeometry(18, 0.25, 14), new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.9 }));
    floor.position.set(0, 0.12, 0);
    scene.add(floor);

    const wall = (w: number, h: number, d: number, x: number, y: number, z: number, color = 0xf5f0ea) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
      m.position.set(x, y, z);
      m.castShadow = true; m.receiveShadow = true;
      scene.add(m);
      return m;
    };

    wall(18, 5, 0.3, 0, 2.5, -7); // back
    wall(0.3, 5, 14, -9, 2.5, 0); // left
    wall(0.3, 5, 14, 9, 2.5, 0); // right
    wall(7, 5, 0.3, -5, 2.5, 0, 0xeeeaea); // divider left
    wall(7, 5, 0.3, 5, 2.5, 0, 0xeeeaea); // divider right

    // No roof — open-top house so children can see inside clearly

    // MCB Panel
    const mcb = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.3), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    mcb.position.set(-8.8, 3.5, -6.8);
    scene.add(mcb);
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.7, 0.4), new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x22c55e : 0xf59e0b }));
      m.position.set(-9.2 + i * 0.4, 3.5, -6.5);
      scene.add(m);
    }

    // ── Hall Room (left) — couch, TV, fan, bulb ──
    const couch = new THREE.Group();
    const couchBase = new THREE.Mesh(new THREE.BoxGeometry(5, 0.8, 2), new THREE.MeshStandardMaterial({ color: 0x9b6a4a }));
    const couchBack = new THREE.Mesh(new THREE.BoxGeometry(5, 1.8, 0.4), new THREE.MeshStandardMaterial({ color: 0x8a5a3a }));
    couchBack.position.set(0, 1.3, 0.8);
    couch.add(couchBase, couchBack);
    couch.position.set(-4, 0.65, 4);
    scene.add(couch);

    // Hall TV
    const hallTvFrame = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 0.25), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    const hallTvScreen = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.1, 0.3), new THREE.MeshStandardMaterial({ color: 0x0a0a0a }));
    hallTvScreen.position.z = 0.02;
    const hallTvGrp = new THREE.Group();
    hallTvGrp.add(hallTvFrame, hallTvScreen);
    hallTvGrp.position.set(-4, 2.5, -6.8);
    scene.add(hallTvGrp);
    objectsRef.current['tvScreen_hall_tv'] = hallTvScreen;

    // Hall light bulb
    const hallBulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshStandardMaterial({ color: 0xccccaa }));
    hallBulb.position.set(-4, 4.7, 1);
    scene.add(hallBulb);
    objectsRef.current['bulb_hall_light'] = hallBulb;

    // Hall fan
    const hallFan = new THREE.Group();
    const hallFanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0x8b7355 }));
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.07, 0.6), new THREE.MeshStandardMaterial({ color: 0xa08060 }));
      blade.position.x = 1.3;
      const piv = new THREE.Group();
      piv.rotation.y = (Math.PI / 2) * i;
      piv.add(blade);
      hallFan.add(piv);
    }
    hallFan.add(hallFanHub);
    hallFan.position.set(-4, 4.65, 3);
    scene.add(hallFan);
    objectsRef.current['fan_hall_fan'] = hallFan;

    // ── Bedroom (right) — bed, TV, fan, bulb ──
    const bedBase = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 5), new THREE.MeshStandardMaterial({ color: 0xd4c4a8 }));
    bedBase.position.set(5, 0.5, 2);
    scene.add(bedBase);
    const bedHead = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 0.3), new THREE.MeshStandardMaterial({ color: 0xb8a080 }));
    bedHead.position.set(5, 1.1, -0.2);
    scene.add(bedHead);
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 0.9), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    pillow.position.set(4.2, 0.85, 0.2);
    scene.add(pillow);
    const pillow2 = pillow.clone();
    pillow2.position.set(5.8, 0.85, 0.2);
    scene.add(pillow2);

    const bedTvFrame = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.2, 0.22), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    const bedTvScreen = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.8, 0.28), new THREE.MeshStandardMaterial({ color: 0x0a0a0a }));
    bedTvScreen.position.z = 0.02;
    const bedTvGrp = new THREE.Group();
    bedTvGrp.add(bedTvFrame, bedTvScreen);
    bedTvGrp.position.set(5, 2.4, -6.8);
    scene.add(bedTvGrp);
    objectsRef.current['tvScreen_bed_tv'] = bedTvScreen;

    const bedBulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshStandardMaterial({ color: 0xccccaa }));
    bedBulb.position.set(5, 4.7, 2.5);
    scene.add(bedBulb);
    objectsRef.current['bulb_bed_light'] = bedBulb;

    const bedFan = new THREE.Group();
    const bedFanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0x8b7355 }));
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.07, 0.55), new THREE.MeshStandardMaterial({ color: 0xa08060 }));
      blade.position.x = 1.2;
      const piv = new THREE.Group();
      piv.rotation.y = (Math.PI / 2) * i;
      piv.add(blade);
      bedFan.add(piv);
    }
    bedFan.add(bedFanHub);
    bedFan.position.set(5, 4.65, 3.5);
    scene.add(bedFan);
    objectsRef.current['fan_bed_fan'] = bedFan;
    fanRef.current = hallFan; // track primary fan

    // ── Kitchen (bottom strip between dividers) ──
    // Fridge
    const fridgeBody = new THREE.Mesh(new THREE.BoxGeometry(2, 4.5, 2), new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.3 }));
    const fridgeHandle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.15), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 }));
    fridgeHandle.position.set(1.05, 0, 0.7);
    const fridgeGrp = new THREE.Group();
    fridgeGrp.add(fridgeBody, fridgeHandle);
    fridgeGrp.position.set(0.5, 2.25, -5.5);
    scene.add(fridgeGrp);
    objectsRef.current['fridge_kit_fridge'] = fridgeGrp;

    // Washer
    const washerBody = new THREE.Mesh(new THREE.BoxGeometry(2, 2.2, 2), new THREE.MeshStandardMaterial({ color: 0xf4f4f4 }));
    const washerDoor = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.14, 20), new THREE.MeshStandardMaterial({ color: 0xaaaacc, metalness: 0.4 }));
    washerDoor.rotation.x = Math.PI / 2;
    washerDoor.position.z = 1.05;
    const washerGrp = new THREE.Group();
    washerGrp.add(washerBody, washerDoor);
    washerGrp.position.set(-2.5, 1.1, -5.5);
    scene.add(washerGrp);
    objectsRef.current['washer_kit_washer'] = washerGrp;
    washerRef.current = washerGrp;

    const kitBulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshStandardMaterial({ color: 0xccccaa }));
    kitBulb.position.set(0, 4.7, -3.5);
    scene.add(kitBulb);
    objectsRef.current['bulb_kit_light'] = kitBulb;

    // Wires from MCB
    [hallBulb.position, hallFan.position, hallTvGrp.position, bedBulb.position, bedFan.position, bedTvGrp.position, kitBulb.position, new THREE.Vector3(0.5, 2.25, -5.5), new THREE.Vector3(-2.5, 1.1, -5.5)].forEach(pos => {
      const pts = [
        new THREE.Vector3(-8.8, 4, -6.8),
        new THREE.Vector3(-8.8, 5.2, pos.z),
        new THREE.Vector3(pos.x, 5.2, pos.z),
        pos.clone(),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x888888 })));
    });

    let frameId: number;
    const active = activeRef;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const st = active.current;
      if (st['hall_fan'] && hallFan) hallFan.rotation.y += 0.05;
      if (st['bed_fan'] && bedFan) bedFan.rotation.y += 0.04;
      if (st['kit_washer'] && washerRef.current) {
        washerRef.current.position.x = -2.5 + Math.sin(Date.now() / 55) * 0.04;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => { cancelAnimationFrame(frameId); cleanup(); };
  }, []);

  const currentRoom = ROOMS.find(r => r.id === selectedRoom)!;

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* BG sky */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#87ceeb 0%,#c5e8f8 60%,#d8f0d8 100%)' }} />
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Room selector — top */}
      <div className="absolute top-14 left-3 z-10 flex gap-2 pointer-events-auto">
        {ROOMS.map(room => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-display font-bold transition-all"
            style={{
              background: selectedRoom === room.id ? room.color : 'rgba(255,255,255,0.85)',
              color: selectedRoom === room.id ? 'white' : '#475569',
              boxShadow: selectedRoom === room.id ? `0 0 16px ${room.color}55` : '0 2px 8px rgba(0,0,0,0.1)',
              fontSize: '0.9rem',
              border: `2px solid ${selectedRoom === room.id ? room.color : 'transparent'}`,
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{room.icon}</span>
            {room.name}
          </button>
        ))}
      </div>

      {/* Right panel */}
      <div
        className="absolute right-3 top-14 z-10 flex flex-col gap-3 pointer-events-auto"
        style={{ width: 'clamp(220px, 24vw, 290px)' }}
      >
        <InfoCard title="Home Wiring" icon="🔌" colorClass="from-orange-600 to-amber-500">
          <p><strong>Parallel Circuits:</strong> Every appliance gets full 240V and has its own switch + MCB breaker.</p>
          <p><strong>Why Parallel?</strong> If one breaks, others keep working! Series wiring would turn ALL off.</p>
          <p><strong>MCB = Safety:</strong> Trips automatically if too much current flows, preventing fires!</p>
        </InfoCard>

        {/* Current room switches */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRoom}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="game-panel !p-0 overflow-hidden"
          >
            <div
              className="px-4 py-3 flex items-center gap-2 font-display font-bold text-white"
              style={{ background: currentRoom.color, fontSize: '1rem' }}
            >
              <span style={{ fontSize: '1.3rem' }}>{currentRoom.icon}</span>
              {currentRoom.name} — Switches
            </div>
            <div className="p-3 flex flex-col gap-2.5">
              {currentRoom.appliances.map(app => {
                const on = switchStates[app.id] ?? false;
                return (
                  <button
                    key={app.id}
                    onClick={() => toggle(app.id)}
                    className="flex items-center justify-between w-full rounded-xl px-3 py-2.5 transition-all border-2"
                    style={{
                      background: on ? `${currentRoom.color}18` : '#f8fafc',
                      borderColor: on ? currentRoom.color : '#e2e8f0',
                      boxShadow: on ? `0 0 10px ${currentRoom.color}33` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span style={{ fontSize: '1.4rem' }}>{app.icon}</span>
                      <div className="text-left">
                        <div className="font-display font-bold text-slate-800" style={{ fontSize: '0.9rem' }}>{app.name}</div>
                        <div className="font-medium" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{app.watts}W</div>
                      </div>
                    </div>
                    {/* Big switch */}
                    <div
                      className={`big-switch ${on ? 'on' : ''}`}
                      style={{ flexShrink: 0 }}
                    >
                      <div className="big-switch-knob" />
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Live power meter */}
        <div className="game-panel !p-0 overflow-hidden">
          <div className="px-4 py-2.5 font-display font-bold text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg,#1e293b,#334155)', fontSize: '0.92rem' }}
          >
            ⚡ Live Energy Meter
          </div>
          <div className="p-3">
            <div className="meter-display text-center mb-2">
              <motion.span
                key={totalWatts}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-cyan-400 font-mono font-bold"
                style={{ fontSize: '2rem' }}
              >
                {totalWatts.toString().padStart(4, '0')}
              </motion.span>
              <span className="text-cyan-600 font-mono" style={{ fontSize: '1rem' }}> W</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium" style={{ fontSize: '0.75rem' }}>
              <span>{onCount} / {allCount} devices ON</span>
              <span>~{(totalWatts / 240).toFixed(2)} A</span>
            </div>
            <div className="mt-1.5 rounded-full overflow-hidden" style={{ height: 8, background: '#e2e8f0' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg,#00e676,#00c2ff)',
                  width: `${(onCount / allCount) * 100}%`,
                }}
                animate={{ width: `${(onCount / allCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      {onCount < allCount && (
        <motion.div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none z-20"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.3, repeat: Infinity }}
        >
          <div
            className="px-4 py-2.5 rounded-full font-display font-bold text-slate-900 shadow-xl"
            style={{ background: 'linear-gradient(135deg,#ffd700,#f59e0b)', fontSize: '1rem', boxShadow: '0 0 18px rgba(255,215,0,0.6)' }}
          >
            👆 Turn ON all {allCount} appliances in all 3 rooms!
          </div>
        </motion.div>
      )}
    </div>
  );
};
